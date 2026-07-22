import React from 'react';
import { Terminal as TerminalIcon, X, CheckCircle2, AlertCircle, Clock, Play, ChevronUp, ChevronDown } from 'lucide-react';

export interface TerminalLog {
  id: string;
  nodeId?: string;
  nodeLabel: string;
  timestamp: string;
  status: 'running' | 'success' | 'failed' | 'waiting';
  message: string;
  durationMs?: number;
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
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 bg-[#0A0A0A] border-t border-[#1F1F1F] text-slate-200 transition-all duration-300 shadow-2xl ${
        isOpen ? 'h-52' : 'h-9'
      }`}
    >
      {/* Terminal Bar Header */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-2 bg-[#161616] border-b border-[#1F1F1F] cursor-pointer select-none text-xs"
      >
        <div className="flex items-center gap-2 font-mono font-semibold">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span>Execution Output Terminal</span>
          {isSimulating && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              Executing Graph...
            </span>
          )}
          {logs.length > 0 && (
            <span className="text-[10px] text-slate-500 font-normal">({logs.length} events logged)</span>
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
        <div className="h-40 overflow-y-auto p-3 font-mono text-[11px] space-y-1.5 leading-relaxed bg-[#0A0A0A]">
          {logs.length === 0 ? (
            <div className="text-slate-600 py-4 text-center">
              Terminal idle. Click "Run Simulation" or "Run Workflow" in the top bar to watch real-time step execution logs.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 border-b border-[#161616] pb-1">
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
            ))
          )}
        </div>
      )}
    </div>
  );
};
