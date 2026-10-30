import { projectGroupedMetric } from '@/lib/home-analytics-breakdown';
import type { UpdatedHomeMetricValue } from '@/lib/api/updated-home-analytics';

function observation(
  action: string,
  date: string,
  day: number,
  value: number | null,
  denominator = 100
): UpdatedHomeMetricValue {
  return {
    dimensions: { coreAction: action, cohortDate: date, returnDay: day },
    formula: { numerator: 'Returning users', denominator: 'Day-0 users' },
    numerator: value === null ? null : (value * denominator) / 100,
    denominator,
    value,
    unit: 'percent',
    completeness: { isComplete: true, reason: null },
    naReason: value === null ? 'No cohort' : null,
  };
}

it('keeps actions and return days separate and averages cohort percentages without weighting', () => {
  const groups = projectGroupedMetric('d1_d7_d30_retention', [
    observation('prediction_opened', '2026-10-01', 1, 20, 10),
    observation('collection_viewed', '2026-10-01', 1, 90),
    observation('prediction_opened', '2026-10-02', 1, 80, 1000),
    observation('prediction_opened', '2026-10-01', 7, 10),
    observation('prediction_opened', '2026-10-02', 7, 30),
    observation('prediction_opened', '2026-10-01', 30, 5),
  ]);

  expect(
    groups.map(({ action, summary }) => ({
      action,
      means: summary.kind === 'retention' ? summary.means : undefined,
    }))
  ).toEqual([
    { action: 'prediction_opened', means: { 1: 50, 7: 20, 30: 5 } },
    { action: 'collection_viewed', means: { 1: 90, 7: null, 30: null } },
  ]);
});

it('includes zero, excludes N/A, and retains actions with only unavailable days', () => {
  const groups = projectGroupedMetric('d1_d7_d30_retention', [
    observation('prediction_opened', '2026-10-01', 1, 0),
    observation('prediction_opened', '2026-10-02', 1, 60),
    observation('prediction_opened', '2026-10-03', 1, null),
    observation('prediction_opened', '2026-10-01', 7, 0),
    observation('prediction_opened', '2026-10-01', 30, null),
    observation('unavailable', '2026-10-01', 1, null),
    observation('unavailable', '2026-10-01', 7, null),
    observation('unavailable', '2026-10-01', 30, null),
  ]);

  expect(
    groups.map(({ action, summary }) => ({
      action,
      means: summary.kind === 'retention' ? summary.means : undefined,
    }))
  ).toEqual([
    { action: 'prediction_opened', means: { 1: 30, 7: 0, 30: null } },
    { action: 'unavailable', means: { 1: null, 7: null, 30: null } },
  ]);
  expect(groups[1].rows).toHaveLength(3);
});

it('excludes observations without string actions and preserves the existing empty-string eligibility', () => {
  const eligible = observation('', '2026-10-01', 1, 0);
  expect(projectGroupedMetric('d1_d7_d30_retention', [])).toEqual([]);
  expect(
    projectGroupedMetric('d1_d7_d30_retention', [
      { ...eligible, dimensions: {} },
    ])
  ).toEqual([]);
  expect(
    projectGroupedMetric('d1_d7_d30_retention', [
      { ...eligible, dimensions: { coreAction: 12 } },
      eligible,
    ]).map(({ action }) => action)
  ).toEqual(['']);
});

it('orders cohort rows by the original dimension sequence without changing backend observations', () => {
  const observations = [
    observation('prediction_opened', '2026-10-02', 30, 12.345),
    observation('prediction_opened', '2026-10-01', 30, null),
    observation('prediction_opened', '2026-10-01', 7, 0),
    observation('prediction_opened', '2026-10-01', 1, 50),
    observation('prediction_opened', '2026-10-02', 1, 25),
  ];
  const original = JSON.parse(JSON.stringify(observations));
  Object.freeze(observations);
  observations.forEach((row) => {
    Object.freeze(row.dimensions);
    Object.freeze(row);
  });
  const [group] = projectGroupedMetric('d1_d7_d30_retention', observations);

  expect(group.dimensionKeys).toEqual(['cohortDate', 'returnDay']);
  expect(group.rows).toEqual([
    observations[3],
    observations[2],
    observations[1],
    observations[4],
    observations[0],
  ]);
  expect(group.rows[4]).toBe(observations[0]);
  expect(group.rows[2]).toBe(observations[1]);
  expect(observations).toEqual(original);
});

it('keeps backend dimension order and stable ordering for matching dimensions', () => {
  const first = observation('prediction_opened', '2026-10-02', 1, 20);
  first.dimensions = {
    returnDay: 1,
    coreAction: 'prediction_opened',
    cohortDate: '2026-10-02',
  };
  const tied = { ...first, value: 30 };
  const daySeven = observation('prediction_opened', '2026-10-01', 7, 10);
  const [group] = projectGroupedMetric('d1_d7_d30_retention', [
    first,
    daySeven,
    tied,
  ]);

  expect(group.dimensionKeys).toEqual(['returnDay', 'cohortDate']);
  expect(group.rows).toEqual([first, tied, daySeven]);
});

it('keeps retention means and zero rows separate from ordinary module and collection policies', () => {
  const zero = observation('collection_page_viewed', '2026-10-01', 1, 0);
  zero.dimensions.moduleName = 'feed';
  zero.dimensions.collectionName = 'Collection';
  const [group] = projectGroupedMetric('d1_d7_d30_retention', [zero]);

  expect(group.summary).toEqual({
    kind: 'retention',
    means: { 1: 0, 7: null, 30: null },
  });
  expect(group.collection).toBeNull();
  expect(group.dimensionKeys).toEqual([
    'cohortDate',
    'returnDay',
    'moduleName',
    'collectionName',
  ]);
  expect(group.rows).toEqual([zero]);
});
