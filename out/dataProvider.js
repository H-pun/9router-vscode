"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProvider = void 0;
const vscode = require("vscode");
const http = require("http");
const https = require("https");
const os = require("os");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
class DataProvider {
    static instance;
    static getInstance() {
        if (!DataProvider.instance) {
            DataProvider.instance = new DataProvider();
        }
        return DataProvider.instance;
    }
    getJwtToken() {
        try {
            const secretPath = path.join(os.homedir(), '.9router', 'jwt-secret');
            if (!fs.existsSync(secretPath)) {
                return null;
            }
            const secret = fs.readFileSync(secretPath, 'utf8').trim();
            const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
            const payload = Buffer.from(JSON.stringify({
                authenticated: true,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 86400
            })).toString('base64url');
            const sig = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
            return `${header}.${payload}.${sig}`;
        }
        catch {
            return null;
        }
    }
    async fetchQuotas() {
        const config = vscode.workspace.getConfiguration('9router');
        const baseUrl = config.get('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
        const token = this.getJwtToken();
        try {
            // 1. Fetch provider connections
            const providersResp = await this.httpGet(`${baseUrl}/api/providers`, token);
            if (!providersResp || !providersResp.connections) {
                throw new Error('Failed to fetch providers');
            }
            const rawConnections = providersResp.connections;
            const connections = [];
            // 2. Fetch quota for each connection in parallel
            await Promise.all(rawConnections.map(async (c) => {
                let quotas = [];
                let plan = c.provider;
                let status = c.isActive ? 'online' : 'idle';
                let errorMsg = '';
                try {
                    const usageData = await this.httpGet(`${baseUrl}/api/usage/${c.id}`, token);
                    if (usageData) {
                        if (usageData.plan) {
                            plan = usageData.plan;
                        }
                        quotas = this.parseAndCurateQuotas(c.provider, usageData);
                    }
                }
                catch (err) {
                    errorMsg = err.message || 'Failed to fetch usage';
                }
                connections.push({
                    id: c.id,
                    provider: c.provider,
                    name: c.name || c.email || c.provider,
                    email: c.email || (c.name?.includes('@') ? c.name : undefined),
                    priority: c.priority || 1,
                    isActive: !!c.isActive,
                    status: c.isActive ? 'active' : 'idle',
                    plan,
                    quotas,
                    lastRefresh: new Date().toLocaleTimeString(),
                    error: errorMsg || undefined
                });
            }));
            // Sort connections by priority asc, then active
            connections.sort((a, b) => {
                if (a.isActive && !b.isActive)
                    return -1;
                if (!a.isActive && b.isActive)
                    return 1;
                return a.priority - b.priority;
            });
            return {
                online: true,
                serverUrl: baseUrl,
                lastUpdated: new Date().toLocaleTimeString(),
                connections
            };
        }
        catch (err) {
            console.warn('[9Router] Error fetching quotas from API:', err);
            return {
                online: false,
                serverUrl: baseUrl,
                lastUpdated: new Date().toLocaleTimeString(),
                connections: []
            };
        }
    }
    /**
     * Exact 1:1 Curation algorithm used in 9Router's official dashboard
     */
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
            // 1. Gemini (Flash / Pro) - Pick lowest remaining percentage
            if (geminiModels.length > 0) {
                const lowest = geminiModels.reduce((min, cur) => (cur[1].remainingPercentage ?? 100) < (min[1].remainingPercentage ?? 100) ? cur : min)[1];
                result.push({
                    id: 'gemini',
                    displayName: 'Gemini (Flash / Pro)',
                    used: lowest.used || 0,
                    total: lowest.total || 1000,
                    resetAt: lowest.resetAt || null,
                    remainingPercentage: lowest.remainingPercentage ?? (100 - ((lowest.used || 0) / (lowest.total || 1000)) * 100)
                });
            }
            // 2. Claude (Sonnet / Opus) - Pick lowest remaining percentage
            if (claudeModels.length > 0) {
                const lowest = claudeModels.reduce((min, cur) => (cur[1].remainingPercentage ?? 100) < (min[1].remainingPercentage ?? 100) ? cur : min)[1];
                result.push({
                    id: 'claude',
                    displayName: 'Claude (Sonnet / Opus)',
                    used: lowest.used || 0,
                    total: lowest.total || 1000,
                    resetAt: lowest.resetAt || null,
                    remainingPercentage: lowest.remainingPercentage ?? (100 - ((lowest.used || 0) / (lowest.total || 1000)) * 100)
                });
            }
            // 3. GPT-OSS 120B & Other models
            otherModels.forEach(([k, val]) => {
                result.push({
                    id: k,
                    displayName: val.displayName || k,
                    used: val.used || 0,
                    total: val.total || 1000,
                    resetAt: val.resetAt || null,
                    remainingPercentage: val.remainingPercentage ?? (100 - ((val.used || 0) / (val.total || 1000)) * 100)
                });
            });
            // 4. Gemini 3.1 Flash Image
            imageModels.forEach(([k, val]) => {
                result.push({
                    id: k,
                    displayName: val.displayName || k,
                    used: val.used || 0,
                    total: val.total || 1000,
                    resetAt: val.resetAt || null,
                    remainingPercentage: val.remainingPercentage ?? (100 - ((val.used || 0) / (val.total || 1000)) * 100)
                });
            });
            // 5. Weekly quotas (Gemini Weekly, Claude & GPT Weekly)
            weeklyModels.forEach(([k, val]) => {
                result.push({
                    id: k,
                    displayName: val.displayName || k,
                    used: val.used || 0,
                    total: val.total || 1000,
                    resetAt: val.resetAt || null,
                    remainingPercentage: val.remainingPercentage ?? (100 - ((val.used || 0) / (val.total || 1000)) * 100)
                });
            });
            return result;
        }
        if (p === 'claude') {
            const order = {
                'session (5h)': 0,
                'weekly (7d)': 1,
                'weekly fable (7d)': 2,
                'weekly opus (7d)': 3,
                'weekly sonnet (7d)': 4
            };
            for (const [key, val] of Object.entries(rawQuotas)) {
                result.push({
                    id: key,
                    displayName: key,
                    used: val.used || 0,
                    total: val.total || 100,
                    resetAt: val.resetAt || null,
                    remainingPercentage: val.remainingPercentage ?? (100 - ((val.used || 0) / (val.total || 100)) * 100)
                });
            }
            result.sort((a, b) => (order[a.displayName] ?? 99) - (order[b.displayName] ?? 99));
            return result;
        }
        // Default / DeepSeek / Azure / etc.
        if (Array.isArray(rawQuotas)) {
            return rawQuotas.map((q) => ({
                id: q.name || q.id || 'quota',
                displayName: q.displayName || q.name || 'Quota',
                used: q.used || 0,
                total: q.total || 1000,
                resetAt: q.resetAt || null,
                remainingPercentage: q.remainingPercentage ?? (100 - ((q.used || 0) / (q.total || 1000)) * 100),
                unlimited: !!q.unlimited
            }));
        }
        for (const [key, val] of Object.entries(rawQuotas)) {
            result.push({
                id: key,
                displayName: val.displayName || key,
                used: val.used ?? 0,
                total: val.total ?? 1000,
                resetAt: val.resetAt || null,
                remainingPercentage: val.remainingPercentage ?? (100 - ((val.used || 0) / (val.total || 1000)) * 100),
                unlimited: !!val.unlimited
            });
        }
        return result;
    }
    async testConnection(connectionId) {
        const config = vscode.workspace.getConfiguration('9router');
        const baseUrl = config.get('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
        const token = this.getJwtToken();
        try {
            const res = await this.httpPost(`${baseUrl}/api/providers/${connectionId}/test`, {}, token);
            return { valid: !!res?.valid, error: res?.error };
        }
        catch (err) {
            return { valid: false, error: err.message };
        }
    }
    async toggleConnection(connectionId, isActive) {
        const config = vscode.workspace.getConfiguration('9router');
        const baseUrl = config.get('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
        const token = this.getJwtToken();
        try {
            const res = await this.httpPut(`${baseUrl}/api/providers/${connectionId}`, { isActive }, token);
            return !!res;
        }
        catch {
            return false;
        }
    }
    httpGet(urlStr, token) {
        return new Promise((resolve, reject) => {
            try {
                const url = new URL(urlStr);
                const reqModule = url.protocol === 'https:' ? https : http;
                const headers = {};
                if (token) {
                    headers['Cookie'] = `auth_token=${token}`;
                }
                const req = reqModule.get(urlStr, { headers, timeout: 4000 }, (res) => {
                    let data = '';
                    res.on('data', (chunk) => (data += chunk));
                    res.on('end', () => {
                        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                            try {
                                resolve(JSON.parse(data));
                            }
                            catch {
                                resolve(data);
                            }
                        }
                        else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    });
                });
                req.on('error', reject);
                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error('Request timeout'));
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    httpPost(urlStr, body, token) {
        return new Promise((resolve, reject) => {
            try {
                const url = new URL(urlStr);
                const reqModule = url.protocol === 'https:' ? https : http;
                const dataStr = JSON.stringify(body);
                const headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': String(Buffer.byteLength(dataStr))
                };
                if (token) {
                    headers['Cookie'] = `auth_token=${token}`;
                }
                const req = reqModule.request(urlStr, { method: 'POST', headers, timeout: 6000 }, (res) => {
                    let data = '';
                    res.on('data', (chunk) => (data += chunk));
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        }
                        catch {
                            resolve(data);
                        }
                    });
                });
                req.on('error', reject);
                req.write(dataStr);
                req.end();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    httpPut(urlStr, body, token) {
        return new Promise((resolve, reject) => {
            try {
                const url = new URL(urlStr);
                const reqModule = url.protocol === 'https:' ? https : http;
                const dataStr = JSON.stringify(body);
                const headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': String(Buffer.byteLength(dataStr))
                };
                if (token) {
                    headers['Cookie'] = `auth_token=${token}`;
                }
                const req = reqModule.request(urlStr, { method: 'PUT', headers, timeout: 6000 }, (res) => {
                    let data = '';
                    res.on('data', (chunk) => (data += chunk));
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        }
                        catch {
                            resolve(data);
                        }
                    });
                });
                req.on('error', reject);
                req.write(dataStr);
                req.end();
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.DataProvider = DataProvider;
//# sourceMappingURL=dataProvider.js.map