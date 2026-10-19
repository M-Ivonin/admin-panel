import {
  defaultHomeAnalyticsRange,
  homeAnalyticsRequestRange,
  linkedHomeAnalyticsRange,
  transitionHomeAnalyticsRange,
} from '@/lib/home-analytics-range';

const linkedTimestamps = {
  from: '2026-10-10T00:00:00.000Z',
  to: '2026-10-10T14:30:12.345Z',
};

it('defaults to seven inclusive UTC dates, including today', () => {
  const range = defaultHomeAnalyticsRange(new Date('2026-10-10T23:30:00-03:00'));
  expect(range).toEqual({ from: '2026-10-05', to: '2026-10-11' });
  expect(homeAnalyticsRequestRange(range)).toEqual({
    from: '2026-10-05T00:00:00.000Z',
    to: '2026-10-11T23:59:59.999Z',
  });
});

it('accepts canonical linked UTC timestamps and preserves their exact request cutoff', () => {
  const range = linkedHomeAnalyticsRange(linkedTimestamps);
  expect(range).toEqual({
    from: '2026-10-10',
    to: '2026-10-10',
    cutoff: '2026-10-10T14:30:12.345Z',
  });
  expect(homeAnalyticsRequestRange(range!)).toEqual(linkedTimestamps);
});

it.each([
  { from: null, to: linkedTimestamps.to },
  { from: linkedTimestamps.from, to: null },
  { from: '', to: linkedTimestamps.to },
  { from: 'invalid', to: linkedTimestamps.to },
  { from: linkedTimestamps.from, to: 'invalid' },
  { from: '2026-10-10', to: linkedTimestamps.to },
  { from: '2026-10-10T00:00:00Z', to: linkedTimestamps.to },
  { from: linkedTimestamps.from, to: '2026-10-10T14:30:12Z' },
  { from: linkedTimestamps.from, to: '2026-10-10T16:30:12.345+02:00' },
  { from: '2026-10-10T01:00:00.000Z', to: linkedTimestamps.to },
  { from: '2026-02-30T00:00:00.000Z', to: '2026-03-03T00:00:00.000Z' },
  { from: linkedTimestamps.from, to: '2026-10-09T23:59:59.999Z' },
])('rejects invalid or noncanonical linked timestamps: %j', (timestamps) => {
  expect(linkedHomeAnalyticsRange(timestamps)).toBeNull();
});

it('accepts exactly 90 inclusive linked days and rejects a 91st day', () => {
  const from = '2026-01-01T00:00:00.000Z';
  const to = '2026-03-31T23:59:59.999Z';
  const range = linkedHomeAnalyticsRange({ from, to });
  expect(range).not.toBeNull();
  expect(homeAnalyticsRequestRange(range!)).toEqual({ from, to });
  expect(
    linkedHomeAnalyticsRange({ from, to: '2026-04-01T00:00:00.000Z' })
  ).toBeNull();
});

it.each([
  { from: '', to: '2026-10-10' },
  { from: '2026-10-10', to: '' },
  { from: 'invalid', to: '2026-10-10' },
  { from: '2026-10-10', to: 'invalid' },
  { from: '2026-10-11', to: '2026-10-10' },
])('rejects invalid or reversed selected dates: %j', (selection) => {
  expect(transitionHomeAnalyticsRange(null, selection)).toEqual({
    range: null,
    error: 'Choose a valid UTC date range.',
  });
});

it('accepts exactly 90 inclusive selected days and rejects 91', () => {
  const accepted = transitionHomeAnalyticsRange(null, {
    from: '2026-01-01',
    to: '2026-03-31',
  });
  expect(accepted.error).toBeNull();
  expect(homeAnalyticsRequestRange(accepted.range!)).toEqual({
    from: '2026-01-01T00:00:00.000Z',
    to: '2026-03-31T23:59:59.999Z',
  });
  expect(
    transitionHomeAnalyticsRange(null, { from: '2026-01-01', to: '2026-04-01' })
  ).toEqual({ range: null, error: 'Maximum range is 90 days.' });
});

it('keeps the applied range and exact linked cutoff when refreshing unchanged dates', () => {
  const applied = linkedHomeAnalyticsRange(linkedTimestamps);
  const refreshed = transitionHomeAnalyticsRange(applied, {
    from: '2026-10-10',
    to: '2026-10-10',
  });
  expect(refreshed.error).toBeNull();
  expect(refreshed.range).toBe(applied);
  expect(homeAnalyticsRequestRange(refreshed.range!)).toEqual(linkedTimestamps);
});

it.each([
  [
    { from: '2026-10-09', to: '2026-10-10' },
    { from: '2026-10-09T00:00:00.000Z', to: '2026-10-10T23:59:59.999Z' },
  ],
  [
    { from: '2026-10-10', to: '2026-10-11' },
    { from: '2026-10-10T00:00:00.000Z', to: '2026-10-11T23:59:59.999Z' },
  ],
  [
    { from: '2026-10-09', to: '2026-10-11' },
    { from: '2026-10-09T00:00:00.000Z', to: '2026-10-11T23:59:59.999Z' },
  ],
])('expands changed dates to full UTC days: %j', (selection, timestamps) => {
  const applied = linkedHomeAnalyticsRange(linkedTimestamps);
  const changed = transitionHomeAnalyticsRange(applied, selection);
  expect(changed.error).toBeNull();
  expect(changed.range).not.toBe(applied);
  expect(changed.range).toEqual(selection);
  expect(homeAnalyticsRequestRange(changed.range!)).toEqual(timestamps);
  const refreshed = transitionHomeAnalyticsRange(changed.range, selection);
  expect(refreshed.range).toBe(changed.range);
});

it('does not restore an old linked cutoff after applying different dates', () => {
  const applied = linkedHomeAnalyticsRange(linkedTimestamps);
  const changed = transitionHomeAnalyticsRange(applied, {
    from: '2026-10-09',
    to: '2026-10-10',
  });
  const returned = transitionHomeAnalyticsRange(changed.range, {
    from: '2026-10-10',
    to: '2026-10-10',
  });
  expect(homeAnalyticsRequestRange(returned.range!)).toEqual({
    from: '2026-10-10T00:00:00.000Z',
    to: '2026-10-10T23:59:59.999Z',
  });
});
