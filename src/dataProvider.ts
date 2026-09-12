import * as vscode from 'vscode';
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface QuotaItem {
  id: string;
  displayName: string;
  used: number;
  total: number;
  remainingPercentage: number;
  resetAt?: string;
  unlimited?: boolean;
}

export interface ProviderConnection {
  id: string;
  provider: string;
  name: string;
  email?: string;
  priority: number;
  isActive: boolean;
  status: 'active' | 'online' | 'error' | 'idle';
  plan: string;
  quotas: QuotaItem[];
  lastRefresh?: string;
  error?: string;
}

export interface RouterQuotaData {
  online: boolean;
  serverUrl: string;
  lastUpdated: string;
  connections: ProviderConnection[];
}

export class DataProvider {
  private static instance: DataProvider;

  public static getInstance(): DataProvider {
    if (!DataProvider.instance) {
      DataProvider.instance = new DataProvider();
    }
    return DataProvider.instance;
  }

  private getJwtToken(): string | null {
    try {
      const secretPath = path.join(os.homedir(), '.9router', 'jwt-secret');
      if (!fs.existsSync(secretPath)) {
        return null;
      }
      const secret = fs.readFileSync(secretPath, 'utf8').trim();
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          authenticated: true,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400
        })
      ).toString('base64url');
      const sig = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
      return `${header}.${payload}.${sig}`;
    } catch {
      return null;
    }
  }

  public async fetchQuotas(): Promise<RouterQuotaData> {
    const config = vscode.workspace.getConfiguration('9router');
    const baseUrl = config.get<string>('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
    const token = this.getJwtToken();

    try {
      // 1. Fetch provider connections
      const providersResp = await this.httpGet(`${baseUrl}/api/providers`, token);
      if (!providersResp || !providersResp.connections) {
        throw new Error('Failed to fetch providers');
      }

      const rawConnections: any[] = providersResp.connections;
      const connections: ProviderConnection[] = [];

      // 2. Fetch quota for each connection in parallel
      await Promise.all(
        rawConnections.map(async (c) => {
          let quotas: QuotaItem[] = [];
          let plan = c.provider;
          let status: 'active' | 'online' | 'error' | 'idle' = c.isActive ? 'online' : 'idle';
          let errorMsg = '';

          try {
            const usageData = await this.httpGet(`${baseUrl}/api/usage/${c.id}`, token);
            if (usageData) {
              if (usageData.plan) {
                plan = usageData.plan;
              }
              quotas = this.parseAndCurateQuotas(c.provider, usageData);
            }
          } catch (err: any) {
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
        })
      );

      // Sort connections by priority asc, then active
      connections.sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return a.priority - b.priority;
      });

      return {
        online: true,
        serverUrl: baseUrl,
        lastUpdated: new Date().toLocaleTimeString(),
        connections
      };
    } catch (err) {
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
  private parseAndCurateQuotas(provider: string, usageData: any): QuotaItem[] {
    if (!usageData || !usageData.quotas || typeof usageData.quotas !== 'object') {
      return [];
    }

    const p = (provider || '').toLowerCase();
    const rawQuotas = usageData.quotas;
    const result: QuotaItem[] = [];

    if (p === 'antigravity') {
      const entries = Object.entries<any>(rawQuotas);
      const weeklyKeys = new Set(['gemini_weekly', 'claude_gpt_weekly']);
      const geminiModels = entries.filter(([k]) => k.startsWith('gemini-') && !k.includes('image'));
      const claudeModels = entries.filter(([k]) => k.startsWith('claude-'));
      const imageModels = entries.filter(([k]) => k.includes('image'));
      const weeklyModels = entries.filter(([k]) => weeklyKeys.has(k));
      const otherModels = entries.filter(
        ([k]) => !k.startsWith('gemini-') && !k.startsWith('claude-') && !k.includes('image') && !weeklyKeys.has(k)
      );

      // 1. Gemini (Flash / Pro) - Pick lowest remaining percentage
      if (geminiModels.length > 0) {
        const lowest = geminiModels.reduce((min, cur) =>
          (cur[1].remainingPercentage ?? 100) < (min[1].remainingPercentage ?? 100) ? cur : min
        )[1];
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
        const lowest = claudeModels.reduce((min, cur) =>
          (cur[1].remainingPercentage ?? 100) < (min[1].remainingPercentage ?? 100) ? cur : min
        )[1];
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
      const order: Record<string, number> = {
        'session (5h)': 0,
        'weekly (7d)': 1,
        'weekly fable (7d)': 2,
        'weekly opus (7d)': 3,
        'weekly sonnet (7d)': 4
      };

      for (const [key, val] of Object.entries<any>(rawQuotas)) {
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
      return rawQuotas.map((q: any) => ({
        id: q.name || q.id || 'quota',
        displayName: q.displayName || q.name || 'Quota',
        used: q.used || 0,
        total: q.total || 1000,
        resetAt: q.resetAt || null,
        remainingPercentage: q.remainingPercentage ?? (100 - ((q.used || 0) / (q.total || 1000)) * 100),
        unlimited: !!q.unlimited
      }));
    }

    for (const [key, val] of Object.entries<any>(rawQuotas)) {
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

  public async testConnection(connectionId: string): Promise<{ valid: boolean; error?: string }> {
    const config = vscode.workspace.getConfiguration('9router');
    const baseUrl = config.get<string>('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
    const token = this.getJwtToken();

    try {
      const res = await this.httpPost(`${baseUrl}/api/providers/${connectionId}/test`, {}, token);
      return { valid: !!res?.valid, error: res?.error };
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  }

  public async toggleConnection(connectionId: string, isActive: boolean): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('9router');
    const baseUrl = config.get<string>('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
    const token = this.getJwtToken();

    try {
      const res = await this.httpPut(`${baseUrl}/api/providers/${connectionId}`, { isActive }, token);
      return !!res;
    } catch {
      return false;
    }
  }

  private httpGet(urlStr: string, token: string | null): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(urlStr);
        const reqModule = url.protocol === 'https:' ? https : http;
        const headers: Record<string, string> = {};
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
              } catch {
                resolve(data);
              }
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          });
        });
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private httpPost(urlStr: string, body: any, token: string | null): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(urlStr);
        const reqModule = url.protocol === 'https:' ? https : http;
        const dataStr = JSON.stringify(body);
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Content-Length': String(Buffer.byteLength(dataStr))
        };
        if (token) {
          headers['Cookie'] = `auth_token=${token}`;
        }
        const req = reqModule.request(
          urlStr,
          { method: 'POST', headers, timeout: 6000 },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch {
                resolve(data);
              }
            });
          }
        );
        req.on('error', reject);
        req.write(dataStr);
        req.end();
      } catch (e) {
        reject(e);
      }
    });
  }

  private httpPut(urlStr: string, body: any, token: string | null): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(urlStr);
        const reqModule = url.protocol === 'https:' ? https : http;
        const dataStr = JSON.stringify(body);
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Content-Length': String(Buffer.byteLength(dataStr))
        };
        if (token) {
          headers['Cookie'] = `auth_token=${token}`;
        }
        const req = reqModule.request(
          urlStr,
          { method: 'PUT', headers, timeout: 6000 },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch {
                resolve(data);
              }
            });
          }
        );
        req.on('error', reject);
        req.write(dataStr);
        req.end();
      } catch (e) {
        reject(e);
      }
    });
  }
}
