import type {
  UpdatedHomeAnalyticsResponse,
  UpdatedHomeDashboardBlock,
  UpdatedHomeMetricValue,
} from '@/lib/api/updated-home-analytics';

export type MetricTemplate = {
  id: string;
  title: string;
  sourceKey?: string;
  sourceStage?: string;
  valueField?: 'value' | 'numerator';
  grouping: string[];
  numerator: string;
  denominator: string | null;
  window: string;
  nullTreatment: string;
};

export type FunnelTemplate = {
  title: string;
  meta: string;
  steps: string[];
  sourceKey?: string;
  sourceStages?: Record<string, string>;
};

export const UPDATED_HOME_SECTIONS = [
  { id: 1, nav: 'Home', title: 'Home quality', status: 'ready' },
  { id: 2, nav: 'Free Pick', title: 'Free Pick activation', status: 'ready' },
  { id: 3, nav: 'Full Access', title: 'Full Access conversion', status: 'ready' },
  { id: 4, nav: 'Paywall', title: 'Paywall by product and country', status: 'ready' },
  { id: 5, nav: 'Collections', title: 'Collections conversion', status: 'ready' },
  { id: 6, nav: 'Picks', title: 'Top Picks and Parlays', status: 'ready' },
  { id: 7, nav: 'Analysis', title: 'Full Analysis engagement', status: 'ready' },
  { id: 8, nav: 'Result return', title: 'Top Picks result return', status: 'ready' },
  { id: 9, nav: 'Passes', title: 'Pass usage and expiration', status: 'window' },
  { id: 10, title: 'Pass-to-subscription conversion', status: 'window' },
  { id: 11, nav: 'Purchases', title: 'Purchase failures and verification', status: 'ready' },
  { id: 12, nav: 'Retention', title: 'Retention by core action', status: 'window' },
] as const;

function metric(
  id: string,
  title: string,
  grouping: string[],
  numerator: string,
  denominator: string | null,
  window: string,
  nullTreatment: string,
  sourceKey?: string
): MetricTemplate {
  return { id, title, grouping, numerator, denominator, window, nullTreatment, sourceKey };
}

