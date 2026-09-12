"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaWebviewProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const dataProvider_1 = require("./dataProvider");
const nativeAccordionView_1 = require("./views/nativeAccordionView");
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
                    await this.refresh();
                    vscode.window.showInformationMessage('9Router: Quotas refreshed');
                    break;
                case 'refreshSingle':
                    await this.refresh();
                    vscode.window.showInformationMessage(`9Router: Quota refreshed for ${data.name || 'account'}`);
                    break;
                case 'test':
                    await vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: `9Router: Testing ${data.name || 'connection'}...`
                    }, async () => {
                        const res = await dataProvider_1.DataProvider.getInstance().testConnection(data.connectionId);
                        if (res.valid) {
                            vscode.window.showInformationMessage(`9Router: ${data.name || 'Account'} is VALID and active!`);
                        }
                        else {
                            vscode.window.showErrorMessage(`9Router: Test failed: ${res.error || 'Connection invalid'}`);
                        }
                        await this.refresh();
                    });
                    break;
                case 'toggleActive':
                    const ok = await dataProvider_1.DataProvider.getInstance().toggleConnection(data.connectionId, data.nextActive);
                    if (ok) {
                        vscode.window.showInformationMessage(`9Router: Account status set to ${data.nextActive ? 'Active' : 'Idle'}`);
                        await this.refresh();
                    }
                    else {
                        vscode.window.showErrorMessage('9Router: Failed to update status');
                    }
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('9router.configureSettings');
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
            const iconMap = this.getProviderIconMap(this._view.webview);
            const codiconCssUri = this._view.webview
                .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'codicons', 'codicon.css'))
                .toString();
            this._view.webview.html = (0, nativeAccordionView_1.getNativeAccordionHtml)(data, iconMap, codiconCssUri);
        }
    }
    getProviderIconMap(webview) {
        const iconMap = {};
        const providersDir = path.join(this._extensionUri.fsPath, 'media', 'providers');
        if (fs.existsSync(providersDir)) {
            try {
                const files = fs.readdirSync(providersDir);
                files.forEach(f => {
                    const key = path.basename(f, path.extname(f)).toLowerCase();
                    const uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'providers', f));
                    iconMap[key] = uri.toString();
                });
            }
            catch (err) {
                console.warn('[9Router] Error scanning media/providers:', err);
            }
        }
        // Map common aliases
        if (iconMap['claude'] && !iconMap['claude-code'])
            iconMap['claude-code'] = iconMap['claude'];
        if (iconMap['azure'] && !iconMap['azure-openai'])
            iconMap['azure-openai'] = iconMap['azure'];
        if (iconMap['gemini'] && !iconMap['gemini-cli'])
            iconMap['gemini-cli'] = iconMap['gemini'];
        if (iconMap['mimo-free'] && !iconMap['mimo'])
            iconMap['mimo'] = iconMap['mimo-free'];
        return iconMap;
    }
}
exports.QuotaWebviewProvider = QuotaWebviewProvider;
//# sourceMappingURL=quotaWebviewProvider.js.map