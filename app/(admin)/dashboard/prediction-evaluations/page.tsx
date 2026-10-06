'use client';

import { Fragment, useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  ButtonBase,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import {
  ExpandMore,
  Refresh,
  Search,
} from '@mui/icons-material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  FixtureEvaluationGroup,
  getPredictionEvaluationGroups,
  PredictionEvaluationItem,
  PredictionEvaluationGroupSortField,
  PredictionEvaluationGroupSortOrder,
  PredictionEvaluationOutcomeType,
  PaginatedPredictionEvaluationGroupsResponse,
  PredictionEvaluationScope,
  PredictionEvaluationStatus,
  PredictionEvaluationSummary,
  PredictionEvaluationV9Metrics,
  PredictionEvaluationV9Summary,
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

const SCOPE_OPTIONS: Array<{ value: PredictionEvaluationScope; label: string }> = [
  { value: 'all', label: 'All predictions' },
  { value: 'top_picks', label: 'Top Picks' },
  { value: 'other', label: 'Other predictions' },
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
    averageOdds: null,
  },
  risky: {
    evaluated: 0,
    correct: 0,
    accuracy: null,
    averageOdds: null,
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

function formatOdds(value: number | null): string {
  if (value === null) {
    return '-';
  }

  return value.toFixed(2);
}

function parseOddsInput(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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

const METRIC_COLUMNS = [
  'Predictions',
  'Matches',
  'Evaluated',
  'Correct',
  'Accuracy',
  'Average reference odds',
  'Pending',
  'Not Found',
  'Unsupported',
  'Failed',
];

const TABLE_SX = {
  '& th': { color: 'text.secondary', fontWeight: 600, verticalAlign: 'bottom' },
  '& td': { verticalAlign: 'top' },
  '& th, & td': { px: 1.5, py: 1.25 },
  '& td:not(:first-of-type)': { fontVariantNumeric: 'tabular-nums' },
};

function V9MetricCells({
  metrics,
}: {
  metrics: PredictionEvaluationV9Metrics;
}) {
  return (
    <>
      {[
        metrics.predictionCount,
        metrics.fixtureCount,
        metrics.evaluated,
        metrics.correct,
        formatPercentage(metrics.accuracy),
        formatOdds(metrics.averageOdds),
        metrics.pending,
        metrics.notFound,
        metrics.unsupported,
        metrics.failed,
      ].map((value, index) => (
        <TableCell align="right" key={METRIC_COLUMNS[index]}>
          {value}
        </TableCell>
      ))}
    </>
  );
}

function V9MetricsTable({
  title,
  rows,
  labelColumn = 'Scope',
}: {
  title: string;
  rows: Array<PredictionEvaluationV9Metrics & { label: string }>;
  labelColumn?: string;
}) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table
        size="small"
        aria-label={title}
        sx={{ ...TABLE_SX, minWidth: 1050 }}
      >
        <TableHead>
          <TableRow>
            <TableCell>{labelColumn}</TableCell>
            {METRIC_COLUMNS.map((label) => (
              <TableCell key={label} align="right">
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell component="th" scope="row">
                {row.label}
              </TableCell>
              <V9MetricCells metrics={row} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function V9Summary({ summary, scopeLabel }: { summary: PredictionEvaluationV9Summary; scopeLabel: string }) {
  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Generated V9
        </Typography>
        <V9MetricsTable
          title="Generated V9 summary"
          rows={[{ ...summary, label: scopeLabel }]}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Accuracy uses settlement credit / weight. Evaluated includes void
          results, which have zero weight.
          {summary.accuracy === null &&
            ' No evaluated outcomes with nonzero weight.'}
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          By market
        </Typography>
        <V9MetricsTable
          title="By market"
          labelColumn="Market"
          rows={summary.byMarket.map((row) => ({
            ...row,
            label: row.marketKey ?? 'Unrecognized market',
          }))}
        />
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          By reference odds
        </Typography>
        <V9MetricsTable
          title="By reference odds"
          labelColumn="Reference odds range"
          rows={summary.byOdds.map((row) => ({
            ...row,
            label:
              row.lowerInclusive === null
                ? 'No reference odds'
                : `[${row.lowerInclusive}, ${row.upperExclusive ?? '∞'})`,
          }))}
        />
      </Box>
    </Stack>
  );
}

function formatPredictionLabel(prediction: PredictionEvaluationItem): string {
  return prediction.sourceType === 'published_prediction'
    ? `${prediction.selectionLabel ?? prediction.selectionKey ?? prediction.predictionValue}${prediction.line == null ? '' : ` ${prediction.line}`} · ${prediction.periodKey ?? '-'}`
    : prediction.predictionValue;
}

function PredictionDetailsTable({ group }: { group: FixtureEvaluationGroup }) {
  const predictions = group.predictions;
  return (
    <Stack spacing={2}>
      <TableContainer component={Paper} variant="outlined">
        <Table
          size="small"
          aria-label={`Predictions for ${formatFixtureLabel(group)}`}
          sx={{ ...TABLE_SX, minWidth: 1500 }}
        >
          <TableHead>
            <TableRow>
              {[
                'Prediction',
                'Market',
                'Value',
                'Conservative EV',
                'Confidence',
                'Reference odds',
                'Status',
                'Outcome',
                'Created',
                'Evaluated At',
                'Reason',
              ].map((label) => (
                <TableCell key={label}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {predictions.map((prediction) => (
              <TableRow key={prediction.id}>
                <TableCell sx={{ minWidth: 170, fontWeight: 600 }}>
                  {formatPredictionLabel(prediction)}
                </TableCell>
                <TableCell>
                  {prediction.canonicalMarketKey ?? prediction.marketKey ?? '-'}
                </TableCell>
                <TableCell>{prediction.isValue == null ? '-' : prediction.isValue ? 'Yes' : 'No'}</TableCell>
                <TableCell align="right">{prediction.conservativeEv == null ? '-' : prediction.conservativeEv}</TableCell>
                <TableCell align="right">
                  {prediction.confidenceValue ?? '-'}
                </TableCell>
                <TableCell align="right">
                  {formatOdds(prediction.oddsValue)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      prediction.reasonCode === 'awaiting_evaluation'
                        ? 'Awaiting processing'
                        : getStatusLabel(prediction.status)
                    }
                    color={getStatusChipColor(prediction.status)}
                    size="small"
                    variant={
                      prediction.status === 'unsupported'
                        ? 'outlined'
                        : 'filled'
                    }
                  />
                </TableCell>
                <TableCell>
                  {prediction.outcomeType ? (
                    <Chip
                      label={getOutcomeLabel(prediction.outcomeType)}
                      color={getOutcomeChipColor(prediction.outcomeType)}
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  {formatDateTime(
                    prediction.sourceCreatedAt ?? prediction.createdAt
                  )}
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  {formatDateTime(prediction.evaluatedAt)}
                </TableCell>
                <TableCell>
                  {prediction.reasonCode === 'awaiting_evaluation'
                    ? 'Awaiting processing'
                    : (prediction.reasonCode ?? '-')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {predictions.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Source versions
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table
              size="small"
              aria-label={`Source versions for ${formatFixtureLabel(group)}`}
              sx={{ ...TABLE_SX, minWidth: 1100 }}
            >
              <TableHead>
                <TableRow>
                  {[
                    'Prediction',
                    'Revision',
                    'Version',
                    'Published',
                    'Withdrawn',
                  ].map((label) => (
                    <TableCell key={label}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {predictions.map((prediction) => (
                  <TableRow key={prediction.id}>
                    <TableCell>{formatPredictionLabel(prediction)}</TableCell>
                    <TableCell>{prediction.revision ?? '-'}</TableCell>
                    <TableCell
                      sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}
                    >
                      {prediction.sourceId}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(prediction.publishedAt ?? null)}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(prediction.withdrawnAt ?? null)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Stack>
  );
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
  const [predictionScope, setPredictionScope] = useState<PredictionEvaluationScope>('all');
  const [marketKeys, setMarketKeys] = useState<string[]>([]);
  const [marketOptions, setMarketOptions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState(() => {
    const defaultRange = getPeriodPresetIsoRange(DEFAULT_PERIOD_PRESET);
    return {
      dateFrom: defaultRange.dateFrom ?? '',
      dateTo: defaultRange.dateTo ?? '',
    };
  });
  const [oddsRange, setOddsRange] = useState({
    oddsFrom: '',
    oddsTo: '',
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
            sourceTypes: ['published_prediction'],
            predictionScope,
            marketKeys: marketKeys.length > 0 ? marketKeys : undefined,
            dateFrom: dateRange.dateFrom || undefined,
            dateTo: dateRange.dateTo || undefined,
            oddsFrom: parseOddsInput(oddsRange.oddsFrom),
            oddsTo: parseOddsInput(oddsRange.oddsTo),
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
    predictionScope,
    marketKeys,
    dateRange,
    oddsRange,
    sortField,
    sortOrder,
    refreshNonce,
  ]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    statuses.length > 0 ||
    predictionScope !== 'all' ||
    marketKeys.length > 0 ||
    Boolean(oddsRange.oddsFrom.trim()) ||
    Boolean(oddsRange.oddsTo.trim()) ||
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
        <AdminPageHeader
          maxWidth={1600}
          title="Prediction Evaluation"
          subtitle="Review all generated predictions, Top Picks, and other predictions by fixture and market."
        />

        <Box
          sx={{
            maxWidth: 1600,
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 4 },
            py: 4,
          }}
        >
          {!isLoading && !error && summary.v9 && <V9Summary summary={summary.v9} scopeLabel={SCOPE_OPTIONS.find((option) => option.value === predictionScope)?.label ?? 'All predictions'} />}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Top Picks: value is true or conservative EV is greater than zero. All predictions includes unpublished and internal source records, other predictions, and missing value/EV data.
          </Typography>
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
                  xl: 'repeat(5, minmax(0, 1fr))',
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
                <InputLabel id="prediction-evaluation-scope-label">Predictions</InputLabel>
                <Select
                  labelId="prediction-evaluation-scope-label"
                  label="Predictions"
                  value={predictionScope}
                  onChange={(event) => {
                    setPredictionScope(event.target.value as PredictionEvaluationScope);
                    setExpandedFixtureId(null);
                    setPage(0);
                  }}
                >
                  {SCOPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
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

              <TextField
                size="small"
                label="Odds from"
                type="number"
                value={oddsRange.oddsFrom}
                onChange={(event) => {
                  setOddsRange((current) => ({
                    ...current,
                    oddsFrom: event.target.value,
                  }));
                  setPage(0);
                }}
                inputProps={{ min: 1, step: '0.01' }}
              />

              <TextField
                size="small"
                label="Odds to"
                type="number"
                value={oddsRange.oddsTo}
                onChange={(event) => {
                  setOddsRange((current) => ({
                    ...current,
                    oddsTo: event.target.value,
                  }));
                  setPage(0);
                }}
                inputProps={{ min: 1, step: '0.01' }}
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
                    setPredictionScope('all');
                    setMarketKeys([]);
                    setOddsRange({
                      oddsFrom: '',
                      oddsTo: '',
                    });
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
          ) : error ? null : items.length === 0 ? (
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
            <TableContainer component={Paper} variant="outlined">
              <Table
                size="small"
                aria-label="Fixture evaluations"
                sx={{ ...TABLE_SX, minWidth: 1350 }}
              >
                <TableHead>
                  <TableRow>
                    {['Match', 'League', 'Kickoff', ...METRIC_COLUMNS].map(
                      (label, index) => (
                        <TableCell
                          key={label}
                          align={index < 3 ? 'left' : 'right'}
                        >
                          {label}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((group) => {
                    const expanded = expandedFixtureId === group.fixtureId;
                    const metrics =
                      group.stats.v9 &&
                      group.predictions.every(
                        (prediction) =>
                          prediction.sourceType === 'published_prediction'
                      )
                        ? group.stats.v9
                        : {
                            ...group.stats,
                            predictionCount: group.stats.total,
                            fixtureCount: 1,
                            averageOdds: null,
                          };
                    return (
                      <Fragment key={group.fixtureId}>
                        <TableRow
                          hover
                          sx={{
                            bgcolor: expanded ? 'action.selected' : undefined,
                          }}
                        >
                          <TableCell
                            component="th"
                            scope="row"
                            sx={{ minWidth: 240 }}
                          >
                            <ButtonBase
                              onClick={() =>
                                setExpandedFixtureId(
                                  expanded ? null : group.fixtureId
                                )
                              }
                              aria-expanded={expanded}
                              aria-controls={
                                expanded
                                  ? `fixture-details-${group.fixtureId}`
                                  : undefined
                              }
                              sx={{
                                textAlign: 'left',
                                alignItems: 'flex-start',
                                gap: 1,
                                borderRadius: 1,
                                '&.Mui-focusVisible': {
                                  outline: '2px solid',
                                  outlineColor: 'primary.main',
                                },
                              }}
                            >
                              <ExpandMore
                                fontSize="small"
                                sx={{
                                  mt: 0.25,
                                  transform: expanded
                                    ? 'rotate(180deg)'
                                    : undefined,
                                }}
                              />
                              <Box>
                                <Typography variant="body2" fontWeight={700}>
                                  {formatFixtureLabel(group)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Fixture #{group.fixtureId}
                                </Typography>
                              </Box>
                            </ButtonBase>
                          </TableCell>
                          <TableCell sx={{ minWidth: 130 }}>
                            {group.leagueName || 'Unknown league'}
                          </TableCell>
                          <TableCell sx={{ minWidth: 145 }}>
                            {formatDateTime(group.fixtureTime)}
                          </TableCell>
                          <V9MetricCells metrics={metrics} />
                        </TableRow>
                        {expanded && (
                          <TableRow>
                            <TableCell
                              colSpan={3 + METRIC_COLUMNS.length}
                              sx={{ bgcolor: 'action.hover' }}
                            >
                              <Box
                                id={`fixture-details-${group.fixtureId}`}
                                sx={{ p: 1, maxWidth: 'calc(100vw - 100px)' }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={700}
                                  sx={{ mb: 1 }}
                                >
                                  Prediction details
                                </Typography>
                                <PredictionDetailsTable group={group} />
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!isLoading && !error && <Paper sx={{ mt: 3 }}>
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
          </Paper>}
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
