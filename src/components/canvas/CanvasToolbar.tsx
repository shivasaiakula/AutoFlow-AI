import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  RotateCcw,
  RotateCw,
  Layout,
  Play,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { ValidationIssue } from '../../lib/workflowEngine';

interface CanvasToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  gridSnap: boolean;
  onToggleGridSnap: () => void;
  onAutoLayout: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  validationIssues: ValidationIssue[];
  onOpenValidation: () => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
  onClearCanvas: () => void;
  onOpenOptimizer: () => void;
  healthScore?: number;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  gridSnap,
  onToggleGridSnap,
  onAutoLayout,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  validationIssues,
  onOpenValidation,
  onRunSimulation,
  isSimulating,
  onClearCanvas,
  onOpenOptimizer,
  healthScore = 94,
}) => {
  const errorsCount = validationIssues.filter((i) => i.severity === 'error').length;
  const warningsCount = validationIssues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex items-center justify-between">
      {/* Left Toolbar Controls */}
      <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-xl bg-[#161616]/90 border border-[#222] shadow-2xl backdrop-blur">
        {/* Zoom Controls */}
        <div className="flex items-center border-r border-[#222] pr-1 mr-1">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded text-slate-400 hover:bg-[#222] hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomReset}
            className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-300 hover:bg-[#222] rounded transition-colors"
            title="Reset Zoom (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded text-slate-400 hover:bg-[#222] hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center border-r border-[#222] pr-1 mr-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo
                ? 'text-slate-400 hover:bg-[#222] hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl + Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo
                ? 'text-slate-400 hover:bg-[#222] hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl + Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Layout & Grid Snapping */}
        <button
          onClick={onAutoLayout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-colors"
          title="Auto-align nodes in hierarchy layout"
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Auto Layout</span>
        </button>

        <button
          onClick={onToggleGridSnap}
          className={`p-1.5 rounded text-xs font-semibold transition-colors ${
            gridSnap
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'text-slate-400 hover:bg-[#222]'
          }`}
          title={gridSnap ? 'Grid snapping ENABLED' : 'Grid snapping DISABLED'}
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>

      {/* Right Toolbar Controls */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Workflow Health & Optimizer Badge */}
        <button
          onClick={onOpenOptimizer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161616]/90 border border-[#222] shadow-2xl backdrop-blur text-xs font-semibold text-slate-300 hover:border-indigo-500 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Health:</span>
          <span className="font-bold text-emerald-400">{healthScore}%</span>
        </button>

        {/* Real-Time Validation Status Badge */}
        <button
          onClick={onOpenValidation}
          className="bg-[#161616]/90 backdrop-blur border border-[#222] px-3 py-2 rounded-xl text-[10px] text-slate-400 font-mono flex items-center gap-2 shadow-2xl hover:border-slate-700 transition-colors"
        >
          {errorsCount > 0 ? (
            <>
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span className="text-rose-400">{errorsCount} ERRORS</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>LIVE VALIDATION ACTIVE</span>
            </>
          )}
        </button>

        {/* Clear Canvas button */}
        <button
          onClick={onClearCanvas}
          className="p-2 rounded-xl bg-[#161616]/90 border border-[#222] shadow-2xl backdrop-blur text-slate-500 hover:text-rose-400 hover:bg-[#222] transition-colors"
          title="Clear canvas"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