export const UPDATED_HOME_METRICS: Record<number, MetricTemplate[]> = {
  1: [
    metric('home-load-success', 'Home load success', ['home_variant', 'access_state'], 'settled loads ending in home_viewed', 'all settled home load attempts', 'UTC range · final 30s excluded', 'No settled attempts', 'home_load_success_rate'),
    metric('module-reach', 'Module reach', ['module_name', 'module_position'], 'Home views with qualified module impression', 'settled Home views', '50% visible for 1s', 'No settled Home views', 'module_reach_rate'),
    metric('module-click-through', 'Module click-through', ['module_name', 'module_position'], 'users with module click', 'users with module impression', 'same screen view', 'No qualified impressions', 'module_ctr'),
    metric('reached-lower-positions', 'Reached positions 4–9', ['module_position'], 'users reaching each lower position', 'settled Home users', 'UTC range', 'Module not rendered', 'positions_4_9_reach_rate'),
    metric('active-home-time', 'Active Home time', ['mean', 'median', 'p75'], 'max cumulative active duration per screen', null, 'active checkpoints', 'No terminal checkpoints', 'active_home_time_ms'),
    metric('exit-without-interaction', 'Exit without interaction', ['home_variant', 'access_state'], 'settled views with zero interactions', 'settled Home views', 'UTC range', 'No settled views', 'home_exit_without_interaction_rate'),
    { ...metric('module-load-failures', 'Module load failures', ['module_name', 'error_type'], 'qualified module load failures', null, 'UTC range', 'Zero when none', 'controlled_load_failure_rate'), valueField: 'numerator' },
  ],
  2: [
    { ...metric('impression-users', 'Impression users', ['free_pick_state'], 'distinct users with impression', null, 'UTC range', 'No impressions', 'free_pick_activation_funnel'), sourceStage: 'free_pick_impression', valueField: 'numerator' },
    { ...metric('click-users', 'Click users', ['free_pick_state'], 'distinct users with click', null, 'UTC range', 'No clicks', 'free_pick_activation_funnel'), sourceStage: 'free_pick_clicked', valueField: 'numerator' },
    { ...metric('free-pick-open-rate', 'Free Pick open rate', ['free_pick_state'], 'users with click', 'users with impression', 'UTC range', 'No impressions', 'free_pick_activation_funnel'), sourceStage: 'free_pick_clicked' },
    metric('full-analysis-opens', 'Full Analysis opens', ['entry_source=free_pick'], 'distinct users opening analysis', null, 'after Free Pick click', 'No analysis opens'),
    metric('meaningful-free-pick-analysis', 'Meaningful analysis', ['entry_source=free_pick'], '30s OR 3 sections OR action', 'Free Pick analysis opens', 'UTC range', 'No analysis opens', 'meaningful_full_analysis_rate'),
  ],
  4: [
    metric('verified-conversion', 'Verified conversion', ['product_id', 'country', 'placement', 'currency'], 'verified purchasers', 'matching exposed users', '7-day attribution', 'No matching exposure', 'conversion_by_product_country'),
  ],
  6: [
    metric('top-picks-open-rate', 'Top Picks open rate', ['placement', 'preview_position'], 'paid users opening Top Pick', 'paid users with preview impression', 'UTC range', 'No Top Picks exposure', 'top_picks_engagement_rate'),
    metric('top-picks-save-rate', 'Top Picks save rate', ['source_module=top_picks'], 'paid users saving Top Pick', 'paid users opening Top Pick', 'UTC range', 'No Top Picks opens'),
    metric('parlay-open-rate', 'Parlay open rate', ['placement', 'parlay_type'], 'users opening parlay', 'users with parlay impression', 'UTC range', 'No parlay exposure', 'parlay_engagement_rate'),
  ],
  7: [
    metric('analysis-opens', 'Analysis opens', ['entry_source', 'access_state'], 'distinct analysis opens', null, 'UTC range', 'No opens'),
    metric('section-reach', 'Section reach', ['section_name', 'entry_source'], 'opens with section viewed', 'all analysis opens', '50% visible for 1s', 'No opens', 'section_reach_rate'),
    metric('meaningful-analysis', 'Meaningful analysis', ['entry_source', 'access_state'], '30s OR 3 sections OR action', 'all analysis opens', 'UTC range', 'No opens', 'meaningful_full_analysis_rate'),
    metric('active-duration', 'Active duration', ['mean', 'median', 'p75'], 'active duration at close', null, 'UTC range', 'No closed analyses'),
    metric('section-interaction', 'Section interaction', ['section_name', 'interaction_type'], 'opens with section interaction', 'all analysis opens', 'UTC range', 'No interactions'),
    metric('primary-action-taken', 'Primary action taken', ['primary_action', 'exit_destination'], 'opens with canonical primary action', 'all closed analyses', 'UTC range', 'No closed analyses'),
  ],
  9: [
    metric('pass-repeat-purchase', '24h pass repeat purchase', ['country', 'currency'], 'buyers with second 24h pass', 'buyers with complete 30d window', '30 days', 'Incomplete windows excluded', 'pass_24h_repeat_purchase_rate'),
    metric('premium-use-before-expiry', 'Premium use before expiry', ['product_id', 'action'], 'pass users with premium action', 'verified pass entitlements', 'entitlement window', 'No entitlements', 'premium_usage_before_expiry'),
  ],
  10: [
    metric('pass-to-monthly', 'Pass to monthly conversion', ['expired_product_id', 'country'], 'pass users with first monthly purchase', 'eligible expired pass users', '30 days after expiry', 'Incomplete windows excluded', 'pass_to_monthly_conversion_rate'),
    metric('subscription-cannibalization', 'Subscription cannibalization', ['experiment_id', 'variant_id'], 'control minus pass-exposed conversion', null, 'complete experiment cohort', 'Missing control or treatment', 'subscription_cannibalization_pp'),
  ],
  11: [
    metric('verified-started-rate', 'Verified started rate', ['product_id', 'store'], 'backend-verified purchasers', 'users with purchase_started', 'UTC range', 'No starts', 'verified_started_rate'),
    metric('duplicate-attempts', 'Duplicate attempts', ['product_id', 'store'], 'starts beyond first canonical attempt', null, 'UTC range', 'Zero when unique', 'duplicate_purchase_attempt_count'),
    metric('purchase-failures', 'Purchase failures', ['failure_category', 'product_id', 'store'], 'controlled purchase failures', null, 'UTC range', 'Unknown remains explicit', 'purchase_failure_count'),
    metric('verification-latency', 'Verification latency', ['product_id', 'store', 'p50', 'p95'], 'verified time minus started time', null, 'UTC range', 'No attributable purchases', 'verification_latency_ms'),
  ],
  12: [
    metric('retention', 'D1 / D7 / D30 retention', ['core_action', 'cohort_date', 'return_day'], 'eligible users repeating same action', 'registered day-0 users with complete window', 'exact UTC day', 'Incomplete cohorts N/A', 'd1_d7_d30_retention'),
  ],
};

