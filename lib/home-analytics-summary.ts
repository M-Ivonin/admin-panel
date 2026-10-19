import type {
  UpdatedHomeAnalyticsResponse,
  UpdatedHomeMetricValue,
} from '@/lib/api/updated-home-analytics';
import { metricValues } from '@/components/updated-home-analytics/presentation';

export type HomeAnalyticsRate = {
  numerator: number;
  denominator: number;
} | null;

export function funnelRate(
  values: UpdatedHomeMetricValue[],
  first: string,
  last: string
): HomeAnalyticsRate {
  const starts = values.filter((value) => value.dimensions.stage === first);
  const ends = values.filter((value) => value.dimensions.stage === last);
  if (starts.length !== 1 || ends.length !== 1) return null;
  const denominator = starts[0].numerator;
  const numerator = ends[0].numerator;
  return denominator !== null && denominator > 0 && numerator !== null
    ? { numerator, denominator }
    : null;
}

export function aggregateRate(
  values: UpdatedHomeMetricValue[]
): HomeAnalyticsRate {
  if (
    !values.length ||
    values.some(
      (value) => value.numerator === null || value.denominator === null
    )
  )
    return null;
  const numerator = values.reduce((sum, value) => sum + value.numerator!, 0);
  const denominator = values.reduce(
    (sum, value) => sum + value.denominator!,
    0
  );
  return denominator > 0 ? { numerator, denominator } : null;
}

export function homeAnalyticsSummary(data: UpdatedHomeAnalyticsResponse) {
  const values = (id: number, key: string) =>
    metricValues(
      data.dashboards.find((dashboard) => dashboard.id === id),
      key
    );
  return [
    {
      title: 'Full Access purchase conversion',
      id: 3,
      rate: funnelRate(
        values(3, 'full_access_funnel'),
        'offer_impression',
        'verified_purchase'
      ),
      detail: 'Offer impression → verified purchase',
      unit: 'users',
    },
    {
      title: 'Free Pick activation',
      id: 2,
      rate: funnelRate(
        values(2, 'free_pick_activation_funnel'),
        'home_viewed',
        'free_pick_prediction_card_opened'
      ),
      detail: 'Home viewed → Prediction Card opened',
      unit: 'users',
    },
    {
      title: 'Paid Top Picks activation',
      id: 6,
      rate: funnelRate(
        values(6, 'top_picks_activation_funnel'),
        'preview_impression',
        'full_analysis_opened'
      ),
      detail: 'Paid preview impression → Full Analysis opened',
      unit: 'users',
    },
    {
      title: 'Collections purchase conversion',
      id: 5,
      rate: funnelRate(
        values(5, 'collection_purchase_funnel'),
        'collection_page_viewed',
        'purchase_succeeded'
      ),
      detail: 'Collection page viewed → verified purchase · 7-day attribution',
      unit: 'users',
    },
    {
      title: 'AI Chat unlock conversion',
      id: 13,
      rate: funnelRate(
        values(13, 'ai_chat_unlock_funnel'),
        'locked_screen_viewed',
        'purchase_succeeded'
      ),
      detail: 'Locked screen viewed → verified purchase',
      unit: 'users',
    },
    {
      title: 'Pass-to-subscription conversion',
      id: 10,
      rate: aggregateRate(values(10, 'pass_to_monthly_conversion_rate')),
      detail: 'Expired pass → monthly subscription · complete 30-day cohorts',
      unit: 'expired passes',
    },
  ];
}

export function homeAnalyticsPercent(rate: HomeAnalyticsRate): number | null {
  return rate
    ? Number(((100 * rate.numerator) / rate.denominator).toFixed(2))
    : null;
}
export function formatHomeAnalyticsRate(rate: HomeAnalyticsRate): string {
  const value = homeAnalyticsPercent(rate);
  return value === null ? 'N/A' : `${value}%`;
}
export function homeAnalyticsHref(
  range: { from: string; to: string },
  id?: number
): string {
  return `/dashboard/updated-home-analytics?${new URLSearchParams(range)}${id ? `#dashboard-${id}` : ''}`;
}
