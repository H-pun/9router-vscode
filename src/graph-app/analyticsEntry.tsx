import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const fmtTokens = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n || 0);
};

const fmtCost = (n: number) => `$${(n || 0).toFixed(4)}`;

declare global {
  interface Window {
    __INITIAL_CHART_DATA__?: Array<{ label: string; tokens: number; cost: number }>;
    __VSCODE__?: any;
  }
}

export function UsageChartApp() {
  const [data, setData] = useState<any[]>(window.__INITIAL_CHART_DATA__ || []);
  const [period, setPeriod] = useState<string>('today');
  const [viewMode, setViewMode] = useState<'tokens' | 'cost'>('tokens');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (msg && msg.type === 'chartData' && msg.data) {
        setData(msg.data);
        setLoading(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handlePeriodChange = (nextPeriod: string) => {
    setPeriod(nextPeriod);
    setLoading(true);
    if (window.__VSCODE__) {
      window.__VSCODE__.postMessage({ command: 'fetchChart', period: nextPeriod });
    }
  };

  const hasData = data && data.length > 0 && data.some(d => d.tokens > 0 || d.cost > 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '8px',
        boxSizing: 'border-box',
        gap: '8px',
        fontFamily: 'var(--vscode-font-family, sans-serif)',
      }}
    >
      {/* Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        {/* Tokens / Cost Switch */}
        <div
          style={{
            display: 'inline-flex',
            borderRadius: '4px',
            border: '1px solid var(--vscode-dropdown-border, rgba(128,128,128,0.25))',
            background: 'var(--vscode-dropdown-background, #252526)',
            padding: '1px',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('tokens')}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: viewMode === 'tokens' ? 'bold' : 'normal',
              color: viewMode === 'tokens' ? '#ffffff' : 'var(--vscode-descriptionForeground, #999)',
              background: viewMode === 'tokens' ? '#6366f1' : 'transparent',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
            }}
          >
            Tokens
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cost')}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: viewMode === 'cost' ? 'bold' : 'normal',
              color: viewMode === 'cost' ? '#ffffff' : 'var(--vscode-descriptionForeground, #999)',
              background: viewMode === 'cost' ? '#f59e0b' : 'transparent',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
            }}
          >
            Cost
          </button>
        </div>

        {/* Period Selector */}
        <div style={{ display: 'inline-flex', gap: '3px' }}>
          {(['today', '24h', '7d', '30d'] as const).map((p) => {
            const isActive = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodChange(p)}
                style={{
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: isActive ? 700 : 500,
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--vscode-button-foreground, #fff)' : 'var(--vscode-descriptionForeground, #888)',
                  background: isActive ? 'var(--vscode-button-background, #0e639c)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--vscode-button-background, #0e639c)' : 'var(--vscode-dropdown-border, rgba(128,128,128,0.2))',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div style={{ flex: 1, minHeight: '180px', width: '100%', position: 'relative' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
              zIndex: 10,
              fontSize: '11px',
              color: 'var(--vscode-descriptionForeground, #aaa)',
            }}
          >
            Loading chart data...
          </div>
        )}

        {!hasData ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--vscode-descriptionForeground, #777)',
              fontSize: '11px',
              gap: '4px',
            }}
          >
            <span>No activity recorded for this period</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--vscode-tree-indentGuidesStroke, rgba(128,128,128,0.15))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9.5, fill: 'var(--vscode-descriptionForeground, #888)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--vscode-tree-indentGuidesStroke, rgba(128,128,128,0.2))' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9.5, fill: 'var(--vscode-descriptionForeground, #888)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={viewMode === 'tokens' ? fmtTokens : fmtCost}
                width={46}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--vscode-menu-background, #252526)',
                  borderColor: 'var(--vscode-menu-border, rgba(128,128,128,0.3))',
                  borderRadius: '6px',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  color: 'var(--vscode-sideBar-foreground, #fff)',
                  padding: '4px 8px',
                }}
                formatter={(value: any) =>
                  viewMode === 'tokens' ? [fmtTokens(Number(value)), 'Tokens'] : [fmtCost(Number(value)), 'Cost']
                }
              />
              {viewMode === 'tokens' ? (
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="url(#gradTokens)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#818cf8' }}
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  fill="url(#gradCost)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#fbbf24' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

const chartMountEl = document.getElementById('analytics-root');
if (chartMountEl) {
  const root = createRoot(chartMountEl);
  root.render(<UsageChartApp />);
}
