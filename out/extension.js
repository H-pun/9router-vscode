"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const quotaWebviewProvider_1 = require("./quotaWebviewProvider");
const usageWebviewProvider_1 = require("./usageWebviewProvider");
let refreshTimer;
function activate(context) {
    console.log('[9Router Monitor] Extension activated');
    // 1. Register Native Views (Official VS Code ViewPanes)
    const quotaWebviewProvider = new quotaWebviewProvider_1.QuotaWebviewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(quotaWebviewProvider_1.QuotaWebviewProvider.viewType, quotaWebviewProvider));
    const usageWebviewProvider = new usageWebviewProvider_1.UsageWebviewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(usageWebviewProvider_1.UsageWebviewProvider.viewType, usageWebviewProvider));
    // 2. Register Filter Submenu Commands
    context.subscriptions.push(vscode.commands.registerCommand('9router.filterActive', () => {
        quotaWebviewProvider.setFilter('active');
    }), vscode.commands.registerCommand('9router.filterAll', () => {
        quotaWebviewProvider.setFilter('all');
    }), vscode.commands.registerCommand('9router.filterIdle', () => {
        quotaWebviewProvider.setFilter('idle');
    }));
    // Refresh Command
    context.subscriptions.push(vscode.commands.registerCommand('9router.refreshStats', async () => {
        await quotaWebviewProvider.refresh();
        await usageWebviewProvider.render();
        vscode.window.showInformationMessage('9Router: Quotas refreshed');
    }));
    // Settings GUI
    context.subscriptions.push(vscode.commands.registerCommand('9router.configureSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', '9router');
    }));
    // Web Dashboard
    context.subscriptions.push(vscode.commands.registerCommand('9router.openWebDashboard', async () => {
        const config = vscode.workspace.getConfiguration('9router');
        const baseUrl = config.get('baseUrl', 'http://localhost:20128');
        vscode.env.openExternal(vscode.Uri.parse(baseUrl));
    }));
    // 3. Hot-Reload Trigger Watcher
    setupAutoReloadTrigger(context);
    // 4. Start polling timer (15m default)
    startPolling(context, quotaWebviewProvider, usageWebviewProvider);
    // 5. Watch configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('9router')) {
            startPolling(context, quotaWebviewProvider, usageWebviewProvider);
        }
    }));
}
function setupAutoReloadTrigger(context) {
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
    }
    catch (err) {
        console.warn('[9Router] Could not setup reload trigger watcher:', err);
    }
}
function startPolling(context, quotaWebviewProvider, usageWebviewProvider) {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    const config = vscode.workspace.getConfiguration('9router');
    const intervalSec = config.get('refreshInterval', 900);
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
function deactivate() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
}
//# sourceMappingURL=extension.js.map