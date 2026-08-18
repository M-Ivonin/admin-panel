import type {
  UpdatedHomeAnalyticsResponse,
  UpdatedHomeDashboardBlock,
  UpdatedHomeMetricValue,
} from '@/lib/api/updated-home-analytics';

export type UpdatedHomeSectionDefinition = {
  label: string;
  dashboardIds: readonly number[];
};

export const UPDATED_HOME_SECTIONS: readonly UpdatedHomeSectionDefinition[] = [
  { label: 'Home', dashboardIds: [1] },
  { label: 'Free Pick', dashboardIds: [2] },
  { label: 'Full Access', dashboardIds: [3] },
  { label: 'Paywall', dashboardIds: [4] },
  { label: 'Collections', dashboardIds: [5] },
  { label: 'Top Picks/Parlays', dashboardIds: [6] },
  { label: 'Full Analysis', dashboardIds: [7] },
  { label: 'Top Picks Result Return', dashboardIds: [8] },
  { label: 'Passes', dashboardIds: [9, 10] },
  { label: 'Purchases', dashboardIds: [11] },
  { label: 'Retention', dashboardIds: [12] },
  { label: 'AI Chat', dashboardIds: [13] },
];

const DISPLAY_LABELS: Readonly<Record<string, string>> = {
  free_pick_prediction_card_opened: 'Prediction Card opened',
  full_analysis_opened: 'Full Analysis opened',
  home_viewed: 'Home viewed',
  free_pick_impression: 'Free Pick impression',
  free_pick_clicked: 'Free Pick clicked',
  preview_impression: 'Prediction Card impression',
  preview_click: 'Prediction Card clicked',
  preview_clicked: 'Prediction Card clicked',
  prediction_saved: 'Prediction saved',
  settlement_eligible: 'Settlement eligible',
  prediction_result_viewed: 'Prediction result viewed',
  offer_impression: 'Offer impression',
  offer_click: 'Offer click',
  paywall_view: 'Paywall view',
  product_exposed: 'Product shown',
  purchase_start: 'Purchase start',
  verified_purchase: 'Verified purchase',
  collection_card_impression: 'Card impression',
  collection_card_clicked: 'Card click',
  collection_page_viewed: 'Collection page viewed',
  collection_access_cta_clicked: 'Access CTA',
  paywall_viewed: 'Paywall viewed',
  purchase_started: 'Purchase started',
  purchase_succeeded: 'Verified purchase',
  locked_screen_viewed: 'Locked screen viewed',
  unlock_cta_clicked: 'Unlock CTA clicked',
};

