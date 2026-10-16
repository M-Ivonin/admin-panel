import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import type { AppEventsAnalyticsResponse } from './app-events-analytics';
import type { OnboardingFunnelAnalyticsResponse } from './onboarding-analytics';
import type {
  PaginatedPredictionEvaluationGroupsResponse,
  PredictionEvaluationSummary,
} from './prediction-evaluations';
import type {
  PaginatedRevenueLedgerEntriesResponse,
  RevenueLedgerSummary,
} from './revenue-ledger';
import type { MonitorOverview } from './system-monitor';

export interface DailyValue {
  date: string;
  value: number | null;
}
export interface GrowthMetric {
  today: number;
  previous: number;
  daily: DailyValue[];
}
export interface GrowthOverview {
  date: string;
  cutoff: string;
  partial: boolean;
  registrations: GrowthMetric;
  subscriptions: GrowthMetric;
}
export interface MarketingOverview {
  campaigns: { sent: number; opened: number; openRate: number | null };
  email: {
    delivered: number;
    clicked: number | null;
    clickRate: number | null;
  };
  deliveryFailures: number;
}
export interface RevenueOverview {
  today: RevenueLedgerSummary;
  previous: RevenueLedgerSummary;
  week: RevenueLedgerSummary;
}
export interface EventsOverview {
  today: AppEventsAnalyticsResponse;
  previous: AppEventsAnalyticsResponse;
}
export interface PredictionsOverview {
  today: PredictionEvaluationSummary;
  daily: Array<{ date: string; summary: PredictionEvaluationSummary | null }>;
}
export interface OverviewData {
  growth: GrowthOverview;
  marketing: MarketingOverview;
  revenue: RevenueOverview;
  events: EventsOverview;
  predictions: PredictionsOverview;
  onboarding: OnboardingFunnelAnalyticsResponse;
  monitor: MonitorOverview;
  support: { total: number };
}
export type OverviewSection = keyof OverviewData;
export type SectionState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string };
export type OverviewState = {
  [K in OverviewSection]: SectionState<OverviewData[K]>;
};

export function overviewWindow(date: string, now = new Date()) {
  const start = new Date(`${date}T00:00:00.000Z`);
  const day = 86_400_000;
  const partial = date === now.toISOString().slice(0, 10);
  const end = partial ? now : new Date(start.getTime() + day - 1);
  const days = Array.from({ length: 7 }, (_, i) =>
    new Date(start.getTime() - (6 - i) * day).toISOString().slice(0, 10)
  );
  return {
    date,
    from: start.toISOString(),
    to: end.toISOString(),
    weekFrom: `${days[0]}T00:00:00.000Z`,
    previousFrom: new Date(start.getTime() - day).toISOString(),
    previousTo: new Date(end.getTime() - day).toISOString(),
    partial,
    days,
  };
}

async function get<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await adminAuthFetch({ path, signal, cache: 'no-store' });
  if (!response.ok)
    throw new Error(
      response.status === 403
        ? 'You do not have access to this report.'
        : response.status === 401
          ? 'Your session has expired.'
          : 'Data unavailable. Refresh to retry.'
    );
  return response.json() as Promise<T>;
}
const query = (params: Record<string, string | number>) =>
  new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();

/** Reads existing admin reports plus bounded overview aggregates. No demo data. */
export function overviewRequests(
  range: ReturnType<typeof overviewWindow>,
  signal: AbortSignal
): { [K in OverviewSection]: () => Promise<OverviewData[K]> } {
  const date = range.date;
  const events = (from: string, to: string) =>
    get<AppEventsAnalyticsResponse>(
      `/app-events/admin/analytics?${query({ from, to, sourceType: 'user', limit: 1 })}`,
      signal
    );
  const revenue = (dateFrom: string, dateTo: string) =>
    get<PaginatedRevenueLedgerEntriesResponse>(
      `/revenue-ledger/admin/entries?${query({ dateFrom, dateTo, environment: 'production', limit: 1 })}`,
      signal
    );
  return {
    growth: () =>
      get<GrowthOverview>(`/admin-overview/growth?date=${date}`, signal),
    marketing: () =>
      get<MarketingOverview>(`/admin-overview/marketing?date=${date}`, signal),
    support: () =>
      get<{ total: number }>(
        `/support-chat/admin/tickets?${query({ status: 'open', page: 1, limit: 1 })}`,
        signal
      ),
    monitor: async () => {
      const capabilities = await get<{ canRead: boolean }>(
        '/system-monitor/admin/capabilities',
        signal
      );
      if (!capabilities.canRead)
        throw new Error('You do not have access to System Monitor.');
      return get<MonitorOverview>('/system-monitor/admin/overview', signal);
    },
    revenue: async () => {
      const accessResponse = await fetch('/api/revenue-ledger-access', {
        signal,
        cache: 'no-store',
      });
      if (!accessResponse.ok)
        throw new Error('Unable to check Revenue Ledger access.');
      const access = (await accessResponse.json()) as { hasAccess: boolean };
      if (!access.hasAccess)
        throw new Error('Unlock Revenue Ledger to view revenue.');
      const [today, previous, week] = await Promise.all([
        revenue(range.from, range.to),
        revenue(range.previousFrom, range.previousTo),
        revenue(range.weekFrom, range.to),
      ]);
      return {
        today: today.summary,
        previous: previous.summary,
        week: week.summary,
      };
    },
    events: async () => {
      const [today, previous] = await Promise.all([
        events(range.from, range.to),
        events(range.previousFrom, range.previousTo),
      ]);
      return { today, previous };
    },
    onboarding: () =>
      get<OnboardingFunnelAnalyticsResponse>(
        `/onboarding-funnel/admin/analytics?${query({ from: range.from, to: range.to, recent_events_limit: 1 })}`,
        signal
      ),
    predictions: async () => {
      const settled = await Promise.allSettled(
        range.days.map((day) =>
          get<PaginatedPredictionEvaluationGroupsResponse>(
            `/match-predictions/admin/evaluations?${query({ dateFrom: `${day}T00:00:00.000Z`, dateTo: day === date ? range.to : `${day}T23:59:59.999Z`, page: 1, limit: 1 })}`,
            signal
          )
        )
      );
      const current = settled[6];
      if (current.status === 'rejected') throw current.reason;
      return {
        today: current.value.summary,
        daily: settled.map((result, i) => ({
          date: range.days[i],
          summary: result.status === 'fulfilled' ? result.value.summary : null,
        })),
      };
    },
  };
}
