import type { MonitorCheck, MonitorOverview, Outcome } from '@/lib/api/system-monitor';
import {
  projectDetailedCheckHealth,
  projectDetailedSourceHealth,
  projectOverviewHealth,
} from '@/lib/system-monitor-health';

const now = Date.parse('2026-10-16T12:00:00Z');
const atAge = (age: number) => new Date(now - age).toISOString();
const check: MonitorCheck = {
  checkId: 'backend.health', required: true, enabled: true,
  intervalMs: 120000, deadlineMs: 10000, status: 'pass',
  lastRun: {
    runId: 'run-1', checkId: 'backend.health', scheduledAt: atAge(0),
    startedAt: atAge(0), endedAt: atAge(0), outcome: 'pass', durationMs: 10,
    httpStatus: 200, failedStep: null, errorCode: null, diagnostic: null,
  },
};
const overview: MonitorOverview = {
  generatedAt: atAge(0), environment: 'TEST', workerHeartbeatAt: atAge(0),
  checks: [check], delivery: { slackPending: 0, slackFailed: 0, lokiPending: 0, lokiDropped: 0 },
};
function resultAt(age: number, intervalMs = 120000): MonitorCheck {
  return { ...check, intervalMs, lastRun: { ...check.lastRun!, endedAt: atAge(age) } };
}
const summary = (checks: MonitorCheck[], source = {}) =>
  projectOverviewHealth({ ...overview, ...source, checks }, now);

describe('the separate result expiry policies', () => {
  it.each([
    // Worked boundary examples: interval + deadline + 60s vs 2*interval + deadline.
    [120000, 189999, 'pass', 'pass'],
    [120000, 190000, 'pass', 'pass'],
    [120000, 190001, 'unknown', 'pass'],
    [120000, 249999, 'unknown', 'pass'],
    [120000, 250000, 'unknown', 'pass'],
    [120000, 250001, 'unknown', 'unknown'],
    [30000, 69999, 'pass', 'pass'],
    [30000, 70000, 'pass', 'pass'],
    [30000, 70001, 'pass', 'unknown'],
    [30000, 99999, 'pass', 'unknown'],
    [30000, 100000, 'pass', 'unknown'],
    [30000, 100001, 'unknown', 'unknown'],
    [60000, 129999, 'pass', 'pass'],
    [60000, 130000, 'pass', 'pass'],
    [60000, 130001, 'unknown', 'unknown'],
  ])('interval %i, age %i: overview %s, detailed %s', (interval, age, compact, detailed) => {
    const result = resultAt(age, interval);
    expect(summary([result]).severity).toBe(compact);
    expect(projectDetailedCheckHealth(result, now, false)).toEqual({
      outcome: detailed, stale: detailed === 'unknown',
    });
  });
});

describe('overview health', () => {
  it.each<[Outcome[], string, string]>([
    [['pass'], 'pass', 'pass'],
    [['warn', 'pass'], 'warn', 'warn'],
    [['interrupted'], 'unknown', 'warn'],
    [['unavailable'], 'unknown', 'warn'],
    [['unknown'], 'unknown', 'warn'],
    [['warn', 'unknown'], 'warn', 'warn'],
    [['warn', 'unavailable', 'interrupted'], 'warn', 'warn'],
    [['unknown', 'fail', 'warn'], 'fail', 'fail'],
    [[], 'unknown', 'unknown'],
  ])('outcomes %j preserve overall %s and group %s precedence', (outcomes, severity, backend) => {
    const health = summary(outcomes.map((status) => ({ ...check, status })));
    expect(health.severity).toBe(severity);
    expect(health.groups).toEqual({ backend, n8n: 'unknown', sportmonks: 'unknown' });
  });

  it.each([
    ['disabled', { enabled: false }],
    ['no run', { lastRun: null }],
    ['missing end', { lastRun: { ...check.lastRun!, endedAt: null } }],
    ['invalid end', { lastRun: { ...check.lastRun!, endedAt: 'invalid' } }],
    ['expired fail', { ...resultAt(190001), status: 'fail' as const }],
    ['expired warning', { ...resultAt(190001), status: 'warn' as const }],
  ])('%s cannot contribute a current result', (_name, overrides) => {
    expect(summary([{ ...check, ...overrides }])).toMatchObject({
      severity: 'unknown', passing: 0, required: 1, groups: { backend: 'warn' },
    });
  });

  it('ignores optional checks and keeps empty required sets unknown', () => {
    expect(summary([{ ...check, required: false, status: 'fail' }])).toMatchObject({
      severity: 'unknown', passing: 0, required: 0, groups: { backend: 'unknown' },
    });
    expect(summary([check, { ...check, required: false, status: 'fail' }])).toMatchObject({
      severity: 'pass', passing: 1, required: 1,
    });
  });

  it('projects each required group independently', () => {
    expect(summary([
      check,
      { ...check, checkId: 'n8n.health', status: 'warn' },
      { ...check, checkId: 'sportmonks.leagues', status: 'fail' },
    ])).toMatchObject({
      severity: 'fail', passing: 1, required: 3,
      groups: { backend: 'pass', n8n: 'warn', sportmonks: 'fail' },
    });
  });
});

