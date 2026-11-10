'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Link,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Download, ExpandMore, MouseOutlined } from '@mui/icons-material';
import {
  getAppPartnerAnalytics,
  getAppPartnerAnalyticsCsv,
} from '@/lib/api/app-partner-campaigns';
import type { PartnerMarketConfig } from '@/modules/partner-market-configs/types';
import {
  appPartnerPlacements,
  appPartnerPlatforms,
  placementLabels,
  platformLabels,
  type AppPartnerAnalytics,
  type AppPartnerAnalyticsFilters,
  type AppPartnerCampaign,
} from '@/modules/app-partner-campaigns/types';

const detailGroups = [
  {
    title: 'Reach and attribution',
    metrics: [
      ['uniqueViewers', 'Unique viewers'],
      ['linkedClicks', 'Impression-linked taps'],
      ['linkedClickers', 'Unique linked clickers'],
      ['earlyClicks', 'Early taps'],
    ],
  },
  {
    title: 'Delivery issues',
    metrics: [
      ['blockedClicks', 'Blocked resolutions'],
    ],
  },
] as const;

const filterGrid = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(3, minmax(0, 1fr))',
  },
  '@media (min-width: 375px) and (max-width: 599px)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  gap: { xs: 1.5, sm: 2 },
  '& > *': { minWidth: 0 },
};

const disclosureSx = {
  '& > summary': {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    cursor: 'pointer',
    width: 'fit-content',
    listStyle: 'none',
    '&::-webkit-details-marker': { display: 'none' },
    '&:hover': { color: 'text.primary' },
  },
  '&[open] > summary .MuiSvgIcon-root': { transform: 'rotate(180deg)' },
};

const optionalFilters = [
  { key: 'countryCode', label: 'Country code' },
  { key: 'regionCode', label: 'State or region' },
  { key: 'minimumAge', label: 'Effective age floor', numeric: true },
  { key: 'sessionOrdinal', label: 'Session ordinal', numeric: true },
  { key: 'creativeVersion', label: 'Displayed version' },
  { key: 'userId', label: 'User ID' },
] as const;

const accessLabels = {
  free: 'Free',
  pass_24h: '24-hour pass',
  pass_3d: '3-day pass',
  monthly: 'Monthly subscription',
  annual: 'Annual subscription',
  other: 'Other access',
  unresolved: 'Unresolved',
};

const dayMs = 86_400_000;
const maxRangeMs = 30 * dayMs;

