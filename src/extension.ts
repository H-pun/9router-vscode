import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DataProvider } from './dataProvider';
import { QuotaWebviewProvider } from './quotaWebviewProvider';
import { UsageWebviewProvider } from './usageWebviewProvider';
import { UsageStreamService } from './services/usageStreamService';
import { migrateApiKey, SECRET_KEY } from './secretMigration';

let refreshTimer: NodeJS.Timeout | undefined;

export async function activate(context: vscode.ExtensionContext) {
  console.log('[9Router Monitor] Extension activated');

  // Initialize SecretStorage on DataProvider
  DataProvider.getInstance().setSecretStorage(context.secrets);

  // Initialize Singleton SSE Service
  UsageStreamService.getInstance().init(context);

  // Migrate legacy configuration apiKey to SecretStorage if present
  await migrateApiKey(context);

  // 1. Register Native Views (Official VS Code ViewPanes)
  const quotaWebviewProvider = new QuotaWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      QuotaWebviewProvider.viewType,
      quotaWebviewProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  const usageWebviewProvider = new UsageWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      UsageWebviewProvider.viewType,
      usageWebviewProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // 2. Register Filter Submenu Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('9router.filterActive', () => {
      quotaWebviewProvider.setFilter('active');
    }),
    vscode.commands.registerCommand('9router.filterAll', () => {
      quotaWebviewProvider.setFilter('all');
    }),
    vscode.commands.registerCommand('9router.filterIdle', () => {
      quotaWebviewProvider.setFilter('idle');
    })
  );

  // Refresh Commands with Native View Progress & In-Flight Lock
  let isRefreshingStats = false;
  let isRefreshingUsage = false;

  context.subscriptions.push(
    vscode.commands.registerCommand('9router.refreshStats', async () => {
      if (isRefreshingStats) return;
      isRefreshingStats = true;
      try {
        await vscode.window.withProgress(
          { location: { viewId: '9router.quotaTrackerView' } },
          async () => {
            await quotaWebviewProvider.refresh();
          }
        );
        vscode.window.showInformationMessage('9Router: Quotas refreshed');
      } catch (err) {
        vscode.window.showErrorMessage('9Router: Failed to refresh quotas');
      } finally {
        isRefreshingStats = false;
      }
    }),
    vscode.commands.registerCommand('9router.refreshUsage', async () => {
      if (isRefreshingUsage) return;
      isRefreshingUsage = true;
      try {
        await vscode.window.withProgress(
          { location: { viewId: '9router.usageView' } },
          async () => {
            UsageStreamService.getInstance().reconnect();
            await usageWebviewProvider.render();
          }
        );
        vscode.window.showInformationMessage('9Router: Usage data refreshed');
      } catch (err) {
        vscode.window.showErrorMessage('9Router: Failed to refresh usage');
      } finally {
        isRefreshingUsage = false;
      }
    })
  );

  // Settings Wizard using SecretStorage for apiKey
  context.subscriptions.push(
    vscode.commands.registerCommand('9router.configureSettings', async () => {
      const current = await context.secrets.get(SECRET_KEY);

      const key = await vscode.window.showInputBox({
        prompt: 'API Key 9Router',
        password: true,
        ignoreFocusOut: true,
        placeHolder: current
          ? 'Key sudah tersimpan — isi untuk mengganti, kosongkan untuk menghapus'
          : 'Kosongkan bila akses lokal tanpa auth',
      });

      if (key === undefined) return; // User pressed Esc

      if (key.trim() === '') {
        await context.secrets.delete(SECRET_KEY);
        vscode.window.showInformationMessage('9Router: API key dihapus dari penyimpanan aman.');
      } else {
        await context.secrets.store(SECRET_KEY, key.trim());
        vscode.window.showInformationMessage('9Router: API key berhasil disimpan ke Secret Storage.');
      }

      UsageStreamService.getInstance().reconnect();
      await quotaWebviewProvider.refresh();
      await usageWebviewProvider.render();
    })
  );

  // Web Dashboard
  context.subscriptions.push(
    vscode.commands.registerCommand('9router.openWebDashboard', async () => {
      const config = vscode.workspace.getConfiguration('9router');
      const baseUrl = config.get<string>('baseUrl', 'http://localhost:20128');
      vscode.env.openExternal(vscode.Uri.parse(baseUrl));
    })
  );

  // Reactive to SecretStorage changes
  context.subscriptions.push(
    context.secrets.onDidChange(async (e) => {
      if (e.key === SECRET_KEY) {
        UsageStreamService.getInstance().reconnect();
        await quotaWebviewProvider.refresh();
        await usageWebviewProvider.render();
      }
    })
  );

  // 3. Hot-Reload Trigger Watcher
  setupAutoReloadTrigger(context);

  // 4. Start polling timer (15m default)
  startPolling(context, quotaWebviewProvider, usageWebviewProvider);

  // 5. Watch configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('9router')) {
        UsageStreamService.getInstance().reconnect();
        startPolling(context, quotaWebviewProvider, usageWebviewProvider);
      }
    })
  );
}

function setupAutoReloadTrigger(context: vscode.ExtensionContext) {
  const triggerDir = path.join(os.homedir(), '.9router');
  const triggerFile = path.join(triggerDir, 'reload-trigger');

  try {
    if (!fs.existsSync(triggerDir)) {
      fs.mkdirSync(triggerDir, { recursive: true });
    }
    if (!fs.existsSync(triggerFile)) {
      fs.writeFileSync(triggerFile, String(Date.now()));
    }

    fs.watchFile(triggerFile, { interval: 300 }, () => {
      console.log('[9Router Monitor] Auto-reload triggered');
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    });

    context.subscriptions.push({
      dispose: () => {
        fs.unwatchFile(triggerFile);
      }
    });
  } catch (err) {
    console.warn('[9Router] Could not setup reload trigger watcher:', err);
  }
}

function startPolling(
  context: vscode.ExtensionContext,
  quotaWebviewProvider: QuotaWebviewProvider,
  usageWebviewProvider: UsageWebviewProvider
) {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  const config = vscode.workspace.getConfiguration('9router');
  const intervalSec = config.get<number>('refreshInterval', 900);
  const intervalMs = Math.max(10, intervalSec) * 1000;

  refreshTimer = setInterval(async () => {
    await quotaWebviewProvider.refresh();
    await usageWebviewProvider.render();
  }, intervalMs);

  context.subscriptions.push({
    dispose: () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    }
  });
}

export function deactivate() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
}
