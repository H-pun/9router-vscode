import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ReactFlow,
  Handle,
  Position,
  Controls,
  BaseEdge,
  getBezierPath,
  Node,
  Edge,
  ReactFlowInstance,
} from '@xyflow/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import '@xyflow/react/dist/style.css';
import './topology.css';

const FE_ACTIVE_TIMEOUT_MS = 60000;
const FE_ACTIVE_TICK_MS = 1000;
const KAME_PARTICLE_COUNT = 6;
const SPARK_COUNT = 5;

const AI_PROVIDERS: Record<string, { name: string; color: string; textIcon?: string }> = {
  antigravity: { name: 'Antigravity', color: '#f59e0b', textIcon: 'AG' },
  claude: { name: 'Claude Code', color: '#ea580c', textIcon: 'CC' },
  'claude-code': { name: 'Claude Code', color: '#ea580c', textIcon: 'CC' },
  deepseek: { name: 'DeepSeek', color: '#3b82f6', textIcon: 'DS' },
  azure: { name: 'Azure OpenAI', color: '#0284c7', textIcon: 'AZ' },
  'azure-openai': { name: 'Azure OpenAI', color: '#0284c7', textIcon: 'AZ' },
  kiro: { name: 'Kiro AI', color: '#8b5cf6', textIcon: 'KR' },
  codex: { name: 'Codex', color: '#10b981', textIcon: 'CX' },
  mimo: { name: 'MiMo Code Free', color: '#6366f1', textIcon: 'MM' },
  opencode: { name: 'OpenCode Free', color: '#ec4899', textIcon: 'OC' },
  gemini: { name: 'Gemini', color: '#38bdf8', textIcon: 'GM' },
  github: { name: 'GitHub Copilot', color: '#a855f7', textIcon: 'GH' },
};

function getProviderConfig(providerId: string) {
  return AI_PROVIDERS[providerId?.toLowerCase()] || { color: '#6b7280', name: providerId, textIcon: providerId?.slice(0, 2).toUpperCase() };
}

// 1. Provider Node
function ProviderNode({ data }: { data: any }) {
  const { label, color, imageUrl, textIcon, active } = data;
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        padding: '8px 14px',
        borderRadius: '8px',
        border: `2px solid ${active ? color : 'var(--vscode-tree-indentGuidesStroke, rgba(128,128,128,0.28))'}`,
        boxShadow: active ? `0 0 18px ${color}60` : '0 2px 8px rgba(0,0,0,0.35)',
        minWidth: '140px',
        background: 'var(--vscode-dropdown-background, #1e1e1e)',
        fontFamily: 'var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        transition: 'all 0.3s ease',
        userSelect: 'none',
      }}
    >
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0, width: 0, height: 0 }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ opacity: 0, width: 0, height: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0, width: 0, height: 0 }} />
      <Handle type="target" position={Position.Right} id="right" style={{ opacity: 0, width: 0, height: 0 }} />

      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: `${color}20`,
        }}
      >
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={label}
            style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '3px' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ fontSize: 'calc(var(--vscode-font-size, 13px) - 1px)', fontWeight: 'bold', color }}>{textIcon}</span>
        )}
      </div>

      <span
        style={{
          fontSize: 'var(--vscode-font-size, 13px)',
          fontWeight: 600,
          color: active ? color : 'var(--vscode-sideBar-foreground, #e0e0e0)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '0.2px',
        }}
      >
        {label}
      </span>

      {active && (
        <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px', flexShrink: 0, marginLeft: 'auto' }}>
          <span
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: color,
              opacity: 0.75,
              animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <span
            style={{
              position: 'relative',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
        </span>
      )}
    </div>
  );
}

