import React, { useEffect, useState } from 'react';
import {
  Search,
  Zap,
  Mic,
  Bot,
  Store,
  Calculator,
  UserCheck,
  FileText,
  BarChart3,
  Sparkles,
  Command,
  X,
  Play,
  Moon,
  Sun,
} from 'lucide-react';
import { ActiveTab } from './Header';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenVoiceModal: () => void;
  onToggleCopilot: () => void;
  onRunSimulation: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onOpenVoiceModal,
  onToggleCopilot,
  onRunSimulation,
  darkMode,
  setDarkMode,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'voice-ai',
      title: 'Voice-to-Workflow AI Generator',
      subtitle: 'Speak natural language instructions to auto-generate visual workflow',
      icon: Mic,
      category: 'AI Tools',
      action: () => {
        onOpenVoiceModal();
        onClose();
      },
    },
    {
      id: 'copilot',
      title: 'Open AutoFlow AI Copilot Chat',
      subtitle: 'Ask questions, debug logic, or optimize workflow nodes',
      icon: Bot,
      category: 'AI Tools',
      action: () => {
        onToggleCopilot();
        onClose();
      },
    },
    {
      id: 'run-sim',
      title: 'Execute Workflow Simulation',
      subtitle: 'Run live step-by-step execution simulation with logs',
      icon: Play,
      category: 'Canvas Action',
      action: () => {
        onRunSimulation();
        onClose();
      },
    },
    {
      id: 'tab-canvas',
      title: 'Switch to Workflow Canvas Builder',
      subtitle: 'Drag-and-drop visual workflow designer',
      icon: Zap,
      category: 'Navigation',
      action: () => {
        setActiveTab('canvas');
        onClose();
      },
    },
    {
      id: 'tab-market',
      title: 'Browse Workflow Marketplace',
      subtitle: 'Discover, install, and publish pre-built workflow templates',
      icon: Store,
      category: 'Navigation',
      action: () => {
        setActiveTab('marketplace');
        onClose();
      },
    },
    {
      id: 'tab-roi',
      title: 'Open Automation ROI Calculator',
      subtitle: 'Calculate hours saved, cost reduction, and business impact',
      icon: Calculator,
      category: 'Navigation',
      action: () => {
        setActiveTab('roi');
        onClose();
      },
    },
    {
      id: 'tab-employee',
      title: 'Ava - AI Digital Employee Specialist',
      subtitle: 'Assign autonomous office tasks like ticket handling & invoicing',
      icon: UserCheck,
      category: 'AI Tools',
      action: () => {
        setActiveTab('digital_employee');
        onClose();
      },
    },
    {
      id: 'tab-meeting',
      title: 'Convert Meeting Transcript to Workflow',
      subtitle: 'Transform Zoom/Teams meeting notes into executable steps',
      icon: FileText,
      category: 'AI Tools',
      action: () => {
        setActiveTab('meeting');
        onClose();
      },
    },
    {
      id: 'tab-analytics',
      title: 'Open Live Workflow Analytics',
      subtitle: 'Enterprise real-time execution monitoring & heatmaps',
      icon: BarChart3,
      category: 'Navigation',
      action: () => {
        setActiveTab('analytics');
        onClose();
      },
    },
    {
      id: 'toggle-theme',
      title: darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: 'Toggle theme mode',
      icon: darkMode ? Sun : Moon,
      category: 'Preferences',
      action: () => {
        setDarkMode(!darkMode);
        onClose();
      },
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search platform features... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Items List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching commands found for "{query}".
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/50 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">↑↓</kbd> Navigate
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">↵</kbd> Select
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" /> + K to toggle
          </div>
        </div>
      </div>
    </div>
  );
};
