import { UsageStreamData } from '../dataProvider';

export function getLogsWebviewHtml(
  initialUsage: UsageStreamData,
  providerIconMap: Record<string, string>,
  codiconCssUri: string
): string {
  const iconMapJson = JSON.stringify(providerIconMap);
  const initialUsageJson = JSON.stringify(initialUsage);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Requests</title>
  <link rel="stylesheet" href="${codiconCssUri}">
  <style>
    :root {
      --bg: var(--vscode-sideBar-background);
      --fg: var(--vscode-sideBar-foreground);
      --hover-bg: var(--vscode-list-hoverBackground);
      --border: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.22));
      --text-muted: var(--vscode-descriptionForeground);
      --font: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      --font-size: var(--vscode-font-size, 13px);
      --blue: #38bdf8;
      --green: var(--vscode-charts-green, #388a34);
      --orange: #f59e0b;
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
      padding: 8px;
      overflow-x: hidden;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Live Summary Cards */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    .summary-card {
      background: var(--vscode-dropdown-background, rgba(128,128,128,0.08));
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 8px;
      display: flex;
      flex-direction: column;
    }

    .summary-card .label {
      font-size: 10px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .summary-card .val {
      font-size: 14px;
      font-weight: 700;
      color: var(--fg);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Active Requests Section */
    .active-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .active-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .active-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: 12px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.35);
      font-size: 11px;
      color: var(--blue);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--blue);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }

    /* Table Container */
    .table-container {
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
      background: var(--vscode-editor-background, transparent);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }

    thead th {
      text-align: left;
      padding: 6px 8px;
      font-size: 10.5px;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--vscode-sideBarSectionHeader-background, rgba(128,128,128,0.06));
      border-bottom: 1px solid var(--border);
      text-transform: uppercase;
      letter-spacing: 0.4px;
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
      padding: 6px 8px;
      vertical-align: middle;
    }

    .model-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }

    .model-icon {
      width: 15px;
      height: 15px;
      border-radius: 3px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .tokens-badge {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 10.5px;
    }

    .time-cell {
      color: var(--text-muted);
      font-size: 10.5px;
      text-align: right;
      white-space: nowrap;
    }

    .empty-state {
      padding: 24px 12px;
      text-align: center;
      color: var(--text-muted);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <!-- Summary Cards -->
  <div class="summary-grid">
    <div class="summary-card">
      <span class="label">Requests</span>
      <span class="val" id="total-requests">0</span>
    </div>
    <div class="summary-card">
      <span class="label">Prompt ↑</span>
      <span class="val" id="prompt-tokens">0</span>
    </div>
    <div class="summary-card">
      <span class="label">Compl ↓</span>
      <span class="val" id="completion-tokens">0</span>
    </div>
  </div>

  <!-- Active Requests Pills -->
  <div class="active-section" id="active-container" style="display: none;">
    <div class="active-pills" id="active-pills"></div>
  </div>

  <!-- Recent Table -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Model</th>
          <th>Tokens (In / Out)</th>
          <th style="text-align: right;">When</th>
        </tr>
      </thead>
      <tbody id="logs-tbody">
        <tr>
          <td colspan="3" class="empty-state">Waiting for stream data...</td>
        </tr>
      </tbody>
    </table>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const providerIconMap = ${iconMapJson};
    let currentUsage = ${initialUsageJson};

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

    function renderUsage(data) {
      if (!data) return;
      currentUsage = data;

      document.getElementById('total-requests').textContent = fmtNumber(data.totalRequests);
      document.getElementById('prompt-tokens').textContent = fmtNumber(data.totalPromptTokens);
      document.getElementById('completion-tokens').textContent = fmtNumber(data.totalCompletionTokens);

      // Render active requests
      const activeContainer = document.getElementById('active-container');
      const activePills = document.getElementById('active-pills');
      if (Array.isArray(data.activeRequests) && data.activeRequests.length > 0) {
        activeContainer.style.display = 'flex';
        activePills.innerHTML = data.activeRequests.map(r => \`
          <div class="active-pill">
            <span class="pulse-dot"></span>
            <span>\${r.model || r.provider || 'Active Request'}</span>
          </div>
        \`).join('');
      } else {
        activeContainer.style.display = 'none';
        activePills.innerHTML = '';
      }

      // Render recent requests
      const tbody = document.getElementById('logs-tbody');
      const requests = data.recentRequests || [];
      if (requests.length === 0) {
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

    // Initial render
    renderUsage(currentUsage);

    // Listen to messages from host
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg && (msg.type === 'usageStream' || msg.type === 'usageSnapshot')) {
        renderUsage(msg.data);
      }
    });

    // Notify ready to get latest snapshot
    vscode.postMessage({ command: 'ready' });
  </script>
</body>
</html>`;
}
