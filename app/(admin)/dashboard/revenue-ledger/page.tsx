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

function toIsoTimestampFromLocalDateTime(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function getStatusChipColor(
  status: RevenueLedgerBusinessStatus,
): 'default' | 'success' | 'warning' {
  return status === 'recorded' ? 'success' : 'warning';
}

function getDirectionChipColor(
  direction: RevenueLedgerDirection,
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
  status: TenjinSdkDispatchStatus,
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
    entry.originalTransactionId ? `Original: ${entry.originalTransactionId}` : null,
    entry.purchaseToken ? `Token: ${entry.purchaseToken}` : null,
  ].filter((value): value is string => Boolean(value));
}

export default function RevenueLedgerPage() {
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
    purchaseToken: '',
    transactionId: '',
    originalTransactionId: '',
  });
  const [dateRange, setDateRange] = useState({
    dateFrom: '',
    dateTo: '',
  });
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
      purchaseToken: identityFilters.purchaseToken.trim() || undefined,
      transactionId: identityFilters.transactionId.trim() || undefined,
      originalTransactionId:
        identityFilters.originalTransactionId.trim() || undefined,
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
    ],
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
            : 'Failed to load revenue ledger',
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
    (key: keyof typeof dateRange) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setDateRange((current) => ({
        ...current,
        [key]: event.target.value,
      }));
      setPage(0);
    };

  const handleSort = (field: RevenueLedgerSortField) => {
    if (sortBy === field) {
      setSortOrder((currentOrder) =>
        currentOrder === 'asc' ? 'desc' : 'asc',
      );
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
      purchaseToken: '',
      transactionId: '',
      originalTransactionId: '',
    });
    setDateRange({ dateFrom: '', dateTo: '' });
    setSortBy(DEFAULT_SORT_FIELD);
    setSortOrder(DEFAULT_SORT_ORDER);
    setPage(0);
  };

  return (
    <ProtectedRoute>
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
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 2,
                mb: 3,
              }}
            >
              {summary.byCurrency.map((currencySummary) => (
                <Paper key={currencySummary.currency} sx={{ p: 2.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {currencySummary.currency}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatAmount(
                      currencySummary.netGrossAmount,
                      currencySummary.currency,
                    )}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="success.main">
                      +{formatAmount(
                        currencySummary.positiveGrossAmount,
                        currencySummary.currency,
                      )}{' '}
                      ({currencySummary.positiveCount})
                    </Typography>
                    <Typography variant="caption" color="error.main">
                      {formatAmount(
                        currencySummary.negativeGrossAmount,
                        currencySummary.currency,
                      )}{' '}
                      ({currencySummary.negativeCount})
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Box>
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
                  onChange={(event: SelectChangeEvent<RevenueLedgerEventType[]>) => {
                    setEventTypes(
                      getSelectValue(event.target.value) as RevenueLedgerEventType[],
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
                  onChange={(event: SelectChangeEvent<RevenueLedgerDirection[]>) => {
                    setDirections(
                      getSelectValue(event.target.value) as RevenueLedgerDirection[],
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
                    event: SelectChangeEvent<RevenueLedgerBusinessStatus[]>,
                  ) => {
                    setBusinessStatuses(
                      getSelectValue(
                        event.target.value,
                      ) as RevenueLedgerBusinessStatus[],
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
                    event: SelectChangeEvent<TenjinSdkDispatchStatus[]>,
                  ) => {
                    setTenjinDispatchStatuses(
                      getSelectValue(
                        event.target.value,
                      ) as TenjinSdkDispatchStatus[],
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
                label="Purchase token"
                size="small"
                value={identityFilters.purchaseToken}
                onChange={handleIdentityFilterChange('purchaseToken')}
              />
              <TextField
                label="Transaction ID"
                size="small"
                value={identityFilters.transactionId}
                onChange={handleIdentityFilterChange('transactionId')}
              />
              <TextField
                label="Original transaction ID"
                size="small"
                value={identityFilters.originalTransactionId}
                onChange={handleIdentityFilterChange('originalTransactionId')}
              />
              <TextField
                label="From"
                type="datetime-local"
                size="small"
                value={dateRange.dateFrom}
                onChange={handleDateChange('dateFrom')}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="To"
                type="datetime-local"
                size="small"
                value={dateRange.dateTo}
                onChange={handleDateChange('dateTo')}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} flexWrap="wrap">
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
                  <TableCell sortDirection={sortBy === 'createdAt' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortBy === 'createdAt'}
                      direction={sortBy === 'createdAt' ? sortOrder : 'desc'}
                      onClick={() => handleSort('createdAt')}
                    >
                      {SORT_LABELS.createdAt}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === 'eventTime' ? sortOrder : false}>
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
                  <TableCell sortDirection={sortBy === 'grossAmount' ? sortOrder : false}>
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
                        <TableCell>{formatEnumLabel(entry.eventType)}</TableCell>
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
                            color={getTenjinChipColor(
                              entry.tenjinDispatchStatus,
                            )}
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
    </ProtectedRoute>
  );
}
