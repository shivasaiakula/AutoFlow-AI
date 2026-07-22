import React, { useState } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Zap,
  HelpCircle,
  AlertTriangle,
  FileCheck,
  Search,
  Maximize2,
  Minimize2,
  CheckCircle2,
} from 'lucide-react';
import { CopilotMessage, Workflow } from '../types';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow;
  onApplySuggestedWorkflow?: (newNodes: any[], newConns: any[]) => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  workflow,
  onApplySuggestedWorkflow,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: `Hello Alex! I am your AutoFlow AI Copilot. I can help you build, debug, optimize, or explain your active workflow ("${workflow.name}").`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'How can I reduce approval time?',
    'Explain the logic of this workflow.',
    'Check workflow for potential bottlenecks.',
    'Add an error fallback notification step.',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          workflowContext: workflow,
        }),
      });
      const data = await res.json();

      const aiMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'I analyzed your workflow.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Copilot response error:', err);
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Based on your request, I analyzed the ${workflow.nodes.length} nodes in "${workflow.name}". To optimize execution time, I recommend parallelizing the Send Email and Database Update steps.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed right-0 top-14 bottom-0 z-40 bg-[#0A0A0A] border-l border-[#1F1F1F] shadow-2xl transition-all duration-300 flex flex-col ${
        isExpanded ? 'w-full md:w-[500px]' : 'w-full sm:w-[360px]'
      }`}
    >
      {/* Header & Health Card */}
      <div className="p-4 border-b border-[#1F1F1F] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            AI Copilot
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-[#1A1A1A] transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-[#1A1A1A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workflow Health Card */}
        <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Workflow Health Score
            </span>
            <span className="text-sm font-bold text-white">94%</span>
          </div>
          <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
            <div className="w-[94%] h-full bg-indigo-500"></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Estimated ROI: <span className="text-emerald-500 font-bold">$4,200 / mo</span>
          </p>
        </div>

        {/* AI Optimization Suggestion Box */}
        <div className="bg-[#161616] p-3 border border-[#222] rounded-lg">
          <p className="text-[11px] font-bold text-white mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Optimization Suggestion
          </p>
          <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
            "I detected a potential bottleneck in the Email node. Parallelize the CRM update for 12% faster execution."
          </p>
          <button
            onClick={() => handleSend('Apply optimization: Parallelize CRM update')}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded transition-colors"
          >
            Apply Optimization
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-[10px] font-bold text-white ${
                m.sender === 'assistant' ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            >
              {m.sender === 'assistant' ? 'AI' : 'ME'}
            </div>
            <div
              className={`p-3 text-[11px] max-w-[85%] ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tl-xl rounded-b-xl shadow-lg shadow-indigo-500/20'
                  : 'bg-[#161616] border border-[#222] text-slate-300 rounded-tr-xl rounded-b-xl'
              }`}
            >
              <p>{m.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
            <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Reasoning with Gemini...</span>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div className="px-3 py-2 border-t border-[#1F1F1F] bg-[#0C0C0C]">
        <div className="flex flex-wrap gap-1">
          {quickPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[10px] px-2 py-0.5 rounded bg-[#161616] hover:bg-[#222] text-slate-400 hover:text-white border border-[#222] transition-colors truncate max-w-[180px]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea Input Form */}
      <div className="p-4 border-t border-[#1F1F1F] bg-[#0C0C0C]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Copilot or press Ctrl+Enter..."
            rows={2}
            className="w-full bg-[#161616] border border-[#222] rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none pr-16"
          />
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-1.5 rounded text-white transition-colors ${
                !input.trim() || isLoading
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[9px] text-slate-600">Press Ctrl+Enter to send</span>
          <div className="flex items-center gap-1 opacity-50">
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
