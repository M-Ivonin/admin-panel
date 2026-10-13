import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import type { HistoryBucket, Outcome } from '@/lib/api/system-monitor';

const localTime = (at: string) =>
  new Date(at).toLocaleString('en-GB', { timeZone: 'Europe/Kyiv' });

const outcomes: Outcome[] = [
  'pass',
  'warn',
  'fail',
  'unavailable',
  'interrupted',
  'unknown',
];
export function MonitorCharts({ buckets }: { buckets: HistoryBucket[] }) {
  const theme = useTheme();
  const colors: Record<Outcome, string> = {
    pass: theme.palette.success.main,
    warn: theme.palette.warning.main,
    fail: theme.palette.error.main,
    unavailable: theme.palette.grey[500],
    interrupted: theme.palette.grey[600],
    unknown: theme.palette.grey[300],
  };
  const maximum = Math.max(1, ...buckets.map((b) => b.latencyMs ?? 0));
  const x = (index: number) =>
    `${2 + ((index + 0.5) / Math.max(1, buckets.length)) * 96}%`;
  const y = (value: number) => 130 - (value / maximum) * 120;
  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6">Successful response time</Typography>
        <Typography variant="body2" color="text.secondary">
          Successful samples only. Red crosses mark failures separately; gaps
          have no latency.
        </Typography>
        {!buckets.length ? (
          <Typography sx={{ py: 3 }} color="text.secondary">
            No samples in this period.
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Stack
              justifyContent="space-between"
              sx={{ height: 140, minWidth: 56, flexShrink: 0 }}
            >
              <Typography variant="caption" color="text.secondary">
                {Math.round(maximum)} ms
              </Typography>
              <Typography variant="caption" color="text.secondary">
                0 ms
              </Typography>
            </Stack>
            <Box
              component="svg"
              role="img"
              aria-label="Successful latency with separate failure markers"
              height={160}
              sx={{ display: 'block', width: '100%', minWidth: 0 }}
            >
              <line
                x1="0"
                y1="130"
                x2="100%"
                y2="130"
                stroke={theme.palette.divider}
              />
              {buckets.map((bucket, i) => (
                <g key={bucket.at}>
                  {bucket.latencyMs !== null && (
                    <circle
                      cx={x(i)}
                      cy={y(bucket.latencyMs)}
                      r="4"
                      fill={colors.pass}
                    >
                      <title>
                        {localTime(bucket.at)}: {Math.round(bucket.latencyMs)}{' '}
                        ms
                      </title>
                    </circle>
                  )}
                  {bucket.fail > 0 && (
                    <svg
                      x={x(i)}
                      y="144"
                      width="8"
                      height="8"
                      overflow="visible"
                    >
                      <g
                        transform="translate(-4,0)"
                        stroke={colors.fail}
                        strokeWidth="2"
                      >
                        <title>
                          {localTime(bucket.at)}: {bucket.fail} failed attempts
                        </title>
                        <line x1="0" y1="0" x2="8" y2="8" />
                        <line x1="8" y1="0" x2="0" y2="8" />
                      </g>
                    </svg>
                  )}
                </g>
              ))}
            </Box>
          </Stack>
        )}
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6">Availability timeline</Typography>
        <Typography variant="body2" color="text.secondary">
          Gray slots indicate missing or unavailable coverage; they are never
          counted as a pass.
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          flexWrap="wrap"
          sx={{ my: 1 }}
        >
          {outcomes.map((outcome) => (
            <Stack
              key={outcome}
              direction="row"
              spacing={0.5}
              alignItems="center"
            >
              <Box sx={{ width: 10, height: 10, bgcolor: colors[outcome] }} />
              <Typography variant="caption">{outcome}</Typography>
            </Stack>
          ))}
        </Stack>
        {buckets.length ? (
          <Box
            component="svg"
            role="img"
            aria-label="Availability including gray missing schedule slots"
            height={60}
            sx={{ width: '100%', display: 'block' }}
          >
            {buckets.map((bucket, index) => {
              const total = outcomes.reduce(
                (sum, outcome) => sum + bucket[outcome],
                0
              );
              let previous = 0;
              return (
                <g key={bucket.at}>
                  <title>
                    {localTime(bucket.at)}:{' '}
                    {outcomes.map((o) => `${o} ${bucket[o]}`).join(', ')}
                  </title>
                  {outcomes.map((outcome) => {
                    const count = total
                      ? bucket[outcome]
                      : outcome === 'unknown'
                        ? 1
                        : 0;
                    const height = (count / Math.max(1, total)) * 60;
                    const top = previous;
                    previous += height;
                    return (
                      <rect
                        key={outcome}
                        x={`${(index / buckets.length) * 100}%`}
                        y={top}
                        width={`${100 / buckets.length}%`}
                        height={height}
                        fill={colors[outcome]}
                      />
                    );
                  })}
                </g>
              );
            })}
          </Box>
        ) : (
          <Typography sx={{ py: 3 }} color="text.secondary">
            No scheduled slots in this period.
          </Typography>
        )}
        {!!buckets.length && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">
              {localTime(buckets[0].at)}
            </Typography>
            <Typography variant="caption">
              {localTime(buckets[buckets.length - 1].at)}
            </Typography>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
