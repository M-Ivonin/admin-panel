import { useState } from 'react';
import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
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

function MetricRow({
  definition,
  value,
}: {
  definition: UpdatedHomeMetricDefinition;
  value?: UpdatedHomeMetricValue;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
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
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) auto' },
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
        <Typography sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 9, overflowWrap: 'anywhere' }}>
          {formatDimensions(value?.dimensions)}
        </Typography>
      </Stack>

      <Stack gap="4px" minWidth={0}>
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
        <Typography sx={{ color: '#8B8B8F', fontSize: 10 }}>
          Unit: {formatMetricUnit(value)}
        </Typography>
        {!value || value.value === null ? (
          <Typography sx={{ color: '#F0A63A', fontSize: 11 }}>
            No data for selected period
          </Typography>
        ) : null}
      </Stack>

      <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
        <Box
          component="button"
          type="button"
          aria-expanded={detailsOpen}
          onClick={() => setDetailsOpen((open) => !open)}
          sx={{
            appearance: 'none',
            border: 0,
            bgcolor: 'transparent',
            color: '#A3A3A3',
            cursor: 'pointer',
            p: 0,
            font: 'inherit',
            fontSize: 11,
            fontWeight: 600,
            '&:hover': { color: '#F5F5F5' },
          }}
        >
          Calculation details {detailsOpen ? '−' : '+'}
        </Box>
        {detailsOpen ? (
          <Stack gap="4px" minWidth={0} sx={{ mt: 1, pt: 1, borderTop: '1px solid #3A3A3A' }}>
            <DefinitionLine label="NUM" value={numeratorDefinition} />
            <DefinitionLine label="DEN" value={denominatorDefinition ?? 'none'} />
            <DefinitionLine label="WINDOW" value={definition.window} mono />
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}

function DefinitionLine({
  label,
  value,
  mono: useMono = false,
  warning = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  warning?: boolean;
}) {
  return (
    <Typography
      component="div"
      sx={{
        color: warning ? '#F0A63A' : useMono ? '#8B8B8F' : '#A3A3A3',
        fontFamily: useMono ? mono : 'inherit',
        fontSize: useMono || warning ? 9 : 10,
        overflowWrap: 'anywhere',
      }}
    >
      <Box component="span" sx={{ fontWeight: 700, mr: 0.75 }}>
        {label}
      </Box>
      {value}
    </Typography>
  );
}