// 2. Center 9Router Node
function RouterNode({ data }: { data: any }) {
  const powering = (data.activeCount || 0) > 0;
  return (
    <div
      className={powering ? 'topology-router-core' : ''}
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 18px',
        borderRadius: '12px',
        border: powering ? '2.5px solid #fde047' : '2px solid var(--vscode-focusBorder, #007fd4)',
        background: powering
          ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.35) 0%, rgba(250, 204, 21, 0.25) 50%, rgba(6, 182, 212, 0.3) 100%)'
          : 'var(--vscode-dropdown-background, #1e1e1e)',
        boxShadow: powering ? '0 0 22px rgba(234, 179, 8, 0.5)' : '0 4px 12px rgba(0,0,0,0.35)',
        minWidth: '130px',
        fontFamily: 'var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        userSelect: 'none',
      }}
    >
      <Handle type="source" position={Position.Top} id="top" style={{ opacity: 0, width: 0, height: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0, width: 0, height: 0 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0, width: 0, height: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0, width: 0, height: 0 }} />

      <span style={{ fontSize: 'calc(var(--vscode-font-size, 13px) + 5px)', marginRight: '8px' }} className={powering ? 'topology-router-icon' : ''}>
        🦊
      </span>
      <span
        style={{ fontSize: 'calc(var(--vscode-font-size, 13px) + 1px)', fontWeight: 'bold' }}
        className={powering ? 'topology-router-label' : ''}
      >
        9Router
      </span>
      {data.activeCount > 0 && (
        <span
          className="topology-router-badge"
          style={{
            marginLeft: '8px',
            padding: '2px 6px',
            borderRadius: '9999px',
            background: '#facc15',
            color: '#000',
            fontSize: 'calc(var(--vscode-font-size, 13px) - 2.5px)',
            fontWeight: 'bold',
          }}
        >
          {data.activeCount}
        </span>
      )}
    </div>
  );
}

// 3. Topology Edge
function TopologyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: any) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const active = !!data?.active;
  const stroke = style.stroke || 'var(--vscode-tree-indentGuidesStroke, rgba(128,128,128,0.25))';
  const filterId = `topo-electric-${id}`;

  if (!active) {
    return <BaseEdge id={id} path={edgePath} style={{ ...style, stroke }} />;
  }

  return (
    <g className="topology-edge-electric">
      <defs>
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="noise">
            <animate attributeName="baseFrequency" values="0.8;1.4;0.8" dur="0.25s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <path
        d={edgePath}
        fill="none"
        stroke="#22d3ee"
        strokeWidth={10}
        strokeOpacity={0.35}
        strokeLinecap="round"
        filter={`url(#${filterId})`}
        className="topology-edge-halo"
      />
      <path
        d={edgePath}
        fill="none"
        stroke="#4ade80"
        strokeWidth={5}
        strokeOpacity={0.85}
        strokeLinecap="round"
        filter={`url(#${filterId})`}
        className="topology-edge-plasma"
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: '#f8fafc', strokeWidth: 2.2, opacity: 1 }}
        className="topology-edge-kame"
      />

      {Array.from({ length: KAME_PARTICLE_COUNT }, (_, i) => (
        <circle
          key={`${id}-p-${i}`}
          r={i % 2 === 0 ? 4 : 2.5}
          fill={i % 3 === 0 ? '#fde047' : i % 3 === 1 ? '#67e8f9' : '#fff'}
          opacity={0.95}
          style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }}
        >
          <animateMotion
            dur={`${0.4 + i * 0.08}s`}
            repeatCount="indefinite"
            path={edgePath}
            begin={`${i * 0.09}s`}
          />
        </circle>
      ))}

      {Array.from({ length: SPARK_COUNT }, (_, i) => (
        <circle key={`${id}-s-${i}`} r={1.8} fill="#e0f2fe" opacity={0}>
          <animate
            attributeName="opacity"
            values="0;1;0;0;1;0"
            dur={`${0.35 + (i % 3) * 0.1}s`}
            begin={`${i * 0.07}s`}
            repeatCount="indefinite"
          />
          <animateMotion
            dur={`${0.28 + i * 0.05}s`}
            repeatCount="indefinite"
            path={edgePath}
            begin={`${i * 0.11}s`}
          />
        </circle>
      ))}
    </g>
  );
}

