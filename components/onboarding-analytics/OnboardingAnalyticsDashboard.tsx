'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  getOnboardingFunnelAnalytics,
  OnboardingFunnelAnalyticsResponse,
  OnboardingFunnelHeatmapBucket,
  OnboardingFunnelRecentEvent,
  OnboardingFunnelTimeSeriesBucket,
} from '@/lib/api/onboarding-analytics';

const STEP_LABELS: Record<string, string> = {
  reward_intro: 'Reward intro',
  favorites: 'Favorites',
  prediction_preview: 'Prediction preview',
  auth_wall: 'Auth wall',
  live_ready: 'Live ready',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const RECENT_EVENTS_PAGE_SIZE = '50';
const DEFAULT_ANALYTICS_RANGE_DAYS = 7;

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatSeconds(value: number | null): string {
  if (value === null) return 'n/a';
  if (value < 60) return `${Math.round(value)}s`;
  return `${Math.round(value / 60)}m`;
}

function defaultFrom(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - DEFAULT_ANALYTICS_RANGE_DAYS);
  return date.toISOString().slice(0, 10);
}

function defaultTo(): string {
  return new Date().toISOString().slice(0, 10);
}

function optionsWithCurrent(options: string[], currentValue: string): string[] {
  const normalized = currentValue.trim();
  if (!normalized || options.includes(normalized)) {
    return options;
  }
  return [...options, normalized].sort((left, right) =>
    left.localeCompare(right)
  );
}

function formatRecentEventUserName(event: OnboardingFunnelRecentEvent): string {
  return event.userName?.trim() || event.userEmail?.trim() || 'Unknown';
}

function formatRecentEventUserEmail(
  event: OnboardingFunnelRecentEvent
): string | null {
  const email = event.userEmail?.trim();
  if (!email || email === formatRecentEventUserName(event)) {
    return null;
  }
  return email;
}

function formatRecentEventCountry(event: OnboardingFunnelRecentEvent): string {
  return event.userCountryCode?.trim().toUpperCase() || 'Unknown';
}

function formatRecentEventLanguage(event: OnboardingFunnelRecentEvent): string {
  return event.userLanguage?.trim() || 'Unknown';
}