const METRIC_EXPLANATIONS: Readonly<Record<string, string>> = {
  home_load_success_rate:
    'Share of Home load attempts that finished successfully.',
  controlled_load_failure_rate:
    'Share of Home load attempts that ended with a controlled loading error.',
  module_reach_rate:
    'Share of Home visitors who scrolled far enough to see a module.',
  module_ctr: 'Share of users who opened a module after seeing it.',
  positions_4_9_reach_rate:
    'Share of Home visitors who reached modules in positions 4 through 9.',
  active_home_time_ms: 'Typical time users actively spend on Home.',
  home_exit_without_interaction_rate:
    'Share of Home visits that ended without any interaction.',
  free_pick_activation_funnel:
    'Shows how users progress from opening Home to opening the Free Pick prediction card.',
  full_access_funnel:
    'Shows how users progress from seeing the offer to completing a verified purchase.',
  option_change_rate:
    'Share of paywall viewers who manually changed the preselected product.',
  conversion_by_product_country:
    'Share of exposed users who completed a verified purchase for this product and placement.',
  unknown_country_share:
    'Share of product exposures without a trusted storefront or backend country.',
  collection_assisted_conversion_rate:
    'Share of collection-page viewers who completed a collection-attributed verified purchase within seven days.',
  collection_discovery_funnel:
    'Shows same-collection discovery from card impression to Collection page view within 24 hours.',
  collection_purchase_funnel:
    'Shows the seven-day commerce journey from Collection page view to backend-verified purchase.',
  ai_chat_unlock_funnel:
    'Shows how locked AI Chat users progress from the unlock CTA to a backend-verified purchase.',
  top_picks_activation_funnel:
    'Shows how paid users progress from a Top Pick preview to Full Analysis.',
  paid_top_picks_preview_coverage:
    'Reconciles Top Picks module reach with locked, eligible, and incomplete paid-preview cohorts.',
  paid_preview_instrumentation_coverage:
    'Share of users with unlocked Top Picks who produced an eligible paid preview impression.',
  parlay_engagement_rate: 'Share of users who opened a parlay after seeing it.',
  section_reach_rate:
    'Share of Full Analysis visits in which users reached a specific section.',
  meaningful_full_analysis_rate:
    'Share of Full Analysis visits with meaningful reading or interaction.',
  top_picks_result_return_funnel:
    'Shows how users progress from opening a Top Pick to returning for its result.',
  pass_24h_repeat_purchase_rate:
    'Share of 24-hour pass buyers who purchased another pass within the eligible period.',
  premium_usage_before_expiry:
    'Share of pass holders who used a premium feature before their pass expired.',
  pass_to_monthly_conversion_rate:
    'Share of expired pass users who later purchased a monthly subscription.',
  subscription_cannibalization_pp:
    'Estimated change in subscription conversion associated with pass exposure.',
  verified_started_rate:
    'Share of started purchases that were verified successfully.',
  duplicate_purchase_attempt_count:
    'Number of additional purchase attempts after the first attempt.',
  purchase_failure_count:
    'Number of purchase attempts that ended in a controlled failure.',
  verification_latency_ms:
    'Typical time between starting a purchase and successful verification.',
  d1_d7_d30_retention:
    'Share of users who repeated the same core action after 1, 7, or 30 days.',
};

export type AnalyticsPresentationRole =
  | 'informational'
  | 'interaction'
  | 'progression'
  | 'commerce'
  | 'verified'
  | 'failure'
  | 'unavailable';

export const ANALYTICS_ROLE_TOKENS: Readonly<
  Record<
    AnalyticsPresentationRole,
    { color: string; textColor: string; outline?: string; cue: string }
  >
> = {
  informational: {
    color: '#3B82F6',
    textColor: '#93C5FD',
    outline: '#93C5FD',
    cue: 'Entry',
  },
  interaction: { color: '#22D3EE', textColor: '#67E8F9', cue: 'Interaction' },
  progression: {
    color: '#6D4AFF',
    textColor: '#C4B5FD',
    outline: '#C4B5FD',
    cue: 'Progression',
  },
  commerce: { color: '#F59E0B', textColor: '#FBBF24', cue: 'Commerce intent' },
  verified: { color: '#22C55E', textColor: '#86EFAC', cue: 'Verified' },
  failure: {
    color: '#EF4444',
    textColor: '#FCA5A5',
    outline: '#FCA5A5',
    cue: 'Controlled failure',
  },
  unavailable: {
    color: '#F0A63A',
    textColor: '#F0A63A',
    cue: 'Incomplete or N/A',
  },
};

export const FUNNEL_STAGE_ROLES: Readonly<
  Record<string, AnalyticsPresentationRole>
> = {
  home_viewed: 'informational',
  free_pick_impression: 'informational',
  free_pick_clicked: 'interaction',
  free_pick_prediction_card_opened: 'progression',
  preview_impression: 'informational',
  preview_click: 'interaction',
  preview_clicked: 'interaction',
  full_analysis_opened: 'progression',
  prediction_saved: 'progression',
  settlement_eligible: 'commerce',
  prediction_result_viewed: 'verified',
  offer_impression: 'informational',
  offer_click: 'interaction',
  paywall_view: 'progression',
  product_exposed: 'progression',
  purchase_start: 'commerce',
  verified_purchase: 'verified',
  collection_card_impression: 'informational',
  collection_card_clicked: 'interaction',
  collection_page_viewed: 'progression',
  collection_access_cta_clicked: 'commerce',
  paywall_viewed: 'commerce',
  purchase_started: 'commerce',
  purchase_succeeded: 'verified',
  locked_screen_viewed: 'informational',
  unlock_cta_clicked: 'interaction',
};

