import { render, screen, within } from '@testing-library/react';
import { UpdatedHomeAnalyticsDashboard } from '@/components/updated-home-analytics/UpdatedHomeAnalyticsDashboard';
import {
  ANALYTICS_ROLE_TOKENS,
  FUNNEL_STAGE_ROLES,
} from '@/components/updated-home-analytics/presentation';
import { getUpdatedHomeAnalytics } from '@/lib/api/updated-home-analytics';
import type { UpdatedHomeAnalyticsResponse } from '@/lib/api/updated-home-analytics';

jest.mock('@/lib/api/updated-home-analytics', () => ({
  getUpdatedHomeAnalytics: jest.fn(),
}));

const complete = { isComplete: true, reason: null };

function funnelMetric(
  key: string,
  stages: Array<{
    stage: string;
    ordinal: number;
    numerator: number | null;
    denominator: number | null;
    value: number | null;
    naReason?: string | null;
  }>
) {
  return {
    definition: {
      key,
      numerator: 'backend distinct-user numerator',
      denominator: 'backend immediate-prior-stage denominator',
      window: 'backend UTC window',
      grouping: ['stage'],
      nullTreatment: 'backend N/A rule',
    },
    values: stages.map((stage) => ({
      formula: {
        numerator: 'backend distinct-user numerator',
        denominator: 'backend immediate-prior-stage denominator',
      },
      dimensions: { stage: stage.stage, stageOrdinal: stage.ordinal },
      numerator: stage.numerator,
      denominator: stage.denominator,
      value: stage.value,
      unit: stage.denominator === null ? 'users' : 'percent',
      completeness: complete,
      naReason: stage.naReason ?? null,
    })),
  };
}

function simpleMetric(key: string) {
  return {
    definition: {
      key,
      numerator: 'backend numerator',
      denominator: 'backend denominator',
      window: 'backend UTC window',
      grouping: ['access_state'],
      nullTreatment: 'backend N/A rule',
    },
    values: [
      {
        formula: {
          numerator: 'backend numerator',
          denominator: 'backend denominator',
        },
        dimensions: { accessState: 'full_access' },
        numerator: 1,
        denominator: 2,
        value: 50,
        unit: 'percent',
        completeness: complete,
        naReason: null,
      },
    ],
  };
}

const fullAccess = funnelMetric('full_access_funnel', [
  {
    stage: 'offer_impression',
    ordinal: 1,
    numerator: 2914,
    denominator: null,
    value: 2914,
  },
  {
    stage: 'offer_click',
    ordinal: 2,
    numerator: 681,
    denominator: 2914,
    value: 23.4,
  },
  {
    stage: 'paywall_view',
    ordinal: 3,
    numerator: 524,
    denominator: 681,
    value: 76.9,
  },
  {
    stage: 'product_exposed',
    ordinal: 4,
    numerator: 406,
    denominator: 524,
    value: 77.5,
  },
  {
    stage: 'purchase_start',
    ordinal: 5,
    numerator: 312,
    denominator: 406,
    value: 76.8,
  },
  {
    stage: 'verified_purchase',
    ordinal: 6,
    numerator: 198,
    denominator: 312,
    value: 63.5,
  },
]);

const discovery = funnelMetric('collection_discovery_funnel', [
  {
    stage: 'collection_card_impression',
    ordinal: 1,
    numerator: 1864,
    denominator: null,
    value: 1864,
  },
  {
    stage: 'collection_card_clicked',
    ordinal: 2,
    numerator: 522,
    denominator: 1864,
    value: 28,
  },
  {
    stage: 'collection_page_viewed',
    ordinal: 3,
    numerator: 476,
    denominator: 522,
    value: 91.2,
  },
]);

const purchase = funnelMetric('collection_purchase_funnel', [
  {
    stage: 'collection_page_viewed',
    ordinal: 1,
    numerator: 476,
    denominator: null,
    value: 476,
  },
  {
    stage: 'collection_access_cta_clicked',
    ordinal: 2,
    numerator: 132,
    denominator: 476,
    value: 27.73,
  },
  {
    stage: 'paywall_viewed',
    ordinal: 3,
    numerator: 104,
    denominator: 132,
    value: 78.8,
  },
  {
    stage: 'purchase_started',
    ordinal: 4,
    numerator: 31,
    denominator: 104,
    value: 29.81,
  },
  {
    stage: 'purchase_succeeded',
    ordinal: 5,
    numerator: 19,
    denominator: 31,
    value: 61.29,
  },
]);

