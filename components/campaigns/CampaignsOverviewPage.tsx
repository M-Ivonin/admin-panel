'use client';

/**
 * Renders the campaigns overview screen with KPI cards, filters, and list state.
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
  Typography,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Search,
} from '@mui/icons-material';
import type {
  CampaignEntryTriggerType,
  CampaignListItem,
  CampaignQuickView,
  CampaignStatus,
  CampaignsOverviewResponse,
} from '@/modules/campaigns/contracts';
import { mockCampaignsRepository } from '@/modules/campaigns/mock-repository';

const PAGE_SIZE_OPTIONS = [4, 8, 12];

const STATUS_OPTIONS: Array<{ value: CampaignStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
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

function formatMetricValue(value: number, suffix?: string): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k${suffix ?? ''}`;
  }

  return `${value}${suffix ?? ''}`;
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

function getReadinessColor(readiness: CampaignListItem['localeReadiness'][keyof CampaignListItem['localeReadiness']]): string {
  if (readiness === 'ready') {
    return COLORS.success;
  }

  if (readiness === 'warning') {
    return COLORS.warning;
  }

  return COLORS.danger;
}

function KpiCard({
  eyebrow,
  value,
  helper,
}: {
  eyebrow: string;
  value: string;
  helper: string;
}) {
  return (
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
      <Typography
        sx={{
          color: COLORS.textMuted,
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 11,
          fontWeight: 500,
          mb: 0.75,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {eyebrow}
      </Typography>
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
 * Loads and renders the mock-backed campaigns overview page.
 */
