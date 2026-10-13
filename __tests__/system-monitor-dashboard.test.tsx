import {
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { SystemMonitorDashboard } from '@/components/system-monitor/SystemMonitorDashboard';
import {
  monitorApi,
  MonitorApiError,
  MonitorOverview,
} from '@/lib/api/system-monitor';

jest.mock('@/lib/api/system-monitor', () => {
  const actual = jest.requireActual('@/lib/api/system-monitor');
  return {
    ...actual,
    monitorApi: {
      capabilities: jest.fn(),
      overview: jest.fn(),
      history: jest.fn(),
      incidents: jest.fn(),
      run: jest.fn(),
      logs: jest.fn(),
    },
  };
});
configure({ asyncUtilTimeout: 10000 });
jest.setTimeout(30000);
const api = jest.mocked(monitorApi);
const overview: MonitorOverview = {
  generatedAt: new Date().toISOString(),
  environment: 'TEST',
  workerHeartbeatAt: new Date().toISOString(),
  checks: [
    {
      checkId: 'backend.health',
      required: true,
      enabled: true,
      intervalMs: 60000,
      deadlineMs: 10000,
      status: 'pass',
      lastRun: {
        runId: 'run-1',
        checkId: 'backend.health',
        scheduledAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        outcome: 'pass',
        durationMs: 120,
        httpStatus: 200,
        failedStep: null,
        errorCode: null,
        diagnostic: null,
      },
    },
  ],
  delivery: { slackPending: 0, slackFailed: 0, lokiPending: 0, lokiDropped: 0 },
};
beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(window.location, { search: '' });
  api.capabilities.mockResolvedValue({ canRead: true });
  api.overview.mockResolvedValue(overview);
  api.history.mockResolvedValue({
    items: [],
    total: 0,
    offset: 0,
    limit: 25,
    buckets: [],
  });
  api.incidents.mockResolvedValue({
    items: [],
    total: 0,
    offset: 0,
    limit: 25,
  });
  api.logs.mockResolvedValue({ items: [], truncated: false });
});
it('does not fetch monitor records when the current user has no access', async () => {
  api.capabilities.mockResolvedValue({ canRead: false });
  render(<SystemMonitorDashboard />);
  expect(await screen.findByText(/You do not have access/)).toBeInTheDocument();
  expect(api.overview).not.toHaveBeenCalled();
  expect(api.history).not.toHaveBeenCalled();
});
it('shows fresh status and loads bounded history when the period changes', async () => {
  render(<SystemMonitorDashboard />);
  expect(await screen.findByText('Fresh')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '7 days' }));
  await waitFor(() =>
    expect(api.history).toHaveBeenLastCalledWith(
      expect.objectContaining({
        checkId: 'backend.health',
        limit: 25,
        offset: 0,
      })
    )
  );
  const query = api.history.mock.calls.at(-1)?.[0];
  expect(Date.parse(query!.to) - Date.parse(query!.from)).toBeLessThanOrEqual(
    7 * 86400000
  );
  expect(Date.parse(query!.to) - Date.parse(query!.from)).toBeGreaterThan(
    7 * 86400000 - 60000
  );
});
it('never leaves an old success green after its freshness deadline', async () => {
  api.overview.mockResolvedValue({
    ...overview,
    checks: [
      {
        ...overview.checks[0],
        lastRun: {
          ...overview.checks[0].lastRun!,
          endedAt: '2020-01-01T00:00:00Z',
        },
      },
    ],
  });
  render(<SystemMonitorDashboard />);
  expect(await screen.findByText('Stale')).toBeInTheDocument();
  expect(screen.getByText('Unknown')).toBeInTheDocument();
});
it('shows an expired incident link honestly', async () => {
  Object.assign(window.location, { search: '?incident=expired' });
  render(<SystemMonitorDashboard />);
  expect(await screen.findByText(/Incident not found/)).toBeInTheDocument();
});
it('keeps a Loki outage separate from monitor results', async () => {
  api.logs.mockRejectedValue(new MonitorApiError(503));
  render(<SystemMonitorDashboard />);
  await screen.findByText('Fresh');
  fireEvent.click(screen.getByRole('button', { name: 'Load logs' }));
  expect(
    await screen.findByText(/Loki logs are unavailable/)
  ).toBeInTheDocument();
  expect(screen.getByText('Fresh')).toBeInTheDocument();
});

it('shows a source outage without presenting last-known health as current', async () => {
  api.overview.mockRejectedValue(new MonitorApiError(503));
  render(<SystemMonitorDashboard />);
  expect(
    await screen.findByText(/Monitor source is offline/)
  ).toBeInTheDocument();
  expect(screen.queryByText('Pass')).not.toBeInTheDocument();
});

