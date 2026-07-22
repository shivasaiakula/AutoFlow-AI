import React, { useState } from 'react';
import {
  Zap,
  Mic,
  Bot,
  Store,
  Calculator,
  UserCheck,
  FileText,
  BarChart3,
  Search,
  Moon,
  Sun,
  Play,
  CheckCircle2,
  Bell,
  Sparkles,
  Command,
  Share2,
} from 'lucide-react';
import { MOCK_USERS } from '../data/mockData';

export type ActiveTab =
  | 'canvas'
  | 'marketplace'
  | 'roi'
  | 'digital_employee'
  | 'meeting'
  | 'analytics';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenVoiceModal: () => void;
  onToggleCopilot: () => void;
  onOpenCommandPalette: () => void;
  isCopilotOpen: boolean;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
  workflowName: string;
  setWorkflowName: (name: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenVoiceModal,
  onToggleCopilot,
  onOpenCommandPalette,
  isCopilotOpen,
  darkMode,
  setDarkMode,
  onRunSimulation,
  isSimulating,
  workflowName,
  setWorkflowName,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const tabs = [
    { id: 'canvas', label: 'Canvas', icon: Zap },
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'roi', label: 'ROI Analytics', icon: Calculator },
    { id: 'digital_employee', label: 'Digital Employees', icon: UserCheck },
    { id: 'meeting', label: 'Meeting to Flow', icon: FileText },
    { id: 'analytics', label: 'Live Analytics', icon: BarChart3 },
  ] as const;

  return (
    <header className="h-14 border-b border-[#1F1F1F] bg-[#0A0A0A]/80 backdrop-blur-md px-4 flex items-center justify-between z-30 transition-colors">
      <div className="flex items-center gap-6">
        {/* Brand & Workflow Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              AutoFlow <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#1F1F1F]">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-xs font-semibold text-slate-200 bg-transparent hover:bg-[#1A1A1A] px-2 py-1 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[200px] truncate"
            />
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
              LIVE SYNC
            </span>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Header Actions & Search */}
      <div className="flex items-center gap-3">
        {/* Search Input Button */}
        <div className="relative hidden lg:block">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 bg-[#161616] border border-[#222] rounded-full py-1.5 pl-3 pr-10 text-xs text-slate-400 w-60 hover:border-slate-700 transition-colors text-left"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate">Search workflows...</span>
            <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-500 border border-[#333] px-1 rounded font-mono">
              ⌘K
            </span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Voice AI */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-medium transition-all"
            title="Create workflow with Voice AI"
          >
            <Mic className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="hidden sm:inline">Voice AI</span>
          </button>

          {/* AI Copilot Toggle */}
          <button
            onClick={onToggleCopilot}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isCopilotOpen
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'bg-[#161616] border-[#222] text-slate-300 hover:bg-[#1F1F1F]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Copilot</span>
            <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
          </button>

          {/* Run Workflow Button */}
          {activeTab === 'canvas' && (
            <button
              onClick={onRunSimulation}
              disabled={isSimulating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg transition-all ${
                isSimulating
                  ? 'bg-amber-600/80 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
              }`}
            >
              {isSimulating ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run</span>
                </>
              )}
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1A1A] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#0A0A0A]"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#161616] border border-[#222] shadow-2xl p-4 z-50 text-xs text-slate-300">
                <div className="flex items-center justify-between pb-2 border-b border-[#222] mb-2 font-semibold text-white">
                  <span>Live Insights & Activity</span>
                  <span className="text-[10px] text-indigo-400 font-mono">3 NEW</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-[#0A0A0A] border border-[#222] flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Workflow Health: 94%</p>
                      <p className="text-[10px] text-slate-400">Estimated ROI: $4,200 / mo</p>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[#0A0A0A] border border-[#222] flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Optimization Ready</p>
                      <p className="text-[10px] text-slate-400">Parallelize CRM update for 12% speedup</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1A1A] transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Team Avatars */}
          <div className="hidden xl:flex -space-x-2 pl-2 border-l border-[#1F1F1F]">
            <div className="w-7 h-7 rounded-full border-2 border-[#0A0A0A] bg-amber-500 flex items-center justify-center text-[10px] font-bold text-black">
              JD
            </div>
            <div className="w-7 h-7 rounded-full border-2 border-[#0A0A0A] bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-black">
              SK
            </div>
            <div className="w-7 h-7 rounded-full border-2 border-[#0A0A0A] bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
              +3
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
