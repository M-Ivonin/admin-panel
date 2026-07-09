'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import {
  AppEventsAnalyticsResponse,
  AppEventsCountByEvent,
  AppEventsHeatmapBucket,
  AppEventsTimeSeriesBucket,
  AppEventsUnreadSocialActivityChannelTypeBreakdown,
  getAppEventsAnalytics,
} from '@/lib/api/app-events-analytics';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_ANALYTICS_RANGE_DAYS = 14;
const BASELINE_PLATFORM_OPTIONS = ['android', 'ios'];
const BASELINE_LOCALE_OPTIONS = ['en-US', 'pt-BR', 'es-419'];
const EVENT_LABELS: Record<string, string> = {
  for_you_feed_opened: 'For You feed opened',
  subscription_paywall_opened: 'Subscription paywall opened',
  checkout_started: 'Checkout started',
  subscription_started: 'Subscription started',
  in_app_purchase_completed: 'Checkout completed',
  subscription_renewed: 'Subscription renewed',
  ai_chat_opened: 'AI chat opened',
  chat_in_ai_chat: 'AI chat message sent',
  live_challenge_created: 'Live Match Challenge created',
  live_challenge_invite_accepted: 'Live Match Challenge invite accepted',
  private_chat_created: 'Private chat created',
  private_chat_message_sent: 'Private chat message sent',
  public_chat_opened: 'Public chat opened',
  match_center_opened: 'Match center opened',
  matches_screen_opened: 'Matches screen opened',
  match_details_opened: 'Match details opened',
  league_details_opened: 'League details opened',
  team_hub_opened: 'Team hub opened',
  league_hub_opened: 'League hub opened',
  live_opened: 'Live opened',
  live_screen_opened: 'Live screen opened',
  rewards_wallet_opened: 'Rewards wallet opened',
  prediction_market_order_placed: 'Prediction Market order placed',
  voted_for_prediction: 'Voted for prediction',
  daily_streak_reminder: 'Daily streak reminder',
  weekly_quest_urgency: 'Weekly quest urgency',
  favorite_match_kickoff: 'Favorite match kickoff',
  weekly_stats_digest: 'Weekly stats digest',
  unread_social_activity: 'Unread social activity',
  live_challenge_starting_soon: 'Live challenge starting soon',
  live_challenge_results: 'Live challenge results available',
  level_up: 'Reached level',
  near_level_up: 'Near level',
};
const CATEGORY_LABELS: Record<string, string> = {
  ai_chat: 'AI chat',
  campaign: 'Campaign',
  commerce: 'Commerce',
  feed: 'Feed',
  live: 'Live',
  live_challenge: 'Live Challenge',
  matches: 'Matches',
  prediction_markets: 'Prediction Markets',
  private_chat: 'Private Chat',
  progression: 'Progression',
  public_chat: 'Public Chat',
  social: 'Social',
  subscription: 'Subscription',
};
const UNREAD_CHANNEL_TYPE_LABELS: Record<string, string> = {
  challenge: 'Live challenge chats',
  club: 'Club channels',
  private: 'Private chats',
  public: 'Public channels',
  unknown: 'Unknown channels',
};

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

function optionsWithRequired(
  options: string[],
  requiredOptions: string[],
  currentValue: string
): string[] {
  return optionsWithCurrent(
    [...options, ...requiredOptions].filter(
      (option, index, merged) => merged.indexOf(option) === index
    ),
    currentValue
  );
}

function formatUtcHour(dayOfWeek: number, hour: number): string {
  return `${DAY_LABELS[dayOfWeek] ?? `Day ${dayOfWeek}`} ${String(
    hour
  ).padStart(2, '0')}:00 UTC`;
}

