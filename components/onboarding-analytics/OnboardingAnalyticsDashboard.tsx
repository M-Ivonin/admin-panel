'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import {
  getOnboardingFunnelAnalytics,
  OnboardingFunnelAnalyticsResponse,
  OnboardingFunnelHeatmapBucket,
} from '@/lib/api/onboarding-analytics';

const STEP_LABELS: Record<string, string> = {
  reward_intro: 'Reward intro',
  favorites: 'Favorites',
  prediction_preview: 'Prediction preview',
  auth_wall: 'Auth wall',
  live_ready: 'Live ready',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  date.setUTCDate(date.getUTCDate() - 30);
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

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOnboardingFunnelAnalytics({
        from: from ? `${from}T00:00:00.000Z` : undefined,
        to: to ? `${to}T23:59:59.999Z` : undefined,
        platform,
        locale,
        app_version: appVersion,
        app_product: 'SirBro',
      });
      setData(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxStepViews = useMemo(() => {
    return Math.max(...(data?.steps.map((step) => step.views) ?? [0]), 1);
  }, [data]);
  const maxTimeSeries = useMemo(() => {
    return Math.max(
      ...(data?.timeSeries.map((bucket) => bucket.started) ?? [0]),
      1
    );
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
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            maxWidth: 1280,
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 4 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Link href="/dashboard">
            <Button variant="outlined" size="small" startIcon={<ArrowBack />}>
              Back
            </Button>
          </Link>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Onboarding Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Funnel behavior, drop-offs, and activity heatmap for new SirBro
              users.
            </Typography>
          </Box>
        </Box>
      </Paper>

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

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                  gap: 2,
                }}
              >
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

                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Time Series
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="end">
                      {data.timeSeries.slice(-14).map((bucket) => (
                        <Box key={bucket.date} sx={{ flex: 1, minWidth: 16 }}>
                          <Box
                            title={`${bucket.date}: ${bucket.started} started`}
                            sx={{
                              height: 96,
                              display: 'flex',
                              alignItems: 'end',
                              bgcolor: 'action.hover',
                              borderRadius: 1,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                height: `${(bucket.started / maxTimeSeries) * 100}%`,
                                bgcolor: 'success.main',
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {bucket.date.slice(5)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

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
                      data.recentEvents.map((event) => (
                        <Stack
                          key={event.id}
                          direction={{ xs: 'column', md: 'row' }}
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography variant="body2">
                            {STEP_LABELS[event.step] ?? event.step} /{' '}
                            {event.eventName}
                            {event.action ? ` / ${event.action}` : ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.sessionId} ·{' '}
                            {new Date(event.occurredAt).toLocaleString()}
                          </Typography>
                        </Stack>
                      ))
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
