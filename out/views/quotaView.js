"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuotaTrackerHtml = getQuotaTrackerHtml;
function getQuotaTrackerHtml(data) {
    const connectionsJson = JSON.stringify(data.connections);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>9Router Quota Tracker</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background, #18181b);
      --fg: var(--vscode-editor-foreground, #f4f4f5);
      --card-bg: var(--vscode-sideBar-background, #202023);
      --card-border: var(--vscode-panel-border, rgba(255, 255, 255, 0.08));
      --card-header-bg: rgba(255, 255, 255, 0.03);
      --meter-track: rgba(255, 255, 255, 0.08);
      --text-muted: var(--vscode-descriptionForeground, #a1a1aa);
      --font: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
      --accent: #f97316;
      --green: #22c55e;
      --yellow: #f59e0b;
      --red: #ef4444;
      --cyan: #06b6d4;
      --purple: #a855f7;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--fg);
      font-family: var(--font);
      font-size: 13px;
      line-height: 1.4;
      padding: 14px;
      overflow-y: auto;
    }

    /* Top Action Bar */
    .top-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--card-border);
    }

    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 9999px;
      background: rgba(34, 197, 94, 0.15);
      color: var(--green);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .status-indicator.offline {
      background: rgba(239, 68, 68, 0.15);
      color: var(--red);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .filters-bar {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .filter-btn {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      border: 1px solid var(--card-border);
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .filter-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .filter-btn.active {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
      font-weight: 600;
    }

    .btn-action-icon {
      background: rgba(255, 255, 255, 0.06);
      color: var(--fg);
      border: 1px solid var(--card-border);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: inherit;
      transition: all 0.15s ease;
    }

    .btn-action-icon:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.25);
    }

    /* Connection Accordion Card */
    .connection-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      transition: border-color 0.15s ease;
    }

    .connection-card:hover {
      border-color: rgba(255, 255, 255, 0.18);
    }

    .connection-card.active-prio {
      border-left: 3px solid var(--accent);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: var(--card-header-bg);
      cursor: pointer;
      user-select: none;
    }

    .card-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .provider-icon-badge {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .badge-antigravity { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .badge-claude { background: rgba(249, 115, 22, 0.15); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.3); }
    .badge-deepseek { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-azure { background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.3); }
    .badge-other { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }

    .account-title-box {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .account-name {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .account-sub {
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .prio-tag {
      background: rgba(255, 255, 255, 0.08);
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 700;
    }

    .card-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .btn-card-action {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      padding: 3px 6px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      transition: all 0.12s ease;
    }

    .btn-card-action:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border-color: var(--card-border);
    }

    .chevron-icon {
      font-size: 10px;
      color: var(--text-muted);
      transition: transform 0.2s ease;
      margin-left: 4px;
    }

    .chevron-icon.expanded {
      transform: rotate(180deg);
    }

    /* Accordion Body & Quota Grid */
    .card-body {
      padding: 12px 14px;
      border-top: 1px solid var(--card-border);
      display: block;
    }

    .card-body.collapsed {
      display: none;
    }

    .quotas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
    }

    .quota-item {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 6px;
      padding: 8px 10px;
    }

    .quota-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }

    .quota-name {
      font-size: 11.5px;
      font-weight: 600;
      color: #e4e4e7;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 160px;
    }

    .quota-val {
      font-size: 11px;
      font-weight: 700;
      font-family: monospace;
      color: #fff;
    }

    .progress-track {
      width: 100%;
      height: 6px;
      background: var(--meter-track);
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 5px;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    .progress-fill.green { background: linear-gradient(90deg, #10b981, #22c55e); }
    .progress-fill.yellow { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .progress-fill.red { background: linear-gradient(90deg, #ef4444, #f87171); }

    .quota-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: var(--text-muted);
    }

    .reset-timer {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      color: #38bdf8;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 30px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>

  <!-- Top Toolbar -->
  <div class="top-toolbar">
    <div style="display: flex; align-items: center; gap: 10px;">
      <div class="status-indicator ${data.online ? '' : 'offline'}">
        <span class="status-dot"></span>
        <span>${data.online ? '9Router Online' : '9Router Offline'}</span>
      </div>
      <span style="font-size: 11px; color: var(--text-muted); font-family: monospace;">
        ${data.serverUrl}
      </span>
    </div>

    <div style="display: flex; gap: 8px;">
      <button class="btn-action-icon" id="btn-refresh-all" title="Refresh all quotas">
        ↻ Refresh All
      </button>
      <button class="btn-action-icon" id="btn-open-web" title="Open 9Router Web Dashboard">
        ↗ Web Dashboard
      </button>
    </div>
  </div>

  <!-- Filter Buttons -->
  <div class="filters-bar" id="filters-bar" style="margin-bottom: 12px;">
    <button class="filter-btn active" data-filter="all">All (${data.connections.length})</button>
    <button class="filter-btn" data-filter="antigravity">Antigravity</button>
    <button class="filter-btn" data-filter="claude">Claude Code</button>
    <button class="filter-btn" data-filter="deepseek">DeepSeek</button>
    <button class="filter-btn" data-filter="azure">Azure</button>
  </div>

  <!-- Connection Accordion List -->
  <div id="connections-container">
    <!-- Populated by JS -->
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const connections = ${connectionsJson};
    let currentFilter = 'all';
    const collapsedMap = {};

    function getProviderBadgeClass(provider) {
      const p = (provider || '').toLowerCase();
      if (p.includes('antigravity')) return 'badge-antigravity';
      if (p.includes('claude')) return 'badge-claude';
      if (p.includes('deepseek')) return 'badge-deepseek';
      if (p.includes('azure')) return 'badge-azure';
      return 'badge-other';
    }

    function formatCountdown(resetAtStr) {
      if (!resetAtStr) return 'No reset time';
      const resetTime = new Date(resetAtStr).getTime();
      const now = Date.now();
      const diff = resetTime - now;

      if (diff <= 0) return 'Resetting now';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) return \`in \${days}d \${hours}h\`;
      if (hours > 0) return \`in \${hours}h \${mins}m\`;
      return \`in \${mins}m\`;
    }

    function renderConnections() {
      const container = document.getElementById('connections-container');
      container.innerHTML = '';

      const filtered = connections.filter(c => {
        if (currentFilter === 'all') return true;
        return (c.provider || '').toLowerCase().includes(currentFilter);
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No connections found for this filter.</div>';
        return;
      }

      filtered.forEach(c => {
        const isCollapsed = !!collapsedMap[c.id];
        const card = document.createElement('div');
        card.className = 'connection-card' + (c.isActive ? ' active-prio' : '');
        card.id = 'card-' + c.id;

        const badgeClass = getProviderBadgeClass(c.provider);
        const iconText = (c.provider || 'AI').substring(0, 2).toUpperCase();

        card.innerHTML = \`
          <div class="card-header" onclick="toggleAccordion('\${c.id}')">
            <div class="card-header-left">
              <div class="provider-icon-badge \${badgeClass}">\${iconText}</div>
              <div class="account-title-box">
                <span class="account-name">\${c.name}</span>
                <span class="account-sub">
                  <span>\${c.plan}</span>
                  <span class="prio-tag">#Prio \${c.priority}</span>
                  \${c.isActive ? '<span style="color: var(--green); font-weight: bold;">● Active</span>' : '<span style="color: var(--text-muted);">○ Idle</span>'}
                </span>
              </div>
            </div>

            <div class="card-header-actions" onclick="event.stopPropagation()">
              <button class="btn-card-action" onclick="testConn('\${c.id}')" title="Test Connection">
                ⚡ Test
              </button>
              <button class="btn-card-action" onclick="refreshConn('\${c.id}')" title="Refresh Quota">
                ↻
              </button>
              <span class="chevron-icon \${isCollapsed ? '' : 'expanded'}">▼</span>
            </div>
          </div>

          <div class="card-body \${isCollapsed ? 'collapsed' : ''}" id="body-\${c.id}">
            \${renderQuotas(c.quotas)}
          </div>
        \`;

        container.appendChild(card);
      });
    }

    function renderQuotas(quotas) {
      if (!quotas || quotas.length === 0) {
        return '<div style="font-size: 11px; color: var(--text-muted);">No quota buckets available for this connection.</div>';
      }

      let html = '<div class="quotas-grid">';
      quotas.forEach(q => {
        const pct = Math.min(100, Math.max(0, Math.round(q.remainingPercentage)));
        let colorClass = 'green';
        if (pct < 20) colorClass = 'red';
        else if (pct < 50) colorClass = 'yellow';

        const usedStr = q.unlimited ? 'Unlimited' : \`\${q.used}/\${q.total} (\${pct}%)\`;
        const resetStr = q.resetAt ? formatCountdown(q.resetAt) : 'Rolling';

        html += \`
          <div class="quota-item">
            <div class="quota-top">
              <span class="quota-name" title="\${q.displayName}">\${q.displayName}</span>
              <span class="quota-val">\${usedStr}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill \${colorClass}" style="width: \${pct}%;"></div>
            </div>
            <div class="quota-bottom">
              <span>Sisa: \${pct}%</span>
              <span class="reset-timer">🕒 \${resetStr}</span>
            </div>
          </div>
        \`;
      });
      html += '</div>';
      return html;
    }

    function toggleAccordion(id) {
      collapsedMap[id] = !collapsedMap[id];
      const body = document.getElementById('body-' + id);
      const card = document.getElementById('card-' + id);
      const chevron = card ? card.querySelector('.chevron-icon') : null;
      if (body) {
        body.classList.toggle('collapsed', collapsedMap[id]);
      }
      if (chevron) {
        chevron.classList.toggle('expanded', !collapsedMap[id]);
      }
    }

    function testConn(id) {
      vscode.postMessage({ command: 'test', connectionId: id });
    }

    function refreshConn(id) {
      vscode.postMessage({ command: 'refreshSingle', connectionId: id });
    }

    // Filter bar handling
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderConnections();
      });
    });

    document.getElementById('btn-refresh-all').addEventListener('click', () => {
      vscode.postMessage({ command: 'refresh' });
    });

    document.getElementById('btn-open-web').addEventListener('click', () => {
      vscode.postMessage({ command: 'openWeb' });
    });

    // Live countdown ticker every 10 seconds
    setInterval(() => {
      document.querySelectorAll('.reset-timer').forEach(el => {
        // Ticker update
      });
    }, 10000);

    renderConnections();
  </script>
</body>
</html>`;
}
//# sourceMappingURL=quotaView.js.map