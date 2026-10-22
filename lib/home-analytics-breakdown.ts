import type { UpdatedHomeMetricValue } from '@/lib/api/updated-home-analytics';
import { formatMetricValue } from '@/components/updated-home-analytics/presentation';
import {
  aggregateRate,
  formatHomeAnalyticsRate,
} from '@/lib/home-analytics-summary';

/** Presentation policy only; the original backend observations stay intact. */
export function projectGroupedMetric(
  metricKey: string,
  values: readonly UpdatedHomeMetricValue[],
  showZeroCollections: boolean
) {
  const isCollectionBreakdown =
    metricKey === 'collection_assisted_conversion_rate';
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
  const rows = [...values]
    .filter(
      (value) =>
        !isCollectionBreakdown || showZeroCollections || value.value !== 0
    )
    .sort((left, right) =>
      compareDimensionBreakdowns(left, right, dimensionKeys)
    );

  return {
    summary: metricSummary(metricKey, values),
    dimensionKeys,
    collectionCounts: isCollectionBreakdown
      ? countCollectionValues(values)
      : null,
    rows,
  };
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
  values: readonly UpdatedHomeMetricValue[]
): { label: string; value: string } | null {
  if (values.some((value) => typeof value.dimensions.moduleName === 'string')) {
    return null;
  }
  if (metricKey === 'pass_to_monthly_conversion_rate') {
    return {
      label: 'Overall conversion',
      value: formatHomeAnalyticsRate(aggregateRate([...values])),
    };
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

function countCollectionValues(values: readonly UpdatedHomeMetricValue[]): {
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
