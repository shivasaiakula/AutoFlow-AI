import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { VoiceWorkflowModal } from './components/VoiceWorkflowModal';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { NodePalette } from './components/canvas/NodePalette';
import { NodeInspector } from './components/canvas/NodeInspector';
import { CanvasToolbar } from './components/canvas/CanvasToolbar';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { Minimap } from './components/canvas/Minimap';
import { ExecutionTerminal, TerminalLog } from './components/canvas/ExecutionTerminal';
import { CollaborationBar } from './components/collaboration/CollaborationBar';
import { AIOptimizerView } from './components/views/AIOptimizerView';
import { MarketplaceView } from './components/views/MarketplaceView';
import { ROICalculatorView } from './components/views/ROICalculatorView';
import { DigitalEmployeeView } from './components/views/DigitalEmployeeView';
import { MeetingToWorkflowView } from './components/views/MeetingToWorkflowView';
import { AnalyticsDashboard } from './components/views/AnalyticsDashboard';

import { MOCK_WORKFLOWS, NODE_METADATA } from './data/mockData';
import { Workflow, WorkflowNode, Connection, NodeType, ViewMode } from './types';
import { validateWorkflow, autoLayoutWorkflow } from './lib/workflowEngine';

export default function App() {
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(MOCK_WORKFLOWS[0].id);
  const [activeView, setActiveView] = useState<ViewMode>('canvas');

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Modals & Panels
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

  // Active Workflow state
  const currentWorkflow = workflows.find((w) => w.id === activeWorkflowId) || workflows[0];
  const [nodes, setNodes] = useState<WorkflowNode[]>(currentWorkflow.nodes);
  const [connections, setConnections] = useState<Connection[]>(currentWorkflow.connections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Canvas State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [gridSnap, setGridSnap] = useState<boolean>(true);

  // Undo / Redo Stacks
  const [history, setHistory] = useState<{ nodes: WorkflowNode[]; connections: Connection[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Terminal Execution Logs
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Synchronize when switching active workflow
  useEffect(() => {
    const wf = workflows.find((w) => w.id === activeWorkflowId);
    if (wf) {
      setNodes(wf.nodes);
      setConnections(wf.connections);
      setSelectedNodeId(null);
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [activeWorkflowId]);

  // Dark mode class toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update State & History helper
  const updateNodesAndConns = (newNodes: WorkflowNode[], newConns: Connection[]) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), { nodes: newNodes, connections: newConns }]);
    setHistoryIndex((prev) => prev + 1);
    setNodes(newNodes);
    setConnections(newConns);

    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === activeWorkflowId ? { ...w, nodes: newNodes, connections: newConns, updatedAt: 'Just now' } : w
      )
    );
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setNodes(prev.nodes);
      setConnections(prev.connections);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setNodes(next.nodes);
      setConnections(next.connections);
    }
  };

  // Add Node from Palette
  const handleAddNode = (type: NodeType) => {
    const meta = NODE_METADATA[type];
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      x: Math.round((300 - pan.x) / zoom),
      y: Math.round((200 - pan.y) / zoom),
      data: {
        label: meta.label,
        description: meta.description,
        config: meta.defaultConfig || {},
        status: 'idle',
      },
    };
    updateNodesAndConns([...nodes, newNode], connections);
    setSelectedNodeId(newNode.id);
  };

  // Run Workflow Simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTerminalOpen(true);
    setTerminalLogs([
      {
        id: `log-start`,
        nodeLabel: 'Workflow Engine',
        timestamp: new Date().toLocaleTimeString(),
        status: 'running',
        message: `Starting execution simulation for "${currentWorkflow.name}"...`,
      },
    ]);

    nodes.forEach((node, index) => {
      setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n))
        );

        setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) =>
              n.id === node.id
                ? { ...n, data: { ...n.data, status: 'success', executionTimeMs: Math.floor(Math.random() * 80 + 20) } }
                : n
            )
          );

          setTerminalLogs((prev) => [
            ...prev,
            {
              id: `log-${node.id}`,
              nodeId: node.id,
              nodeLabel: node.data.label,
              timestamp: new Date().toLocaleTimeString(),
              status: 'success',
              message: `Executed node [${node.type}]. Payload response HTTP 200.`,
              durationMs: Math.floor(Math.random() * 80 + 20),
            },
          ]);

          if (index === nodes.length - 1) {
            setIsSimulating(false);
            setTerminalLogs((prev) => [
              ...prev,
              {
                id: `log-complete`,
                nodeLabel: 'Workflow Engine',
                timestamp: new Date().toLocaleTimeString(),
                status: 'success',
                message: `Workflow "${currentWorkflow.name}" executed successfully. Total 0 errors.`,
              },
            ]);
          }
        }, 500);
      }, (index + 1) * 700);
    });
  };

  // Import / Generated Workflow Handler
  const handleImportWorkflow = (wfData: Partial<Workflow>) => {
    const newWf: Workflow = {
      id: `wf-${Date.now()}`,
      name: wfData.name || 'New AI Generated Workflow',
      description: wfData.description || 'Generated by AutoFlow AI',
      category: wfData.category || 'Custom',
      nodes: wfData.nodes || [],
      connections: wfData.connections || [],
      updatedAt: 'Just now',
      healthScore: 96,
      optimizationScore: 92,
    };
    setWorkflows((prev) => [newWf, ...prev]);
    setActiveWorkflowId(newWf.id);
    setActiveView('canvas');
  };

  const validationIssues = validateWorkflow(nodes, connections);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none">
      {/* Top Navigation Bar */}
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        workflows={workflows}
        activeWorkflowId={activeWorkflowId}
        onSelectWorkflow={setActiveWorkflowId}
        onNewWorkflow={() => {
          const freshWf: Workflow = {
            id: `wf-${Date.now()}`,
            name: 'Untitled AI Workflow',
            description: 'Custom blank workflow workspace',
            category: 'Custom',
            nodes: [
              {
                id: 'n-start',
                type: 'trigger',
                x: 150,
                y: 200,
                data: { label: 'Webhook Event', description: 'Triggers on HTTP POST', config: {} },
              },
            ],
            connections: [],
            updatedAt: 'Just now',
          };
          setWorkflows((prev) => [freshWf, ...prev]);
          setActiveWorkflowId(freshWf.id);
          setActiveView('canvas');
        }}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
        onRunSimulation={handleRunSimulation}
        isSimulating={isSimulating}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main View Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Canvas Builder View */}
        {activeView === 'canvas' && (
          <div className="flex-1 flex relative overflow-hidden">
            {/* Left Node Palette Sidebar */}
            <NodePalette onAddNode={handleAddNode} />

            {/* Canvas Main Interactive Workspace */}
            <div className="flex-1 relative overflow-hidden">
              <CanvasToolbar
                zoom={zoom}
                onZoomIn={() => setZoom((prev) => Math.min(3.0, prev * 1.2))}
                onZoomOut={() => setZoom((prev) => Math.max(0.2, prev / 1.2))}
                onZoomReset={() => setZoom(1.0)}
                gridSnap={gridSnap}
                onToggleGridSnap={() => setGridSnap(!gridSnap)}
                onAutoLayout={() => {
                  const { nodes: lNodes, connections: lConns } = autoLayoutWorkflow(nodes, connections);
                  updateNodesAndConns(lNodes, lConns);
                }}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                validationIssues={validationIssues}
                onOpenValidation={() => setTerminalOpen(true)}
                onRunSimulation={handleRunSimulation}
                isSimulating={isSimulating}
                onClearCanvas={() => updateNodesAndConns([], [])}
                onOpenOptimizer={() => setOptimizerOpen(true)}
                healthScore={currentWorkflow.healthScore || 94}
              />

              <WorkflowCanvas
                nodes={nodes}
                connections={connections}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                onUpdateNodes={(updatedNodes) => updateNodesAndConns(updatedNodes, connections)}
                onUpdateConnections={(updatedConns) => updateNodesAndConns(nodes, updatedConns)}
                zoom={zoom}
                setZoom={setZoom}
                gridSnap={gridSnap}
                onOpenCopilot={() => setCopilotOpen(true)}
              />

              {/* Minimap Overlay */}
              <Minimap nodes={nodes} pan={pan} zoom={zoom} />

              {/* Real-time Collaboration Bar */}
              <CollaborationBar />

              {/* Terminal Execution Bottom Output */}
              <ExecutionTerminal
                isOpen={terminalOpen}
                onToggle={() => setTerminalOpen(!terminalOpen)}
                logs={terminalLogs}
                isSimulating={isSimulating}
                onRunSimulation={handleRunSimulation}
                onClearLogs={() => setTerminalLogs([])}
              />
            </div>

            {/* Right Node Inspector Drawer */}
            {selectedNode && (
              <NodeInspector
                node={selectedNode}
                onClose={() => setSelectedNodeId(null)}
                onUpdateNode={(updated) =>
                  updateNodesAndConns(
                    nodes.map((n) => (n.id === updated.id ? updated : n)),
                    connections
                  )
                }
                onDeleteNode={(id) => {
                  updateNodesAndConns(
                    nodes.filter((n) => n.id !== id),
                    connections.filter((c) => c.sourceId !== id && c.targetId !== id)
                  );
                  setSelectedNodeId(null);
                }}
              />
            )}
          </div>
        )}

        {/* Marketplace View */}
        {activeView === 'marketplace' && (
          <div className="flex-1 overflow-y-auto">
            <MarketplaceView onInstallTemplate={handleImportWorkflow} />
          </div>
        )}

        {/* ROI Calculator View */}
        {activeView === 'roi' && (
          <div className="flex-1 overflow-y-auto">
            <ROICalculatorView />
          </div>
        )}

        {/* Digital Employee View */}
        {activeView === 'employee' && (
          <div className="flex-1 overflow-y-auto">
            <DigitalEmployeeView />
          </div>
        )}

        {/* Meeting-to-Workflow Generator View */}
        {activeView === 'meeting' && (
          <div className="flex-1 overflow-y-auto">
            <MeetingToWorkflowView onImportWorkflow={handleImportWorkflow} />
          </div>
        )}

        {/* Live Analytics Dashboard */}
        {activeView === 'analytics' && (
          <div className="flex-1 overflow-y-auto">
            <AnalyticsDashboard />
          </div>
        )}
      </div>

      {/* Floating Modals and Drawers */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectView={setActiveView}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
        onRunSimulation={handleRunSimulation}
      />

      <VoiceWorkflowModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onWorkflowGenerated={handleImportWorkflow}
      />

      <AICopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        workflow={currentWorkflow}
      />

      {optimizerOpen && (
        <AIOptimizerView
          workflow={currentWorkflow}
          onClose={() => setOptimizerOpen(false)}
          onApplyOptimization={() => {
            alert('AI Optimizations successfully applied! Node execution latency reduced by 240ms.');
          }}
        />
      )}
    </div>
  );
}
