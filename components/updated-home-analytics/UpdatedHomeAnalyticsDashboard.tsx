'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  getUpdatedHomeAnalytics,
  type UpdatedHomeAnalyticsResponse,
  type UpdatedHomeDashboardBlock,
  type UpdatedHomeMetricValue,
} from '@/lib/api/updated-home-analytics';
import { UpdatedHomeAnalyticsSection } from './UpdatedHomeAnalyticsSection';
import {
  dashboardsById,
  displayLabel,
  formatMetricUnit,
  formatMetricValue,
  hasObservedValues,
  metricValues,
  UPDATED_HOME_SECTIONS,
} from './presentation';

const mono = '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace';
const MAX_RANGE_DAYS = 90;

function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 14);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export function UpdatedHomeAnalyticsDashboard() {
  const initial = useMemo(defaultRange, []);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [appliedRange, setAppliedRange] = useState(initial);
  const [data, setData] = useState<UpdatedHomeAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const latestRequestId = useRef(0);

  const load = useCallback(async (range: { from: string; to: string }) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const response = await getUpdatedHomeAnalytics({
        from: `${range.from}T00:00:00.000Z`,
        to: `${range.to}T23:59:59.999Z`,
      });
      if (requestId === latestRequestId.current) setData(response);
    } catch (caught) {
      if (requestId === latestRequestId.current) {
        setError(caught instanceof Error ? caught.message : 'Unknown error');
      }
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(appliedRange);
    return () => {
      latestRequestId.current += 1;
    };
  }, [appliedRange, load]);

  const refresh = useCallback(() => {
    const fromTime = Date.parse(`${from}T00:00:00.000Z`);
    const toTime = Date.parse(`${to}T00:00:00.000Z`);
    if (!Number.isFinite(fromTime) || !Number.isFinite(toTime) || fromTime > toTime) {
      setRangeError('Choose a valid UTC date range.');
      return;
    }
    if ((toTime - fromTime) / 86_400_000 >= MAX_RANGE_DAYS) {
      setRangeError(`Maximum range is ${MAX_RANGE_DAYS} days.`);
      return;
    }
    setRangeError(null);
    const nextRange = { from, to };
    if (from === appliedRange.from && to === appliedRange.to) {
      void load(nextRange);
      return;
    }
    setAppliedRange(nextRange);
  }, [appliedRange.from, appliedRange.to, from, load, to]);

  const dashboardMap = useMemo(() => dashboardsById(data), [data]);

  return (
    <Box sx={{ minWidth: 0, minHeight: '100vh', bgcolor: '#111111' }}>
      <AdminPageHeader
        title="Updated Home Analytics"
        subtitle="Backend-owned product performance, conversion and retention · UTC"
        maxWidth={1440}
        actions={<DataStatus />}
      />

      <Stack
        component="main"
        gap="24px"
        sx={{ maxWidth: 1440, minWidth: 0, mx: 'auto', px: { xs: 2, md: 4 }, pt: 3, pb: 5 }}
      >
        <FilterPanel
          from={from}
          to={to}
          loading={loading}
          error={rangeError}
          onFromChange={setFrom}
          onToChange={setTo}
          onRefresh={refresh}
        />

        {loading ? (
          <Alert severity="info" role="status">Loading backend analytics…</Alert>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        {data && !loading && !error ? (
          <>
            <Alert severity={hasObservedValues(data) ? 'info' : 'warning'}>
              UTC · {data.range.from.slice(0, 10)} to {data.range.to.slice(0, 10)} · {data.definitionVersion}.
              {!hasObservedValues(data) && ' No eligible observations in this range.'}
            </Alert>
            <DashboardIndex />
            <Overview dashboards={dashboardMap} />
            <Box data-testid="updated-home-dashboard-grid" sx={{ display: 'grid', minWidth: 0, gap: '24px', overflowX: 'clip' }}>
              {UPDATED_HOME_SECTIONS.map((section) => (
                <UpdatedHomeAnalyticsSection
                  key={section.label}
                  label={section.label}
                  dashboards={section.dashboardIds.map((id) => dashboardMap.get(id))}
                />
              ))}
            </Box>
            <CoverageFooter />
          </>
        ) : null}
      </Stack>
    </Box>
  );
}

function DataStatus() {
  return (
    <Stack direction="row" alignItems="center" gap={1} sx={{ bgcolor: '#173926', borderRadius: 999, px: 1.5, py: 1 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#68C96B' }} />
      <Typography sx={{ color: '#D8FBE9', fontSize: 12, fontWeight: 600 }}>
        12 backend dashboards
      </Typography>
    </Stack>
  );
}

function FilterPanel({
  from,
  to,
  loading,
  error,
  onFromChange,
  onToChange,
  onRefresh,
}: {
  from: string;
  to: string;
  loading: boolean;
  error: string | null;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onRefresh: () => void;
}) {
  return (
    <Box sx={{ border: '1px solid #343434', borderRadius: '12px', bgcolor: '#222222', p: { xs: '14px', sm: '18px' } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1} sx={{ mb: 2 }}>
        <Typography sx={{ color: '#F5F5F5', fontSize: 15, fontWeight: 600 }}>
          Observation range
        </Typography>
        <Typography sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 11 }}>
          UTC · maximum 90 days · backend-computed
        </Typography>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'flex-end' }} gap="12px">
        <TextField
          label="From (UTC)"
          type="date"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: { xs: '100%', sm: 180 }, '& .MuiInputBase-root': { height: 56 } }}
        />
        <TextField
          label="To (UTC)"
          type="date"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: { xs: '100%', sm: 180 }, '& .MuiInputBase-root': { height: 56 } }}
        />
        <Button
          variant="contained"
          onClick={onRefresh}
          sx={{ width: { xs: '100%', sm: 160 }, height: 56 }}
        >
          Refresh
        </Button>
        {loading ? <CircularProgress size={22} aria-label="Loading Updated Home analytics" /> : null}
      </Stack>
      {error ? <Alert severity="warning" sx={{ mt: 1.5 }}>{error}</Alert> : null}
    </Box>
  );
}

