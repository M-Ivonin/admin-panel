const MAX_RANGE_DAYS = 90;
const DAY_MS = 86_400_000;

type DateSelection = { from: string; to: string };

export type HomeAnalyticsRange = DateSelection & { cutoff?: string };

export function defaultHomeAnalyticsRange(now: Date): HomeAnalyticsRange {
  const today = now.toISOString().slice(0, 10);
  const firstDay = new Date(now.getTime() - 6 * DAY_MS).toISOString().slice(0, 10);
  return { from: firstDay, to: today };
}

export function linkedHomeAnalyticsRange(params: {
  from: string | null;
  to: string | null;
}): HomeAnalyticsRange | null {
  const { from, to } = params;
  if (!from || !to) return null;
  const start = Date.parse(from);
  const end = Date.parse(to);
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start > end ||
    end - start >= MAX_RANGE_DAYS * DAY_MS ||
    new Date(start).toISOString() !== from ||
    new Date(end).toISOString() !== to ||
    !from.endsWith('T00:00:00.000Z')
  )
    return null;
  return { from: from.slice(0, 10), to: to.slice(0, 10), cutoff: to };
}

export function transitionHomeAnalyticsRange(
  appliedRange: HomeAnalyticsRange | null,
  selection: DateSelection
):
  | { range: HomeAnalyticsRange; error: null }
  | { range: null; error: string } {
  const { from, to } = selection;
  const fromTime = Date.parse(`${from}T00:00:00.000Z`);
  const toTime = Date.parse(`${to}T00:00:00.000Z`);
  if (
    !Number.isFinite(fromTime) ||
    !Number.isFinite(toTime) ||
    fromTime > toTime
  ) {
    return { range: null, error: 'Choose a valid UTC date range.' };
  }
  if ((toTime - fromTime) / DAY_MS >= MAX_RANGE_DAYS) {
    return { range: null, error: `Maximum range is ${MAX_RANGE_DAYS} days.` };
  }
  // Keeping the same object signals a refresh and retains the linked cutoff.
  const range =
    from === appliedRange?.from && to === appliedRange?.to
      ? appliedRange
      : { from, to };
  return { range, error: null };
}

export function homeAnalyticsRequestRange(range: HomeAnalyticsRange): {
  from: string;
  to: string;
} {
  return {
    from: `${range.from}T00:00:00.000Z`,
    to: range.cutoff ?? `${range.to}T23:59:59.999Z`,
  };
}
