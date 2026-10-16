import type {
  MonitorCheck,
  MonitorOverview,
  Outcome,
} from '@/lib/api/system-monitor';

type Severity = 'pass' | 'warn' | 'fail' | 'unknown';

function overviewOutcome(check: MonitorCheck, now: number): Outcome {
  if (!check.enabled || !check.lastRun) return 'unknown';
  const ended = Date.parse(check.lastRun.endedAt ?? '');
  // Overview allows one interval, the deadline, and a minute of grace.
  if (
    !Number.isFinite(ended) ||
    now - ended > check.intervalMs + check.deadlineMs + 60_000
  )
    return 'unknown';
  return check.status;
}

/** Compact overview policy: only required checks contribute to health. */
export function projectOverviewHealth(overview: MonitorOverview, now: number) {
  const checks = overview.checks.filter((check) => check.required);
  const snapshot = Date.parse(overview.generatedAt);
  const heartbeat = Date.parse(overview.workerHeartbeatAt ?? '');
  const stale =
    !Number.isFinite(snapshot) ||
    !Number.isFinite(heartbeat) ||
    now - snapshot > 300_000 ||
    now - heartbeat > 300_000;
  const outcomes = checks.map((check) => overviewOutcome(check, now));
  const severity: Severity =
    stale || !checks.length
      ? 'unknown'
      : outcomes.includes('fail')
        ? 'fail'
        : outcomes.includes('warn')
          ? 'warn'
          : outcomes.some((outcome) =>
                ['unknown', 'unavailable', 'interrupted'].includes(outcome)
              )
            ? 'unknown'
            : 'pass';
  const group = (prefix: string): Severity => {
    const subset = checks.filter((check) => check.checkId.startsWith(prefix));
    return stale || !subset.length
      ? 'unknown'
      : subset.every((check) => overviewOutcome(check, now) === 'pass')
        ? 'pass'
        : subset.some((check) => overviewOutcome(check, now) === 'fail')
          ? 'fail'
          : 'warn';
  };
  return {
    stale,
    severity,
    passing: outcomes.filter((outcome) => outcome === 'pass').length,
    required: checks.length,
    groups: {
      backend: group('backend.'),
      n8n: group('n8n.'),
      sportmonks: group('sportmonks.'),
    },
  };
}

/** Detailed map policy: disabled checks and interrupted coverage remain distinct. */
export function projectDetailedCheckHealth(
  check: MonitorCheck,
  now: number,
  sourceUnavailable: boolean
) {
  // Detailed checks allow two intervals plus the deadline, with no extra grace.
  // Preserve the existing treatment of invalid nonempty dates (NaN is not overdue).
  const stale =
    check.enabled &&
    (sourceUnavailable ||
      !check.lastRun?.endedAt ||
      now - Date.parse(check.lastRun.endedAt) >
        check.intervalMs * 2 + check.deadlineMs);
  const outcome: Outcome = !check.enabled
    ? 'unavailable'
    : sourceUnavailable ||
        (stale && !['unavailable', 'interrupted'].includes(check.status))
      ? 'unknown'
      : check.status;
  return { outcome, stale };
}

/** Detailed source policy intentionally preserves its existing timestamp handling. */
export function projectDetailedSourceHealth(overview: MonitorOverview, now: number) {
  return {
    stale:
      now - Date.parse(overview.generatedAt) > 300_000 ||
      !overview.workerHeartbeatAt ||
      now - Date.parse(overview.workerHeartbeatAt) > 300_000,
  };
}
