"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGraphHtml = getGraphHtml;
function getGraphHtml(stats, isSidebar = false) {
    const providersJson = JSON.stringify(stats.providers);
    const activeId = stats.activeProviderId || (stats.providers[0]?.id || '');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>9Router Topology</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background, #1e1e1e);
      --fg: var(--vscode-editor-foreground, #cccccc);
      --border: var(--vscode-panel-border, rgba(128, 128, 128, 0.25));
      --card-bg: var(--vscode-editorWidget-background, #252526);
      --card-border: var(--vscode-editorWidget-border, rgba(128, 128, 128, 0.3));
      --badge-bg: var(--vscode-badge-background, #4d4d4d);
      --badge-fg: var(--vscode-badge-foreground, #ffffff);
      --btn-bg: var(--vscode-button-background, #0e639c);
      --btn-fg: var(--vscode-button-foreground, #ffffff);
      --btn-hover: var(--vscode-button-hoverBackground, #1177bb);
      --btn-sec-bg: var(--vscode-button-secondaryBackground, #3a3d41);
      --btn-sec-fg: var(--vscode-button-secondaryForeground, #ffffff);
      --accent: var(--vscode-charts-orange, #f97316);
      --accent-glow: rgba(249, 115, 22, 0.45);
      --green: var(--vscode-charts-green, #388a34);
      --cyan: var(--vscode-charts-blue, #3794ff);
      --font: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
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
      font-size: var(--vscode-font-size, 13px);
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Native VS Code Header Toolbar */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 14px;
      background: var(--vscode-editorGroupHeader-tabsBackground, #252526);
      border-bottom: 1px solid var(--border);
      z-index: 20;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      background: rgba(56, 138, 52, 0.2);
      color: #4ec9b0;
      border: 1px solid rgba(78, 201, 176, 0.3);
    }

    .status-pill.offline {
      background: rgba(244, 135, 113, 0.2);
      color: #f48771;
      border-color: rgba(244, 135, 113, 0.3);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .metrics-group {
      display: flex;
      gap: 16px;
      font-size: 11px;
    }

    .metric-col {
      display: flex;
      flex-direction: column;
    }

    .metric-title {
      color: var(--vscode-descriptionForeground, #858585);
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-val {
      font-weight: 600;
      color: var(--vscode-textLink-foreground, #3794ff);
    }

    .btn-group {
      display: flex;
      gap: 6px;
    }

    button.vscode-btn {
      background: var(--btn-sec-bg);
      color: var(--btn-sec-fg);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: 3px;
      font-size: 11px;
      font-family: inherit;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: background 0.1s ease;
    }

    button.vscode-btn:hover {
      background: var(--btn-hover);
      color: var(--btn-fg);
      border-color: transparent;
    }

    button.vscode-btn.primary {
      background: var(--btn-bg);
      color: var(--btn-fg);
      border: none;
    }

    /* Native Canvas Viewport */
    .canvas-box {
      position: relative;
      flex: 1;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-image: 
        radial-gradient(circle at 1px 1px, var(--vscode-editorRuler-foreground, rgba(255, 255, 255, 0.05)) 1px, transparent 0);
      background-size: 20px 20px;
      cursor: grab;
    }

    .canvas-box:active {
      cursor: grabbing;
    }

    .viewport {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform-origin: center center;
    }

    svg.links-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .wire-idle {
      stroke: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.2));
      stroke-width: 1.5;
      fill: none;
    }

    .wire-active {
      stroke: var(--accent);
      stroke-width: 3;
      fill: none;
      filter: drop-shadow(0 0 6px var(--accent-glow));
      stroke-dasharray: 6 5;
      animation: wireStream 1.5s linear infinite;
    }

    .wire-pulse {
      stroke: #3794ff;
      stroke-width: 4;
      fill: none;
      filter: drop-shadow(0 0 10px #3794ff);
      stroke-dasharray: 15 60;
      animation: packetFlow 0.9s ease-out infinite;
    }

    @keyframes wireStream {
      from { stroke-dashoffset: 22; }
      to { stroke-dashoffset: 0; }
    }

    @keyframes packetFlow {
      0% { stroke-dashoffset: 75; opacity: 0; }
      50% { opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: 0.1; }
    }

    /* Nodes Layout (VS Code Native Card Style) */
    .nodes-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 5;
    }

    .card-node {
      position: absolute;
      transform: translate(-50%, -50%);
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 10px 14px;
      min-width: 180px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .card-node:hover {
      border-color: var(--vscode-focusBorder, #007fd4);
    }

    /* 9Router Central Gateway */
    .card-node-center {
      background: var(--vscode-editorWidget-background, #252526);
      border: 1.5px solid var(--accent);
      box-shadow: 0 0 16px var(--accent-glow), 0 4px 16px rgba(0, 0, 0, 0.4);
      min-width: 210px;
      text-align: center;
      z-index: 10;
    }

    .card-node-center .node-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--vscode-editor-foreground, #ffffff);
    }

    .card-node-center .node-subtext {
      font-size: 10px;
      color: var(--accent);
      font-weight: 600;
      margin-top: 1px;
    }

    /* Provider Nodes */
    .card-node-provider.active {
      border: 1.5px solid var(--accent);
      box-shadow: 0 0 14px var(--accent-glow);
    }

    .node-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .node-title-box {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .node-icon-box {
      width: 20px;
      height: 20px;
      border-radius: 3px;
      background: var(--vscode-badge-background, #3a3d41);
      color: var(--vscode-badge-foreground, #fff);
      font-size: 10px;
      font-weight: bold;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .node-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--vscode-foreground, #cccccc);
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .node-pill {
      font-size: 9px;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 3px;
      text-transform: uppercase;
    }

    .pill-active { background: rgba(249, 115, 22, 0.2); color: var(--accent); border: 1px solid rgba(249, 115, 22, 0.4); }
    .pill-online { background: rgba(56, 138, 52, 0.2); color: #4ec9b0; border: 1px solid rgba(78, 201, 176, 0.3); }
    .pill-idle { background: rgba(128, 128, 128, 0.15); color: #858585; border: 1px solid rgba(128, 128, 128, 0.25); }

    .node-body {
      font-size: 10px;
      color: var(--vscode-descriptionForeground, #858585);
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px solid var(--border);
    }

    /* Bottom Control Bar */
    .viewport-dock {
      position: absolute;
      bottom: 12px;
      left: 12px;
      display: flex;
      gap: 2px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 4px;
      padding: 2px;
      z-index: 20;
    }

    .dock-btn {
      background: transparent;
      border: none;
      color: var(--fg);
      width: 24px;
      height: 24px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dock-btn:hover {
      background: var(--vscode-toolbar-hoverBackground, rgba(128, 128, 128, 0.2));
    }

    /* Inspector Side Card */
    .inspector-card {
      position: absolute;
      top: 50px;
      right: 14px;
      width: 250px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      z-index: 20;
      font-size: 11px;
    }

    .inspector-card.hidden {
      display: none;
    }

    .model-tag {
      display: inline-block;
      background: var(--vscode-badge-background, #3a3d41);
      color: var(--vscode-badge-foreground, #fff);
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 9px;
      margin: 2px 2px 2px 0;
      font-family: var(--vscode-editor-font-family, monospace);
    }
  </style>
</head>
<body>

  <!-- Native Toolbar -->
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="status-pill ${stats.online ? '' : 'offline'}">
        <span class="status-dot"></span>
        <span>${stats.online ? '9Router Online' : '9Router Offline'}</span>
      </div>
      <span style="font-size: 11px; color: var(--vscode-descriptionForeground); font-family: monospace;">
        ${stats.serverUrl}
      </span>
    </div>

    <div class="metrics-group">
      <div class="metric-col">
        <span class="metric-title">Today Requests</span>
        <span class="metric-val">${stats.todayRequests.toLocaleString()}</span>
      </div>
      <div class="metric-col">
        <span class="metric-title">Today Tokens</span>
        <span class="metric-val">${(stats.todayTokens / 1_000_000).toFixed(1)}M</span>
      </div>
      <div class="metric-col">
        <span class="metric-title">Active Models</span>
        <span class="metric-val">${stats.providers.reduce((acc, p) => acc + p.modelsCount, 0)} Models</span>
      </div>
    </div>

    <div class="btn-group">
      <button class="vscode-btn primary" id="btn-ping" title="Trigger active route test signal">
        ⚡ Pulse Active Route
      </button>
      <button class="vscode-btn" id="btn-refresh" title="Refresh metrics">
        ↻ Refresh
      </button>
      <button class="vscode-btn" id="btn-web" title="Open Web Dashboard">
        ↗ Web
      </button>
    </div>
  </div>

  <!-- Canvas -->
  <div class="canvas-box" id="canvas-box">
    <div class="viewport" id="viewport">
      <svg class="links-layer" id="links-svg"></svg>
      <div class="nodes-container" id="nodes-container">
        <!-- 9Router Gateway -->
        <div class="card-node card-node-center" id="node-center">
          <div class="node-name">🦊 9Router Gateway</div>
          <div class="node-subtext">SMART REVERSE PROXY</div>
          <div style="font-size: 10px; color: var(--vscode-descriptionForeground); margin-top: 3px;">
            Port :20128 • RTK Compression
          </div>
        </div>
      </div>
    </div>

    <!-- Dock Controls -->
    <div class="viewport-dock">
      <button class="dock-btn" id="btn-plus" title="Zoom In">+</button>
      <button class="dock-btn" id="btn-minus" title="Zoom Out">−</button>
      <button class="dock-btn" id="btn-reset" title="Reset View">1:1</button>
      <button class="dock-btn" id="btn-inspect-toggle" title="Toggle Inspector">ℹ</button>
    </div>

    <!-- Inspector Panel -->
    <div class="inspector-card" id="inspector-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-weight: 700; font-size: 12px;" id="ins-name">Provider Details</span>
        <span class="node-pill pill-active" id="ins-status">ACTIVE</span>
      </div>
      <div style="color: var(--vscode-descriptionForeground); margin-bottom: 8px;" id="ins-sub">
        harvan.nurluthfi@gmail.com
      </div>
      <div style="margin-bottom: 8px; font-size: 10px;">
        <div style="color: var(--vscode-descriptionForeground);">TRAFFIC & VOLUME</div>
        <div style="font-weight: 600; color: var(--vscode-textLink-foreground);" id="ins-stats">1,420 reqs • 420.5M tokens</div>
      </div>
      <div>
        <div style="color: var(--vscode-descriptionForeground); margin-bottom: 3px;">CONFIGURED MODELS</div>
        <div id="ins-models"></div>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const providers = ${providersJson};
    let activeId = "${activeId}";
    let scale = 1.0;
    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let startX, startY;

    const box = document.getElementById('canvas-box');
    const viewport = document.getElementById('viewport');
    const svgLayer = document.getElementById('links-svg');
    const nodesLayer = document.getElementById('nodes-container');
    const centerNode = document.getElementById('node-center');

    function renderTopology() {
      const w = box.clientWidth || window.innerWidth;
      const h = box.clientHeight || (window.innerHeight - 45);

      const cx = w / 2;
      const cy = h / 2;

      centerNode.style.left = cx + 'px';
      centerNode.style.top = cy + 'px';

      document.querySelectorAll('.card-node-provider').forEach(el => el.remove());
      svgLayer.innerHTML = '';

      const count = providers.length;
      const rx = Math.min(w * 0.35, 300);
      const ry = Math.min(h * 0.35, 200);

      providers.forEach((p, idx) => {
        const angle = (idx * (2 * Math.PI / count)) - (Math.PI / 2);
        const px = cx + rx * Math.cos(angle);
        const py = cy + ry * Math.sin(angle);

        const el = document.createElement('div');
        el.className = 'card-node card-node-provider' + (p.id === activeId ? ' active' : '');
        el.id = 'pnode-' + p.id;
        el.style.left = px + 'px';
        el.style.top = py + 'px';

        const isCurrent = p.id === activeId;
        const pillClass = isCurrent ? 'pill-active' : (p.status === 'online' ? 'pill-online' : 'pill-idle');

        el.innerHTML = \`
          <div class="node-top">
            <div class="node-title-box">
              <span class="node-icon-box">\${p.provider.substring(0, 2).toUpperCase()}</span>
              <span class="node-name">\${p.name}</span>
            </div>
            <span class="node-pill \${pillClass}">\${isCurrent ? 'ACTIVE' : p.status.toUpperCase()}</span>
          </div>
          <div class="node-body">
            <span>#Prio \${p.priority} • \${p.modelsCount} models</span>
            <span>\${(p.promptTokens / 1_000_000).toFixed(1)}M tok</span>
          </div>
        \`;

        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          selectNode(p.id);
        });

        nodesLayer.appendChild(el);
        drawLink(cx, cy, px, py, isCurrent, p.id);
      });

      updateInspector();
    }

    function drawLink(x1, y1, x2, y2, isActive, id) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const cx1 = x1 + dx * 0.45;
      const cy1 = y1;
      const cx2 = x1 + dx * 0.55;
      const cy2 = y2;
      const d = \`M \${x1} \${y1} C \${cx1} \${cy1}, \${cx2} \${cy2}, \${x2} \${y2}\`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', isActive ? 'wire-active' : 'wire-idle');
      path.id = 'wire-' + id;
      svgLayer.appendChild(path);

      if (isActive) {
        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pulse.setAttribute('d', d);
        pulse.setAttribute('class', 'wire-pulse');
        pulse.id = 'wire-pulse-' + id;
        svgLayer.appendChild(pulse);
      }
    }

    function selectNode(id) {
      activeId = id;
      document.querySelectorAll('.card-node-provider').forEach(el => {
        const isSel = el.id === 'pnode-' + id;
        el.classList.toggle('active', isSel);
        const pill = el.querySelector('.node-pill');
        if (pill) {
          pill.className = 'node-pill ' + (isSel ? 'pill-active' : 'pill-online');
          pill.textContent = isSel ? 'ACTIVE' : 'ONLINE';
        }
      });

      renderTopology();
    }

    function updateInspector() {
      const p = providers.find(x => x.id === activeId) || providers[0];
      if (!p) return;

      document.getElementById('ins-name').textContent = p.name;
      document.getElementById('ins-sub').textContent = p.email || (p.provider.toUpperCase() + ' Connection');
      document.getElementById('ins-stats').textContent = \`\${p.requestsCount.toLocaleString()} reqs • \${((p.promptTokens + p.completionTokens)/1_000_000).toFixed(1)}M tokens\`;
      
      const badge = document.getElementById('ins-status');
      badge.className = 'node-pill ' + (p.id === activeId ? 'pill-active' : 'pill-online');
      badge.textContent = p.id === activeId ? 'ACTIVE ROUTE' : p.status.toUpperCase();

      const modelsBox = document.getElementById('ins-models');
      modelsBox.innerHTML = '';
      (p.models || []).forEach(m => {
        const t = document.createElement('span');
        t.className = 'model-tag';
        t.textContent = m;
        modelsBox.appendChild(t);
      });
    }

    // Pan & Zoom
    box.addEventListener('mousedown', (e) => {
      isPanning = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      applyView();
    });

    window.addEventListener('mouseup', () => { isPanning = false; });

    box.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      scale = Math.min(Math.max(0.5, scale * factor), 2.2);
      applyView();
    });

    function applyView() {
      viewport.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${scale})\`;
    }

    document.getElementById('btn-plus').addEventListener('click', () => {
      scale = Math.min(2.2, scale * 1.2);
      applyView();
    });

    document.getElementById('btn-minus').addEventListener('click', () => {
      scale = Math.max(0.5, scale * 0.8);
      applyView();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      scale = 1.0;
      panX = 0;
      panY = 0;
      applyView();
    });

    document.getElementById('btn-inspect-toggle').addEventListener('click', () => {
      document.getElementById('inspector-card').classList.toggle('hidden');
    });

    document.getElementById('btn-ping').addEventListener('click', () => {
      const p = document.getElementById('wire-pulse-' + activeId);
      if (p) {
        p.style.stroke = '#4ec9b0';
        p.style.filter = 'drop-shadow(0 0 14px #4ec9b0)';
        setTimeout(() => {
          p.style.stroke = '#3794ff';
          p.style.filter = 'drop-shadow(0 0 10px #3794ff)';
        }, 1000);
      }
      vscode.postMessage({ command: 'ping', providerId: activeId });
    });

    document.getElementById('btn-refresh').addEventListener('click', () => {
      vscode.postMessage({ command: 'refresh' });
    });

    document.getElementById('btn-web').addEventListener('click', () => {
      vscode.postMessage({ command: 'openWeb' });
    });

    window.addEventListener('resize', renderTopology);
    renderTopology();
  </script>
</body>
</html>`;
}
//# sourceMappingURL=graphView.js.map