export function CampaignAnalyticsPanel({
  campaigns,
  markets,
}: {
  campaigns: AppPartnerCampaign[];
  markets: PartnerMarketConfig[];
}) {
  const [draft, setDraft] = useState<AppPartnerAnalyticsFilters>({});
  const [{ filters: appliedFilters, query: applied }, setApplied] = useState<{
    filters: AppPartnerAnalyticsFilters;
    query: AppPartnerAnalyticsFilters;
  }>(() => ({ filters: {}, query: queryWithRange({}) }));
  const [report, setReport] = useState<AppPartnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getAppPartnerAnalytics(applied)
      .then((result) => {
        if (active) setReport(result);
      })
      .catch((caught: unknown) => {
        if (active) setError(messageOf(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applied]);

  const set = <K extends keyof AppPartnerAnalyticsFilters>(
    key: K,
    value: AppPartnerAnalyticsFilters[K]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const hasChanges = Object.keys({ ...draft, ...appliedFilters }).some(
    (key) => {
      const filter = key as keyof AppPartnerAnalyticsFilters;
      return (draft[filter] ?? '') !== (appliedFilters[filter] ?? '');
    }
  );
  const canReset =
    Object.values(draft).some(Boolean) ||
    Object.values(appliedFilters).some(Boolean);
  const appliedMarket = markets.find(
    (item) => item.id === applied.operatorMarketId
  );
  const appliedLabels = [
    applied.campaignId &&
      `Campaign: ${campaigns.find((item) => item.id === applied.campaignId)?.name ?? applied.campaignId}`,
    applied.operatorMarketId &&
      `Market: ${appliedMarket ? marketLabel(appliedMarket) : applied.operatorMarketId}`,
    applied.placement && `Placement: ${placementLabels[applied.placement]}`,
    applied.platform && `Platform: ${platformLabels[applied.platform]}`,
    applied.accessType &&
      `Access: ${accessLabels[applied.accessType as keyof typeof accessLabels] ?? applied.accessType}`,
    applied.countryCode && `Country: ${applied.countryCode}`,
    applied.regionCode && `Region: ${applied.regionCode}`,
    applied.minimumAge && `Age floor: ${applied.minimumAge}`,
    applied.sessionOrdinal && `Session: ${applied.sessionOrdinal}`,
    applied.creativeVersion && `Version: ${applied.creativeVersion}`,
    applied.userId && `User: ${applied.userId}`,
  ].filter(Boolean);

  function apply(filters: AppPartnerAnalyticsFilters) {
    try {
      const query = queryWithRange(filters);
      setLoading(true);
      setReport(null);
      setError(null);
      setExportError(null);
      setApplied({ filters, query });
    } catch (caught) {
      setError(messageOf(caught));
      return;
    }
  }
  async function exportCsv() {
    setExportError(null);
    setExporting(true);
    try {
      const blob = await getAppPartnerAnalyticsCsv(applied);
      const url = URL.createObjectURL(blob);
      try {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'app-partner-ad-clicks.csv';
        anchor.click();
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (caught) {
      setExportError(messageOf(caught));
    } finally {
      setExporting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              gap={1}
              alignItems="baseline"
              flexWrap="wrap"
            >
              <Typography component="h2" variant="subtitle1" fontWeight={700}>
                Report filters
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Leave dates blank for the last 30 days · UTC
              </Typography>
            </Stack>
            <Box sx={filterGrid}>
              <TextField
                size="small"
                label="From date (UTC)"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={draft.from ?? ''}
                onChange={(event) => set('from', event.target.value)}
              />
              <TextField
                size="small"
                label="Through date (UTC)"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={draft.to ?? ''}
                onChange={(event) => set('to', event.target.value)}
              />
              <TextField
                size="small"
                select
                slotProps={{
                  inputLabel: { shrink: true },
                  select: { displayEmpty: true },
                }}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
                label="Campaign"
                value={draft.campaignId ?? ''}
                onChange={(event) => set('campaignId', event.target.value)}
              >
                <MenuItem value="">All campaigns</MenuItem>
                {campaigns.map((campaign) => (
                  <MenuItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                select
                slotProps={{
                  inputLabel: { shrink: true },
                  select: { displayEmpty: true },
                }}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
                label="Operator market"
                value={draft.operatorMarketId ?? ''}
                onChange={(event) =>
                  set('operatorMarketId', event.target.value)
                }
              >
                <MenuItem value="">All markets</MenuItem>
                {markets.map((market) => (
                  <MenuItem key={market.id} value={market.id}>
                    {marketLabel(market)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                select
                slotProps={{
                  inputLabel: { shrink: true },
                  select: { displayEmpty: true },
                }}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
                label="Placement"
                value={draft.placement ?? ''}
                onChange={(event) =>
                  set(
                    'placement',
                    event.target
                      .value as AppPartnerAnalyticsFilters['placement']
                  )
                }
              >
                <MenuItem value="">All placements</MenuItem>
                {appPartnerPlacements.map((placement) => (
                  <MenuItem key={placement} value={placement}>
                    {placementLabels[placement]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                select
                slotProps={{
                  inputLabel: { shrink: true },
                  select: { displayEmpty: true },
                }}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
                label="Platform"
                value={draft.platform ?? ''}
                onChange={(event) =>
                  set(
                    'platform',
                    event.target.value as AppPartnerAnalyticsFilters['platform']
                  )
                }
              >
                <MenuItem value="">All platforms</MenuItem>
                {appPartnerPlatforms.map((platform) => (
                  <MenuItem key={platform} value={platform}>
                    {platformLabels[platform]}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box component="details" sx={disclosureSx}>
              <Typography
                component="summary"
                variant="body2"
                color="text.secondary"
              >
                <ExpandMore fontSize="small" />
                More filters
              </Typography>
              <Box sx={{ ...filterGrid, mt: 2 }}>
                <TextField
                  size="small"
                  select
                  slotProps={{
                    inputLabel: { shrink: true },
                    select: { displayEmpty: true },
                  }}
                  sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
                  label="Access type"
                  value={draft.accessType ?? ''}
                  onChange={(event) => set('accessType', event.target.value)}
                >
                  <MenuItem value="">All access types</MenuItem>
                  {Object.entries(accessLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                {optionalFilters.map((filter) => (
                  <TextField
                    size="small"
                    key={filter.key}
                    label={filter.label}
                    slotProps={{ inputLabel: { shrink: true } }}
                    type={'numeric' in filter ? 'number' : 'text'}
                    value={draft[filter.key] ?? ''}
                    onChange={(event) => set(filter.key, event.target.value)}
                  />
                ))}
              </Box>
            </Box>
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              <Button
                variant="contained"
                disabled={loading || exporting}
                onClick={() => apply(draft)}
              >
                Apply filters
              </Button>
              <Button
                color="inherit"
                disabled={!canReset || loading || exporting}
                onClick={() => {
                  setDraft({});
                  apply({});
                }}
              >
                Reset filters
              </Button>
              {hasChanges ? (
                <Typography
                  variant="caption"
                  color="warning.main"
                  role="status"
                >
                  Unapplied changes
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? (
        <Stack direction="row" gap={1} alignItems="center" role="status">
          <CircularProgress size={20} />
          <Typography>Loading app partner analytics…</Typography>
        </Stack>
      ) : null}
      {report ? (
        <>
          <Stack
            component="section"
            spacing={1.5}
            aria-labelledby="campaign-summary"
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'baseline' }}
              gap={0.5}
            >
              <Typography id="campaign-summary" component="h2" variant="h6">
                Campaign performance
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatRange(
                  applied,
                  Boolean(appliedFilters.from || appliedFilters.to)
                )}
              </Typography>
            </Stack>
            {appliedLabels.length > 0 ? (
              <Stack direction="row" gap={0.75} useFlexGap flexWrap="wrap">
                {appliedLabels.map((label) => (
                  <Chip
                    key={label}
                    size="small"
                    variant="outlined"
                    label={label}
                    title={label}
                  />
                ))}
              </Stack>
            ) : null}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              <MetricCard
                label="Qualified impressions"
                value={count(report.summary.impressions)}
                note={`${count(report.summary.uniqueViewers)} unique viewers`}
              />
              <MetricCard
                label="Deliberate taps"
                value={count(report.summary.clicks)}
                note={`${count(report.summary.linkedClicks)} linked to an impression`}
              />
              <MetricCard
                label="Impression CTR"
                value={ctr(
                  report.summary.linkedClicks,
                  report.summary.impressions
                )}
                note={`${count(report.summary.linkedClicks)} linked taps / ${count(report.summary.impressions)} impressions`}
              />
              <MetricCard
                label="Unique viewer CTR"
                value={ctr(
                  report.summary.linkedClickers,
                  report.summary.uniqueViewers
                )}
                note={`${count(report.summary.linkedClickers)} linked clickers / ${count(report.summary.uniqueViewers)} viewers`}
              />
            </Box>
            <Card variant="outlined" sx={{ px: 2, py: 1.25 }}>
              <Box component="details" sx={disclosureSx}>
                <Typography
                  component="summary"
                  variant="body2"
                  color="text.secondary"
                >
                  <ExpandMore fontSize="small" />
                  Metric details
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(3, minmax(0, 1fr))',
                    },
                  }}
                >
                  {detailGroups.map(({ title, metrics }) => (
                    <Box key={title}>
                      <Typography
                        component="h3"
                        variant="subtitle2"
                        gutterBottom
                      >
                        {title}
                      </Typography>
                      <Stack component="dl" spacing={0.5} sx={{ m: 0 }}>
                        {metrics.map(([key, label]) => (
                          <Stack
                            key={key}
                            direction="row"
                            justifyContent="space-between"
                            gap={1}
                          >
                            <Typography
                              component="dt"
                              variant="body2"
                              color="text.secondary"
                            >
                              {label}
                            </Typography>
                            <Typography
                              component="dd"
                              variant="body2"
                              sx={{ m: 0, fontVariantNumeric: 'tabular-nums' }}
                            >
                              {count(report.summary[key])}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  An impression counts once the placement meets its visibility
                  threshold. CTR only counts taps linked to a qualified
                  impression. Early taps are counted separately.
                </Typography>
              </Box>
            </Card>
          </Stack>
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                gap={1.5}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography component="h2" variant="h6">
                    Click timeline
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {count(report.clicks.length)} shown · Up to 250 here or
                    5,000 in CSV
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={<Download />}
                  disabled={exporting}
                  title="Export clicks using the applied filters"
                  onClick={() => void exportCsv()}
                >
                  {exporting ? 'Exporting…' : 'Export CSV'}
                </Button>
              </Stack>
              {exportError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {exportError}
                </Alert>
              ) : null}
              {report.clicks.length === 0 ? (
                <Stack
                  alignItems="center"
                  textAlign="center"
                  spacing={0.5}
                  py={3}
                >
                  <MouseOutlined color="disabled" />
                  <Typography variant="subtitle2">
                    No clicks in this report
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try a different date range or reset your filters.
                  </Typography>
                </Stack>
              ) : (
                <TableContainer
                  tabIndex={0}
                  aria-label="Scrollable click timeline"
                >
                  <Table
                    size="small"
                    aria-label="App partner click timeline"
                    sx={{
                      minWidth: 900,
                      '& th': { bgcolor: 'action.hover', fontWeight: 700 },
                      '& td': { verticalAlign: 'top' },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        {[
                          'Time (UTC)',
                          'User',
                          'Campaign / placement',
                          'Audience',
                          'Version',
                          'Resolution',
                          'Context',
                        ].map((label) => (
                          <TableCell key={label}>{label}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.clicks.map((click) => (
                        <TableRow key={click.tapId} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {click.occurredAt.slice(0, 19).replace('T', ' ')}
                          </TableCell>
                          <TableCell sx={{ minWidth: 104 }}>
                            <Link
                              href={`/dashboard/users/${encodeURIComponent(click.userId)}/portrait`}
                              color="text.primary"
                              underline="always"
                              sx={{ overflowWrap: 'anywhere' }}
                            >
                              {click.userId}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {campaigns.find(
                              (campaign) => campaign.id === click.campaignId
                            )?.name ?? click.campaignId}
                            <br />
                            {placementLabels[click.placement] ??
                              click.placement}
                          </TableCell>
                          <TableCell>
                            {click.countryCode ?? '—'}
                            {click.regionCode
                              ? ` / ${click.regionCode}`
                              : ''} ·{' '}
                            {platformLabels[click.platform] ??
                              click.platform ??
                              '—'}
                            <br />
                            {click.accessType ?? '—'} · {click.threshold ?? '—'}
                            + · visit {click.sessionOrdinal ?? '—'}
                          </TableCell>
                          <TableCell
                            sx={{ minWidth: 94, overflowWrap: 'anywhere' }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              Displayed
                            </Typography>
                            {click.displayedVersion ?? '—'}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              Resolved
                            </Typography>
                            {click.resolvedVersion ?? '—'}
                          </TableCell>
                          <TableCell>{click.resolution ?? '—'}</TableCell>
                          <TableCell>
                            {click.screen ?? '—'}
                            <br />
                            {click.impressionId
                              ? 'Linked impression'
                              : 'No linked impression'}
                            {click.fixtureId ? (
                              <>
                                <br />
                                Fixture {click.fixtureId}
                              </>
                            ) : null}
                            {click.predictionVersionId ? (
                              <>
                                <br />
                                Prediction {click.predictionVersionId}
                              </>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </Stack>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ minHeight: { xs: '2.8em', sm: 0 } }}
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ my: 0.5, fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="p">
          {note}
        </Typography>
      </CardContent>
    </Card>
  );
}

const count = (value: number) => value.toLocaleString('en-US');

function marketLabel(market: PartnerMarketConfig) {
  return `${market.operatorDisplayName} · ${market.countryCode}${market.regionCode ? ` / ${market.regionCode}` : ''}`;
}

function formatRange(query: AppPartnerAnalyticsFilters, custom: boolean) {
  if (!custom) return 'Last 30 days · UTC';
  const day = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const from = new Date(query.from ?? '');
  // The API end is exclusive; show the last included calendar date.
  const through = new Date(Date.parse(query.to ?? '') - 1);
  const firstDay = day.format(from);
  const lastDay = day.format(through);
  return `${firstDay === lastDay ? firstDay : `${firstDay} – ${lastDay}`} · UTC`;
}

function queryWithRange(
  filters: AppPartnerAnalyticsFilters
): AppPartnerAnalyticsFilters {
  const now = Date.now();
  const to = filters.to
    ? Date.parse(`${filters.to}T00:00:00.000Z`) + dayMs
    : now;
  const from = filters.from
    ? Date.parse(`${filters.from}T00:00:00.000Z`)
    : to - maxRangeMs;
  if (
    !Number.isFinite(to - from) ||
    to <= from ||
    to - from > maxRangeMs ||
    to > now + dayMs
  ) {
    throw new Error('Select an increasing UTC date range of up to 30 days.');
  }
  return {
    ...filters,
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    countryCode: filters.countryCode?.trim().toUpperCase() || undefined,
    regionCode: filters.regionCode?.trim().toUpperCase() || undefined,
    creativeVersion: filters.creativeVersion?.trim() || undefined,
    userId: filters.userId?.trim() || undefined,
  };
}

function ctr(numerator: number, denominator: number): string {
  return denominator > 0
    ? `${((100 * numerator) / denominator).toFixed(2)}%`
    : '—';
}

function messageOf(caught: unknown): string {
  return caught instanceof Error
    ? caught.message
    : 'Unable to load app partner analytics.';
}
