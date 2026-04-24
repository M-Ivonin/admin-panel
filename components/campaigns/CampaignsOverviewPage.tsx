'use client';

/**
 * Renders the live campaigns overview screen with KPI cards, filters, and list state.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, ArrowBack, Edit, InfoOutlined, Search } from '@mui/icons-material';
import type {
  CampaignEntryTriggerType,
  CampaignListItem,
  CampaignLocale,
  CampaignQuickView,
  CampaignStatus,
  CampaignStatsPeriod,
  CampaignsOverviewResponse,
} from '@/modules/campaigns/contracts';
import { campaignsRepository } from '@/modules/campaigns/repository';

const PAGE_SIZE_OPTIONS = [4, 8, 12];

const STATUS_OPTIONS: Array<{ value: CampaignStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const DEFAULT_SELECTED_STATUSES: CampaignStatus[] = [
  'active',
  'paused',
  'scheduled',
  'draft',
];

const TRIGGER_OPTIONS: Array<{
  value: CampaignEntryTriggerType;
  label: string;
}> = [
  { value: 'state_based', label: 'State based' },
  { value: 'event_based', label: 'Event based' },
  { value: 'scheduled_recurring', label: 'Recurring' },
];

const STATS_PERIOD_OPTIONS: Array<{
  value: CampaignStatsPeriod;
  label: string;
}> = [
  { value: 'all_time', label: 'All time' },
  { value: 'last_24_hours', label: '24 hours' },
  { value: 'last_7_days', label: '7 days' },
  { value: 'custom', label: 'Custom' },
];

const QUICK_VIEW_OPTIONS: Array<{
  value: CampaignQuickView;
  label: string;
  helper: string;
}> = [
  {
    value: 'active_now',
    label: 'Active now',
    helper: 'Live campaigns currently moving users.',
  },
  {
    value: 'needs_attention',
    label: 'Needs attention',
    helper: 'Drafts or locales still needing review.',
  },
  {
    value: 'recent_drafts',
    label: 'Recent drafts',
    helper: 'Locally saved work waiting for launch.',
  },
];

const COLORS = {
  canvas: '#111111',
  panel: '#222222',
  surface: '#1A1A1A',
  soft: '#2A2A2A',
  accent: '#5B4BFF',
  accentSoft: '#211C3A',
  textPrimary: '#F5F5F5',
  textSecondary: '#A3A3A3',
  textMuted: '#8B8B8F',
  stroke: '#343434',
  strokeSoft: '#2F2F2F',
  success: '#68C96B',
  warning: '#F0A63A',
  danger: '#E05A5A',
  scheduled: '#7B6DFF',
};

type VisibleLocaleReadiness = NonNullable<
  CampaignListItem['localeReadiness'][CampaignLocale]
>;

function formatMetricValue(value: number, suffix?: string): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k${suffix ?? ''}`;
  }

  return `${value}${suffix ?? ''}`;
}

function formatPercentDelta(value: number): string {
  if (value > 0) {
    return `+${value}%`;
  }

  return `${value}%`;
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return 'Not scheduled';
  }

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDateInputValue(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return toDateInputValue(date);
}

function startOfLocalDateIso(value: string): string {
  return new Date(`${value}T00:00:00`).toISOString();
}

function endOfLocalDateIso(value: string): string {
  return new Date(`${value}T23:59:59.999`).toISOString();
}

function getStatusColor(status: CampaignStatus): string {
  if (status === 'active') {
    return COLORS.success;
  }

  if (status === 'paused') {
    return COLORS.warning;
  }

  if (status === 'scheduled') {
    return COLORS.scheduled;
  }

  if (status === 'archived') {
    return COLORS.danger;
  }

  return COLORS.textSecondary;
}

function getReadinessColor(readiness: VisibleLocaleReadiness): string {
  if (readiness === 'ready') {
    return COLORS.success;
  }

  if (readiness === 'warning') {
    return COLORS.warning;
  }

  return COLORS.danger;
}

function getLocaleReadinessEntries(
  item: CampaignListItem
): Array<[CampaignLocale, VisibleLocaleReadiness]> {
  return Object.entries(item.localeReadiness) as Array<
    [CampaignLocale, VisibleLocaleReadiness]
  >;
}

function KpiCard({
  eyebrow,
  value,
  helper,
  hint,
}: {
  eyebrow: string;
  value: string;
  helper: string;
  hint: string;
}) {
  return (
    <Tooltip title={hint} describeChild arrow placement="top">
      <Paper
        elevation={0}
        sx={{
          p: 1.75,
          borderRadius: 3,
          bgcolor: COLORS.panel,
          border: `1px solid ${COLORS.stroke}`,
          minHeight: 108,
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{ mb: 0.75 }}
        >
          <Typography
            sx={{
              color: COLORS.textMuted,
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {eyebrow}
          </Typography>
          <InfoOutlined sx={{ color: COLORS.textMuted, fontSize: 14 }} />
        </Stack>
        <Typography
          sx={{
            color: COLORS.textPrimary,
            fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1.05,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography sx={{ color: COLORS.textSecondary, fontSize: 12 }}>
          {helper}
        </Typography>
      </Paper>
    </Tooltip>
  );
}

function MetricLabel({ label, hint }: { label: string; hint: string }) {
  return (
    <Tooltip title={hint} describeChild arrow placement="top">
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ mb: 0.45, width: 'fit-content' }}
      >
        <Typography
          sx={{
            color: COLORS.textMuted,
            fontSize: 11,
            fontFamily: 'IBM Plex Mono, monospace',
          }}
        >
          {label}
        </Typography>
        <InfoOutlined sx={{ color: COLORS.textMuted, fontSize: 13 }} />
      </Stack>
    </Tooltip>
  );
}

function getOptionalNumber(value: number | undefined): number {
  return typeof value === 'number' ? value : 0;
}

function hasMetricNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

function getTodayDeliveryHelper(
  stats: CampaignsOverviewResponse['stats']
): string {
  const attemptedToday = getOptionalNumber(stats.attemptedToday);
  const failedToday = getOptionalNumber(stats.failedToday);
  const deliveredRateToday = getOptionalNumber(stats.deliveredRateToday);

  if (attemptedToday === 0) {
    return '0 finalized today';
  }

  return `${deliveredRateToday}% today · ${failedToday.toLocaleString('en-US')} failed`;
}

function getDeliveryRateHelper(
  stats: CampaignsOverviewResponse['stats']
): string {
  const deliveredTotal = getOptionalNumber(stats.deliveredTotal);
  const attemptedTotal = getOptionalNumber(stats.attemptedTotal);

  if (attemptedTotal === 0) {
    return '0 finalized deliveries';
  }

  return `${deliveredTotal.toLocaleString('en-US')} / ${attemptedTotal.toLocaleString('en-US')} finalized`;
}

function getCtrHelper(stats: CampaignsOverviewResponse['stats']): string {
  const openedTotal = getOptionalNumber(stats.openedTotal);

  return `${openedTotal.toLocaleString('en-US')} opened · ${formatPercentDelta(
    stats.ctrDeltaVsPrev7d
  )} vs prev 7d`;
}

function getQueuedHelper(stats: CampaignsOverviewResponse['stats']): string {
  return `${stats.reachInProgress.toLocaleString('en-US')} pending or sending`;
}

function formatFailureReason(reason: string): string {
  return reason
    .trim()
    .replace(/_/g, ' ')
    .replace(/([:;,.])(?=\S)/g, '$1 ')
    .replace(/\s+/g, ' ');
}

function formatFailureReasons(item: CampaignListItem): string | null {
  const reasons = item.progress.failureReasons ?? [];

  if (reasons.length === 0) {
    return null;
  }

  return reasons
    .map(
      (summary) =>
        `${formatFailureReason(summary.reason)}: ${summary.count.toLocaleString(
          'en-US'
        )}`
    )
    .join(' · ');
}

function getOutcomeHint(item: CampaignListItem): string {
  if (item.metric.label === 'goal') {
    if (item.metric.attributionMode === 'trace_required_response') {
      return 'Reached counts campaign starts where the expected user action can be linked back to a specific campaign message. Similar app activity that cannot be linked is shown only as a diagnostic.';
    }

    return 'Reached counts users who completed the expected action after entering this campaign.';
  }

  return 'CTR is the share of delivered campaign messages that users opened.';
}

const KPI_HINTS = {
  activeCampaigns:
    'Counts campaigns by status across all campaigns, not just the rows currently shown by filters.',
  deliveredToday:
    'Delivered today is messages successfully sent today. Failed today is messages that failed today.',
  deliveryRate:
    'Share of finished send attempts that were delivered instead of failed. Waiting and skipped messages are not included.',
  avgCtr:
    'Average share of delivered campaign messages that users opened.',
  queued:
    'Messages waiting to be sent or currently being sent.',
};

const ROW_HINTS = {
  audience:
    'People who match this campaign audience right now and can currently receive push messages.',
  timing:
    'The next time this campaign is expected to check users or send messages.',
  progress:
    'How far this campaign has moved through the messages it already created. The total can be higher than Audience now because it includes past users and past attempts.',
  progressCompletion:
    'Delivered messages compared with all message attempts created by this campaign.',
  audienceNow:
    'People who match the audience rules now and still have push notifications available.',
  delivered:
    'Messages successfully sent to users.',
  failed:
    'Messages that could not be sent successfully.',
  queued:
    'Messages waiting to be sent or being sent now.',
  skipped:
    'Messages the campaign decided not to send.',
  opened:
    'Delivered messages that users opened.',
  deliveryRate:
    'Share of finished send attempts that were delivered instead of failed.',
  ctr: 'Share of delivered campaign messages that users opened.',
  uniqueRecipients:
    'Different users who already had at least one message attempt in this campaign. This can be higher than Audience now if some users are no longer reachable.',
  journeyInstances:
    'How many times users started this campaign. If users can re-enter, the same user can count more than once.',
  deliveryRows:
    'Every message attempt created by this campaign, including delivered, failed, waiting, and skipped messages.',
  tracedGoalEvents:
    'Goal actions that can be linked back to a specific campaign message.',
  untracedMatchingEvents:
    'Matching user actions that happened after campaign entry but cannot be linked to a specific campaign message, so they are informational only.',
  sourceEventsWithoutUser:
    'Matching actions where the user was unknown, so the campaign cannot attribute them to a person.',
};

function InlineMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  const content = (
    <Stack spacing={0.15} sx={{ minWidth: 86 }}>
      <Typography
        sx={{
          color: COLORS.textMuted,
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 10,
          lineHeight: 1.25,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          color: COLORS.textPrimary,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );

  if (!hint) {
    return content;
  }

  return (
    <Tooltip title={hint} describeChild arrow placement="top">
      {content}
    </Tooltip>
  );
}

function FailureReasonsLine({ item }: { item: CampaignListItem }) {
  const failureReasons = formatFailureReasons(item);

  if (!failureReasons) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: '#2A2317',
        border: `1px solid ${COLORS.warning}44`,
        borderRadius: 1,
        mt: 1,
        px: 1,
        py: 0.85,
      }}
    >
      <Typography
        sx={{
          color: COLORS.warning,
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 10,
          lineHeight: 1.25,
          mb: 0.35,
        }}
      >
        Failure reasons
      </Typography>
      <Typography
        sx={{
          color: COLORS.textPrimary,
          fontSize: 11,
          lineHeight: 1.45,
          overflowWrap: 'anywhere',
        }}
      >
        {failureReasons}
      </Typography>
    </Box>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        sx={{
          color: COLORS.textMuted,
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 11,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
}

/**
 * Loads and renders the live campaigns overview page.
 */
