import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { SystemMonitorDashboard } from '@/components/system-monitor/SystemMonitorDashboard';
import {
  monitorApi,
  type MonitorCheck,
  type MonitorRun,
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
const run: MonitorRun = {
  runId: 'shared-run',
  checkId: 'backend.personalization.load',
  scheduledAt: at,
  startedAt: at,
  endedAt: at,
  outcome: 'warn',
  durationMs: 27,
  httpStatus: 200,
  failedStep: null,
  errorCode: 'personalization_work_warning',
  diagnostic: 'Shared observation',
  personalizationLoad: {
    scope: 'database',
    measurement: 'complete',
    intervalMinutes: 15,
    sqlMsPerMinute: 1250,
    callsPerMinute: 40,
    sharedBlocksPerMinute: 3000,
    writesPerMinute: 15,
    totalPortraits: 100,
    overduePortraits: 0,
    lastCheckedAt: at,
    baselineSqlMsPerMinute: 1000,
    baselineHours: 24,
    loadRatio: 1.25,
    personalization: {
      measurement: 'complete',
      intervalMinutes: 15,
      runs: 15,
      checked: 150,
      reused: 140,
      failed: 1,
      sourcePolls: 15,
      sourcePollFailures: 0,
      averageRunMs: 300,
      averageSourcePollMs: 150,
      lastRunAt: at,
      lastSuccessfulAt: at,
      lastRunMs: 300,
    },
  },
};
const check: MonitorCheck = {
  checkId: run.checkId,
  enabled: true,
  required: true,
  intervalMs: 900000,
  deadlineMs: 15000,
  status: 'warn',
  lastRun: run,
};
beforeEach(() => {
  jest.clearAllMocks();
  api.capabilities.mockResolvedValue({ canRead: true });
  api.overview.mockResolvedValue({
    generatedAt: at,
    workerHeartbeatAt: at,
    environment: 'TEST',
    checks: [check],
    delivery: {
      slackPending: 0,
      slackFailed: 0,
      lokiPending: 0,
      lokiDropped: 0,
    },
  });
  api.history.mockResolvedValue({
    items: [run],
    buckets: [],
    offset: 0,
    limit: 25,
    total: 1,
  });
  api.incidents.mockResolvedValue({
    items: [],
    offset: 0,
    limit: 25,
    total: 0,
  });
  api.run.mockResolvedValue(run);
});
it('offers separate menu entries and projects each history without sharing its outcome', async () => {
  render(<SystemMonitorDashboard />);
  const select = await screen.findByRole('combobox', {
    name: 'Check',
  });
  fireEvent.mouseDown(select);
  expect(
    await screen.findByRole('option', { name: 'Database load' })
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('option', { name: 'Personalization health' })
  );
  expect(select).toHaveTextContent('Personalization health');
  const table = await screen.findByRole('table', { name: 'Raw check history' });
  expect(within(table).getByText('Warning')).toBeInTheDocument();
  expect(within(table).getByText('150')).toBeInTheDocument();
  expect(within(table).getByText('Refresh errors')).toBeInTheDocument();
  fireEvent.click(
    await within(table).findByRole('button', { name: 'Inspect' })
  );
  const dialog = await screen.findByRole('dialog', {
    name: 'Check details · Personalization health',
  });
  expect(within(dialog).getByText('Warning')).toBeInTheDocument();
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Close check details' })
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
  fireEvent.mouseDown(select);
  fireEvent.click(await screen.findByRole('option', { name: 'Database load' }));
  expect(within(table).getByText('Pass')).toBeInTheDocument();
  expect(within(table).getByText('1.25 s/min')).toBeInTheDocument();
  expect(within(table).queryByText('Refresh errors')).not.toBeInTheDocument();
  expect(
    screen.queryByText('Successful response time')
  ).not.toBeInTheDocument();
  fireEvent.click(
    await within(table).findByRole('button', { name: 'Inspect' })
  );
  const dbDialog = await screen.findByRole('dialog', {
    name: 'Check details · Database load',
  });
  expect(within(dbDialog).getByText('Pass')).toBeInTheDocument();
  await waitFor(() =>
    expect(api.history).toHaveBeenCalledWith(
      expect.objectContaining({ checkId: run.checkId, offset: 0 })
    )
  );
});
it('selects the corresponding history from either compact card', async () => {
  render(<SystemMonitorDashboard />);
  fireEvent.click(
    await screen.findByRole('button', {
      name: /Personalization health: Warning/,
    })
  );
  expect(
    await screen.findByRole('dialog', {
      name: 'Check details · Personalization health',
    })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close check details' }));
  expect(
    await screen.findByRole('combobox', { name: 'Check' })
  ).toHaveTextContent('Personalization health');
});
