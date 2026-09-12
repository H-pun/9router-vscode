"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaDashboardPanel = exports.QuotaWebviewProvider = void 0;
const vscode = require("vscode");
const dataProvider_1 = require("./dataProvider");
const quotaView_1 = require("./views/quotaView");
class QuotaWebviewProvider {
    _extensionUri;
    static viewType = '9router.quotaTrackerView';
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        this.refresh();
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.command) {
                case 'refresh':
                case 'refreshSingle':
                    await this.refresh();
                    vscode.window.showInformationMessage('9Router: Quotas refreshed');
                    break;
                case 'test':
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: '9Router: Testing connection...'
                    }, async () => {
                        const res = await dataProvider_1.DataProvider.getInstance().testConnection(data.connectionId);
                        if (res.valid) {
                            vscode.window.showInformationMessage('9Router: Connection valid and active!');
                        }
                        else {
                            vscode.window.showErrorMessage(`9Router: Connection test failed: ${res.error || 'Unknown error'}`);
                        }
                        await this.refresh();
                    });
                    break;
                case 'openWeb':
                    vscode.commands.executeCommand('9router.openWebDashboard');
                    break;
            }
        });
    }
    async refresh() {
        if (this._view) {
            const data = await dataProvider_1.DataProvider.getInstance().fetchQuotas();
            this._view.webview.html = (0, quotaView_1.getQuotaTrackerHtml)(data);
        }
    }
}
exports.QuotaWebviewProvider = QuotaWebviewProvider;
class QuotaDashboardPanel {
    static currentPanel;
    _panel;
    _extensionUri;
    _disposables = [];
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (QuotaDashboardPanel.currentPanel) {
            QuotaDashboardPanel.currentPanel._panel.reveal(column);
            QuotaDashboardPanel.currentPanel.refresh();
            return;
        }
        const panel = vscode.window.createWebviewPanel('9routerQuotaTracker', '9Router: Quota Tracker', column || vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [extensionUri]
        });
        QuotaDashboardPanel.currentPanel = new QuotaDashboardPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this.refresh();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage(async (data) => {
            switch (data.command) {
                case 'refresh':
                case 'refreshSingle':
                    await this.refresh();
                    break;
                case 'test':
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: '9Router: Testing connection...'
                    }, async () => {
                        const res = await dataProvider_1.DataProvider.getInstance().testConnection(data.connectionId);
                        if (res.valid) {
                            vscode.window.showInformationMessage('9Router: Connection valid and active!');
                        }
                        else {
                            vscode.window.showErrorMessage(`9Router: Connection test failed: ${res.error || 'Unknown error'}`);
                        }
                        await this.refresh();
                    });
                    break;
                case 'openWeb':
                    vscode.commands.executeCommand('9router.openWebDashboard');
                    break;
            }
        }, null, this._disposables);
    }
    async refresh() {
        const data = await dataProvider_1.DataProvider.getInstance().fetchQuotas();
        this._panel.webview.html = (0, quotaView_1.getQuotaTrackerHtml)(data);
    }
    dispose() {
        QuotaDashboardPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
exports.QuotaDashboardPanel = QuotaDashboardPanel;
//# sourceMappingURL=webviewProvider.js.map