export function OnboardingAnalyticsDashboard() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [platform, setPlatform] = useState('');
  const [locale, setLocale] = useState('');
  const [appVersion, setAppVersion] = useState('');
  const [data, setData] = useState<OnboardingFunnelAnalyticsResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMoreRecentEvents, setLoadingMoreRecentEvents] = useState(false);

  const buildAnalyticsParams = useCallback(
    (recentEventsCursor?: string) => ({
      from: from ? `${from}T00:00:00.000Z` : undefined,
      to: to ? `${to}T23:59:59.999Z` : undefined,
      platform,
      locale,
      app_version: appVersion,
      app_product: 'SirBro',
      recent_events_limit: RECENT_EVENTS_PAGE_SIZE,
      recent_events_cursor: recentEventsCursor,
    }),
    [appVersion, from, locale, platform, to]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOnboardingFunnelAnalytics(buildAnalyticsParams());
      setData(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [buildAnalyticsParams]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadMoreRecentEvents = async () => {
    if (!data?.recentEventsNextCursor || loadingMoreRecentEvents) {
      return;
    }

    setLoadingMoreRecentEvents(true);
    setError(null);
    try {
      const result = await getOnboardingFunnelAnalytics(
        buildAnalyticsParams(data.recentEventsNextCursor)
      );
      setData((current) => {
        if (!current) {
          return result;
        }

        return {
          ...current,
          recentEvents: [...current.recentEvents, ...result.recentEvents],
          recentEventsNextCursor: result.recentEventsNextCursor,
        };
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unknown error');
    } finally {
      setLoadingMoreRecentEvents(false);
    }
  };

  const maxStepViews = useMemo(() => {
    return Math.max(...(data?.steps.map((step) => step.views) ?? [0]), 1);
  }, [data]);
  const heatmapIndex = useMemo(() => {
    const map = new Map<string, OnboardingFunnelHeatmapBucket>();
    data?.heatmap.forEach((bucket) => {
      map.set(`${bucket.dayOfWeek}:${bucket.hour}`, bucket);
    });
    return map;
  }, [data]);
  const maxHeatmapEvents = useMemo(() => {
    return Math.max(
      ...(data?.heatmap.map((bucket) => bucket.events) ?? [0]),
      1
    );
  }, [data]);
  const platformOptions = useMemo(
    () => optionsWithCurrent(data?.filters.platforms ?? [], platform),
    [data?.filters.platforms, platform]
  );
  const localeOptions = useMemo(
    () => optionsWithCurrent(data?.filters.locales ?? [], locale),
    [data?.filters.locales, locale]
  );
  const appVersionOptions = useMemo(
    () => optionsWithCurrent(data?.filters.appVersions ?? [], appVersion),
    [appVersion, data?.filters.appVersions]
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminPageHeader
        title="Onboarding Analytics"
        subtitle="Funnel behavior, drop-offs, and activity heatmap for new SirBro users."
      />

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', md: 'center' }}
              >
                <TextField
                  label="From"
                  type="date"
                  size="small"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="To"
                  type="date"
                  size="small"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Platform"
                  select
                  size="small"
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">All platforms</MenuItem>
                  {platformOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Locale"
                  select
                  size="small"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">All locales</MenuItem>
                  {localeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="App version"
                  select
                  size="small"
                  value={appVersion}
                  onChange={(event) => setAppVersion(event.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">All versions</MenuItem>
                  {appVersionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" onClick={load} disabled={loading}>
                  Refresh
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : data ? (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: 2,
                }}
              >
                <MetricCard
                  label="Started"
                  value={data.summary.sessionsStarted.toLocaleString()}
                />
                <MetricCard
                  label="Completed"
                  value={data.summary.sessionsCompleted.toLocaleString()}
                />
                <MetricCard
                  label="Completion"
                  value={formatPercent(data.summary.completionRate)}
                />
                <MetricCard
                  label="Avg completion"
                  value={formatSeconds(data.summary.averageSecondsToCompletion)}
                />
              </Box>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Funnel Steps
                  </Typography>
                  <Stack spacing={1.5}>
                    {data.steps.map((step) => (
                      <Box key={step.step}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            {STEP_LABELS[step.step] ?? step.step}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Chip size="small" label={`${step.views} views`} />
                            <Chip
                              size="small"
                              color={step.dropOffs > 0 ? 'warning' : 'default'}
                              label={`${step.dropOffs} drop-offs`}
                            />
                          </Stack>
                        </Stack>
                        <Box
                          sx={{
                            height: 10,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${(step.views / maxStepViews) * 100}%`,
                              height: '100%',
                              bgcolor: 'primary.main',
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Transitions
                  </Typography>
                  <Stack divider={<Divider />} spacing={1}>
                    {data.transitions.map((transition) => (
                      <Stack
                        key={`${transition.from}:${transition.to}`}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">
                          {STEP_LABELS[transition.from] ?? transition.from} to{' '}
                          {STEP_LABELS[transition.to] ?? transition.to}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${formatPercent(transition.rate)} / ${
                            transition.sessions
                          } sessions`}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <OnboardingHistoryChart timeSeries={data.timeSeries} />

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    UTC Activity Heatmap
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '44px repeat(24, 24px)',
                        gap: 0.5,
                        minWidth: 660,
                      }}
                    >
                      <Box />
                      {Array.from({ length: 24 }, (_, hour) => (
                        <Typography
                          key={hour}
                          variant="caption"
                          color="text.secondary"
                          textAlign="center"
                        >
                          {hour}
                        </Typography>
                      ))}
                      {DAY_LABELS.map((day, dayOfWeek) => (
                        <HeatmapRow
                          key={day}
                          day={day}
                          dayOfWeek={dayOfWeek}
                          heatmapIndex={heatmapIndex}
                          maxEvents={maxHeatmapEvents}
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Recent Events
                  </Typography>
                  <Stack divider={<Divider />} spacing={1}>
                    {data.recentEvents.length === 0 ? (
                      <Typography color="text.secondary">
                        No onboarding events in this range.
                      </Typography>
                    ) : (
                      <>
                        <Box
                          sx={{
                            display: { xs: 'none', md: 'grid' },
                            gridTemplateColumns: '1fr 220px 88px 120px 170px',
                            gap: 2,
                            px: 0,
                          }}
                        >
                          {['Event', 'User', 'Country', 'Language', 'Time'].map(
                            (label) => (
                              <Typography
                                key={label}
                                variant="caption"
                                color="text.secondary"
                                fontWeight={700}
                              >
                                {label}
                              </Typography>
                            )
                          )}
                        </Box>
                        {data.recentEvents.map((event) => (
                          <Box
                            key={event.id}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                xs: '1fr',
                                md: '1fr 220px 88px 120px 170px',
                              },
                              gap: { xs: 0.75, md: 2 },
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="body2">
                              {STEP_LABELS[event.step] ?? event.step} /{' '}
                              {event.eventName}
                              {event.action ? ` / ${event.action}` : ''}
                            </Typography>
                            <Stack spacing={0.25}>
                              <Typography
                                variant="caption"
                                color="text.primary"
                                fontWeight={700}
                              >
                                {formatRecentEventUserName(event)}
                              </Typography>
                              {formatRecentEventUserEmail(event) && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatRecentEventUserEmail(event)}
                                </Typography>
                              )}
                            </Stack>
                            <Typography variant="caption" color="text.primary">
                              {formatRecentEventCountry(event)}
                            </Typography>
                            <Typography variant="caption" color="text.primary">
                              {formatRecentEventLanguage(event)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(event.occurredAt).toLocaleString()}
                            </Typography>
                          </Box>
                        ))}
                        {data.recentEventsNextCursor && (
                          <Box
                            sx={{ display: 'flex', justifyContent: 'center' }}
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={loadMoreRecentEvents}
                              disabled={loadingMoreRecentEvents}
                            >
                              {loadingMoreRecentEvents
                                ? 'Loading...'
                                : 'Load more'}
                            </Button>
                          </Box>
                        )}
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert severity="info">No onboarding analytics available.</Alert>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function OnboardingHistoryChart({
  timeSeries,
}: {
  timeSeries: OnboardingFunnelTimeSeriesBucket[];
}) {
  const theme = useTheme();
  const chartWidth = Math.max(1040, (timeSeries.length - 1) * 112 + 104);
  const chartHeight = 280;
  const plot = { top: 24, right: 64, bottom: 48, left: 48 };
  const maxSessions = Math.max(
    ...timeSeries.map((bucket) => bucket.started),
    1
  );
  const axisMax = Math.max(4, Math.ceil(maxSessions / 4) * 4);
  const plotWidth = chartWidth - plot.left - plot.right;
  const plotHeight = chartHeight - plot.top - plot.bottom;
  const hasValidCompletionRates = timeSeries.every((bucket) =>
    Number.isFinite(bucket.completionRate)
  );
  const xForIndex = (index: number) =>
    timeSeries.length <= 1
      ? plot.left + 24
      : plot.left + (index / (timeSeries.length - 1)) * plotWidth;
  const yForStarted = (value: number) =>
    plot.top + (1 - value / axisMax) * plotHeight;
  const yForCompletionRate = (value: number) =>
    plot.top + (1 - Math.min(Math.max(value, 0), 1)) * plotHeight;
  const startedPoints = timeSeries
    .map(
      (bucket, index) => `${xForIndex(index)},${yForStarted(bucket.started)}`
    )
    .join(' ');
  const completionRatePoints = timeSeries
    .map(
      (bucket, index) =>
        `${xForIndex(index)},${yForCompletionRate(bucket.completionRate)}`
    )
    .join(' ');

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 1 }}
        >
          <Box>
            <Typography variant="h6" component="h2" fontWeight={700}>
              Onboarding History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Daily starts and completion rate for each start-date cohort.
            </Typography>
          </Box>
          <Stack
            component="ul"
            aria-label="Chart legend"
            direction="row"
            spacing={2}
            sx={{ p: 0, m: 0, listStyle: 'none' }}
          >
            <ChartLegendItem
              label="Started"
              color={theme.palette.primary.light}
              dashed
            />
            <ChartLegendItem
              label="Completed %"
              color={theme.palette.success.main}
            />
          </Stack>
        </Stack>

        {timeSeries.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 6 }}>
            No onboarding history in this range.
          </Typography>
        ) : !hasValidCompletionRates ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Completion history is unavailable until the analytics backend is
            updated.
          </Alert>
        ) : (
          <Box
            component="figure"
            aria-label="Daily started onboarding sessions and completion rate"
            sx={{ m: 0, overflowX: 'auto' }}
          >
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              width="100%"
              height={chartHeight}
              style={{ display: 'block', minWidth: chartWidth }}
            >
              {Array.from({ length: 5 }, (_, index) => {
                const startedValue = axisMax - (axisMax / 4) * index;
                const completionPercent = 100 - index * 25;
                const y = yForStarted(startedValue);
                return (
                  <g key={startedValue} aria-hidden="true">
                    <line
                      x1={plot.left}
                      x2={chartWidth - plot.right}
                      y1={y}
                      y2={y}
                      stroke={theme.palette.divider}
                      strokeWidth="1"
                    />
                    <text
                      x={plot.left - 12}
                      y={y + 4}
                      textAnchor="end"
                      fill={theme.palette.text.secondary}
                      fontSize="12"
                    >
                      {startedValue}
                    </text>
                    <text
                      x={chartWidth - plot.right + 12}
                      y={y + 4}
                      fill={theme.palette.text.secondary}
                      fontSize="12"
                    >
                      {completionPercent}%
                    </text>
                  </g>
                );
              })}

              <polyline
                role="img"
                aria-label="Onboarding completion rate line"
                points={completionRatePoints}
                fill="none"
                stroke={theme.palette.success.main}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                role="img"
                aria-label="Started onboarding sessions line"
                points={startedPoints}
                fill="none"
                stroke={theme.palette.primary.light}
                strokeWidth="3"
                strokeDasharray="8 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {timeSeries.map((bucket, index) => {
                const x = xForIndex(index);
                const label = `${bucket.date}: ${bucket.started} started, ${formatPercent(bucket.completionRate)} completed`;
                return (
                  <g key={bucket.date} role="img" aria-label={label}>
                    <title>{label}</title>
                    <circle
                      cx={x}
                      cy={yForStarted(bucket.started)}
                      r="6"
                      fill={theme.palette.background.paper}
                      stroke={theme.palette.primary.light}
                      strokeWidth="3"
                    />
                    <circle
                      cx={x}
                      cy={yForCompletionRate(bucket.completionRate)}
                      r="3.5"
                      fill={theme.palette.background.paper}
                      stroke={theme.palette.success.main}
                      strokeWidth="3"
                    />
                    <text
                      aria-hidden="true"
                      x={x}
                      y={chartHeight - 14}
                      textAnchor="middle"
                      fill={theme.palette.text.secondary}
                      fontSize="12"
                    >
                      {formatChartDate(bucket.date)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function ChartLegendItem({
  label,
  color,
  dashed = false,
}: {
  label: string;
  color: string;
  dashed?: boolean;
}) {
  return (
    <Stack component="li" direction="row" spacing={0.75} alignItems="center">
      <Box
        aria-hidden="true"
        sx={{
          width: 28,
          borderTop: '3px solid',
          borderColor: color,
          borderStyle: dashed ? 'dashed' : 'solid',
        }}
      />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

function formatChartDate(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  });
}

function HeatmapRow({
  day,
  dayOfWeek,
  heatmapIndex,
  maxEvents,
}: {
  day: string;
  dayOfWeek: number;
  heatmapIndex: Map<string, OnboardingFunnelHeatmapBucket>;
  maxEvents: number;
}) {
  return (
    <>
      <Typography variant="caption" color="text.secondary">
        {day}
      </Typography>
      {Array.from({ length: 24 }, (_, hour) => {
        const bucket = heatmapIndex.get(`${dayOfWeek}:${hour}`);
        const intensity = bucket ? bucket.events / maxEvents : 0;
        return (
          <Box
            key={hour}
            title={`${day} ${hour}:00 UTC: ${bucket?.events ?? 0} events`}
            sx={{
              width: 24,
              height: 24,
              borderRadius: 0.5,
              bgcolor: intensity > 0 ? 'primary.main' : 'action.hover',
              opacity: intensity > 0 ? 0.25 + intensity * 0.75 : 1,
              border:
                bucket && bucket.dropOffs > 0
                  ? '1px solid'
                  : '1px solid transparent',
              borderColor: bucket && bucket.dropOffs > 0 ? 'warning.main' : '',
            }}
          />
        );
      })}
    </>
  );
}
