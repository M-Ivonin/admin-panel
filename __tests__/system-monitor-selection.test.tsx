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

it('opens a Slack incident link on its own health aspect', async () => {
  Object.assign(window.location, {
    search: '?incident=personalization-incident',
  });
  const incident = {
    incidentId: 'personalization-incident',
    checkId: run.checkId,
    aspect: 'personalization' as const,
    kind: 'target' as const,
    openedAt: at,
    confirmedAt: at,
    resolvedAt: null,
    reason: 'personalization_job_stale',
    blockedChecks: [],
  };
  api.incidents.mockResolvedValue({
    items: [incident],
    total: 1,
    offset: 0,
    limit: 25,
  });
  try {
    render(<SystemMonitorDashboard />);
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Personalization health' })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/reconciliation has not completed/)
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Close incident details' })
    );
    expect(
      await screen.findByRole('combobox', { name: 'Check' })
    ).toHaveTextContent('Personalization health');
  } finally {
    Object.assign(window.location, { search: '' });
  }
});
it('shows a retired combined incident as replaced rather than recovered', async () => {
  const incident = {
    incidentId: 'combined-old',
    checkId: run.checkId,
    kind: 'target' as const,
    resolution: 'superseded' as const,
    openedAt: at,
    confirmedAt: at,
    resolvedAt: at,
    reason: 'personalization_stale',
    blockedChecks: [],
  };
  api.incidents.mockResolvedValue({
    items: [incident],
    total: 1,
    offset: 0,
    limit: 25,
  });
  render(<SystemMonitorDashboard />);
  fireEvent.click(
    await screen.findByRole('button', { name: 'Incident details' })
  );
  const dialog = await screen.findByRole('dialog');
  expect(
    within(dialog).getByText('Replaced', { exact: true })
  ).toBeInTheDocument();
  expect(
    within(dialog).getByText(/does not confirm recovery/)
  ).toBeInTheDocument();
  expect(
    within(dialog).queryByText('Resolved', { exact: true })
  ).not.toBeInTheDocument();
});
it('uses independently persisted results when metrics alone cannot prove a never-completed job is stalled', async () => {
  api.overview.mockResolvedValue({
    generatedAt: at,
    workerHeartbeatAt: at,
    environment: 'TEST',
    delivery: {
      slackPending: 0,
      slackFailed: 0,
      lokiPending: 0,
      lokiDropped: 0,
    },
    checks: [
      {
        ...check,
        status: 'fail',
        lastRun: {
          ...run,
          aspects: {
            database: {
              outcome: 'unavailable',
              errorCode: 'database_measurement_unavailable',
            },
            personalization: {
              outcome: 'fail',
              errorCode: 'personalization_job_stale',
            },
          },
          errorCode: 'personalization_measurement_unavailable',
          personalizationLoad: {
            ...run.personalizationLoad!,
            measurement: 'unavailable',
            sqlMsPerMinute: null,
            personalization: {
              ...run.personalizationLoad!.personalization!,
              measurement: 'warmup',
              lastRunAt: null,
            },
          },
        },
      },
    ],
  });
  render(<SystemMonitorDashboard />);
  expect(
    await screen.findByRole('button', {
      name: /Personalization health: Reconciliation overdue/,
    })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /Database load: Unavailable/ })
  ).toBeInTheDocument();
});
