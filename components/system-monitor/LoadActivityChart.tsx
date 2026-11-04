import { Box, Stack, Typography } from '@mui/material';
import type { MonitorRun } from '@/lib/api/system-monitor';

const day = 86_400_000;
const time = (at: number) =>
  new Date(at).toLocaleTimeString('en-GB', {
    timeZone: 'Europe/Kyiv',
    hour: '2-digit',
    minute: '2-digit',
  });

export function LoadActivityChart({
  runs,
  now,
  intervalMs,
  personal,
  unavailable,
  loading,
  baseline,
}: {
  runs: MonitorRun[];
  now: number;
  intervalMs: number;
  personal: boolean;
  unavailable: boolean;
  loading: boolean;
  baseline?: number | null;
}) {
  const start = now - day;
  const points = runs
    .flatMap((run) => {
      const at = Date.parse(run.endedAt ?? '');
      const m = run.personalizationLoad;
      if (
        !Number.isFinite(at) ||
        at < start ||
        at > now ||
        m?.scope !== 'database'
      )
        return [];
      if (personal) {
        const work = m.personalization;
        if (
          work?.measurement !== 'complete' ||
          work.checked == null ||
          work.reused == null ||
          !work.intervalMinutes ||
          work.intervalMinutes <= 0
        )
          return [];
        return [
          {
            at,
            value: work.checked / work.intervalMinutes,
            reused: work.reused / work.intervalMinutes,
            interval: work.intervalMinutes * 60_000,
          },
        ];
      }
      return m.measurement === 'complete' && m.sqlMsPerMinute != null
        ? [
            {
              at,
              value: m.sqlMsPerMinute / 1000,
              reused: 0,
              interval: intervalMs,
            },
          ]
        : [];
    })
    .sort((a, b) => a.at - b.at);
  const max = Math.max(
    1,
    ...points.map((p) => p.value),
    personal ? 0 : (baseline ?? 0) / 1000
  );
  const x = (at: number) => ((at - start) / day) * 100;
  const y = (value: number) => 78 - (value / max) * 72;
  const colors = personal ? ['#A89AFF', '#5F769B'] : ['#76B8FA', '#718098'];
  const labels = personal
    ? ['Refreshed', 'Reused']
    : ['Query time', ...(baseline != null ? ['Baseline'] : [])];
  return (
    <Stack spacing={0.75} sx={{ minWidth: 0 }}>
      <Stack direction="row" justifyContent="space-between" gap={1}>
        <Typography variant="body2" fontWeight={500} sx={{ fontSize: 12 }}>
          {personal ? 'Profile activity · profiles/min' : 'Query time · s/min'}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: 11, flexShrink: 0 }}
        >
          Last 24 hours
        </Typography>
      </Stack>
      <Stack direction="row" gap={2}>
        {labels.map((label, i) => (
          <Stack key={label} direction="row" alignItems="center" gap={0.75}>
            <Box
              aria-hidden
              sx={{
                width: 7,
                height: 7,
                borderRadius: 0.5,
                bgcolor: colors[i],
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 10 }}
            >
              {label}
            </Typography>
          </Stack>
        ))}
      </Stack>
      {unavailable || points.length < 2 ? (
        <Stack
          justifyContent="center"
          alignItems="center"
          sx={{ height: 100, borderRadius: 1, bgcolor: 'rgba(0,0,0,.1)' }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 12 }}
          >
            {unavailable
              ? 'Activity history unavailable'
              : loading
                ? 'Loading activity…'
                : 'Collecting activity data'}
          </Typography>
          {!unavailable && !loading && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 10 }}
            >
              The trend appears after two complete measurements.
            </Typography>
          )}
        </Stack>
      ) : (
        <Stack direction="row" gap={0.5}>
          <Stack
            justifyContent="space-between"
            sx={{ height: 80, minWidth: 32 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 10 }}
            >
              {max.toLocaleString('en-GB', { maximumFractionDigits: 1 })}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 10 }}
            >
              0
            </Typography>
          </Stack>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              component="svg"
              role="img"
              aria-label={
                personal
                  ? 'Profile activity over the last 24 hours'
                  : 'Database SQL execution time over the last 24 hours'
              }
              sx={{
                width: '100%',
                height: 80,
                display: 'block',
                overflow: 'hidden',
              }}
            >
              {[6, 42, 78].map((at) => (
                <line
                  key={at}
                  x1="0"
                  x2="100%"
                  y1={at}
                  y2={at}
                  stroke="currentColor"
                  opacity="0.1"
                />
              ))}
              {!personal && baseline != null && (
                <line
                  x1="0"
                  x2="100%"
                  y1={y(baseline / 1000)}
                  y2={y(baseline / 1000)}
                  stroke={colors[1]}
                  strokeDasharray="4 4"
                />
              )}
              {points.map((point, i) => {
                const previous = points[i - 1];
                const title = `${time(point.at)} · ${point.value.toLocaleString('en-GB', { maximumFractionDigits: 2 })} ${personal ? 'profiles/min' : 's/min'}`;
                if (!personal)
                  return (
                    <g key={point.at}>
                      <title>{title}</title>
                      {previous &&
                        point.at - previous.at <= intervalMs * 1.5 && (
                          <line
                            x1={`${x(previous.at)}%`}
                            x2={`${x(point.at)}%`}
                            y1={y(previous.value)}
                            y2={y(point.value)}
                            stroke={colors[0]}
                            strokeWidth={2}
                          />
                        )}
                      <circle
                        cx={`${x(point.at)}%`}
                        cy={y(point.value)}
                        r={2}
                        fill={colors[0]}
                      />
                    </g>
                  );
                const width = Math.min((point.interval / day) * 100, 3);
                const reused = Math.min(point.value, point.reused);
                const refreshed = Math.max(0, point.value - reused);
                return (
                  <g key={point.at}>
                    <title>
                      {title} ·{' '}
                      {reused.toLocaleString('en-GB', {
                        maximumFractionDigits: 2,
                      })}{' '}
                      reused/min
                    </title>
                    <rect
                      x={`${Math.max(0, x(point.at) - width)}%`}
                      y={y(point.value)}
                      width={`${width * 0.75}%`}
                      height={(refreshed / max) * 72}
                      rx={1}
                      fill={colors[0]}
                    />
                    <rect
                      x={`${Math.max(0, x(point.at) - width)}%`}
                      y={y(reused)}
                      width={`${width * 0.75}%`}
                      height={(reused / max) * 72}
                      rx={1}
                      fill={colors[1]}
                    />
                  </g>
                );
              })}
            </Box>
            <Stack direction="row" justifyContent="space-between">
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                <Typography
                  key={fraction}
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: 10 }}
                >
                  {fraction === 1 ? 'Now' : time(start + day * fraction)}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
