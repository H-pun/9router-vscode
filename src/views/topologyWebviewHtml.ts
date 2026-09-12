import { UsageStreamData, TopologyProvider } from '../dataProvider';

export function getTopologyWebviewHtml(
  initialUsage: UsageStreamData,
  providerIconMap: Record<string, string>,
  topologyProviders: TopologyProvider[],
  topologyFlowJsUri: string,
  topologyFlowCssUri: string
): string {
  const iconMapJson = JSON.stringify(providerIconMap);
  const topologyProvidersJson = JSON.stringify(topologyProviders);
  const initialUsageJson = JSON.stringify(initialUsage);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Routing Topology</title>
  <link rel="stylesheet" href="${topologyFlowCssUri}">
  <style>
    :root {
      --bg: var(--vscode-sideBar-background, #181818);
      --fg: var(--vscode-sideBar-foreground, #cccccc);
      --border: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.22));
    }
    html, body, #topology-root {
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
  <div id="topology-root"></div>

  <script>
    const vscode = acquireVsCodeApi();
    window.__VSCODE__ = vscode;
    window.__PROVIDER_ICONS__ = ${iconMapJson};
    window.__TOPOLOGY_PROVIDERS__ = ${topologyProvidersJson};
    window.__INITIAL_USAGE__ = ${initialUsageJson};

    // Forward messages to window for React app
    window.addEventListener('message', (event) => {
      // The React app is already listening on window 'message'
    });

    vscode.postMessage({ command: 'ready' });
  </script>
  <script src="${topologyFlowJsUri}"></script>
</body>
</html>`;
}
