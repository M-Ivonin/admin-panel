import { render, screen } from '@testing-library/react';
import { SystemMonitorDashboard } from '@/components/system-monitor/SystemMonitorDashboard';
import {
  monitorApi,
  type MonitorCheck,
  MONITOR_QUEUE_IDS,
} from '@/lib/api/system-monitor';
jest.mock('@/lib/api/system-monitor', () => ({
  ...jest.requireActual('@/lib/api/system-monitor'),
  monitorApi: {
    capabilities: jest.fn(),
    overview: jest.fn(),
    history: jest.fn(),
    incidents: jest.fn(),
    run: jest.fn(),
    logs: jest.fn(),
  },
}));
const api = jest.mocked(monitorApi);
const at = new Date().toISOString();
function check(): MonitorCheck {
  return {
    checkId: 'backend.queues',
    enabled: true,
    required: false,
    status: 'warn',
    intervalMs: 900000,
    deadlineMs: 15000,
    lastRun: {
      runId: 'queue-run',
      checkId: 'backend.queues',
      scheduledAt: at,
      startedAt: at,
      endedAt: at,
      durationMs: 824,
      httpStatus: 200,
      failedStep: null,
      errorCode: 'unresolved_operations',
      diagnostic: null,
      outcome: 'warn',
      queueHealth: {
        generatedAt: at,
        queues: MONITOR_QUEUE_IDS.map((queueId) => ({
          queueId,
          processing: 'pass',
          outcome: queueId === 'commerce.reconciliation' ? 'warn' : 'pass',
          reason: 'processing_healthy',
          lastSuccessfulAt: at,
          dueCount: 0,
          overdueCount: 0,
          activeLeaseCount: 0,
          expiredLeaseCount: 0,
          retryCount: 0,
          manualReviewCount: queueId === 'commerce.reconciliation' ? 1 : 0,
          failedCount: 0,
          unresolvedCount: queueId === 'commerce.reconciliation' ? 1 : 0,
          oldestDueAt: null,
          issues:
            queueId === 'commerce.reconciliation'
              ? [
                  {
                    operationId: 'f57c9b17-c3ec-46a5-8b7c-b7f80b7bc5df',
                    kind: 'manual_review',
                    attempts: 20,
                    nextAttemptAt: new Date(Date.now() + 3600000).toISOString(),
                    lastFailureAt: at,
                    errorCode: 'subscription_purchase_no_longer_available',
                    product: 'PRO_MONTHLY',
                  },
                ]
              : [],
        })),
      },
    },
  };
}
beforeEach(() => {
  jest.clearAllMocks();
  api.capabilities.mockResolvedValue({ canRead: true });
  api.history.mockResolvedValue({
    items: [],
    total: 0,
    limit: 25,
    offset: 0,
    buckets: [],
  });
  api.incidents.mockResolvedValue({
    items: [],
    total: 0,
    limit: 25,
    offset: 0,
  });
});
it('shows the affected operation separately from the four healthy queues', async () => {
  api.overview.mockResolvedValue({
    generatedAt: at,
    workerHeartbeatAt: at,
    environment: 'TEST',
    checks: [check()],
    delivery: {
      slackPending: 0,
      slackFailed: 0,
      lokiPending: 0,
      lokiDropped: 0,
    },
  });
  render(<SystemMonitorDashboard />);
  expect(await screen.findByText('Queues processing')).toBeInTheDocument();
  expect(screen.getByText('4 / 4')).toBeInTheDocument();
  expect(
    screen.getByText('Google Play subscription needs follow-up')
  ).toBeInTheDocument();
  expect(screen.getAllByText('Purchase finalization')[0]).toBeInTheDocument();
  expect(
    screen.queryByText('Successful response time')
  ).not.toBeInTheDocument();
});
it('does not show a Google card after the operation clears', async () => {
  const c = check();
  c.lastRun!.queueHealth!.queues.forEach((q) => {
    q.issues = [];
    q.unresolvedCount = 0;
    q.manualReviewCount = 0;
    q.outcome = 'pass';
  });
  api.overview.mockResolvedValue({
    generatedAt: at,
    workerHeartbeatAt: at,
    environment: 'TEST',
    checks: [c],
    delivery: {
      slackPending: 0,
      slackFailed: 0,
      lokiPending: 0,
      lokiDropped: 0,
    },
  });
  render(<SystemMonitorDashboard />);
  expect(
    await screen.findByText('No unresolved operations.')
  ).toBeInTheDocument();
  expect(
    screen.queryByText('Google Play subscription needs follow-up')
  ).not.toBeInTheDocument();
});

