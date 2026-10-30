import type { UpdatedHomeMetricValue } from '@/lib/api/updated-home-analytics';
import { projectGroupedMetric } from '@/lib/home-analytics-breakdown';

function observation(
  dimensions: Record<string, unknown>,
  value: number | null,
  overrides: Partial<UpdatedHomeMetricValue> = {}
): UpdatedHomeMetricValue {
  return {
    dimensions,
    value,
    numerator: 1,
    denominator: 10,
    unit: 'percent',
    formula: { numerator: 'observed users', denominator: 'eligible users' },
    completeness: { isComplete: true, reason: null },
    naReason: value === null ? 'No eligible observations' : null,
    ...overrides,
  };
}

it('orders numeric dimensions numerically while preserving the first row column order', () => {
  const tenth = observation({ position: 10, country: 'US' }, 10);
  const second = observation({ position: 2, country: 'US' }, 20);
  const first = observation({ position: 1, country: 'GB' }, 30);

  const [projection] = projectGroupedMetric('conversion_by_product_country', [
    tenth,
    second,
    first,
  ]);

  expect(projection.dimensionKeys).toEqual(['position', 'country']);
  expect(projection.rows).toEqual([first, second, tenth]);
  expect(projection.summary).toEqual({ kind: 'breakdowns' });
  expect(projection.collection).toBeNull();
});

it('uses the module column policy across rows and suppresses module summaries', () => {
  const feed = observation(
    {
      compositionModules: 'feed',
      compositionSignature: 'signature',
      layoutPolicyVersion: 1,
      accessState: 'free',
      moduleVariant: 'default',
      modulePosition: 10,
      moduleName: 'feed',
      extraBackendDimension: 'unchanged',
    },
    40
  );
  const access = observation(
    { moduleName: 'access_status', modulePosition: 1 },
    60
  );
  const [projection] = projectGroupedMetric('module_reach_rate', [
    feed,
    access,
  ]);

  expect(projection.dimensionKeys).toEqual([
    'moduleName',
    'modulePosition',
    'moduleVariant',
    'accessState',
    'layoutPolicyVersion',
    'compositionSignature',
    'compositionModules',
  ]);
  expect(projection.rows).toEqual([access, feed]);
  expect(projection.summary).toEqual({ kind: 'breakdowns' });
});

it('counts all collection observations and toggles only zero rows while retaining N/A', () => {
  const zero = observation({ collectionName: 'Zulu' }, 0);
  const positive = observation({ collectionName: 'beta' }, 25);
  const unavailable = observation({ collectionName: 'Alpha' }, null);
  const values = [zero, positive, unavailable];
  const [group] = projectGroupedMetric(
    'collection_assisted_conversion_rate',
    values
  );

  expect(group.collection?.rowsWithoutZero).toEqual([unavailable, positive]);
  expect(group.rows).toEqual([unavailable, positive, zero]);
  expect(group.collection?.counts).toEqual({ converting: 1, zero: 1, na: 1 });
  expect(group.summary).toEqual({ kind: 'breakdowns' });
});

it('keeps zero and N/A rows for ordinary breakdowns', () => {
  const zero = observation({ country: 'US' }, 0);
  const unavailable = observation({ country: 'GB' }, null);
  expect(
    projectGroupedMetric('verified_started_rate', [zero, unavailable])[0].rows
  ).toEqual([unavailable, zero]);
});

it.each([
  'home_load_success_rate',
  'module_reach_rate',
  'module_ctr',
  'positions_4_9_reach_rate',
  'home_exit_without_interaction_rate',
])(
  'averages numeric %s observations including zero and excluding N/A',
  (metricKey) => {
    const values = [
      observation({ accessState: 'paid' }, 0),
      observation({ accessState: 'free' }, 80),
      observation({ accessState: 'unknown' }, null),
    ];
    expect(projectGroupedMetric(metricKey, values)[0].summary).toEqual({
      kind: 'metric',
      label: 'Average across breakdowns',
      value: '40%',
    });
  }
);

it('rounds average percentages to two decimals and keeps all-N/A summaries unavailable', () => {
  expect(
    projectGroupedMetric('home_load_success_rate', [
      observation({}, 10),
      observation({}, 20),
      observation({}, 20),
    ])[0].summary
  ).toEqual({
    kind: 'metric',
    label: 'Average across breakdowns',
    value: '16.67%',
  });
  expect(
    projectGroupedMetric('home_load_success_rate', [
      observation({}, null),
      observation({}, null),
    ])[0].summary
  ).toEqual({
    kind: 'metric',
    label: 'Average across breakdowns',
    value: 'N/A',
  });
});

it('uses the backend mean for active time and preserves seconds formatting', () => {
  const values = [
    observation({ statistic: 'p95' }, 90000, { unit: 'milliseconds' }),
    observation({ statistic: 'mean' }, 8250, { unit: 'milliseconds' }),
  ];
  expect(
    projectGroupedMetric('active_home_time_ms', values)[0].summary
  ).toEqual({ kind: 'metric', label: 'Mean', value: '8.25 s' });
  expect(
    projectGroupedMetric('active_home_time_ms', values.slice(0, 1))[0].summary
  ).toEqual({ kind: 'metric', label: 'Mean', value: 'N/A' });
});

it('pools pass conversion counts instead of averaging displayed percentages', () => {
  const values = [
    observation({ country: 'US' }, 50, { numerator: 1, denominator: 2 }),
    observation({ country: 'GB' }, 10, { numerator: 1, denominator: 10 }),
  ];
  expect(
    projectGroupedMetric('pass_to_monthly_conversion_rate', values)[0].summary
  ).toEqual({ kind: 'metric', label: 'Overall conversion', value: '16.67%' });
  expect(
    projectGroupedMetric('pass_to_monthly_conversion_rate', [
      values[0],
      observation({}, null, { numerator: null, denominator: null }),
    ])[0].summary
  ).toEqual({ kind: 'metric', label: 'Overall conversion', value: 'N/A' });
});

it('returns an empty projection without inventing observations', () => {
  expect(
    projectGroupedMetric('collection_assisted_conversion_rate', [])
  ).toEqual([
    {
      action: null,
      summary: { kind: 'breakdowns' },
      dimensionKeys: [],
      collection: {
        counts: { converting: 0, zero: 0, na: 0 },
        rowsWithoutZero: [],
      },
      rows: [],
    },
  ]);
});

it('does not mutate input order or backend observation fields and retains row identity', () => {
  const values = [
    observation({ collectionName: 'Zulu' }, 0),
    observation({ collectionName: 'Beta' }, 20),
    observation({ collectionName: 'Alpha' }, null),
  ];
  const before = JSON.stringify(values);
  for (const value of values) {
    Object.freeze(value.dimensions);
    Object.freeze(value.formula);
    Object.freeze(value.completeness);
    Object.freeze(value);
  }
  Object.freeze(values);

  const [group] = projectGroupedMetric(
    'collection_assisted_conversion_rate',
    values
  );

  expect(group.collection?.rowsWithoutZero[0]).toBe(values[2]);
  expect(group.rows[2]).toBe(values[0]);
  expect(JSON.stringify(values)).toBe(before);
});
