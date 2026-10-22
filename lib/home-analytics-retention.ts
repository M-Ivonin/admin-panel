import type { UpdatedHomeMetricValue } from '@/lib/api/updated-home-analytics';

export const RETENTION_RETURN_DAYS = [1, 7, 30] as const;

export type RetentionMeans = Record<
  (typeof RETENTION_RETURN_DAYS)[number],
  number | null
>;

export type RetentionActionGroup = {
  action: string;
  dimensionKeys: string[];
  rows: UpdatedHomeMetricValue[];
  means: RetentionMeans;
};

/** Unweighted cohort percentages; backend observations remain unchanged. */
export function projectRetention(
  observations: readonly UpdatedHomeMetricValue[]
): RetentionActionGroup[] {
  const actions = new Map<string, UpdatedHomeMetricValue[]>();
  for (const observation of observations) {
    const action = observation.dimensions.coreAction;
    if (typeof action !== 'string') continue;
    const rows = actions.get(action) ?? [];
    rows.push(observation);
    actions.set(action, rows);
  }

  return [...actions].map(([action, rows]) => {
    const dimensionKeys = Object.keys(rows[0].dimensions).filter(
      (key) => key !== 'coreAction'
    );
    const means: RetentionMeans = { 1: null, 7: null, 30: null };
    for (const day of RETENTION_RETURN_DAYS) {
      const observed = rows.filter(
        (row) => row.dimensions.returnDay === day && row.value !== null
      );
      if (observed.length > 0) {
        means[day] =
          observed.reduce((sum, row) => sum + (row.value ?? 0), 0) /
          observed.length;
      }
    }
    const orderedRows = [...rows].sort((left, right) => {
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
    });
    return { action, dimensionKeys, rows: orderedRows, means };
  });
}
