import { UsageStreamData } from '../dataProvider';

export function getUsageWebviewHtml(
  initialUsage: UsageStreamData,
  providerIconMap: Record<string, string>,
  codiconCssUri: string
): string {
  const initialUsageJson = JSON.stringify(initialUsage || { recentRequests: [], activeRequests: [], byProvider: {} });
  const iconMapJson = JSON.stringify(providerIconMap);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usage</title>
  <link rel="stylesheet" href="${codiconCssUri}">
  <style>
    :root {
      --bg: var(--vscode-sideBar-background);
      --fg: var(--vscode-sideBar-foreground);
      --hover-bg: var(--vscode-list-hoverBackground);
      --text-muted: var(--vscode-descriptionForeground);
      --border: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.22));
      --sec-header-bg: var(--vscode-sideBarSectionHeader-background, transparent);
      --sec-border: var(--vscode-sideBarSectionHeader-border, rgba(128, 128, 128, 0.18));
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
      border-bottom: 1px solid var(--sec-border);
      background: transparent;
      flex-shrink: 0;
    }

    .tabs-left {
      display: flex;
      gap: 2px;
    }

    .usage-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 8px 6px 8px;
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

    /* Topology Canvas */
    .topology-canvas-wrap {
      width: 100%;
      height: 100%;
      position: relative;
      background-color: transparent;
      background-image: radial-gradient(circle, rgba(128, 128, 128, 0.18) 1px, transparent 1px);
      background-size: 16px 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .topology-svg {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    .wire-idle {
      stroke: var(--border);
      stroke-width: 1.2;
      stroke-opacity: 0.35;
      fill: none;
    }

    .graph-node {
      position: absolute;
      transform: translate(-50%, -50%);
      padding: 4px 8px;
      border-radius: 8px;
      background: var(--vscode-dropdown-background, rgba(30, 30, 30, 0.9));
      border: 1.5px solid var(--border);
      font-size: 11px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      cursor: default;
      transition: all 0.25s ease;
      white-space: nowrap;
      z-index: 5;
    }

    .graph-node.center {
      border: 2px solid #eab308;
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(6, 182, 212, 0.2));
      color: #fde047;
      box-shadow: 0 0 16px rgba(234, 179, 8, 0.35);
      font-weight: 700;
      font-size: 11.5px;
      z-index: 10;
      padding: 5px 10px;
    }

    .graph-node.active-pulse {
      border-color: #22d3ee !important;
      box-shadow: 0 0 16px rgba(34, 211, 238, 0.6) !important;
      color: #22d3ee;
      transform: translate(-50%, -50%) scale(1.05);
    }

    .node-ping-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #22c55e;
      box-shadow: 0 0 6px #22c55e;
    }

    .provider-logo-img {
      width: 15px;
      height: 15px;
      object-fit: contain;
      border-radius: 2px;
      flex-shrink: 0;
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
      background: var(--sec-header-bg);
      border-bottom: 1px solid var(--sec-border);
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
        <span>Graph</span>
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
    <!-- TAB 1: Live Interactive Topology Graph -->
    <div class="usage-tab-pane active" id="pane-graph">
      <div class="topology-canvas-wrap" id="topology-container">
        <svg class="topology-svg" id="topology-svg">
          <defs id="topology-defs"></defs>
          <g id="topology-edges-layer"></g>
        </svg>
        <div id="topology-nodes"></div>
      </div>
    </div>

    <!-- TAB 2: Live Real-Time Recent Requests Table -->
    <div class="usage-tab-pane" id="pane-recent">
      <div class="recent-table-wrap">
        <div class="recent-table-header">
          <span class="col-model">Model</span>
          <span class="col-tokens">In / Out</span>
          <span class="col-time">When</span>
        </div>
        <div class="recent-list" id="recent-requests-list">
          <!-- Populated via SSE stream -->
        </div>
      </div>
    </div>
  </div>

  <script>
    const iconMap = ${iconMapJson};
    let initialUsage = ${initialUsageJson};
    let currentUsageTab = 'graph';

    function switchUsageTab(tabName) {
      currentUsageTab = tabName;
      document.getElementById('tab-btn-graph').classList.toggle('active', tabName === 'graph');
      document.getElementById('tab-btn-recent').classList.toggle('active', tabName === 'recent');
      document.getElementById('pane-graph').classList.toggle('active', tabName === 'graph');
      document.getElementById('pane-recent').classList.toggle('active', tabName === 'recent');

      if (tabName === 'graph') {
        setTimeout(initTopology, 40);
      }
    }

    function formatProviderName(provider) {
      const p = (provider || '').toLowerCase();
      if (p === 'antigravity') return 'Antigravity';
      if (p === 'claude') return 'Claude Code';
      if (p === 'deepseek') return 'DeepSeek';
      if (p === 'azure') return 'Azure OpenAI';
      if (p === 'kiro') return 'Kiro AI';
      if (p === 'codex') return 'Codex';
      if (p === 'mimo') return 'MiMo Free';
      if (p === 'opencode') return 'OpenCode Free';
      return provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Provider';
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

    /* ================= 1:1 LIVE TOPOLOGY GRAPH COMPONENT ================= */
    let activeProvidersSet = new Set();
    const activeTimeouts = {};

    function initTopology() {
      const container = document.getElementById('topology-container');
      const defs = document.getElementById('topology-defs');
      const edgesLayer = document.getElementById('topology-edges-layer');
      const nodesBox = document.getElementById('topology-nodes');
      if (!container || !edgesLayer || !nodesBox) return;

      const w = container.clientWidth || 320;
      const h = container.clientHeight || 240;
      const cx = w / 2;
      const cy = h / 2;

      edgesLayer.innerHTML = '';
      nodesBox.innerHTML = '';

      // Central 9Router Node
      const centerNode = document.createElement('div');
      centerNode.className = 'graph-node center' + (activeProvidersSet.size > 0 ? ' active-pulse' : '');
      centerNode.style.left = cx + 'px';
      centerNode.style.top = cy + 'px';
      centerNode.innerHTML = \`
        <span>🦊 9Router</span>
        \${activeProvidersSet.size > 0 ? '<span class="node-ping-dot"></span>' : ''}
      \`;
      nodesBox.appendChild(centerNode);

      // Connected providers
      const providerKeys = ['antigravity', 'claude', 'deepseek', 'azure', 'mimo', 'opencode'];
      const count = providerKeys.length;
      const rx = Math.max(90, Math.min(w * 0.40, 135));
      const ry = Math.max(65, Math.min(h * 0.38, 85));

      providerKeys.forEach((key, idx) => {
        const angle = (idx * (2 * Math.PI / count)) - (Math.PI / 2);
        const px = cx + rx * Math.cos(angle);
        const py = cy + ry * Math.sin(angle);

        const isActive = activeProvidersSet.has(key);

        const n = document.createElement('div');
        n.className = 'graph-node' + (isActive ? ' active-pulse' : '');
        n.id = 'gnode-' + key;
        n.style.left = px + 'px';
        n.style.top = py + 'px';

        const logoHtml = getProviderIconHtml(key);
        const name = formatProviderName(key).split(' ')[0];
        n.innerHTML = \`
          \${logoHtml}
          <span>\${name}</span>
          \${isActive ? '<span class="node-ping-dot"></span>' : ''}
        \`;
        nodesBox.appendChild(n);

        const dx = px - cx;
        const dy = py - cy;
        const cx1 = cx + dx * 0.45;
        const cy1 = cy;
        const cx2 = cx + dx * 0.55;
        const cy2 = py;
        const pathData = \`M \${cx} \${cy} C \${cx1} \${cy1}, \${cx2} \${cy2}, \${px} \${py}\`;

        if (isActive) {
          const filterId = 'topo-filter-' + key;
          if (!document.getElementById(filterId)) {
            const f = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            f.id = filterId;
            f.setAttribute('x', '-40%');
            f.setAttribute('y', '-40%');
            f.setAttribute('width', '180%');
            f.setAttribute('height', '180%');
            f.innerHTML = \`
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="noise">
                <animate attributeName="baseFrequency" values="0.8;1.4;0.8" dur="0.25s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
            \`;
            defs.appendChild(f);
          }

          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.id = 'edge-g-' + key;
          g.innerHTML = \`
            <path d="\${pathData}" fill="none" stroke="#22d3ee" stroke-width="7" stroke-opacity="0.35" stroke-linecap="round" filter="url(#\${filterId})" />
            <path d="\${pathData}" fill="none" stroke="#4ade80" stroke-width="3" stroke-opacity="0.85" stroke-linecap="round" filter="url(#\${filterId})" />
            <path d="\${pathData}" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.95" />
            <circle r="3.2" fill="#fde047" opacity="0.95" style="filter: drop-shadow(0 0 4px #22d3ee)">
              <animateMotion dur="0.55s" repeatCount="indefinite" path="\${pathData}" />
            </circle>
            <circle r="2.2" fill="#67e8f9" opacity="0.95" style="filter: drop-shadow(0 0 4px #22d3ee)">
              <animateMotion dur="0.75s" repeatCount="indefinite" path="\${pathData}" begin="0.18s" />
            </circle>
          \`;
          edgesLayer.appendChild(g);
        } else {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', pathData);
          path.setAttribute('class', 'wire-idle');
          path.id = 'gwire-' + key;
          edgesLayer.appendChild(path);
        }
      });
    }

    function triggerProviderActive(provKey) {
      if (!provKey) return;
      const k = provKey.toLowerCase();

      activeProvidersSet.add(k);
      if (activeTimeouts[k]) {
        clearTimeout(activeTimeouts[k]);
      }

      if (currentUsageTab === 'graph') {
        initTopology();
      }

      activeTimeouts[k] = setTimeout(() => {
        activeProvidersSet.delete(k);
        if (currentUsageTab === 'graph') {
          initTopology();
        }
      }, 7000);
    }

    /* ================= RECENT REQUESTS TABLE ================= */
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
        
        if (streamData.activeRequests && streamData.activeRequests.length > 0) {
          streamData.activeRequests.forEach(req => {
            if (req.provider) {
              triggerProviderActive(req.provider);
            }
          });
        }

        if (streamData.recentRequests && streamData.recentRequests.length > 0) {
          renderRecentRequests(streamData.recentRequests);
          const latest = streamData.recentRequests[0];
          if (latest && latest.provider) {
            triggerProviderActive(latest.provider);
          }
        }
      }
    });

    window.addEventListener('resize', () => {
      if (currentUsageTab === 'graph') {
        initTopology();
      }
    });

    // Initial renders
    initTopology();
    if (initialUsage && initialUsage.recentRequests) {
      renderRecentRequests(initialUsage.recentRequests);
      if (initialUsage.recentRequests[0]) {
        triggerProviderActive(initialUsage.recentRequests[0].provider);
      }
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
