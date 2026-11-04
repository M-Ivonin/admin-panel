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
import {
  projectPersonalizationHealth,
  monitorAspectNames,
  type MonitorAspect,
} from '@/lib/system-monitor-personalization-health';

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
  onSelect: (aspect?: MonitorAspect) => void;
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
  const saved = check.lastRun?.personalizationLoad;
  const m = saved?.scope === 'database' ? saved : undefined;
  const personal = m?.personalization;
  const partial = m?.measurement === 'partial';
  const health = projectPersonalizationHealth(check, now, sourceUnavailable);
  const current = check.enabled && !sourceUnavailable && !health.stale;
  const header = (aspect: MonitorAspect) => {
    const status = health[aspect];
    return (
      <>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h6">{monitorAspectNames[aspect]}</Typography>
            <Typography variant="body2" color="text.secondary">
              {aspect === 'database'
                ? 'All SQL recorded for this database'
                : 'Background work and profile freshness'}{' '}
              · Checked every {check.intervalMs / 60000} minutes
            </Typography>
          </Box>
          <Chip
            size="small"
            label={status.label}
            color={
              status.outcome === 'fail'
                ? 'error'
                : status.outcome === 'warn'
                  ? 'warning'
                  : status.outcome === 'pass'
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
        {current && status.reason && (
          <Alert severity={status.outcome === 'fail' ? 'error' : 'warning'}>
            {status.reason}
          </Alert>
        )}
      </>
    );
  };
  const points = runs
    .filter(
      (r) =>
        r.personalizationLoad?.scope === 'database' &&
        r.personalizationLoad.sqlMsPerMinute != null &&
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
    <Stack spacing={3}>
      <Paper
        component="section"
        aria-label="Database load"
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 } }}
      >
        <Stack spacing={2}>
          {header('database')}
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
            {m?.loadRatio != null
              ? `${partial ? '≥ ' : ''}${m.loadRatio.toFixed(1)}× normal database load`
              : m?.baselineSqlMsPerMinute != null
                ? 'Database baseline ready'
                : `Learning normal database load: ${(m?.baselineHours ?? 0).toFixed(1)} / 24 measured hours`}
          </Typography>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Complete database SQL measurements · Last 24 hours ·{' '}
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
                aria-label="Database SQL execution time over the last 24 hours"
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
            SQL counters cover all recorded statements in the current database,
            including monitoring. SQL time is cumulative execution time, not CPU
            usage. Pages include cache hits. The database trend and baseline use
            complete intervals only; partial rates are lower bounds.
          </Typography>
          <Button
            size="small"
            onClick={() => onSelect('database')}
            sx={{ alignSelf: 'flex-start' }}
          >
            View shared history
          </Button>
        </Stack>
      </Paper>
      <Paper
        component="section"
        aria-label="Personalization health"
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 } }}
      >
        <Stack spacing={2}>
          {header('personalization')}
          <Typography variant="body2" sx={{ mb: 2 }}>
            {(!current ||
              !personal ||
              personal.measurement === 'unavailable') &&
              'Last known portrait freshness: '}
            {m
              ? `${m.overduePortraits} overdue / ${m.totalPortraits} portraits`
              : 'Portrait freshness not measured yet'}
            {' · Last completed run: '}
            {personal?.lastRunAt
              ? new Date(personal.lastRunAt).toLocaleString('en-GB')
              : 'Not observed yet'}
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
              ['Profiles checked', number(personal?.checked)],
              ['Reused profiles', number(personal?.reused)],
              ['Refresh errors', number(personal?.failed)],
              ['Source poll fallbacks', number(personal?.sourcePollFailures)],
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
          <Typography variant="body2" sx={{ mt: 2 }}>
            {personal?.intervalMinutes != null
              ? `Work in ${number(personal.intervalMinutes)} minutes`
              : 'Waiting for comparable process observations'}
            {' · Completed runs '}
            {number(personal?.runs)}
            {' · Last run '}
            {number(personal?.lastRunMs, ' ms')}
            {' · Average run '}
            {number(personal?.averageRunMs, ' ms')}
            {' · Average source poll '}
            {number(personal?.averageSourcePollMs, ' ms')}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Personalization run durations are wall time, not SQL time. Work
            counters restart with the backend process. A portrait is overdue
            after its scheduled refresh is 45 minutes late.
          </Typography>
          <Button
            size="small"
            onClick={() => onSelect('personalization')}
            sx={{ alignSelf: 'flex-start' }}
          >
            View shared history
          </Button>
        </Stack>
      </Paper>
      <Typography variant="caption" color="text.secondary">
        Independent statuses and history from one shared probe. Slack incidents
        use the combined probe result.
      </Typography>
    </Stack>
  );
}
