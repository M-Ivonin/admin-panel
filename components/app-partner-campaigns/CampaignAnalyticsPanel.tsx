'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import { Download } from '@mui/icons-material';
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

const metricLabels: ReadonlyArray<
  [keyof AppPartnerAnalytics['summary'], string]
> = [
  ['impressions', 'Qualified impressions'],
  ['uniqueViewers', 'Unique viewers'],
  ['clicks', 'Deliberate taps'],
  ['linkedClicks', 'Impression-linked taps'],
  ['linkedClickers', 'Unique linked clickers'],
  ['earlyClicks', 'Early taps'],
  ['blockedClicks', 'Blocked resolutions'],
  ['openFailures', 'Browser handoff failures'],
  ['agePrompts', 'Age prompts'],
  ['ageYes', 'Age confirmed'],
  ['ageNo', 'Age declined'],
  ['ageDismissed', 'Age dismissed'],
];

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
  const [applied, setApplied] = useState<AppPartnerAnalyticsFilters>(() =>
    queryWithRange({})
  );
  const [report, setReport] = useState<AppPartnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  function apply() {
    try {
      const query = queryWithRange(draft);
      setLoading(true);
      setReport(null);
      setError(null);
      setApplied(query);
    } catch (caught) {
      setError(messageOf(caught));
      return;
    }
  }
  async function exportCsv() {
    setError(null);
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
      setError(messageOf(caught));
    } finally {
      setExporting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Qualified impressions use the full placement visibility threshold. CTR
        uses impression-linked taps. Early taps are reported separately. Reports
        default to the last 30 days and accept a range of up to 30 days. The
        timeline shows up to 250 clicks. CSV exports up to 5,000 clicks with the
        currently applied filters.
      </Alert>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Analytics filters</Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              <TextField
                select
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
                select
                label="Operator market"
                value={draft.operatorMarketId ?? ''}
                onChange={(event) =>
                  set('operatorMarketId', event.target.value)
                }
              >
                <MenuItem value="">All operator markets</MenuItem>
                {markets.map((market) => (
                  <MenuItem key={market.id} value={market.id}>
                    {market.operatorDisplayName} · {market.countryCode}
                    {market.regionCode ? ` / ${market.regionCode}` : ''}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
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
                select
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
              <TextField
                label="From date (UTC)"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={draft.from ?? ''}
                onChange={(event) => set('from', event.target.value)}
              />
              <TextField
                label="Through date (UTC)"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={draft.to ?? ''}
                onChange={(event) => set('to', event.target.value)}
              />
              <TextField
                select
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
                  key={filter.key}
                  label={filter.label}
                  type={'numeric' in filter ? 'number' : 'text'}
                  value={draft[filter.key] ?? ''}
                  onChange={(event) => set(filter.key, event.target.value)}
                />
              ))}
            </Box>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Button
                variant="contained"
                disabled={loading || exporting}
                onClick={apply}
              >
                Apply analytics filters
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                disabled={!report || loading || exporting}
                onClick={() => void exportCsv()}
              >
                {exporting ? 'Exporting…' : 'Export clicks CSV'}
              </Button>
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
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Campaign summary</Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, minmax(0, 1fr))',
                      md: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: 2,
                  }}
                >
                  {metricLabels.map(([key, label]) => (
                    <Box key={key}>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="h6">
                        {report.summary[key].toLocaleString('en-US')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Typography variant="body2">
                  Impression CTR ·{' '}
                  {ctr(report.summary.linkedClicks, report.summary.impressions)}{' '}
                  ({report.summary.linkedClicks} linked taps /{' '}
                  {report.summary.impressions} qualified impressions)
                </Typography>
                <Typography variant="body2">
                  Unique viewer CTR ·{' '}
                  {ctr(
                    report.summary.linkedClickers,
                    report.summary.uniqueViewers
                  )}{' '}
                  ({report.summary.linkedClickers} linked clickers /{' '}
                  {report.summary.uniqueViewers} unique viewers)
                </Typography>
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Click timeline
              </Typography>
              {report.clicks.length === 0 ? (
                <Typography color="text.secondary">
                  No clicks match the current filters.
                </Typography>
              ) : (
                <TableContainer
                  tabIndex={0}
                  aria-label="Scrollable click timeline"
                >
                  <Table
                    size="small"
                    aria-label="App partner click timeline"
                    sx={{ minWidth: 1040 }}
                  >
                    <TableHead>
                      <TableRow>
                        {[
                          'Time (UTC)',
                          'User',
                          'Campaign and placement',
                          'Audience',
                          'Displayed and resolved version',
                          'Resolution',
                          'Browser handoff',
                          'Context',
                        ].map((label) => (
                          <TableCell key={label}>{label}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.clicks.map((click) => (
                        <TableRow key={click.tapId}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {click.occurredAt.slice(0, 19).replace('T', ' ')}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/users/${encodeURIComponent(click.userId)}/portrait`}
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
                          <TableCell sx={{ overflowWrap: 'anywhere' }}>
                            {click.displayedVersion ?? '—'}
                            <br />
                            {click.resolvedVersion ?? '—'}
                          </TableCell>
                          <TableCell>{click.resolution ?? '—'}</TableCell>
                          <TableCell>{click.openResult ?? '—'}</TableCell>
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
    countryCode: filters.countryCode?.toUpperCase(),
    regionCode: filters.regionCode?.toUpperCase(),
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
