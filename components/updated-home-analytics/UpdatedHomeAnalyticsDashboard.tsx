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
  type UpdatedHomeDashboardBlock,
  type UpdatedHomeAnalyticsResponse,
} from '@/lib/api/updated-home-analytics';
import { UpdatedHomeAnalyticsSection } from './UpdatedHomeAnalyticsSection';
import { dashboardsById, findMetricStage, UPDATED_HOME_SECTIONS } from './presentation';

const mono = '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace';

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
        setData(null);
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
    if ((toTime - fromTime) / 86_400_000 >= 31) {
      setRangeError('Maximum range is 31 days.');
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
  const hasValues =
    data?.dashboards.some((dashboard) =>
      dashboard.metrics.some((metric) => metric.values.length > 0)
    ) ?? false;

  return (
    <Box sx={{ minWidth: 0, minHeight: '100vh', bgcolor: '#111111' }}>
      <AdminPageHeader
        title="Updated Home Analytics"
        subtitle="Product performance, conversion and retention · UTC"
        maxWidth={1440}
        actions={<DataStatus />}
      />

      <Stack
        component="main"
        id="overview"
        gap="24px"
        sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, pt: 3, pb: 5 }}
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

        {error ? <Alert severity="error">{error}</Alert> : null}
        {data ? (
          <Alert severity={hasValues ? 'info' : 'warning'}>
            UTC · {data.range.from.slice(0, 10)} to {data.range.to.slice(0, 10)}. Currency totals stay separate.
            {!hasValues && ' No eligible observations in this range.'}
          </Alert>
        ) : null}

        <DashboardIndex />
        <FreeHomeFunnel dashboards={dashboardMap} />

        <Box data-testid="updated-home-dashboard-grid" sx={{ display: 'contents', overflowX: 'hidden' }}>
          {UPDATED_HOME_SECTIONS.map((section) => (
            <UpdatedHomeAnalyticsSection
              key={section.id}
              id={section.id}
              title={section.title}
              status={section.status}
              dashboard={dashboardMap.get(section.id)}
            />
          ))}
        </Box>

        <CoverageFooter />
      </Stack>
    </Box>
  );
}

function DataStatus() {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{ bgcolor: '#173926', borderRadius: 999, px: 1.5, py: 1 }}
    >
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#68C96B' }} />
      <Typography sx={{ color: '#D8FBE9', fontSize: 12, fontWeight: 600 }}>
        MVP · 12 dashboards
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
    <Box sx={{ border: '1px solid #343434', borderRadius: '12px', bgcolor: '#222222', p: '18px' }}>
      <Stack direction="row" justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Typography sx={{ color: '#F5F5F5', fontSize: 15, fontWeight: 600 }}>
          Observation range
        </Typography>
        <Typography sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 11 }}>
          UTC · maximum 31 days · backend-computed
        </Typography>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'flex-end' }} gap="12px">
        <TextField
          label="From (UTC)"
          type="date"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: { xs: '100%', sm: 170 }, '& .MuiInputBase-root': { height: 56 } }}
        />
        <TextField
          label="To (UTC)"
          type="date"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: { xs: '100%', sm: 170 }, '& .MuiInputBase-root': { height: 56 } }}
        />
        <Button variant="contained" onClick={onRefresh} sx={{ width: { xs: '100%', sm: 160 }, height: 56 }}>
          Refresh
        </Button>
        {loading ? <CircularProgress size={22} aria-label="Loading Updated Home analytics" /> : null}
      </Stack>
      {error ? <Alert severity="warning" sx={{ mt: 1.5 }}>{error}</Alert> : null}
    </Box>
  );
}

