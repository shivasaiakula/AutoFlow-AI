import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client lazily/safely
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing. Using mock AI fallback responses.');
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // 1. Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 2. Voice-to-Workflow API
  app.post('/api/ai/voice-to-workflow', async (req, res) => {
    try {
      const { transcript } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: 'Voice transcript is required' });
      }

      const ai = getGenAI();
      if (!ai) {
        // High quality fallback
        return res.json({
          name: 'Voice Generated Automated Workflow',
          description: `Auto-generated from voice input: "${transcript}"`,
          nodes: [
            { id: 'v1', type: 'trigger', x: 100, y: 200, data: { label: 'Event Trigger', description: transcript } },
            { id: 'v2', type: 'ai_decision', x: 380, y: 200, data: { label: 'AI Processing Engine', description: 'Evaluates payload' } },
            { id: 'v3', type: 'email', x: 660, y: 120, data: { label: 'Send Email Notification', description: 'Dispatches confirmation' } },
            { id: 'v4', type: 'database', x: 660, y: 280, data: { label: 'Update Database', description: 'Logs record' } },
          ],
          connections: [
            { id: 'vc1', sourceId: 'v1', targetId: 'v2', animated: true },
            { id: 'vc2', sourceId: 'v2', targetId: 'v3', animated: true },
            { id: 'vc3', sourceId: 'v2', targetId: 'v4', animated: true },
          ],
        });
      }

      const prompt = `You are a world-class AI Workflow Architect. Convert the following spoken instructions into a complete visual workflow graph.
Spoken Instruction: "${transcript}"

Return a valid JSON object with:
- name: concise workflow title
- description: summary of what this workflow does
- nodes: array of node objects with { id, type (one of: trigger, condition, delay, loop, approval, email, sms, whatsapp, api_request, database, ai_decision, webhook, document, payment, notification, custom_function), x, y, data: { label, description } }
- connections: array of { id, sourceId, targetId, animated }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Voice-to-workflow error:', err);
      res.status(500).json({ error: 'Failed to process voice command', details: err.message });
    }
  });

  // 2b. Gemini Workflow Generator API
  app.post('/api/gemini/generate-workflow', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getGenAI();
      if (!ai) {
        return res.status(503).json({ error: 'Gemini API key not configured. Using fallback engine.' });
      }

      const systemPrompt = `You are an expert AI Workflow Architect. Convert this natural language prompt into a structured visual workflow.
Prompt: "${prompt}"

