import { prisma } from '../db/client.js';
import { WorkflowDefinition, validateWorkflowDefinition } from './schema.js';

export async function saveWorkflow(definition: WorkflowDefinition) {
  const validation = validateWorkflowDefinition(definition);
  if (!validation.valid) {
    throw new Error(`Invalid workflow schema: ${JSON.stringify(validation.errors)}`);
  }

  const existing = await prisma.workflow.findUnique({ where: { id: definition.id } });

  if (existing) {
    return prisma.workflow.update({
      where: { id: definition.id },
      data: {
        name: definition.name,
        description: definition.description,
        trigger: JSON.stringify(definition.trigger),
        steps: JSON.stringify(definition.steps),
        isEnabled: definition.isEnabled ?? true,
      },
    });
  } else {
    return prisma.workflow.create({
      data: {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        trigger: JSON.stringify(definition.trigger),
        steps: JSON.stringify(definition.steps),
        isEnabled: definition.isEnabled ?? true,
      },
    });
  }
}

export async function getWorkflow(id: string): Promise<WorkflowDefinition | null> {
  const record = await prisma.workflow.findUnique({ where: { id } });
  if (!record) return null;

  return {
    id: record.id,
    name: record.name,
    description: record.description || undefined,
    trigger: JSON.parse(record.trigger),
    steps: JSON.parse(record.steps),
    isEnabled: record.isEnabled,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listWorkflows(): Promise<WorkflowDefinition[]> {
  const records = await prisma.workflow.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return records.map((record) => ({
    id: record.id,
    name: record.name,
    description: record.description || undefined,
    trigger: JSON.parse(record.trigger),
    steps: JSON.parse(record.steps),
    isEnabled: record.isEnabled,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }));
}

export async function deleteWorkflow(id: string) {
  return prisma.workflow.delete({ where: { id } });
}

// Execution Runs & Logs
export async function createWorkflowRun(workflowId: string, triggerSource: string) {
  return prisma.workflowRun.create({
    data: {
      workflowId,
      triggerSource,
      status: 'RUNNING',
    },
  });
}

export async function updateWorkflowRunStatus(runId: string, status: 'COMPLETED' | 'FAILED', error?: string) {
  return prisma.workflowRun.update({
    where: { id: runId },
    data: {
      status,
      finishedAt: new Date(),
      error: error || null,
    },
  });
}

export async function createStepLog(params: {
  runId: string;
  stepId: string;
  stepType: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  input?: any;
  output?: any;
  error?: string;
  retryCount?: number;
  durationMs?: number;
}) {
  return prisma.stepLog.create({
    data: {
      runId: params.runId,
      stepId: params.stepId,
      stepType: params.stepType,
      status: params.status,
      input: params.input ? JSON.stringify(params.input) : null,
      output: params.output ? JSON.stringify(params.output) : null,
      error: params.error || null,
      retryCount: params.retryCount || 0,
      durationMs: params.durationMs || null,
    },
  });
}

export async function updateStepLog(
  id: string,
  data: {
    status: 'COMPLETED' | 'FAILED' | 'SKIPPED';
    output?: any;
    error?: string;
    retryCount?: number;
    durationMs?: number;
  }
) {
  return prisma.stepLog.update({
    where: { id },
    data: {
      status: data.status,
      output: data.output ? JSON.stringify(data.output) : undefined,
      error: data.error || null,
      retryCount: data.retryCount,
      durationMs: data.durationMs,
      finishedAt: new Date(),
    },
  });
}

export async function getWorkflowRuns(limit = 20) {
  const runs = await prisma.workflowRun.findMany({
    take: limit,
    orderBy: { startedAt: 'desc' },
    include: {
      workflow: {
        select: { name: true },
      },
      stepLogs: {
        orderBy: { startedAt: 'asc' },
      },
    },
  });

  return runs.map((run) => ({
    id: run.id,
    workflowId: run.workflowId,
    workflowName: run.workflow.name,
    status: run.status,
    triggerSource: run.triggerSource,
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt ? run.finishedAt.toISOString() : null,
    error: run.error,
    stepLogs: run.stepLogs.map((step) => ({
      id: step.id,
      stepId: step.stepId,
      stepType: step.stepType,
      status: step.status,
      input: step.input ? JSON.parse(step.input) : null,
      output: step.output ? JSON.parse(step.output) : null,
      error: step.error,
      retryCount: step.retryCount,
      durationMs: step.durationMs,
      startedAt: step.startedAt.toISOString(),
      finishedAt: step.finishedAt ? step.finishedAt.toISOString() : null,
    })),
  }));
}