it('looks up the exact linked incident and expands coverage details', async () => {
  Object.assign(window.location, { search: '?incident=coverage-1' });
  api.incidents.mockImplementation(async (query) => ({
    items: query.id
      ? [
          {
            incidentId: 'coverage-1',
            checkId: 'backend.health',
            kind: 'coverage',
            openedAt: overview.generatedAt,
            confirmedAt: overview.generatedAt,
            resolvedAt: null,
            reason: 'Probe credentials expired',
            blockedChecks: ['backend.catalog'],
          },
        ]
      : [],
    total: query.id ? 1 : 0,
    offset: 0,
    limit: 25,
  }));
  render(<SystemMonitorDashboard />);
  expect(
    await screen.findByText('Probe credentials expired')
  ).toBeInTheDocument();
  expect(
    screen.getByText('Blocked checks: backend.catalog')
  ).toBeInTheDocument();
  expect(screen.getByText('Incident ID: coverage-1')).toBeInTheDocument();
});

it('paginates raw history instead of loading the whole week', async () => {
  api.history.mockResolvedValue({
    items: [],
    total: 60,
    offset: 0,
    limit: 25,
    buckets: [],
  });
  render(<SystemMonitorDashboard />);
  await screen.findByText('Raw check history');
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Go to next page' })[0]
  );
  await waitFor(() =>
    expect(api.history).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 25, limit: 25 })
    )
  );
});

it('exposes truncation and suppresses unsafe Grafana links', async () => {
  api.logs.mockResolvedValue({
    items: [],
    truncated: true,
    grafanaUrl: 'javascript:alert(1)',
  });
  render(<SystemMonitorDashboard />);
  await screen.findByText('Fresh');
  fireEvent.click(screen.getByRole('button', { name: 'Load logs' }));
  expect(
    await screen.findByText(/Log results are truncated/)
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: 'Open Grafana' })
  ).not.toBeInTheDocument();
});

it('does not send an inverted log window for an old retained open incident', async () => {
  Object.assign(window.location, { search: '?incident=old-open' });
  api.incidents.mockImplementation(async (query) => ({
    items: query.id
      ? [
          {
            incidentId: 'old-open',
            checkId: 'backend.health',
            kind: 'target',
            openedAt: '2020-01-01T00:00:00Z',
            confirmedAt: '2020-01-01T00:02:00Z',
            resolvedAt: null,
            reason: 'Old retained open incident',
            blockedChecks: [],
          },
        ]
      : [],
    total: 1,
    offset: 0,
    limit: 25,
  }));
  render(<SystemMonitorDashboard />);
  await screen.findByText('Old retained open incident');
  fireEvent.click(screen.getByRole('button', { name: 'Load logs' }));
  expect(
    await screen.findByText(/Selected log window is outside retention/)
  ).toBeInTheDocument();
  expect(api.logs).not.toHaveBeenCalled();
});

// Controlled API fixture uses the current backend's monitorWindow acceptance
// predicates: ordered, <=7 days, from no earlier than now-week-60s, no future >60s.
// Assertions additionally require requests inside actual retention (no grace).
const weekMs = 7 * 86400000;
const fixtureWindow = (query: { from: string; to: string }) => {
  const from = Date.parse(query.from);
  const to = Date.parse(query.to);
  const now = Date.now();
  if (
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    from >= Math.min(to, now) ||
    to - from > weekMs ||
    from < now - weekMs - 60000 ||
    to > now + 60000
  )
    throw new MonitorApiError(400);
};
function enforceRetainedApiWindows() {
  api.history.mockImplementation(async (query) => {
    fixtureWindow(query);
    return {
      items: [],
      total: 60,
      offset: query.offset,
      limit: query.limit,
      buckets: [],
    };
  });
  api.incidents.mockImplementation(async (query) => {
    fixtureWindow(query);
    return { items: [], total: 60, offset: query.offset, limit: query.limit };
  });
  api.logs.mockImplementation(async (query) => {
    fixtureWindow(query);
    return { items: [], truncated: false };
  });
}
async function showWeeklyHistory() {
  render(<SystemMonitorDashboard />);
  await screen.findByText('Raw check history');
  fireEvent.click(screen.getByRole('button', { name: '7 days' }));
  await waitFor(() =>
    expect(api.history).toHaveBeenLastCalledWith(
      expect.objectContaining({
        from: new Date(Date.now() - weekMs).toISOString(),
      })
    )
  );
  await screen.findByText('Raw check history');
}
afterEach(() => jest.restoreAllMocks());