export const METRIC_ROLES: Readonly<Record<string, AnalyticsPresentationRole>> =
  {
    home_load_success_rate: 'verified',
    controlled_load_failure_rate: 'failure',
    module_reach_rate: 'informational',
    module_ctr: 'interaction',
    positions_4_9_reach_rate: 'informational',
    active_home_time_ms: 'progression',
    home_exit_without_interaction_rate: 'failure',
    conversion_by_product_country: 'verified',
    collection_assisted_conversion_rate: 'verified',
    parlay_engagement_rate: 'interaction',
    section_reach_rate: 'informational',
    meaningful_full_analysis_rate: 'progression',
    pass_24h_repeat_purchase_rate: 'commerce',
    premium_usage_before_expiry: 'progression',
    pass_to_monthly_conversion_rate: 'verified',
    subscription_cannibalization_pp: 'informational',
    verified_started_rate: 'verified',
    duplicate_purchase_attempt_count: 'failure',
    purchase_failure_count: 'failure',
    verification_latency_ms: 'informational',
    d1_d7_d30_retention: 'progression',
  };

export function displayLabel(value: string): string {
  const known = DISPLAY_LABELS[value];
  if (known) return known;
  const words = value
    .replace(/_ms\b/gi, '')
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\bms\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}`;
}

export function metricExplanation(metricKey: string): string {
  return (
    METRIC_EXPLANATIONS[metricKey] ??
    `Shows ${displayLabel(metricKey).toLowerCase()} for the selected period.`
  );
}

export function dashboardsById(
  data: UpdatedHomeAnalyticsResponse | null
): Map<number, UpdatedHomeDashboardBlock> {
  return new Map(
    data?.dashboards.map((dashboard) => [dashboard.id, dashboard])
  );
}

export function metricValues(
  dashboard: UpdatedHomeDashboardBlock | undefined,
  metricKey: string
): UpdatedHomeMetricValue[] {
  return (
    dashboard?.metrics.find((metric) => metric.definition.key === metricKey)
      ?.values ?? []
  );
}

export function hasValidStageOrdinals(
  values: UpdatedHomeMetricValue[]
): boolean {
  return values.every(
    (value, index) => value.dimensions.stageOrdinal === index + 1
  );
}

export function stageRole(
  stage: string,
  value: UpdatedHomeMetricValue
): AnalyticsPresentationRole {
  if (value.value === null) return 'unavailable';
  return FUNNEL_STAGE_ROLES[stage] ?? 'progression';
}

export function metricRole(
  metricKey: string,
  value?: UpdatedHomeMetricValue
): AnalyticsPresentationRole {
  if (!value || value.value === null) return 'unavailable';
  return METRIC_ROLES[metricKey] ?? 'progression';
}

export function formatMetricValue(value?: UpdatedHomeMetricValue): string {
  if (!value || value.value === null) return 'N/A';
  return value.unit === 'percent'
    ? `${value.value}%`
    : value.unit === 'percentage_points'
      ? `${value.value} pp`
      : value.unit === 'milliseconds'
        ? `${Number((value.value / 1000).toFixed(3))} s`
        : String(value.value);
}

export function formatMetricUnit(value?: UpdatedHomeMetricValue): string {
  if (!value) return 'not returned';
  if (value.unit === 'milliseconds') return 'seconds';
  return value.unit.replace(/_/g, ' ');
}

export function formatDimensions(dimensions?: Record<string, unknown>): string {
  const entries = Object.entries(dimensions ?? {}).filter(
    ([key, value]) =>
      key !== 'stageOrdinal' &&
      value !== null &&
      value !== undefined &&
      value !== ''
  );
  return entries.length === 0
    ? 'No dimensions'
    : entries
        .map(
          ([key, value]) =>
            `${displayLabel(key)}: ${typeof value === 'string' ? displayLabel(value) : String(value)}`
        )
        .join(' · ');
}

export function hasObservedValues(data: UpdatedHomeAnalyticsResponse): boolean {
  return data.dashboards.some((dashboard) =>
    dashboard.metrics.some((metric) =>
      metric.values.some(
        (value) =>
          value.value !== null ||
          value.numerator !== null ||
          value.denominator !== null
      )
    )
  );
}