export function CampaignsOverviewPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<CampaignStatus[]>([]);
  const [selectedTriggerTypes, setSelectedTriggerTypes] = useState<
    CampaignEntryTriggerType[]
  >([]);
  const [selectedQuickView, setSelectedQuickView] =
    useState<CampaignQuickView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<CampaignsOverviewResponse | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadOverview() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await mockCampaignsRepository.getCampaignsOverview({
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
              : 'Failed to load campaigns overview.',
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
  }, [page, rowsPerPage, search, selectedStatuses, selectedTriggerTypes, selectedQuickView]);

  const stats = overview?.stats;

  const filtersSummary = useMemo(() => {
    return [
      selectedStatuses.length ? `${selectedStatuses.length} status filter(s)` : null,
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
        : [...current, status],
    );
  }

  function toggleTrigger(triggerType: CampaignEntryTriggerType) {
    setPage(0);
    setSelectedTriggerTypes((current) =>
      current.includes(triggerType)
        ? current.filter((value) => value !== triggerType)
        : [...current, triggerType],
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.canvas }}>
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: 3, py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
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
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 14, mt: 0.5 }}>
                  Overview, filters, and lifecycle monitoring for every campaign in flight.
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
                xl: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1.5,
              mb: 3,
            }}
          >
            <KpiCard
              eyebrow="Active campaigns"
              value={String(stats.activeCampaigns)}
              helper={`${stats.pausedCampaigns} paused · ${stats.scheduledCampaigns} scheduled`}
            />
            <KpiCard
              eyebrow="Sent today"
              value={formatMetricValue(stats.sentToday)}
              helper={`${stats.deliveredRate}% delivered`}
            />
            <KpiCard
              eyebrow="Avg CTR"
              value={`${stats.avgCtr}%`}
              helper={`+${stats.ctrDeltaVsPrev7d}% vs last 7 days`}
            />
            <KpiCard
              eyebrow="Reach in progress"
              value={formatMetricValue(stats.reachInProgress)}
              helper="users currently inside active flows"
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
            <Typography sx={{ color: COLORS.textSecondary, fontSize: 13, lineHeight: 1.5, mb: 2 }}>
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
                  startAdornment: <Search sx={{ color: COLORS.textMuted, mr: 1 }} />,
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
                        color: selected ? COLORS.textPrimary : COLORS.textSecondary,
                        bgcolor: selected ? COLORS.accentSoft : COLORS.soft,
                        border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
                        borderRadius: 3,
                        px: 1.5,
                        py: 1.1,
                      }}
                    >
                      <span>{option.label}</span>
                      {selected && <Chip size="small" label="On" sx={{ bgcolor: COLORS.accent, color: '#fff' }} />}
                    </Button>
                  );
                })}
              </FilterSection>

              <FilterSection title="Type">
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {TRIGGER_OPTIONS.map((option) => {
                    const selected = selectedTriggerTypes.includes(option.value);
                    return (
                      <Chip
                        key={option.value}
                        label={option.label}
                        clickable
                        onClick={() => toggleTrigger(option.value)}
                        sx={{
                          bgcolor: selected ? COLORS.accentSoft : COLORS.soft,
                          color: selected ? COLORS.textPrimary : COLORS.textSecondary,
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
                          current === option.value ? null : option.value,
                        );
                      }}
                      sx={{
                        alignItems: 'flex-start',
                        flexDirection: 'column',
                        color: selected ? COLORS.textPrimary : COLORS.textSecondary,
                        bgcolor: selected ? COLORS.accentSoft : COLORS.soft,
                        border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
                        borderRadius: 3,
                        px: 1.5,
                        py: 1.25,
                      }}
                    >
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'inherit' }}>
                        {option.label}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: COLORS.textMuted, mt: 0.35 }}>
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

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {isLoading && <LinearProgress sx={{ mb: 2, bgcolor: COLORS.soft }} />}

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
                    bgcolor:
                      item.status === 'active' ? COLORS.accentSoft : COLORS.soft,
                    border: `1px solid ${
                      item.status === 'active' ? COLORS.accent : COLORS.strokeSoft
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
                        <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
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
                        <Typography sx={{ color: COLORS.textMuted, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', mb: 0.45 }}>
                          Audience
                        </Typography>
                        <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 600 }}>
                          {item.audience.label}
                        </Typography>
                        <Typography sx={{ color: COLORS.textSecondary, fontSize: 12 }}>
                          {item.audience.estimate?.toLocaleString('en-US') ?? '0'} users
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ color: COLORS.textMuted, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', mb: 0.45 }}>
                          Timing
                        </Typography>
                        <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 600 }}>
                          {item.timing.label}
                        </Typography>
                        <Typography sx={{ color: COLORS.textSecondary, fontSize: 12 }}>
                          {formatTimestamp(item.timing.timestamp)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ color: COLORS.textMuted, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', mb: 0.45 }}>
                          Progress
                        </Typography>
                        <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 600, mb: 0.75 }}>
                          {(item.progress.sentCount ?? 0).toLocaleString('en-US')} / {(item.progress.totalCount ?? 0).toLocaleString('en-US')}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={item.progress.progressPercent ?? 0}
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
                      </Box>

                      <Box>
                        <Typography sx={{ color: COLORS.textMuted, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', mb: 0.45 }}>
                          Outcome
                        </Typography>
                        <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 600 }}>
                          {item.metric.value}
                        </Typography>
                        <Stack direction="row" spacing={0.75} sx={{ mt: 0.8 }} flexWrap="wrap">
                          {(Object.keys(item.localeReadiness) as Array<keyof CampaignListItem['localeReadiness']>).map(
                            (locale) => (
                              <Chip
                                key={locale}
                                label={`${locale.toUpperCase()} · ${item.localeReadiness[locale]}`}
                                size="small"
                                sx={{
                                  bgcolor: `${getReadinessColor(item.localeReadiness[locale])}22`,
                                  color: getReadinessColor(item.localeReadiness[locale]),
                                }}
                              />
                            ),
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
                  <Typography sx={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 600, mb: 1 }}>
                    No campaigns match the current filters
                  </Typography>
                  <Typography sx={{ color: COLORS.textSecondary, fontSize: 14 }}>
                    Reset one of the left-rail filters or start a fresh campaign.
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
