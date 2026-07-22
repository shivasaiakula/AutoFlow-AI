import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2, ArrowRight } from 'lucide-react';
import { WorkflowNode, Connection, NodeType } from '../../types';
import { NODE_METADATA } from '../../data/mockData';
import { autoLayoutWorkflow } from '../../lib/workflowEngine';

interface AIPromptGeneratorBarProps {
  onGenerateWorkflow: (nodes: WorkflowNode[], connections: Connection[], name: string) => void;
}

export const AIPromptGeneratorBar: React.FC<AIPromptGeneratorBarProps> = ({ onGenerateWorkflow }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      // Call server API route for Gemini or generate smart structure based on prompt keywords
      const res = await fetch('/api/gemini/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data.nodes && data.connections) {
          const layouted = autoLayoutWorkflow(data.nodes, data.connections);
          onGenerateWorkflow(layouted.nodes, layouted.connections, data.name || prompt);
          setPrompt('');
          setIsGenerating(false);
          return;
        }
      }

      // Fallback smart rule-based engine if API key or backend is offline
      const text = prompt.toLowerCase();
      const generatedNodes: WorkflowNode[] = [];
      const generatedConns: Connection[] = [];

      let stepX = 100;
      const stepY = 200;

      // 1. Trigger Node
      let triggerType: NodeType = 'webhook';
      if (text.includes('email') || text.includes('mail')) triggerType = 'trigger';
      if (text.includes('api') || text.includes('http')) triggerType = 'api_request';

      generatedNodes.push({
        id: `gen-1`,
        type: triggerType,
        x: stepX,
        y: stepY,
        data: {
          label: triggerType === 'webhook' ? 'Webhook Receiver' : 'Trigger Event',
          description: `Triggers workflow execution based on "${prompt.slice(0, 30)}..."`,
          config: { endpoint: '/v1/trigger' },
        },
      });

      // 2. AI Decision or Logic Node
      stepX += 280;
      generatedNodes.push({
        id: `gen-2`,
        type: 'ai_decision',
        x: stepX,
        y: stepY,
        data: {
          label: 'Gemini AI Processor',
          description: 'Extracts entities, analyzes sentiment, and formats payload',
          config: { model: 'gemini-2.5-flash', instruction: prompt },
        },
      });
      generatedConns.push({
        id: `gc-1`,
        sourceId: 'gen-1',
        targetId: 'gen-2',
        label: 'Payload Data',
      });

      // 3. Condition or Action Node
      if (text.includes('if') || text.includes('filter') || text.includes('condition')) {
        stepX += 280;
        generatedNodes.push({
          id: `gen-3`,
          type: 'condition',
          x: stepX,
          y: stepY,
          data: {
            label: 'Condition Check',
            description: 'Evaluates AI output criteria',
            config: { rule: 'score > 80' },
          },
        });
        generatedConns.push({
          id: `gc-2`,
          sourceId: 'gen-2',
          targetId: 'gen-3',
        });

        // Split action 1
        generatedNodes.push({
          id: `gen-4a`,
          type: 'notification',
          x: stepX + 280,
          y: stepY - 100,
          data: {
            label: 'Slack High Priority Alert',
            description: 'Sends instant alert to team',
            config: { channel: '#urgent-alerts' },
          },
        });
        generatedConns.push({
          id: `gc-3a`,
          sourceId: 'gen-3',
          targetId: 'gen-4a',
          label: 'True',
        });

        // Split action 2
        generatedNodes.push({
          id: `gen-4b`,
          type: 'database',
          x: stepX + 280,
          y: stepY + 100,
          data: {
            label: 'Store in Database',
            description: 'Persists record into DB table',
            config: { table: 'records' },
          },
        });
        generatedConns.push({
          id: `gc-3b`,
          sourceId: 'gen-3',
          targetId: 'gen-4b',
          label: 'False',
        });
      } else {
        stepX += 280;
        const actionType: NodeType = text.includes('slack') || text.includes('notify') ? 'notification' : 'email';
        generatedNodes.push({
          id: `gen-3`,
          type: actionType,
          x: stepX,
          y: stepY,
          data: {
            label: actionType === 'notification' ? 'Slack Broadcast' : 'Dispatch Email',
            description: 'Outputs formatted summary message',
            config: { target: 'channel' },
          },
        });
        generatedConns.push({
          id: `gc-2`,
          sourceId: 'gen-2',
          targetId: 'gen-3',
          label: 'Processed Event',
        });
      }

      const layouted = autoLayoutWorkflow(generatedNodes, generatedConns);
      onGenerateWorkflow(layouted.nodes, layouted.connections, prompt);
      setPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4 pointer-events-auto">
      <form
        onSubmit={handleGenerate}
        className="bg-[#161616]/95 border border-[#222] hover:border-indigo-500/50 focus-within:border-indigo-500 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md flex items-center gap-2 transition-all"
      >
        <div className="pl-3 text-indigo-400 flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-white hidden sm:inline">AI Builder</span>
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe any automation (e.g., 'Parse incoming invoice emails with AI & post summary to Slack')..."
          className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none px-2"
        />

        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all shrink-0 ${
            !prompt.trim() || isGenerating
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Building...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span>Generate Flow</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
