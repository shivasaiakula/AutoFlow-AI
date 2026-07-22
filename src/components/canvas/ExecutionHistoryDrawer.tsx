import React from 'react';
import { History, X, CheckCircle2, AlertCircle, Play, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { WorkflowNode } from '../../types';

export interface ExecutionRunRecord {
  id: string;
  timestamp: string;
  status: 'success' | 'failed' | 'partial';
  durationMs: number;
  triggerSource: string;
  stepsCount: number;
  passedSteps: number;
  failedSteps: number;
}

interface ExecutionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayRun: (record: ExecutionRunRecord) => void;
}

const MOCK_RUNS: ExecutionRunRecord[] = [
  {
    id: 'run-101',
    timestamp: '2 mins ago (08:12:10)',
    status: 'success',
    durationMs: 840,
    triggerSource: 'Webhook POST /v1/leads',
    stepsCount: 5,
    passedSteps: 5,
    failedSteps: 0,
  },
  {
    id: 'run-100',
    timestamp: '18 mins ago (07:56:04)',
    status: 'success',
    durationMs: 1210,
    triggerSource: 'Cron Schedule (Every 15m)',
    stepsCount: 5,
    passedSteps: 5,
    failedSteps: 0,
  },
  {
    id: 'run-99',
    timestamp: '1 hour ago (07:15:33)',
    status: 'failed',
    durationMs: 410,
    triggerSource: 'Manual Trigger',
    stepsCount: 5,
    passedSteps: 3,
    failedSteps: 1,
  },
  {
    id: 'run-98',
    timestamp: '3 hours ago (05:22:19)',
    status: 'success',
    durationMs: 950,
    triggerSource: 'Webhook POST /v1/leads',
    stepsCount: 5,
    passedSteps: 5,
    failedSteps: 0,
  },
];

export const ExecutionHistoryDrawer: React.FC<ExecutionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onReplayRun,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-14 bottom-0 z-40 w-full sm:w-[400px] bg-[#0A0A0A] border-l border-[#1F1F1F] shadow-2xl flex flex-col text-slate-300">
      {/* Header */}
      <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between bg-[#161616]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Execution History</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-500 hover:text-white hover:bg-[#222] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="p-4 border-b border-[#1F1F1F] grid grid-cols-3 gap-2 bg-[#0C0C0C] text-center">
        <div className="p-2 bg-[#161616] border border-[#222] rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Total Runs</div>
          <div className="text-sm font-bold text-white mt-0.5">148</div>
        </div>
        <div className="p-2 bg-[#161616] border border-[#222] rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Success Rate</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">98.6%</div>
        </div>
        <div className="p-2 bg-[#161616] border border-[#222] rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Avg Time</div>
          <div className="text-sm font-bold text-indigo-400 mt-0.5">850ms</div>
        </div>
      </div>

      {/* Runs List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-400">Recent Executions:</p>

        {MOCK_RUNS.map((run) => (
          <div
            key={run.id}
            className="p-3 bg-[#161616] border border-[#222] hover:border-slate-700 rounded-xl space-y-2 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                {run.status === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                {run.id}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{run.timestamp}</span>
            </div>

            <p className="text-[11px] text-slate-400 truncate">
              Trigger: <span className="text-slate-200 font-mono">{run.triggerSource}</span>
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-[#222] text-[10px]">
              <div className="flex items-center gap-2 text-slate-500 font-mono">
                <span>{run.durationMs}ms</span>
                <span>•</span>
                <span className="text-emerald-400">{run.passedSteps} passed</span>
                {run.failedSteps > 0 && <span className="text-rose-400">{run.failedSteps} failed</span>}
              </div>

              <button
                onClick={() => onReplayRun(run)}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded transition-colors font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replay</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
