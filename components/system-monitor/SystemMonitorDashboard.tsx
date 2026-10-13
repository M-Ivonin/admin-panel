'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { MonitorCharts } from './MonitorCharts';
import {
  monitorApi,
  MonitorApiError,
  type LogService,
  type MonitorOverview,
  type MonitorHistory,
  type MonitorIncident,
  type MonitorRun,
  type MonitorLogs,
  type Outcome,
  type Page,
} from '@/lib/api/system-monitor';

const retentionMs = 7 * 86400000;
type TimeWindow = { from: string; to: string };
function periodWindow(hours: number): TimeWindow {
  const end = Date.now();
  return {
    from: new Date(end - hours * 3600000).toISOString(),
    to: new Date(end).toISOString(),
  };
}
function retainedWindow(window: TimeWindow): TimeWindow | null {
  const now = Date.now();
  const from = Math.max(Date.parse(window.from), now - retentionMs);
  const to = Math.min(Date.parse(window.to), now);
  if (from >= to) return null;
  return { from: new Date(from).toISOString(), to: new Date(to).toISOString() };
}

const labels: Record<Outcome, string> = {
  pass: 'Pass',
  warn: 'Warning',
  fail: 'Fail',
  unavailable: 'Unavailable',
  interrupted: 'Interrupted',
  unknown: 'Unknown',
};
const time = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('en-GB', { timeZone: 'Europe/Kyiv' })
    : 'Never';
const safeGrafana = (url?: string) => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
};
function Status({ outcome }: { outcome: Outcome }) {
  return (
    <Chip
      size="small"
      label={labels[outcome]}
      color={
        outcome === 'pass'
          ? 'success'
          : outcome === 'warn'
            ? 'warning'
            : outcome === 'fail'
              ? 'error'
              : 'default'
      }
    />
  );
}
const denied = (error: unknown) =>
  error instanceof MonitorApiError &&
  (error.status === 403 || error.status === 401);