export function CampaignsOverviewPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<CampaignStatus[]>(
    () => DEFAULT_SELECTED_STATUSES
  );
  const [selectedTriggerTypes, setSelectedTriggerTypes] = useState<
    CampaignEntryTriggerType[]
  >([]);
  const [selectedQuickView, setSelectedQuickView] =
    useState<CampaignQuickView | null>(null);
  const [statsPeriod, setStatsPeriod] =
    useState<CampaignStatsPeriod>('all_time');
  const [customStatsFrom, setCustomStatsFrom] = useState(() =>
    getDateInputValue(7)
  );
  const [customStatsTo, setCustomStatsTo] = useState(() =>
    getDateInputValue(0)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<CampaignsOverviewResponse | null>(
    null
  );

  const statsRangeParams = useMemo(() => {
    if (statsPeriod !== 'custom' || !customStatsFrom || !customStatsTo) {
      return {};
    }

    return {
      statsFrom: startOfLocalDateIso(customStatsFrom),
      statsTo: endOfLocalDateIso(customStatsTo),
    };
  }, [customStatsFrom, customStatsTo, statsPeriod]);

  useEffect(() => {
    let isActive = true;

    async function loadOverview() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await campaignsRepository.getCampaignsOverview({
          page: page + 1,
          limit: rowsPerPage,
          search,
          statuses: selectedStatuses,
          triggerTypes: selectedTriggerTypes,
          quickView: selectedQuickView,
          statsPeriod,
          ...statsRangeParams,
        });

        if (isActive) {
          setOverview(response);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load campaigns overview.'
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadOverview();

    return () => {
      isActive = false;
    };
  }, [
    page,
    rowsPerPage,
    search,
    selectedStatuses,
    selectedTriggerTypes,
    selectedQuickView,
    statsPeriod,
    statsRangeParams,
  ]);

  const stats = overview?.stats;

  const filtersSummary = useMemo(() => {
    return [
      selectedStatuses.length
        ? `${selectedStatuses.length} status filter(s)`
        : null,
      selectedTriggerTypes.length
        ? `${selectedTriggerTypes.length} type filter(s)`
        : null,
      selectedQuickView ? '1 quick view' : null,
      statsPeriod !== 'all_time'
        ? STATS_PERIOD_OPTIONS.find((option) => option.value === statsPeriod)
            ?.label
        : null,
    ]
      .filter(Boolean)
      .join(' · ');
  }, [selectedQuickView, selectedStatuses, selectedTriggerTypes, statsPeriod]);

  function toggleStatus(status: CampaignStatus) {
    setPage(0);
    setSelectedStatuses((current) =>
      current.includes(status)
        ? current.filter((value) => value !== status)
        : [...current, status]
    );
  }

  function toggleTrigger(triggerType: CampaignEntryTriggerType) {
    setPage(0);
    setSelectedTriggerTypes((current) =>
      current.includes(triggerType)
        ? current.filter((value) => value !== triggerType)
        : [...current, triggerType]
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.canvas }}>
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: 3, py: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              sx={{
                color: COLORS.textMuted,
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 12,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                mb: 1,
              }}
            >
              CRM orchestration / campaigns
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => router.push('/dashboard')}
                sx={{
                  borderColor: COLORS.stroke,
                  color: COLORS.textPrimary,
                  borderRadius: 999,
                }}
              >
                Back
              </Button>
              <Box>
                <Typography
                  sx={{
                    color: COLORS.textPrimary,
                    fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                    fontSize: 40,
                    fontWeight: 700,
                    lineHeight: 1.05,
                  }}
                >
                  Campaigns
                </Typography>
                <Typography
                  sx={{ color: COLORS.textSecondary, fontSize: 14, mt: 0.5 }}
                >
                  Overview, filters, and lifecycle monitoring for every campaign
                  in flight.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/dashboard/campaigns/new')}
            sx={{
              borderRadius: 999,
              bgcolor: COLORS.accent,
              px: 2.25,
              py: 1.1,
              '&:hover': { bgcolor: COLORS.scheduled },
            }}
          >
            New Campaign
          </Button>
        </Stack>

        {stats && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(5, minmax(0, 1fr))',
              },
              gap: 1.5,
              mb: 3,
            }}
          >
            <KpiCard
              eyebrow="Active campaigns"
              value={String(stats.activeCampaigns)}
              helper={`${stats.pausedCampaigns} paused · ${stats.scheduledCampaigns} scheduled`}
              hint={KPI_HINTS.activeCampaigns}
            />
            <KpiCard
              eyebrow="Delivered today"
              value={formatMetricValue(stats.sentToday)}
              helper={getTodayDeliveryHelper(stats)}
              hint={KPI_HINTS.deliveredToday}
            />
            <KpiCard
              eyebrow="Delivery rate"
              value={`${stats.deliveredRate}%`}
              helper={getDeliveryRateHelper(stats)}
              hint={KPI_HINTS.deliveryRate}
            />
            <KpiCard
              eyebrow="Avg CTR"
              value={`${stats.avgCtr}%`}
              helper={getCtrHelper(stats)}
              hint={KPI_HINTS.avgCtr}
            />
            <KpiCard
              eyebrow="Queued deliveries"
              value={formatMetricValue(stats.reachInProgress)}
              helper={getQueuedHelper(stats)}
              hint={KPI_HINTS.queued}
            />
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '252px minmax(0, 1fr)' },
            gap: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 5,
              bgcolor: COLORS.panel,
              border: `1px solid ${COLORS.stroke}`,
              alignSelf: 'start',
            }}
          >
            <Typography
              sx={{
                color: COLORS.textPrimary,
                fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                fontSize: 24,
                fontWeight: 700,
                mb: 0.75,
              }}
            >
              Campaign filters
            </Typography>
            <Typography
              sx={{
                color: COLORS.textSecondary,
                fontSize: 13,
                lineHeight: 1.5,
                mb: 2,
              }}
            >
              Narrow the list by status, trigger type, and quick views.
            </Typography>

            <TextField
              label="Search campaigns"
              placeholder="Search by name, goal, or owner"
              size="small"
              fullWidth
              value={search}
              onChange={(event) => {
                setPage(0);
                setSearch(event.target.value);
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: COLORS.soft,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <Search sx={{ color: COLORS.textMuted, mr: 1 }} />
                  ),
                },
              }}
            />

            <Stack spacing={2}>
              <FilterSection title="Status">
                {STATUS_OPTIONS.map((option) => {
                  const selected = selectedStatuses.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      variant="text"
                      onClick={() => toggleStatus(option.value)}
                      sx={{
                        justifyContent: 'space-between',
                        color: selected
                          ? COLORS.textPrimary
                          : COLORS.textSecondary,
                        bgcolor: selected ? COLORS.accentSoft : COLORS.soft,
                        border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
                        borderRadius: 3,
                        px: 1.5,
                        py: 1.1,
                      }}
                    >
                      <span>{option.label}</span>
                      {selected && (
                        <Chip
                          size="small"
                          label="On"
                          sx={{ bgcolor: COLORS.accent, color: '#fff' }}
                        />
                      )}
                    </Button>
                  );
                })}
              </FilterSection>

              <FilterSection title="Type">
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {TRIGGER_OPTIONS.map((option) => {
                    const selected = selectedTriggerTypes.includes(
                      option.value
                    );
                    return (
                      <Chip
                        key={option.value}
                        label={option.label}
                        clickable
                        onClick={() => toggleTrigger(option.value)}
                        sx={{
                          bgcolor: selected ? COLORS.accentSoft : COLORS.soft,
                          color: selected
                            ? COLORS.textPrimary
                            : COLORS.textSecondary,
                          border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
                          borderRadius: 999,
                        }}
                      />
                    );
                  })}
                </Stack>
              </FilterSection>

              <FilterSection title="Quick views">
                {QUICK_VIEW_OPTIONS.map((option) => {
                  const selected = selectedQuickView === option.value;
                  return (
                    <Button
                      key={option.value}
                      variant="text"
                      onClick={() => {
                        setPage(0);
                        setSelectedQuickView((current) =>
                          current === option.value ? null : option.value
                        );
                      }}
                      sx={{
                        alignItems: 'flex-start',
                        flexDirection: 'column',
                        color: selected
                          ? COLORS.textPrimary
                          : COLORS.textSecondary,
                        bgcolor: selected ? COLORS.accentSoft : COLORS.soft,
                        border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
                        borderRadius: 3,
                        px: 1.5,
                        py: 1.25,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 600, color: 'inherit' }}
                      >
                        {option.label}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 11, color: COLORS.textMuted, mt: 0.35 }}
                      >
                        {option.helper}
                      </Typography>
                    </Button>
                  );
                })}
              </FilterSection>

            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 5,
              bgcolor: COLORS.panel,
              border: `1px solid ${COLORS.stroke}`,
              minHeight: 640,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={1.5}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  sx={{
                    color: COLORS.textPrimary,
                    fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  Campaigns in flight
                </Typography>
                <Typography
                  sx={{
                    color: COLORS.textMuted,
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 11,
                    fontWeight: 500,
                    mt: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {overview
                    ? `${overview.total} result(s)${filtersSummary ? ` · ${filtersSummary}` : ''}`
                    : 'Loading results'}
                </Typography>
              </Box>
              <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
                Sorted by newest updates
              </Typography>
            </Stack>

            <Box
              sx={{
                alignItems: { xs: 'flex-start', lg: 'center' },
                bgcolor: '#1F1F1F',
                border: `1px solid ${COLORS.strokeSoft}`,
                borderRadius: 3,
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 1.25,
                justifyContent: 'space-between',
                mb: 2,
                px: 1.5,
                py: 1.15,
              }}
            >
              <Stack spacing={0.25}>
                <Typography
                  sx={{
                    color: COLORS.textMuted,
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Stats period
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 12 }}>
                  Applies to the numbers shown in the campaign rows.
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                alignItems="center"
                justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
              >
                {STATS_PERIOD_OPTIONS.map((option) => {
                  const selected = statsPeriod === option.value;
                  return (
                    <Chip
                      key={option.value}
                      label={option.label}
                      clickable
                      onClick={() => {
                        setPage(0);
                        setStatsPeriod(option.value);
                      }}
                      sx={{
                        bgcolor: selected ? COLORS.accentSoft : COLORS.soft,
                        color: selected
                          ? COLORS.textPrimary
                          : COLORS.textSecondary,
                        border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
                        borderRadius: 999,
                      }}
                    />
                  );
                })}
                {statsPeriod === 'custom' ? (
                  <>
                    <TextField
                      label="From"
                      type="date"
                      size="small"
                      value={customStatsFrom}
                      onChange={(event) => {
                        setPage(0);
                        setCustomStatsFrom(event.target.value);
                      }}
                      sx={{
                        width: 152,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: COLORS.soft,
                        },
                      }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      label="To"
                      type="date"
                      size="small"
                      value={customStatsTo}
                      onChange={(event) => {
                        setPage(0);
                        setCustomStatsTo(event.target.value);
                      }}
                      sx={{
                        width: 152,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: COLORS.soft,
                        },
                      }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </>
                ) : null}
              </Stack>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {isLoading && (
              <LinearProgress sx={{ mb: 2, bgcolor: COLORS.soft }} />
            )}

            <Stack spacing={1.5}>
              {overview?.items.map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    bgcolor: COLORS.soft,
                    border: `1px solid ${
                      item.status === 'active'
                        ? COLORS.accent
                        : COLORS.strokeSoft
                    }`,
                    transition: 'border-color 0.18s ease',
                    '&:hover': {
                      borderColor: COLORS.accent,
                    },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction={{ xs: 'column', lg: 'row' }}
                      justifyContent="space-between"
                      spacing={1.5}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            color: COLORS.textPrimary,
                            fontSize: 15,
                            fontWeight: 700,
                            mb: 0.25,
                            wordBreak: 'break-word',
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{ color: COLORS.textSecondary, fontSize: 13 }}
                        >
                          {item.goal}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        alignItems="center"
                        justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
                        sx={{ minWidth: { lg: 330 } }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          alignItems="center"
                        >
                          <Chip
                            label={item.status}
                            size="small"
                            sx={{
                              bgcolor: `${getStatusColor(item.status)}22`,
                              color: getStatusColor(item.status),
                              textTransform: 'capitalize',
                            }}
                          />
                          <Chip
                            label={item.entryTriggerType.replace(/_/g, ' ')}
                            size="small"
                            sx={{
                              bgcolor: '#171717',
                              color: COLORS.textSecondary,
                              textTransform: 'capitalize',
                            }}
                          />
                        </Stack>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit fontSize="small" />}
                          onClick={() =>
                            router.push(`/dashboard/campaigns/${item.id}`)
                          }
                          sx={{
                            borderColor: COLORS.stroke,
                            borderRadius: 2,
                            color: COLORS.textPrimary,
                            height: 32,
                            ml: { lg: 'auto' },
                            px: 1.25,
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: COLORS.accent,
                              bgcolor: COLORS.accentSoft,
                            },
                          }}
                        >
                          Edit
                        </Button>
                      </Stack>
                    </Stack>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: 'minmax(150px, 1fr) minmax(135px, 0.8fr) minmax(300px, 2.15fr) minmax(210px, 1.35fr)',
                        },
                        columnGap: 2.25,
                        rowGap: 1.75,
                        alignItems: 'start',
                      }}
                    >
                      <Box>
                        <MetricLabel
                          label="Audience"
                          hint={ROW_HINTS.audience}
                        />
                        <Typography
                          sx={{
                            color: COLORS.textPrimary,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {item.audience.label}
                        </Typography>
                        <Typography
                          sx={{ color: COLORS.textSecondary, fontSize: 12 }}
                        >
                          Current reach
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1.25}
                          flexWrap="wrap"
                          sx={{ mt: 0.8 }}
                        >
                          {hasMetricNumber(item.audience.currentEstimate) ? (
                            <InlineMetric
                              label="Audience now"
                              value={`${formatCount(
                                item.audience.currentEstimate
                              )} users`}
                              hint={ROW_HINTS.audienceNow}
                            />
                          ) : null}
                        </Stack>
                      </Box>

                      <Box>
                        <MetricLabel label="Timing" hint={ROW_HINTS.timing} />
                        <Typography
                          sx={{
                            color: COLORS.textPrimary,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {item.timing.label}
                        </Typography>
                        <Typography
                          sx={{ color: COLORS.textSecondary, fontSize: 12 }}
                        >
                          {formatTimestamp(item.timing.timestamp)}
                        </Typography>
                      </Box>

                      <Box>
                        <MetricLabel
                          label="Progress"
                          hint={ROW_HINTS.progress}
                        />
                        <Tooltip
                          title={ROW_HINTS.progressCompletion}
                          describeChild
                          arrow
                          placement="top"
                        >
                          <Typography
                            sx={{
                              color: COLORS.textPrimary,
                              fontSize: 13,
                              fontWeight: 600,
                              mb: 0.75,
                              width: 'fit-content',
                            }}
                          >
                            {hasMetricNumber(item.progress.sentCount) &&
                            hasMetricNumber(item.progress.totalCount)
                              ? `${formatCount(item.progress.sentCount)} / ${formatCount(
                                  item.progress.totalCount
                                )}`
                              : 'Progress unavailable'}
                          </Typography>
                        </Tooltip>
                        {hasMetricNumber(item.progress.progressPercent) ? (
                          <Tooltip
                            title={ROW_HINTS.progressCompletion}
                            describeChild
                            arrow
                            placement="top"
                          >
                            <LinearProgress
                              variant="determinate"
                              value={item.progress.progressPercent}
                              sx={{
                                height: 8,
                                borderRadius: 999,
                                bgcolor: '#171717',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 999,
                                  bgcolor: COLORS.accent,
                                },
                              }}
                            />
                          </Tooltip>
                        ) : null}
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: 'repeat(2, minmax(0, 1fr))',
                              sm: 'repeat(3, minmax(0, 1fr))',
                              md: 'repeat(3, minmax(0, 1fr))',
                            },
                            columnGap: 1.25,
                            rowGap: 0.9,
                            mt: 1,
                          }}
                        >
                          {hasMetricNumber(item.progress.sentCount) ? (
                            <InlineMetric
                              label="Delivered"
                              value={formatCount(item.progress.sentCount)}
                              hint={ROW_HINTS.delivered}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.failedCount) ? (
                            <InlineMetric
                              label="Failed"
                              value={formatCount(item.progress.failedCount)}
                              hint={ROW_HINTS.failed}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.inProgressCount) ? (
                            <InlineMetric
                              label="Queued"
                              value={formatCount(item.progress.inProgressCount)}
                              hint={ROW_HINTS.queued}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.skippedCount) ? (
                            <InlineMetric
                              label="Skipped"
                              value={formatCount(item.progress.skippedCount)}
                              hint={ROW_HINTS.skipped}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.openCount) ? (
                            <InlineMetric
                              label="Opened"
                              value={formatCount(item.progress.openCount)}
                              hint={ROW_HINTS.opened}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.deliveredRate) ? (
                            <InlineMetric
                              label="Delivery rate"
                              value={`${item.progress.deliveredRate}%`}
                              hint={ROW_HINTS.deliveryRate}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.ctr) ? (
                            <InlineMetric
                              label="CTR"
                              value={`${item.progress.ctr}%`}
                              hint={ROW_HINTS.ctr}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.uniqueRecipientCount) ? (
                            <InlineMetric
                              label="Users with messages"
                              value={formatCount(
                                item.progress.uniqueRecipientCount
                              )}
                              hint={ROW_HINTS.uniqueRecipients}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.journeyInstanceCount) ? (
                            <InlineMetric
                              label="Campaign starts"
                              value={formatCount(
                                item.progress.journeyInstanceCount
                              )}
                              hint={ROW_HINTS.journeyInstances}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.deliveryRowCount) ? (
                            <InlineMetric
                              label="Message attempts"
                              value={formatCount(item.progress.deliveryRowCount)}
                              hint={ROW_HINTS.deliveryRows}
                            />
                          ) : null}
                        </Box>
                        <FailureReasonsLine item={item} />
                      </Box>

                      <Box>
                        <MetricLabel
                          label="Outcome"
                          hint={getOutcomeHint(item)}
                        />
                        <Typography
                          sx={{
                            color: COLORS.textPrimary,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {item.metric.value}
                        </Typography>
                        {item.metric.detail ? (
                          <Typography
                            sx={{
                              color: COLORS.textSecondary,
                              fontSize: 12,
                              mt: 0.35,
                            }}
                          >
                            {item.metric.detail}
                          </Typography>
                        ) : null}
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: 'repeat(2, minmax(0, 1fr))',
                              md: '1fr',
                              xl: 'repeat(2, minmax(0, 1fr))',
                            },
                            columnGap: 1.25,
                            rowGap: 0.9,
                            mt: 1,
                          }}
                        >
                          {hasMetricNumber(item.metric.traceGoalEventCount) ? (
                            <InlineMetric
                              label="Traced goal events"
                              value={formatCount(
                                item.metric.traceGoalEventCount
                              )}
                              hint={ROW_HINTS.tracedGoalEvents}
                            />
                          ) : null}
                          {hasMetricNumber(
                            item.metric.untracedGoalEventCount
                          ) ? (
                            <InlineMetric
                              label="Untraced matching events"
                              value={formatCount(
                                item.metric.untracedGoalEventCount
                              )}
                              hint={ROW_HINTS.untracedMatchingEvents}
                            />
                          ) : null}
                          {hasMetricNumber(
                            item.metric.sourceEventsWithoutUserCount
                          ) ? (
                            <InlineMetric
                              label="Source events without user"
                              value={formatCount(
                                item.metric.sourceEventsWithoutUserCount
                              )}
                              hint={ROW_HINTS.sourceEventsWithoutUser}
                            />
                          ) : null}
                        </Box>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ mt: 0.8 }}
                          flexWrap="wrap"
                        >
                          {getLocaleReadinessEntries(item).map(
                            ([locale, readiness]) => (
                              <Chip
                                key={locale}
                                label={`${locale.toUpperCase()} · ${readiness}`}
                                size="small"
                                sx={{
                                  bgcolor: `${getReadinessColor(readiness)}22`,
                                  color: getReadinessColor(readiness),
                                }}
                              />
                            )
                          )}
                        </Stack>
                      </Box>
                    </Box>

                    <Divider sx={{ borderColor: COLORS.strokeSoft }} />

                    <Typography
                      sx={{
                        color: COLORS.textSecondary,
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: 11,
                      }}
                    >
                      Owner: {item.owner.ownerName} · {item.owner.activityLabel}
                    </Typography>
                  </Stack>
                </Paper>
              ))}

              {!isLoading && overview && overview.items.length === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: COLORS.soft,
                    border: `1px dashed ${COLORS.stroke}`,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      color: COLORS.textPrimary,
                      fontSize: 18,
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    No campaigns match the current filters
                  </Typography>
                  <Typography
                    sx={{ color: COLORS.textSecondary, fontSize: 14 }}
                  >
                    Reset one of the left-rail filters or start a fresh
                    campaign.
                  </Typography>
                </Paper>
              )}
            </Stack>

            <TablePagination
              component="div"
              count={overview?.total ?? 0}
              page={page}
              onPageChange={(_event, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setPage(0);
                setRowsPerPage(Number(event.target.value));
              }}
              rowsPerPageOptions={PAGE_SIZE_OPTIONS}
              sx={{
                mt: 2,
                borderTop: `1px solid ${COLORS.stroke}`,
                color: COLORS.textSecondary,
              }}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default CampaignsOverviewPage;
