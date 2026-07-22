'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  getUpdatedHomeAnalytics,
  type UpdatedHomeAnalyticsResponse,
  type UpdatedHomeMetricValue,
} from '@/lib/api/updated-home-analytics';

const METRIC_LABELS: Record<string, string> = {
  home_load_success_rate: 'Home load success',
  module_reach_rate: 'Module reach',
  active_home_time_ms: 'Active Home time',
  home_exit_without_interaction_rate: 'Exits without interaction',
  free_pick_open_rate: 'Free Pick open rate',
  meaningful_full_analysis_rate: 'Meaningful Full Analysis',
  ordered_offer_conversion: 'Offer to verified purchase',
  revenue_per_home_user: 'Revenue per Home user',
  conversion_by_product_country: 'Conversion by product and country',
  collection_conversion_rate: 'Collection conversion',
  singles_engagement_rate: 'Top Picks engagement',
  parlay_engagement_rate: 'Parlay engagement',
  section_reach_rate: 'Section reach',
  completed_prediction_loop_rate: 'Completed prediction loop',
  pass_24h_repeat_purchase_rate: '24-hour pass repeat purchase',
  premium_usage_before_expiry: 'Premium use before expiry',
  pass_to_monthly_conversion_rate: 'Pass to monthly subscription',
  subscription_cannibalization_pp: 'Subscription cannibalization',
  verified_started_rate: 'Verified purchase rate',
  duplicate_purchase_attempt_count: 'Duplicate purchase attempts',
  purchase_failure_count: 'Purchase failures',
  verification_latency_ms: 'Verification latency',
  d1_d7_d30_retention: 'Retention by core action',
};

function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 14);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function formatDimensions(dimensions: Record<string, unknown>): string {
  const entries = Object.entries(dimensions).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  );
  if (entries.length === 0) return 'All eligible users';
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(' · ');
}

function formatValue(value: UpdatedHomeMetricValue): string {
  if (value.value === null) return 'N/A';
  if (value.unit === 'percent') return `${value.value}%`;
  if (value.unit === 'percentage_points') return `${value.value} pp`;
  if (value.unit === 'milliseconds') return `${value.value} ms`;
  if (value.unit === 'currency_per_user') {
    const currency = value.dimensions.currency;
    return `${value.value} ${typeof currency === 'string' ? currency : ''}`.trim();
  }
  return String(value.value);
}

/** Renders all backend-owned dashboard projections without recomputing them. */
export function UpdatedHomeAnalyticsDashboard() {
  const initial = defaultRange();
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [data, setData] = useState<UpdatedHomeAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestRequestId = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);
    try {
      const response = await getUpdatedHomeAnalytics({
        from: `${from}T00:00:00.000Z`,
        to: `${to}T23:59:59.999Z`,
      });
      if (requestId === latestRequestId.current) setData(response);
    } catch (caught) {
      if (requestId === latestRequestId.current) {
        setError(caught instanceof Error ? caught.message : 'Unknown error');
      }
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
    return () => {
      latestRequestId.current += 1;
    };
  }, [load]);

  const hasValues =
    data?.dashboards.some((dashboard) =>
      dashboard.metrics.some((metric) => metric.values.length > 0)
    ) ?? false;

  return (
    <Box sx={{ minWidth: 0 }}>
      <AdminPageHeader
        title="Updated Home Analytics"
        subtitle="Internal product performance, conversion, revenue and retention"
      />
      <Box sx={{ maxWidth: 1440, mx: 'auto', p: { xs: 2, md: 4 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <TextField
            label="From (UTC)"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="To (UTC)"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button variant="contained" onClick={() => void load()}>
            Apply range
          </Button>
        </Stack>

        {loading && (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress aria-label="Loading Updated Home analytics" />
          </Stack>
        )}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && data && (
          <>
            <Alert severity={hasValues ? 'info' : 'warning'} sx={{ mb: 3 }}>
              UTC · {data.range.from.slice(0, 10)} to{' '}
              {data.range.to.slice(0, 10)}. Currency totals stay separate.
              {!hasValues && ' No eligible observations in this range.'}
            </Alert>
            <Box
              data-testid="updated-home-dashboard-grid"
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  lg: 'repeat(2, minmax(0, 1fr))',
                },
                gap: 2,
                minWidth: 0,
                overflowX: 'hidden',
              }}
            >
              {data.dashboards.map((dashboard) => (
                <Card
                  key={dashboard.id}
                  variant="outlined"
                  sx={{ minWidth: 0 }}
                >
                  <CardContent>
                    <Typography variant="overline">
                      Dashboard {dashboard.id}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {dashboard.name}
                    </Typography>
                    {!dashboard.observationCompleteness.isComplete && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        {dashboard.observationCompleteness.reason ??
                          'Observation window is incomplete.'}
                      </Alert>
                    )}
                    <Stack spacing={1.5}>
                      {dashboard.metrics.map((metric) => (
                        <Box key={metric.definition.key} sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2">
                            {METRIC_LABELS[metric.definition.key] ??
                              metric.definition.key}
                          </Typography>
                          {metric.values.length === 0 ? (
                            <Typography color="text.secondary">
                              N/A · No eligible data
                            </Typography>
                          ) : (
                            metric.values.map((value, index) => (
                              <Box
                                key={`${metric.definition.key}-${index}`}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'baseline',
                                  gap: 2,
                                  minWidth: 0,
                                  flexWrap: 'wrap',
                                  py: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ overflowWrap: 'anywhere' }}
                                >
                                  {formatDimensions(value.dimensions)}
                                </Typography>
                                <Typography variant="body1" fontWeight={700}>
                                  {formatValue(value)}
                                </Typography>
                                {value.naReason && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ width: '100%' }}
                                  >
                                    {value.naReason}
                                  </Typography>
                                )}
                              </Box>
                            ))
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
