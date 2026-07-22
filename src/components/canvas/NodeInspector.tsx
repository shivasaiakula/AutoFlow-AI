import React, { useState } from 'react';
import {
  X,
  Trash2,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Sliders,
  Terminal,
} from 'lucide-react';
import { WorkflowNode } from '../../types';
import { NODE_METADATA } from '../../data/mockData';

interface NodeInspectorProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onUpdateNode: (updated: WorkflowNode) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onClose,
  onUpdateNode,
  onDeleteNode,
}) => {
  if (!node) return null;

  const meta = NODE_METADATA[node.type];
  const [label, setLabel] = useState(node.data.label);
  const [description, setDescription] = useState(node.data.description || '');
  const [config, setConfig] = useState<Record<string, any>>(node.data.config || {});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(node.data.lastRunOutput || null);

  const handleSave = (newConfig?: Record<string, any>) => {
    onUpdateNode({
      ...node,
      data: {
        ...node.data,
        label,
        description,
        config: newConfig || config,
        lastRunOutput: testResult || node.data.lastRunOutput,
      },
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    handleSave(updated);
  };

  const handleTestNode = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      const res = `[OK 200] Simulated payload response for "${label}". Execution time: 42ms. Output verified.`;
      setTestResult(res);
      onUpdateNode({
        ...node,
        data: {
          ...node.data,
          status: 'success',
          lastRunOutput: res,
          executionTimeMs: 42,
        },
      });
    }, 600);
  };

  return (
    <div className="w-80 bg-[#0A0A0A] border-l border-[#1F1F1F] flex flex-col h-full shadow-2xl select-none z-20">
      {/* Header */}
      <div className="p-3.5 border-b border-[#1F1F1F] flex items-center justify-between bg-[#161616]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Configure Node</h3>
            <span className="text-[10px] uppercase font-mono text-slate-500">{node.type}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-500 hover:text-white hover:bg-[#222]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title & Description */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Node Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
            }}
            onBlur={() => handleSave()}
            className="w-full bg-[#161616] border border-[#222] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            onBlur={() => handleSave()}
            placeholder="Explain what this node performs..."
            className="w-full bg-[#161616] border border-[#222] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Dynamic Config Fields based on type */}
        <div className="pt-2 border-t border-[#1F1F1F] space-y-3">
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">
            Parameters & Rules
          </h4>

          {Object.entries(config).map(([key, val]) => (
            <div key={key}>
              <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">
                {key}
              </label>
              {typeof val === 'boolean' ? (
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => handleConfigChange(key, e.target.checked)}
                  className="rounded text-indigo-600 bg-[#161616] border-[#222]"
                />
              ) : (
                <input
                  type="text"
                  value={String(val)}
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                  className="w-full bg-[#161616] border border-[#222] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              )}
            </div>
          ))}
        </div>

        {/* Test Node Execution Section */}
        <div className="pt-3 border-t border-[#1F1F1F]">
          <button
            onClick={handleTestNode}
            disabled={isTesting}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#161616] hover:bg-[#1A1A1A] text-xs font-medium text-white transition-colors border border-[#222]"
          >
            {isTesting ? (
              <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
            )}
            <span>Test Node Execution</span>
          </button>

          {testResult && (
            <div className="mt-3 p-2.5 rounded-lg bg-[#0A0A0A] text-slate-200 text-[11px] font-mono leading-relaxed border border-[#222]">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold mb-1">
                <CheckCircle2 className="w-3 h-3" />
                Execution Output
              </div>
              <p className="text-[10px] text-slate-400 break-words">{testResult}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[#1F1F1F] bg-[#161616] flex items-center justify-between">
        <button
          onClick={() => onDeleteNode(node.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Node</span>
        </button>

        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg shadow-indigo-500/20"
        >
          Done
        </button>
      </div>
    </div>
  );
};