function formatEventLabel(eventKey: string): string {
  const label = EVENT_LABELS[eventKey];
  if (label) {
    return label;
  }

  return eventKey
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatCategoryLabel(category: string): string {
  const label = CATEGORY_LABELS[category];
  if (label) {
    return label;
  }

  return category
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatUnreadChannelType(channelType: string): string {
  const label = UNREAD_CHANNEL_TYPE_LABELS[channelType];
  if (label) {
    return label;
  }

  return channelType
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function pluralize(value: number, singular: string, plural = `${singular}s`) {
  return value === 1 ? singular : plural;
}

export function AppEventsAnalyticsDashboard() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [targetApp, setTargetApp] = useState('');
  const [platform, setPlatform] = useState('');
  const [appVersion, setAppVersion] = useState('');
  const [locale, setLocale] = useState('');
  const [category, setCategory] = useState('');
  const [eventKey, setEventKey] = useState('');
  const [data, setData] = useState<AppEventsAnalyticsResponse | null>(null);
  const [selectedEventKey, setSelectedEventKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const buildAnalyticsParams = useCallback(
    () => ({
      from: from ? `${from}T00:00:00.000Z` : undefined,
      to: to ? `${to}T23:59:59.999Z` : undefined,
      targetApp,
      platform,
      appVersion,
      locale,
      category,
      eventKeys: eventKey ? [eventKey] : undefined,
    }),
    [appVersion, category, eventKey, from, locale, platform, targetApp, to]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAppEventsAnalytics(buildAnalyticsParams());
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

  const maxEventCount = useMemo(() => {
    return Math.max(
      ...(data?.countsByEvent.map((item) => item.count) ?? [0]),
      1
    );
  }, [data]);
  const maxTimeSeries = useMemo(() => {
    return Math.max(
      ...(data?.timeSeries.map((bucket) => bucket.count) ?? [0]),
      1
    );
  }, [data]);
  const heatmapIndex = useMemo(() => {
    const map = new Map<string, AppEventsHeatmapBucket>();
    data?.heatmapUtc.forEach((bucket) => {
      map.set(`${bucket.dayOfWeek}:${bucket.hour}`, bucket);
    });
    return map;
  }, [data]);
  const maxHeatmapEvents = useMemo(() => {
    return Math.max(
      ...(data?.heatmapUtc.map((bucket) => bucket.count) ?? [0]),
      1
    );
  }, [data]);
  const targetAppOptions = useMemo(
    () => optionsWithCurrent(data?.filters.targetApps ?? [], targetApp),
    [data?.filters.targetApps, targetApp]
  );
  const platformOptions = useMemo(
    () =>
      optionsWithRequired(
        data?.filters.platforms ?? [],
        BASELINE_PLATFORM_OPTIONS,
        platform
      ),
    [data?.filters.platforms, platform]
  );
  const appVersionOptions = useMemo(
    () => optionsWithCurrent(data?.filters.appVersions ?? [], appVersion),
    [appVersion, data?.filters.appVersions]
  );
  const localeOptions = useMemo(
    () =>
      optionsWithRequired(
        data?.filters.locales ?? [],
        BASELINE_LOCALE_OPTIONS,
        locale
      ),
    [data?.filters.locales, locale]
  );
  const categoryOptions = useMemo(
    () => optionsWithCurrent(data?.filters.categories ?? [], category),
    [category, data?.filters.categories]
  );
  const eventKeyOptions = useMemo(
    () => optionsWithCurrent(data?.filters.eventKeys ?? [], eventKey),
    [data?.filters.eventKeys, eventKey]
  );
  const unreadSocialBreakdown =
    data?.breakdowns?.unreadSocialActivityByChannelType ?? [];
  const selectedEvent = useMemo(() => {
    return (
      data?.countsByEvent.find((item) => item.eventKey === selectedEventKey) ??
      null
    );
  }, [data?.countsByEvent, selectedEventKey]);
  const selectedEventTimeSeries = useMemo(() => {
    return (
      data?.timeSeries.filter(
        (bucket) => bucket.eventKey === selectedEventKey
      ) ?? []
    );
  }, [data?.timeSeries, selectedEventKey]);

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
              App Events Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registered-user behavior, campaign-safe event counts, and UTC
              activity buckets.
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
                flexWrap="wrap"
                useFlexGap
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
                <FilterSelect
                  label="Target App"
                  value={targetApp}
                  options={targetAppOptions}
                  allLabel="All target apps"
                  onChange={setTargetApp}
                />
                <FilterSelect
                  label="Platform"
                  value={platform}
                  options={platformOptions}
                  allLabel="All platforms"
                  onChange={setPlatform}
                />
                <FilterSelect
                  label="App version"
                  value={appVersion}
                  options={appVersionOptions}
                  allLabel="All versions"
                  onChange={setAppVersion}
                  minWidth={190}
                />
                <FilterSelect
                  label="Locale"
                  value={locale}
                  options={localeOptions}
                  allLabel="All locales"
                  onChange={setLocale}
                />
                <FilterSelect
                  label="Category"
                  value={category}
                  options={categoryOptions}
                  allLabel="All categories"
                  onChange={setCategory}
                  formatOptionLabel={formatCategoryLabel}
                />
                <FilterSelect
                  label="Event key"
                  value={eventKey}
                  options={eventKeyOptions}
                  allLabel="All event keys"
                  onChange={setEventKey}
                  minWidth={240}
                  formatOptionLabel={formatEventLabel}
                />
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
                  label="Total events"
                  value={data.summary.totalEvents.toLocaleString()}
                />
                <MetricCard
                  label="Unique users"
                  value={data.summary.uniqueUsers.toLocaleString()}
                />
                <MetricCard
                  label="Screen-open users"
                  value={data.summary.screenOpenUniqueUsers.toLocaleString()}
                />
                <MetricCard
                  label="Business actions"
                  value={data.summary.businessActionEvents.toLocaleString()}
                />
              </Box>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Event Counts
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Events are total event triggers. Users are distinct
                    registered users who triggered that event.
                  </Typography>
                  <Stack spacing={1.5}>
                    {data.countsByEvent.length === 0 ? (
                      <Typography color="text.secondary">
                        No App Event counts in this range.
                      </Typography>
                    ) : (
                      data.countsByEvent.map((item) => {
                        const eventLabel = formatEventLabel(item.eventKey);

                        return (
                          <ButtonBase
                            key={item.eventKey}
                            onClick={() => setSelectedEventKey(item.eventKey)}
                            aria-label={`Open breakdown for ${eventLabel}`}
                            sx={{
                              width: '100%',
                              display: 'block',
                              textAlign: 'left',
                              borderRadius: 1,
                              p: 1,
                              mx: -1,
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              justifyContent="space-between"
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              spacing={1}
                              sx={{ mb: 0.5 }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                                useFlexGap
                              >
                                <Typography variant="body2" fontWeight={700}>
                                  {eventLabel}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={formatCategoryLabel(item.category)}
                                />
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                useFlexGap
                              >
                                <Chip
                                  size="small"
                                  label={`${item.count.toLocaleString()} ${pluralize(item.count, 'event')}`}
                                />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`${item.uniqueUsers.toLocaleString()} ${pluralize(item.uniqueUsers, 'user')}`}
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
                                  width: `${(item.count / maxEventCount) * 100}%`,
                                  height: '100%',
                                  bgcolor: 'primary.main',
                                }}
                              />
                            </Box>
                          </ButtonBase>
                        );
                      })
                    )}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    UTC Activity Heatmap
                  </Typography>
                  <Box sx={{ overflowX: 'auto', overflowY: 'hidden' }}>
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
                    Time Series
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="end">
                    {data.timeSeries.length === 0 ? (
                      <Typography color="text.secondary">
                        No daily buckets in this range.
                      </Typography>
                    ) : (
                      data.timeSeries.slice(-14).map((bucket) => (
                        <Box
                          key={`${bucket.bucketStart}:${bucket.eventKey}`}
                          sx={{ flex: 1, minWidth: 32 }}
                        >
                          <Box
                            title={`${formatEventLabel(bucket.eventKey)}: ${bucket.count} events`}
                            sx={{
                              height: 112,
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
                                height: `${(bucket.count / maxTimeSeries) * 100}%`,
                                bgcolor: 'success.main',
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {bucket.bucketStart.slice(5, 10)}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert severity="info">No App Events analytics available.</Alert>
          )}
        </Stack>
      </Box>
      <EventBreakdownDialog
        event={selectedEvent}
        timeSeries={selectedEventTimeSeries}
        unreadSocialBreakdown={unreadSocialBreakdown}
        onClose={() => setSelectedEventKey(null)}
      />
    </Box>
  );
}

function EventBreakdownDialog({
  event,
  timeSeries,
  unreadSocialBreakdown,
  onClose,
}: {
  event: AppEventsCountByEvent | null;
  timeSeries: AppEventsTimeSeriesBucket[];
  unreadSocialBreakdown: AppEventsUnreadSocialActivityChannelTypeBreakdown[];
  onClose: () => void;
}) {
  const isOpen = Boolean(event);
  const channelBreakdown =
    event?.eventKey === 'unread_social_activity' ? unreadSocialBreakdown : [];
  const maxDailyEvents = Math.max(
    ...timeSeries.map((bucket) => bucket.count),
    1
  );
  const maxChannelEvents = Math.max(
    ...channelBreakdown.map((item) => item.count),
    1
  );

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {event ? `${formatEventLabel(event.eventKey)} breakdown` : 'Breakdown'}
      </DialogTitle>
      <DialogContent>
        {event && (
          <Stack spacing={3} sx={{ pt: 0.5 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={formatCategoryLabel(event.category)} />
              <Chip
                size="small"
                label={`${event.count.toLocaleString()} ${pluralize(event.count, 'event')}`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${event.uniqueUsers.toLocaleString()} ${pluralize(event.uniqueUsers, 'user')}`}
              />
            </Stack>

            {event.eventKey === 'unread_social_activity' && (
              <BreakdownSection
                title="Channel type"
                emptyText="No channel-type breakdown returned for this event."
              >
                {channelBreakdown.length > 0 &&
                  channelBreakdown.map((item) => (
                    <BreakdownBar
                      key={item.channelType}
                      label={formatUnreadChannelType(item.channelType)}
                      value={item.count}
                      maxValue={maxChannelEvents}
                      chips={[
                        `${item.count.toLocaleString()} ${pluralize(item.count, 'event')}`,
                        `${item.uniqueUsers.toLocaleString()} ${pluralize(item.uniqueUsers, 'user')}`,
                        `${item.unreadCount.toLocaleString()} unread`,
                      ]}
                      color="secondary.main"
                    />
                  ))}
              </BreakdownSection>
            )}

            <BreakdownSection
              title="Daily buckets"
              emptyText="No daily breakdown returned for this event."
            >
              {timeSeries.length > 0 &&
                timeSeries.map((bucket) => (
                  <BreakdownBar
                    key={`${bucket.bucketStart}:${bucket.eventKey}`}
                    label={bucket.bucketStart.slice(0, 10)}
                    value={bucket.count}
                    maxValue={maxDailyEvents}
                    chips={[
                      `${bucket.count.toLocaleString()} ${pluralize(bucket.count, 'event')}`,
                      `${bucket.uniqueUsers.toLocaleString()} ${pluralize(bucket.uniqueUsers, 'user')}`,
                    ]}
                    color="success.main"
                  />
                ))}
            </BreakdownSection>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function BreakdownSection({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: ReactNode;
}) {
  const hasChildren = Boolean(children);

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {hasChildren ? (
        <Stack spacing={1.5}>{children}</Stack>
      ) : (
        <Typography color="text.secondary">{emptyText}</Typography>
      )}
    </Box>
  );
}

function BreakdownBar({
  label,
  value,
  maxValue,
  chips,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  chips: string[];
  color: string;
}) {
  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mb: 0.5 }}
      >
        <Typography variant="body2" fontWeight={700}>
          {label}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {chips.map((chip) => (
            <Chip key={chip} size="small" variant="outlined" label={chip} />
          ))}
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
            width: `${(value / maxValue) * 100}%`,
            height: '100%',
            bgcolor: color,
          }}
        />
      </Box>
    </Box>
  );
}

function FilterSelect({
  label,
  value,
  options,
  allLabel,
  minWidth = 160,
  onChange,
  formatOptionLabel = (option) => option,
}: {
  label: string;
  value: string;
  options: string[];
  allLabel: string;
  minWidth?: number;
  onChange: (value: string) => void;
  formatOptionLabel?: (option: string) => string;
}) {
  return (
    <TextField
      label={label}
      select
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{ minWidth }}
      InputLabelProps={{ shrink: true }}
      SelectProps={{
        displayEmpty: true,
        renderValue: (selected) => {
          const selectedValue = String(selected);
          return selectedValue ? formatOptionLabel(selectedValue) : allLabel;
        },
      }}
    >
      <MenuItem value="">{allLabel}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {formatOptionLabel(option)}
        </MenuItem>
      ))}
    </TextField>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800}>
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
  heatmapIndex: Map<string, AppEventsHeatmapBucket>;
  maxEvents: number;
}) {
  return (
    <>
      <Typography variant="caption" color="text.secondary">
        {day}
      </Typography>
      {Array.from({ length: 24 }, (_, hour) => {
        const bucket = heatmapIndex.get(`${dayOfWeek}:${hour}`);
        const value = bucket?.count ?? 0;
        const opacity = value === 0 ? 0.08 : 0.2 + (value / maxEvents) * 0.65;

        return (
          <Box
            key={hour}
            title={`${formatUtcHour(dayOfWeek, hour)}: ${value} events`}
            aria-label={`${formatUtcHour(dayOfWeek, hour)} ${value} events`}
            sx={{
              width: 24,
              height: 24,
              borderRadius: 0.75,
              bgcolor: `rgba(25, 118, 210, ${opacity})`,
              border: 1,
              borderColor: 'divider',
            }}
          >
            {value > 0 ? (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: 'text.primary',
                  fontSize: 10,
                  lineHeight: '24px',
                  textAlign: 'center',
                }}
              >
                {value}
              </Typography>
            ) : null}
          </Box>
        );
      })}
    </>
  );
}