export const UPDATED_HOME_FUNNELS: Record<number, FunnelTemplate> = {
  3: {
    title: 'Main offer funnel',
    meta: 'Distinct users · 24h ordered chain',
    steps: ['Offer seen', 'Offer clicked', 'Paywall viewed', 'Option selected', 'Purchase started', 'Verified purchase'],
    sourceKey: 'full_access_funnel',
    sourceStages: {
      'Offer seen': 'offer_impression',
      'Offer clicked': 'offer_click',
      'Paywall viewed': 'paywall_view',
      'Option selected': 'option_selection',
      'Purchase started': 'purchase_start',
      'Verified purchase': 'verified_purchase',
    },
  },
  5: { title: 'Collection-assisted funnel', meta: 'Distinct users · collection_id preserved', steps: ['Card seen', 'Card clicked', 'Page viewed', 'Pick preview', 'Access CTA', 'Paywall', 'Verified'] },
  8: {
    title: 'Paid Top Picks return',
    meta: 'Settlement from backend evaluation',
    steps: ['Top Pick opened', 'Prediction saved', 'Prediction settled', 'Result viewed'],
    sourceKey: 'top_picks_result_return_funnel',
    sourceStages: {
      'Top Pick opened': 'full_analysis_opened',
      'Prediction saved': 'prediction_saved',
      'Prediction settled': 'settlement_eligible',
      'Result viewed': 'prediction_result_viewed',
    },
  },
};

export function findMetricStage(
  dashboard: UpdatedHomeDashboardBlock | undefined,
  sourceKey: string | undefined,
  stage: string | undefined
): UpdatedHomeMetricValue | undefined {
  if (!sourceKey) return undefined;
  const values = dashboard?.metrics.find((metric) => metric.definition.key === sourceKey)?.values ?? [];
  if (!stage) return values[0];
  return values.find((value) => value.dimensions.stage === stage);
}

export function dashboardsById(data: UpdatedHomeAnalyticsResponse | null): Map<number, UpdatedHomeDashboardBlock> {
  return new Map(data?.dashboards.map((dashboard) => [dashboard.id, dashboard]));
}

export function formatMetricValue(value?: UpdatedHomeMetricValue): string {
  if (!value || value.value === null) return 'N/A';
  if (value.unit === 'percent') return `${value.value}%`;
  if (value.unit === 'percentage_points') return `${value.value} pp`;
  if (value.unit === 'milliseconds') return `${value.value} ms`;
  if (value.unit === 'currency_per_user') {
    const currency = value.dimensions.currency;
    return `${value.value} ${typeof currency === 'string' ? currency : ''}`.trim();
  }
  return String(value.value);
}

export function formatMetricUnit(value?: UpdatedHomeMetricValue): string {
  if (!value) return 'awaiting API';
  if (value.unit === 'percentage_points') return 'percentage points';
  if (value.unit === 'currency_per_user') return 'per Home user';
  return value.unit.replace(/_/g, ' ');
}

export function formatDimensions(dimensions?: Record<string, unknown>): string {
  const entries = Object.entries(dimensions ?? {}).filter(([, value]) => value !== null && value !== undefined && value !== '');
  return entries.length === 0 ? '' : entries.map(([key, value]) => `${key}: ${String(value)}`).join(' · ');
}