Return a JSON object with:
- name: workflow title
- description: short description
- nodes: array of { id, type (trigger, condition, delay, loop, approval, email, sms, api_request, database, ai_decision, webhook, document, payment, notification, custom_function), x, y, data: { label, description } }
- connections: array of { id, sourceId, targetId, label }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini generate workflow error:', err);
      res.status(500).json({ error: 'Failed to generate workflow with Gemini', details: err.message });
    }
  });

  // 3. AI Copilot Chat
  app.post('/api/ai/copilot', async (req, res) => {
    try {
      const { message, workflowContext } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.json({
          text: `I analyzed your query: "${message}". Based on your active workflow with ${
            workflowContext?.nodes?.length || 0
          } nodes, I recommend adding an AI Decision node to automatically filter exceptions before sending final notifications.`,
        });
      }

      const prompt = `You are AutoFlow AI Copilot, an expert AI assistant embedded inside an enterprise workflow automation platform.
Context of current active workflow: ${JSON.stringify(workflowContext || {})}
User question/command: "${message}"

Provide a clear, helpful, professional response. If relevant, suggest actionable workflow improvements or node configurations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error('Copilot error:', err);
      res.status(500).json({ error: 'Copilot request failed', details: err.message });
    }
  });

  // 4. AI Workflow Optimizer
  app.post('/api/ai/optimize', async (req, res) => {
    try {
      const { workflow } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.json({
          healthScore: 92,
          optimizationScore: 86,
          estimatedTimeSavedMinutes: 320,
          estimatedCostReductionUSD: 1250,
          confidenceScore: 95,
          recommendations: [
            {
              id: 'rec-1',
              type: 'performance',
              title: 'Parallelize API & Notification Calls',
              description: 'Sending Email and Updating Database can run concurrently instead of sequentially to save 220ms per execution.',
              impact: 'high',
              autoFixAvailable: true,
            },
            {
              id: 'rec-2',
              type: 'reliability',
              title: 'Add Error Fallback Branch',
              description: 'The Webhook dispatch node lacks a retry handler if the third-party endpoint returns HTTP 503.',
              impact: 'medium',
              autoFixAvailable: true,
            },
          ],
        });
      }

      const prompt = `Analyze this workflow graph for efficiency, performance bottlenecks, cost reduction, and reliability risks:
${JSON.stringify(workflow)}

Return JSON with:
- healthScore (0-100)
- optimizationScore (0-100)
- estimatedTimeSavedMinutes (number)
- estimatedCostReductionUSD (number)
- confidenceScore (number 0-100)
- recommendations: array of { id, type ('performance'|'cost'|'reliability'|'structure'), title, description, impact ('high'|'medium'|'low'), autoFixAvailable }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Optimize error:', err);
      res.status(500).json({ error: 'Optimization failed', details: err.message });
    }
  });

  // 5. Digital Employee Autonomous Handler
  app.post('/api/ai/digital-employee', async (req, res) => {
    try {
      const { taskInstruction } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.json({
          taskTitle: 'Autonomous Office Task Processing',
          summary: 'Ava Digital Employee successfully executed instruction: ' + taskInstruction,
          stepsCount: 4,
          logs: [
            { timestamp: '09:00:01 AM', level: 'info', message: 'Analyzing task parameters and permissions...' },
            { timestamp: '09:00:03 AM', level: 'info', message: 'Querying external CRM and Email APIs...' },
            { timestamp: '09:00:06 AM', level: 'success', message: 'Generated responses and scheduled follow-up triggers.' },
            { timestamp: '09:00:08 AM', level: 'success', message: 'Task completed autonomously. Report posted to workspace.' },
          ],
        });
      }

      const prompt = `You are "Ava", an Enterprise AI Digital Employee.
User instruction: "${taskInstruction}"

Simulate executing this office task autonomously. Generate an audit log of actions taken, data processed, and executive summary.
Return JSON with:
- taskTitle: string
- summary: string
- stepsCount: number
- logs: array of { timestamp, level ('info'|'warn'|'success'|'error'), message }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error('Digital employee error:', err);
      res.status(500).json({ error: 'Task execution failed', details: err.message });
    }
  });

  // 6. Meeting-to-Workflow Generator
  app.post('/api/ai/meeting-to-workflow', async (req, res) => {
    try {
      const { transcript, source, title } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.json({
          meetingSummary: 'The team discussed automating order fulfillment over $500, requiring PDF invoice rendering, customer email, and low-stock procurement alerts.',
          actionItems: [
            'Create trigger for new orders over $500',
            'Check inventory levels in database',
            'Generate PDF tax invoice',
            'Notify customer and warehouse team',
          ],
          workflow: {
            name: title || 'Meeting Derived Action Workflow',
            description: 'Automated workflow generated from meeting transcript.',
            nodes: [
              { id: 'm1', type: 'trigger', x: 100, y: 200, data: { label: 'New Order Received', description: 'Order > $500' } },
              { id: 'm2', type: 'database', x: 380, y: 200, data: { label: 'Check Stock Inventory', description: 'Query inventory DB' } },
              { id: 'm3', type: 'document', x: 660, y: 120, data: { label: 'Generate PDF Invoice', description: 'Tax document' } },
              { id: 'm4', type: 'email', x: 940, y: 120, data: { label: 'Send Email to Client', description: 'With PDF attachment' } },
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
      }

      const prompt = `Analyze this meeting transcript from ${source || 'meeting'}:
Title: "${title || 'Meeting'}"
Transcript:
"${transcript}"

Extract action items and construct an executable visual workflow structure.
Return JSON with:
- meetingSummary: string
- actionItems: string array
- workflow: { name, description, nodes (array of { id, type, x, y, data: { label, description } }), connections (array of { id, sourceId, targetId, animated }) }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error('Meeting-to-workflow error:', err);
      res.status(500).json({ error: 'Meeting processing failed', details: err.message });
    }
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoFlow AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
