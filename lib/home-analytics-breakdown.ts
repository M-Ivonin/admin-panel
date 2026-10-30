import type { UpdatedHomeMetricValue } from '@/lib/api/updated-home-analytics';
import { formatMetricValue } from '@/components/updated-home-analytics/presentation';
import {
  aggregateRate,
  formatHomeAnalyticsRate,
} from '@/lib/home-analytics-summary';

export const RETENTION_RETURN_DAYS = [1, 7, 30] as const;

export type RetentionMeans = Record<
  (typeof RETENTION_RETURN_DAYS)[number],
  number | null
>;

type GroupedMetricSummary =
  | { kind: 'retention'; means: RetentionMeans }
  | { kind: 'metric'; label: string; value: string }
  | { kind: 'breakdowns' };

export type GroupedMetricProjection = {
  action: string | null;
  dimensionKeys: string[];
  rows: UpdatedHomeMetricValue[];
  summary: GroupedMetricSummary;
  collection: {
    counts: { converting: number; zero: number; na: number };
    rowsWithoutZero: UpdatedHomeMetricValue[];
  } | null;
};

/** Presentation policy only; the original backend observations stay intact. */
export function projectGroupedMetric(
  metricKey: string,
  values: readonly UpdatedHomeMetricValue[]
): GroupedMetricProjection[] {
  if (metricKey === 'd1_d7_d30_retention') {
    const actions = new Map<string, UpdatedHomeMetricValue[]>();
    for (const value of values) {
      const action = value.dimensions.coreAction;
      if (typeof action !== 'string') continue;
      const rows = actions.get(action) ?? [];
      rows.push(value);
      actions.set(action, rows);
    }

    return [...actions].map(([action, values]) => {
      const dimensionKeys = Object.keys(values[0].dimensions).filter(
        (key) => key !== 'coreAction'
      );
      const means: RetentionMeans = { 1: null, 7: null, 30: null };
      for (const day of RETENTION_RETURN_DAYS) {
        const observed = values.filter(
          (value) => value.dimensions.returnDay === day && value.value !== null
        );
        if (observed.length > 0) {
          means[day] =
            observed.reduce((sum, value) => sum + (value.value ?? 0), 0) /
            observed.length;
        }
      }
      return {
        action,
        dimensionKeys,
        rows: [...values].sort((left, right) =>
          compareDimensionBreakdowns(left, right, dimensionKeys)
        ),
        summary: { kind: 'retention', means },
        collection: null,
      };
    });
  }
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
  const rows = [...values].sort((left, right) =>
    compareDimensionBreakdowns(left, right, dimensionKeys)
  );
  const summary = metricSummary(metricKey, values);

  return [
    {
      action: null,
      summary: summary
        ? { kind: 'metric', ...summary }
        : { kind: 'breakdowns' },
      dimensionKeys,
      collection: isCollectionBreakdown
        ? {
            counts: countCollectionValues(values),
            rowsWithoutZero: rows.filter((value) => value.value !== 0),
          }
        : null,
      rows,
    },
  ];
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
