import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DataProvider } from '../dataProvider';
import { getTopologyWebviewHtml } from '../views/topologyWebviewHtml';
import { UsageStreamService } from '../services/usageStreamService';

export class TopologyWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = '9router.topologyView';
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

    // Subscribe to SSE Singleton to push live stream active nodes to graph
    this._streamUnsub = UsageStreamService.getInstance().subscribe((data) => {
      if (this._view) {
        this._view.webview.postMessage({
          type: 'usageStream',
          data,
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
        case 'ready':
          const snapshot = UsageStreamService.getInstance().getSnapshot();
          const quotaData = await DataProvider.getInstance().fetchQuotas();
          webviewView.webview.postMessage({
            type: 'usageStream',
            data: snapshot,
          });
          if (quotaData.topologyProviders) {
            webviewView.webview.postMessage({
              type: 'updateTopologyProviders',
              providers: quotaData.topologyProviders,
            });
          }
          break;
      }
    });
  }

  public async render() {
    if (this._view) {
      const data = await DataProvider.getInstance().fetchQuotas();
      const initialUsage = UsageStreamService.getInstance().getSnapshot();
      const iconMap = this.getProviderIconMap(this._view.webview);
      const topologyFlowJsUri = this._view.webview
        .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'topologyFlow.js'))
        .toString();
      const topologyFlowCssUri = this._view.webview
        .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'topologyFlow.css'))
        .toString();

      this._view.webview.html = getTopologyWebviewHtml(
        initialUsage,
        iconMap,
        data.topologyProviders || [],
        topologyFlowJsUri,
        topologyFlowCssUri
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
