import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DataProvider } from './dataProvider';
import { QuotaWebviewProvider } from './quotaWebviewProvider';
import { UsageWebviewProvider } from './usageWebviewProvider';

let refreshTimer: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('[9Router Monitor] Extension activated');

  // 1. Register Native Views (Official VS Code ViewPanes)
  const quotaWebviewProvider = new QuotaWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      QuotaWebviewProvider.viewType,
      quotaWebviewProvider
    )
  );

  const usageWebviewProvider = new UsageWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      UsageWebviewProvider.viewType,
      usageWebviewProvider
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

  // Refresh Command
  context.subscriptions.push(
    vscode.commands.registerCommand('9router.refreshStats', async () => {
      await quotaWebviewProvider.refresh();
      await usageWebviewProvider.render();
      vscode.window.showInformationMessage('9Router: Quotas refreshed');
    })
  );

  // Settings GUI
  context.subscriptions.push(
    vscode.commands.registerCommand('9router.configureSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', '9router');
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

  // 3. Hot-Reload Trigger Watcher
  setupAutoReloadTrigger(context);

  // 4. Start polling timer (15m default)
  startPolling(context, quotaWebviewProvider, usageWebviewProvider);

  // 5. Watch configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('9router')) {
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