const aiChatUnlock = funnelMetric('ai_chat_unlock_funnel', [
  {
    stage: 'locked_screen_viewed',
    ordinal: 1,
    numerator: 200,
    denominator: null,
    value: 200,
  },
  {
    stage: 'unlock_cta_clicked',
    ordinal: 2,
    numerator: 80,
    denominator: 200,
    value: 40,
  },
  {
    stage: 'paywall_viewed',
    ordinal: 3,
    numerator: 70,
    denominator: 80,
    value: 87.5,
  },
  {
    stage: 'purchase_started',
    ordinal: 4,
    numerator: 20,
    denominator: 70,
    value: 28.57,
  },
  {
    stage: 'purchase_succeeded',
    ordinal: 5,
    numerator: 12,
    denominator: 20,
    value: 60,
  },
]);

const response = {
  definitionVersion: 'updated-home-dashboards-v1.1',
  timezone: 'UTC' as const,
  range: { from: '2026-07-28T00:00:00.000Z', to: '2026-08-05T00:00:00.000Z' },
  dashboards: Array.from({ length: 13 }, (_, index) => {
    const id = index + 1;
    const metrics =
      id === 3
        ? [fullAccess]
        : id === 5
          ? [
              discovery,
              purchase,
              {
                ...simpleMetric('collection_assisted_conversion_rate'),
                values: [
                  {
                    ...simpleMetric('collection_assisted_conversion_rate')
                      .values[0],
                    dimensions: {
                      collectionId: 'daily',
                      collectionName: 'Daily Picks',
                      collectionType: 'daily',
                    },
                  },
                  {
                    ...simpleMetric('collection_assisted_conversion_rate')
                      .values[0],
                    dimensions: {
                      collectionId: 'weekly',
                      collectionName: 'Weekly Picks',
                      collectionType: 'weekly',
                    },
                    numerator: 0,
                    value: 0,
                  },
                ],
              },
            ]
          : id === 13
            ? [aiChatUnlock]
            : [
                simpleMetric(
                  id === 9
                    ? 'pass_24h_repeat_purchase_rate'
                    : id === 10
                      ? 'pass_to_monthly_conversion_rate'
                      : `metric_${id}`
                ),
              ];
    return {
      id,
      name:
        id === 9
          ? 'Pass usage and expiration'
          : id === 10
            ? 'Pass-to-subscription conversion'
            : `Dashboard ${id}`,
      definitionVersion: 'updated-home-dashboards-v1.1',
      observationCompleteness: complete,
      dimensions: [],
      metrics,
    };
  }),
};

