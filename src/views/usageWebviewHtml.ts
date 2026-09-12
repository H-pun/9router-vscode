import { UsageStreamData, TopologyProvider, ChartDataPoint } from '../dataProvider';

export function getUsageWebviewHtml(
  initialUsage: UsageStreamData,
  providerIconMap: Record<string, string>,
  codiconCssUri: string,
  topologyFlowJsUri: string,
  topologyFlowCssUri: string,
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
      --bg: var(--vscode-sideBar-background, #181818);
      --fg: var(--vscode-sideBar-foreground, #cccccc);
      --hover-bg: var(--vscode-list-hoverBackground, rgba(255, 255, 255, 0.08));
      --text-muted: var(--vscode-descriptionForeground, #888888);
      --border: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.22));
      --tab-active-fg: var(--vscode-panelTitle-activeForeground, var(--vscode-tab-activeForeground, #ffffff));
      --tab-inactive-fg: var(--vscode-panelTitle-inactiveForeground, var(--vscode-tab-inactiveForeground, #888888));
      --tab-active-border: var(--vscode-panelTitle-activeBorder, var(--vscode-focusBorder, #007fd4));
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

    /* Native VS Code Tab Strip */
    .tabs-header-strip {
      display: flex;
      align-items: center;
      height: 27px;
      min-height: 27px;
      margin: 0 10px;
      padding-left: 0;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
      flex-shrink: 0;
      gap: 2px;
    }

    .vsc-tab-btn {
      display: inline-flex;
      align-items: center;
      height: 27px;
      padding: 0 8px;
      background: transparent;
      border: none;
      border-bottom: 1.5px solid transparent;
      margin-bottom: -1px;
      color: var(--tab-inactive-fg);
      font-family: var(--font);
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.35px;
      cursor: pointer;
      outline: none;
      transition: color 0.1s ease, border-color 0.1s ease;
    }

    .vsc-tab-btn:hover {
      color: var(--tab-active-fg);
    }

    .vsc-tab-btn.active {
      color: var(--tab-active-fg);
      font-weight: 600;
      border-bottom-color: var(--tab-active-border);
    }

    .vsc-tab-btn:focus-visible {
      outline: 1px solid var(--vscode-focusBorder, #007fd4);
      outline-offset: -2px;
    }

    /* Tab Panels Container */
    .tab-panels-wrapper {
      flex: 1;
      height: calc(100% - 27px);
      position: relative;
      overflow: hidden;
    }

    .vsc-tab-panel {
      display: none;
      width: 100%;
      height: 100%;
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .vsc-tab-panel.active {
      display: block;
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
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 10px 8px 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }

    thead th {
      text-align: left;
      padding: 5px 8px;
      font-size: 10.5px;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--vscode-sideBarSectionHeader-background, rgba(128,128,128,0.06));
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 2;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background 0.08s;
    }

    tbody tr:last-child {
      border-bottom: none;
    }

    tbody tr:hover {
      background: var(--hover-bg);
    }

    td {
      padding: 5px 8px;
      vertical-align: middle;
    }

    .model-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }

    .model-icon {
      width: 14px;
      height: 14px;
      border-radius: 2px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .time-cell {
      color: var(--text-muted);
      font-size: 10.5px;
      text-align: right;
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
</head>
<body>
  <!-- Native Tabs Header Strip -->
  <div class="tabs-header-strip" role="tablist">
    <button class="vsc-tab-btn active" role="tab" id="tab-btn-graph" aria-selected="true" onclick="switchTab('graph')">Graph</button>
    <button class="vsc-tab-btn" role="tab" id="tab-btn-activity" aria-selected="false" onclick="switchTab('activity')">Activity</button>
    <button class="vsc-tab-btn" role="tab" id="tab-btn-logs" aria-selected="false" onclick="switchTab('logs')">Recent Requests</button>
  </div>

  <!-- Tab Panels -->
  <div class="tab-panels-wrapper">
    <!-- Panel 1: Graph -->
    <div class="vsc-tab-panel active" id="tab-panel-graph" role="tabpanel">
      <div class="tab-content-graph" id="xyflow-root"></div>
    </div>

    <!-- Panel 2: Activity -->
    <div class="vsc-tab-panel" id="tab-panel-activity" role="tabpanel">
      <div class="tab-content-chart" id="chart-root"></div>
    </div>

    <!-- Panel 3: Recent Requests -->
    <div class="vsc-tab-panel" id="tab-panel-logs" role="tabpanel">
      <div class="tab-content-table">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>In / Out</th>
              <th style="text-align: right;">When</th>
            </tr>
          </thead>
          <tbody id="logs-tbody">
            <tr>
              <td colspan="3" class="empty-state">Waiting for requests...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    window.__VSCODE__ = vscode;
    window.__PROVIDER_ICONS__ = ${iconMapJson};
    window.__ICON_MAP__ = ${iconMapJson};
    window.__TOPOLOGY_PROVIDERS__ = ${topologyProvidersJson};
    window.__INITIAL_USAGE__ = ${initialUsageJson};
    window.__INITIAL_CHART_DATA__ = ${initialChartJson};

    const providerIconMap = window.__PROVIDER_ICONS__;

    function switchTab(tabId) {
      const tabs = ['graph', 'activity', 'logs'];
      tabs.forEach(t => {
        const btn = document.getElementById('tab-btn-' + t);
        const panel = document.getElementById('tab-panel-' + t);
        if (t === tabId) {
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
          panel.classList.add('active');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
          panel.classList.remove('active');
        }
      });

      // Trigger resize event for React Flow & Recharts
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
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
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No requests recorded yet</td></tr>';
        return;
      }

      tbody.innerHTML = requests.map(req => {
        const provKey = (req.provider || '').toLowerCase();
        const iconSrc = providerIconMap[provKey] || '';
        const inTokens = fmtNumber(req.promptTokens || 0);
        const outTokens = fmtNumber(req.completionTokens || 0);

        return \`
          <tr>
            <td>
              <div class="model-cell">
                \${iconSrc ? \`<img src="\${iconSrc}" class="model-icon" alt="" />\` : '<span class="codicon codicon-symbol-misc" style="font-size: 13px;"></span>'}
                <span title="\${req.model}">\${req.model || 'Unknown'}</span>
              </div>
            </td>
            <td>
              <span class="tokens-badge">\${inTokens} <span style="color: var(--text-muted);">/</span> \${outTokens}</span>
            </td>
            <td class="time-cell">\${timeAgo(req.timestamp)}</td>
          </tr>
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
