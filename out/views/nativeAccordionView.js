"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNativeAccordionHtml = getNativeAccordionHtml;
function getNativeAccordionHtml(data, providerIconMap, codiconCssUri) {
    const connectionsJson = JSON.stringify(data.connections);
    const iconMapJson = JSON.stringify(providerIconMap);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>9Router</title>
  <link rel="stylesheet" href="${codiconCssUri}">
  <style>
    :root {
      /* 100% Dynamic VS Code Theme Tokens */
      --bg: var(--vscode-sideBar-background);
      --fg: var(--vscode-sideBar-foreground);
      --hover-bg: var(--vscode-list-hoverBackground);
      --btn-hover-bg: var(--vscode-toolbar-hoverBackground, var(--vscode-list-hoverBackground));
      --active-bg: var(--vscode-list-activeSelectionBackground);
      --active-fg: var(--vscode-list-activeSelectionForeground);
      --text-muted: var(--vscode-descriptionForeground);
      --border: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.22));
      --sec-header-bg: var(--vscode-sideBarSectionHeader-background, transparent);
      --sec-header-fg: var(--vscode-sideBarSectionHeader-foreground, var(--fg));
      --sec-border: var(--vscode-sideBarSectionHeader-border, rgba(128, 128, 128, 0.18));
      --dropdown-bg: var(--vscode-dropdown-background);
      --dropdown-fg: var(--vscode-dropdown-foreground);
      --dropdown-border: var(--vscode-dropdown-border, rgba(128, 128, 128, 0.3));
      --menu-bg: var(--vscode-menu-background, var(--vscode-dropdown-background, #252526));
      --menu-border: var(--vscode-menu-border, var(--vscode-dropdown-border, rgba(128, 128, 128, 0.25)));
      --menu-hover: var(--vscode-menu-selectionBackground, var(--vscode-list-hoverBackground, rgba(255, 255, 255, 0.08)));
      --focus-border: var(--vscode-focusBorder, #007fd4);
      --green: var(--vscode-charts-green, #388a34);
      --orange: var(--vscode-charts-orange, #d18616);
      --red: var(--vscode-charts-red, #f14c4c);
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
      overflow-x: hidden;
      overflow-y: auto;
    }

    /* Section Container */
    .section-box {
      margin-bottom: 0;
      position: relative;
    }

    /* Native Explorer Section Header */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 6px 3px 8px;
      background: var(--sec-header-bg);
      border-bottom: 1px solid var(--sec-border);
      border-top: 1px solid var(--sec-border);
      cursor: pointer;
      min-height: 24px;
      position: relative;
    }

    .section-box:first-child .section-header {
      border-top: none;
    }

    .section-header:hover {
      background: var(--hover-bg);
    }

    .section-left {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--sec-header-fg);
    }

    .section-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Custom VS Code Native Debug-Style Dropdown Menu */
    .custom-dropdown-wrap {
      position: relative;
      display: inline-block;
    }

    .custom-dropdown-trigger {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--dropdown-bg);
      color: var(--dropdown-fg);
      border: 1px solid var(--dropdown-border);
      border-radius: 3px;
      height: 22px;
      padding: 0 6px;
      font-family: var(--font);
      font-size: 11px;
      cursor: pointer;
      transition: border-color 0.1s ease, background 0.1s ease;
      outline: none;
    }

    .custom-dropdown-trigger:hover {
      background: var(--hover-bg);
      border-color: var(--focus-border);
    }

    .custom-dropdown-trigger:focus-visible {
      border-color: var(--focus-border);
      outline: 1px solid var(--focus-border);
      outline-offset: -1px;
    }

    .filter-trigger-label {
      font-weight: 500;
      white-space: nowrap;
    }

    .filter-trigger-arrow {
      font-size: 11px;
      color: var(--text-muted);
      transition: transform 0.15s ease;
      margin-left: 2px;
    }

    .custom-dropdown-wrap.open .filter-trigger-arrow {
      transform: rotate(180deg);
    }

    /* Floating Popup Menu (Anchored to Right Edge so it NEVER clips) */
    .custom-dropdown-menu {
      display: none;
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      left: auto;
      min-width: 155px;
      max-width: 200px;
      background: var(--menu-bg);
      color: var(--dropdown-fg);
      border: 1px solid var(--menu-border);
      border-radius: 5px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
      padding: 3px;
      z-index: 99999;
      animation: menuFadeIn 0.1s ease-out;
    }

    .custom-dropdown-wrap.open .custom-dropdown-menu {
      display: flex;
      flex-direction: column;
    }

    @keyframes menuFadeIn {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dropdown-menu-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 11.5px;
      cursor: pointer;
      color: var(--fg);
      text-align: left;
      transition: background 0.08s ease;
    }

    .dropdown-menu-item:hover {
      background: var(--menu-hover);
      color: #ffffff;
    }

    .item-check {
      width: 14px;
      height: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: var(--fg);
      opacity: 0;
      flex-shrink: 0;
    }

    .dropdown-menu-item.selected .item-check {
      opacity: 1;
    }

    .item-label {
      font-weight: 500;
      flex: 1;
      white-space: nowrap;
      text-align: left;
    }

    /* Native Explorer Action Button */
    .icon-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      width: 22px;
      height: 22px;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.08s, color 0.08s;
      font-size: 14px;
    }

    .icon-btn:hover {
      background: var(--btn-hover-bg);
      color: var(--fg);
    }

    .section-body {
      padding: 4px 0 6px 0;
    }

    .section-body.collapsed {
      display: none;
    }

    /* ================= LEVEL 1: PROVIDER GROUP ================= */
    .provider-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 3px;
    }

    .provider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 6px;
      cursor: pointer;
      border-radius: 3px;
      margin: 0 4px;
      font-weight: 600;
      min-height: 22px;
      transition: background 0.08s;
    }

    .provider-header:hover {
      background: var(--hover-bg);
    }

    .provider-left {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
      flex: 1;
    }

    .provider-logo-img {
      width: 16px;
      height: 16px;
      object-fit: contain;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .provider-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--fg);
      letter-spacing: 0.2px;
    }

    .provider-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .count-badge {
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 9999px;
      background: rgba(128, 128, 128, 0.15);
      color: var(--text-muted);
      font-weight: normal;
    }

    .accounts-container {
      display: flex;
      flex-direction: column;
      position: relative;
      padding-left: 8px;
    }

    .accounts-container.collapsed {
      display: none;
    }

    .accounts-container::before {
      content: '';
      position: absolute;
      left: 14px;
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: var(--border);
    }

    /* ================= LEVEL 2: ACCOUNT ROW ================= */
    .account-item {
      display: flex;
      flex-direction: column;
      margin-top: 1px;
    }

    .account-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 6px 3px 10px;
      cursor: pointer;
      border-radius: 3px;
      margin: 0 4px;
      min-height: 22px;
      transition: background 0.08s;
    }

    .account-row:hover {
      background: var(--hover-bg);
    }

    .account-left {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }

    .account-name {
      font-size: 11.5px;
      font-weight: 500;
      color: var(--fg);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .account-right {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
      margin-left: 6px;
    }

    .pill-tag {
      font-size: 9.5px;
      font-weight: 500;
      padding: 1px 4px;
      border-radius: 3px;
      background: rgba(128, 128, 128, 0.15);
      color: var(--text-muted);
    }

    .account-actions {
      display: flex;
      align-items: center;
      gap: 2px;
      opacity: 0.85;
    }

    .account-row:hover .account-actions {
      opacity: 1;
    }

    /* Minimalist Toggle Switch */
    .toggle-switch-box {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      padding: 2px;
      margin-left: 2px;
    }

    .toggle-track {
      width: 24px;
      height: 13px;
      border-radius: 7px;
      background-color: rgba(128, 128, 128, 0.35);
      position: relative;
      transition: background-color 0.15s ease;
    }

    .toggle-track.active {
      background-color: var(--green);
    }

    .toggle-thumb {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background-color: #ffffff;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: transform 0.15s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }

    .toggle-track.active .toggle-thumb {
      transform: translateX(11px);
    }

    /* ================= LEVEL 3: MODEL QUOTA ROWS ================= */
    .models-list {
      display: flex;
      flex-direction: column;
      position: relative;
      padding-left: 12px;
    }

    .models-list::before {
      content: '';
      position: absolute;
      left: 18px;
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: var(--border);
    }

    .models-list.collapsed {
      display: none;
    }

    .model-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2.5px 6px 2.5px 16px;
      margin: 0 4px;
      border-radius: 3px;
      font-size: 11.5px;
      min-height: 20px;
      transition: background 0.08s;
    }

    .model-row:hover {
      background: var(--hover-bg);
    }

    .model-left {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
      flex: 1;
      padding-right: 8px;
    }

    .status-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      font-size: 13px;
    }
    .status-icon.green { color: var(--green); }
    .status-icon.orange { color: var(--orange); }
    .status-icon.red { color: var(--red); }

    .model-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--fg);
    }

    .model-right {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
      text-align: right;
    }

    .model-pct {
      font-weight: 600;
      min-width: 28px;
      text-align: right;
    }
    .model-pct.green { color: var(--green); }
    .model-pct.orange { color: var(--orange); }
    .model-pct.red { color: var(--red); }

    .model-ratio {
      color: var(--text-muted);
      font-size: 10.5px;
    }

    .v-divider {
      width: 1px;
      height: 9px;
      background-color: var(--border);
      opacity: 0.9;
      margin: 0 2px;
      flex-shrink: 0;
    }

    .model-time {
      color: var(--blue);
      font-size: 10.5px;
      min-width: 50px;
      text-align: right;
    }

    .empty-msg {
      padding: 4px 10px 4px 20px;
      font-size: 11px;
      color: var(--text-muted);
      font-style: italic;
    }

    /* Usage Placeholder */
    .usage-placeholder {
      padding: 16px 14px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--text-muted);
    }

    .placeholder-icon {
      font-size: 20px;
      color: var(--text-muted);
      margin-bottom: 2px;
    }

    .placeholder-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--fg);
    }

    .placeholder-sub {
      font-size: 11px;
      max-width: 240px;
      line-height: 1.35;
    }

    .codicon {
      font-size: 14px;
      line-height: 1;
    }
  </style>
