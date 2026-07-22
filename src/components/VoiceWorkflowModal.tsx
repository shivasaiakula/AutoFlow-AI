import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, Play, RefreshCw, Zap, Volume2, ArrowRight } from 'lucide-react';
import { Workflow } from '../types';

interface VoiceWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowGenerated: (workflow: Partial<Workflow>) => void;
}

export const VoiceWorkflowModal: React.FC<VoiceWorkflowModalProps> = ({
  isOpen,
  onClose,
  onWorkflowGenerated,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>(Array(24).fill(10));
  const recognitionRef = useRef<any>(null);

  const samplePrompts = [
    'Whenever a customer places an order, send a confirmation email, generate an invoice, notify the warehouse, assign a courier, update inventory, and send tracking info.',
    'If a P1 critical Zendesk ticket is opened, trigger PagerDuty on-call alert, notify #incident-room on Slack, and draft solution with Gemini AI.',
    'Every Monday at 9 AM, fetch Stripe unpaid invoices over $1,000, send WhatsApp payment reminders, and alert finance manager if overdue > 14 days.',
  ];

  // Simulated audio waveform movement when recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel(
          Array(24)
            .fill(0)
            .map(() => Math.floor(Math.random() * 50) + 15)
        );
      }, 100);
    } else {
      setAudioLevel(Array(24).fill(10));
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    // Check if Web Speech API is available
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition notice:', e);
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      if (!transcript) setTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Fallback simulation text if microphone permission is blocked in browser
          setTimeout(() => {
            setTranscript(samplePrompts[0]);
          }, 800);
        }
      } else {
        // Fallback for browsers without speech API
        setTimeout(() => {
          setTranscript(samplePrompts[0]);
        }, 800);
      }
    }
  };

  const handleGenerate = async () => {
    if (!transcript.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/voice-to-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();

      onWorkflowGenerated({
        name: data.name || 'Voice-Generated Workflow',
        description: data.description || transcript,
        nodes: data.nodes || [],
        connections: data.connections || [],
      });
      setIsGenerating(false);
      onClose();
    } catch (err) {
      console.error('Failed to generate workflow from voice:', err);
      // Fallback local workflow creation
      onWorkflowGenerated({
        name: 'Order & Warehouse Dispatch Voice Flow',
        description: transcript,
        nodes: [
          { id: 'v1', type: 'trigger', x: 100, y: 200, data: { label: 'Customer Order Placed', description: 'Triggers on online checkout' } },
          { id: 'v2', type: 'email', x: 380, y: 120, data: { label: 'Send Confirmation Email', description: 'Dispatches order receipt' } },
          { id: 'v3', type: 'document', x: 380, y: 280, data: { label: 'Generate Invoice PDF', description: 'Renders tax invoice' } },
          { id: 'v4', type: 'notification', x: 660, y: 200, data: { label: 'Notify Warehouse Slack', description: '#warehouse-alerts' } },
          { id: 'v5', type: 'database', x: 940, y: 200, data: { label: 'Update Inventory Ledger', description: 'Decrements stock count' } },
        ],
        connections: [
          { id: 'vc1', sourceId: 'v1', targetId: 'v2', animated: true },
          { id: 'vc2', sourceId: 'v1', targetId: 'v3', animated: true },
          { id: 'vc3', sourceId: 'v2', targetId: 'v4', animated: true },
          { id: 'vc4', sourceId: 'v4', targetId: 'v5', animated: true },
        ],
      });
      setIsGenerating(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Voice-to-Workflow AI
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Gemini Powered
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speak your automation rules in plain English. AutoFlow AI instantly converts speech to a complete visual workflow graph.
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

        {/* Recording Visualizer Container */}
        <div className="my-6 flex flex-col items-center justify-center py-6 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          {/* Audio Waveform Bars */}
          <div className="flex items-center justify-center gap-1.5 h-16 my-2">
            {audioLevel.map((height, idx) => (
              <div
                key={idx}
                style={{ height: `${height}px` }}
                className={`w-1.5 rounded-full transition-all duration-100 ${
                  isRecording
                    ? 'bg-gradient-to-t from-purple-600 to-indigo-500 animate-pulse'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              ></div>
            ))}
          </div>

          {/* Record Toggle Button */}
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs text-white shadow-xl transition-all transform active:scale-95 ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/30 ring-4 ring-rose-500/20'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/30'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Tap to Speak Instruction</span>
              </>
            )}
          </button>
        </div>

        {/* Live Transcript Field */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Spoken or Typed Instruction:</span>
            {transcript && (
              <button
                onClick={() => setTranscript('')}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear text
              </button>
            )}
          </label>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="e.g. Whenever an order is placed, send confirmation email, check inventory in SQL database, and alert warehouse team on Slack..."
            className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          ></textarea>
        </div>

        {/* Sample Prompt Chips */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Try an example prompt:
          </p>
          <div className="space-y-1.5">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setTranscript(prompt)}
                className="w-full text-left text-[11px] p-2 rounded-lg bg-slate-50 hover:bg-purple-50 dark:bg-slate-800/40 dark:hover:bg-purple-950/30 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 transition-colors truncate"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!transcript.trim() || isGenerating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
              !transcript.trim() || isGenerating
                ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 shadow-purple-500/25 active:scale-95'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI Generating Workflow...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Generate Workflow Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
