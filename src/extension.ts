import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DataProvider } from './dataProvider';
import { QuotaWebviewProvider } from './providers/quotaWebviewProvider';
import { LogsWebviewProvider } from './providers/logsWebviewProvider';
import { TopologyWebviewProvider } from './providers/topologyWebviewProvider';
import { AnalyticsWebviewProvider } from './providers/analyticsWebviewProvider';
import { UsageStreamService } from './services/usageStreamService';
import { migrateApiKey, SECRET_KEY } from './secretMigration';

let refreshTimer: NodeJS.Timeout | undefined;

function supportsSecondarySidebar(): boolean {
  const config = vscode.workspace.getConfiguration('9router');
  const manual = config.get<string>('viewLocation', 'auto');
  if (manual === 'secondary') return true;
  if (manual === 'activitybar') return false;

  const [major, minor] = vscode.version.split('.').map(Number);
  if (major < 1 || (major === 1 && minor < 106)) return false;

  // Fork yang mencadangkan Secondary Side Bar untuk UI agent bawaannya.
  const forks = ['cursor', 'windsurf', 'trae', 'antigravity'];
  const app = vscode.env.appName.toLowerCase();
  if (forks.some((f) => app.includes(f))) return false;

  return true;
}

export async function activate(context: vscode.ExtensionContext) {
  console.log('[9Router Monitor] Extension activating...');

  // Set context key for Secondary Side Bar vs Activity Bar fallback
  const isNoSecondary = !supportsSecondarySidebar();
  await vscode.commands.executeCommand(
    'setContext',
    '9router:noSecondarySidebar',
    isNoSecondary
  );

  // Initialize SecretStorage on DataProvider
  DataProvider.getInstance().setSecretStorage(context.secrets);

  // Initialize Singleton SSE Service
  UsageStreamService.getInstance().init(context);

  // Migrate legacy configuration apiKey to SecretStorage if present
  await migrateApiKey(context);

  // 1. Register 4 Native Auxiliary Webview Providers with retainContextWhenHidden
  const quotaWebviewProvider = new QuotaWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      QuotaWebviewProvider.viewType,
      quotaWebviewProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  const logsWebviewProvider = new LogsWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      LogsWebviewProvider.viewType,
      logsWebviewProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  const topologyWebviewProvider = new TopologyWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TopologyWebviewProvider.viewType,
      topologyWebviewProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  const analyticsWebviewProvider = new AnalyticsWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AnalyticsWebviewProvider.viewType,
      analyticsWebviewProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // 2. Register Navigation Focus Commands adapting to active container
  context.subscriptions.push(
    vscode.commands.registerCommand('9router.focusQuota', () => {
      const containerId = supportsSecondarySidebar() ? '9router-quota' : '9router-quota-alt';
      vscode.commands.executeCommand(`workbench.view.extension.${containerId}`);
    }),
    vscode.commands.registerCommand('9router.focusTopology', () => {
      const containerId = supportsSecondarySidebar() ? '9router-topology' : '9router-topology-alt';
      vscode.commands.executeCommand(`workbench.view.extension.${containerId}`);
    }),
    vscode.commands.registerCommand('9router.focusAnalytics', () => {
      const containerId = supportsSecondarySidebar() ? '9router-analytics' : '9router-analytics-alt';
      vscode.commands.executeCommand(`workbench.view.extension.${containerId}`);
    })
  );

  // 3. Register Filter Submenu Commands
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
      await topologyWebviewProvider.render();
      await analyticsWebviewProvider.render();
      logsWebviewProvider.render();
      vscode.window.showInformationMessage('9Router: Quotas refreshed');
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
      await topologyWebviewProvider.render();
      await analyticsWebviewProvider.render();
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
        await topologyWebviewProvider.render();
        await analyticsWebviewProvider.render();
      }
    })
  );

  // 4. Hot-Reload Trigger Watcher
  setupAutoReloadTrigger(context);

  // 5. Start polling timer (15m default)
  startPolling(context, quotaWebviewProvider, topologyWebviewProvider, analyticsWebviewProvider);

  // 6. Watch configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('9router.viewLocation')) {
        const noSec = !supportsSecondarySidebar();
        await vscode.commands.executeCommand('setContext', '9router:noSecondarySidebar', noSec);
      }
      if (e.affectsConfiguration('9router')) {
        UsageStreamService.getInstance().reconnect();
        startPolling(context, quotaWebviewProvider, topologyWebviewProvider, analyticsWebviewProvider);
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
  topologyWebviewProvider: TopologyWebviewProvider,
  analyticsWebviewProvider: AnalyticsWebviewProvider
) {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  const config = vscode.workspace.getConfiguration('9router');
  const intervalSec = config.get<number>('refreshInterval', 900);
  const intervalMs = Math.max(10, intervalSec) * 1000;

  refreshTimer = setInterval(async () => {
    await quotaWebviewProvider.refresh();
    await topologyWebviewProvider.render();
    await analyticsWebviewProvider.render();
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
