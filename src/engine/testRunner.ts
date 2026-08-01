import { validateWorkflowDefinition, WorkflowDefinition } from './schema.js';
import { executeWorkflow } from './executor.js';
import { stepRegistry } from './stepRegistry.js';
import { saveWorkflow, getWorkflowRuns } from './db.js';
import './integrations.js';
import './gmailIntegration.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `- ${detail}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING WORKFLOW ENGINE UNIT TESTS');
  console.log('========================================\n');

  // ---------------------------------------------------------
  // TEST GROUP 1: SCHEMA VALIDATION
  // ---------------------------------------------------------
  console.log('--- Group 1: Schema Validation ---');

  const validWf: WorkflowDefinition = {
    id: 'test-wf-1',
    name: 'Valid Workflow',
    trigger: {
      type: 'cron',
      config: { cronExpression: '*/5 * * * *' },
    },
    steps: [
      {
        id: 's1',
        name: 'Log step',
        type: 'log',
        config: { message: 'Hello World' },
        retryPolicy: { maxRetries: 2, backoffMs: 100 },
      },
    ],
  };

  const vResult = validateWorkflowDefinition(validWf);
  assert(vResult.valid, 'Valid workflow passes validation');

  const invalidWf = {
    id: 'test-wf-invalid',
    name: '', // missing name
    trigger: { type: 'unknown_trigger' }, // invalid trigger
    steps: 'not-an-array', // invalid steps
  };

  const invResult = validateWorkflowDefinition(invalidWf);
  assert(!invResult.valid, 'Invalid workflow fails validation');
  assert(
    invResult.errors.some((e) => e.path === 'name'),
    'Reports missing name error'
  );
  assert(
    invResult.errors.some((e) => e.path === 'trigger.type'),
    'Reports invalid trigger type error'
  );

  // ---------------------------------------------------------
  // TEST GROUP 2: STEP REGISTRY
  // ---------------------------------------------------------
  console.log('\n--- Group 2: Step Registry ---');

  stepRegistry.register('test_add', async (config) => {
    return { sum: (config.a || 0) + (config.b || 0) };
  });

  assert(stepRegistry.has('test_add'), 'Custom step handler registered successfully');

  // ---------------------------------------------------------
  // TEST GROUP 3: WORKFLOW EXECUTOR SUCCESS & RETRY LOGIC
  // ---------------------------------------------------------
  console.log('\n--- Group 3: Workflow Executor Execution ---');

  // Register a flaky handler that fails once then succeeds
  let attemptCount = 0;
  stepRegistry.register('test_flaky', async () => {
    attemptCount++;
    if (attemptCount === 1) {
      throw new Error('Transient network error');
    }
    return { status: 'recovered' };
  });

  const flakyWf: WorkflowDefinition = {
    id: 'flaky-wf-test',
    name: 'Flaky Retry Test Workflow',
    trigger: { type: 'manual' },
    steps: [
      {
        id: 'step-flaky',
        name: 'Flaky step',
        type: 'test_flaky',
        config: {},
        retryPolicy: { maxRetries: 2, backoffMs: 50 },
      },
    ],
  };

  await saveWorkflow(flakyWf);
  const runResult = await executeWorkflow(flakyWf, { triggerSource: 'test' });

  assert(runResult.status === 'COMPLETED', 'Workflow completes after retrying transient error');
  assert(attemptCount === 2, 'Executed exactly 2 attempts (1 failure + 1 successful retry)');

  // ---------------------------------------------------------
  // TEST GROUP 4: EXECUTION LOGS & DB PERSISTENCE
  // ---------------------------------------------------------
  console.log('\n--- Group 4: Execution Logs Persistence ---');

  const runs = await getWorkflowRuns(5);
  assert(runs.length > 0, 'Workflow run logged in Prisma SQLite DB');
  assert(runs[0].stepLogs.length > 0, 'Step execution logs recorded in DB');

  // ---------------------------------------------------------
  // TEST GROUP 5: PLUGGABLE INTEGRATION REGISTRY
  // ---------------------------------------------------------
  console.log('\n--- Group 5: Pluggable Integration Registry ---');

  assert(stepRegistry.has('gmail_send'), 'Gmail send step registered in stepRegistry');
  assert(stepRegistry.has('slack_send_message'), 'Slack message step registered in stepRegistry');
  assert(stepRegistry.has('github_create_issue'), 'GitHub issue step registered in stepRegistry');
  assert(stepRegistry.has('google_drive_upload'), 'Google Drive upload step registered in stepRegistry');

  console.log('\n========================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
