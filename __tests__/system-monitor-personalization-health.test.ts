import type {
  MonitorCheck,
  PersonalizationLoad,
} from '@/lib/api/system-monitor';
import { projectPersonalizationHealth } from '@/lib/system-monitor-personalization-health';

const now = Date.parse('2026-11-04T16:00:00Z');
function check(patch: Partial<PersonalizationLoad> = {}): MonitorCheck {
  return {
    checkId: 'backend.personalization.load',
    enabled: true,
    required: true,
    intervalMs: 900000,
    deadlineMs: 15000,
    status: 'fail',
    lastRun: {
      runId: 'shared',
      checkId: 'backend.personalization.load',
      scheduledAt: new Date(now).toISOString(),
      startedAt: new Date(now).toISOString(),
      endedAt: new Date(now).toISOString(),
      outcome: 'fail',
      durationMs: 10,
      httpStatus: 200,
      failedStep: null,
      errorCode: null,
      diagnostic: null,
      personalizationLoad: {
        scope: 'database',
        measurement: 'complete',
        sqlMsPerMinute: 100,
        callsPerMinute: 10,
        sharedBlocksPerMinute: 100,
        writesPerMinute: 5,
        baselineSqlMsPerMinute: 100,
        baselineHours: 24,
        loadRatio: 1,
        totalPortraits: 100,
        overduePortraits: 0,
        lastCheckedAt: new Date(now).toISOString(),
        personalization: {
          measurement: 'complete',
          intervalMinutes: 15,
          runs: 15,
          checked: 100,
          reused: 100,
          failed: 0,
          sourcePolls: 15,
          sourcePollFailures: 0,
          averageRunMs: 10,
          averageSourcePollMs: 10,
          lastRunAt: new Date(now).toISOString(),
          lastSuccessfulAt: new Date(now).toISOString(),
          lastRunMs: 10,
        },
        ...patch,
      },
    },
  };
}
it.each([
  'disabled',
  'stale',
  'offline',
  'interrupted',
  'missing',
  'invalid timestamp',
])('does not show either card as healthy for %s coverage', (scenario) => {
  const value = check();
  if (scenario === 'disabled') value.enabled = false;
  if (scenario === 'stale')
    value.lastRun!.endedAt = new Date(now - 3600000).toISOString();
  if (scenario === 'interrupted') value.status = 'interrupted';
  if (scenario === 'missing') value.lastRun = null;
  if (scenario === 'invalid timestamp') value.lastRun!.endedAt = 'invalid';
  const result = projectPersonalizationHealth(
    value,
    now,
    scenario === 'offline'
  );
  expect(result.database.outcome).not.toBe('pass');
  expect(result.personalization.outcome).not.toBe('pass');
});
it('reports a proven lower-bound overload even with partial SQL counters', () => {
  const result = projectPersonalizationHealth(
    check({ measurement: 'partial', sqlMsPerMinute: 1001 }),
    now,
    false
  );
  expect(result.database.outcome).toBe('fail');
  expect(result.personalization.outcome).toBe('pass');
});
it('does not mistake partial SQL counters below threshold for healthy load', () => {
  const result = projectPersonalizationHealth(
    check({ measurement: 'partial' }),
    now,
    false
  );
  expect(result.database.label).toBe('Incomplete measurement');
  expect(result.personalization.outcome).toBe('pass');
});
it('uses the absolute threshold floor with a zero baseline', () => {
  expect(
    projectPersonalizationHealth(
      check({ baselineSqlMsPerMinute: 0, sqlMsPerMinute: 1000 }),
      now,
      false
    ).database.outcome
  ).toBe('pass');
  expect(
    projectPersonalizationHealth(
      check({ baselineSqlMsPerMinute: 0, sqlMsPerMinute: 1001 }),
      now,
      false
    ).database.outcome
  ).toBe('fail');
});
it('finds stalled reconciliation even when SQL measurement failure owns the combined error', () => {
  const value = check({ measurement: 'unavailable', sqlMsPerMinute: null });
  value.lastRun!.errorCode = 'personalization_measurement_unavailable';
  value.lastRun!.personalizationLoad!.personalization!.lastRunAt = new Date(
    now - 300000
  ).toISOString();
  const result = projectPersonalizationHealth(value, now, false);
  expect(result.database.outcome).toBe('unavailable');
  expect(result.personalization.label).toBe('Reconciliation overdue');
});
it('does not reuse retained overdue totals as a current failure during a source outage', () => {
  const value = check({
    measurement: 'unavailable',
    sqlMsPerMinute: null,
    overduePortraits: 4,
  });
  value.lastRun!.personalizationLoad!.personalization!.measurement =
    'unavailable';
  const result = projectPersonalizationHealth(value, now, false);
  expect(result.personalization.outcome).toBe('unavailable');
});
it.each(['disabled', 'warmup'] as const)(
  'keeps %s work independent of healthy database counters',
  (measurement) => {
    const value = check();
    value.lastRun!.personalizationLoad!.personalization!.measurement =
      measurement;
    const result = projectPersonalizationHealth(value, now, false);
    expect(result.database.outcome).toBe('pass');
    expect(result.personalization.label).toBe(
      measurement === 'disabled' ? 'Disabled' : 'Collecting work interval'
    );
  }
);
