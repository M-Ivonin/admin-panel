import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type {
  UpdatedHomeDashboardBlock,
  UpdatedHomeMetricDefinition,
  UpdatedHomeMetricValue,
} from '@/lib/api/updated-home-analytics';
import {
  displayLabel,
  formatDimensions,
  formatMetricUnit,
  formatMetricValue,
  metricExplanation,
  metricValues,
} from './presentation';

const mono = '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace';

type UpdatedHomeAnalyticsSectionProps = {
  label: string;
  dashboards: Array<UpdatedHomeDashboardBlock | undefined>;
};

export function UpdatedHomeAnalyticsSection({
  label,
  dashboards,
}: UpdatedHomeAnalyticsSectionProps) {
  const availableDashboards = dashboards.filter(
    (dashboard): dashboard is UpdatedHomeDashboardBlock => dashboard !== undefined
  );
  const sectionId = dashboards.find(Boolean)?.id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const incomplete = availableDashboards.some(
    (dashboard) => !dashboard.observationCompleteness.isComplete
  );

  return (
    <Box
      component="section"
      id={`dashboard-${sectionId}`}
      aria-label={label}
      data-testid="updated-home-dashboard-section"
      sx={{
        minWidth: 0,
        scrollMarginTop: 24,
        border: '1px solid #343434',
        borderRadius: '12px',
        bgcolor: '#222222',
        p: { xs: '14px', sm: '20px' },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={1.5}
        sx={{ mb: '14px' }}
      >
        <Typography sx={{ color: '#F5F5F5', fontSize: 18, fontWeight: 700 }}>
          {label}
        </Typography>
        <Chip
          label={
            availableDashboards.length === 0
              ? 'Unsupported response'
              : incomplete
                ? 'Partial observation window'
                : 'Complete observation window'
          }
          size="small"
          sx={{
            maxWidth: '100%',
            bgcolor: availableDashboards.length === 0 || incomplete ? '#3A2B12' : '#173926',
            color: availableDashboards.length === 0 || incomplete ? '#F8E5BF' : '#D8FBE9',
            fontSize: 11,
            fontWeight: 600,
          }}
        />
      </Stack>

      {availableDashboards.length === 0 ? (
        <Alert severity="warning">This section was not returned by the backend.</Alert>
      ) : (
        <Stack gap={2}>
          {availableDashboards.map((dashboard) => (
            <DashboardProjection key={dashboard.id} dashboard={dashboard} />
          ))}
        </Stack>
      )}
    </Box>
  );
}

function DashboardProjection({ dashboard }: { dashboard: UpdatedHomeDashboardBlock }) {
  const hasMetricValues = dashboard.metrics.some((metric) => metric.values.length > 0);

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack gap={0.75} sx={{ mb: 1.5 }}>
        <Typography sx={{ color: '#F5F5F5', fontSize: 15, fontWeight: 700 }}>
          {dashboard.name}
        </Typography>
      </Stack>

      {!hasMetricValues ? (
        <Alert severity="info">No eligible observations in this range.</Alert>
      ) : (
        <Box sx={{ overflow: 'hidden', border: '1px solid #3A3A3A', borderRadius: '8px' }}>
          {dashboard.metrics.flatMap((metric) => {
            const orderedValues = metricValues(dashboard, metric.definition.key);
            const values = orderedValues.length > 0 ? orderedValues : [undefined];
            if (dashboard.id === 1 && values.length > 1) {
              return (
                <GroupedMetric
                  key={metric.definition.key}
                  definition={metric.definition}
                  values={orderedValues}
                />
              );
            }
            return values.map((value, index) => (
              <MetricRow
                key={`${metric.definition.key}-${index}`}
                definition={metric.definition}
                value={value}
              />
            ));
          })}
        </Box>
      )}
    </Box>
  );
}

function GroupedMetric({
  definition,
  values,
}: {
  definition: UpdatedHomeMetricDefinition;
  values: UpdatedHomeMetricValue[];
}) {
  const numeratorDefinition = values[0]?.formula.numerator ?? definition.numerator;
  const denominatorDefinition = values[0]?.formula.denominator ?? definition.denominator;
  const distinctUsers = /distinct users/i.test(
    `${numeratorDefinition} ${denominatorDefinition ?? ''}`
  );
  const summary = metricSummary(definition.key, values);
  const isModuleBreakdown = values.every(
    (value) => typeof value.dimensions.moduleName === 'string'
  );
  const displayedValues = isModuleBreakdown
    ? [...values].sort(compareModuleBreakdowns)
    : values;
  const breakdownColumns = isModuleBreakdown
    ? { xs: 'minmax(0, 1fr) 64px 95px', sm: 'minmax(0, 1fr) 90px 130px 110px' }
    : { xs: 'minmax(0, 1fr) 95px', sm: 'minmax(0, 1fr) 130px 110px' };

  return (
    <Accordion
      data-testid="updated-home-grouped-metric"
      disableGutters
      sx={{
        minWidth: 0,
        bgcolor: '#2A2A2A',
        color: 'inherit',
        boxShadow: 'none',
        '&::before': { display: 'none' },
        '&:not(:last-child)': { borderBottom: '1px solid #3A3A3A' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#A3A3A3' }} />}
        aria-label={`Show ${displayLabel(definition.key)} breakdown`}
        sx={{
          px: { xs: '12px', sm: '16px' },
          py: '8px',
          minHeight: 72,
          '& .MuiAccordionSummary-content': { my: 0, minWidth: 0 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '250px 170px minmax(0, 1fr)' },
            alignItems: 'center',
            gap: { xs: 1, md: '18px' },
            width: '100%',
            minWidth: 0,
          }}
        >
          <Stack gap="4px" minWidth={0}>
            <Typography sx={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}>
              {displayLabel(definition.key)}
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {distinctUsers ? (
                <Typography sx={{ color: '#D8FBE9', fontSize: 10 }}>Distinct users</Typography>
              ) : null}
              <Typography sx={{ color: '#8B8B8F', fontSize: 10 }}>
                {values.length} breakdowns
              </Typography>
            </Stack>
          </Stack>
          <Stack gap="2px" minWidth={0}>
            <Typography sx={{ color: '#8B8B8F', fontSize: 9, fontWeight: 700 }}>
              {summary.label.toUpperCase()}
            </Typography>
            <Typography sx={{ color: '#6D4AFF', fontFamily: mono, fontSize: 18, fontWeight: 700 }}>
              {summary.value}
            </Typography>
          </Stack>
          <Stack gap="4px" minWidth={0}>
            <Typography sx={{ color: '#8B8B8F', fontSize: 9, fontWeight: 700 }}>
              WHAT IT SHOWS
            </Typography>
            <Typography sx={{ color: '#C8C8CA', fontSize: 11, lineHeight: 1.45 }}>
              {metricExplanation(definition.key)}
            </Typography>
          </Stack>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0, borderTop: '1px solid #3A3A3A' }}>
        <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: breakdownColumns,
          gap: '12px',
          px: { xs: '12px', sm: '16px' },
          py: '8px',
          bgcolor: '#252525',
        }}
        >
          <ColumnLabel>{isModuleBreakdown ? 'MODULE NAME' : 'DIMENSIONS'}</ColumnLabel>
          {isModuleBreakdown ? <ColumnLabel>POSITION</ColumnLabel> : null}
          <ColumnLabel>VALUE</ColumnLabel>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}><ColumnLabel>UNIT</ColumnLabel></Box>
        </Box>

        {displayedValues.map((value, index) => (
        <Box
          key={`${definition.key}-${index}`}
          data-testid="updated-home-metric-value-row"
          sx={{
            display: 'grid',
            gridTemplateColumns: breakdownColumns,
            alignItems: 'center',
            gap: '12px',
            minWidth: 0,
            px: { xs: '12px', sm: '16px' },
            py: '10px',
            '&:not(:last-child)': { borderBottom: '1px solid #363636' },
          }}
        >
          <Typography sx={{ color: '#B8B8BA', fontFamily: mono, fontSize: 10, overflowWrap: 'anywhere' }}>
            {isModuleBreakdown
              ? displayLabel(String(value.dimensions.moduleName))
              : formatDimensions(value.dimensions)}
          </Typography>
          {isModuleBreakdown ? (
            <Typography sx={{ color: '#B8B8BA', fontFamily: mono, fontSize: 10 }}>
              {String(value.dimensions.modulePosition ?? '—')}
            </Typography>
          ) : null}
          <Stack gap="2px" minWidth={0}>
            <Typography
              sx={{
                color: value.value === null ? '#F0A63A' : '#6D4AFF',
                fontFamily: mono,
                fontSize: 16,
                fontWeight: 700,
                overflowWrap: 'anywhere',
              }}
            >
              {formatMetricValue(value)}
            </Typography>
            {value.value === null ? (
              <Typography sx={{ color: '#F0A63A', fontSize: 9 }}>No data</Typography>
            ) : null}
          </Stack>
          <Typography sx={{ display: { xs: 'none', sm: 'block' }, color: '#A3A3A3', fontSize: 10 }}>
            {formatMetricUnit(value)}
          </Typography>
        </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

function compareModuleBreakdowns(
  left: UpdatedHomeMetricValue,
  right: UpdatedHomeMetricValue
): number {
  const byName = String(left.dimensions.moduleName).localeCompare(
    String(right.dimensions.moduleName),
    'en',
    { sensitivity: 'base' }
  );
  if (byName !== 0) return byName;
  return Number(left.dimensions.modulePosition ?? 0) - Number(right.dimensions.modulePosition ?? 0);
}

function metricSummary(
  metricKey: string,
  values: UpdatedHomeMetricValue[]
): { label: string; value: string } {
  if (metricKey === 'active_home_time_ms') {
    const mean = values.find((value) => value.dimensions.statistic === 'mean');
    return { label: 'Mean', value: formatMetricValue(mean) };
  }

  const observed = values.filter((value) => value.value !== null);
  if (observed.length === 0) return { label: 'Average across breakdowns', value: 'N/A' };
  const average = observed.reduce((sum, value) => sum + (value.value ?? 0), 0) / observed.length;
  return {
    label: 'Average across breakdowns',
    value: formatMetricValue({ ...observed[0], value: Number(average.toFixed(2)) }),
  };
}

function ColumnLabel({ children }: { children: string }) {
  return (
    <Typography sx={{ color: '#8B8B8F', fontSize: 9, fontWeight: 700 }}>
      {children}
    </Typography>
  );
}

function MetricRow({
  definition,
  value,
}: {
  definition: UpdatedHomeMetricDefinition;
  value?: UpdatedHomeMetricValue;
}) {
  const numeratorDefinition = value?.formula.numerator ?? definition.numerator;
  const denominatorDefinition = value?.formula.denominator ?? definition.denominator;
  const distinctUsers = /distinct users/i.test(
    `${numeratorDefinition} ${denominatorDefinition ?? ''}`
  );

  return (
    <Box
      data-testid="updated-home-metric-row"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '250px 145px minmax(0, 1fr)' },
        alignItems: { xs: 'start', md: 'center' },
        gap: { xs: 1.5, md: '18px' },
        minWidth: 0,
        bgcolor: '#2A2A2A',
        px: { xs: '12px', sm: '16px' },
        py: '14px',
        '&:not(:last-child)': { borderBottom: '1px solid #3A3A3A' },
      }}
    >
      <Stack gap="5px" minWidth={0}>
        <Typography sx={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}>
          {displayLabel(definition.key)}
        </Typography>
        {distinctUsers ? (
          <Typography sx={{ color: '#D8FBE9', fontSize: 10 }}>Distinct users</Typography>
        ) : null}
        <Typography sx={{ color: '#8B8B8F', fontSize: 9, fontWeight: 700 }}>
          DIMENSIONS
        </Typography>
        <Typography sx={{ color: '#A3A3A3', fontFamily: mono, fontSize: 9, overflowWrap: 'anywhere' }}>
          {formatDimensions(value?.dimensions)}
        </Typography>
      </Stack>

      <Stack gap="4px" minWidth={0}>
        <Typography sx={{ color: '#8B8B8F', fontSize: 9, fontWeight: 700 }}>
          VALUE
        </Typography>
        <Typography
          sx={{
            color: !value || value.value === null ? '#F0A63A' : '#6D4AFF',
            fontFamily: mono,
            fontSize: 20,
            fontWeight: 700,
            overflowWrap: 'anywhere',
          }}
        >
          {formatMetricValue(value)}
        </Typography>
        <Typography sx={{ color: '#8B8B8F', fontSize: 9, fontWeight: 700 }}>
          UNIT
        </Typography>
        <Typography sx={{ color: '#A3A3A3', fontSize: 10 }}>
          {formatMetricUnit(value)}
        </Typography>
        {!value || value.value === null ? (
          <Typography sx={{ color: '#F0A63A', fontSize: 10 }}>
            No data for selected period
          </Typography>
        ) : null}
      </Stack>

      <Stack gap="5px" minWidth={0}>
        <Typography sx={{ color: '#8B8B8F', fontSize: 9, fontWeight: 700 }}>
          WHAT IT SHOWS
        </Typography>
        <Typography sx={{ color: '#C8C8CA', fontSize: 11, lineHeight: 1.45 }}>
          {metricExplanation(definition.key)}
        </Typography>
      </Stack>
    </Box>
  );
}