const nodeTypes = { provider: ProviderNode, router: RouterNode };
const edgeTypes = { topology: TopologyEdge };

function buildLayout(providers: any[], activeSet: Set<string>, lastSet: Set<string>, errorSet: Set<string>) {
  const nodeW = 160;
  const nodeH = 38;
  const routerW = 130;
  const routerH = 44;
  const nodeGap = 20;
  const count = providers.length;

  const minRx = ((nodeW + nodeGap) * count) / (2 * Math.PI);
  const rx = Math.max(260, minRx);
  const ry = Math.max(160, rx * 0.55);

  if (count === 0) {
    return {
      nodes: [{ id: 'router', type: 'router', position: { x: 0, y: 0 }, data: { activeCount: 0 }, draggable: false }],
      edges: [],
    };
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: 'router',
    type: 'router',
    position: { x: -routerW / 2, y: -routerH / 2 },
    data: { activeCount: activeSet.size },
    draggable: false,
  });

  const edgeStyle = (active: boolean, last: boolean, error: boolean) => {
    if (error) return { stroke: '#ef4444', strokeWidth: 2.5, opacity: 0.9 };
    if (active) return { stroke: '#22d3ee', strokeWidth: 3.5, opacity: 1 };
    if (last) return { stroke: '#f59e0b', strokeWidth: 2, opacity: 0.7 };
    return { stroke: 'var(--vscode-tree-indentGuidesStroke, rgba(128,128,128,0.22))', strokeWidth: 1, opacity: 0.3 };
  };

  providers.forEach((p, i) => {
    const config = getProviderConfig(p.provider);
    const active = activeSet.has(p.provider?.toLowerCase());
    const last = !active && lastSet.has(p.provider?.toLowerCase());
    const error = !active && errorSet.has(p.provider?.toLowerCase());
    const nodeId = `provider-${p.provider}`;

    const data = {
      label: (config.name !== p.provider ? config.name : null) || p.nodeName || p.name || p.provider,
      color: config.color || '#6b7280',
      imageUrl: p.imageUrl,
      textIcon: config.textIcon || (p.provider || '?').slice(0, 2).toUpperCase(),
      active,
    };

    const angle = -Math.PI / 2 + (2 * Math.PI * i) / count;
    const cx = rx * Math.cos(angle);
    const cy = ry * Math.sin(angle);

    let sourceHandle: string, targetHandle: string;
    if (Math.abs(angle + Math.PI / 2) < Math.PI / 4 || Math.abs(angle - (3 * Math.PI) / 2) < Math.PI / 4) {
      sourceHandle = 'top'; targetHandle = 'bottom';
    } else if (Math.abs(angle - Math.PI / 2) < Math.PI / 4) {
      sourceHandle = 'bottom'; targetHandle = 'top';
    } else if (cx > 0) {
      sourceHandle = 'right'; targetHandle = 'left';
    } else {
      sourceHandle = 'left'; targetHandle = 'right';
    }

    nodes.push({
      id: nodeId,
      type: 'provider',
      position: { x: cx - nodeW / 2, y: cy - nodeH / 2 },
      data,
      draggable: false,
    });

    edges.push({
      id: `e-${nodeId}`,
      type: 'topology',
      source: 'router',
      sourceHandle,
      target: nodeId,
      targetHandle,
      animated: false,
      data: { active },
      style: edgeStyle(active, last, error),
    });
  });

  return { nodes, edges };
}

declare global {
  interface Window {
    __PROVIDER_ICONS__?: Record<string, string>;
    __ICON_MAP__?: Record<string, string>;
    __TOPOLOGY_PROVIDERS__?: Array<{ provider: string; name: string }>;
    __INITIAL_CHART_DATA__?: Array<{ label: string; tokens: number; cost: number }>;
    __VSCODE__?: any;
  }
}

