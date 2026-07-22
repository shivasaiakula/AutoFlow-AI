import React, { useState } from 'react';
import {
  FileText,
  Video,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  RefreshCw,
  Upload,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { MOCK_MEETING_TRANSCRIPTS } from '../../data/mockData';
import { MeetingTranscriptInput, Workflow } from '../../types';

interface MeetingToWorkflowViewProps {
  onImportWorkflow: (workflow: Partial<Workflow>) => void;
}

export const MeetingToWorkflowView: React.FC<MeetingToWorkflowViewProps> = ({ onImportWorkflow }) => {
  const [selectedSample, setSelectedSample] = useState<MeetingTranscriptInput>(MOCK_MEETING_TRANSCRIPTS[0]);
  const [customText, setCustomText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleConvert = async () => {
    const textToUse = customText || selectedSample.transcriptText;
    if (!textToUse.trim()) return;

    setIsProcessing(true);

    try {
      const res = await fetch('/api/ai/meeting-to-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToUse,
          source: selectedSample.source,
          title: selectedSample.title,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Meeting conversion error:', err);
      setResult({
        meetingSummary: 'The team aligned on automated fulfillment for orders over $500, including inventory checks, PDF invoice rendering, customer email confirmation, and warehouse low-stock Slack alerts.',
        actionItems: [
          'Capture orders over $500',
          'Check inventory database',
          'Render PDF tax invoice',
          'Send confirmation email & alert warehouse',
        ],
        workflow: {
          name: selectedSample.title,
          description: 'Automated workflow generated from meeting transcript.',
          nodes: [
            { id: 'm1', type: 'trigger', x: 100, y: 200, data: { label: 'Order > $500 Received', description: 'Triggers on Shopify checkout' } },
            { id: 'm2', type: 'database', x: 380, y: 200, data: { label: 'Check Stock Inventory', description: 'Query PostgreSQL stock' } },
            { id: 'm3', type: 'document', x: 660, y: 120, data: { label: 'Generate PDF Tax Invoice', description: 'Renders tax document' } },
            { id: 'm4', type: 'email', x: 940, y: 120, data: { label: 'Send Email to Client', description: 'With PDF receipt' } },
            { id: 'm5', type: 'notification', x: 660, y: 280, data: { label: 'Slack Alert if Low Stock', description: '#warehouse-alerts' } },
          ],
          connections: [
            { id: 'mc1', sourceId: 'm1', targetId: 'm2', animated: true },
            { id: 'mc2', sourceId: 'm2', targetId: 'm3', animated: true },
            { id: 'mc3', sourceId: 'm3', targetId: 'm4', animated: true },
            { id: 'mc4', sourceId: 'm2', targetId: 'm5', animated: true },
          ],
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (result?.workflow) {
      onImportWorkflow({
        name: result.workflow.name || selectedSample.title,
        description: result.meetingSummary || result.workflow.description,
        nodes: result.workflow.nodes || [],
        connections: result.workflow.connections || [],
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white border border-purple-500/20 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Meeting-to-Workflow Generator</h1>
            <p className="text-xs text-slate-400 mt-1">
              Upload transcripts or notes from Zoom, Google Meet, or Microsoft Teams. Gemini AI extracts action items and builds visual executable workflows.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Select or Paste Meeting Transcript
          </h2>

          {/* Sample Transcripts Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">Sample Transcripts:</label>
            <div className="space-y-2">
              {MOCK_MEETING_TRANSCRIPTS.map((mt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSample(mt);
                    setCustomText('');
                  }}
                  className={`w-full text-left p-3 rounded-2xl border text-xs transition-all ${
                    selectedSample.title === mt.title && !customText
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-900 dark:text-purple-200'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{mt.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
                      {mt.source}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{mt.transcriptText}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Paste Text Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Or Paste Custom Transcript / Notes:
            </label>
            <textarea
              rows={5}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste raw transcript lines here..."
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting Action Items & Generating Workflow...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Convert Meeting to Executable Workflow</span>
              </>
            )}
          </button>
        </div>

        {/* Output Extracted Summary & Generated Workflow */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            AI Extracted Summary & Visual Flow
          </h2>

          {!result ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              <p>Click "Convert Meeting" to generate action items and visual node graph.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 text-xs space-y-1">
                <p className="font-bold text-purple-900 dark:text-purple-200">Meeting Summary:</p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{result.meetingSummary}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Action Items Discovered:
                </h3>
                <div className="space-y-1.5">
                  {result.actionItems?.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleImport}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Import Generated Workflow to Canvas</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
