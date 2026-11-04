import type { MonitorCheck, Outcome } from '@/lib/api/system-monitor';
import { projectDetailedCheckHealth } from '@/lib/system-monitor-health';

export type MonitorAspect = 'database' | 'personalization';
export const monitorAspectNames: Record<MonitorAspect, string> = {
  database: 'Database load',
  personalization: 'Personalization health',
};
interface AspectHealth {
  outcome: Outcome;
  label: string;
  reason?: string;
}

/** Two views of one observation; the probe's aggregate outcome is not either status. */
export function projectPersonalizationHealth(
  check: MonitorCheck,
  now: number,
  sourceUnavailable: boolean
): { database: AspectHealth; personalization: AspectHealth; stale: boolean } {
  const health = projectDetailedCheckHealth(check, now, sourceUnavailable);
  const ended = Date.parse(check.lastRun?.endedAt ?? '');
  const stale = health.stale || !Number.isFinite(ended);
  const both = (status: AspectHealth) => ({
    database: status,
    personalization: status,
    stale,
  });
  if (!check.enabled)
    return both({ outcome: 'unavailable', label: 'Disabled' });
  if (stale) return both({ outcome: 'unknown', label: 'No fresh data' });
  if (['unknown', 'unavailable', 'interrupted'].includes(health.outcome)) {
    return both({
      outcome: health.outcome,
      label: health.outcome === 'interrupted' ? 'Interrupted' : 'Unavailable',
    });
  }
  const saved = check.lastRun?.personalizationLoad;
  const m = saved?.scope === 'database' ? saved : undefined;
  const personal = m?.personalization;
  let database: AspectHealth;
  if (!m || m.measurement === 'unavailable' || !m.measurement) {
    database = {
      outcome: 'unavailable',
      label: 'Unavailable',
      reason: 'Database measurement is unavailable.',
    };
  } else if (
    m.sqlMsPerMinute != null &&
    m.baselineSqlMsPerMinute != null &&
    m.sqlMsPerMinute > Math.max(1000, m.baselineSqlMsPerMinute * 3)
  ) {
    database = {
      outcome: 'fail',
      label: 'Needs attention',
      reason: 'Database load is above the learned alert threshold.',
    };
  } else if (m.measurement === 'partial') {
    database = {
      outcome: 'unavailable',
      label: 'Incomplete measurement',
      reason: 'Database measurement is incomplete.',
    };
  } else if (m.measurement === 'warmup') {
    database = { outcome: 'warn', label: 'Collecting data' };
  } else if (m.sqlMsPerMinute == null) {
    database = {
      outcome: 'unavailable',
      label: 'Unavailable',
      reason: 'Database measurement is unavailable.',
    };
  } else if (m.baselineSqlMsPerMinute == null) {
    database = { outcome: 'warn', label: 'Learning baseline' };
  } else {
    database = { outcome: 'pass', label: 'Healthy' };
  }

  let personalization: AspectHealth;
  // Source outages retain old portrait totals; do not treat these as a fresh observation.
  const freshnessKnown =
    m &&
    (m.measurement !== 'unavailable' ||
      (personal && personal.measurement !== 'unavailable') ||
      check.lastRun?.errorCode === 'personalization_stale');
  const lastRunAt = Date.parse(personal?.lastRunAt ?? '');
  const jobStale =
    check.lastRun?.errorCode === 'personalization_job_stale' ||
    (personal &&
      personal.measurement !== 'unavailable' &&
      Number.isFinite(lastRunAt) &&
      ended - lastRunAt > 180000);
  if (personal?.measurement === 'disabled') {
    personalization = {
      outcome: 'unavailable',
      label: 'Disabled',
      reason: 'Personalization is disabled.',
    };
  } else if (freshnessKnown && m.overduePortraits > 0) {
    personalization = {
      outcome: 'fail',
      label: 'Needs attention',
      reason: 'Portrait processing is overdue.',
    };
  } else if (jobStale) {
    personalization = {
      outcome: 'fail',
      label: 'Reconciliation overdue',
      reason:
        'Personalization reconciliation has not completed for over three minutes.',
    };
  } else if (
    !personal ||
    ['unavailable', 'partial'].includes(personal.measurement)
  ) {
    personalization = {
      outcome: 'unavailable',
      label: 'Unavailable',
      reason: 'No complete work interval is available.',
    };
  } else if (personal.measurement === 'warmup') {
    personalization = { outcome: 'warn', label: 'Collecting work interval' };
  } else if (
    (personal.failed ?? 0) > 0 ||
    (personal.sourcePollFailures ?? 0) > 0
  ) {
    personalization = {
      outcome: 'warn',
      label: 'Warning',
      reason:
        'Personalization reported refresh errors or source poll fallbacks. These are separate from database measurement failures.',
    };
  } else {
    personalization = { outcome: 'pass', label: 'Healthy' };
  }
  return { database, personalization, stale };
}

/** Evaluate a saved observation at its own time, independent of today's enabled state. */
export function projectPersonalizationRunHealth(
  run: import('@/lib/api/system-monitor').MonitorRun,
  check: MonitorCheck
) {
  return projectPersonalizationHealth(
    { ...check, enabled: true, status: run.outcome, lastRun: run },
    Date.parse(run.endedAt ?? ''),
    false
  );
}
