import type { MonitorIncident, MonitorRun } from '@/lib/api/system-monitor';

export type TimeWindow = { from: string; to: string };

const retentionHours = 7 * 24;
const retentionMs = retentionHours * 3600000;

/** Build a selection once; subsequent requests retain its end time. */
export function periodWindow(hours: number, now: number): TimeWindow {
  return {
    from: new Date(now - hours * 3600000).toISOString(),
    to: new Date(now).toISOString(),
  };
}

export function incidentLinkWindow(now: number): TimeWindow {
  return periodWindow(retentionHours, now);
}

/** Clamp at request time without advancing the selected end. */
export function retainedWindow(
  window: TimeWindow,
  now: number
): TimeWindow | null {
  const from = Math.max(Date.parse(window.from), now - retentionMs);
  const to = Math.min(Date.parse(window.to), now);
  if (from >= to) return null;
  return { from: new Date(from).toISOString(), to: new Date(to).toISOString() };
}

/** Run end takes precedence over incident confirmation, then incident opening. */
export function logWindow(
  range: TimeWindow,
  context: {
    run?: Pick<MonitorRun, 'endedAt'> | null;
    incident?: Pick<MonitorIncident, 'confirmedAt' | 'openedAt'> | null;
  },
  now: number
): TimeWindow | null {
  const pivot =
    context.run?.endedAt ??
    context.incident?.confirmedAt ??
    context.incident?.openedAt;
  return retainedWindow(
    pivot
      ? {
          from: new Date(Date.parse(pivot) - 5 * 60000).toISOString(),
          to: new Date(Date.parse(pivot) + 5 * 60000).toISOString(),
        }
      : range,
    now
  );
}
