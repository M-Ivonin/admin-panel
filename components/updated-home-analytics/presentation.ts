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
};

const BACKEND_STAGE_ORDER: Readonly<Record<string, readonly string[]>> = {
  free_pick_activation_funnel: [
    'home_viewed',
    'free_pick_impression',
    'free_pick_clicked',
    'free_pick_prediction_card_opened',
  ],
  full_access_funnel: [
    'offer_impression',
    'offer_click',
    'paywall_view',
    'option_selection',
    'purchase_start',
    'verified_purchase',
  ],
  top_picks_activation_funnel: [
    'preview_impression',
    'preview_click',
    'full_analysis_opened',
  ],
  top_picks_result_return_funnel: [
    'preview_clicked',
    'full_analysis_opened',
    'prediction_saved',
    'settlement_eligible',
    'prediction_result_viewed',
  ],
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

export function dashboardsById(
  data: UpdatedHomeAnalyticsResponse | null
): Map<number, UpdatedHomeDashboardBlock> {
  return new Map(data?.dashboards.map((dashboard) => [dashboard.id, dashboard]));
}

export function metricValues(
  dashboard: UpdatedHomeDashboardBlock | undefined,
  metricKey: string
): UpdatedHomeMetricValue[] {
  const values = dashboard?.metrics.find((metric) => metric.definition.key === metricKey)?.values ?? [];
  const order = BACKEND_STAGE_ORDER[metricKey];
  if (!order) return values;
  return [...values].sort((left, right) => {
    const leftStage = typeof left.dimensions.stage === 'string' ? left.dimensions.stage : '';
    const rightStage = typeof right.dimensions.stage === 'string' ? right.dimensions.stage : '';
    return order.indexOf(leftStage) - order.indexOf(rightStage);
  });
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
    ([, value]) => value !== null && value !== undefined && value !== ''
  );
  return entries.length === 0
    ? 'No dimensions'
    : entries
        .map(([key, value]) =>
          `${displayLabel(key)}: ${typeof value === 'string' ? displayLabel(value) : String(value)}`
        )
        .join(' · ');
}

export function hasObservedValues(data: UpdatedHomeAnalyticsResponse): boolean {
  return data.dashboards.some((dashboard) =>
    dashboard.metrics.some((metric) =>
      metric.values.some(
        (value) =>
          value.value !== null || value.numerator !== null || value.denominator !== null
      )
    )
  );
}
