'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  ExpandMore,
  Refresh,
  Search,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  FixtureEvaluationGroup,
  getPredictionEvaluationGroups,
  PredictionEvaluationGroupSortField,
  PredictionEvaluationGroupSortOrder,
  PredictionEvaluationOutcomeType,
  PaginatedPredictionEvaluationGroupsResponse,
  PredictionEvaluationSlotKey,
  PredictionEvaluationSourceType,
  PredictionEvaluationStatus,
  PredictionEvaluationSummary,
} from '@/lib/api/prediction-evaluations';
import {
  PERIOD_PRESET_OPTIONS,
  PredictionEvaluationPeriodPreset,
  getPeriodPresetIsoRange,
  toIsoTimestampFromLocalDateTime,
  toLocalDateTimeInputValueFromIso,
} from './period-filter';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_OPTIONS: Array<{
  value: PredictionEvaluationStatus;
  label: string;
}> = [
  { value: 'evaluated', label: 'Evaluated' },
  { value: 'not_found', label: 'Not Found' },
  { value: 'unsupported', label: 'Unsupported' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
];

const DEFAULT_SORT_FIELD: PredictionEvaluationGroupSortField =
  'prediction_created_at';
const DEFAULT_SORT_ORDER: PredictionEvaluationGroupSortOrder = 'desc';
const DEFAULT_PERIOD_PRESET: Exclude<
  PredictionEvaluationPeriodPreset,
  'custom'
> = 'last_7_days';

const SORT_FIELD_OPTIONS: Array<{
  value: PredictionEvaluationGroupSortField;
  label: string;
}> = [
  { value: 'prediction_created_at', label: 'Prediction created' },
  { value: 'fixture_time', label: 'Fixture time' },
  { value: 'status', label: 'Status' },
  { value: 'total', label: 'Total' },
  { value: 'evaluated', label: 'Evaluated' },
  { value: 'correct', label: 'Correct' },
  { value: 'accuracy', label: 'Accuracy' },
  { value: 'pending', label: 'Pending' },
  { value: 'not_found', label: 'Not Found' },
  { value: 'unsupported', label: 'Unsupported' },
  { value: 'failed', label: 'Failed' },
];

const SOURCE_OPTIONS: Array<{
  value: PredictionEvaluationSourceType;
  label: string;
}> = [
  { value: 'match_prediction', label: 'Match Prediction' },
  { value: 'prediction_session', label: 'Prediction Session' },
];

const SLOT_OPTIONS: Array<{
  value: PredictionEvaluationSlotKey;
  label: string;
}> = [
  { value: 'primary', label: 'Primary' },
  { value: 'safe', label: 'Safe' },
  { value: 'risky', label: 'Risky' },
];

const EMPTY_SUMMARY: PredictionEvaluationSummary = {
  fixtureCount: 0,
  predictionCount: 0,
  total: 0,
  evaluated: 0,
  correct: 0,
  accuracy: null,
  pending: 0,
  notFound: 0,
  unsupported: 0,
  failed: 0,
  safe: {
    evaluated: 0,
    correct: 0,
    accuracy: null,
  },
  risky: {
    evaluated: 0,
    correct: 0,
    accuracy: null,
  },
};

function formatDateTime(dateString: string | null): string {
  if (!dateString) {
    return '-';
  }

  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPercentage(value: number | null): string {
  if (value === null) {
    return '-';
  }

  return `${value.toFixed(value % 1 === 0 ? 0 : 2)}%`;
}

function formatFixtureLabel(group: FixtureEvaluationGroup): string {
  if (group.homeTeamName && group.awayTeamName) {
    return `${group.homeTeamName} vs ${group.awayTeamName}`;
  }

  if (group.homeTeamName) {
    return group.homeTeamName;
  }

  if (group.awayTeamName) {
    return group.awayTeamName;
  }

  return `Fixture ${group.fixtureId}`;
}

function getStatusChipColor(
  status: PredictionEvaluationStatus,
): 'default' | 'warning' | 'success' | 'error' {
  if (status === 'pending') {
    return 'warning';
  }

  if (status === 'evaluated') {
    return 'success';
  }

  if (status === 'not_found') {
    return 'error';
  }

  if (status === 'failed') {
    return 'error';
  }

  return 'default';
}

function getStatusLabel(status: PredictionEvaluationStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'evaluated':
      return 'Evaluated';
    case 'not_found':
      return 'Not Found';
    case 'unsupported':
      return 'Unsupported';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
}

function getOutcomeChipColor(
  outcomeType: PredictionEvaluationOutcomeType,
): 'success' | 'error' | 'default' {
  if (outcomeType === 'win') {
    return 'success';
  }

  if (outcomeType === 'loss') {
    return 'error';
  }

  return 'default';
}

function getOutcomeLabel(
  outcomeType: PredictionEvaluationOutcomeType,
): string {
  switch (outcomeType) {
    case 'win':
      return 'Win';
    case 'loss':
      return 'Loss';
    case 'void':
      return 'Void';
    default:
      return outcomeType;
  }
}

function getSourceChipColor(
  sourceType: PredictionEvaluationSourceType,
): 'primary' | 'secondary' {
  return sourceType === 'match_prediction' ? 'primary' : 'secondary';
}

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
        <Chip key={value} label={value} size="small" />
      ))}
    </Box>
  );
}

