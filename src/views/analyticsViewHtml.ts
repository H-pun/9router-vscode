import { ChartDataPoint } from '../dataProvider';

export function getAnalyticsWebviewHtml(
  initialChartData: ChartDataPoint[],
  analyticsFlowJsUri: string
): string {
  const chartDataJson = JSON.stringify(initialChartData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Token & Cost Analytics</title>
  <style>
    :root {
      --bg: var(--vscode-sideBar-background, #181818);
      --fg: var(--vscode-sideBar-foreground, #cccccc);
      --border: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.22));
    }
    html, body, #analytics-root {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: var(--bg);
      color: var(--fg);
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
    }
  </style>
</head>
<body>
  <div id="analytics-root"></div>

  <script>
    const vscode = acquireVsCodeApi();
    window.__VSCODE__ = vscode;
    window.__INITIAL_CHART_DATA__ = ${chartDataJson};

    vscode.postMessage({ command: 'ready' });
  </script>
  <script src="${analyticsFlowJsUri}"></script>
</body>
</html>`;
}
