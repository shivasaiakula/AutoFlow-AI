import React, { useEffect, useState } from 'react';
import { History, X, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronRight, Clock } from 'lucide-react';

export interface StepLogRecord {
  id: string;
  stepId: string;
  stepType: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  input?: any;
  output?: any;
  error?: string;
  retryCount?: number;
  durationMs?: number;
  startedAt: string;
  finishedAt?: string;
}

export interface WorkflowRunRecord {
  id: string;
  workflowId: string;
  workflowName?: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  triggerSource: string;
  startedAt: string;
  finishedAt?: string;
  error?: string;
  stepLogs: StepLogRecord[];
}

interface ExecutionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayRun?: () => void;
}

export const ExecutionHistoryDrawer: React.FC<ExecutionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onReplayRun,
}) => {
  const [runs, setRuns] = useState<WorkflowRunRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/runs');
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (err) {
      console.error('Failed to fetch execution runs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRuns();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalRuns = runs.length;
  const completedRuns = runs.filter((r) => r.status === 'COMPLETED').length;
  const successRate = totalRuns > 0 ? ((completedRuns / totalRuns) * 100).toFixed(1) : '100';

  return (
    <div className="fixed right-0 top-14 bottom-0 z-40 w-full sm:w-[440px] bg-[#0A0A0A] border-l border-[#1F1F1F] shadow-2xl flex flex-col text-slate-300">
      {/* Header */}
      <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between bg-[#161616]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">SQLite Execution Logs</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={fetchRuns}
            disabled={loading}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#222] transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="p-3 border-b border-[#1F1F1F] grid grid-cols-3 gap-2 bg-[#0C0C0C] text-center">
        <div className="p-2 bg-[#161616] border border-[#222] rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Total Executions</div>
          <div className="text-sm font-bold text-white mt-0.5">{totalRuns}</div>
        </div>
        <div className="p-2 bg-[#161616] border border-[#222] rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Success Rate</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">{successRate}%</div>
        </div>
        <div className="p-2 bg-[#161616] border border-[#222] rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Database</div>
          <div className="text-xs font-mono text-indigo-400 mt-1">SQLite</div>
        </div>
      </div>

      {/* Runs List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && runs.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            <span>Loading execution history from database...</span>
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 bg-[#141414] border border-[#222] rounded-xl p-6">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-400">No execution runs recorded yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Trigger a workflow manually or wait for scheduled cron triggers to run.
            </p>
          </div>
        ) : (
          runs.map((run) => {
            const isExpanded = expandedRunId === run.id;
            const formattedTime = new Date(run.startedAt).toLocaleTimeString();

            return (
              <div
                key={run.id}
                className="bg-[#141414] border border-[#222] hover:border-slate-700 rounded-xl overflow-hidden transition-all"
              >
                {/* Run Main Bar */}
                <div
                  onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                  className="p-3 cursor-pointer flex items-center justify-between hover:bg-[#1A1A1A] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {run.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : run.status === 'RUNNING' ? (
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {run.workflowName || `Run #${run.id.slice(0, 8)}`}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#222] text-slate-400 rounded">
                          {run.triggerSource}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {formattedTime} • {run.stepLogs.length} step(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        run.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : run.status === 'FAILED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {run.status}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Step Details */}
                {isExpanded && (
                  <div className="p-3 bg-[#0D0D0D] border-t border-[#1F1F1F] space-y-2 text-xs">
                    {run.error && (
                      <div className="p-2 bg-rose-950/40 border border-rose-900/50 rounded text-rose-300 font-mono text-[11px] break-all">
                        <strong>Error:</strong> {run.error}
                      </div>
                    )}

                    <p className="text-[11px] font-semibold text-slate-400">Step Logs:</p>
                    <div className="space-y-1.5">
                      {run.stepLogs.map((step) => (
                        <div
                          key={step.id}
                          className="p-2 bg-[#161616] border border-[#222] rounded-lg text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-200">
                              Step {step.stepId} ({step.stepType})
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                step.status === 'COMPLETED'
                                  ? 'text-emerald-400 bg-emerald-950/40'
                                  : 'text-rose-400 bg-rose-950/40'
                              }`}
                            >
                              {step.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <span>Duration: {step.durationMs ? `${step.durationMs}ms` : 'N/A'}</span>
                            {step.retryCount ? (
                              <span className="text-amber-400">({step.retryCount} retry)</span>
                            ) : null}
                          </div>

                          {step.output && (
                            <pre className="text-[10px] font-mono p-1.5 bg-[#0A0A0A] border border-[#222] rounded text-emerald-400/90 overflow-x-auto max-h-24">
                              {JSON.stringify(step.output, null, 2)}
                            </pre>
                          )}

                          {step.error && (
                            <div className="text-[10px] font-mono p-1.5 bg-rose-950/30 border border-rose-900/40 rounded text-rose-400 break-all">
                              {step.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
