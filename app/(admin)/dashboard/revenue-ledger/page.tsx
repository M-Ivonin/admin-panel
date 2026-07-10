'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, Clear, Refresh } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RevenueLedgerAccessGate } from '@/modules/revenue-ledger/RevenueLedgerAccessGate';
import {
  PaginatedRevenueLedgerEntriesResponse,
  RevenueLedgerBusinessStatus,
  RevenueLedgerDirection,
  RevenueLedgerEntry,
  RevenueLedgerEventType,
  RevenueLedgerFilters,
  RevenueLedgerSortField,
  RevenueLedgerSortOrder,
  RevenueLedgerStore,
  RevenueLedgerSummary,
  RevenueLedgerUsdDailyRevenuePoint,
  TenjinSdkDispatchStatus,
  getRevenueLedgerEntries,
} from '@/lib/api/revenue-ledger';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_SORT_FIELD: RevenueLedgerSortField = 'createdAt';
const DEFAULT_SORT_ORDER: RevenueLedgerSortOrder = 'desc';

const EMPTY_SUMMARY: RevenueLedgerSummary = {
  totalEntries: 0,
  recordedPositiveCount: 0,
  recordedNegativeCount: 0,
  skippedCount: 0,
  missingAmountCount: 0,
  byCurrency: [],
  usdRevenue: null,
  dailyUsdRevenue: [],
};

const STORE_OPTIONS: Array<{ value: RevenueLedgerStore; label: string }> = [
  { value: 'google_play', label: 'Google Play' },
  { value: 'app_store', label: 'App Store' },
];

const EVENT_TYPE_OPTIONS: Array<{
  value: RevenueLedgerEventType;
  label: string;
}> = [
  { value: 'initial_subscription', label: 'Initial subscription' },
  { value: 'subscription_renewal', label: 'Subscription renewal' },
  { value: 'subscription_canceled', label: 'Subscription canceled' },
  { value: 'subscription_recovered', label: 'Subscription recovered' },
  { value: 'subscription_restarted', label: 'Subscription restarted' },
  { value: 'consumable_purchase', label: 'Consumable purchase' },
  { value: 'refund', label: 'Refund' },
  { value: 'voided', label: 'Voided' },
];

const DIRECTION_OPTIONS: Array<{
  value: RevenueLedgerDirection;
  label: string;
}> = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'none', label: 'None' },
];

const BUSINESS_STATUS_OPTIONS: Array<{
  value: RevenueLedgerBusinessStatus;
  label: string;
}> = [
  { value: 'recorded', label: 'Recorded' },
  { value: 'skipped', label: 'Skipped' },
];

const TENJIN_STATUS_OPTIONS: Array<{
  value: TenjinSdkDispatchStatus;
  label: string;
}> = [
  { value: 'not_applicable', label: 'Not applicable' },
  { value: 'pending_client_completion', label: 'Pending client completion' },
  { value: 'ready_for_client_dispatch', label: 'Ready for client dispatch' },
  { value: 'dispatch_token_issued', label: 'Dispatch token issued' },
  { value: 'sdk_call_started', label: 'SDK call started' },
  { value: 'client_reported_sent', label: 'Client reported sent' },
  { value: 'client_reported_failed', label: 'Client reported failed' },
  {
    value: 'expired_without_client_report',
    label: 'Expired without client report',
  },
];

const SORT_LABELS: Record<RevenueLedgerSortField, string> = {
  createdAt: 'Created time',
  eventTime: 'Event time',
  grossAmount: 'Gross amount',
};

function getSelectValue(value: unknown): string[] {
  return typeof value === 'string' ? value.split(',') : (value as string[]);
}

function renderSelectChips(values: string[]) {
  if (values.length === 0) {
    return <Typography color="text.secondary">All</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {values.map((value) => (
        <Chip key={value} label={formatEnumLabel(value)} size="small" />
      ))}
    </Box>
  );
}

function formatEnumLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatLedgerEventTypeLabel(entry: RevenueLedgerEntry): string {
  if (entry.eventType === 'subscription_canceled') {
    return 'Auto-renew canceled';
  }

  return formatEnumLabel(entry.eventType);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(amount: string | null, currency: string | null): string {
  if (!amount || !currency) {
    return '-';
  }

  const numericAmount = Number(amount);
  const displayAmount = Number.isFinite(numericAmount)
    ? numericAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : amount;

  return `${displayAmount} ${currency}`;
}

function formatUsdNumber(value: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatUsdTick(value: number) {
  return value < 0
    ? `-$${formatUsdNumber(Math.abs(value))}`
    : `$${formatUsdNumber(value)}`;
}

function formatChartDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });
}

function getDateInputDatePart(value: string | undefined) {
  const datePart = value?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (!datePart) {
    return null;
  }

  const parsed = new Date(`${datePart}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : datePart;
}

function toUtcDatePart(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildDailyUsdRevenueRange(
  points: RevenueLedgerUsdDailyRevenuePoint[] | null | undefined,
  dateRange: { dateFrom: string; dateTo: string }
) {
  if (points === null || points === undefined) {
    return [];
  }

  const sortedPoints = [...points].sort((left, right) =>
    left.date.localeCompare(right.date)
  );
  const startDatePart =
    getDateInputDatePart(dateRange.dateFrom) ?? sortedPoints[0]?.date ?? null;
  const endDatePart =
    getDateInputDatePart(dateRange.dateTo) ??
    sortedPoints[sortedPoints.length - 1]?.date ??
    null;

  if (!startDatePart || !endDatePart) {
    return sortedPoints;
  }

  const start = new Date(`${startDatePart}T00:00:00.000Z`);
  const end = new Date(`${endDatePart}T00:00:00.000Z`);
  const dayMs = 24 * 60 * 60 * 1000;
  const dayCount = Math.floor((end.getTime() - start.getTime()) / dayMs) + 1;

  if (dayCount <= 0 || dayCount > 370) {
    return sortedPoints;
  }

  const pointsByDate = new Map(
    sortedPoints.map((point) => [point.date, point])
  );

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start.getTime() + index * dayMs);
    const datePart = toUtcDatePart(date);

    return (
      pointsByDate.get(datePart) ?? {
        date: datePart,
        netGrossAmountUsd: '0.00',
        positiveGrossAmountUsd: '0.00',
        negativeGrossAmountUsd: '0.00',
        positiveCount: 0,
        negativeCount: 0,
      }
    );
  });
}

function buildUsdRevenueChart(
  points: RevenueLedgerUsdDailyRevenuePoint[] | null | undefined
) {
  const visiblePoints = points ?? [];
  const width = 760;
  const height = 260;
  const padding = {
    top: 18,
    right: 88,
    bottom: 46,
    left: 16,
  };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const numericPoints = visiblePoints.map((point) => ({
    ...point,
    net: Number(point.netGrossAmountUsd),
    positive: Number(point.positiveGrossAmountUsd),
    negative: Number(point.negativeGrossAmountUsd),
  }));
  const finiteValues = numericPoints
    .flatMap((point) => [point.net, point.positive, point.negative])
    .filter(Number.isFinite);
  const rawMin = Math.min(0, ...finiteValues);
  const rawMax = Math.max(0, ...finiteValues);
  const roundedMax = Math.ceil((rawMax || 1) / 10) * 10;
  const roundedMin =
    rawMin < 0
      ? Math.floor(Math.min(rawMin * 1.4, -roundedMax * 0.25) / 10) * 10
      : 0;
  const minValue = rawMin < 0 ? roundedMin : -roundedMax * 0.08;
  const maxValue = roundedMax;
  const valueSpan = maxValue - minValue || 1;
  const xForIndex = (index: number) =>
    padding.left +
    (numericPoints.length <= 1
      ? chartWidth / 2
      : (chartWidth * index) / (numericPoints.length - 1));
  const yForValue = (value: number) =>
    padding.top + ((maxValue - value) / valueSpan) * chartHeight;
  const linePath = numericPoints
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command}${xForIndex(index).toFixed(2)} ${yForValue(point.net).toFixed(2)}`;
    })
    .join(' ');
  const tickValues =
    rawMin < 0
      ? [roundedMax, roundedMax / 2, 0, roundedMin / 2, roundedMin]
      : [
          roundedMax,
          roundedMax * 0.75,
          roundedMax * 0.5,
          roundedMax * 0.25,
          0,
        ];
  const xLabelIndexes = numericPoints
    .map((_, index) => index)
    .filter((index) => {
      if (numericPoints.length <= 4) {
        return true;
      }

      return (
        index === 0 ||
        index === numericPoints.length - 1 ||
        index % Math.ceil(numericPoints.length / 4) === 0
      );
    });
  const totalPositive = numericPoints.reduce(
    (sum, point) => sum + (Number.isFinite(point.positive) ? point.positive : 0),
    0
  );
  const totalNegative = numericPoints.reduce(
    (sum, point) => sum + (Number.isFinite(point.negative) ? point.negative : 0),
    0
  );
  const totalNet = numericPoints.reduce(
    (sum, point) => sum + (Number.isFinite(point.net) ? point.net : 0),
    0
  );

  return {
    width,
    height,
    padding,
    linePath,
    numericPoints,
    tickValues,
    xLabelIndexes,
    xForIndex,
    yForValue,
    totalPositive,
    totalNegative,
    totalNet,
    hasNegativeRevenue: totalNegative < 0,
  };
}

