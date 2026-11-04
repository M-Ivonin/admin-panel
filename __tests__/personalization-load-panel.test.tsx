import { fireEvent, render, screen, within } from '@testing-library/react';
import { PersonalizationLoadPanel } from '@/components/system-monitor/PersonalizationLoadPanel';
import { SystemMonitorDashboard } from '@/components/system-monitor/SystemMonitorDashboard';
import {
  monitorApi,
  type MonitorCheck,
  type MonitorRun,
} from '@/lib/api/system-monitor';

jest.mock('@/lib/api/system-monitor', () => ({
  ...jest.requireActual('@/lib/api/system-monitor'),
  monitorApi: {
    history: jest.fn(),
    capabilities: jest.fn(),
    overview: jest.fn(),
    incidents: jest.fn(),
    run: jest.fn(),
    logs: jest.fn(),
  },
}));
const history = jest.mocked(monitorApi.history);
const now = Date.parse('2026-11-04T18:00:00Z');
const sample = (minutesAgo = 0): MonitorRun => ({
  runId: `run-${minutesAgo}`,
  checkId: 'backend.personalization.load',
  scheduledAt: new Date(now - minutesAgo * 60000).toISOString(),
  startedAt: null,
  endedAt: new Date(now - minutesAgo * 60000).toISOString(),
  outcome: 'pass',
  durationMs: 12,
  httpStatus: 200,
  failedStep: null,
  errorCode: null,
  diagnostic: null,
  personalizationLoad: {
    scope: 'database',
    measurement: 'complete',
    intervalMinutes: 15,
    lastCompleteAt: new Date(now).toISOString(),
    sqlMsPerMinute: 1250,
    callsPerMinute: 40,
    sharedBlocksPerMinute: 3000,
    writesPerMinute: 15,
    totalPortraits: 4327,
    overduePortraits: 0,
    lastCheckedAt: new Date(now).toISOString(),
    baselineSqlMsPerMinute: 1000,
    baselineHours: 24,
    loadRatio: 1.25,
    personalization: {
      measurement: 'complete',
      intervalMinutes: 15,
      runs: 15,
      checked: 200,
      reused: 180,
      failed: 0,
      sourcePolls: 15,
      sourcePollFailures: 0,
      averageRunMs: 300,
      averageSourcePollMs: 100,
      lastRunAt: new Date(now).toISOString(),
      lastSuccessfulAt: new Date(now).toISOString(),
      lastRunMs: 3629,
    },
  },
});
const check = (): MonitorCheck => ({
  checkId: 'backend.personalization.load',
  enabled: true,
  required: true,
  intervalMs: 900000,
  deadlineMs: 15000,
  status: 'pass',
  lastRun: sample(),
});
beforeEach(() =>
  history.mockResolvedValue({
    items: [sample(15), sample()],
    total: 2,
    limit: 100,
    offset: 0,
    buckets: [],
  })
);

it('shows personalization first, key figures, and a real history chart in each card', async () => {
  const select = jest.fn();
  render(
    <PersonalizationLoadPanel
      check={check()}
      now={now}
      sourceUnavailable={false}
      onSelect={select}
    />
  );
  const personal = screen.getByRole('region', {
    name: 'Personalization health',
  });
  const database = screen.getByRole('region', { name: 'Database load' });
  expect(
    personal.compareDocumentPosition(database) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(within(personal).getByText('4,327')).toBeInTheDocument();
  expect(within(personal).getByLabelText('3.63 s')).toBeInTheDocument();
  expect(within(database).getByLabelText('1.25 s/min')).toBeInTheDocument();
  expect(
    await within(personal).findByRole('img', { name: /profile activity/i })
  ).toBeInTheDocument();
  expect(
    await within(database).findByRole('img', { name: /database sql/i })
  ).toBeInTheDocument();
  expect(screen.queryByText(/SQL counters cover/)).not.toBeInTheDocument();
  fireEvent.click(
    within(personal).getByRole('button', { name: 'View shared history' })
  );
  expect(select).toHaveBeenCalledWith('personalization');
  fireEvent.click(
    within(database).getByRole('button', { name: 'View shared history' })
  );
  expect(select).toHaveBeenLastCalledWith('database');
});

it('does not turn partial, old-scope, out-of-window or future observations into chart data', async () => {
  const partial = sample(15);
  partial.personalizationLoad!.measurement = 'partial';
  partial.personalizationLoad!.personalization!.measurement = 'partial';
  const legacy = sample(30);
  delete legacy.personalizationLoad!.scope;
  history.mockResolvedValue({
    items: [partial, legacy, sample(1500), sample(-30)],
    total: 4,
    limit: 100,
    offset: 0,
    buckets: [],
  });
  render(
    <PersonalizationLoadPanel
      check={check()}
      now={now}
      sourceUnavailable={false}
      onSelect={() => {}}
    />
  );
  expect(await screen.findAllByText('Collecting activity data')).toHaveLength(
    2
  );
  expect(
    screen.queryByRole('img', { name: /profile activity|database sql/i })
  ).not.toBeInTheDocument();
});

it('marks retained figures as last known and reports chart-history failure separately', async () => {
  history.mockRejectedValue(new Error('offline'));
  render(
    <PersonalizationLoadPanel
      check={check()}
      now={now}
      sourceUnavailable
      onSelect={() => {}}
    />
  );
  expect(screen.getAllByText(/Last known values/)).toHaveLength(2);
  expect(
    await screen.findAllByText('Activity history unavailable')
  ).toHaveLength(2);
  expect(screen.queryByText('Healthy')).not.toBeInTheDocument();
});

it('places the two health cards after the check map in the dashboard', async () => {
  const stamp = new Date().toISOString();
  const fresh = check();
  fresh.lastRun = { ...sample(), endedAt: stamp };
  jest.mocked(monitorApi.capabilities).mockResolvedValue({ canRead: true });
  jest.mocked(monitorApi.overview).mockResolvedValue({
    generatedAt: stamp,
    environment: 'TEST',
    workerHeartbeatAt: stamp,
    checks: [fresh],
    delivery: {
      slackPending: 0,
      slackFailed: 0,
      lokiPending: 0,
      lokiDropped: 0,
    },
  });
  jest
    .mocked(monitorApi.incidents)
    .mockResolvedValue({ items: [], total: 0, offset: 0, limit: 25 });
  render(<SystemMonitorDashboard />);
  const map = await screen.findByRole('region', {
    name: 'Backend check dependencies',
  });
  const personal = screen.getByRole('region', {
    name: 'Personalization health',
  });
  expect(
    map.compareDocumentPosition(personal) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});
