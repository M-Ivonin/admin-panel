'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
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
  ANALYTICS_ROLE_TOKENS,
  displayLabel,
  formatDimensions,
  formatMetricUnit,
  formatMetricValue,
  metricExplanation,
  metricRole,
  metricValues,
} from './presentation';
import { UpdatedHomeFunnel } from './UpdatedHomeFunnel';

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
    (dashboard): dashboard is UpdatedHomeDashboardBlock =>
      dashboard !== undefined
  );
  const sectionId =
    dashboards.find(Boolean)?.id ??
    label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
      <Stack sx={{ mb: '14px' }}>
        <Typography sx={{ color: '#F5F5F5', fontSize: 18, fontWeight: 700 }}>
          {label}
        </Typography>
      </Stack>

      {availableDashboards.length === 0 ? (
        <Alert severity="warning">
          This section was not returned by the backend.
        </Alert>
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

function DashboardProjection({
  dashboard,
}: {
  dashboard: UpdatedHomeDashboardBlock;
}) {
  const hasMetricValues = dashboard.metrics.some(
    (metric) => metric.values.length > 0
  );
  const discovery = metricValues(dashboard, 'collection_discovery_funnel');
  const purchase = metricValues(dashboard, 'collection_purchase_funnel');
  const standaloneFunnels = dashboard.metrics.filter(
    ({ definition }) =>
      definition.key.endsWith('_funnel') &&
      !['collection_discovery_funnel', 'collection_purchase_funnel'].includes(
        definition.key
      )
  );
  const remainingMetrics = dashboard.metrics.filter(
    ({ definition }) => !definition.key.endsWith('_funnel')
  );

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" alignItems="center" gap="12px" sx={{ mb: 1.5 }}>
        <Box
          data-testid="updated-home-dashboard-number"
          sx={{
            width: 34,
            height: 34,
            flex: '0 0 34px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '8px',
            bgcolor: '#5B4BFF',
            color: '#FFFFFF',
            fontFamily: mono,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {dashboard.id}
        </Box>
        <Typography sx={{ color: '#F5F5F5', fontSize: 18, fontWeight: 700 }}>
          {dashboard.name}
        </Typography>
      </Stack>

      {!hasMetricValues ? (
        <Alert severity="info">No eligible observations in this range.</Alert>
      ) : (
        <Stack gap={2}>
          {standaloneFunnels.map((metric) => (
            <UpdatedHomeFunnel
              key={metric.definition.key}
              title={
                metric.definition.key === 'full_access_funnel'
                  ? 'Main offer funnel'
                  : displayLabel(metric.definition.key)
              }
              meta={
                metric.definition.key === 'full_access_funnel'
                  ? 'Distinct users · 24h ordered chain'
                  : 'Distinct users · previous-stage rate'
              }
              values={metric.values}
            />
          ))}
          {discovery.length > 0 || purchase.length > 0 ? (
            <Stack gap={1} data-testid="updated-home-collection-journey">
              <UpdatedHomeFunnel
                title="Collection discovery"
                phaseLabel="Phase 1 · Discovery"
                meta="Impression cohort · 24h ordered horizon"
                values={discovery}
                handoffLabel="Collection page viewed hands off into the commerce cohort below."
              />
              <UpdatedHomeFunnel
                title="Collection purchase"
                phaseLabel="Phase 2 · Commerce"
                meta="Page-view cohort · 7-day attribution window"
                values={purchase}
              />
            </Stack>
          ) : null}
          {remainingMetrics.length > 0 ? (
            <Box
              sx={{
                overflow: 'hidden',
                border: '1px solid #3A3A3A',
                borderRadius: '8px',
              }}
            >
              {remainingMetrics.flatMap((metric) => {
                const orderedValues = metricValues(
                  dashboard,
                  metric.definition.key
                );
                const values =
                  orderedValues.length > 0 ? orderedValues : [undefined];
                if (shouldGroupMetric(dashboard.id, values.length)) {
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
          ) : null}
        </Stack>
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
  const numeratorDefinition =
    values[0]?.formula.numerator ?? definition.numerator;
  const denominatorDefinition =
    values[0]?.formula.denominator ?? definition.denominator;
  const distinctUsers = /distinct users/i.test(
    `${numeratorDefinition} ${denominatorDefinition ?? ''}`
  );
  const summary = metricSummary(definition.key, values);
  const summaryToken =
    ANALYTICS_ROLE_TOKENS[
      metricRole(
        definition.key,
        values.find((value) => value.value !== null)
      )
    ];
  const isCollectionBreakdown =
    definition.key === 'collection_assisted_conversion_rate';
  const [showZeroCollections, setShowZeroCollections] = useState(false);
  const collectionCounts = isCollectionBreakdown
    ? countCollectionValues(values)
    : null;
  const isModuleBreakdown = values.every(
    (value) => typeof value.dimensions.moduleName === 'string'
  );
  const dimensionKeys = isModuleBreakdown
    ? [
        'moduleName',
        'modulePosition',
        'moduleVariant',
        'accessState',
        'layoutPolicyVersion',
        'compositionSignature',
        'compositionModules',
      ].filter((key) => values.some((value) => key in value.dimensions))
    : Object.keys(values[0]?.dimensions ?? {});
  const displayedValues = [...values]
    .filter(
      (value) =>
        !isCollectionBreakdown || showZeroCollections || value.value !== 0
    )
    .sort((left, right) =>
      compareDimensionBreakdowns(left, right, dimensionKeys)
    );
  const breakdownColumns =
    dimensionKeys.length === 1
      ? { xs: 'minmax(0, 1fr) 95px', sm: 'minmax(0, 1fr) 130px 110px' }
      : `repeat(${dimensionKeys.length}, minmax(120px, 1fr)) 130px 110px`;

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
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: '250px 170px minmax(0, 1fr)',
            },
            alignItems: 'center',
            gap: { xs: 1, md: '18px' },
            width: '100%',
            minWidth: 0,
          }}
        >
          <Stack gap="4px" minWidth={0}>
            <Typography
              sx={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}
            >
              {displayLabel(definition.key)}
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {distinctUsers ? (
                <Typography sx={{ color: '#D8FBE9', fontSize: 10 }}>
                  Distinct users
                </Typography>
              ) : null}
              <Typography sx={{ color: '#8B8B8F', fontSize: 10 }}>
                {values.length} breakdowns
              </Typography>
              {collectionCounts ? (
                <Typography sx={{ color: '#A3A3A3', fontSize: 10 }}>
                  {collectionCounts.converting} converting ·{' '}
                  {collectionCounts.zero} with 0% · {collectionCounts.na} N/A
                </Typography>
              ) : null}
            </Stack>
          </Stack>
          <Stack gap="2px" minWidth={0}>
            <Typography sx={{ color: '#8B8B8F', fontSize: 9, fontWeight: 700 }}>
              {(summary?.label ?? 'Breakdowns').toUpperCase()}
            </Typography>
            <Typography
              data-testid="updated-home-grouped-summary-value"
              sx={{
                color: summary ? summaryToken.textColor : '#C8C8CA',
                fontFamily: mono,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {summary?.value ?? values.length}
            </Typography>
          </Stack>
          <Stack gap="4px" minWidth={0}>
            <Typography sx={{ color: '#8B8B8F', fontSize: 9, fontWeight: 700 }}>
              WHAT IT SHOWS
            </Typography>
            <Typography
              sx={{ color: '#C8C8CA', fontSize: 11, lineHeight: 1.45 }}
            >
              {metricExplanation(definition.key)}
            </Typography>
          </Stack>
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{ p: 0, borderTop: '1px solid #3A3A3A', overflowX: 'auto' }}
      >
        {isCollectionBreakdown &&
        collectionCounts &&
        collectionCounts.zero > 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              px: { xs: '12px', sm: '16px' },
              py: '8px',
              bgcolor: '#252525',
            }}
          >
            <Button
              size="small"
              onClick={() => setShowZeroCollections((visible) => !visible)}
              sx={{ color: '#B9A8FF', fontSize: 10, textTransform: 'none' }}
            >
              {showZeroCollections
                ? 'Hide 0% collections'
                : 'Show 0% collections'}
            </Button>
          </Box>
        ) : null}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: breakdownColumns,
            minWidth: dimensionKeys.length > 1 ? 620 : 0,
            gap: '12px',
            px: { xs: '12px', sm: '16px' },
            py: '8px',
            bgcolor: '#252525',
          }}
        >
          {dimensionKeys.map((key) => (
            <ColumnLabel key={key}>{dimensionColumnLabel(key)}</ColumnLabel>
          ))}
          <ColumnLabel>VALUE</ColumnLabel>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <ColumnLabel>UNIT</ColumnLabel>
          </Box>
        </Box>

        {displayedValues.map((value, index) => {
          const valueToken =
            ANALYTICS_ROLE_TOKENS[metricRole(definition.key, value)];
          return (
            <Box
              key={`${definition.key}-${index}`}
              data-testid="updated-home-metric-value-row"
              sx={{
                display: 'grid',
                gridTemplateColumns: breakdownColumns,
                minWidth: dimensionKeys.length > 1 ? 620 : 0,
                alignItems: 'center',
                gap: '12px',
                px: { xs: '12px', sm: '16px' },
                py: '10px',
                '&:not(:last-child)': { borderBottom: '1px solid #363636' },
              }}
            >
              {dimensionKeys.map((key) => (
                <Typography
                  key={key}
                  sx={{
                    color: '#B8B8BA',
                    fontFamily: mono,
                    fontSize: 10,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {formatDimensionValue(value.dimensions[key])}
                </Typography>
              ))}
              <Stack gap="2px" minWidth={0}>
                <Typography
                  sx={{
                    color: valueToken.textColor,
                    fontFamily: mono,
                    fontSize: 16,
                    fontWeight: 700,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {formatMetricValue(value)}
                </Typography>
                {value.value === null ? (
                  <Typography sx={{ color: '#F0A63A', fontSize: 9 }}>
                    No data
                  </Typography>
                ) : null}
              </Stack>
              <Typography
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  color: '#A3A3A3',
                  fontSize: 10,
                }}
              >
                {formatMetricUnit(value)}
              </Typography>
            </Box>
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
}

function compareDimensionBreakdowns(
  left: UpdatedHomeMetricValue,
  right: UpdatedHomeMetricValue,
  dimensionKeys: string[]
): number {
  for (const key of dimensionKeys) {
    const leftValue = left.dimensions[key];
    const rightValue = right.dimensions[key];
    const comparison =
      typeof leftValue === 'number' && typeof rightValue === 'number'
        ? leftValue - rightValue
        : String(leftValue ?? '').localeCompare(
            String(rightValue ?? ''),
            'en',
            { sensitivity: 'base' }
          );
    if (comparison !== 0) return comparison;
  }
  return 0;
}

function metricSummary(
  metricKey: string,
  values: UpdatedHomeMetricValue[]
): { label: string; value: string } | null {
  if (values.some((value) => typeof value.dimensions.moduleName === 'string')) {
    return null;
  }
  if (metricKey === 'active_home_time_ms') {
    const mean = values.find((value) => value.dimensions.statistic === 'mean');
    return { label: 'Mean', value: formatMetricValue(mean) };
  }

  if (!HOME_SUMMARY_METRICS.has(metricKey)) return null;

  const observed = values.filter((value) => value.value !== null);
  if (observed.length === 0)
    return { label: 'Average across breakdowns', value: 'N/A' };
  const average =
    observed.reduce((sum, value) => sum + (value.value ?? 0), 0) /
    observed.length;
  return {
    label: 'Average across breakdowns',
    value: formatMetricValue({
      ...observed[0],
      value: Number(average.toFixed(2)),
    }),
  };
}

const HOME_SUMMARY_METRICS = new Set([
  'home_load_success_rate',
  'module_reach_rate',
  'module_ctr',
  'positions_4_9_reach_rate',
  'active_home_time_ms',
  'home_exit_without_interaction_rate',
]);

function shouldGroupMetric(dashboardId: number, valueCount: number): boolean {
  return valueCount > 1 && [1, 4, 5, 9, 11].includes(dashboardId);
}

function formatDimensionValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return typeof value === 'string' ? displayLabel(value) : String(value);
}

function countCollectionValues(values: UpdatedHomeMetricValue[]): {
  converting: number;
  zero: number;
  na: number;
} {
  return values.reduce(
    (counts, value) => {
      if (value.value === null) counts.na += 1;
      else if (value.value === 0) counts.zero += 1;
      else if (value.value > 0) counts.converting += 1;
      return counts;
    },
    { converting: 0, zero: 0, na: 0 }
  );
}

function dimensionColumnLabel(key: string): string {
  return key === 'modulePosition'
    ? 'POSITION'
    : displayLabel(key).toUpperCase();
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
  const denominatorDefinition =
    value?.formula.denominator ?? definition.denominator;
  const distinctUsers = /distinct users/i.test(
    `${numeratorDefinition} ${denominatorDefinition ?? ''}`
  );
  const role = metricRole(definition.key, value);
  const token = ANALYTICS_ROLE_TOKENS[role];

  return (
    <Box
      data-testid="updated-home-metric-row"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: '250px 145px minmax(0, 1fr)',
        },
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
          <Typography sx={{ color: '#D8FBE9', fontSize: 10 }}>
            Distinct users
          </Typography>
        ) : null}
        <Typography sx={{ color: '#8B8B8F', fontSize: 9, fontWeight: 700 }}>
          DIMENSIONS
        </Typography>
        <Typography
          sx={{
            color: '#A3A3A3',
            fontFamily: mono,
            fontSize: 9,
            overflowWrap: 'anywhere',
          }}
        >
          {formatDimensions(value?.dimensions)}
        </Typography>
      </Stack>

      <Stack gap="4px" minWidth={0}>
        <Typography sx={{ color: '#8B8B8F', fontSize: 9, fontWeight: 700 }}>
          VALUE
        </Typography>
        <Typography
          data-testid="updated-home-metric-card-value"
          sx={{
            color: token.textColor,
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
        <Typography
          data-testid="updated-home-metric-card-cue"
          sx={{ color: token.textColor, fontSize: 9 }}
        >
          {token.cue}
        </Typography>
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
