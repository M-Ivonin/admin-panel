import { homeAnalyticsFunnel } from '@/lib/home-analytics-funnel';
import type { UpdatedHomeMetricValue } from '@/lib/api/updated-home-analytics';

function stage(
  name: string,
  ordinal: unknown,
  numerator: number | null,
  value: number | null,
  overrides: Partial<UpdatedHomeMetricValue> = {}
): UpdatedHomeMetricValue {
  return {
    dimensions: { stage: name, stageOrdinal: ordinal },
    numerator,
    denominator: null,
    value,
    unit: 'percent',
    formula: { numerator: 'users', denominator: 'previous-stage users' },
    completeness: { isComplete: true, reason: null },
    naReason: null,
    ...overrides,
  };
}

it('keeps overall conversion separate from backend previous-stage percentages', () => {
  const values = [
    stage('entry', 1, 100, 100, { unit: 'users' }),
    stage('click', 2, 40, 39.9),
    stage('purchase', 3, 10, 24.9),
  ];
  const funnel = homeAnalyticsFunnel(values);

  expect(funnel.ordinalsValid).toBe(true);
  expect(funnel.overall).toEqual({ numerator: 10, denominator: 100 });
  expect(funnel.stages.map(({ stage }) => stage)).toEqual([
    'entry',
    'click',
    'purchase',
  ]);
  expect(funnel.stages[0]).toMatchObject({
    baseline: true,
    available: true,
    trackWidth: 100,
    rate: { kind: 'baseline' },
  });
  expect(funnel.stages[2]).toMatchObject({
    baseline: false,
    trackWidth: 24.9,
    rate: { kind: 'value', value: 24.9 },
  });
  expect(funnel.stages[2].value).toBe(values[2]);
});

it('returns no stages or conversion for empty input', () => {
  expect(homeAnalyticsFunnel([])).toEqual({
    ordinalsValid: true,
    overall: null,
    stages: [],
  });
});

it.each([
  ['reversed', [2, 1]],
  ['duplicate', [1, 1]],
  ['gap', [1, 3]],
  ['missing', [1, undefined]],
  ['string', [1, '2']],
] as const)('rejects %s ordinals without rearranging stages', (_, ordinals) => {
  const values = [
    stage('purchase', ordinals[0], 100, 100),
    stage('entry', ordinals[1], 20, 20),
  ];
  const funnel = homeAnalyticsFunnel(values);

  expect(funnel.ordinalsValid).toBe(false);
  expect(funnel.overall).toBeNull();
  expect(funnel.stages.map(({ value }) => value)).toEqual(values);
  expect(funnel.stages.map(({ stage }) => stage)).toEqual([
    'purchase',
    'entry',
  ]);
  expect(funnel.stages[1].rate).toEqual({ kind: 'value', value: 20 });
});

it.each([
  ['missing initial count', null, 10, null],
  ['missing final count', 100, null, null],
  ['zero initial cohort', 0, 0, null],
  ['observed zero conversions', 100, 0, { numerator: 0, denominator: 100 }],
] as const)(
  'handles %s independently of step availability',
  (_, first, last, overall) => {
    const funnel = homeAnalyticsFunnel([
      stage('entry', 1, first, first),
      stage('purchase', 2, last, null),
    ]);

    expect(funnel.overall).toEqual(overall);
    expect(funnel.stages[1]).toMatchObject({
      available: false,
      trackWidth: 0,
      rate: { kind: 'unavailable' },
    });
    expect(funnel.stages[1].value.numerator).toBe(last);
  }
);

it.each([
  ['positive cohort', 50, 50, true, 100, 'baseline'],
  [
    'positive count with unavailable backend value',
    50,
    null,
    false,
    100,
    'baseline',
  ],
  ['empty cohort', 0, 0, true, 0, 'unavailable'],
  ['missing count with returned value', null, 50, true, 0, 'unavailable'],
  ['unavailable cohort', null, null, false, 0, 'unavailable'],
] as const)(
  'calculates the baseline for a %s',
  (_, numerator, value, available, trackWidth, kind) => {
    const funnel = homeAnalyticsFunnel([stage('entry', 1, numerator, value)]);

    expect(funnel.stages[0]).toMatchObject({
      baseline: true,
      available,
      trackWidth,
      rate: { kind },
    });
  }
);

it.each([
  [-12.5, 0],
  [0, 0],
  [23.4, 23.4],
  [140, 100],
  [null, 0],
])('clamps only the track for backend rate %s', (value, trackWidth) => {
  const backend = stage('purchase', 2, 0, value, {
    naReason: 'N/A: No eligible previous-stage users.',
    denominator: 7,
  });
  const funnel = homeAnalyticsFunnel([stage('entry', 1, 100, 100), backend]);

  expect(funnel.stages[1]).toMatchObject({
    value: backend,
    available: value !== null,
    trackWidth,
    rate: value === null ? { kind: 'unavailable' } : { kind: 'value', value },
  });
  expect(funnel.stages[1].value).toBe(backend);
});

it('allows unknown intermediate counts without suppressing endpoint conversion', () => {
  const funnel = homeAnalyticsFunnel([
    stage('entry', 1, 100, 100),
    stage('click', 2, null, null),
    stage('purchase', 3, 0, null),
  ]);

  expect(funnel.overall).toEqual({ numerator: 0, denominator: 100 });
});

it('uses a fallback stage label and suppresses conversion for a missing endpoint name', () => {
  const funnel = homeAnalyticsFunnel([
    stage('entry', 1, 100, 100),
    stage('purchase', 2, 20, 20, { dimensions: { stageOrdinal: 2 } }),
  ]);

  expect(funnel.ordinalsValid).toBe(true);
  expect(funnel.overall).toBeNull();
  expect(funnel.stages[1].stage).toBe('unknown_stage');
});

it('keeps duplicate endpoint names in response order without selecting an arbitrary count', () => {
  const funnel = homeAnalyticsFunnel([
    stage('entry', 1, 100, 100),
    stage('entry', 2, 50, 50),
    stage('purchase', 3, 20, 40),
  ]);

  expect(funnel.ordinalsValid).toBe(true);
  expect(funnel.overall).toBeNull();
  expect(funnel.stages.map(({ stage }) => stage)).toEqual([
    'entry',
    'entry',
    'purchase',
  ]);
});