function DashboardIndex() {
  const links = [{ label: 'Overview', href: '#overview', active: true }].concat(
    UPDATED_HOME_SECTIONS.filter((section) => 'nav' in section).map((section) => ({
      label: section.nav,
      href: `#dashboard-${section.id}`,
      active: false,
    }))
  );
  return (
    <Box component="nav" aria-label="Updated Home dashboard sections" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {links.map((link) => (
        <Box
          key={link.href}
          component="a"
          href={link.href}
          sx={{
            color: link.active ? '#fff' : '#A3A3A3',
            bgcolor: link.active ? '#5B4BFF' : '#222222',
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

const FUNNEL_STEPS = [
  { label: 'Home viewed', dashboardId: 2, sourceKey: 'free_pick_activation_funnel', stage: 'home_viewed' },
  { label: 'Free Pick seen', dashboardId: 2, sourceKey: 'free_pick_activation_funnel', stage: 'free_pick_impression' },
  { label: 'Free Pick opened', dashboardId: 2, sourceKey: 'free_pick_activation_funnel', stage: 'free_pick_clicked' },
  { label: 'Analysis opened' },
  { label: 'Offer seen', dashboardId: 3, sourceKey: 'full_access_funnel', stage: 'offer_impression' },
  { label: 'Offer clicked', dashboardId: 3, sourceKey: 'full_access_funnel', stage: 'offer_click' },
  { label: 'Paywall viewed', dashboardId: 3, sourceKey: 'full_access_funnel', stage: 'paywall_view' },
  { label: 'Purchase started', dashboardId: 3, sourceKey: 'full_access_funnel', stage: 'purchase_start' },
  { label: 'Verified purchase', dashboardId: 3, sourceKey: 'full_access_funnel', stage: 'verified_purchase' },
] as const;

function FreeHomeFunnel({ dashboards }: { dashboards: Map<number, UpdatedHomeDashboardBlock> }) {
  return (
    <Box sx={{ border: '1px solid #343434', borderRadius: '12px', bgcolor: '#222222', p: '20px' }}>
      <Stack direction="row" justifyContent="space-between" gap={2} sx={{ mb: '18px' }}>
        <Typography sx={{ color: '#F5F5F5', fontSize: 17, fontWeight: 700 }}>
          Free Home conversion
        </Typography>
        <Typography sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 11 }}>
          Distinct users · previous-step rate
        </Typography>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(9, minmax(0, 1fr))' }, gap: 1 }}>
        {FUNNEL_STEPS.map((step) => {
          const value = findMetricStage(
            'dashboardId' in step ? dashboards.get(step.dashboardId) : undefined,
            'sourceKey' in step ? step.sourceKey : undefined,
            'stage' in step ? step.stage : undefined
          );
          return (
          <Box key={step.label} sx={{ minWidth: 0, px: 0.5 }}>
            <Typography sx={{ color: '#F5F5F5', fontFamily: mono, fontSize: 18, fontWeight: 700 }}>{formatFunnelCount(value)}</Typography>
            <Typography sx={{ color: '#A3A3A3', fontSize: 11, minHeight: 22 }}>{step.label}</Typography>
            <Box sx={{ height: 3, my: 0.75, borderRadius: 999, bgcolor: '#3A3A3A' }} />
            <Typography sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 10 }}>{formatFunnelRate(value)}</Typography>
          </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function formatFunnelCount(value?: UpdatedHomeDashboardBlock['metrics'][number]['values'][number]) {
  return value?.numerator === null || value?.numerator === undefined
    ? 'N/A'
    : value.numerator.toLocaleString('en-US');
}

function formatFunnelRate(value?: UpdatedHomeDashboardBlock['metrics'][number]['values'][number]) {
  if (!value) return 'awaiting API';
  if (value.denominator === null && value.numerator !== null) return '100%';
  return value.value === null ? 'N/A' : `${value.value}%`;
}

function CoverageFooter() {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={3} sx={{ border: '1px solid #343434', borderRadius: '12px', bgcolor: '#171717', p: '20px' }}>
      <Stack gap={1}>
        <Typography sx={{ color: '#F5F5F5', fontSize: 16, fontWeight: 700 }}>MVP measurement coverage</Typography>
        <Typography sx={{ color: '#A3A3A3', fontSize: 12 }}>12 dashboards · revenue excluded · Feed, Challenges and Quests deferred · conversion metrics use distinct users.</Typography>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        <Legend label="● MVP ready" color="#D8FBE9" background="#173926" />
        <Legend label="● Partial window" color="#F8E5BF" background="#3A2B12" />
        <Legend label="N/A explicit" color="#A3A3A3" background="#2A2A2A" />
      </Stack>
    </Stack>
  );
}

function Legend({ label, color, background }: { label: string; color: string; background: string }) {
  return <Typography sx={{ color, bgcolor: background, borderRadius: 999, px: 1.25, py: 1, fontFamily: mono, fontSize: 10, fontWeight: 600 }}>{label}</Typography>;
}