</head>
<body>

  <!-- SECTION 1: QUOTA TRACKER -->
  <div class="section-box">
    <div class="section-header" onclick="toggleSection('quota')">
      <div class="section-left">
        <i class="codicon codicon-chevron-down" id="chevron-quota"></i>
        <span class="section-title">Quota Tracker</span>
      </div>
      <div class="section-actions" onclick="event.stopPropagation()">
        <!-- Custom Dropdown Menu (Anchored Right so it stays 100% on-screen) -->
        <div class="custom-dropdown-wrap" id="filter-dropdown-wrap">
          <button type="button" class="custom-dropdown-trigger" id="filter-dropdown-btn" title="Filter Accounts">
            <span class="filter-trigger-label" id="filter-current-label">Active</span>
            <i class="codicon codicon-chevron-down filter-trigger-arrow"></i>
          </button>

          <!-- Floating Popup Menu (Right anchored, Left aligned text) -->
          <div class="custom-dropdown-menu" id="filter-dropdown-menu">
            <div class="dropdown-menu-item selected" data-value="active" onclick="selectFilter('active', 'Active')">
              <span class="item-check"><i class="codicon codicon-check"></i></span>
              <span class="item-label">Active</span>
            </div>
            <div class="dropdown-menu-item" data-value="all" onclick="selectFilter('all', 'All')">
              <span class="item-check"><i class="codicon codicon-check"></i></span>
              <span class="item-label">All</span>
            </div>
            <div class="dropdown-menu-item" data-value="idle" onclick="selectFilter('idle', 'Inactive / Turn Off')">
              <span class="item-check"><i class="codicon codicon-check"></i></span>
              <span class="item-label">Inactive / Turn Off</span>
            </div>
          </div>
        </div>

        <!-- Official VS Code Refresh Codicon -->
        <button class="icon-btn" id="btn-refresh-quota" title="Refresh Quotas">
          <i class="codicon codicon-refresh"></i>
        </button>
      </div>
    </div>

    <div class="section-body" id="body-quota">
      <div id="tree-root"></div>
    </div>
  </div>

  <!-- SECTION 2: USAGE (Placeholder) -->
  <div class="section-box">
    <div class="section-header" onclick="toggleSection('usage')">
      <div class="section-left">
        <i class="codicon codicon-chevron-right" id="chevron-usage"></i>
        <span class="section-title">Usage</span>
      </div>
      <div class="section-actions" onclick="event.stopPropagation()">
        <span style="font-size: 9.5px; color: var(--text-muted); opacity: 0.8;">Phase 2</span>
      </div>
    </div>

    <div class="section-body collapsed" id="body-usage">
      <div class="usage-placeholder">
        <i class="codicon codicon-graph placeholder-icon"></i>
        <div class="placeholder-title">Usage Analytics & Metrics</div>
        <div class="placeholder-sub">Request logs, token breakdown by model/account, and live throughput will appear here.</div>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const connections = ${connectionsJson};
    const iconMap = ${iconMapJson};
    
    let currentFilter = 'active'; // Default active
    const groupCollapseMap = {};
    const accountCollapseMap = {};
    const sectionCollapseMap = { quota: false, usage: true };

    // Dropdown toggle & close-outside handler
    const dropdownWrap = document.getElementById('filter-dropdown-wrap');
    const triggerBtn = document.getElementById('filter-dropdown-btn');
    const currentLabelEl = document.getElementById('filter-current-label');

    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownWrap.classList.toggle('open');
    });

    window.addEventListener('click', () => {
      dropdownWrap.classList.remove('open');
    });

    function selectFilter(val, label) {
      currentFilter = val;
      currentLabelEl.textContent = label;
      document.querySelectorAll('.dropdown-menu-item').forEach(item => {
        item.classList.toggle('selected', item.getAttribute('data-value') === val);
      });
      dropdownWrap.classList.remove('open');
      renderGroupedTree();
    }

    connections.forEach(c => {
      if (accountCollapseMap[c.id] === undefined) {
        accountCollapseMap[c.id] = !c.isActive;
      }
    });

    function formatProviderName(provider) {
      const p = (provider || '').toLowerCase();
      if (p === 'antigravity') return 'Antigravity';
      if (p === 'claude') return 'Claude Code';
      if (p === 'deepseek') return 'DeepSeek';
      if (p === 'azure') return 'Azure OpenAI';
      if (p === 'kiro') return 'Kiro AI';
      if (p === 'codex') return 'Codex';
      if (p === 'mimo') return 'MiMo';
      if (p === 'opencode') return 'OpenCode';
      return provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Provider';
    }

    function formatCountdown(resetAtStr) {
      if (!resetAtStr) return 'Rolling';
      const resetTime = new Date(resetAtStr).getTime();
      const now = Date.now();
      const diff = resetTime - now;

      if (diff <= 0) return 'in 0m';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) return \`in \${days}d \${hours}h\`;
      if (hours > 0) return \`in \${hours}h \${mins}m\`;
      return \`in \${mins}m\`;
    }

    function getProviderIconHtml(provKey) {
      const src = iconMap[provKey] || iconMap[provKey.toLowerCase()];
      if (src) {
        return \`<img class="provider-logo-img" src="\${src}" alt="\${provKey}" />\`;
      }
      return '<i class="codicon codicon-hubot"></i>';
    }

    function getStatusIconHtml(pct) {
      if (pct < 20) {
        return '<i class="codicon codicon-error status-icon red"></i>';
      }
      if (pct < 50) {
        return '<i class="codicon codicon-warning status-icon orange"></i>';
      }
      return '<i class="codicon codicon-pass-filled status-icon green"></i>';
    }

    function renderGroupedTree() {
      const root = document.getElementById('tree-root');
      root.innerHTML = '';

      // Filter connections based on dropdown
      let filteredConns = connections;
      if (currentFilter === 'active') {
        filteredConns = connections.filter(c => c.isActive);
      } else if (currentFilter === 'idle') {
        filteredConns = connections.filter(c => !c.isActive);
      }

      if (!filteredConns || filteredConns.length === 0) {
        root.innerHTML = '<div class="empty-msg">No accounts found for selected filter.</div>';
        return;
      }

      const groups = {};
      filteredConns.forEach(c => {
        const provKey = (c.provider || 'other').toLowerCase();
        if (!groups[provKey]) {
          groups[provKey] = [];
        }
        groups[provKey].push(c);
      });

      Object.keys(groups).forEach(provKey => {
        const groupConns = groups[provKey];
        const provName = formatProviderName(provKey);
        const provIconHtml = getProviderIconHtml(provKey);
        const isGroupCollapsed = !!groupCollapseMap[provKey];
        const activeCount = groupConns.filter(c => c.isActive).length;

        const groupEl = document.createElement('div');
        groupEl.className = 'provider-group';

        groupEl.innerHTML = \`
          <!-- LEVEL 1: PROVIDER HEADER -->
          <div class="provider-header" onclick="toggleGroup('\${provKey}')">
            <div class="provider-left">
              <i class="codicon \${isGroupCollapsed ? 'codicon-chevron-right' : 'codicon-chevron-down'}"></i>
              \${provIconHtml}
              <span class="provider-title">\${provName}</span>
            </div>
            <div class="provider-right">
              <span class="count-badge">\${groupConns.length} accounts \${activeCount > 0 ? '• ' + activeCount + ' active' : ''}</span>
            </div>
          </div>

          <!-- LEVEL 2: ACCOUNTS CONTAINER -->
          <div class="accounts-container \${isGroupCollapsed ? 'collapsed' : ''}" id="group-\${provKey}">
            \${renderAccounts(groupConns)}
          </div>
        \`;

        root.appendChild(groupEl);
      });
    }

    function renderAccounts(conns) {
      let html = '';
      conns.forEach(c => {
        const isAccCollapsed = accountCollapseMap[c.id] !== false;
        const profileName = c.email || c.name || 'Default Account';

        html += \`
          <div class="account-item">
            <!-- LEVEL 2: ACCOUNT ROW -->
            <div class="account-row" onclick="toggleAccount('\${c.id}')">
              <div class="account-left">
                <i class="codicon \${isAccCollapsed ? 'codicon-chevron-right' : 'codicon-chevron-down'}"></i>
                <span class="account-name" title="\${profileName}">\${profileName}</span>
              </div>

              <div class="account-right" onclick="event.stopPropagation()">
                <span class="pill-tag">#\${c.priority}</span>

                <div class="account-actions">
                  <!-- Manual Refresh (Official Codicon) -->
                  <button class="icon-btn" onclick="refreshSingle('\${c.id}', '\${profileName}')" title="Refresh Quota for \${profileName}">
                    <i class="codicon codicon-refresh"></i>
                  </button>

                  <!-- Test Connection (Official Zap Codicon) -->
                  <button class="icon-btn" onclick="testConn('\${c.id}', '\${profileName}')" title="Test Connection">
                    <i class="codicon codicon-zap"></i>
                  </button>

                  <!-- Native-style ON/OFF Toggle Switch -->
                  <div class="toggle-switch-box" onclick="toggleActive('\${c.id}', \${!c.isActive})" title="\${c.isActive ? 'Active (Click to Turn OFF)' : 'Idle (Click to Turn ON)'}">
                    <div class="toggle-track \${c.isActive ? 'active' : ''}">
                      <div class="toggle-thumb"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- LEVEL 3: MODEL QUOTA ROWS -->
            <div class="models-list \${isAccCollapsed ? 'collapsed' : ''}" id="models-\${c.id}">
              \${renderModels(c.quotas)}
            </div>
          </div>
        \`;
      });
      return html;
    }

    function renderModels(quotas) {
      if (!quotas || quotas.length === 0) {
        return '<div class="empty-msg">No quotas returned for this account.</div>';
      }

      let html = '';
      quotas.forEach(q => {
        const pct = Math.min(100, Math.max(0, Math.round(q.remainingPercentage)));
        const countdownStr = formatCountdown(q.resetAt);
        const usedStr = q.unlimited ? 'Unlimited' : \`\${q.used}/\${q.total}\`;
        const statusIconHtml = getStatusIconHtml(pct);

        let colorClass = 'green';
        if (pct < 20) colorClass = 'red';
        else if (pct < 50) colorClass = 'orange';

        html += \`
          <div class="model-row">
            <div class="model-left">
              \${statusIconHtml}
              <span class="model-name" title="\${q.displayName}">\${q.displayName}</span>
            </div>
            <div class="model-right">
              <span class="model-pct \${colorClass}">\${pct}%</span>
              <span class="model-ratio">(\${usedStr})</span>
              <span class="v-divider"></span>
              <span class="model-time">\${countdownStr}</span>
            </div>
          </div>
        \`;
      });
      return html;
    }

    function toggleSection(secId) {
      sectionCollapseMap[secId] = !sectionCollapseMap[secId];
      const body = document.getElementById('body-' + secId);
      const chevron = document.getElementById('chevron-' + secId);
      if (body) {
        body.classList.toggle('collapsed', sectionCollapseMap[secId]);
      }
      if (chevron) {
        chevron.className = 'codicon ' + (sectionCollapseMap[secId] ? 'codicon-chevron-right' : 'codicon-chevron-down');
      }
    }

    function toggleGroup(provKey) {
      groupCollapseMap[provKey] = !groupCollapseMap[provKey];
      renderGroupedTree();
    }

    function toggleAccount(accId) {
      accountCollapseMap[accId] = !accountCollapseMap[accId];
      renderGroupedTree();
    }

    function refreshSingle(id, name) {
      vscode.postMessage({ command: 'refreshSingle', connectionId: id, name });
    }

    function testConn(id, name) {
      vscode.postMessage({ command: 'test', connectionId: id, name });
    }

    function toggleActive(id, nextActive) {
      vscode.postMessage({ command: 'toggleActive', connectionId: id, nextActive });
    }

    document.getElementById('btn-refresh-quota').addEventListener('click', () => {
      vscode.postMessage({ command: 'refresh' });
    });

    // Initial render
    renderGroupedTree();
  </script>
</body>
</html>`;
}
//# sourceMappingURL=nativeAccordionView.js.map