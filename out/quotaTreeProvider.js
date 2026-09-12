"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaTreeProvider = exports.QuotaTreeItem = void 0;
const vscode = require("vscode");
const dataProvider_1 = require("./dataProvider");
class QuotaTreeItem extends vscode.TreeItem {
    label;
    collapsibleState;
    contextValue;
    connectionData;
    quotaData;
    constructor(label, collapsibleState, contextValue, connectionData, quotaData) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
        this.connectionData = connectionData;
        this.quotaData = quotaData;
    }
}
exports.QuotaTreeItem = QuotaTreeItem;
class QuotaTreeProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    data;
    currentFilter = 'all';
    setFilter(filter) {
        this.currentFilter = filter;
        this.refresh();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    formatProviderName(provider, plan) {
        const p = (provider || '').toLowerCase();
        if (p === 'antigravity')
            return 'Antigravity';
        if (p === 'claude')
            return 'Claude Code';
        if (p === 'deepseek')
            return 'DeepSeek';
        if (p === 'azure')
            return 'Azure OpenAI';
        if (p === 'kiro')
            return 'Kiro AI';
        if (p === 'codex')
            return 'Codex';
        if (p === 'mimo')
            return 'MiMo';
        if (p === 'opencode')
            return 'OpenCode';
        return plan || (provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Provider');
    }
    formatAccountLabel(c) {
        const prov = this.formatProviderName(c.provider, c.plan);
        const profile = c.email || c.name || '';
        if (profile && profile.toLowerCase() !== prov.toLowerCase()) {
            return `${prov} (${profile})`;
        }
        return prov;
    }
    async getChildren(element) {
        if (!element) {
            this.data = await dataProvider_1.DataProvider.getInstance().fetchQuotas();
            if (!this.data.online) {
                const offlineItem = new QuotaTreeItem('9Router Offline', vscode.TreeItemCollapsibleState.None, 'status_offline');
                offlineItem.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('charts.red'));
                offlineItem.description = `Unreachable at ${this.data.serverUrl}`;
                return [offlineItem];
            }
            let conns = this.data.connections;
            if (this.currentFilter !== 'all') {
                conns = conns.filter(c => (c.provider || '').toLowerCase().includes(this.currentFilter.toLowerCase()));
            }
            if (conns.length === 0) {
                const emptyItem = new QuotaTreeItem('No accounts found for current filter', vscode.TreeItemCollapsibleState.None, 'empty');
                emptyItem.iconPath = new vscode.ThemeIcon('info');
                return [emptyItem];
            }
            return conns.map(c => {
                const label = this.formatAccountLabel(c);
                const item = new QuotaTreeItem(label, vscode.TreeItemCollapsibleState.Expanded, c.isActive ? 'account_item_active' : 'account_item_idle', c);
                // Native Codicon based on provider
                let iconName = 'account';
                let iconColor = 'charts.blue';
                const p = (c.provider || '').toLowerCase();
                if (p.includes('antigravity')) {
                    iconName = 'symbol-misc';
                    iconColor = 'charts.blue';
                }
                else if (p.includes('claude')) {
                    iconName = 'sparkle';
                    iconColor = 'charts.orange';
                }
                else if (p.includes('deepseek')) {
                    iconName = 'hubot';
                    iconColor = 'charts.purple';
                }
                else if (p.includes('azure')) {
                    iconName = 'cloud';
                    iconColor = 'charts.cyan';
                }
                item.iconPath = new vscode.ThemeIcon(c.isActive ? iconName : 'circle-slash', new vscode.ThemeColor(c.isActive ? iconColor : 'charts.gray'));
                const statusTag = c.isActive ? 'Active' : 'Idle';
                item.description = `#Prio ${c.priority}  •  ${statusTag}`;
                item.tooltip = new vscode.MarkdownString(`### ${label}\n\n` +
                    `- **Provider:** ${this.formatProviderName(c.provider, c.plan)}\n` +
                    `- **Profile/Account:** ${c.email || c.name}\n` +
                    `- **Priority:** #${c.priority}\n` +
                    `- **Status:** ${c.isActive ? 'Active' : 'Idle'}\n` +
                    `- **Quotas Tracked:** ${c.quotas.length} models\n` +
                    `- **Last Refreshed:** ${c.lastRefresh || 'Now'}`);
                return item;
            });
        }
        if ((element.contextValue === 'account_item_active' || element.contextValue === 'account_item_idle') && element.connectionData) {
            const c = element.connectionData;
            if (!c.quotas || c.quotas.length === 0) {
                const noQuota = new QuotaTreeItem('No quotas returned for this account', vscode.TreeItemCollapsibleState.None, 'info');
                noQuota.iconPath = new vscode.ThemeIcon('info');
                return [noQuota];
            }
            return c.quotas.map(q => {
                const pct = Math.min(100, Math.max(0, Math.round(q.remainingPercentage)));
                const countdownStr = this.formatCountdown(q.resetAt);
                const usedStr = q.unlimited ? 'Unlimited' : `${q.used}/${q.total}`;
                const qItem = new QuotaTreeItem(q.displayName, vscode.TreeItemCollapsibleState.None, 'quota_metric', c, q);
                // Native VS Code Codicon with ThemeColor (no emojis!)
                let iconName = 'check';
                let iconColor = 'charts.green';
                if (pct < 20) {
                    iconName = 'error';
                    iconColor = 'charts.red';
                }
                else if (pct < 50) {
                    iconName = 'warning';
                    iconColor = 'charts.orange';
                }
                else {
                    iconName = 'check';
                    iconColor = 'charts.green';
                }
                qItem.iconPath = new vscode.ThemeIcon(iconName, new vscode.ThemeColor(iconColor));
                // Format description with padded percentage, ratio, and reset countdown (no emoji)
                qItem.description = `${pct}% (${usedStr})  •  ${countdownStr}`;
                qItem.tooltip = new vscode.MarkdownString(`### ${q.displayName}\n` +
                    `- **Remaining:** ${pct}%\n` +
                    `- **Usage:** ${q.used} / ${q.total} requests\n` +
                    `- **Reset Time:** ${q.resetAt ? new Date(q.resetAt).toLocaleString() : 'Rolling Window'}\n` +
                    `- **Countdown:** ${countdownStr}`);
                return qItem;
            });
        }
        return [];
    }
    formatCountdown(resetAtStr) {
        if (!resetAtStr)
            return 'Rolling';
        const resetTime = new Date(resetAtStr).getTime();
        const now = Date.now();
        const diff = resetTime - now;
        if (diff <= 0)
            return 'Resetting now';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0)
            return `in ${days}d ${hours}h`;
        if (hours > 0)
            return `in ${hours}h ${mins}m`;
        return `in ${mins}m`;
    }
}
exports.QuotaTreeProvider = QuotaTreeProvider;
//# sourceMappingURL=quotaTreeProvider.js.map