// ================= COMPONENT 1: TOPOLOGY GRAPH =================
export function ProviderTopologyApp() {
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const iconMap = window.__PROVIDER_ICONS__ || window.__ICON_MAP__ || {};
  const [topologyProviders, setTopologyProviders] = useState<Array<{ provider: string; name: string }>>(
    window.__TOPOLOGY_PROVIDERS__ || [
      { provider: 'antigravity', name: 'Antigravity' },
      { provider: 'claude', name: 'Claude Code' },
      { provider: 'opencode', name: 'OpenCode Free' },
      { provider: 'mimo', name: 'MiMo Code Free' },
    ]
  );

  const providers = useMemo(() => {
    return topologyProviders.map(p => ({
      ...p,
      imageUrl: iconMap[p.provider.toLowerCase()] || iconMap[p.provider],
    }));
  }, [topologyProviders, iconMap]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (msg && msg.type === 'usageStream' && msg.data) {
        const streamData = msg.data;
        if (streamData.activeRequests && streamData.activeRequests.length > 0) {
          setActiveRequests(streamData.activeRequests);
        } else if (streamData.recentRequests && streamData.recentRequests.length > 0) {
          const latest = streamData.recentRequests[0];
          if (latest && latest.provider) {
            setActiveRequests([{ provider: latest.provider }]);
            setTimeout(() => setActiveRequests([]), 7000);
          }
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const activeKey = useMemo(
    () => activeRequests.map((r) => r.provider?.toLowerCase()).filter(Boolean).sort().join(','),
    [activeRequests]
  );
  const rawActiveSet = useMemo(() => new Set(activeKey ? activeKey.split(',') : []), [activeKey]);
  const lastSet = useMemo(() => new Set<string>(), []);
  const errorSet = useMemo(() => new Set<string>(), []);

  const firstSeenRef = useRef<Record<string, number>>({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const seen = firstSeenRef.current;
    const now = Date.now();
    for (const p of rawActiveSet) {
      if (!seen[p]) seen[p] = now;
    }
    for (const p of Object.keys(seen)) {
      if (!rawActiveSet.has(p)) delete seen[p];
    }
  }, [rawActiveSet]);

  useEffect(() => {
    if (rawActiveSet.size === 0) return;
    const id = setInterval(() => setTick((t) => t + 1), FE_ACTIVE_TICK_MS);
    return () => clearInterval(id);
  }, [rawActiveSet]);

  const activeSet = useMemo(() => {
    const now = Date.now();
    const filtered = new Set<string>();
    for (const p of rawActiveSet) {
      const ts = firstSeenRef.current[p];
      if (!ts || now - ts < FE_ACTIVE_TIMEOUT_MS) filtered.add(p);
    }
    return filtered;
  }, [rawActiveSet, tick]);

  const { nodes, edges } = useMemo(
    () => buildLayout(providers, activeSet, lastSet, errorSet),
    [providers, activeSet, lastSet, errorSet]
  );

  const rfInstance = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fitOpts = { padding: 0.15, duration: 200 };

  const onInit = useCallback((instance: ReactFlowInstance) => {
    rfInstance.current = instance;
    setTimeout(() => instance.fitView(fitOpts), 50);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (rfInstance.current) rfInstance.current.fitView(fitOpts);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (rfInstance.current) {
      const id = setTimeout(() => rfInstance.current?.fitView(fitOpts), 50);
      return () => clearTimeout(id);
    }
  }, [nodes.length]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '220px', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={fitOpts}
        minZoom={0.1}
        maxZoom={2}
        onInit={onInit}
        proOptions={{ hideAttribution: true }}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        preventScrolling={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Controls showInteractive={false} className="react-flow-controls-custom" style={{ transform: 'scale(0.85)', transformOrigin: 'bottom left' }} />
      </ReactFlow>
    </div>
  );
}

// ================= COMPONENT 2: USAGE CHART (RECHARTS) =================
const fmtTokens = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n || 0);
};

const fmtCost = (n: number) => `$${(n || 0).toFixed(4)}`;

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
        padding: '8px 10px 4px 10px',
        boxSizing: 'border-box',
        gap: '10px',
        fontFamily: 'var(--vscode-font-family, sans-serif)',
      }}
    >
      {/* Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: '6px' }}>
        {/* Tokens / Cost Switch */}
        <div
          style={{
            display: 'inline-flex',
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid var(--vscode-button-border, rgba(128,128,128,0.25))',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('tokens')}
            style={{
              padding: '2px 10px',
              fontSize: '11px',
              fontFamily: 'var(--vscode-font-family, sans-serif)',
              fontWeight: viewMode === 'tokens' ? 600 : 400,
              color: viewMode === 'tokens'
                ? 'var(--vscode-button-foreground, #ffffff)'
                : 'var(--vscode-button-secondaryForeground, #cccccc)',
              background: viewMode === 'tokens'
                ? 'var(--vscode-button-background, #0e639c)'
                : 'var(--vscode-button-secondaryBackground, #313131)',
              border: 'none',
              borderRight: '1px solid var(--vscode-tree-indentGuidesStroke, rgba(128,128,128,0.2))',
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 0.1s ease',
            }}
          >
            Tokens
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cost')}
            style={{
              padding: '2px 10px',
              fontSize: '11px',
              fontFamily: 'var(--vscode-font-family, sans-serif)',
              fontWeight: viewMode === 'cost' ? 600 : 400,
              color: viewMode === 'cost'
                ? 'var(--vscode-button-foreground, #ffffff)'
                : 'var(--vscode-button-secondaryForeground, #cccccc)',
              background: viewMode === 'cost'
                ? 'var(--vscode-button-background, #0e639c)'
                : 'var(--vscode-button-secondaryBackground, #313131)',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 0.1s ease',
            }}
          >
            Cost
          </button>
        </div>

        {/* Period Selector Pills */}
        <div
          style={{
            display: 'inline-flex',
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid var(--vscode-button-border, rgba(128,128,128,0.25))',
          }}
        >
          {['today', '24h', '7d', '30d'].map((p, idx, arr) => {
            const isActive = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodChange(p)}
                style={{
                  padding: '2px 8px',
                  fontSize: '10.5px',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--vscode-font-family, sans-serif)',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? 'var(--vscode-button-foreground, #ffffff)'
                    : 'var(--vscode-button-secondaryForeground, #cccccc)',
                  background: isActive
                    ? 'var(--vscode-button-background, #0e639c)'
                    : 'var(--vscode-button-secondaryBackground, #313131)',
                  border: 'none',
                  borderRight: idx < arr.length - 1 ? '1px solid var(--vscode-tree-indentGuidesStroke, rgba(128,128,128,0.2))' : 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.1s ease',
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div style={{ flex: 1, minHeight: '170px', position: 'relative' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vscode-descriptionForeground)', fontSize: '11px' }}>
            Loading chart data...
          </div>
        ) : !hasData ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vscode-descriptionForeground)', fontSize: '11px', fontStyle: 'italic' }}>
            No activity recorded for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 6, left: -22, bottom: 4 }}>
              <defs>
                <linearGradient id="gradTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} stroke="var(--vscode-tree-indentGuidesStroke, #888)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9.5, fill: 'var(--vscode-descriptionForeground, #888)' }}
                tickLine={false}
                axisLine={false}
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

// Mount components
const mountEl = document.getElementById('xyflow-root');
if (mountEl) {
  const root = createRoot(mountEl);
  root.render(<ProviderTopologyApp />);
}

const chartMountEl = document.getElementById('chart-root');
if (chartMountEl) {
  const root = createRoot(chartMountEl);
  root.render(<UsageChartApp />);
}
