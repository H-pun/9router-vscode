"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const dataProvider_1 = require("./dataProvider");
const quotaWebviewProvider_1 = require("./quotaWebviewProvider");
let statusBarItem;
let refreshTimer;
function activate(context) {
    console.log('[9Router Monitor] Extension activated');
    // 1. Register Single Clean Quota Tracker Webview Provider
    const quotaWebviewProvider = new quotaWebviewProvider_1.QuotaWebviewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(quotaWebviewProvider_1.QuotaWebviewProvider.viewType, quotaWebviewProvider));
    // 2. Status Bar Item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = '9router.refreshStats';
    statusBarItem.tooltip = 'Click to refresh 9Router Quotas';
    context.subscriptions.push(statusBarItem);
    statusBarItem.show();
    // 3. Register Commands
    context.subscriptions.push(vscode.commands.registerCommand('9router.refreshStats', async () => {
        await quotaWebviewProvider.refresh();
        await updateStatusBar();
        vscode.window.showInformationMessage('9Router: Quotas refreshed');
    }));
    // Settings Configuration Wizard
    context.subscriptions.push(vscode.commands.registerCommand('9router.configureSettings', async () => {
        const config = vscode.workspace.getConfiguration('9router');
        const currentUrl = config.get('baseUrl', 'http://localhost:20128');
        const currentInterval = config.get('refreshInterval', 900);
        const choice = await vscode.window.showQuickPick([
            {
                label: '$(globe) Configure 9Router Base URL / IP',
                description: currentUrl,
                action: 'url'
            },
            {
                label: '$(clock) Change Auto-Sync Interval',
                description: `${Math.round(currentInterval / 60)} minutes`,
                action: 'interval'
            },
            {
                label: '$(key) Set API Key (Remote access)',
                description: 'Configure Bearer token for remote 9router access',
                action: 'key'
            },
            {
                label: '$(settings-gear) Open in VS Code Settings GUI',
                description: 'View all 9Router extension preferences',
                action: 'gui'
            }
        ], { placeHolder: '9Router Settings & Server Configuration' });
        if (!choice)
            return;
        if (choice.action === 'url') {
            const newUrl = await vscode.window.showInputBox({
                prompt: 'Enter 9Router instance base URL or IP',
                value: currentUrl,
                placeHolder: 'http://localhost:20128 or http://10.1.8.108:20128'
            });
            if (newUrl) {
                await config.update('baseUrl', newUrl.trim(), vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`9Router: Base URL updated to ${newUrl.trim()}`);
                await quotaWebviewProvider.refresh();
                await updateStatusBar();
            }
        }
        else if (choice.action === 'interval') {
            const selectedInterval = await vscode.window.showQuickPick([
                { label: '5 Minutes', value: 300 },
                { label: '15 Minutes (Default)', value: 900 },
                { label: '30 Minutes', value: 1800 },
                { label: '1 Hour', value: 3600 }
            ], { placeHolder: 'Select auto-refresh sync interval' });
            if (selectedInterval) {
                await config.update('refreshInterval', selectedInterval.value, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`9Router: Sync interval updated to ${selectedInterval.label}`);
            }
        }
        else if (choice.action === 'key') {
            const newKey = await vscode.window.showInputBox({
                prompt: 'Enter 9Router API Key (Optional for local, required for remote)',
                password: true,
                placeHolder: 'sk_...'
            });
            if (newKey !== undefined) {
                await config.update('apiKey', newKey.trim(), vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('9Router: API Key updated');
                await quotaWebviewProvider.refresh();
            }
        }
        else if (choice.action === 'gui') {
            vscode.commands.executeCommand('workbench.action.openSettings', '9router');
        }
    }));
    // 4. Initial fetch & timer setup (15 mins default)
    updateStatusBar();
    startPolling(context, quotaWebviewProvider);
    // 5. Watch configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('9router')) {
            startPolling(context, quotaWebviewProvider);
            updateStatusBar();
        }
    }));
}
function startPolling(context, quotaWebviewProvider) {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    const config = vscode.workspace.getConfiguration('9router');
    const intervalSec = config.get('refreshInterval', 900);
    const intervalMs = Math.max(10, intervalSec) * 1000;
    refreshTimer = setInterval(async () => {
        await quotaWebviewProvider.refresh();
        await updateStatusBar();
    }, intervalMs);
    context.subscriptions.push({
        dispose: () => {
            if (refreshTimer) {
                clearInterval(refreshTimer);
            }
        }
    });
}
async function updateStatusBar() {
    try {
        const data = await dataProvider_1.DataProvider.getInstance().fetchQuotas();
        if (!data.online) {
            statusBarItem.text = `$(circle-slash) 9Router: Offline`;
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            statusBarItem.tooltip = `9Router is unreachable at ${data.serverUrl}`;
            return;
        }
        const activeConns = data.connections.filter(c => c.isActive);
        const activeName = activeConns[0] ? activeConns[0].name.split('@')[0] : 'Ready';
        statusBarItem.text = `$(pulse) 9Router: ${activeName} (${activeConns.length} active)`;
        statusBarItem.backgroundColor = undefined;
        const tooltipLines = [
            `9Router Quota Monitor (${data.serverUrl})`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        ];
        data.connections.forEach(c => {
            tooltipLines.push(`• ${c.name} (#Prio ${c.priority}) - ${c.quotas.length} quotas`);
        });
        tooltipLines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        tooltipLines.push(`Click to refresh quotas`);
        statusBarItem.tooltip = tooltipLines.join('\n');
    }
    catch (err) {
        statusBarItem.text = `$(alert) 9Router: Error`;
    }
}
function deactivate() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
}
//# sourceMappingURL=extension.js.map