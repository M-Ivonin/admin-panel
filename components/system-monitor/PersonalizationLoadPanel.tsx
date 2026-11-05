'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { Database, UsersRound, ArrowUpRight } from 'lucide-react';
import {
  monitorApi,
  type MonitorCheck,
  type MonitorRun,
} from '@/lib/api/system-monitor';
import {
  projectPersonalizationHealth,
  type MonitorAspect,
} from '@/lib/system-monitor-personalization-health';
import { LoadActivityChart } from './LoadActivityChart';

const number = (value: number | null | undefined, suffix = '') =>
  value == null
    ? '—'
    : `${value.toLocaleString('en-GB', { maximumFractionDigits: 2 })}${suffix}`;
const time = (at: string | null | undefined) =>
  at && Number.isFinite(Date.parse(at))
    ? new Date(at).toLocaleString('en-GB', {
        timeZone: 'Europe/Kyiv',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not yet observed';

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
  const [historyLoading, setHistoryLoading] = useState(true);
  const runId = check.lastRun?.runId;
  useEffect(() => {
    let active = true;
    const end = Date.now();
    setHistoryLoading(true);
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
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [runId]);
  const saved = check.lastRun?.personalizationLoad;
  const m = saved?.scope === 'database' ? saved : undefined;
  const work = m?.personalization;
  const health = projectPersonalizationHealth(check, now, sourceUnavailable);
  const current = check.enabled && !sourceUnavailable && !health.stale;
  const lastKnown = !current;
  const metric = (
    label: string,
    value: string,
    hint: string,
    positive = false
  ) => {
    const unitMatch = value.match(/^(.*) (s\/min|\/min|s)$/);
    return (
      <Box key={label} sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: 11 }}
        >
          {label}
        </Typography>
        <Typography
          aria-label={value}
          sx={{
            fontSize: { xs: 24, sm: 28 },
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: '-.6px',
            color: positive ? '#8DE0B5' : 'text.primary',
            overflowWrap: 'anywhere',
          }}
        >
          {unitMatch ? (
            <>
              {unitMatch[1]}
              <Box
                component="span"
                sx={{ fontSize: 11, letterSpacing: 0, whiteSpace: 'nowrap' }}
              >
                {' '}
                {unitMatch[2]}
              </Box>
            </>
          ) : (
            value
          )}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', fontSize: 10 }}
        >
          {hint}
        </Typography>
      </Box>
    );
  };
  const detail = (label: string, value: string) => (
    <Stack key={label} direction="row" gap={1} justifyContent="space-between">
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" sx={{ textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
  const card = (aspect: MonitorAspect) => {
    const personal = aspect === 'personalization';
    const status = health[aspect];
    const retained =
      lastKnown ||
      (personal
        ? !work || ['unavailable', 'partial'].includes(work.measurement)
        : m?.measurement === 'unavailable');
    const Icon = personal ? UsersRound : Database;
    return (
      <Paper
        component="section"
        aria-label={personal ? 'Personalization health' : 'Database load'}
        variant="outlined"
        sx={{
          minWidth: 0,
          p: 2.5,
          borderRadius: 1.5,
          bgcolor: '#171C27',
          borderColor: '#2B3241',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.75,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
        >
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <Icon
              size={18}
              color={personal ? '#B5A8FF' : '#76B8FA'}
              aria-hidden
            />
            <Typography variant="h6" sx={{ fontSize: 17 }}>
              {personal ? 'Personalization' : 'Database'}
            </Typography>
          </Stack>
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
            sx={{
              height: 24,
              maxWidth: '55%',
              fontSize: 11,
              bgcolor:
                status.outcome === 'pass'
                  ? '#20382F'
                  : status.outcome === 'warn'
                    ? '#3D3222'
                    : status.outcome === 'fail'
                      ? '#422B30'
                      : '#29303E',
              color:
                status.outcome === 'pass'
                  ? '#8DE0B5'
                  : status.outcome === 'warn'
                    ? '#F4CE86'
                    : status.outcome === 'fail'
                      ? '#FFADB6'
                      : '#A1ACC0',
            }}
          />
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 1.5,
          }}
        >
          {personal ? (
            <>
              {metric(
                'Overdue profiles',
                number(m?.overduePortraits),
                m
                  ? `${number(m.overduePortraits)} overdue / ${number(m.totalPortraits)} profiles`
                  : 'Not measured yet',
                current && status.outcome === 'pass'
              )}
              {metric(
                'Total profiles',
                number(m?.totalPortraits),
                'In personalization'
              )}
              {metric(
                'Last run',
                work?.lastRunMs == null
                  ? '—'
                  : number(work.lastRunMs / 1000, ' s'),
                'Run duration'
              )}
            </>
          ) : (
            <>
              {metric(
                'SQL execution time',
                m?.sqlMsPerMinute == null
                  ? '—'
                  : `${m.measurement === 'partial' ? '≥ ' : ''}${number(m.sqlMsPerMinute / 1000, ' s/min')}`,
                'Query execution'
              )}
              {metric(
                'Queries',
                number(m?.callsPerMinute, ' /min'),
                'SQL calls, including repeats'
              )}
              {metric(
                'Rows written',
                number(m?.writesPerMinute, ' /min'),
                'Inserts, updates, deletes'
              )}
            </>
          )}
        </Box>
        {(retained || (status.reason && status.outcome !== 'pass')) && (
          <Typography
            role="status"
            variant="caption"
            sx={{
              color: retained
                ? 'text.secondary'
                : status.outcome === 'fail'
                  ? 'error.light'
                  : 'warning.light',
              fontSize: 11,
            }}
          >
            {status.reason && `${status.reason} `}
            {retained && 'Last known values · awaiting a fresh check'}
          </Typography>
        )}
        <Box sx={{ borderTop: '1px solid', borderColor: '#2B3241', pt: 1.5 }}>
          <LoadActivityChart
            runs={runs}
            now={now}
            intervalMs={check.intervalMs}
            personal={personal}
            unavailable={historyUnavailable}
            loading={historyLoading}
            baseline={m?.baselineSqlMsPerMinute}
          />
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          sx={{
            mt: 'auto',
            borderTop: '1px solid',
            borderColor: '#2B3241',
            pt: 1.25,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: 11 }}
          >
            {personal
              ? `Last completed · ${time(work?.lastRunAt)}`
              : `Updated ${time(check.lastRun?.endedAt)} · Every ${number(check.intervalMs / 60000)} min`}
          </Typography>
          <Button
            size="small"
            onClick={() => onSelect(aspect)}
            aria-label="View shared history"
            endIcon={<ArrowUpRight size={13} />}
            sx={{
              color: '#BEB1FF',
              minWidth: 0,
              flexShrink: 0,
              p: 0,
              fontSize: 11,
            }}
          >
            View history
          </Button>
        </Stack>
        <Box
          component="details"
          sx={{
            '& > summary': {
              cursor: 'pointer',
              fontSize: 11,
              color: '#A1ACC0',
              width: 'fit-content',
            },
          }}
        >
          <Box component="summary">Details</Box>
          <Stack spacing={0.5} sx={{ pt: 1 }}>
            {personal ? (
              <>
                {detail('Profiles checked', number(work?.checked))}
                {detail('Reused profiles', number(work?.reused))}
                {detail('Refresh errors', number(work?.failed))}
                {detail(
                  'Source poll fallbacks',
                  number(work?.sourcePollFailures)
                )}
                {detail('Completed runs', number(work?.runs))}
                {detail('Average run', number(work?.averageRunMs, ' ms'))}
                {detail(
                  'Average source poll',
                  number(work?.averageSourcePollMs, ' ms')
                )}
              </>
            ) : (
              <>
                {detail(
                  'Pages accessed',
                  number(m?.sharedBlocksPerMinute, ' /min')
                )}
                {detail(
                  'Measurement interval',
                  m?.intervalMinutes == null
                    ? 'Not yet available'
                    : `${number(m.intervalMinutes)} minutes`
                )}
                {detail('Last complete measurement', time(m?.lastCompleteAt))}
                {detail(
                  'Usual activity',
                  m?.loadRatio != null
                    ? `${m.measurement === 'partial' ? '≥ ' : ''}${m.loadRatio.toFixed(1)}× normal database load`
                    : m?.baselineSqlMsPerMinute != null
                      ? 'Database baseline ready'
                      : `${number(m?.baselineHours ?? 0)} / 24 measured hours`
                )}
                {m?.measurement === 'partial' && (
                  <Typography variant="caption" color="text.secondary">
                    Partial measurement · values are lower bounds.
                  </Typography>
                )}
              </>
            )}
          </Stack>
        </Box>
      </Paper>
    );
  };
  return (
    <Box
      aria-label="Database and personalization"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: 'repeat(2, minmax(0, 1fr))',
        },
        gap: 2,
      }}
    >
      {card('personalization')}
      {card('database')}
    </Box>
  );
}
