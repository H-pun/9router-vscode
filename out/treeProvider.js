"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterTreeProvider = exports.RouterTreeItem = void 0;
const vscode = require("vscode");
const dataProvider_1 = require("./dataProvider");
class RouterTreeItem extends vscode.TreeItem {
    label;
    collapsibleState;
    contextValue;
    nodeData;
    constructor(label, collapsibleState, contextValue, nodeData) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
        this.nodeData = nodeData;
    }
}
exports.RouterTreeItem = RouterTreeItem;
class RouterTreeProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    data;
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
            const statusIcon = this.data.online ? 'pass-filled' : 'error';
            const statusLabel = this.data.online ? '9Router Online (:20128)' : 'Offline';
            const statusItem = new RouterTreeItem(statusLabel, vscode.TreeItemCollapsibleState.None, 'status');
            statusItem.iconPath = new vscode.ThemeIcon(statusIcon, new vscode.ThemeColor(this.data.online ? 'charts.green' : 'charts.red'));
            statusItem.description = this.data.serverUrl;
            const items = [statusItem];
            // List each provider connection
            for (const c of this.data.connections) {
                const label = this.formatAccountLabel(c);
                const item = new RouterTreeItem(label, vscode.TreeItemCollapsibleState.Collapsed, 'connection_item', c);
                const iconName = c.isActive ? 'radio-tower' : 'circle-slash';
                item.description = `#Prio ${c.priority}  •  ${c.isActive ? 'Active' : 'Idle'}`;
                item.iconPath = new vscode.ThemeIcon(iconName, c.isActive ? new vscode.ThemeColor('charts.orange') : new vscode.ThemeColor('charts.gray'));
                items.push(item);
            }
            return items;
        }
        if (element.contextValue === 'connection_item' && element.nodeData) {
            const c = element.nodeData;
            const subItems = [];
            if (c.email) {
                const emailItem = new RouterTreeItem(`Account: ${c.email}`, vscode.TreeItemCollapsibleState.None, 'info');
                emailItem.iconPath = new vscode.ThemeIcon('account');
                subItems.push(emailItem);
            }
            const planItem = new RouterTreeItem(`Plan: ${c.plan}`, vscode.TreeItemCollapsibleState.None, 'info');
            planItem.iconPath = new vscode.ThemeIcon('shield');
            subItems.push(planItem);
            if (c.quotas && c.quotas.length > 0) {
                const quotaGroup = new RouterTreeItem(`Quotas (${c.quotas.length} buckets)`, vscode.TreeItemCollapsibleState.Expanded, 'quota_group', c.quotas);
                quotaGroup.iconPath = new vscode.ThemeIcon('dashboard');
                subItems.push(quotaGroup);
            }
            return subItems;
        }
        if (element.contextValue === 'quota_group' && Array.isArray(element.nodeData)) {
            return element.nodeData.map(q => {
                const pct = Math.round(q.remainingPercentage);
                const qItem = new RouterTreeItem(q.displayName, vscode.TreeItemCollapsibleState.None, 'quota_detail');
                qItem.iconPath = new vscode.ThemeIcon(pct > 50 ? 'check' : (pct > 20 ? 'warning' : 'error'), new vscode.ThemeColor(pct > 50 ? 'charts.green' : (pct > 20 ? 'charts.orange' : 'charts.red')));
                qItem.description = `${pct}% (${q.used}/${q.total})`;
                return qItem;
            });
        }
        return [];
    }
}
exports.RouterTreeProvider = RouterTreeProvider;
//# sourceMappingURL=treeProvider.js.map