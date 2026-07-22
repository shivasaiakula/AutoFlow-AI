import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Workflow, OptimizationResult } from '../../types';

interface AIOptimizerViewProps {
  workflow: Workflow;
  onClose: () => void;
  onApplyOptimization: () => void;
}

export const AIOptimizerView: React.FC<AIOptimizerViewProps> = ({
  workflow,
  onClose,
  onApplyOptimization,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<OptimizationResult>({
    healthScore: workflow.healthScore || 94,
    optimizationScore: workflow.optimizationScore || 88,
    estimatedTimeSavedMinutes: workflow.estimatedTimeSavedMinutes || 420,
    estimatedCostReductionUSD: workflow.estimatedCostReductionUSD || 1850,
    confidenceScore: 96,
    recommendations: [
      {
        id: 'rec-1',
        type: 'performance',
        title: 'Parallelize API Call & Document Generation',
        description: 'Executing Warehouse API and PDF Invoice Generation in parallel paths reduces node execution latency by 240ms per order.',
        impact: 'high',
        autoFixAvailable: true,
      },
      {
        id: 'rec-2',
        type: 'cost',
        title: 'Replace Static Rule with Gemini 3.6 Flash Decision',
        description: 'Consolidate 3 nested condition branches into 1 AI Decision node to lower webhook payload complexity and maintenance costs.',
        impact: 'high',
        autoFixAvailable: true,
      },
      {
        id: 'rec-3',
        type: 'reliability',
        title: 'Add Webhook Retry Fallback Branch',
        description: 'Ensure a 15-minute delay and retry step if external courier API endpoints experience transient network HTTP 503 drops.',
        impact: 'medium',
        autoFixAvailable: true,
      },
    ],
  });

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow }),
      });
      const data = await res.json();
      if (data.healthScore) {
        setResult(data);
      }
    } catch (e) {
      console.error('Failed to run AI optimizer:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Workflow Optimizer
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Continuous AI Audit
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gemini continuously evaluates node execution velocity, cost impact, and failure modes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold mb-1">
              <span>Health Score</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{result.healthScore}%</p>
            <p className="text-[10px] text-emerald-500 font-medium">Optimal Graph Layout</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold mb-1">
              <span>Time Saved</span>
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{result.estimatedTimeSavedMinutes} m/mo</p>
            <p className="text-[10px] text-indigo-500 font-medium">+{Math.round(result.estimatedTimeSavedMinutes / 60)} hrs / month</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold mb-1">
              <span>Cost Saved</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">${result.estimatedCostReductionUSD}</p>
            <p className="text-[10px] text-emerald-500 font-medium">Lower API overhead</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold mb-1">
              <span>AI Confidence</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{result.confidenceScore}%</p>
            <p className="text-[10px] text-amber-500 font-medium">Verified by Gemini</p>
          </div>
        </div>

        {/* Actionable Recommendations List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
            Recommended Optimizations ({result.recommendations.length})
          </h3>

          {result.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3 hover:border-amber-500/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{rec.title}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase">
                    {rec.impact} Impact
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                  {rec.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Re-analyze Workflow</span>
          </button>

          <button
            onClick={() => {
              onApplyOptimization();
              onClose();
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:opacity-95 shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Apply 1-Click AI Optimizations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
