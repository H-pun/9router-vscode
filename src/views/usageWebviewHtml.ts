import { UsageStreamData, TopologyProvider, ChartDataPoint } from '../dataProvider';

export function getUsageWebviewHtml(
  initialUsage: UsageStreamData,
  providerIconMap: Record<string, string>,
  codiconCssUri: string,
  topologyFlowJsUri: string,
  topologyFlowCssUri: string,
  vscodeElementsJsUri: string,
  topologyProviders: TopologyProvider[],
  initialChartData: ChartDataPoint[]
): string {
  const initialUsageJson = JSON.stringify(initialUsage || { recentRequests: [], activeRequests: [], byProvider: {} });
  const iconMapJson = JSON.stringify(providerIconMap);
  const topologyProvidersJson = JSON.stringify(topologyProviders || []);
  const initialChartJson = JSON.stringify(initialChartData || []);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usage</title>
  <link rel="stylesheet" href="${codiconCssUri}">
  <link rel="stylesheet" href="${topologyFlowCssUri}">
  <style>
    :root {
      --bg: var(--vscode-sideBar-background);
      --fg: var(--vscode-sideBar-foreground);
      --hover-bg: var(--vscode-list-hoverBackground);
      --text-muted: var(--vscode-descriptionForeground);
      --border: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.22));
      --green: var(--vscode-charts-green, #388a34);
      --orange: var(--vscode-charts-orange, #d18616);
      --blue: #38bdf8;
      --font: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
      --font-size: var(--vscode-font-size, 13px);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
    }

    body {
      background-color: var(--bg);
      color: var(--fg);
      font-family: var(--font);
      font-size: var(--font-size);
      line-height: 1.4;
      padding: 0;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    vscode-tabs {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    vscode-tab-header {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    vscode-tab-panel {
      flex: 1;
      height: 100%;
      overflow: hidden;
      padding: 0;
      position: relative;
    }

    /* Tab 1: Graph Container */
    .tab-content-graph {
      width: 100%;
      height: 100%;
      position: relative;
    }

    /* Tab 2: Activity Container */
    .tab-content-chart {
      width: 100%;
      height: 100%;
      position: relative;
    }

    /* Tab 3: Recent Requests Container */
    .tab-content-table {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    vscode-table {
      width: 100%;
      height: 100%;
      font-size: 11.5px;
    }

    .model-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .model-icon {
      width: 15px;
      height: 15px;
      border-radius: 2px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .time-cell {
      color: var(--text-muted);
      font-size: 10.5px;
      white-space: nowrap;
    }

    .tokens-badge {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 10.5px;
      white-space: nowrap;
    }

    .empty-state {
      padding: 24px 12px;
      text-align: center;
      color: var(--text-muted);
      font-size: 11.5px;
    }
  </style>
  <script type="module" src="${vscodeElementsJsUri}"></script>
</head>
<body>
  <vscode-tabs selected-index="0" id="usage-tabs">
    <vscode-tab-header slot="header">Graph</vscode-tab-header>
    <vscode-tab-panel>
      <div class="tab-content-graph" id="xyflow-root"></div>
    </vscode-tab-panel>

    <vscode-tab-header slot="header">Activity</vscode-tab-header>
    <vscode-tab-panel>
      <div class="tab-content-chart" id="chart-root"></div>
    </vscode-tab-panel>

    <vscode-tab-header slot="header">Recent Requests</vscode-tab-header>
    <vscode-tab-panel>
      <div class="tab-content-table">
        <vscode-table bordered-rows zebra columns='["auto", "120px", "65px"]'>
          <vscode-table-header slot="header">
            <vscode-table-header-cell>Model</vscode-table-header-cell>
            <vscode-table-header-cell>In / Out</vscode-table-header-cell>
            <vscode-table-header-cell>When</vscode-table-header-cell>
          </vscode-table-header>
          <vscode-table-body slot="body" id="logs-tbody">
            <vscode-table-row>
              <vscode-table-cell class="empty-state">Waiting for requests...</vscode-table-cell>
              <vscode-table-cell></vscode-table-cell>
              <vscode-table-cell></vscode-table-cell>
            </vscode-table-row>
          </vscode-table-body>
        </vscode-table>
      </div>
    </vscode-tab-panel>
  </vscode-tabs>

  <script>
    const vscode = acquireVsCodeApi();
    window.__VSCODE__ = vscode;
    window.__PROVIDER_ICONS__ = ${iconMapJson};
    window.__TOPOLOGY_PROVIDERS__ = ${topologyProvidersJson};
    window.__INITIAL_USAGE__ = ${initialUsageJson};
    window.__INITIAL_CHART_DATA__ = ${initialChartJson};

    const providerIconMap = window.__PROVIDER_ICONS__;

    // Handle tab change resize events for React Flow & Recharts
    const tabsEl = document.getElementById('usage-tabs');
    if (tabsEl) {
      tabsEl.addEventListener('vsc-tabs-select', () => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 50);
      });
    }

    function fmtNumber(n) {
      if (!n) return '0';
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
      return String(n);
    }

    function timeAgo(dateStr) {
      if (!dateStr) return '';
      const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (seconds < 5) return 'just now';
      if (seconds < 60) return seconds + 's ago';
      if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
      if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
      return Math.floor(seconds / 86400) + 'd ago';
    }

    function renderLogsTable(requests) {
      const tbody = document.getElementById('logs-tbody');
      if (!tbody) return;

      if (!Array.isArray(requests) || requests.length === 0) {
        tbody.innerHTML = '<vscode-table-row><vscode-table-cell class="empty-state">No requests recorded yet</vscode-table-cell><vscode-table-cell></vscode-table-cell><vscode-table-cell></vscode-table-cell></vscode-table-row>';
        return;
      }

      tbody.innerHTML = requests.map(req => {
        const provKey = (req.provider || '').toLowerCase();
        const iconSrc = providerIconMap[provKey] || '';
        const inTokens = fmtNumber(req.promptTokens || 0);
        const outTokens = fmtNumber(req.completionTokens || 0);

        return \`
          <vscode-table-row>
            <vscode-table-cell>
              <div class="model-cell">
                \${iconSrc ? \`<img src="\${iconSrc}" class="model-icon" alt="" />\` : '<span class="codicon codicon-symbol-misc" style="font-size: 13px;"></span>'}
                <span title="\${req.model}">\${req.model || 'Unknown'}</span>
              </div>
            </vscode-table-cell>
            <vscode-table-cell>
              <span class="tokens-badge">\${inTokens} <span style="color: var(--text-muted);">/</span> \${outTokens}</span>
            </vscode-table-cell>
            <vscode-table-cell>
              <span class="time-cell">\${timeAgo(req.timestamp)}</span>
            </vscode-table-cell>
          </vscode-table-row>
        \`;
      }).join('');
    }

    // Initial table render
    if (window.__INITIAL_USAGE__ && window.__INITIAL_USAGE__.recentRequests) {
      renderLogsTable(window.__INITIAL_USAGE__.recentRequests);
    }

    // Stream listener for table
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg && msg.type === 'usageStream' && msg.data) {
        if (Array.isArray(msg.data.recentRequests)) {
          renderLogsTable(msg.data.recentRequests);
        }
      }
    });

    vscode.postMessage({ command: 'ready' });
  </script>
  <script src="${topologyFlowJsUri}"></script>
</body>
</html>`;
}
