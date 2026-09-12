"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProvider = void 0;
const vscode = __importStar(require("vscode"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
class DataProvider {
    static instance;
    constructor() { }
    static getInstance() {
        if (!DataProvider.instance) {
            DataProvider.instance = new DataProvider();
        }
        return DataProvider.instance;
    }
    getJwtToken() {
        const customKey = vscode.workspace.getConfiguration('9router').get('apiKey');
        if (customKey && customKey.trim().length > 0) {
            return customKey.trim();
        }
        const secretPath = path.join(os.homedir(), '.9router', 'jwt-secret');
        if (!fs.existsSync(secretPath)) {
            return null;
        }
        try {
            const secret = fs.readFileSync(secretPath, 'utf8').trim();
            if (!secret)
                return null;
            const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
            const payload = Buffer.from(JSON.stringify({
                authenticated: true,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 86400 * 30
            })).toString('base64url');
            const unsigned = `${header}.${payload}`;
            const sig = crypto.createHmac('sha256', secret).update(unsigned).digest('base64url');
            return `${unsigned}.${sig}`;
        }
        catch (err) {
            console.warn('[9Router] Error generating JWT token:', err);
            return null;
        }
    }
    async fetchChartData(period = 'today') {
        const config = vscode.workspace.getConfiguration('9router');
        const baseUrl = config.get('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
        const token = this.getJwtToken();
        try {
            const res = await this.httpRequest(`${baseUrl}/api/usage/chart?period=${period}`, token);
            if (res.ok && Array.isArray(res.data)) {
                return res.data;
            }
            return [];
        }
        catch {
            return [];
        }
    }
    async fetchQuotas() {
        const config = vscode.workspace.getConfiguration('9router');
        const baseUrl = config.get('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
        const token = this.getJwtToken();
        try {
            const providersUrl = `${baseUrl}/api/providers`;
            const res = await this.httpRequest(providersUrl, token);
            if (!res.ok || !res.data || !Array.isArray(res.data.connections)) {
                return {
                    online: false,
                    serverUrl: baseUrl,
                    connections: [],
                    topologyProviders: [],
                    initialChartData: []
                };
            }
            const rawConnections = res.data.connections;
            const connections = [];
            const seenProv = new Set();
            const topoProviders = [];
            // Fetch usage and quotas for each connection in parallel
            await Promise.all(rawConnections.map(async (c) => {
                let quotas = [];
                let rawQuotas = {};
                try {
                    const usageRes = await this.httpRequest(`${baseUrl}/api/usage/${c.id}`, token);
                    if (usageRes.ok && usageRes.data) {
                        quotas = this.parseAndCurateQuotas(c.provider, usageRes.data);
                        rawQuotas = usageRes.data.quotas || {};
                    }
                }
                catch (e) { }
                connections.push({
                    id: c.id,
                    name: c.name || c.email || 'Default',
                    provider: c.provider || 'unknown',
                    email: c.email || (c.name && c.name.includes('@') ? c.name : undefined),
                    priority: c.priority ?? 1,
                    isActive: c.isActive !== false,
                    status: c.status || (c.isActive ? 'active' : 'idle'),
                    quotas,
                    rawQuotas
                });
                // Add to topology providers if active and not seen yet
                if (c.isActive !== false && !seenProv.has(c.provider)) {
                    seenProv.add(c.provider);
                    topoProviders.push({
                        provider: c.provider,
                        name: this.formatProviderName(c.provider)
                    });
                }
            }));
            // Append free noAuth providers (OpenCode, MiMo) if not present
            const freeNoAuth = [
                { provider: 'opencode', name: 'OpenCode Free' },
                { provider: 'mimo', name: 'MiMo Code Free' }
            ];
            freeNoAuth.forEach(fp => {
                if (!seenProv.has(fp.provider)) {
                    seenProv.add(fp.provider);
                    topoProviders.push(fp);
                }
            });
            // Sort connections by priority
            connections.sort((a, b) => a.priority - b.priority);
            // Fetch initial usage stats & initial chart
            let initialUsage;
            let initialChartData = [];
            try {
                const [statsRes, chartRes] = await Promise.all([
                    this.httpRequest(`${baseUrl}/api/usage/stats?period=today`, token),
                    this.httpRequest(`${baseUrl}/api/usage/chart?period=today`, token)
                ]);
                if (statsRes.ok && statsRes.data) {
                    initialUsage = {
                        totalRequests: statsRes.data.totalRequests || 0,
                        totalPromptTokens: statsRes.data.totalPromptTokens || 0,
                        totalCompletionTokens: statsRes.data.totalCompletionTokens || 0,
                        activeRequests: statsRes.data.activeRequests || [],
                        recentRequests: statsRes.data.recentRequests || [],
                        byProvider: statsRes.data.byProvider || {},
                        lastUpdated: new Date().toLocaleTimeString()
                    };
                }
                if (chartRes.ok && Array.isArray(chartRes.data)) {
                    initialChartData = chartRes.data;
                }
            }
            catch (e) { }
            return {
                online: true,
                serverUrl: baseUrl,
                connections,
                initialUsage,
                topologyProviders: topoProviders,
                initialChartData
            };
        }
        catch (err) {
            console.warn('[9Router] Error fetching quotas from API:', err.message);
            return {
                online: false,
                serverUrl: baseUrl,
                connections: [],
                topologyProviders: [],
                initialChartData: []
            };
        }
    }
    async toggleConnection(connectionId, nextActive) {
        const config = vscode.workspace.getConfiguration('9router');
        const baseUrl = config.get('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
        const token = this.getJwtToken();
        try {
            const url = `${baseUrl}/api/providers/${connectionId}`;
            const res = await this.httpRequest(url, token, 'PATCH', { isActive: nextActive });
            return res.ok;
        }
        catch (err) {
            return false;
        }
    }
    async testConnection(connectionId) {
        const config = vscode.workspace.getConfiguration('9router');
        const baseUrl = config.get('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
        const token = this.getJwtToken();
        try {
            const url = `${baseUrl}/api/providers/${connectionId}/test`;
            const res = await this.httpRequest(url, token, 'POST', {});
            if (res.ok && res.data) {
                return {
                    valid: res.data.valid !== false,
                    error: res.data.error
                };
            }
            return { valid: false, error: res.error || 'Test failed' };
        }
        catch (err) {
            return { valid: false, error: err.message };
        }
    }
    listenUsageStream(onData) {
        const config = vscode.workspace.getConfiguration('9router');
        const baseUrl = config.get('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
        const token = this.getJwtToken();
        let isClosed = false;
        let req = null;
        try {
            const url = new URL(`${baseUrl}/api/usage/stream`);
            const reqModule = url.protocol === 'https:' ? https : http;
            const headers = {
                Accept: 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive'
            };
            if (token) {
                headers['Cookie'] = `auth_token=${token}`;
            }
            req = reqModule.get(url.toString(), { headers, timeout: 0 }, (res) => {
                let buffer = '';
                res.on('data', (chunk) => {
                    if (isClosed)
                        return;
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('data: ')) {
                            try {
                                const parsed = JSON.parse(trimmed.slice(6));
                                onData({
                                    totalRequests: parsed.totalRequests || 0,
                                    totalPromptTokens: parsed.totalPromptTokens || 0,
                                    totalCompletionTokens: parsed.totalCompletionTokens || 0,
                                    activeRequests: parsed.activeRequests || [],
                                    recentRequests: parsed.recentRequests || [],
                                    byProvider: parsed.byProvider || {},
                                    lastUpdated: new Date().toLocaleTimeString()
                                });
                            }
                            catch (e) { }
                        }
                    }
                });
                res.on('end', () => {
                    if (!isClosed) {
                        setTimeout(() => this.listenUsageStream(onData), 5000);
                    }
                });
            });
            req.on('error', (err) => {
                if (!isClosed) {
                    console.warn('[9Router] SSE stream connection error:', err.message);
                }
            });
        }
        catch (err) {
            console.warn('[9Router] Error starting SSE stream listener:', err.message);
        }
        return () => {
            isClosed = true;
            if (req) {
                req.destroy();
            }
        };
    }
    parseAndCurateQuotas(provider, usageData) {
        if (!usageData || !usageData.quotas || typeof usageData.quotas !== 'object') {
            return [];
        }
        const p = (provider || '').toLowerCase();
        const rawQuotas = usageData.quotas;
        const result = [];
        if (p === 'antigravity') {
            const entries = Object.entries(rawQuotas);
            const weeklyKeys = new Set(['gemini_weekly', 'claude_gpt_weekly']);
            const geminiModels = entries.filter(([k]) => k.startsWith('gemini-') && !k.includes('image'));
            const claudeModels = entries.filter(([k]) => k.startsWith('claude-'));
            const imageModels = entries.filter(([k]) => k.includes('image'));
            const weeklyModels = entries.filter(([k]) => weeklyKeys.has(k));
            const otherModels = entries.filter(([k]) => !k.startsWith('gemini-') && !k.startsWith('claude-') && !k.includes('image') && !weeklyKeys.has(k));
            if (geminiModels.length > 0) {
                result.push(this.aggregateBucket('gemini_flash_pro', 'Gemini (Flash / Pro)', geminiModels.map(([, v]) => v)));
            }
            if (claudeModels.length > 0) {
                result.push(this.aggregateBucket('claude_sonnet_opus', 'Claude (Sonnet / Opus)', claudeModels.map(([, v]) => v)));
            }
            otherModels.forEach(([k, v]) => {
                result.push(this.formatSingleQuota(k, v));
            });
            if (imageModels.length > 0) {
                result.push(this.aggregateBucket('gemini_image', 'Gemini 3.1 Flash Image', imageModels.map(([, v]) => v)));
            }
            weeklyModels.forEach(([k, v]) => {
                result.push(this.formatSingleQuota(k, v));
            });
            return result;
        }
        for (const [key, val] of Object.entries(rawQuotas)) {
            result.push(this.formatSingleQuota(key, val));
        }
        return result;
    }
    aggregateBucket(bucketKey, displayName, items) {
        if (!items || items.length === 0) {
            return {
                name: bucketKey,
                displayName,
                used: 0,
                total: 1000,
                unlimited: false,
                remainingPercentage: 100
            };
        }
        let totalUsed = 0;
        let totalLimit = 0;
        let minRemainingPct = 100;
        let earliestReset;
        items.forEach(item => {
            const u = typeof item.used === 'number' ? item.used : 0;
            const t = typeof item.total === 'number' ? item.total : (typeof item.limit === 'number' ? item.limit : 1000);
            const pct = typeof item.remainingPercentage === 'number' ? item.remainingPercentage : (t > 0 ? ((t - u) / t) * 100 : 100);
            totalUsed += u;
            totalLimit += t;
            if (pct < minRemainingPct)
                minRemainingPct = pct;
            const resetStr = item.resetAt || item.resetsAt;
            if (resetStr) {
                if (!earliestReset || new Date(resetStr) < new Date(earliestReset)) {
                    earliestReset = resetStr;
                }
            }
        });
        const avgUsed = Math.round(totalUsed / items.length);
        const avgLimit = Math.round(totalLimit / items.length) || 1000;
        return {
            name: bucketKey,
            displayName,
            used: avgUsed,
            total: avgLimit,
            unlimited: false,
            remainingPercentage: minRemainingPct,
            resetAt: earliestReset
        };
    }
    formatSingleQuota(rawKey, item) {
        const used = typeof item.used === 'number' ? item.used : (typeof item.count === 'number' ? item.count : 0);
        const total = typeof item.total === 'number' ? item.total : (typeof item.limit === 'number' ? item.limit : 1000);
        const unlimited = !!item.unlimited || total >= 999999;
        const remainingPercentage = typeof item.remainingPercentage === 'number'
            ? item.remainingPercentage
            : (total > 0 ? Math.max(0, ((total - used) / total) * 100) : 100);
        let displayName = rawKey;
        if (rawKey === 'gemini_weekly')
            displayName = 'Gemini (Weekly)';
        else if (rawKey === 'claude_gpt_weekly')
            displayName = 'Claude & GPT (Weekly)';
        else if (rawKey.includes('120b'))
            displayName = 'GPT-OSS 120B';
        else if (rawKey.includes('flash-image'))
            displayName = 'Gemini 3.1 Flash Image';
        else {
            displayName = rawKey
                .replace(/[_-]/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
        }
        return {
            name: rawKey,
            displayName,
            used,
            total,
            unlimited,
            remainingPercentage,
            resetAt: item.resetAt || item.resetsAt
        };
    }
    formatProviderName(provider) {
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
            return 'MiMo Code Free';
        if (p === 'opencode')
            return 'OpenCode Free';
        return provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Provider';
    }
    httpRequest(urlStr, token, method = 'GET', bodyData) {
        return new Promise((resolve) => {
            try {
                const parsed = new URL(urlStr);
                const reqModule = parsed.protocol === 'https:' ? https : http;
                const headers = {
                    Accept: 'application/json',
                    'User-Agent': '9Router-VSCode-Monitor'
                };
                if (token) {
                    headers['Cookie'] = `auth_token=${token}`;
                    headers['Authorization'] = `Bearer ${token}`;
                }
                let bodyPayload = '';
                if (bodyData !== undefined) {
                    bodyPayload = JSON.stringify(bodyData);
                    headers['Content-Type'] = 'application/json';
                    headers['Content-Length'] = String(Buffer.byteLength(bodyPayload));
                }
                const req = reqModule.request(parsed.toString(), {
                    method,
                    headers,
                    timeout: 8000
                }, (res) => {
                    let resData = '';
                    res.on('data', (c) => (resData += c));
                    res.on('end', () => {
                        try {
                            const parsedJson = resData ? JSON.parse(resData) : null;
                            resolve({
                                ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300,
                                status: res.statusCode || 0,
                                data: parsedJson
                            });
                        }
                        catch (e) {
                            resolve({
                                ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300,
                                status: res.statusCode || 0,
                                data: resData
                            });
                        }
                    });
                });
                req.on('error', (err) => {
                    resolve({ ok: false, status: 0, error: err.message });
                });
                req.on('timeout', () => {
                    req.destroy();
                    resolve({ ok: false, status: 408, error: 'Request timed out' });
                });
                if (bodyPayload) {
                    req.write(bodyPayload);
                }
                req.end();
            }
            catch (err) {
                resolve({ ok: false, status: 0, error: err.message });
            }
        });
    }
}
exports.DataProvider = DataProvider;
//# sourceMappingURL=dataProvider.js.map