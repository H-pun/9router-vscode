import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DataProvider } from './dataProvider';
import { getQuotaWebviewHtml } from './views/quotaWebviewHtml';

export class QuotaWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = '9router.quotaTrackerView';
  private _view?: vscode.WebviewView;
  private _currentFilter: string = 'active';

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

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case 'refresh':
          await this.refresh();
          break;
        case 'refreshSingle':
          try {
            await this.refresh();
            vscode.window.showInformationMessage(`9Router: Quotas for "${data.name || 'Account'}" refreshed`);
          } catch (err) {
            webviewView.webview.postMessage({
              type: 'refreshSingleDone',
              connectionId: data.connectionId
            });
            vscode.window.showErrorMessage(`9Router: Failed to refresh "${data.name || 'Account'}"`);
          }
          break;
        case 'toggleActive':
          const success = await DataProvider.getInstance().toggleConnection(data.connectionId, data.nextActive);
          if (!success) {
            webviewView.webview.postMessage({
              type: 'toggleRollback',
              connectionId: data.connectionId,
              prevActive: data.prevActive
            });
            vscode.window.showErrorMessage(`9Router: Failed to update status for "${data.name || 'Account'}"`);
          } else {
            webviewView.webview.postMessage({
              type: 'toggleResult',
              connectionId: data.connectionId,
              success: true
            });
            const statusLabel = data.nextActive ? 'Active (ON)' : 'Inactive (OFF)';
            vscode.window.showInformationMessage(`9Router: "${data.name || 'Account'}" switched to ${statusLabel}`);
            await this.refresh();
          }
          break;
        case 'test':
        case 'testConnection':
          webviewView.webview.postMessage({
            type: 'testStatus',
            connectionId: data.connectionId,
            status: 'testing'
          });
          const testRes = await DataProvider.getInstance().testConnection(data.connectionId);
          webviewView.webview.postMessage({
            type: 'testStatus',
            connectionId: data.connectionId,
            status: 'idle'
          });
          if (testRes.valid) {
            vscode.window.showInformationMessage(`9Router: Account "${data.name || 'Account'}" connection valid`);
          } else {
            vscode.window.showErrorMessage(`9Router: Test failed for "${data.name || 'Account'}" - ${testRes.error || 'Unknown error'}`);
          }
          break;
        case 'filterChange':
          this._currentFilter = data.filter;
          break;
      }
    });
  }

  public setFilter(filter: string) {
    this._currentFilter = filter;
    if (this._view) {
      this._view.webview.postMessage({
        type: 'setFilter',
        filter: filter,
      });
    }
  }

  public async refresh() {
    await this.render();
  }

  public async render() {
    if (this._view) {
      const data = await DataProvider.getInstance().fetchQuotas();
      const iconMap = this.getProviderIconMap(this._view.webview);
      const codiconCssUri = this._view.webview
        .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'codicons', 'codicon.css'))
        .toString();

      this._view.webview.html = getQuotaWebviewHtml(
        data,
        iconMap,
        codiconCssUri,
        this._currentFilter
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
