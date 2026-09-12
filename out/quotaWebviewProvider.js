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
exports.QuotaWebviewProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dataProvider_1 = require("./dataProvider");
const nativeAccordionView_1 = require("./views/nativeAccordionView");
class QuotaWebviewProvider {
    _extensionUri;
    static viewType = '9router.quotaTrackerView';
    _view;
    _streamDisposer;
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
        this.startLiveStream();
        webviewView.onDidDispose(() => {
            if (this._streamDisposer) {
                this._streamDisposer();
            }
        });
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.command) {
                case 'refresh':
                    await this.refresh();
                    vscode.window.showInformationMessage('9Router: Refreshed');
                    break;
                case 'refreshSingle':
                    await this.refresh();
                    vscode.window.showInformationMessage(`9Router: Quota refreshed for ${data.name || 'account'}`);
                    break;
                case 'fetchChart':
                    const chartData = await dataProvider_1.DataProvider.getInstance().fetchChartData(data.period || 'today');
                    webviewView.webview.postMessage({
                        type: 'chartData',
                        data: chartData
                    });
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
    startLiveStream() {
        if (this._streamDisposer) {
            this._streamDisposer();
        }
        this._streamDisposer = dataProvider_1.DataProvider.getInstance().listenUsageStream((streamData) => {
            if (this._view) {
                this._view.webview.postMessage({
                    type: 'usageStream',
                    data: streamData
                });
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
            const topologyFlowJsUri = this._view.webview
                .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'topologyFlow.js'))
                .toString();
            const topologyFlowCssUri = this._view.webview
                .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'topologyFlow.css'))
                .toString();
            this._view.webview.html = (0, nativeAccordionView_1.getNativeAccordionHtml)(data, iconMap, codiconCssUri, topologyFlowJsUri, topologyFlowCssUri);
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