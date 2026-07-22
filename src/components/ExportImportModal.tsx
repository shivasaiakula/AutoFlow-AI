import React, { useState } from 'react';
import { Download, Upload, Copy, Check, FileJson, Sparkles, X, RefreshCw, Layers } from 'lucide-react';
import { Workflow, WorkflowNode, Connection } from '../types';
import { autoLayoutWorkflow } from '../lib/workflowEngine';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow;
  nodes: WorkflowNode[];
  connections: Connection[];
  onImportWorkflow: (importedNodes: WorkflowNode[], importedConnections: Connection[], name?: string) => void;
}

const SAMPLE_TEMPLATES = [
  {
    id: 'tpl-lead-scoring',
    title: 'AI Lead Scoring & CRM Router',
    description: 'Triggers on incoming Webhook, analyzes inquiry sentiment with Gemini AI, and routes hot leads to Sales Slack.',
    nodes: [
      {
        id: 'node-wh',
        type: 'webhook',
        x: 100,
        y: 180,
        data: { label: 'Inbound Inquiry Webhook', description: 'Triggers on POST request from contact form', config: { method: 'POST', endpoint: '/v1/leads' } },
      },
      {
        id: 'node-ai',
        type: 'ai_decision',
        x: 360,
        y: 180,
        data: { label: 'Gemini Intent & Score AI', description: 'Evaluates lead intent score (0-100)', config: { model: 'gemini-2.5-flash', threshold: 75 } },
      },
      {
        id: 'node-cond',
        type: 'condition',
        x: 620,
        y: 180,
        data: { label: 'Is Lead Score > 75?', description: 'Branch logic based on AI score', config: { condition: 'score > 75' } },
      },
      {
        id: 'node-slack',
        type: 'notification',
        x: 880,
        y: 100,
        data: { label: 'Slack Priority Alert', description: 'Sends instant alert to #sales-hot-leads', config: { channel: '#sales-hot-leads' } },
      },
      {
        id: 'node-crm',
        type: 'database',
        x: 880,
        y: 260,
        data: { label: 'Update CRM Record', description: 'Stores lead in PostgreSQL database', config: { table: 'leads', status: 'nurture' } },
      },
    ] as WorkflowNode[],
    connections: [
      { id: 'c1', sourceId: 'node-wh', targetId: 'node-ai', label: 'JSON Payload' },
      { id: 'c2', sourceId: 'node-ai', targetId: 'node-cond', label: 'AI Output' },
      { id: 'c3', sourceId: 'node-cond', targetId: 'node-slack', label: 'True (Hot Lead)' },
      { id: 'c4', sourceId: 'node-cond', targetId: 'node-crm', label: 'False (Nurture)' },
    ] as Connection[],
  },
  {
    id: 'tpl-support-bot',
    title: 'Support Email Auto-Responder & Escalation',
    description: 'Polls support mailbox, generates AI response draft, requires approval if customer churn risk is high.',
    nodes: [
      {
        id: 'node-email-trig',
        type: 'trigger',
        x: 100,
        y: 180,
        data: { label: 'New Support Email', description: 'Triggers on unread emails in support@box.com', config: { interval: '5m' } },
      },
      {
        id: 'node-doc',
        type: 'document',
        x: 360,
        y: 180,
        data: { label: 'Parse Knowledge Base', description: 'Retrieves relevant FAQ articles', config: { index: 'kb_articles' } },
      },
      {
        id: 'node-gen-reply',
        type: 'ai_decision',
        x: 620,
        y: 180,
        data: { label: 'Gemini Auto-Draft Reply', description: 'Generates empathetic solution draft', config: { prompt: 'Draft helpful support response' } },
      },
      {
        id: 'node-appr',
        type: 'approval',
        x: 880,
        y: 180,
        data: { label: 'Human Manager Approval', description: 'Requires Manager sign-off before dispatching', config: { approver: 'support-lead@company.com' } },
      },
      {
        id: 'node-send',
        type: 'email',
        x: 1140,
        y: 180,
        data: { label: 'Send Email Response', description: 'Dispatches approved reply to customer', config: { from: 'support@company.com' } },
      },
    ] as WorkflowNode[],
    connections: [
      { id: 'c1', sourceId: 'node-email-trig', targetId: 'node-doc' },
      { id: 'c2', sourceId: 'node-doc', targetId: 'node-gen-reply' },
      { id: 'c3', sourceId: 'node-gen-reply', targetId: 'node-appr' },
      { id: 'c4', sourceId: 'node-appr', targetId: 'node-send', label: 'Approved' },
    ] as Connection[],
  },
];

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  workflow,
  nodes,
  connections,
  onImportWorkflow,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'templates'>('export');
  const [importJson, setImportJson] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportedData = JSON.stringify(
    {
      name: workflow.name,
      description: workflow.description,
      version: '2.4.1',
      exportedAt: new Date().toISOString(),
      nodes,
      connections,
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(exportedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.toLowerCase().replace(/\s+/g, '-')}-workflow.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    try {
      setErrorMsg(null);
      const parsed = JSON.parse(importJson);
      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        throw new Error('Invalid JSON format: missing "nodes" array.');
      }
      const importedConns = parsed.connections || [];
      const layouted = autoLayoutWorkflow(parsed.nodes, importedConns);
      onImportWorkflow(layouted.nodes, layouted.connections, parsed.name);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse JSON string.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportJson(text);
    };
    reader.readAsText(file);
  };

  const handleLoadTemplate = (template: (typeof SAMPLE_TEMPLATES)[0]) => {
    const layouted = autoLayoutWorkflow(template.nodes, template.connections);
    onImportWorkflow(layouted.nodes, layouted.connections, template.title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#161616] border border-[#222] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Workflow Import & Export Studio</h3>
              <p className="text-xs text-slate-500">Port workflows via standard JSON format or load templates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#222] bg-[#0C0C0C] px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Preset Templates</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Export Schema ({nodes.length} nodes, {connections.length} connections)</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#222] hover:bg-[#2A2A2A] text-white rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .json</span>
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={exportedData}
                className="w-full h-64 bg-[#0A0A0A] border border-[#222] rounded-xl p-3 font-mono text-xs text-indigo-300 focus:outline-none resize-none"
              />
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Paste Workflow JSON structure or upload file</span>
                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-[#222] hover:bg-[#2A2A2A] text-xs font-medium text-slate-200 rounded-lg transition-colors">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload File</span>
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400">
                  {errorMsg}
                </div>
              )}

              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='Paste raw workflow JSON here (e.g. { "nodes": [...], "connections": [...] })'
                className="w-full h-56 bg-[#0A0A0A] border border-[#222] rounded-xl p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#222] hover:bg-[#2A2A2A] text-xs text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportSubmit}
                  disabled={!importJson.trim()}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all ${
                    !importJson.trim()
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Import into Canvas</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Select a pre-configured automation template to load onto the canvas:</p>
              <div className="grid grid-cols-1 gap-3">
                {SAMPLE_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 bg-[#0A0A0A] border border-[#222] hover:border-indigo-500/50 rounded-xl transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {tpl.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
                          {tpl.nodes.length} Nodes
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{tpl.description}</p>
                    </div>
                    <button
                      onClick={() => handleLoadTemplate(tpl)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all shrink-0"
                    >
                      Load Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
