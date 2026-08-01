import { getWorkflow, createWorkflowRun, updateWorkflowRunStatus, createStepLog, updateStepLog } from './db.js';
import { WorkflowDefinition } from './schema.js';
import { stepRegistry, ExecutionContext } from './stepRegistry.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ExecutionOptions {
  triggerSource?: string;
  initialInput?: any;
}

export async function executeWorkflow(
  workflowOrId: string | WorkflowDefinition,
  options: ExecutionOptions = {}
) {
  const triggerSource = options.triggerSource || 'manual';
  let workflow: WorkflowDefinition | null;

  if (typeof workflowOrId === 'string') {
    workflow = await getWorkflow(workflowOrId);
    if (!workflow) {
      throw new Error(`Workflow with ID "${workflowOrId}" not found`);
    }
  } else {
    workflow = workflowOrId;
  }

  // 1. Create WorkflowRun in DB
  const runRecord = await createWorkflowRun(workflow.id, triggerSource);
  const runId = runRecord.id;

  const stepResults: Record<string, any> = {};
  const context: ExecutionContext = {
    workflowId: workflow.id,
    runId,
    stepId: '',
    triggerSource,
    stepResults,
    initialInput: options.initialInput,
  };

  let runFailed = false;
  let runError: string | undefined;

  // 2. Walk steps sequentially
  for (const step of workflow.steps) {
    context.stepId = step.id;

    // Create Step Log entry
    const stepLog = await createStepLog({
      runId,
      stepId: step.id,
      stepType: step.type,
      status: 'RUNNING',
      input: { config: step.config, context: stepResults },
    });

    const handler = stepRegistry.get(step.type);
    if (!handler) {
      const errorMsg = `No step handler registered for step type "${step.type}"`;
      await updateStepLog(stepLog.id, {
        status: 'FAILED',
        error: errorMsg,
      });
      runFailed = true;
      runError = errorMsg;
      break;
    }

    const maxRetries = step.retryPolicy?.maxRetries ?? 0;
    const backoffMs = step.retryPolicy?.backoffMs ?? 1000;

    let attempt = 0;
    let stepSuccess = false;
    let stepOutput: any = null;
    let stepError: string | null = null;
    const startTime = Date.now();

    while (attempt <= maxRetries && !stepSuccess) {
      try {
        if (attempt > 0) {
          console.log(`[EXECUTOR] Retry attempt ${attempt}/${maxRetries} for step ${step.id} after ${backoffMs}ms`);
          await sleep(backoffMs);
        }

        stepOutput = await handler(step.config, context);
        stepSuccess = true;
      } catch (err: any) {
        attempt++;
        stepError = err?.message || String(err);
        console.warn(`[EXECUTOR] Step ${step.id} failed (attempt ${attempt}/${maxRetries + 1}): ${stepError}`);
      }
    }

    const durationMs = Date.now() - startTime;

    if (stepSuccess) {
      stepResults[step.id] = stepOutput;
      await updateStepLog(stepLog.id, {
        status: 'COMPLETED',
        output: stepOutput,
        retryCount: Math.max(0, attempt - 1),
        durationMs,
      });
    } else {
      await updateStepLog(stepLog.id, {
        status: 'FAILED',
        error: stepError || 'Unknown error during step execution',
        retryCount: Math.max(0, attempt - 1),
        durationMs,
      });
      runFailed = true;
      runError = `Step "${step.name || step.id}" (${step.type}) failed: ${stepError}`;
      break;
    }
  }

  // 3. Mark run complete or failed
  if (runFailed) {
    await updateWorkflowRunStatus(runId, 'FAILED', runError);
    return {
      runId,
      workflowId: workflow.id,
      status: 'FAILED',
      error: runError,
      stepResults,
    };
  } else {
    await updateWorkflowRunStatus(runId, 'COMPLETED');
    return {
      runId,
      workflowId: workflow.id,
      status: 'COMPLETED',
      stepResults,
    };
  }
}
