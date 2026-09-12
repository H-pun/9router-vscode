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
      --bg: var(--vscode-sideBar-background);
      --fg: var(--vscode-sideBar-foreground);
      --hover-bg: var(--vscode-list-hoverBackground);
      --text-muted: var(--vscode-descriptionForeground);
      --border: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.22));
      --tab-active-border: var(--vscode-panelTitle-activeBorder, var(--vscode-charts-orange, #f97316));
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

    /* Sub-Tabs Header */
    .usage-tabs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4px;
      border-bottom: 1px solid var(--border);
      background: transparent;
      flex-shrink: 0;
      height: 26px;
    }

    .tabs-left {
      display: flex;
      gap: 2px;
      height: 100%;
    }

    .usage-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0 7px;
      font-family: var(--font);
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: color 0.1s ease, border-color 0.1s ease;
      outline: none;
      height: 100%;
    }

    .usage-tab-btn:hover {
      color: var(--fg);
    }

    .usage-tab-btn.active {
      color: var(--fg);
      font-weight: 600;
      border-bottom-color: var(--tab-active-border);
    }

    .live-status {
      font-size: 9.5px;
      color: var(--green);
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding-right: 4px;
    }

    .live-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 4px var(--green);
    }

    /* Tab Panes */
    .tab-content-area {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .usage-tab-pane {
      display: none;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }

    .usage-tab-pane.active {
      display: block;
    }

    /* React Flow & Chart Container */
    #xyflow-root, #chart-root {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .react-flow__attribution {
      display: none !important;
    }

    /* Recent Requests Table */
    .recent-table-wrap {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg);
    }

    .recent-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      background: var(--vscode-sideBarSectionHeader-background, transparent);
      border-bottom: 1px solid var(--border);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    .col-model { flex: 1; min-width: 0; }
    .col-tokens { width: 100px; text-align: right; }
    .col-time { width: 60px; text-align: right; }

    .recent-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .recent-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      border-bottom: 1px solid rgba(128, 128, 128, 0.08);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      transition: background 0.08s ease;
    }

    .recent-row:hover {
      background: var(--hover-bg);
    }

    .model-cell {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
      flex: 1;
    }

    .provider-logo-img {
      width: 14px;
      height: 14px;
      object-fit: contain;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .recent-model-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--fg);
      font-size: 11px;
    }

    .tokens-cell {
      width: 100px;
      text-align: right;
      color: var(--text-muted);
      font-size: 10.5px;
      white-space: nowrap;
    }

    .tokens-in { color: var(--fg); font-weight: 500; }
    .tokens-out { color: var(--text-muted); }

    .time-cell {
      width: 60px;
      text-align: right;
      color: var(--blue);
      font-size: 10.5px;
      white-space: nowrap;
    }

    .empty-msg {
      padding: 10px 14px;
      font-size: 11px;
      color: var(--text-muted);
      font-style: italic;
      text-align: center;
    }

    .codicon {
      font-size: 14px;
      line-height: 1;
    }
  </style>
