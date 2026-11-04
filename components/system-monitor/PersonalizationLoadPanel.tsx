'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  monitorApi,
  type MonitorCheck,
  type MonitorRun,
} from '@/lib/api/system-monitor';
import { projectDetailedCheckHealth } from '@/lib/system-monitor-health';

const number = (value: number | null | undefined, suffix = '') =>
  value == null
    ? '—'
    : `${value.toLocaleString('en-GB', { maximumFractionDigits: 1 })}${suffix}`;
export function PersonalizationLoadPanel({
  check,
  now,
  sourceUnavailable,
  onSelect,
}: {
  check: MonitorCheck;
  now: number;
  sourceUnavailable: boolean;
  onSelect: () => void;
}) {
  const [runs, setRuns] = useState<MonitorRun[]>([]);
  const [historyUnavailable, setHistoryUnavailable] = useState(false);
  const runId = check.lastRun?.runId;
  useEffect(() => {
    let active = true;
    const end = Date.now();
    monitorApi
      .history({
        checkId: 'backend.personalization.load',
        from: new Date(end - 86400000).toISOString(),
        to: new Date(end).toISOString(),
        limit: 100,
        offset: 0,
      })
      .then((history) => {
        if (active) {
          setRuns(history.items);
          setHistoryUnavailable(false);
        }
      })
      .catch(() => {
        if (active) setHistoryUnavailable(true);
      });
    return () => {
      active = false;
    };
  }, [runId]);
  const m = check.lastRun?.personalizationLoad;
  const measurementFailure = check.lastRun?.errorCode?.startsWith(
    'personalization_measurement_'
  );
  const partial = m?.measurement === 'partial';
  const health = projectDetailedCheckHealth(check, now, sourceUnavailable);
  const current = check.enabled && !sourceUnavailable && !health.stale;
  const status = !check.enabled
    ? 'Disabled'
    : !current
      ? 'No fresh data'
      : ['unavailable', 'unknown', 'interrupted'].includes(health.outcome)
        ? 'Unavailable'
        : health.outcome === 'fail'
          ? 'Needs attention'
          : health.outcome === 'pass' && m?.measurement === 'complete'
            ? 'Healthy'
            : 'Collecting data';
  const points = runs
    .filter(
      (r) =>
        r.personalizationLoad?.sqlMsPerMinute != null &&
        r.personalizationLoad.measurement === 'complete' &&
        r.endedAt
    )
    .sort((a, b) => Date.parse(a.endedAt!) - Date.parse(b.endedAt!));
  const end = now,
    start = end - 86400000;
  const peak = Math.max(
    0,
    ...points.map((r) => r.personalizationLoad!.sqlMsPerMinute!)
  );
  const max = Math.max(
    1000,
    ...points.map((r) => r.personalizationLoad!.sqlMsPerMinute!)
  );
  const segments: string[] = [];
  let previous = 0;
  for (const r of points) {
    const at = Date.parse(r.endedAt!);
    if (at < start || at > end) continue;
    const x = 12 + ((at - start) / 86400000) * 576;
    const y = 74 - (r.personalizationLoad!.sqlMsPerMinute! / max) * 62;
    segments.push(
      `${at - previous > check.intervalMs * 1.5 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    );
    previous = at;
  }
  return (
    <Paper
      component="section"
      aria-label="Personalization database load"
      variant="outlined"
      sx={{ p: { xs: 2, md: 3 } }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h6">Personalization database load</Typography>
            <Typography variant="body2" color="text.secondary">
              Real database counters · Checked every 15 minutes
            </Typography>
          </Box>
          <Chip
            size="small"
            label={status}
            color={
              current && health.outcome === 'fail'
                ? 'error'
                : current &&
                    health.outcome === 'pass' &&
                    m?.measurement === 'complete'
                  ? 'success'
                  : 'default'
            }
          />
        </Stack>
        {!current && (
          <Alert severity="warning">
            {!check.enabled
              ? 'This check is disabled.'
              : 'No fresh measurement. Values below are last known, not a current health confirmation.'}
          </Alert>
        )}
        {current &&
          ['unavailable', 'unknown', 'interrupted'].includes(
            health.outcome
          ) && (
            <Alert severity="warning">
              Database measurements are unavailable. This is not a healthy-load
              confirmation.
            </Alert>
          )}
        {current && health.outcome === 'fail' && (
          <Alert severity="error">
            {check.lastRun?.errorCode === 'personalization_stale'
              ? 'Portrait processing is overdue.'
              : measurementFailure
                ? check.lastRun?.errorCode ===
                  'personalization_measurement_unavailable'
                  ? 'Database measurement is unavailable.'
                  : 'Database measurement is incomplete.'
                : 'Database load is above the alert threshold.'}{' '}
            Slack confirms a problem after three consecutive failed checks.
          </Alert>
        )}
        {partial && (
          <Alert severity="warning">
            Known work only · lower bound. Missing query statistics are not
            treated as zero load.
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary">
          {m?.measurement === 'complete'
            ? 'Complete measurement'
            : partial
              ? 'Partial measurement'
              : m?.measurement === 'warmup'
                ? 'First snapshot; waiting for a measurement interval'
                : 'Measurement completeness unavailable'}
          {m?.intervalMinutes != null &&
            ` · ${number(m.intervalMinutes)} minute measurement`}
          {' · Last complete measurement: '}
          {m?.lastCompleteAt
            ? new Date(m.lastCompleteAt).toLocaleString('en-GB')
            : 'None yet'}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {[
            [
              'SQL execution time',
              m?.sqlMsPerMinute == null
                ? '—'
                : `${(m.sqlMsPerMinute / 1000).toLocaleString('en-GB', { maximumFractionDigits: 2 })} s/min`,
            ],
            ['Queries', number(m?.callsPerMinute, ' /min')],
            ['Pages accessed', number(m?.sharedBlocksPerMinute, ' /min')],
            ['Rows written', number(m?.writesPerMinute, ' /min')],
          ].map(([label, value]) => (
            <Box key={label} sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="body2">
          {m?.measurement === 'unavailable' &&
            'Last known portrait freshness: '}
          {m
            ? `${m.overduePortraits} overdue / ${m.totalPortraits} portraits`
            : 'Portrait freshness not measured yet'}{' '}
          ·{' '}
          {m?.loadRatio != null
            ? `${partial ? '≥ ' : ''}${m.loadRatio.toFixed(1)}× normal load`
            : m?.baselineSqlMsPerMinute != null
              ? 'Baseline ready'
              : `Learning normal load: ${(m?.baselineHours ?? 0).toFixed(1)} / 24 measured hours`}
        </Typography>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Complete SQL measurements · Last 24 hours ·{' '}
            {points.length
              ? `Peak ${(peak / 1000).toFixed(2)} s/min`
              : 'No measurements yet'}
          </Typography>
          {historyUnavailable ? (
            <Alert severity="warning">Load history is unavailable.</Alert>
          ) : points.length < 2 ? (
            <Typography variant="body2" color="text.secondary">
              Waiting for two comparable measurements to show the trend.
            </Typography>
          ) : (
            <Box
              component="svg"
              role="img"
              aria-label="Personalization SQL execution time over the last 24 hours"
              viewBox="0 0 600 86"
              sx={{
                width: '100%',
                height: 110,
                display: 'block',
                color: 'primary.main',
              }}
            >
              <path d="M12,74H588" stroke="currentColor" opacity="0.2" />
              <path
                d={segments.join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </Box>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          Includes analytics reports and other queries touching core
          personalization tables. Shared user, device and content reads are not
          separately attributed. SQL time is cumulative execution time, not CPU
          usage. Pages include cache hits. A portrait is overdue after its
          scheduled refresh is 45 minutes late. The trend and baseline use
          complete intervals only; partial rates are lower bounds.
        </Typography>
        <Button
          size="small"
          onClick={onSelect}
          sx={{ alignSelf: 'flex-start' }}
        >
          View history
        </Button>
      </Stack>
    </Paper>
  );
}
