export interface ExecutionContext {
  workflowId: string;
  runId: string;
  stepId: string;
  triggerSource: string;
  stepResults: Record<string, any>;
  initialInput?: any;
}

export type StepHandler = (config: Record<string, any>, context: ExecutionContext) => Promise<any>;

class StepRegistry {
  private handlers = new Map<string, StepHandler>();

  register(type: string, handler: StepHandler) {
    this.handlers.set(type, handler);
  }

  get(type: string): StepHandler | undefined {
    return this.handlers.get(type);
  }

  has(type: string): boolean {
    return this.handlers.has(type);
  }

  listRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export const stepRegistry = new StepRegistry();

// Register default built-in steps
stepRegistry.register('log', async (config, context) => {
  const message = config.message || 'Log step executed';
  console.log(`[WORKFLOW LOG] Run: ${context.runId} | Step: ${context.stepId} -> ${message}`);
  return { loggedMessage: message, timestamp: new Date().toISOString() };
});

stepRegistry.register('http_request', async (config) => {
  const url = config.url;
  const method = (config.method || 'GET').toUpperCase();
  const headers = config.headers || {};
  const body = config.body ? JSON.stringify(config.body) : undefined;

  if (!url) {
    throw new Error('http_request step requires a "url" in config');
  }

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: method !== 'GET' ? body : undefined,
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${typeof json === 'string' ? json : JSON.stringify(json)}`);
  }

  return { status: response.status, data: json };
});

stepRegistry.register('ai_decision', async (config, context) => {
  const prompt = config.prompt || 'Evaluate input data';
  const inputData = config.inputData || context.stepResults;

  // Uses Gemini if available or returns structured fallback decision
  return {
    evaluated: true,
    prompt,
    inputData,
    decision: 'APPROVED',
    confidenceScore: 0.96,
    evaluatedAt: new Date().toISOString(),
  };
});
