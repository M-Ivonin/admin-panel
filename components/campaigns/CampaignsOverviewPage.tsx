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
import { Add, ArrowBack, InfoOutlined, Search } from '@mui/icons-material';
import type {
  CampaignEntryTriggerType,
  CampaignListItem,
  CampaignLocale,
  CampaignQuickView,
  CampaignStatus,
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

function formatCampaignDeliveryBreakdown(item: CampaignListItem): string {
  const sent = item.progress.sentCount;

  if (!hasMetricNumber(sent)) {
    return 'Delivery breakdown unavailable';
  }

  const parts = [`${sent.toLocaleString('en-US')} delivered`];

  if (hasMetricNumber(item.progress.failedCount)) {
    parts.push(`${item.progress.failedCount.toLocaleString('en-US')} failed`);
  }

  if (hasMetricNumber(item.progress.inProgressCount)) {
    parts.push(
      `${item.progress.inProgressCount.toLocaleString('en-US')} queued`
    );
  }

  if (hasMetricNumber(item.progress.skippedCount)) {
    parts.push(`${item.progress.skippedCount.toLocaleString('en-US')} skipped`);
  }

  if (hasMetricNumber(item.progress.openCount)) {
    parts.push(`${item.progress.openCount.toLocaleString('en-US')} opened`);
  }

  if (hasMetricNumber(item.progress.deliveredRate)) {
    parts.push(`${item.progress.deliveredRate}% delivery rate`);
  }

  if (hasMetricNumber(item.progress.ctr)) {
    parts.push(`${item.progress.ctr}% CTR`);
  }

  return parts.join(' · ');
}

function formatFailureReason(reason: string): string {
  return reason.replace(/_/g, ' ');
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
      return 'Goal reach counts journeys where the configured goal event came back with this push delivery trace id. Regular app activity without a trace is not counted here.';
    }

    return 'Goal reach counts journeys where the configured user-level goal event happened after the journey started.';
  }

  return 'CTR is opened deliveries divided by delivered push notifications for this campaign.';
}

const KPI_HINTS = {
  activeCampaigns:
    'Campaign status counts come from persisted campaign rows and are not affected by the current list filters.',
  deliveredToday:
    'Delivered today counts live push deliveries with sent_at today. Failed today counts currently failed live rows last updated today.',
  deliveryRate:
    'Delivery rate is lifetime live delivered deliveries divided by delivered plus failed deliveries. Pending and skipped rows are not included.',
  avgCtr:
    'Average CTR is lifetime opened live deliveries divided by delivered live push notifications.',
  queued:
    'Queued deliveries are live campaign delivery rows that are still pending or currently being sent.',
};

const ROW_HINTS = {
  audience:
    'Audience is the saved estimate from the latest campaign definition. Current eligibility can change as users move retention stage or lose push eligibility.',
  timing:
    'Timing shows the next planned evaluation or delivery checkpoint stored for the campaign runtime.',
  progress:
    'Delivery progress for materialized live journey rows. Total includes delivered, failed, queued, and skipped deliveries, so it can be higher than the current audience estimate.',
  savedEstimate:
    'Saved estimate is the audience size captured when the campaign definition was last estimated.',
  audienceNow:
    'Audience now is a fresh reachability estimate using the current audience rules and push eligibility.',
  deliveryRate:
    'Delivery rate is delivered rows divided by delivered plus failed rows for this campaign.',
  ctr: 'CTR is opened live deliveries divided by delivered live deliveries for this campaign.',
  journeyInstances:
    'Journey instances count unique recipient and journey keys that have live materialized rows.',
  tracedGoalEvents:
    'Traced goal events are matching source events that include the delivery trace id for this campaign.',
  untracedMatchingEvents:
    'Untraced matching events have the same goal event key after journey start but no delivery trace id, so they are diagnostics only.',
  sourceEventsWithoutUser:
    'Source events without user id have the same goal event key but cannot be attributed to a recipient.',
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
    <Typography
      sx={{
        color: COLORS.warning,
        fontSize: 11,
        mt: 0.85,
        lineHeight: 1.45,
      }}
    >
      Failure reasons: {failureReasons}
    </Typography>
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<CampaignsOverviewResponse | null>(
    null
  );

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
    ]
      .filter(Boolean)
      .join(' · ');
  }, [selectedQuickView, selectedStatuses, selectedTriggerTypes]);

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
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/dashboard/campaigns/${item.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(`/dashboard/campaigns/${item.id}`);
                    }
                  }}
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
                    cursor: 'pointer',
                    transition: 'transform 0.18s ease, border-color 0.18s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
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

                      <Stack direction="row" spacing={1} flexWrap="wrap">
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
                    </Stack>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: 'repeat(4, minmax(0, 1fr))',
                        },
                        gap: 1.25,
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
                          Reach diagnostics
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1.25}
                          flexWrap="wrap"
                          sx={{ mt: 0.8 }}
                        >
                          {hasMetricNumber(item.audience.estimate) ? (
                            <InlineMetric
                              label="Saved estimate"
                              value={`${formatCount(
                                item.audience.estimate
                              )} users`}
                              hint={ROW_HINTS.savedEstimate}
                            />
                          ) : null}
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
                        <Typography
                          sx={{
                            color: COLORS.textPrimary,
                            fontSize: 13,
                            fontWeight: 600,
                            mb: 0.75,
                          }}
                        >
                          {hasMetricNumber(item.progress.sentCount) &&
                          hasMetricNumber(item.progress.totalCount)
                            ? `${formatCount(item.progress.sentCount)} / ${formatCount(
                                item.progress.totalCount
                              )}`
                            : 'Progress unavailable'}
                        </Typography>
                        {hasMetricNumber(item.progress.progressPercent) ? (
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
                        ) : null}
                        <Typography
                          sx={{
                            color: COLORS.textSecondary,
                            fontSize: 11,
                            mt: 0.65,
                            lineHeight: 1.45,
                          }}
                        >
                          {formatCampaignDeliveryBreakdown(item)}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1.25}
                          flexWrap="wrap"
                          sx={{ mt: 0.85 }}
                        >
                          {hasMetricNumber(item.progress.sentCount) ? (
                            <InlineMetric
                              label="Delivered"
                              value={formatCount(item.progress.sentCount)}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.failedCount) ? (
                            <InlineMetric
                              label="Failed"
                              value={formatCount(item.progress.failedCount)}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.inProgressCount) ? (
                            <InlineMetric
                              label="Queued"
                              value={formatCount(item.progress.inProgressCount)}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.skippedCount) ? (
                            <InlineMetric
                              label="Skipped"
                              value={formatCount(item.progress.skippedCount)}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.openCount) ? (
                            <InlineMetric
                              label="Opened"
                              value={formatCount(item.progress.openCount)}
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
                              label="Unique recipients"
                              value={formatCount(
                                item.progress.uniqueRecipientCount
                              )}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.journeyInstanceCount) ? (
                            <InlineMetric
                              label="Journey instances"
                              value={formatCount(
                                item.progress.journeyInstanceCount
                              )}
                              hint={ROW_HINTS.journeyInstances}
                            />
                          ) : null}
                          {hasMetricNumber(item.progress.deliveryRowCount) ? (
                            <InlineMetric
                              label="Delivery rows"
                              value={formatCount(item.progress.deliveryRowCount)}
                            />
                          ) : null}
                        </Stack>
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
                        <Stack
                          direction="row"
                          spacing={1.25}
                          flexWrap="wrap"
                          sx={{ mt: 0.85 }}
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
                        </Stack>
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