it('shows an arbitrary campaign problem rather than a permanent Google block', async () => {
  const c = check(),
    q = c.lastRun!.queueHealth!.queues;
  const issue = q[2].issues[0];
  q[2].issues = [];
  q[2].unresolvedCount = 0;
  q[2].manualReviewCount = 0;
  q[3].issues = [
    { ...issue, errorCode: 'ambiguous_submission', product: null },
  ];
  q[3].unresolvedCount = 1;
  q[3].manualReviewCount = 1;
  api.overview.mockResolvedValue({
    generatedAt: at,
    workerHeartbeatAt: at,
    environment: 'TEST',
    checks: [c],
    delivery: {
      slackPending: 0,
      slackFailed: 0,
      lokiPending: 0,
      lokiDropped: 0,
    },
  });
  render(<SystemMonitorDashboard />);
  expect(
    await screen.findByText('Campaign deliveries needs follow-up')
  ).toBeInTheDocument();
  expect(
    screen.queryByText('Google Play subscription needs follow-up')
  ).not.toBeInTheDocument();
});
it('does not report healthy processing from a stale snapshot', async () => {
  const c = check();
  c.lastRun!.endedAt = new Date(Date.now() - 3600000).toISOString();
  api.overview.mockResolvedValue({
    generatedAt: at,
    workerHeartbeatAt: at,
    environment: 'TEST',
    checks: [c],
    delivery: {
      slackPending: 0,
      slackFailed: 0,
      lokiPending: 0,
      lokiDropped: 0,
    },
  });
  render(<SystemMonitorDashboard />);
  expect(await screen.findByText('Current state unknown')).toBeInTheDocument();
  expect(screen.queryByText('4 / 4')).not.toBeInTheDocument();
  expect(
    screen.queryByText('No unresolved operations.')
  ).not.toBeInTheDocument();
});

it('retains the known operation as unconfirmed when a fresh observation has no source data', async () => {
  const c = check();
  c.lastKnownQueueRuns = [JSON.parse(JSON.stringify(c.lastRun))];
  delete c.lastRun!.queueHealth;
  c.lastRun!.outcome = 'unavailable';
  c.status = 'unavailable';
  api.overview.mockResolvedValue({
    generatedAt: at,
    workerHeartbeatAt: at,
    environment: 'TEST',
    checks: [c],
    delivery: {
      slackPending: 0,
      slackFailed: 0,
      lokiPending: 0,
      lokiDropped: 0,
    },
  });
  render(<SystemMonitorDashboard />);
  expect(
    await screen.findByText('Google Play subscription needs follow-up')
  ).toBeInTheDocument();
  expect(screen.getByText('Last known issue')).toBeInTheDocument();
  expect(screen.queryByText('4 / 4')).not.toBeInTheDocument();
  expect(
    screen.queryByText('No unresolved operations.')
  ).not.toBeInTheDocument();
});

it('retains last-known issue details when incomplete counters accompany a confirmed processing fault', async () => {
  const c = check();
  c.lastKnownQueueRuns = [JSON.parse(JSON.stringify(c.lastRun))];
  const q = c.lastRun!.queueHealth!.queues[2];
  Object.assign(q, {
    processing: 'fail',
    outcome: 'fail',
    reason: 'overdue_work',
    unresolvedCount: null,
    overdueCount: null,
    issues: [],
  });
  c.lastRun!.outcome = 'fail';
  c.status = 'fail';
  api.overview.mockResolvedValue({
    generatedAt: at,
    workerHeartbeatAt: at,
    environment: 'TEST',
    checks: [c],
    delivery: {
      slackPending: 0,
      slackFailed: 0,
      lokiPending: 0,
      lokiDropped: 0,
    },
  });
  render(<SystemMonitorDashboard />);
  expect(
    await screen.findByText('Google Play subscription needs follow-up')
  ).toBeInTheDocument();
  expect(screen.getByText('Last known issue')).toBeInTheDocument();
  expect(
    screen.queryByText('No unresolved operations.')
  ).not.toBeInTheDocument();
});
