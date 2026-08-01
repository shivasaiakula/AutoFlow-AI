export interface TriggerDefinition {
  type: 'cron' | 'webhook' | 'manual';
  config?: {
    cronExpression?: string; // e.g., "*/15 * * * *"
    path?: string;           // e.g., "/hooks/lead-received"
    [key: string]: any;
  };
}

export interface RetryPolicy {
  maxRetries: number;  // e.g. 3
  backoffMs: number;   // e.g. 1000 ms
}

export interface StepDefinition {
  id: string;
  name?: string;
  type: string;        // e.g., "email_send", "http_request", "ai_decision", "log"
  config: Record<string, any>;
  retryPolicy?: RetryPolicy;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  trigger: TriggerDefinition;
  steps: StepDefinition[];
  isEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValidationError {
  path: string;
  message: string;
}

export function validateWorkflowDefinition(data: any): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ path: 'root', message: 'Workflow must be an object' }] };
  }

  if (!data.id || typeof data.id !== 'string') {
    errors.push({ path: 'id', message: 'Workflow id is required and must be a string' });
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push({ path: 'name', message: 'Workflow name is required and must be a string' });
  }

  // Trigger validation
  if (!data.trigger || typeof data.trigger !== 'object') {
    errors.push({ path: 'trigger', message: 'Workflow trigger is required and must be an object' });
  } else {
    const validTriggers = ['cron', 'webhook', 'manual'];
    if (!validTriggers.includes(data.trigger.type)) {
      errors.push({
        path: 'trigger.type',
        message: `Trigger type must be one of: ${validTriggers.join(', ')}`,
      });
    }

    if (data.trigger.type === 'cron') {
      if (!data.trigger.config?.cronExpression) {
        errors.push({
          path: 'trigger.config.cronExpression',
          message: 'Cron trigger requires trigger.config.cronExpression',
        });
      }
    }
  }

  // Steps validation
  if (!Array.isArray(data.steps)) {
    errors.push({ path: 'steps', message: 'Workflow steps must be an array' });
  } else {
    data.steps.forEach((step: any, index: number) => {
      const stepPath = `steps[${index}]`;

      if (!step || typeof step !== 'object') {
        errors.push({ path: stepPath, message: 'Step must be an object' });
        return;
      }

      if (!step.id || typeof step.id !== 'string') {
        errors.push({ path: `${stepPath}.id`, message: 'Step id is required and must be a string' });
      }

      if (!step.type || typeof step.type !== 'string') {
        errors.push({ path: `${stepPath}.type`, message: 'Step type is required and must be a string' });
      }

      if (!step.config || typeof step.config !== 'object') {
        errors.push({ path: `${stepPath}.config`, message: 'Step config is required and must be an object' });
      }

      if (step.retryPolicy) {
        if (typeof step.retryPolicy.maxRetries !== 'number' || step.retryPolicy.maxRetries < 0) {
          errors.push({
            path: `${stepPath}.retryPolicy.maxRetries`,
            message: 'retryPolicy.maxRetries must be a non-negative number',
          });
        }
        if (typeof step.retryPolicy.backoffMs !== 'number' || step.retryPolicy.backoffMs < 0) {
          errors.push({
            path: `${stepPath}.retryPolicy.backoffMs`,
            message: 'retryPolicy.backoffMs must be a non-negative number',
          });
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
