import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DataProvider, UsageStreamData } from './dataProvider';
import { getUsageWebviewHtml } from './views/usageWebviewHtml';

export class UsageWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = '9router.usageView';
  private _view?: vscode.WebviewView;
  private _streamDisposer?: () => void;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    this.render();
    this.startLiveStream();

    webviewView.onDidDispose(() => {
      if (this._streamDisposer) {
        this._streamDisposer();
      }
    });

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case 'fetchChart':
          const chartData = await DataProvider.getInstance().fetchChartData(data.period || 'today');
          webviewView.webview.postMessage({
            type: 'chartData',
            data: chartData
          });
          break;
      }
    });
  }

  private startLiveStream() {
    if (this._streamDisposer) {
      this._streamDisposer();
    }

    this._streamDisposer = DataProvider.getInstance().listenUsageStream((streamData: UsageStreamData) => {
      if (this._view) {
        this._view.webview.postMessage({
          type: 'usageStream',
          data: streamData
        });
      }
    });
  }

  public async render() {
    if (this._view) {
      const data = await DataProvider.getInstance().fetchQuotas();
      const initialUsage: UsageStreamData = data.initialUsage || {
        totalRequests: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        recentRequests: [],
        activeRequests: [],
        byProvider: {}
      };
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

      this._view.webview.html = getUsageWebviewHtml(
        initialUsage,
        iconMap,
        codiconCssUri,
        topologyFlowJsUri,
        topologyFlowCssUri,
        data.topologyProviders || [],
        data.initialChartData || []
      );
    }
  }

  private getProviderIconMap(webview: vscode.Webview): Record<string, string> {
    const iconMap: Record<string, string> = {};
    const providersDir = path.join(this._extensionUri.fsPath, 'media', 'providers');

    if (fs.existsSync(providersDir)) {
      try {
        const files = fs.readdirSync(providersDir);
        files.forEach(f => {
          const key = path.basename(f, path.extname(f)).toLowerCase();
          const uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'providers', f));
          iconMap[key] = uri.toString();
        });
      } catch (err) {
        console.warn('[9Router] Error scanning media/providers:', err);
      }
    }

    if (iconMap['claude'] && !iconMap['claude-code']) iconMap['claude-code'] = iconMap['claude'];
    if (iconMap['azure'] && !iconMap['azure-openai']) iconMap['azure-openai'] = iconMap['azure'];
    if (iconMap['gemini'] && !iconMap['gemini-cli']) iconMap['gemini-cli'] = iconMap['gemini'];
    if (iconMap['mimo-free'] && !iconMap['mimo']) iconMap['mimo'] = iconMap['mimo-free'];

    return iconMap;
  }
}