function DashboardIndex() {
  const links = [
    { label: 'Overview', href: '#overview' },
    ...UPDATED_HOME_SECTIONS.map((section) => ({
      label: section.label,
      href: `#dashboard-${section.dashboardIds[0]}`,
    })),
  ];
  return (
    <Box component="nav" aria-label="Updated Home dashboard sections" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {links.map((link, index) => (
        <Box
          key={link.href}
          component="a"
          href={link.href}
          sx={{
            color: index === 0 ? '#fff' : '#A3A3A3',
            bgcolor: index === 0 ? '#5B4BFF' : '#222222',
            border: '1px solid #343434',
            borderRadius: 999,
            px: 1.5,
            py: 0.75,
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {link.label}
        </Box>
      ))}
    </Box>
  );
}

function Overview({ dashboards }: { dashboards: Map<number, UpdatedHomeDashboardBlock> }) {
  return (
    <Box
      component="section"
      id="overview"
      role="region"
      aria-label="Overview"
      sx={{ border: '1px solid #343434', borderRadius: '12px', bgcolor: '#222222', p: { xs: '14px', sm: '20px' } }}
    >
      <Typography sx={{ color: '#F5F5F5', fontSize: 18, fontWeight: 700, mb: 2 }}>
        Overview
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
        <Journey
          title="Free Pick → Prediction Card"
          values={metricValues(dashboards.get(2), 'free_pick_activation_funnel')}
        />
        <Journey
          title="Paid Top Picks: Prediction Card → Full Analysis"
          values={metricValues(dashboards.get(6), 'top_picks_activation_funnel')}
        />
      </Box>
    </Box>
  );
}

function Journey({ title, values }: { title: string; values: UpdatedHomeMetricValue[] }) {
  return (
    <Box sx={{ minWidth: 0, border: '1px solid #3A3A3A', borderRadius: '10px', bgcolor: '#171717', p: { xs: '12px', sm: '16px' } }}>
      <Typography sx={{ color: '#F5F5F5', fontSize: 15, fontWeight: 700 }}>{title}</Typography>
      <Typography sx={{ color: '#8B8B8F', fontSize: 11, mt: 0.5, mb: 1.5 }}>
        Distinct users · previous-stage conversion
      </Typography>
      {values.length === 0 ? (
        <Typography sx={{ color: '#F0A63A', fontSize: 12 }}>Not returned by the backend.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: `repeat(${values.length}, minmax(0, 1fr))` }, gap: 1 }}>
          {values.map((value, index) => {
            const stage = typeof value.dimensions.stage === 'string'
              ? value.dimensions.stage
              : `stage_${index + 1}`;
            return (
              <Box key={`${stage}-${index}`} sx={{ minWidth: 0, borderLeft: '3px solid #5B4BFF', pl: 1 }}>
                <Typography sx={{ color: value.value === null ? '#F0A63A' : '#F5F5F5', fontFamily: mono, fontSize: 16, fontWeight: 700, overflowWrap: 'anywhere' }}>
                  {formatMetricValue(value)}
                </Typography>
                <Typography sx={{ color: '#A3A3A3', fontSize: 11, overflowWrap: 'anywhere' }}>
                  {displayLabel(stage)}
                </Typography>
                <Typography sx={{ color: '#8B8B8F', fontSize: 9 }}>
                  {formatMetricUnit(value)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

function CoverageFooter() {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} sx={{ border: '1px solid #343434', borderRadius: '12px', bgcolor: '#171717', p: '20px' }}>
      <Stack gap={1}>
        <Typography sx={{ color: '#F5F5F5', fontSize: 16, fontWeight: 700 }}>Backend projection coverage</Typography>
        <Typography sx={{ color: '#A3A3A3', fontSize: 12 }}>
          12 dashboards · backend values and definitions shown without frontend recomputation.
        </Typography>
      </Stack>
      <Typography sx={{ color: '#A3A3A3', bgcolor: '#2A2A2A', borderRadius: 999, px: 1.25, py: 1, fontFamily: mono, fontSize: 10, fontWeight: 600 }}>
        Missing values remain N/A
      </Typography>
    </Stack>
  );
}