function getSortOrderOptions(
): Array<{
  value: PredictionEvaluationGroupSortOrder;
  label: string;
}> {
  return [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ];
}

export default function PredictionEvaluationsPage() {
  const [items, setItems] = useState<FixtureEvaluationGroup[]>([]);
  const [summary, setSummary] = useState<PredictionEvaluationSummary>(
    EMPTY_SUMMARY,
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<PredictionEvaluationStatus[]>([]);
  const [sourceTypes, setSourceTypes] = useState<PredictionEvaluationSourceType[]>(
    [],
  );
  const [slotKeys, setSlotKeys] = useState<PredictionEvaluationSlotKey[]>([]);
  const [marketKeys, setMarketKeys] = useState<string[]>([]);
  const [marketOptions, setMarketOptions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState(() => {
    const defaultRange = getPeriodPresetIsoRange(DEFAULT_PERIOD_PRESET);
    return {
      dateFrom: defaultRange.dateFrom ?? '',
      dateTo: defaultRange.dateTo ?? '',
    };
  });
  const [periodPreset, setPeriodPreset] =
    useState<PredictionEvaluationPeriodPreset>(DEFAULT_PERIOD_PRESET);
  const [sortField, setSortField] = useState<PredictionEvaluationGroupSortField>(
    DEFAULT_SORT_FIELD,
  );
  const [sortOrder, setSortOrder] = useState<PredictionEvaluationGroupSortOrder>(
    DEFAULT_SORT_ORDER,
  );
  const [expandedFixtureId, setExpandedFixtureId] = useState<number | null>(
    null,
  );
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadGroups() {
      setIsLoading(true);
      setError(null);

      try {
        const response: PaginatedPredictionEvaluationGroupsResponse =
          await getPredictionEvaluationGroups({
            page: page + 1,
            limit: rowsPerPage,
            search: search.trim() || undefined,
            statuses: statuses.length > 0 ? statuses : undefined,
            sourceTypes: sourceTypes.length > 0 ? sourceTypes : undefined,
            slotKeys: slotKeys.length > 0 ? slotKeys : undefined,
            marketKeys: marketKeys.length > 0 ? marketKeys : undefined,
            dateFrom: dateRange.dateFrom || undefined,
            dateTo: dateRange.dateTo || undefined,
            sortBy: sortField,
            sortOrder,
          });

        if (!active) {
          return;
        }

        setItems(response.items);
        setSummary(response.summary || EMPTY_SUMMARY);
        setTotal(response.total || 0);

        const nextMarketOptions = Array.from(
          new Set(
            [
              ...marketKeys,
              ...response.items.flatMap((group) =>
                group.predictions
                  .map((prediction) => prediction.marketKey)
                  .filter((marketKey): marketKey is string => Boolean(marketKey)),
              ),
            ].sort(),
          ),
        );
        setMarketOptions(nextMarketOptions);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load prediction evaluations',
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadGroups();

    return () => {
      active = false;
    };
  }, [
    page,
    rowsPerPage,
    search,
    statuses,
    sourceTypes,
    slotKeys,
    marketKeys,
    dateRange,
    sortField,
    sortOrder,
    refreshNonce,
  ]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    statuses.length > 0 ||
    sourceTypes.length > 0 ||
    slotKeys.length > 0 ||
    marketKeys.length > 0 ||
    periodPreset !== DEFAULT_PERIOD_PRESET ||
    sortField !== DEFAULT_SORT_FIELD ||
    sortOrder !== DEFAULT_SORT_ORDER;

  const handlePeriodPresetChange = (
    nextPreset: PredictionEvaluationPeriodPreset,
  ) => {
    setPeriodPreset(nextPreset);

    if (nextPreset === 'custom') {
      setPage(0);
      return;
    }

    const { dateFrom: nextDateFrom, dateTo: nextDateTo } =
      getPeriodPresetIsoRange(
        nextPreset,
      );
    setDateRange({
      dateFrom: nextDateFrom ?? '',
      dateTo: nextDateTo ?? '',
    });
    setPage(0);
  };

  const handleDateFromChange = (value: string) => {
    const nextDateFrom = toIsoTimestampFromLocalDateTime(value) ?? '';
    setDateRange((currentRange) => ({
      ...currentRange,
      dateFrom: nextDateFrom,
    }));
    setPeriodPreset(value || dateRange.dateTo ? 'custom' : 'all_time');
    setPage(0);
  };

  const handleDateToChange = (value: string) => {
    const nextDateTo = toIsoTimestampFromLocalDateTime(value) ?? '';
    setDateRange((currentRange) => ({
      ...currentRange,
      dateTo: nextDateTo,
    }));
    setPeriodPreset(dateRange.dateFrom || value ? 'custom' : 'all_time');
    setPage(0);
  };

  const displayedDateFrom = toLocalDateTimeInputValueFromIso(
    dateRange.dateFrom,
  );
  const displayedDateTo = toLocalDateTimeInputValueFromIso(dateRange.dateTo);

  const sortOrderOptions = getSortOrderOptions();

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              maxWidth: 1280,
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
            <Box>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                Prediction Evaluation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review grouped evaluation results by fixture, source, slot, and
                market.
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box
          sx={{
            maxWidth: 1280,
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
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(6, 1fr)',
              },
              gap: 2,
              mb: 3,
            }}
          >
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Fixture Groups
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {summary.fixtureCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.predictionCount} predictions in scope
              </Typography>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Safe Accuracy
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {formatPercentage(summary.safe.accuracy)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.safe.correct} correct out of {summary.safe.evaluated}{' '}
                evaluated
              </Typography>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Risky Accuracy
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {formatPercentage(summary.risky.accuracy)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.risky.correct} correct out of {summary.risky.evaluated}{' '}
                evaluated
              </Typography>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {summary.pending}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Awaiting evaluation
              </Typography>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Not Found
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {summary.notFound}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Result missing after the settlement grace window
              </Typography>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Failed / Unsupported
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {summary.failed + summary.unsupported}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.failed} failed, {summary.unsupported} unsupported
              </Typography>
            </Paper>
          </Box>

          <Paper sx={{ p: 2.5, mb: 3 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 2,
                alignItems: 'start',
              }}
            >
              <TextField
                size="small"
                label="Search"
                placeholder="Fixture, teams, league..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <FormControl size="small">
                <InputLabel id="prediction-evaluation-period-label">
                  Period
                </InputLabel>
                <Select<PredictionEvaluationPeriodPreset>
                  labelId="prediction-evaluation-period-label"
                  value={periodPreset}
                  label="Period"
                  onChange={(event) =>
                    handlePeriodPresetChange(
                      event.target.value as PredictionEvaluationPeriodPreset,
                    )
                  }
                >
                  {PERIOD_PRESET_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="From"
                type="datetime-local"
                value={displayedDateFrom}
                onChange={(event) => {
                  handleDateFromChange(event.target.value);
                }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                size="small"
                label="To"
                type="datetime-local"
                value={displayedDateTo}
                onChange={(event) => {
                  handleDateToChange(event.target.value);
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box
              sx={{
                mt: 2,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              <FormControl size="small">
                <InputLabel id="prediction-evaluation-statuses-label">
                  Status
                </InputLabel>
                <Select<string[]>
                  labelId="prediction-evaluation-statuses-label"
                  multiple
                  value={statuses}
                  onChange={(event: SelectChangeEvent<string[]>) => {
                    setStatuses(
                      getSelectValue(event.target.value) as PredictionEvaluationStatus[],
                    );
                    setPage(0);
                  }}
                  input={<OutlinedInput label="Status" />}
                  renderValue={(selected) =>
                    renderSelectChips(selected as string[])
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel id="prediction-evaluation-sources-label">
                  Source
                </InputLabel>
                <Select<string[]>
                  labelId="prediction-evaluation-sources-label"
                  multiple
                  value={sourceTypes}
                  onChange={(event: SelectChangeEvent<string[]>) => {
                    setSourceTypes(
                      getSelectValue(event.target.value) as PredictionEvaluationSourceType[],
                    );
                    setPage(0);
                  }}
                  input={<OutlinedInput label="Source" />}
                  renderValue={(selected) =>
                    renderSelectChips(selected as string[])
                  }
                >
                  {SOURCE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel id="prediction-evaluation-slots-label">Slot</InputLabel>
                <Select<string[]>
                  labelId="prediction-evaluation-slots-label"
                  multiple
                  value={slotKeys}
                  onChange={(event: SelectChangeEvent<string[]>) => {
                    setSlotKeys(
                      getSelectValue(event.target.value) as PredictionEvaluationSlotKey[],
                    );
                    setPage(0);
                  }}
                  input={<OutlinedInput label="Slot" />}
                  renderValue={(selected) =>
                    renderSelectChips(selected as string[])
                  }
                >
                  {SLOT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                multiple
                freeSolo
                options={marketOptions}
                value={marketKeys}
                onChange={(_event, value) => {
                  setMarketKeys(
                    Array.from(
                      new Set(value.map((item) => item.trim()).filter(Boolean)),
                    ),
                  );
                  setPage(0);
                }}
                renderInput={(params) => (
                  <TextField {...params} size="small" label="Market" />
                )}
              />
            </Box>

            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel id="prediction-evaluation-sort-field-label">
                    Sort by
                  </InputLabel>
                  <Select<PredictionEvaluationGroupSortField>
                    labelId="prediction-evaluation-sort-field-label"
                    value={sortField}
                    label="Sort by"
                    onChange={(event) => {
                      setSortField(
                        event.target.value as PredictionEvaluationGroupSortField,
                      );
                      setExpandedFixtureId(null);
                      setPage(0);
                    }}
                  >
                    {SORT_FIELD_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel id="prediction-evaluation-sort-order-label">
                    Order
                  </InputLabel>
                  <Select<PredictionEvaluationGroupSortOrder>
                    labelId="prediction-evaluation-sort-order-label"
                    value={sortOrder}
                    label="Order"
                    onChange={(event) => {
                      setSortOrder(
                        event.target.value as PredictionEvaluationGroupSortOrder,
                      );
                      setExpandedFixtureId(null);
                      setPage(0);
                    }}
                  >
                    {sortOrderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearch('');
                    setStatuses([]);
                    setSourceTypes([]);
                    setSlotKeys([]);
                    setMarketKeys([]);
                    const defaultRange =
                      getPeriodPresetIsoRange(DEFAULT_PERIOD_PRESET);
                    setDateRange({
                      dateFrom: defaultRange.dateFrom ?? '',
                      dateTo: defaultRange.dateTo ?? '',
                    });
                    setPeriodPreset(DEFAULT_PERIOD_PRESET);
                    setSortField(DEFAULT_SORT_FIELD);
                    setSortOrder(DEFAULT_SORT_ORDER);
                    setExpandedFixtureId(null);
                    setPage(0);
                  }}
                  disabled={!hasActiveFilters}
                >
                  Reset filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => setRefreshNonce((value) => value + 1)}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Paper
              sx={{
                p: 5,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Paper>
          ) : items.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {hasActiveFilters
                  ? 'No fixtures match the current filters'
                  : 'No prediction evaluations available'}
              </Typography>
              <Typography color="text.secondary">
                {hasActiveFilters
                  ? 'Try widening the search, date range, or market filters.'
                  : 'The evaluation table is empty for the current environment.'}
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={1.5}>
              {items.map((group) => (
                <Accordion
                  key={group.fixtureId}
                  expanded={expandedFixtureId === group.fixtureId}
                  onChange={(_event, isExpanded) =>
                    setExpandedFixtureId(isExpanded ? group.fixtureId : null)
                  }
                  disableGutters
                  elevation={0}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '18px !important',
                    overflow: 'hidden',
                    '&::before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      px: 2.5,
                      py: 1.25,
                      '& .MuiAccordionSummary-content': {
                        my: 0.5,
                      },
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 2,
                          flexWrap: 'wrap',
                          mb: 1.5,
                        }}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            {formatFixtureLabel(group)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {group.leagueName || 'Unknown league'} •{' '}
                            {formatDateTime(group.fixtureTime)}
                          </Typography>
                        </Box>

                        <Chip
                          label={`Fixture #${group.fixtureId}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: 'repeat(2, minmax(0, 1fr))',
                            md: 'repeat(7, minmax(0, 1fr))',
                          },
                          gap: 1,
                        }}
                      >
                        <Paper variant="outlined" sx={{ p: 1.25 }}>
                          <Typography variant="caption" color="text.secondary">
                            Total
                          </Typography>
                          <Typography fontWeight={700}>
                            {group.stats.total}
                          </Typography>
                        </Paper>
                        <Paper variant="outlined" sx={{ p: 1.25 }}>
                          <Typography variant="caption" color="text.secondary">
                            Evaluated
                          </Typography>
                          <Typography fontWeight={700}>
                            {group.stats.evaluated}
                          </Typography>
                        </Paper>
                        <Paper variant="outlined" sx={{ p: 1.25 }}>
                          <Typography variant="caption" color="text.secondary">
                            Correct
                          </Typography>
                          <Typography fontWeight={700}>
                            {group.stats.correct}
                          </Typography>
                        </Paper>
                        <Paper variant="outlined" sx={{ p: 1.25 }}>
                          <Typography variant="caption" color="text.secondary">
                            Safe Accuracy
                          </Typography>
                          <Typography fontWeight={700}>
                            {formatPercentage(group.stats.safe.accuracy)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {group.stats.safe.correct}/{group.stats.safe.evaluated}
                          </Typography>
                        </Paper>
                        <Paper variant="outlined" sx={{ p: 1.25 }}>
                          <Typography variant="caption" color="text.secondary">
                            Risky Accuracy
                          </Typography>
                          <Typography fontWeight={700}>
                            {formatPercentage(group.stats.risky.accuracy)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {group.stats.risky.correct}/{group.stats.risky.evaluated}
                          </Typography>
                        </Paper>
                        <Paper variant="outlined" sx={{ p: 1.25 }}>
                          <Typography variant="caption" color="text.secondary">
                            Pending / Not Found
                          </Typography>
                          <Typography fontWeight={700}>
                            {group.stats.pending} / {group.stats.notFound}
                          </Typography>
                        </Paper>
                        <Paper variant="outlined" sx={{ p: 1.25 }}>
                          <Typography variant="caption" color="text.secondary">
                            Unsupported / Failed
                          </Typography>
                          <Typography fontWeight={700}>
                            {group.stats.unsupported} / {group.stats.failed}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0.5 }}>
                    <Stack spacing={1.25}>
                      {group.predictions.map((prediction) => (
                        <Paper
                          key={prediction.id}
                          variant="outlined"
                          sx={{ p: 1.5 }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 1,
                              flexWrap: 'wrap',
                              mb: 1,
                            }}
                          >
                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                              <Chip
                                label={
                                  prediction.sourceType === 'match_prediction'
                                    ? 'Match Prediction'
                                    : 'Prediction Session'
                                }
                                color={getSourceChipColor(prediction.sourceType)}
                                size="small"
                              />
                              <Chip
                                label={prediction.slotKey}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={getStatusLabel(prediction.status)}
                                color={getStatusChipColor(prediction.status)}
                                size="small"
                                variant={
                                  prediction.status === 'unsupported'
                                    ? 'outlined'
                                    : 'filled'
                                }
                              />
                              {prediction.status === 'evaluated' &&
                                prediction.outcomeType && (
                                  <Chip
                                    label={getOutcomeLabel(prediction.outcomeType)}
                                    color={getOutcomeChipColor(
                                      prediction.outcomeType,
                                    )}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                            </Box>

                            <Typography variant="caption" color="text.secondary">
                              Created {formatDateTime(prediction.createdAt)}
                            </Typography>
                          </Box>

                          <Typography variant="subtitle1" fontWeight={700}>
                            {prediction.predictionValue}
                          </Typography>

                          <Box
                            sx={{
                              mt: 1,
                              display: 'grid',
                              gridTemplateColumns: {
                                xs: 'repeat(2, minmax(0, 1fr))',
                                md: 'repeat(5, minmax(0, 1fr))',
                              },
                              gap: 1,
                            }}
                          >
                            <Paper variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Market
                              </Typography>
                              <Typography fontWeight={600}>
                                {prediction.marketKey || '-'}
                              </Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Confidence
                              </Typography>
                              <Typography fontWeight={600}>
                                {prediction.confidenceValue ?? '-'}
                              </Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Odds
                              </Typography>
                              <Typography fontWeight={600}>
                                {prediction.oddsValue ?? '-'}
                              </Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Outcome
                              </Typography>
                              <Typography fontWeight={600}>
                                {prediction.outcomeType
                                  ? getOutcomeLabel(prediction.outcomeType)
                                  : '-'}
                              </Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Evaluated At
                              </Typography>
                              <Typography fontWeight={600}>
                                {formatDateTime(prediction.evaluatedAt)}
                              </Typography>
                            </Paper>
                          </Box>

                          {prediction.reasonCode && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1.25 }}
                            >
                              Reason: {prediction.reasonCode}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          )}

          <Paper sx={{ mt: 3 }}>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_event, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={PAGE_SIZE_OPTIONS}
              labelRowsPerPage="Fixture groups per page"
            />
          </Paper>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
