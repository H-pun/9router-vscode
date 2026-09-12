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
              animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
            }}
          />
          <span style={{ position: 'relative', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
        </span>
      )}
    </div>
  );
}

// 2. Center Router Node
function CenterRouterNode() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px 22px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(234,88,12,0.06))',
        border: '2px solid rgba(249,115,22,0.6)',
        boxShadow: '0 0 30px rgba(249,115,22,0.35)',
        minWidth: '120px',
        fontFamily: 'var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        userSelect: 'none',
      }}
    >
      <Handle type="source" position={Position.Top} id="top" style={{ opacity: 0, width: 0, height: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0, width: 0, height: 0 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0, width: 0, height: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0, width: 0, height: 0 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
          <line x1="6" y1="6" x2="6.01" y2="6"/>
          <line x1="10" y1="6" x2="10.01" y2="6"/>
          <line x1="6" y1="18" x2="6.01" y2="18"/>
          <line x1="10" y1="18" x2="10.01" y2="18"/>
          <path d="M18 10v4"/>
          <circle cx="18" cy="12" r="2" fill="#f97316" fillOpacity="0.5"/>
        </svg>
        <span style={{ fontSize: 'calc(var(--vscode-font-size, 13px) + 2px)', fontWeight: 800, color: '#f97316', letterSpacing: '0.5px' }}>
          9Router
        </span>
      </div>
      <span style={{ fontSize: 'calc(var(--vscode-font-size, 13px) - 2px)', color: 'var(--vscode-descriptionForeground, #888)', marginTop: '2px' }}>
        Core Hub
      </span>
    </div>
  );
}

// 3. Animated Edge
function ElectricEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: any) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const active = Boolean(data?.active);
  const color = data?.color || '#f97316';
  const filterId = `electric-${data?.direction || 'fwd'}-${data?.filterSeed || 0}`;

  return (
    <>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.95" numOctaves={3} result="noise" seed={data?.filterSeed || 1}>
              <animate attributeName="baseFrequency" dur="0.35s" values="0.04 0.95; 0.08 0.75; 0.03 0.98; 0.04 0.95" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={active ? 9 : 0} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <BaseEdge
        id={`${id}-base`}
        path={edgePath}
        style={{
          stroke: active ? color : 'var(--vscode-tree-indentGuidesStroke, rgba(128,128,128,0.25))',
          strokeWidth: active ? 3 : 1.5,
          opacity: active ? 0.9 : 0.45,
          filter: active ? `url(#${filterId})` : undefined,
          transition: 'all 0.4s ease',
        }}
      />

      {active && (
        <>
          <path
            d={edgePath}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="8, 12"
            style={{
              animation: 'dashdraw 0.6s linear infinite',
              opacity: 0.9,
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
          {Array.from({ length: KAME_PARTICLE_COUNT }).map((_, i) => (
            <circle key={i} r={i === 0 ? 3.5 : 2} fill={i === 0 ? '#ffffff' : color} opacity={0.9}>
              <animateMotion
                dur="1.2s"
                repeatCount="indefinite"
                path={edgePath}
                begin={`${(i * 1.2) / KAME_PARTICLE_COUNT}s`}
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="linear"
              />
            </circle>
          ))}
        </>
      )}
    </>
  );
}

const nodeTypes = {
  providerNode: ProviderNode,
  routerNode: CenterRouterNode,
};

const edgeTypes = {
  electric: ElectricEdge,
};

declare global {
  interface Window {
    __INITIAL_USAGE__?: any;
    __PROVIDER_ICONS__?: Record<string, string>;
    __TOPOLOGY_PROVIDERS__?: Array<{ provider: string; name: string }>;
    __VSCODE__?: any;
  }
}

export function ProviderTopologyApp() {
  const [activeProviders, setActiveProviders] = useState<Set<string>>(new Set());
  const [topologyProviders, setTopologyProviders] = useState<Array<{ provider: string; name: string }>>(
    window.__TOPOLOGY_PROVIDERS__ || []
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg) return;

      if (msg.type === 'usageStream' && msg.data) {
        const streamData = msg.data;
        const activeSet = new Set<string>();

        if (Array.isArray(streamData.activeRequests)) {
          streamData.activeRequests.forEach((req: any) => {
            if (req.provider) activeSet.add(req.provider.toLowerCase());
          });
        }

        if (Array.isArray(streamData.recentRequests) && streamData.recentRequests.length > 0) {
          const now = Date.now();
          streamData.recentRequests.forEach((req: any) => {
            const reqTime = new Date(req.timestamp).getTime();
            if (now - reqTime < FE_ACTIVE_TIMEOUT_MS && req.provider) {
              activeSet.add(req.provider.toLowerCase());
            }
          });
        }

        setActiveProviders(activeSet);
      } else if (msg.type === 'updateTopologyProviders' && Array.isArray(msg.providers)) {
        setTopologyProviders(msg.providers);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const fitOpts = useMemo(() => ({ padding: 0.15, duration: 250, minZoom: 0.1, maxZoom: 1.5 }), []);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    rfInstance.current = instance;
    setTimeout(() => instance.fitView(fitOpts), 50);
  }, [fitOpts]);

  // Layout calculation
  const { nodes, edges } = useMemo(() => {
    const iconMap = window.__PROVIDER_ICONS__ || {};
    const nList: Node[] = [];
    const eList: Edge[] = [];

    const centerNode: Node = {
      id: 'center-9router',
      type: 'routerNode',
      position: { x: 260, y: 180 },
      data: {},
    };
    nList.push(centerNode);

    const provCount = topologyProviders.length;
    if (provCount === 0) return { nodes: nList, edges: eList };

    const radiusX = Math.max(220, provCount * 28);
    const radiusY = Math.max(140, provCount * 20);
    const angleStep = (2 * Math.PI) / provCount;

    topologyProviders.forEach((tp, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const x = 260 + radiusX * Math.cos(angle) - 70;
      const y = 180 + radiusY * Math.sin(angle) - 20;

      const pId = tp.provider.toLowerCase();
      const cfg = getProviderConfig(pId);
      const isActive = activeProviders.has(pId);

      nList.push({
        id: `node-${pId}`,
        type: 'providerNode',
        position: { x, y },
        data: {
          label: tp.name || cfg.name,
          color: cfg.color,
          textIcon: cfg.textIcon,
          imageUrl: iconMap[pId] || iconMap[tp.provider],
          active: isActive,
        },
      });

      eList.push({
        id: `edge-center-${pId}`,
        source: 'center-9router',
        target: `node-${pId}`,
        type: 'electric',
        data: {
          active: isActive,
          color: cfg.color,
          filterSeed: (idx % 4) + 1,
        },
      });
    });

    return { nodes: nList, edges: eList };
  }, [topologyProviders, activeProviders]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (rfInstance.current) rfInstance.current.fitView(fitOpts);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitOpts]);

  useEffect(() => {
    if (rfInstance.current) {
      const id = setTimeout(() => rfInstance.current?.fitView(fitOpts), 50);
      return () => clearTimeout(id);
    }
  }, [nodes.length, fitOpts]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '260px', position: 'relative' }}>
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

const mountEl = document.getElementById('topology-root');
if (mountEl) {
  const root = createRoot(mountEl);
  root.render(<ProviderTopologyApp />);
}
