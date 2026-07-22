import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  Webhook,
  GitBranch,
  Clock,
  Repeat,
  UserCheck,
  Mail,
  MessageSquare,
  MessageCircle,
  Bell,
  Globe,
  Database,
  CreditCard,
  FileText,
  Brain,
  Code,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from 'lucide-react';
import { WorkflowNode, Connection, NodeType, NodeGroup } from '../../types';
import { NODE_METADATA } from '../../data/mockData';
import { generateConnectionPath } from '../../lib/workflowEngine';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  connections: Connection[];
  groups?: NodeGroup[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNodes: (nodes: WorkflowNode[]) => void;
  onUpdateConnections: (connections: Connection[]) => void;
  zoom: number;
  setZoom: (fn: (prev: number) => number) => void;
  gridSnap: boolean;
  onOpenCopilot: () => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  connections,
  groups = [],
  selectedNodeId,
  onSelectNode,
  onUpdateNodes,
  onUpdateConnections,
  zoom,
  setZoom,
  gridSnap,
  onOpenCopilot,
}) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connecting new edge line state
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'Webhook': return Webhook;
      case 'GitBranch': return GitBranch;
      case 'Clock': return Clock;
      case 'Repeat': return Repeat;
      case 'UserCheck': return UserCheck;
      case 'Mail': return Mail;
      case 'MessageSquare': return MessageSquare;
      case 'MessageCircle': return MessageCircle;
      case 'Bell': return Bell;
      case 'Globe': return Globe;
      case 'Database': return Database;
      case 'CreditCard': return CreditCard;
      case 'FileText': return FileText;
      case 'Brain': return Brain;
      case 'Code': return Code;
      default: return Zap;
    }
  };

  // Canvas Pan Handler
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      onSelectNode(null);
      setContextMenu(null);
      if (e.button === 0 || e.button === 1) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: (e.clientX - pan.x) / zoom, y: (e.clientY - pan.y) / zoom });

    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (draggingNodeId) {
      let rawX = (e.clientX - pan.x) / zoom - dragOffset.x;
      let rawY = (e.clientY - pan.y) / zoom - dragOffset.y;

      if (gridSnap) {
        rawX = Math.round(rawX / 20) * 20;
        rawY = Math.round(rawY / 20) * 20;
      }

      onUpdateNodes(
        nodes.map((n) => (n.id === draggingNodeId ? { ...n, x: rawX, y: rawY } : n))
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setConnectingSourceId(null);
  };

  // Zoom with Wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((prev) => Math.min(Math.max(0.2, prev * zoomFactor), 3.0));
    } else {
      setPan((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  // Node Drag Start
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    onSelectNode(nodeId);
    setContextMenu(null);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setDraggingNodeId(nodeId);
      setDragOffset({
        x: (e.clientX - pan.x) / zoom - node.x,
        y: (e.clientY - pan.y) / zoom - node.y,
      });
    }
  };

  // Output Port Connect Start
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingSourceId(nodeId);
  };

  // Input Port Connect Release
  const handlePortMouseUp = (e: React.MouseEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (connectingSourceId && connectingSourceId !== targetNodeId) {
      const exists = connections.some(
        (c) => c.sourceId === connectingSourceId && c.targetId === targetNodeId
      );
      if (!exists) {
        const newConn: Connection = {
          id: `conn-${Date.now()}`,
          sourceId: connectingSourceId,
          targetId: targetNodeId,
          animated: true,
        };
        onUpdateConnections([...connections, newConn]);
      }
    }
    setConnectingSourceId(null);
  };

  // Context Menu Right Click
  const handleContextMenu = (e: React.MouseEvent, nodeId?: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };

  const handleDuplicateNode = (nodeId: string) => {
    const orig = nodes.find((n) => n.id === nodeId);
    if (orig) {
      const newNode: WorkflowNode = {
        ...orig,
        id: `node-${Date.now()}`,
        x: orig.x + 40,
        y: orig.y + 40,
        data: { ...orig.data, label: `${orig.data.label} (Copy)` },
      };
      onUpdateNodes([...nodes, newNode]);
    }
    setContextMenu(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    onUpdateNodes(nodes.filter((n) => n.id !== nodeId));
    onUpdateConnections(connections.filter((c) => c.sourceId !== nodeId && c.targetId !== nodeId));
    if (selectedNodeId === nodeId) onSelectNode(null);
    setContextMenu(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => handleContextMenu(e)}
      className="relative w-full h-full overflow-hidden bg-[#0C0C0C] select-none cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: 'radial-gradient(#222222 1px, transparent 1px)',
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* SVG Container for Connectors and Animated Paths */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
          </marker>
        </defs>

        {/* Existing Connections */}
        {connections.map((conn) => {
          const sourceNode = nodes.find((n) => n.id === conn.sourceId);
          const targetNode = nodes.find((n) => n.id === conn.targetId);

          if (!sourceNode || !targetNode) return null;

          const sourcePos = { x: sourceNode.x + 224, y: sourceNode.y + 40 };
          const targetPos = { x: targetNode.x, y: targetNode.y + 40 };

          const pathD = generateConnectionPath(sourcePos, targetPos);

          return (
            <g key={conn.id} className="group cursor-pointer">
              {/* Background hover line */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                className="pointer-events-auto"
                onClick={() => {
                  onUpdateConnections(connections.filter((c) => c.id !== conn.id));
                }}
              />
              {/* Visible Line with Gradient */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#edgeGradient)"
                strokeWidth={2.5}
                markerEnd="url(#arrow)"
                className="opacity-90 group-hover:opacity-100 transition-opacity"
              />

              {/* Moving Pulse Circle along Path */}
              {conn.animated && (
                <circle r={3.5} fill="#6366f1">
                  <animateMotion path={pathD} dur="3s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Edge Label if any */}
              {conn.label && (
                <text
                  x={(sourcePos.x + targetPos.x) / 2}
                  y={(sourcePos.y + targetPos.y) / 2 - 8}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-bold"
                >
                  {conn.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Connecting Line while dragging new edge */}
        {connectingSourceId && (
          <path
            d={generateConnectionPath(
              {
                x: (nodes.find((n) => n.id === connectingSourceId)?.x || 0) + 224,
                y: (nodes.find((n) => n.id === connectingSourceId)?.y || 0) + 40,
              },
              mousePos
            )}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="6,6"
          />
        )}
      </svg>

      {/* Nodes Render Container */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {nodes.map((node) => {
          const meta = NODE_METADATA[node.type];
          const IconComponent = getIcon(meta.iconName);
          const isSelected = selectedNodeId === node.id;

          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onContextMenu={(e) => handleContextMenu(e, node.id)}
              style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
              }}
              className={`absolute w-56 bg-[#161616] border rounded-xl overflow-hidden shadow-2xl pointer-events-auto transition-all ${
                isSelected
                  ? 'border-2 border-indigo-500/80 shadow-indigo-500/20 z-10'
                  : 'border-[#222] hover:border-slate-700'
              }`}
            >
              {/* Input Target Connection Port */}
              {node.type !== 'trigger' && node.type !== 'webhook' && (
                <div
                  onMouseUp={(e) => handlePortMouseUp(e, node.id)}
                  className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#161616] border border-indigo-500 hover:bg-indigo-500 transition-colors flex items-center justify-center cursor-crosshair group shadow-md z-20"
                  title="Connect input port"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:bg-white"></div>
                </div>
              )}

              {/* Output Source Connection Port */}
              <div
                onMouseDown={(e) => handlePortMouseDown(e, node.id)}
                className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#161616] border border-indigo-500 hover:bg-indigo-500 transition-colors flex items-center justify-center cursor-crosshair group shadow-md z-20"
                title="Drag output port to connect"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:bg-white"></div>
              </div>

              {/* Node Card Header */}
              <div className="bg-[#1A1A1A] p-3 border-b border-[#222] flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div>
                  <span className="text-xs font-bold text-white uppercase truncate">
                    {node.data.label}
                  </span>
                </div>
                {meta.category === 'ai' && (
                  <span className="bg-indigo-500 text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold shrink-0">
                    PRO
                  </span>
                )}
              </div>

              {/* Node Card Body */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Description
                  </p>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    {node.data.description || meta.description}
                  </p>
                </div>

                {/* Optional code snippet preview */}
                {node.type === 'webhook' && (
                  <div className="bg-[#0A0A0A] p-2 rounded border border-[#222] text-[10px] font-mono text-indigo-400 truncate">
                    https://api.autoflow.ai/v1/hook...
                  </div>
                )}

                {/* Execution Status Badge */}
                {node.data.status && (
                  <div className="pt-1 flex items-center justify-between text-[10px] border-t border-[#222]">
                    <span className="flex items-center gap-1 font-semibold text-slate-400">
                      {node.data.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {node.data.status === 'running' && (
                        <span className="w-2.5 h-2.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
                      )}
                      {node.data.status === 'failed' && <AlertCircle className="w-3 h-3 text-rose-400" />}
                      <span className="capitalize text-slate-300">{node.data.status}</span>
                    </span>

                    {node.data.executionTimeMs && (
                      <span className="text-slate-500 font-mono">{node.data.executionTimeMs}ms</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Context Menu Right-Click */}
      {contextMenu && (
        <div
          style={{ left: contextMenu.x, top: contextMenu.y }}
          className="fixed z-50 w-44 bg-[#161616] border border-[#222] rounded-xl shadow-2xl p-1 text-xs space-y-0.5 text-slate-300"
        >
          {contextMenu.nodeId ? (
            <>
              <button
                onClick={() => handleDuplicateNode(contextMenu.nodeId!)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#222] text-slate-300"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate Node</span>
              </button>
              <button
                onClick={onOpenCopilot}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#222] text-indigo-400"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>AI Explain Node</span>
              </button>
              <div className="border-t border-[#222] my-1"></div>
              <button
                onClick={() => handleDeleteNode(contextMenu.nodeId!)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-950/40 text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Node</span>
              </button>
            </>
          ) : (
            <div className="p-2 text-[10px] text-slate-500 text-center">
              Right-click canvas or node for options
            </div>
          )}
        </div>
      )}
    </div>
  );
};