function toIsoTimestampFromLocalDateTime(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function toLocalDateTimeInputValue(value: Date): string {
  const pad = (numberValue: number) => numberValue.toString().padStart(2, '0');

  return [
    value.getFullYear(),
    pad(value.getMonth() + 1),
    pad(value.getDate()),
  ].join('-') + `T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function getDefaultDateRange() {
  const today = new Date();
  const dateFrom = new Date(today);
  const dateTo = new Date(today);

  dateFrom.setDate(today.getDate() - 7);
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(23, 59, 0, 0);

  return {
    dateFrom: toLocalDateTimeInputValue(dateFrom),
    dateTo: toLocalDateTimeInputValue(dateTo),
  };
}

function getStatusChipColor(
  status: RevenueLedgerBusinessStatus
): 'default' | 'success' | 'warning' {
  return status === 'recorded' ? 'success' : 'warning';
}

function getDirectionChipColor(
  direction: RevenueLedgerDirection
): 'default' | 'success' | 'error' {
  if (direction === 'positive') {
    return 'success';
  }

  if (direction === 'negative') {
    return 'error';
  }

  return 'default';
}

function getTenjinChipColor(
  status: TenjinSdkDispatchStatus
): 'default' | 'success' | 'warning' | 'error' {
  if (status === 'client_reported_sent') {
    return 'success';
  }

  if (
    status === 'client_reported_failed' ||
    status === 'expired_without_client_report'
  ) {
    return 'error';
  }

  if (
    status === 'pending_client_completion' ||
    status === 'ready_for_client_dispatch' ||
    status === 'dispatch_token_issued' ||
    status === 'sdk_call_started'
  ) {
    return 'warning';
  }

  return 'default';
}

function getIdentityLines(entry: RevenueLedgerEntry): string[] {
  return [
    entry.orderId ? `Order: ${entry.orderId}` : null,
    entry.transactionId ? `Tx: ${entry.transactionId}` : null,
    entry.originalTransactionId
      ? `Original: ${entry.originalTransactionId}`
      : null,
    entry.purchaseToken ? `Token: ${entry.purchaseToken}` : null,
  ].filter((value): value is string => Boolean(value));
}

function RevenueLedgerContent() {
  const [items, setItems] = useState<RevenueLedgerEntry[]>([]);
  const [summary, setSummary] = useState<RevenueLedgerSummary>(EMPTY_SUMMARY);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [store, setStore] = useState<RevenueLedgerStore | ''>('');
  const [eventTypes, setEventTypes] = useState<RevenueLedgerEventType[]>([]);
  const [directions, setDirections] = useState<RevenueLedgerDirection[]>([]);
  const [businessStatuses, setBusinessStatuses] = useState<
    RevenueLedgerBusinessStatus[]
  >([]);
  const [tenjinDispatchStatuses, setTenjinDispatchStatuses] = useState<
    TenjinSdkDispatchStatus[]
  >([]);
  const [identityFilters, setIdentityFilters] = useState({
    productId: '',
    userId: '',
    orderId: '',
  });
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  const [sortBy, setSortBy] =
    useState<RevenueLedgerSortField>(DEFAULT_SORT_FIELD);
  const [sortOrder, setSortOrder] =
    useState<RevenueLedgerSortOrder>(DEFAULT_SORT_ORDER);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo<RevenueLedgerFilters>(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      store: store || undefined,
      eventTypes: eventTypes.length > 0 ? eventTypes : undefined,
      directions: directions.length > 0 ? directions : undefined,
      businessStatuses:
        businessStatuses.length > 0 ? businessStatuses : undefined,
      tenjinDispatchStatuses:
        tenjinDispatchStatuses.length > 0 ? tenjinDispatchStatuses : undefined,
      productId: identityFilters.productId.trim() || undefined,
      userId: identityFilters.userId.trim() || undefined,
      orderId: identityFilters.orderId.trim() || undefined,
      dateFrom: toIsoTimestampFromLocalDateTime(dateRange.dateFrom),
      dateTo: toIsoTimestampFromLocalDateTime(dateRange.dateTo),
      sortBy,
      sortOrder,
    }),
    [
      page,
      rowsPerPage,
      store,
      eventTypes,
      directions,
      businessStatuses,
      tenjinDispatchStatuses,
      identityFilters,
      dateRange,
      sortBy,
      sortOrder,
    ]
  );

  useEffect(() => {
    let active = true;

    async function loadEntries() {
      setIsLoading(true);
      setError(null);

      try {
        const response: PaginatedRevenueLedgerEntriesResponse =
          await getRevenueLedgerEntries(filters);

        if (!active) {
          return;
        }

        setItems(response.items);
        setSummary(response.summary || EMPTY_SUMMARY);
        setTotal(response.total || 0);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setItems([]);
        setSummary(EMPTY_SUMMARY);
        setTotal(0);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load revenue ledger'
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadEntries();

    return () => {
      active = false;
    };
  }, [filters, refreshNonce]);

  const hasActiveFilters =
    Boolean(store) ||
    eventTypes.length > 0 ||
    directions.length > 0 ||
    businessStatuses.length > 0 ||
    tenjinDispatchStatuses.length > 0 ||
    Object.values(identityFilters).some((value) => value.trim()) ||
    Boolean(dateRange.dateFrom || dateRange.dateTo) ||
    sortBy !== DEFAULT_SORT_FIELD ||
    sortOrder !== DEFAULT_SORT_ORDER;

  const usdRevenueChart = useMemo(
    () =>
      buildUsdRevenueChart(
        buildDailyUsdRevenueRange(summary.dailyUsdRevenue, dateRange)
      ),
    [summary.dailyUsdRevenue, dateRange]
  );
  const shouldShowUsdRevenueChart =
    summary.totalEntries > 0 && usdRevenueChart.numericPoints.length > 0;

  const handleIdentityFilterChange =
    (key: keyof typeof identityFilters) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setIdentityFilters((current) => ({
        ...current,
        [key]: event.target.value,
      }));
      setPage(0);
    };

  const handleDateChange =
    (key: keyof typeof dateRange) => (event: ChangeEvent<HTMLInputElement>) => {
      setDateRange((current) => ({
        ...current,
        [key]: event.target.value,
      }));
      setPage(0);
    };

  const handleSort = (field: RevenueLedgerSortField) => {
    if (sortBy === field) {
      setSortOrder((currentOrder) => (currentOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(0);
  };

  const resetFilters = () => {
    setStore('');
    setEventTypes([]);
    setDirections([]);
    setBusinessStatuses([]);
    setTenjinDispatchStatuses([]);
    setIdentityFilters({
      productId: '',
      userId: '',
      orderId: '',
    });
    setDateRange({ dateFrom: '', dateTo: '' });
    setSortBy(DEFAULT_SORT_FIELD);
    setSortOrder(DEFAULT_SORT_ORDER);
    setPage(0);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            maxWidth: 1440,
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
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Revenue Ledger
          </Typography>
        </Box>
      </Paper>

      <Box
        sx={{
          maxWidth: 1440,
          mx: 'auto',
          px: { xs: 2, sm: 3, lg: 4 },
          py: 4,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Entries
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {summary.totalEntries}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Positive
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {summary.recordedPositiveCount}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Negative
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {summary.recordedNegativeCount}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Skipped
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {summary.skippedCount}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Missing Amount
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {summary.missingAmountCount}
            </Typography>
          </Paper>
        </Box>

        {summary.byCurrency.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(auto-fit, minmax(150px, 1fr))',
              },
              gap: 1.5,
              mb: 3,
            }}
          >
            {summary.byCurrency.map((currencySummary) => (
              <Paper
                key={currencySummary.currency}
                sx={{ p: 1.5, minWidth: 0 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {currencySummary.currency}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatAmount(
                    currencySummary.netGrossAmount,
                    currencySummary.currency
                  )}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ mt: 0.5 }}
                >
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ lineHeight: 1.35 }}
                  >
                    +
                    {formatAmount(
                      currencySummary.positiveGrossAmount,
                      currencySummary.currency
                    )}{' '}
                    ({currencySummary.positiveCount})
                  </Typography>
                  <Typography
                    variant="caption"
                    color="error.main"
                    sx={{ lineHeight: 1.35 }}
                  >
                    {formatAmount(
                      currencySummary.negativeGrossAmount,
                      currencySummary.currency
                    )}{' '}
                    ({currencySummary.negativeCount})
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Box>
        )}

        {shouldShowUsdRevenueChart && (
          <Paper sx={{ p: { xs: 2, sm: 2.5 }, mb: 3, overflow: 'hidden' }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 1.5, md: 5 }}
              sx={{ mb: 2, alignItems: { xs: 'flex-start', md: 'center' } }}
            >
              <Box>
                <Typography variant="body2" color="primary.main">
                  Total USD revenue
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatUsdTick(usdRevenueChart.totalNet)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Positive revenue
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatUsdTick(usdRevenueChart.totalPositive)}
                </Typography>
              </Box>
              {usdRevenueChart.hasNegativeRevenue && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Negative revenue
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatUsdTick(usdRevenueChart.totalNegative)}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Box
                component="svg"
                role="img"
                aria-label="Daily USD revenue chart"
                viewBox={`0 0 ${usdRevenueChart.width} ${usdRevenueChart.height}`}
                sx={{
                  display: 'block',
                  width: '100%',
                  minWidth: { xs: 640, sm: 0 },
                  height: 'auto',
                }}
              >
                <title>Daily USD revenue chart</title>
                {usdRevenueChart.tickValues.map((value, index) => {
                  const y = usdRevenueChart.yForValue(value);

                  return (
                    <g key={`${value}-${index}`}>
                      <line
                        x1={usdRevenueChart.padding.left}
                        x2={
                          usdRevenueChart.width -
                          usdRevenueChart.padding.right -
                          8
                        }
                        y1={y}
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity="0.12"
                        strokeWidth="1"
                      />
                      <text
                        x={
                          usdRevenueChart.width -
                          usdRevenueChart.padding.right +
                          4
                        }
                        y={y + 4}
                        fill="currentColor"
                        opacity="0.7"
                        fontSize="12"
                      >
                        {formatUsdTick(value)}
                      </text>
                    </g>
                  );
                })}
                {usdRevenueChart.linePath && (
                  <path
                    d={usdRevenueChart.linePath}
                    fill="none"
                    stroke="#75a5ff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {usdRevenueChart.numericPoints.map((point, index) => (
                  <circle
                    key={`${point.date}-${index}`}
                    cx={usdRevenueChart.xForIndex(index)}
                    cy={usdRevenueChart.yForValue(point.net)}
                    r="4.5"
                    fill="#202020"
                    stroke="#75a5ff"
                    strokeWidth="2"
                  >
                    <title>
                      {`${formatChartDate(point.date)}: total ${formatUsdTick(point.net)}, positive ${formatUsdTick(point.positive)}, negative ${formatUsdTick(point.negative)}`}
                    </title>
                  </circle>
                ))}
                {usdRevenueChart.xLabelIndexes.map((index) => {
                  const point = usdRevenueChart.numericPoints[index];

                  return (
                    <text
                      key={point.date}
                      x={usdRevenueChart.xForIndex(index)}
                      y={usdRevenueChart.height - 18}
                      fill="currentColor"
                      opacity="0.68"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {formatChartDate(point.date)}
                    </text>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        )}

        <Paper sx={{ p: 2.5, mb: 3 }}>
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
            <FormControl fullWidth size="small">
              <InputLabel id="ledger-store-label">Store</InputLabel>
              <Select
                labelId="ledger-store-label"
                label="Store"
                value={store}
                onChange={(event) => {
                  setStore(event.target.value as RevenueLedgerStore | '');
                  setPage(0);
                }}
              >
                <MenuItem value="">All</MenuItem>
                {STORE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="ledger-event-type-label">Event type</InputLabel>
              <Select<RevenueLedgerEventType[]>
                multiple
                labelId="ledger-event-type-label"
                label="Event type"
                value={eventTypes}
                input={<OutlinedInput label="Event type" />}
                renderValue={(selected) =>
                  renderSelectChips(selected as string[])
                }
                onChange={(
                  event: SelectChangeEvent<RevenueLedgerEventType[]>
                ) => {
                  setEventTypes(
                    getSelectValue(
                      event.target.value
                    ) as RevenueLedgerEventType[]
                  );
                  setPage(0);
                }}
              >
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="ledger-direction-label">Direction</InputLabel>
              <Select<RevenueLedgerDirection[]>
                multiple
                labelId="ledger-direction-label"
                label="Direction"
                value={directions}
                input={<OutlinedInput label="Direction" />}
                renderValue={(selected) =>
                  renderSelectChips(selected as string[])
                }
                onChange={(
                  event: SelectChangeEvent<RevenueLedgerDirection[]>
                ) => {
                  setDirections(
                    getSelectValue(
                      event.target.value
                    ) as RevenueLedgerDirection[]
                  );
                  setPage(0);
                }}
              >
                {DIRECTION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="ledger-business-status-label">
                Business status
              </InputLabel>
              <Select<RevenueLedgerBusinessStatus[]>
                multiple
                labelId="ledger-business-status-label"
                label="Business status"
                value={businessStatuses}
                input={<OutlinedInput label="Business status" />}
                renderValue={(selected) =>
                  renderSelectChips(selected as string[])
                }
                onChange={(
                  event: SelectChangeEvent<RevenueLedgerBusinessStatus[]>
                ) => {
                  setBusinessStatuses(
                    getSelectValue(
                      event.target.value
                    ) as RevenueLedgerBusinessStatus[]
                  );
                  setPage(0);
                }}
              >
                {BUSINESS_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="ledger-tenjin-status-label">
                Tenjin status
              </InputLabel>
              <Select<TenjinSdkDispatchStatus[]>
                multiple
                labelId="ledger-tenjin-status-label"
                label="Tenjin status"
                value={tenjinDispatchStatuses}
                input={<OutlinedInput label="Tenjin status" />}
                renderValue={(selected) =>
                  renderSelectChips(selected as string[])
                }
                onChange={(
                  event: SelectChangeEvent<TenjinSdkDispatchStatus[]>
                ) => {
                  setTenjinDispatchStatuses(
                    getSelectValue(
                      event.target.value
                    ) as TenjinSdkDispatchStatus[]
                  );
                  setPage(0);
                }}
              >
                {TENJIN_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Product ID"
              size="small"
              value={identityFilters.productId}
              onChange={handleIdentityFilterChange('productId')}
            />
            <TextField
              label="User ID"
              size="small"
              value={identityFilters.userId}
              onChange={handleIdentityFilterChange('userId')}
            />
            <TextField
              label="Order ID"
              size="small"
              value={identityFilters.orderId}
              onChange={handleIdentityFilterChange('orderId')}
            />
            <TextField
              label="From"
              type="datetime-local"
              size="small"
              value={dateRange.dateFrom}
              onChange={handleDateChange('dateFrom')}
              onInput={(event) =>
                handleDateChange('dateFrom')(
                  event as ChangeEvent<HTMLInputElement>
                )
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To"
              type="datetime-local"
              size="small"
              value={dateRange.dateTo}
              onChange={handleDateChange('dateTo')}
              onInput={(event) =>
                handleDateChange('dateTo')(
                  event as ChangeEvent<HTMLInputElement>
                )
              }
              InputLabelProps={{ shrink: true }}
            />
            <Stack
              direction="row"
              spacing={1.5}
              flexWrap="wrap"
              sx={{ alignItems: 'center', minHeight: 40 }}
            >
              <Button
                variant="contained"
                size="small"
                startIcon={<Refresh />}
                onClick={() => setRefreshNonce((current) => current + 1)}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                disabled={!hasActiveFilters}
                onClick={resetFilters}
              >
                Clear
              </Button>
            </Stack>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sortDirection={sortBy === 'createdAt' ? sortOrder : false}
                >
                  <TableSortLabel
                    active={sortBy === 'createdAt'}
                    direction={sortBy === 'createdAt' ? sortOrder : 'desc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    {SORT_LABELS.createdAt}
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={sortBy === 'eventTime' ? sortOrder : false}
                >
                  <TableSortLabel
                    active={sortBy === 'eventTime'}
                    direction={sortBy === 'eventTime' ? sortOrder : 'desc'}
                    onClick={() => handleSort('eventTime')}
                  >
                    {SORT_LABELS.eventTime}
                  </TableSortLabel>
                </TableCell>
                <TableCell>Store</TableCell>
                <TableCell>Event type</TableCell>
                <TableCell>Direction</TableCell>
                <TableCell
                  sortDirection={sortBy === 'grossAmount' ? sortOrder : false}
                >
                  <TableSortLabel
                    active={sortBy === 'grossAmount'}
                    direction={sortBy === 'grossAmount' ? sortOrder : 'desc'}
                    onClick={() => handleSort('grossAmount')}
                  >
                    {SORT_LABELS.grossAmount}
                  </TableSortLabel>
                </TableCell>
                <TableCell>Product ID</TableCell>
                <TableCell>Business status</TableCell>
                <TableCell>Tenjin status</TableCell>
                <TableCell>Order / Transaction</TableCell>
                <TableCell>User ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !error && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No ledger rows match the current filters
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                items.map((entry) => {
                  const identityLines = getIdentityLines(entry);

                  return (
                    <TableRow key={entry.id} hover>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Typography variant="body2">
                          {formatDateTime(entry.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        {formatDateTime(entry.eventTime)}
                      </TableCell>
                      <TableCell>{formatEnumLabel(entry.store)}</TableCell>
                      <TableCell>{formatLedgerEventTypeLabel(entry)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={formatEnumLabel(entry.direction)}
                          color={getDirectionChipColor(entry.direction)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {formatAmount(entry.grossAmount, entry.currency)}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="body2" noWrap>
                          {entry.productId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={formatEnumLabel(entry.businessStatus)}
                          color={getStatusChipColor(entry.businessStatus)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={formatEnumLabel(entry.tenjinDispatchStatus)}
                          color={getTenjinChipColor(entry.tenjinDispatchStatus)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 240, maxWidth: 360 }}>
                        {identityLines.length > 0 ? (
                          identityLines.map((line) => (
                            <Typography
                              key={line}
                              variant="caption"
                              display="block"
                              sx={{ wordBreak: 'break-all' }}
                            >
                              {line}
                            </Typography>
                          ))
                        ) : (
                          <Typography color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography
                          variant="caption"
                          sx={{ wordBreak: 'break-all' }}
                        >
                          {entry.userId ?? '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={PAGE_SIZE_OPTIONS}
            onPageChange={(_event, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
          />
        </TableContainer>
      </Box>
    </Box>
  );
}

export default function RevenueLedgerPage() {
  return (
    <ProtectedRoute>
      <RevenueLedgerAccessGate>
        <RevenueLedgerContent />
      </RevenueLedgerAccessGate>
    </ProtectedRoute>
  );
}