</head>
<body>

  <!-- Sub-Tabs Header -->
  <div class="usage-tabs-header">
    <div class="tabs-left">
      <button type="button" class="usage-tab-btn active" id="tab-btn-graph" onclick="switchUsageTab('graph')">
        <i class="codicon codicon-graph"></i>
        <span>Topology</span>
      </button>
      <button type="button" class="usage-tab-btn" id="tab-btn-chart" onclick="switchUsageTab('chart')">
        <i class="codicon codicon-pulse"></i>
        <span>Activity</span>
      </button>
      <button type="button" class="usage-tab-btn" id="tab-btn-recent" onclick="switchUsageTab('recent')">
        <i class="codicon codicon-history"></i>
        <span>Recent Requests</span>
      </button>
    </div>
    <div class="live-status">
      <span class="live-dot"></span>
      Live
    </div>
  </div>

  <!-- Content Area -->
  <div class="tab-content-area">
    <!-- TAB 1: 1:1 React Flow Topology Canvas -->
    <div class="usage-tab-pane active" id="pane-graph">
      <div id="xyflow-root"></div>
    </div>

    <!-- TAB 2: 1:1 Recharts Usage Area Chart (Activity) -->
    <div class="usage-tab-pane" id="pane-chart">
      <div id="chart-root"></div>
    </div>

    <!-- TAB 3: Recent Requests Table -->
    <div class="usage-tab-pane" id="pane-recent">
      <div class="recent-table-wrap">
        <div class="recent-table-header">
          <span class="col-model">Model</span>
          <span class="col-tokens">In / Out</span>
          <span class="col-time">When</span>
        </div>
        <div class="recent-list" id="recent-requests-list"></div>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    window.__VSCODE__ = vscode;
    window.__ICON_MAP__ = ${iconMapJson};
    window.__INITIAL_USAGE__ = ${initialUsageJson};
    window.__TOPOLOGY_PROVIDERS__ = ${topologyProvidersJson};
    window.__INITIAL_CHART_DATA__ = ${initialChartJson};
  </script>

  <!-- Load 1:1 @xyflow/react & Recharts Bundle -->
  <script src="${topologyFlowJsUri}"></script>

  <script>
    const iconMap = ${iconMapJson};
    let initialUsage = ${initialUsageJson};
    let currentUsageTab = 'graph';

    function switchUsageTab(tabName) {
      currentUsageTab = tabName;
      document.getElementById('tab-btn-graph').classList.toggle('active', tabName === 'graph');
      document.getElementById('tab-btn-chart').classList.toggle('active', tabName === 'chart');
      document.getElementById('tab-btn-recent').classList.toggle('active', tabName === 'recent');

      document.getElementById('pane-graph').classList.toggle('active', tabName === 'graph');
      document.getElementById('pane-chart').classList.toggle('active', tabName === 'chart');
      document.getElementById('pane-recent').classList.toggle('active', tabName === 'recent');

      if (tabName === 'chart') {
        window.dispatchEvent(new Event('resize'));
      }
    }

    function formatRelativeTime(timestamp) {
      if (!timestamp) return '-';
      const time = new Date(timestamp).getTime();
      const diffSec = Math.floor((Date.now() - time) / 1000);
      if (diffSec < 15) return 'Just now';
      if (diffSec < 60) return \`\${diffSec}s ago\`;
      const mins = Math.floor(diffSec / 60);
      if (mins < 60) return \`\${mins}m ago\`;
      const hours = Math.floor(mins / 60);
      return \`\${hours}h ago\`;
    }

    function formatTokensNumber(num) {
      if (!num || num === 0) return '0';
      if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'm';
      if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
      return String(num);
    }

    function getProviderIconHtml(provKey) {
      const src = iconMap[provKey] || iconMap[provKey.toLowerCase()];
      if (src) {
        return \`<img class="provider-logo-img" src="\${src}" alt="\${provKey}" />\`;
      }
      return '<i class="codicon codicon-hubot"></i>';
    }

    function renderRecentRequests(requests) {
      const list = document.getElementById('recent-requests-list');
      if (!list) return;

      if (!requests || requests.length === 0) {
        list.innerHTML = '<div class="empty-msg">No recent request logs.</div>';
        return;
      }

      let html = '';
      requests.slice(0, 30).forEach(r => {
        const provKey = (r.provider || 'ai').toLowerCase();
        const logo = getProviderIconHtml(provKey);
        const inTok = formatTokensNumber(r.promptTokens);
        const outTok = formatTokensNumber(r.completionTokens);
        const when = formatRelativeTime(r.timestamp);

        html += \`
          <div class="recent-row">
            <div class="model-cell">
              \${logo}
              <span class="recent-model-name" title="\${r.model}">\${r.model}</span>
            </div>
            <div class="tokens-cell">
              <span class="tokens-in">\${inTok}</span>
              <span style="opacity: 0.5;"> / </span>
              <span class="tokens-out">\${outTok}</span>
            </div>
            <div class="time-cell">\${when}</div>
          </div>
        \`;
      });

      list.innerHTML = html;
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg && msg.type === 'usageStream' && msg.data) {
        const streamData = msg.data;
        if (streamData.recentRequests && streamData.recentRequests.length > 0) {
          renderRecentRequests(streamData.recentRequests);
        }
      }
    });

    if (initialUsage && initialUsage.recentRequests) {
      renderRecentRequests(initialUsage.recentRequests);
    }

    setInterval(() => {
      if (initialUsage && initialUsage.recentRequests) {
        renderRecentRequests(initialUsage.recentRequests);
      }
    }, 10000);
  </script>
</body>
</html>`;
}
