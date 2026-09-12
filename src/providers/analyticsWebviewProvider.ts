import * as vscode from 'vscode';
import { DataProvider } from '../dataProvider';
import { getAnalyticsWebviewHtml } from '../views/analyticsViewHtml';

export class AnalyticsWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = '9router.analyticsView';
  private _view?: vscode.WebviewView;

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
        case 'fetchChart':
          const chartData = await DataProvider.getInstance().fetchChartData(data.period || 'today');
          webviewView.webview.postMessage({
            type: 'chartData',
            data: chartData,
          });
          break;
        case 'ready':
          const initialChart = await DataProvider.getInstance().fetchChartData('today');
          webviewView.webview.postMessage({
            type: 'chartData',
            data: initialChart,
          });
          break;
      }
    });
  }

  public async render() {
    if (this._view) {
      const initialChart = await DataProvider.getInstance().fetchChartData('today');
      const analyticsFlowJsUri = this._view.webview
        .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'analyticsFlow.js'))
        .toString();

      this._view.webview.html = getAnalyticsWebviewHtml(initialChart, analyticsFlowJsUri);
    }
  }
}
