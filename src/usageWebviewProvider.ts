import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DataProvider, UsageStreamData } from './dataProvider';
import { getUsageWebviewHtml } from './views/usageWebviewHtml';
import { UsageStreamService } from './services/usageStreamService';

export class UsageWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = '9router.usageView';
  private _view?: vscode.WebviewView;
  private _streamUnsub?: () => void;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    this.render();

    // Subscribe to SSE Singleton Service
    this._streamUnsub = UsageStreamService.getInstance().subscribe((streamData: UsageStreamData) => {
      if (this._view) {
        this._view.webview.postMessage({
          type: 'usageStream',
          data: streamData
        });
      }
    });

    webviewView.onDidDispose(() => {
      if (this._streamUnsub) {
        this._streamUnsub();
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
        case 'ready':
          const snapshot = UsageStreamService.getInstance().getSnapshot();
          webviewView.webview.postMessage({
            type: 'usageStream',
            data: snapshot
          });
          break;
      }
    });
  }

  public async render() {
    if (this._view) {
      const data = await DataProvider.getInstance().fetchQuotas();
      const initialUsage = UsageStreamService.getInstance().getSnapshot();
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
    const providersDir = path.join(this._extensionUri.fsPath, 'media', 'providers');
    const iconMap: Record<string, string> = {};

    try {
      if (fs.existsSync(providersDir)) {
        const files = fs.readdirSync(providersDir);
        for (const file of files) {
          const providerName = path.parse(file).name;
          const diskPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'providers', file);
          iconMap[providerName.toLowerCase()] = webview.asWebviewUri(diskPath).toString();
        }
      }
    } catch {}

    return iconMap;
  }
}
