import cron, { ScheduledTask } from 'node-cron';
import { listWorkflows, getWorkflow } from './db.js';
import { executeWorkflow } from './executor.js';

class CronScheduler {
  private activeJobs = new Map<string, ScheduledTask>();

  /**
   * Schedule a workflow by ID with a given cron expression
   */
  scheduleWorkflow(workflowId: string, cronExpression: string): boolean {
    // Stop existing task if already running for this workflow
    this.stopScheduledWorkflow(workflowId);

    if (!cron.validate(cronExpression)) {
      console.warn(`[CRON SCHEDULER] Invalid cron expression: "${cronExpression}" for workflow ${workflowId}`);
      return false;
    }

    const task = cron.schedule(cronExpression, async () => {
      console.log(`[CRON SCHEDULER] Triggering scheduled execution for workflow ${workflowId}`);
      try {
        const wf = await getWorkflow(workflowId);
        if (wf && wf.isEnabled) {
          await executeWorkflow(wf, { triggerSource: `cron (${cronExpression})` });
        } else {
          console.log(`[CRON SCHEDULER] Workflow ${workflowId} is disabled or deleted. Skipping execution.`);
        }
      } catch (err) {
        console.error(`[CRON SCHEDULER] Error executing scheduled workflow ${workflowId}:`, err);
      }
    });

    this.activeJobs.set(workflowId, task);
    console.log(`[CRON SCHEDULER] Successfully scheduled workflow ${workflowId} with expression "${cronExpression}"`);
    return true;
  }

  /**
   * Stop a scheduled workflow
   */
  stopScheduledWorkflow(workflowId: string): boolean {
    const existing = this.activeJobs.get(workflowId);
    if (existing) {
      existing.stop();
      this.activeJobs.delete(workflowId);
      console.log(`[CRON SCHEDULER] Stopped cron schedule for workflow ${workflowId}`);
      return true;
    }
    return false;
  }

  /**
   * Sync all cron workflows from DB on server startup or reload
   */
  async syncFromDatabase() {
    console.log('[CRON SCHEDULER] Syncing scheduled workflows from database...');
    const workflows = await listWorkflows();

    for (const wf of workflows) {
      if (wf.isEnabled && wf.trigger?.type === 'cron' && wf.trigger.config?.cronExpression) {
        this.scheduleWorkflow(wf.id, wf.trigger.config.cronExpression);
      } else {
        this.stopScheduledWorkflow(wf.id);
      }
    }
  }

  /**
   * List active scheduled jobs
   */
  listActiveSchedules(): Array<{ workflowId: string; status: string }> {
    const list: Array<{ workflowId: string; status: string }> = [];
    this.activeJobs.forEach((task, id) => {
      list.push({
        workflowId: id,
        status: 'active',
      });
    });
    return list;
  }
}

export const cronScheduler = new CronScheduler();
