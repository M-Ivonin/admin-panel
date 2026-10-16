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
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  getUpdatedHomeAnalytics,
  type UpdatedHomeAnalyticsResponse,
} from '@/lib/api/updated-home-analytics';
import { UpdatedHomeAnalyticsSection } from './UpdatedHomeAnalyticsSection';
import { downloadUpdatedHomeAnalyticsJson } from './export';
import {
  dashboardsById,
  hasObservedValues,
  UPDATED_HOME_SECTIONS,
} from './presentation';

import {
  defaultHomeAnalyticsRange,
  homeAnalyticsRequestRange,
  linkedHomeAnalyticsRange,
  transitionHomeAnalyticsRange,
  type HomeAnalyticsRange,
} from '@/lib/home-analytics-range';

const mono = '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace';

export function UpdatedHomeAnalyticsDashboard() {
  const initial = useMemo(() => defaultHomeAnalyticsRange(new Date()), []);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [appliedRange, setAppliedRange] = useState<HomeAnalyticsRange | null>(null);
  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const range =
      linkedHomeAnalyticsRange({
        from: params.get('from'),
        to: params.get('to'),
      }) ?? initial;
    setFrom(range.from);
    setTo(range.to);
    setAppliedRange(range);
  }, [initial]);
  const [data, setData] = useState<UpdatedHomeAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const latestRequestId = useRef(0);

  const load = useCallback(async (range: HomeAnalyticsRange) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const response = await getUpdatedHomeAnalytics(
        homeAnalyticsRequestRange(range)
      );
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
    if (appliedRange) void load(appliedRange);
    return () => {
      latestRequestId.current += 1;
    };
  }, [appliedRange, load]);

  const refresh = useCallback(() => {
    const result = transitionHomeAnalyticsRange(appliedRange, { from, to });
    setRangeError(result.error);
    if (!result.range) return;
    const nextRange = result.range;
    if (nextRange === appliedRange) {
      void load(nextRange);
      return;
    }
    setAppliedRange(nextRange);
  }, [appliedRange, from, load, to]);

  const dashboardMap = useMemo(() => dashboardsById(data), [data]);

  return (
    <Box sx={{ minWidth: 0, minHeight: '100vh', bgcolor: '#111111' }}>
      <AdminPageHeader
        title="Updated Home Analytics"
        subtitle="Backend-owned product performance, conversion and retention · UTC"
        maxWidth={1440}
        actions={
          <Stack direction="row" alignItems="center" gap={1}>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadOutlinedIcon />}
              disabled={!data || loading || Boolean(error)}
              onClick={() => data && downloadUpdatedHomeAnalyticsJson(data)}
            >
              Export JSON
            </Button>
            <DataStatus />
          </Stack>
        }
      />

      <Stack
        component="main"
        gap="24px"
        sx={{
          maxWidth: 1440,
          minWidth: 0,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          pt: 3,
          pb: 5,
        }}
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
          <Alert severity="info" role="status">
            Loading backend analytics…
          </Alert>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        {data && !loading && !error ? (
          <>
            <Alert severity={hasObservedValues(data) ? 'info' : 'warning'}>
              UTC · {data.range.from.slice(0, 10)} to{' '}
              {data.range.to.slice(0, 10)} · {data.definitionVersion}. Data
              through {data.range.to.replace('T', ' ').replace('Z', '')} UTC.
              {!hasObservedValues(data) &&
                ' No eligible observations in this range.'}
            </Alert>
            <DashboardIndex />
            <Box
              data-testid="updated-home-dashboard-grid"
              sx={{
                display: 'grid',
                minWidth: 0,
                gap: '24px',
                overflowX: 'clip',
              }}
            >
              {UPDATED_HOME_SECTIONS.map((section) => (
                <UpdatedHomeAnalyticsSection
                  key={section.label}
                  label={section.label}
                  dashboards={section.dashboardIds.map((id) =>
                    dashboardMap.get(id)
                  )}
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
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{ bgcolor: '#173926', borderRadius: 999, px: 1.5, py: 1 }}
    >
      <Box
        sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#68C96B' }}
      />
      <Typography sx={{ color: '#D8FBE9', fontSize: 12, fontWeight: 600 }}>
        13 backend dashboards
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
    <Box
      sx={{
        border: '1px solid #343434',
        borderRadius: '12px',
        bgcolor: '#222222',
        p: { xs: '14px', sm: '18px' },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        gap={1}
        sx={{ mb: 2 }}
      >
        <Typography sx={{ color: '#F5F5F5', fontSize: 15, fontWeight: 600 }}>
          Observation range
        </Typography>
        <Typography sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 11 }}>
          UTC · maximum 90 days · backend-computed
        </Typography>
      </Stack>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'flex-end' }}
        gap="12px"
      >
        <TextField
          label="From (UTC)"
          type="date"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{
            width: { xs: '100%', sm: 180 },
            '& .MuiInputBase-root': { height: 56 },
          }}
        />
        <TextField
          label="To (UTC)"
          type="date"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{
            width: { xs: '100%', sm: 180 },
            '& .MuiInputBase-root': { height: 56 },
          }}
        />
        <Button
          variant="contained"
          onClick={onRefresh}
          sx={{ width: { xs: '100%', sm: 160 }, height: 56 }}
        >
          Refresh
        </Button>
        {loading ? (
          <CircularProgress
            size={22}
            aria-label="Loading Updated Home analytics"
          />
        ) : null}
      </Stack>
      {error ? (
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      ) : null}
    </Box>
  );
}

function DashboardIndex() {
  const links = [
    ...UPDATED_HOME_SECTIONS.map((section) => ({
      label: section.label,
      href: `#dashboard-${section.dashboardIds[0]}`,
    })),
  ];
  return (
    <Box
      component="nav"
      aria-label="Updated Home dashboard sections"
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
    >
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

function CoverageFooter() {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      gap={2}
      sx={{
        border: '1px solid #343434',
        borderRadius: '12px',
        bgcolor: '#171717',
        p: '20px',
      }}
    >
      <Stack gap={1}>
        <Typography sx={{ color: '#F5F5F5', fontSize: 16, fontWeight: 700 }}>
          Backend projection coverage
        </Typography>
        <Typography sx={{ color: '#A3A3A3', fontSize: 12 }}>
          13 dashboards · backend values and definitions. Retention headers show
          averages across cohorts; breakdowns preserve backend values.
        </Typography>
      </Stack>
      <Typography
        sx={{
          color: '#A3A3A3',
          bgcolor: '#2A2A2A',
          borderRadius: 999,
          px: 1.25,
          py: 1,
          fontFamily: mono,
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        Missing values remain N/A
      </Typography>
    </Stack>
  );
}
