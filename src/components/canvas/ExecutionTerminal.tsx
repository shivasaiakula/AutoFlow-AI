import React, { useState } from 'react';
import { Terminal as TerminalIcon, X, CheckCircle2, AlertCircle, Clock, Play, ChevronUp, ChevronDown, Code, Copy, Check } from 'lucide-react';

export interface TerminalLog {
  id: string;
  nodeId?: string;
  nodeLabel: string;
  timestamp: string;
  status: 'running' | 'success' | 'failed' | 'waiting';
  message: string;
  durationMs?: number;
  payload?: any;
}

interface ExecutionTerminalProps {
  isOpen: boolean;
  onToggle: () => void;
  logs: TerminalLog[];
  isSimulating: boolean;
  onRunSimulation: () => void;
  onClearLogs: () => void;
}

export const ExecutionTerminal: React.FC<ExecutionTerminalProps> = ({
  isOpen,
  onToggle,
  logs,
  isSimulating,
  onRunSimulation,
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'payloads'>('terminal');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPayload = (logId: string, payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(logId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 bg-[#0A0A0A] border-t border-[#1F1F1F] text-slate-200 transition-all duration-300 shadow-2xl ${
        isOpen ? 'h-64' : 'h-9'
      }`}
    >
      {/* Terminal Bar Header */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-2 bg-[#161616] border-b border-[#1F1F1F] cursor-pointer select-none text-xs"
      >
        <div className="flex items-center gap-3 font-mono font-semibold">
          <div className="flex items-center gap-1.5">
            <TerminalIcon className="w-4 h-4 text-emerald-400" />
            <span>Execution Terminal</span>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center bg-[#0A0A0A] rounded border border-[#222] p-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-sans font-medium transition-colors ${
                activeTab === 'terminal' ? 'bg-[#222] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('payloads')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-sans font-medium transition-colors ${
                activeTab === 'payloads' ? 'bg-[#222] text-indigo-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3 h-3 text-indigo-400" />
              <span>Step Payloads</span>
            </button>
          </div>

          {isSimulating && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              Executing Graph...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRunSimulation();
            }}
            disabled={isSimulating}
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isSimulating ? 'Running...' : 'Run Simulation'}</span>
          </button>

          {logs.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearLogs();
              }}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}

          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {/* Terminal Content Body */}
      {isOpen && (
        <div className="h-52 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed bg-[#0A0A0A]">
          {activeTab === 'terminal' ? (
            logs.length === 0 ? (
              <div className="text-slate-600 py-6 text-center font-sans">
                Terminal idle. Click "Run Simulation" or "Run Workflow" in the top bar to watch real-time step execution logs.
              </div>
            ) : (
              <div className="space-y-1.5">
                {logs.map((log) => {
                  const isExpanded = selectedLogId === log.id;
                  return (
                    <div key={log.id} className="border-b border-[#161616] pb-1">
                      <div
                        onClick={() => setSelectedLogId(isExpanded ? null : log.id)}
                        className="flex items-start gap-2 hover:bg-[#121212] p-1 rounded cursor-pointer transition-colors"
                      >
                        <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>

                        {log.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                        {log.status === 'running' && (
                          <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0 mt-0.5"></span>
                        )}
                        {log.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}

                        <span className="font-semibold text-indigo-400 shrink-0">[{log.nodeLabel}]:</span>
                        <span className="text-slate-300 flex-1">{log.message}</span>

                        {log.durationMs !== undefined && (
                          <span className="text-[10px] text-slate-600 shrink-0">({log.durationMs}ms)</span>
                        )}
                      </div>

                      {/* Expandable step detail JSON */}
                      {isExpanded && (
                        <div className="mt-1 ml-6 p-2 bg-[#121212] border border-[#222] rounded-lg text-[10px]">
                          <div className="flex items-center justify-between text-slate-500 mb-1 font-sans">
                            <span>Step Execution Output Payload:</span>
                            <button
                              onClick={() => handleCopyPayload(log.id, log.payload || { status: log.status, message: log.message })}
                              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                            >
                              {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedId === log.id ? 'Copied' : 'Copy JSON'}</span>
                            </button>
                          </div>
                          <pre className="text-indigo-300 overflow-x-auto p-2 bg-[#0A0A0A] rounded border border-[#1A1A1A]">
                            {JSON.stringify(
                              log.payload || {
                                step: log.nodeLabel,
                                status: log.status,
                                message: log.message,
                                timestamp: log.timestamp,
                                durationMs: log.durationMs || 120,
                              },
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Payloads Tab */
            <div className="space-y-3 font-sans">
              <p className="text-xs text-slate-400 mb-2">
                Live Data Inspector: Step inputs and outputs produced during execution:
              </p>
              {logs.length === 0 ? (
                <div className="text-slate-600 py-6 text-center font-sans">No execution payloads captured yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 bg-[#121212] border border-[#222] rounded-xl font-mono text-[10px]">
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#222] mb-2 font-sans">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {log.nodeLabel}
                        </span>
                        <button
                          onClick={() => handleCopyPayload(log.id, log.payload || { status: log.status })}
                          className="p-1 hover:bg-[#222] rounded text-slate-400"
                          title="Copy JSON"
                        >
                          {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <pre className="text-indigo-300 overflow-x-auto p-2 bg-[#0A0A0A] rounded border border-[#1A1A1A] max-h-28">
                        {JSON.stringify(
                          log.payload || {
                            output: {
                              status: 'success',
                              executionTimeMs: log.durationMs || 150,
                              processedAt: log.timestamp,
                              result: `Successfully output data for step ${log.nodeLabel}`,
                            },
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