export function SystemMonitorDashboard() {
  const [access, setAccess] = useState<
    'loading' | 'allowed' | 'denied' | 'error'
  >('loading');
  const [overview, setOverview] = useState<MonitorOverview | null>(null);
  const [offline, setOffline] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [checkId, setCheckId] = useState('');
  const [period, setPeriod] = useState(24);
  const [range, setRange] = useState(() => periodWindow(24));
  const [history, setHistory] = useState<MonitorHistory | null>(null);
  const [historyError, setHistoryError] = useState(false);
  const [historyExpired, setHistoryExpired] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [incidents, setIncidents] = useState<Page<MonitorIncident> | null>(
    null
  );
  const [incidentError, setIncidentError] = useState(false);
  const [incidentsExpired, setIncidentsExpired] = useState(false);
  const [incidentLoading, setIncidentLoading] = useState(false);
  const [incidentPage, setIncidentPage] = useState(0);
  const [selectedIncident, setSelectedIncident] =
    useState<MonitorIncident | null>(null);
  const [linkState, setLinkState] = useState<
    'loading' | 'missing' | 'error' | null
  >(null);
  const [run, setRun] = useState<MonitorRun | null>(null);
  const [runState, setRunState] = useState<
    'loading' | 'missing' | 'error' | null
  >(null);
  const [logService, setLogService] = useState<LogService>('system-monitor');
  const [logs, setLogs] = useState<MonitorLogs | null>(null);
  const [logState, setLogState] = useState<
    'loading' | 'error' | 'expired' | null
  >(null);
  const runRequest = useRef(0);
  const logRequest = useRef(0);
  const overviewRequest = useRef(0);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const loadOverview = useCallback(async () => {
    const request = ++overviewRequest.current;
    try {
      const data = await monitorApi.overview();
      if (!alive.current || request !== overviewRequest.current) return;
      setOverview(data);
      setOffline(false);
      setNow(Date.now());
      setCheckId((current) => current || data.checks[0]?.checkId || '');
    } catch (error) {
      if (!alive.current || request !== overviewRequest.current) return;
      if (denied(error)) {
        setAccess('denied');
        setOverview(null);
      } else setOffline(true);
    }
  }, []);
  useEffect(() => {
    let alive = true;
    monitorApi
      .capabilities()
      .then((result) => {
        if (alive) setAccess(result.canRead ? 'allowed' : 'denied');
      })
      .catch((error) => {
        if (alive) setAccess(denied(error) ? 'denied' : 'error');
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (access !== 'allowed') return;
    void loadOverview();
    const timer = window.setInterval(() => {
      setNow(Date.now());
      if (document.visibilityState === 'visible') void loadOverview();
    }, 60000);
    return () => window.clearInterval(timer);
  }, [access, loadOverview]);
  useEffect(() => {
    if (access !== 'allowed' || !checkId) return;
    let alive = true;
    setHistoryLoading(true);
    setHistoryError(false);
    setHistory(null);
    const window = retainedWindow(range);
    setHistoryExpired(!window);
    if (!window) {
      setHistoryLoading(false);
      return;
    }
    monitorApi
      .history({ checkId, ...window, limit: 25, offset: page * 25 })
      .then((data) => {
        if (alive) setHistory(data);
      })
      .catch((error) => {
        if (alive) {
          setHistoryError(true);
          if (denied(error)) setAccess('denied');
        }
      })
      .finally(() => {
        if (alive) setHistoryLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [access, checkId, range, page]);
  useEffect(() => {
    if (access !== 'allowed') return;
    let alive = true;
    setIncidentLoading(true);
    setIncidentError(false);
    setIncidents(null);
    const window = retainedWindow(range);
    setIncidentsExpired(!window);
    if (!window) {
      setIncidentLoading(false);
      return;
    }
    monitorApi
      .incidents({ ...window, limit: 25, offset: incidentPage * 25 })
      .then((data) => {
        if (alive) setIncidents(data);
      })
      .catch((error) => {
        if (alive) {
          setIncidentError(true);
          if (denied(error)) setAccess('denied');
        }
      })
      .finally(() => {
        if (alive) setIncidentLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [access, range, incidentPage]);
  useEffect(() => {
    if (access !== 'allowed') return;
    const id = new URLSearchParams(window.location.search).get('incident');
    if (!id) return;
    let alive = true;
    setLinkState('loading');
    const end = Date.now();
    const to = new Date(end).toISOString();
    const from = new Date(end - 7 * 86400000).toISOString();
    monitorApi
      .incidents({ id, from, to, limit: 1, offset: 0 })
      .then((data) => {
        if (!alive) return;
        const match = data.items.find((item) => item.incidentId === id);
        setSelectedIncident(match ?? null);
        setLinkState(match ? null : 'missing');
        if (match) {
          setCheckId(match.checkId);
          setPage(0);
        }
      })
      .catch((error) => {
        if (alive) {
          setLinkState('error');
          if (denied(error)) setAccess('denied');
        }
      });
    return () => {
      alive = false;
    };
  }, [access]);
  useEffect(() => {
    ++logRequest.current;
    setLogs(null);
    setLogState(null);
  }, [logService, range, selectedIncident, run]);

  const selectRun = async (runId: string) => {
    const request = ++runRequest.current;
    setSelectedIncident(null);
    setRun(null);
    setRunState('loading');
    try {
      const result = await monitorApi.run(runId);
      if (!alive.current || request !== runRequest.current) return;
      setRun(result);
      setRunState(null);
    } catch (error) {
      if (!alive.current || request !== runRequest.current) return;
      setRunState(
        error instanceof MonitorApiError && error.status === 404
          ? 'missing'
          : 'error'
      );
      if (denied(error)) setAccess('denied');
    }
  };
  const loadLogs = async () => {
    const request = ++logRequest.current;
    setLogState('loading');
    setLogs(null);
    const pivot =
      run?.endedAt ??
      selectedIncident?.confirmedAt ??
      selectedIncident?.openedAt;
    const window = retainedWindow(
      pivot
        ? {
            from: new Date(Date.parse(pivot) - 5 * 60000).toISOString(),
            to: new Date(Date.parse(pivot) + 5 * 60000).toISOString(),
          }
        : range
    );
    if (!window) {
      setLogState('expired');
      return;
    }
    try {
      const result = await monitorApi.logs({
        service: logService,
        ...window,
        limit: 200,
      });
      if (!alive.current || request !== logRequest.current) return;
      setLogs(result);
      setLogState(null);
    } catch (error) {
      if (!alive.current || request !== logRequest.current) return;
      setLogState('error');
      if (denied(error)) setAccess('denied');
    }
  };
  const changePeriod = (hours: number) => {
    setPeriod(hours);
    setPage(0);
    setIncidentPage(0);
    setRange(periodWindow(hours));
  };
  const sourceStale =
    overview &&
    (now - Date.parse(overview.generatedAt) > 5 * 60000 ||
      !overview.workerHeartbeatAt ||
      now - Date.parse(overview.workerHeartbeatAt) > 5 * 60000);
  const grafanaUrl = safeGrafana(logs?.grafanaUrl);
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminPageHeader
        title="System Monitor"
        subtitle="Backend and n8n checks · All times Europe/Kyiv"
        actions={
          <Button
            variant="outlined"
            onClick={() => {
              void loadOverview();
              changePeriod(period);
            }}
            disabled={access !== 'allowed'}
          >
            Refresh
          </Button>
        }
      />
      <Stack
        spacing={3}
        sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 3 }}
      >
        {access === 'loading' && (
          <CircularProgress aria-label="Checking monitor access" />
        )}
        {access === 'denied' && (
          <Alert severity="warning">
            You do not have access to system monitor data.
          </Alert>
        )}
        {access === 'error' && (
          <Alert severity="error">
            Unable to check monitor access. Reload this page to retry.
          </Alert>
        )}
        {access === 'allowed' && (
          <>
            {offline && (
              <Alert severity="error">
                Monitor source is offline.{' '}
                {overview
                  ? 'Showing the last received snapshot; current health cannot be confirmed.'
                  : 'No monitor snapshot is available.'}
              </Alert>
            )}
            {!overview && !offline && (
              <CircularProgress aria-label="Loading current status" />
            )}
            {overview && (
              <>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ sm: 'center' }}
                >
                  <Typography variant="h6">
                    Current status · {overview.environment}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Source updated {time(overview.generatedAt)} · Worker{' '}
                    {time(overview.workerHeartbeatAt)}
                  </Typography>
                </Stack>
                {sourceStale && (
                  <Alert severity="warning">
                    Monitor worker heartbeat or source snapshot is stale.
                    Current target health is unknown.
                  </Alert>
                )}
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)',
                    },
                  }}
                >
                  {overview.checks.map((check) => {
                    const stale =
                      !check.lastRun?.endedAt ||
                      now - Date.parse(check.lastRun.endedAt) >
                        check.intervalMs * 2 + check.deadlineMs;
                    const outcome = !check.enabled
                      ? 'unavailable'
                      : offline ||
                          sourceStale ||
                          (stale &&
                            !['unavailable', 'interrupted'].includes(
                              check.status
                            ))
                        ? 'unknown'
                        : check.status;
                    return (
                      <Card key={check.checkId} variant="outlined">
                        <CardContent>
                          <Stack spacing={1}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              sx={{ overflowWrap: 'anywhere' }}
                            >
                              {check.checkId}
                            </Typography>
                            <Stack direction="row" gap={1} flexWrap="wrap">
                              <Status outcome={outcome} />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={
                                  !check.enabled
                                    ? 'Disabled'
                                    : stale
                                      ? 'Stale'
                                      : 'Fresh'
                                }
                              />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={check.required ? 'Required' : 'Optional'}
                              />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              Last check: {time(check.lastRun?.endedAt ?? null)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Every {check.intervalMs / 60000} min · Deadline{' '}
                              {check.deadlineMs / 1000}s
                            </Typography>
                            {check.lastRun && (
                              <Button
                                size="small"
                                onClick={() => {
                                  setCheckId(check.checkId);
                                  setPage(0);
                                  void selectRun(check.lastRun!.runId);
                                }}
                              >
                                Check details
                              </Button>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
                {!overview.checks.length && (
                  <Alert severity="info">No checks are configured.</Alert>
                )}
                <Typography variant="body2" color="text.secondary">
                  Slack: {overview.delivery.slackPending} pending /{' '}
                  {overview.delivery.slackFailed} failed · Loki:{' '}
                  {overview.delivery.lokiPending} pending /{' '}
                  {overview.delivery.lokiDropped} dropped
                </Typography>
              </>
            )}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ md: 'center' }}
              >
                <TextField
                  select
                  label="Check"
                  size="small"
                  value={checkId}
                  onChange={(event) => {
                    setCheckId(event.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: { sm: 240 } }}
                >
                  {overview?.checks.length ? (
                    overview.checks.map((check) => (
                      <MenuItem key={check.checkId} value={check.checkId}>
                        {check.checkId}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      No checks available
                    </MenuItem>
                  )}
                </TextField>
                <ToggleButtonGroup
                  exclusive
                  value={period}
                  onChange={(_, value: number | null) => {
                    if (value) changePeriod(value);
                  }}
                  aria-label="History period"
                  size="small"
                >
                  <ToggleButton value={1}>1 hour</ToggleButton>
                  <ToggleButton value={24}>24 hours</ToggleButton>
                  <ToggleButton value={168}>7 days</ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" color="text.secondary">
                  Overview refreshes every 60s. History refreshes on demand.
                </Typography>
              </Stack>
            </Paper>
            {historyLoading && (
              <CircularProgress aria-label="Loading history" />
            )}
            {historyExpired && (
              <Alert severity="info">
                Selected history window is outside retention. Use Refresh to
                load the latest selected period.
              </Alert>
            )}
            {historyError && (
              <Alert severity="error">
                Monitor history is unavailable. Use Refresh to retry.
              </Alert>
            )}
            {history && (
              <>
                <MonitorCharts buckets={history.buckets} />
                <Paper variant="outlined">
                  <Typography variant="h6" sx={{ p: 2 }}>
                    Raw check history
                  </Typography>
                  <TableContainer>
                    <Table size="small" aria-label="Raw check history">
                      <TableHead>
                        <TableRow>
                          <TableCell>Scheduled</TableCell>
                          <TableCell>Outcome</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>HTTP</TableCell>
                          <TableCell>Failed step</TableCell>
                          <TableCell>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.items.map((item) => (
                          <TableRow key={item.runId}>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {time(item.scheduledAt)}
                            </TableCell>
                            <TableCell>
                              <Status outcome={item.outcome} />
                            </TableCell>
                            <TableCell>
                              {item.durationMs === null
                                ? '—'
                                : `${item.durationMs} ms`}
                            </TableCell>
                            <TableCell>{item.httpStatus ?? '—'}</TableCell>
                            <TableCell>{item.failedStep ?? '—'}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => void selectRun(item.runId)}
                              >
                                Inspect
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {!history.items.length && (
                    <Typography sx={{ p: 2 }} color="text.secondary">
                      No raw results in this period.
                    </Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={history.total}
                    page={page}
                    onPageChange={(_, value) => setPage(value)}
                    rowsPerPage={25}
                    rowsPerPageOptions={[25]}
                  />
                </Paper>
              </>
            )}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6">Incidents</Typography>
              {incidentLoading && (
                <CircularProgress aria-label="Loading incidents" />
              )}
              {incidentsExpired && (
                <Alert severity="info">
                  Selected incident window is outside retention. Use Refresh to
                  load the latest selected period.
                </Alert>
              )}
              {incidentError && (
                <Alert severity="error">
                  Incidents are unavailable. Use Refresh to retry.
                </Alert>
              )}
              {incidents && (
                <>
                  {!incidents.items.length && (
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      No incidents in this period.
                    </Typography>
                  )}
                  <Stack divider={<Divider />} spacing={1}>
                    {incidents.items.map((item) => (
                      <Stack
                        key={item.incidentId}
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        sx={{ py: 1 }}
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography
                            fontWeight={600}
                            sx={{ overflowWrap: 'anywhere' }}
                          >
                            {item.checkId} ·{' '}
                            {item.kind === 'coverage'
                              ? 'Probe coverage lost'
                              : 'Target failure'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {time(item.openedAt)} ·{' '}
                            {item.resolvedAt ? 'Resolved' : 'Open'}
                          </Typography>
                        </Box>
                        <Button
                          onClick={() => {
                            ++runRequest.current;
                            setSelectedIncident(item);
                            setRun(null);
                            setRunState(null);
                            setLinkState(null);
                          }}
                        >
                          Incident details
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                  <TablePagination
                    component="div"
                    count={incidents.total}
                    page={incidentPage}
                    onPageChange={(_, value) => setIncidentPage(value)}
                    rowsPerPage={25}
                    rowsPerPageOptions={[25]}
                  />
                </>
              )}
            </Paper>
            {linkState === 'loading' && (
              <CircularProgress aria-label="Opening linked incident" />
            )}
            {linkState === 'missing' && (
              <Alert severity="info">
                Incident not found. It may have expired from retention; no other
                incident has been substituted.
              </Alert>
            )}
            {linkState === 'error' && (
              <Alert severity="error">
                Linked incident could not be loaded. Reload the page to retry.
              </Alert>
            )}
            {selectedIncident && (
              <Paper variant="outlined" sx={{ p: 2, overflowWrap: 'anywhere' }}>
                <Stack spacing={1}>
                  <Typography variant="h6">Incident details</Typography>
                  <Typography>
                    {selectedIncident.checkId} ·{' '}
                    {selectedIncident.kind === 'coverage'
                      ? 'Probe coverage lost'
                      : 'Target failure'}
                  </Typography>
                  <Typography variant="body2">
                    Incident ID: {selectedIncident.incidentId}
                  </Typography>
                  <Typography variant="body2">
                    First failure {time(selectedIncident.openedAt)} · Confirmed{' '}
                    {time(selectedIncident.confirmedAt)} ·{' '}
                    {selectedIncident.resolvedAt
                      ? `Resolved ${time(selectedIncident.resolvedAt)}`
                      : 'Still open'}
                  </Typography>
                  <Typography>{selectedIncident.reason}</Typography>
                  {selectedIncident.blockedChecks.length > 0 && (
                    <Typography>
                      Blocked checks:{' '}
                      {selectedIncident.blockedChecks.join(', ')}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Logs below use a 10-minute context window around this
                    incident.
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setSelectedIncident(null)}
                  >
                    Close incident details
                  </Button>
                </Stack>
              </Paper>
            )}
            {runState === 'loading' && (
              <CircularProgress aria-label="Loading check details" />
            )}
            {runState === 'missing' && (
              <Alert severity="info">
                Check result no longer exists in retention.
              </Alert>
            )}
            {runState === 'error' && (
              <Alert severity="error">Check details are unavailable.</Alert>
            )}
            {run && (
              <Paper variant="outlined" sx={{ p: 2, overflowWrap: 'anywhere' }}>
                <Stack spacing={1}>
                  <Typography variant="h6">
                    Check details · {run.checkId}
                  </Typography>
                  <Status outcome={run.outcome} />
                  <Typography variant="body2">Run ID: {run.runId}</Typography>
                  <Typography variant="body2">
                    Scheduled {time(run.scheduledAt)} · Started{' '}
                    {time(run.startedAt)} · Ended {time(run.endedAt)}
                  </Typography>
                  <Typography variant="body2">
                    Duration{' '}
                    {run.durationMs === null ? '—' : `${run.durationMs} ms`} ·
                    HTTP {run.httpStatus ?? '—'} · Failed step{' '}
                    {run.failedStep ?? '—'} · Error {run.errorCode ?? '—'}
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {run.diagnostic || 'No diagnostic message.'}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      ++runRequest.current;
                      setRun(null);
                    }}
                  >
                    Close check details
                  </Button>
                </Stack>
              </Paper>
            )}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Loki logs</Typography>
                <Typography variant="body2" color="text.secondary">
                  Service and time context only; this is not full request
                  correlation. Up to 200 records, within seven days.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    size="small"
                    label="Log service"
                    value={logService}
                    onChange={(event) =>
                      setLogService(event.target.value as LogService)
                    }
                    sx={{ minWidth: 180 }}
                  >
                    {(['system-monitor', 'backend', 'n8n'] as const).map(
                      (service) => (
                        <MenuItem key={service} value={service}>
                          {service}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                  <Button
                    variant="outlined"
                    disabled={logState === 'loading'}
                    onClick={() => void loadLogs()}
                  >
                    Load logs
                  </Button>
                  {grafanaUrl && (
                    <Button
                      href={grafanaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Grafana
                    </Button>
                  )}
                </Stack>
                {logState === 'loading' && (
                  <CircularProgress aria-label="Loading Loki logs" />
                )}
                {logState === 'expired' && (
                  <Alert severity="info">
                    Selected log window is outside retention. Use Refresh or
                    select a result from the last seven days.
                  </Alert>
                )}
                {logState === 'error' && (
                  <Alert severity="warning">
                    Loki logs are unavailable. Monitor results above are
                    independent; retry with Load logs.
                  </Alert>
                )}
                {logs && (
                  <>
                    {logs.truncated && (
                      <Alert severity="info">
                        Log results are truncated. Select a check result or
                        incident to narrow the time window.
                      </Alert>
                    )}
                    {!logs.items.length && (
                      <Typography color="text.secondary">
                        No logs found in this window.
                      </Typography>
                    )}
                    <Stack spacing={1}>
                      {logs.items.map((log, index) => (
                        <Box
                          key={`${log.at}-${index}`}
                          sx={{
                            bgcolor: 'action.hover',
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {time(log.at)} · {log.service} · {log.level}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {log.message}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}
              </Stack>
            </Paper>
          </>
        )}
      </Stack>
    </Box>
  );
}