describe('Updated Home numbered semantic funnels', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-12T10:00:00.000Z'));
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue(response);
  });

  afterEach(() => jest.useRealTimers());

  it('renders backend IDs 1 through 13 and keeps Pass dashboards separate', async () => {
    render(<UpdatedHomeAnalyticsDashboard />);
    const badges = await screen.findAllByTestId(
      'updated-home-dashboard-number'
    );
    expect(badges.map((badge) => badge.textContent)).toEqual(
      Array.from({ length: 13 }, (_, index) => String(index + 1))
    );
    const passes = screen.getByRole('region', { name: 'Passes' });
    expect(within(passes).getByText('9')).toBeInTheDocument();
    expect(within(passes).getByText('10')).toBeInTheDocument();
    expect(
      within(passes).getByText('Pass usage and expiration')
    ).toBeInTheDocument();
    expect(
      within(passes).getByText('Pass-to-subscription conversion')
    ).toBeInTheDocument();
  });

  it('renders the dedicated AI Chat unlock funnel in the shared funnel UI', async () => {
    render(<UpdatedHomeAnalyticsDashboard />);
    const aiChat = await screen.findByRole('region', { name: 'AI Chat' });
    const stages = within(aiChat).getAllByTestId('updated-home-funnel-stage');
    expect(stages.map((stage) => stage.getAttribute('data-stage'))).toEqual([
      'locked_screen_viewed',
      'unlock_cta_clicked',
      'paywall_viewed',
      'purchase_started',
      'purchase_succeeded',
    ]);
    expect(stages[4]).toHaveTextContent('12');
    expect(stages[4]).toHaveTextContent('60%');
  });

  it('uses backend numerator, value, order, N/A reason, and linked Collection phases', async () => {
    render(<UpdatedHomeAnalyticsDashboard />);
    const fullAccessRegion = await screen.findByRole('region', {
      name: 'Full Access',
    });
    const fullAccessStages = within(fullAccessRegion).getAllByTestId(
      'updated-home-funnel-stage'
    );
    expect(
      fullAccessStages.map((stage) => stage.getAttribute('data-stage'))
    ).toEqual([
      'offer_impression',
      'offer_click',
      'paywall_view',
      'product_exposed',
      'purchase_start',
      'verified_purchase',
    ]);
    expect(fullAccessStages[1]).toHaveTextContent('681');
    expect(fullAccessStages[1]).toHaveTextContent('23.4%');
    expect(fullAccessStages[0]).toHaveTextContent('users');

    const collections = screen.getByRole('region', { name: 'Collections' });
    expect(
      within(collections).getByText('PHASE 1 · DISCOVERY')
    ).toBeInTheDocument();
    expect(
      within(collections).getByText('PHASE 2 · COMMERCE')
    ).toBeInTheDocument();
    expect(collections).toHaveTextContent('hands off into the commerce cohort');
    expect(collections).not.toHaveTextContent('Pick preview');
    expect(collections).not.toHaveTextContent('seven-day window incomplete');
    expect(
      within(collections).getByText('Collection assisted conversion rate')
    ).toBeInTheDocument();
    expect(within(collections).getByText('Daily Picks')).toBeInTheDocument();
  });

  it('keeps returned values visible without an observation-window badge', async () => {
    const partialResponse = JSON.parse(
      JSON.stringify(response)
    ) as UpdatedHomeAnalyticsResponse;
    const fullAccessDashboard = partialResponse.dashboards.find(
      ({ id }) => id === 3
    )!;
    fullAccessDashboard.observationCompleteness = {
      isComplete: false,
      reason: 'The selected observation window is still partial.',
    };
    fullAccessDashboard.metrics[0].values =
      fullAccessDashboard.metrics[0].values.map((value) => ({
        ...value,
        completeness: fullAccessDashboard.observationCompleteness,
      }));
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue(partialResponse);

    render(<UpdatedHomeAnalyticsDashboard />);
    const fullAccessRegion = await screen.findByRole('region', {
      name: 'Full Access',
    });
    const stages = within(fullAccessRegion).getAllByTestId(
      'updated-home-funnel-stage'
    );
    expect(stages[0]).toHaveTextContent('2914 users');
    expect(stages[1]).toHaveTextContent('681 users');
    expect(stages[1]).toHaveTextContent('23.4%');
    expect(stages[0]).toHaveAttribute(
      'data-presentation-role',
      'informational'
    );
    expect(fullAccessRegion).not.toHaveTextContent('Partial observation window');
    expect(fullAccessRegion).not.toHaveTextContent('Complete observation window');
  });

  it('maps stable semantic roles to Pencil colors without numeric thresholds', () => {
    expect(FUNNEL_STAGE_ROLES).toMatchObject({
      offer_impression: 'informational',
      offer_click: 'interaction',
      paywall_view: 'progression',
      purchase_start: 'commerce',
      verified_purchase: 'verified',
    });
    expect(ANALYTICS_ROLE_TOKENS).toMatchObject({
      informational: { color: '#3B82F6' },
      interaction: { color: '#22D3EE' },
      progression: { color: '#6D4AFF' },
      commerce: { color: '#F59E0B' },
      verified: { color: '#22C55E' },
      failure: { color: '#EF4444' },
      unavailable: { color: '#F0A63A' },
    });
  });

  it('keeps funnel text and track boundaries contrasted on their dark surfaces', () => {
    for (const textColor of ['#F5F5F5', '#A3A3A3', '#F0A63A']) {
      expect(contrastRatio(textColor, '#222222')).toBeGreaterThanOrEqual(4.5);
    }
    for (const token of Object.values(ANALYTICS_ROLE_TOKENS)) {
      expect(contrastRatio(token.textColor, '#2A2A2A')).toBeGreaterThanOrEqual(
        4.5
      );
      const boundaryContrast = Math.max(
        contrastRatio(token.color, '#414141'),
        token.outline ? contrastRatio(token.outline, '#414141') : 0
      );
      expect(boundaryContrast).toBeGreaterThanOrEqual(3);
    }
  });

  it('uses accessible semantic text colors on rendered KPI values and cues', async () => {
    render(<UpdatedHomeAnalyticsDashboard />);
    await screen.findByRole('region', { name: 'Home' });

    for (const testId of [
      'updated-home-grouped-summary-value',
      'updated-home-metric-card-value',
      'updated-home-metric-card-cue',
    ]) {
      for (const element of screen.getAllByTestId(testId)) {
        const color = getComputedStyle(element).color;
        expect(
          contrastRatio(cssColorToHex(color), '#2A2A2A')
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

function cssColorToHex(color: string): string {
  if (color.startsWith('#')) return color;
  const channels = color.match(/\d+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3)
    throw new Error(`Unsupported color: ${color}`);
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

function relativeLuminance(color: string): number {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(color.slice(offset, offset + 2), 16) / 255
  );
  const linear = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
