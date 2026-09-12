import * as vscode from 'vscode';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { UsageStreamData } from '../dataProvider';

export class UsageStreamService {
  private static instance: UsageStreamService;
  private secrets?: vscode.SecretStorage;
  private listeners: Set<(data: UsageStreamData) => void> = new Set();
  private req: http.ClientRequest | null = null;
  private isDestroyed = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxBuffer = 200;

  private currentData: UsageStreamData = {
    totalRequests: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    activeRequests: [],
    recentRequests: [],
    byProvider: {},
    lastUpdated: undefined
  };

  private constructor() {}

  public static getInstance(): UsageStreamService {
    if (!UsageStreamService.instance) {
      UsageStreamService.instance = new UsageStreamService();
    }
    return UsageStreamService.instance;
  }

  public init(context: vscode.ExtensionContext): void {
    this.secrets = context.secrets;
    this.connect();

    context.subscriptions.push({
      dispose: () => this.dispose()
    });
  }

  public getSnapshot(): UsageStreamData {
    return {
      ...this.currentData,
      activeRequests: [...this.currentData.activeRequests],
      recentRequests: [...this.currentData.recentRequests]
    };
  }

  public subscribe(listener: (data: UsageStreamData) => void): () => void {
    this.listeners.add(listener);
    // Send immediate current snapshot to new subscriber
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  }

  public reconnect(): void {
    if (this.req) {
      this.req.destroy();
      this.req = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.connect();
  }

  private async getJwtToken(): Promise<string | null> {
    if (this.secrets) {
      const secretKey = await this.secrets.get('9router.apiKey');
      if (secretKey && secretKey.trim().length > 0) {
        return secretKey.trim();
      }
    }

    const legacyKey = vscode.workspace.getConfiguration('9router').get<string>('apiKey');
    if (legacyKey && legacyKey.trim().length > 0) {
      return legacyKey.trim();
    }

    const secretPath = path.join(os.homedir(), '.9router', 'jwt-secret');
    if (!fs.existsSync(secretPath)) {
      return null;
    }

    try {
      const secret = fs.readFileSync(secretPath, 'utf8').trim();
      if (!secret) return null;

      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          authenticated: true,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400 * 30
        })
      ).toString('base64url');
      const unsigned = `${header}.${payload}`;

      const sig = crypto.createHmac('sha256', secret).update(unsigned).digest('base64url');
      return `${unsigned}.${sig}`;
    } catch {
      return null;
    }
  }

  private async connect(): Promise<void> {
    if (this.isDestroyed) return;

    const config = vscode.workspace.getConfiguration('9router');
    const baseUrl = config.get<string>('baseUrl', 'http://localhost:20128').replace(/\/+$/, '');
    const token = await this.getJwtToken();

    try {
      const url = new URL(`${baseUrl}/api/usage/stream`);
      const reqModule = url.protocol === 'https:' ? https : http;
      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      };
      if (token) {
        headers['Cookie'] = `auth_token=${token}`;
      }

      this.req = reqModule.get(url.toString(), { headers, timeout: 0 }, (res) => {
        if (res.statusCode !== 200) {
          this.scheduleReconnect(5000);
          return;
        }

        let buffer = '';
        res.on('data', (chunk) => {
          if (this.isDestroyed) return;
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                this.updateData(parsed);
              } catch {}
            }
          }
        });

        res.on('end', () => {
          this.scheduleReconnect(3000);
        });

        res.on('error', () => {
          this.scheduleReconnect(5000);
        });
      });

      this.req.on('error', () => {
        this.scheduleReconnect(5000);
      });
    } catch {
      this.scheduleReconnect(5000);
    }
  }

  private updateData(parsed: any): void {
    // Merge new requests into buffer
    const newRecent = Array.isArray(parsed.recentRequests) ? parsed.recentRequests : [];
    
    // Combine existing recent with new while deduplicating by timestamp & model if needed
    const combinedRecent = [...newRecent];
    if (combinedRecent.length > this.maxBuffer) {
      combinedRecent.length = this.maxBuffer;
    }

    this.currentData = {
      totalRequests: parsed.totalRequests ?? this.currentData.totalRequests,
      totalPromptTokens: parsed.totalPromptTokens ?? this.currentData.totalPromptTokens,
      totalCompletionTokens: parsed.totalCompletionTokens ?? this.currentData.totalCompletionTokens,
      activeRequests: parsed.activeRequests || [],
      recentRequests: combinedRecent,
      byProvider: parsed.byProvider || this.currentData.byProvider,
      lastUpdated: new Date().toLocaleTimeString()
    };

    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch {}
    }
  }

  private scheduleReconnect(delayMs: number): void {
    if (this.isDestroyed || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delayMs);
  }

  public dispose(): void {
    this.isDestroyed = true;
    if (this.req) {
      this.req.destroy();
      this.req = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.listeners.clear();
  }
}