it('refreshes a seven-day window after 120 seconds and resets both page offsets', async () => {
  const start = Date.now();
  const clock = jest.spyOn(Date, 'now').mockReturnValue(start);
  enforceRetainedApiWindows();
  await showWeeklyHistory();
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Go to next page' })[0]
  );
  await waitFor(() =>
    expect(api.history).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 25 })
    )
  );
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Go to next page' })[1]
  );
  await waitFor(() =>
    expect(api.incidents).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 25 })
    )
  );
  clock.mockReturnValue(start + 120000);
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
  await waitFor(() =>
    expect(api.history).toHaveBeenLastCalledWith(
      expect.objectContaining({
        offset: 0,
        from: new Date(start + 120000 - weekMs).toISOString(),
        to: new Date(start + 120000).toISOString(),
      })
    )
  );
  expect(api.incidents).toHaveBeenLastCalledWith(
    expect.objectContaining({
      offset: 0,
      to: new Date(start + 120000).toISOString(),
    })
  );
  expect(
    screen.queryByText(/Monitor history is unavailable/)
  ).not.toBeInTheDocument();
});

it('clamps seven-day pagination after 61 seconds while preserving its original end', async () => {
  const start = Date.now();
  const clock = jest.spyOn(Date, 'now').mockReturnValue(start);
  enforceRetainedApiWindows();
  await showWeeklyHistory();
  clock.mockReturnValue(start + 61000);
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Go to next page' })[0]
  );
  await waitFor(() =>
    expect(api.history).toHaveBeenLastCalledWith(
      expect.objectContaining({
        offset: 25,
        from: new Date(start + 61000 - weekMs).toISOString(),
        to: new Date(start).toISOString(),
      })
    )
  );
  expect(await screen.findByText('Raw check history')).toBeInTheDocument();
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Go to next page' })[1]
  );
  await waitFor(() =>
    expect(api.incidents).toHaveBeenLastCalledWith(
      expect.objectContaining({
        offset: 25,
        from: new Date(start + 61000 - weekMs).toISOString(),
        to: new Date(start).toISOString(),
      })
    )
  );
});

it('clamps a delayed check selection without automatically reloading all history', async () => {
  const start = Date.now();
  const clock = jest.spyOn(Date, 'now').mockReturnValue(start);
  api.overview.mockResolvedValue({
    ...overview,
    checks: [
      ...overview.checks,
      { ...overview.checks[0], checkId: 'backend.catalog' },
    ],
  });
  enforceRetainedApiWindows();
  await showWeeklyHistory();
  const count = api.history.mock.calls.length;
  clock.mockReturnValue(start + 120000);
  expect(api.history).toHaveBeenCalledTimes(count);
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Check' }));
  fireEvent.click(screen.getByRole('option', { name: 'backend.catalog' }));
  await waitFor(() =>
    expect(api.history).toHaveBeenLastCalledWith(
      expect.objectContaining({
        checkId: 'backend.catalog',
        from: new Date(start + 120000 - weekMs).toISOString(),
        to: new Date(start).toISOString(),
      })
    )
  );
  expect(await screen.findByText('Raw check history')).toBeInTheDocument();
});

it('clamps a seven-day default Loki window requested 120 seconds later', async () => {
  const start = Date.now();
  const clock = jest.spyOn(Date, 'now').mockReturnValue(start);
  enforceRetainedApiWindows();
  await showWeeklyHistory();
  clock.mockReturnValue(start + 120000);
  fireEvent.click(screen.getByRole('button', { name: 'Load logs' }));
  await waitFor(() =>
    expect(api.logs).toHaveBeenLastCalledWith(
      expect.objectContaining({
        from: new Date(start + 120000 - weekMs).toISOString(),
        to: new Date(start).toISOString(),
      })
    )
  );
  expect(
    await screen.findByText('No logs found in this window.')
  ).toBeInTheDocument();
});

it('shows an expired selected range honestly without sending history or log requests', async () => {
  const start = Date.now();
  const clock = jest.spyOn(Date, 'now').mockReturnValue(start);
  enforceRetainedApiWindows();
  await showWeeklyHistory();
  const historyCount = api.history.mock.calls.length;
  const incidentCount = api.incidents.mock.calls.length;
  clock.mockReturnValue(start + weekMs + 120000);
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Go to next page' })[0]
  );
  expect(
    await screen.findByText(/Selected history window is outside retention/)
  ).toBeInTheDocument();
  expect(api.history).toHaveBeenCalledTimes(historyCount);
  fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
  expect(
    await screen.findByText(/Selected incident window is outside retention/)
  ).toBeInTheDocument();
  expect(api.incidents).toHaveBeenCalledTimes(incidentCount);
  fireEvent.click(screen.getByRole('button', { name: 'Load logs' }));
  expect(
    await screen.findByText(/Selected log window is outside retention/)
  ).toBeInTheDocument();
  expect(api.logs).not.toHaveBeenCalled();
});