describe('detailed map health', () => {
  it.each<[Outcome, Outcome]>([
    ['pass', 'unknown'], ['warn', 'unknown'], ['fail', 'unknown'],
    ['unknown', 'unknown'], ['unavailable', 'unavailable'], ['interrupted', 'interrupted'],
  ])('preserves fresh %s and expired %s', (status, expired) => {
    expect(projectDetailedCheckHealth({ ...check, status }, now, false)).toEqual({ outcome: status, stale: false });
    expect(projectDetailedCheckHealth({ ...resultAt(250001), status }, now, false)).toEqual({ outcome: expired, stale: true });
    expect(projectDetailedCheckHealth({ ...check, status }, now, true)).toEqual({ outcome: 'unknown', stale: true });
  });

  it.each([false, true])('disabled results remain unavailable and non-stale when source unavailable is %s', (sourceUnavailable) => {
    expect(projectDetailedCheckHealth({ ...check, enabled: false, lastRun: null }, now, sourceUnavailable)).toEqual({ outcome: 'unavailable', stale: false });
  });

  it.each([null, ''])('missing end %j is stale', (endedAt) => {
    expect(projectDetailedCheckHealth({ ...check, lastRun: { ...check.lastRun!, endedAt } }, now, false)).toEqual({ outcome: 'unknown', stale: true });
  });
  it('treats a missing run as stale', () => {
    expect(projectDetailedCheckHealth({ ...check, lastRun: null }, now, false)).toEqual({ outcome: 'unknown', stale: true });
  });
  it('preserves the existing fresh outcome for an invalid nonempty end timestamp', () => {
    expect(projectDetailedCheckHealth({ ...check, lastRun: { ...check.lastRun!, endedAt: 'invalid' } }, now, false)).toEqual({ outcome: 'pass', stale: false });
  });
});

describe('source policies', () => {
  it.each<[string, string, string | null, boolean, boolean]>([
    ['fresh', atAge(0), atAge(0), false, false],
    ['before snapshot expiry', atAge(299999), atAge(0), false, false],
    ['snapshot expiry boundary', atAge(300000), atAge(0), false, false],
    ['expired snapshot', atAge(300001), atAge(0), true, true],
    ['before heartbeat expiry', atAge(0), atAge(299999), false, false],
    ['heartbeat expiry boundary', atAge(0), atAge(300000), false, false],
    ['expired heartbeat', atAge(0), atAge(300001), true, true],
    ['missing heartbeat', atAge(0), null, true, true],
    ['empty heartbeat', atAge(0), '', true, true],
    ['missing snapshot', '', atAge(0), true, false],
    ['invalid snapshot', 'invalid', atAge(0), true, false],
    ['invalid heartbeat', atAge(0), 'invalid', true, false],
  ])('%s preserves each source policy', (_name, generatedAt, workerHeartbeatAt, compactStale, detailedStale) => {
    const source = { generatedAt, workerHeartbeatAt };
    const health = summary([check], source);
    expect(health).toMatchObject({ stale: compactStale, severity: compactStale ? 'unknown' : 'pass', passing: 1, required: 1 });
    if (compactStale) expect(health.groups.backend).toBe('unknown');
    expect(projectDetailedSourceHealth({ ...overview, ...source }, now)).toEqual({ stale: detailedStale });
  });
});
