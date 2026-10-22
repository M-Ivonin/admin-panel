import { fireEvent, render, screen, within } from '@testing-library/react';
import { UpdatedHomeFunnel } from '@/components/updated-home-analytics/UpdatedHomeFunnel';
import { UpdatedHomeAnalyticsSection } from '@/components/updated-home-analytics/UpdatedHomeAnalyticsSection';
import type {
  UpdatedHomeDashboardBlock,
  UpdatedHomeMetricValue,
} from '@/lib/api/updated-home-analytics';
const complete = { isComplete: true, reason: null };
function value(
  numerator: number | null,
  metricValue: number | null,
  dimensions: Record<string, unknown>,
  unit = 'percent'
): UpdatedHomeMetricValue {
  return {
    numerator,
    denominator: 0,
    value: metricValue,
    dimensions,
    unit,
    formula: { numerator: 'distinct users', denominator: 'distinct users' },
    completeness: complete,
    naReason: metricValue === null ? 'No prior cohort.' : null,
  };
}
function dashboard(
  id: number,
  key: string,
  values: UpdatedHomeMetricValue[]
): UpdatedHomeDashboardBlock {
  return {
    id,
    name: key,
    definitionVersion: 'v1',
    observationCompleteness: complete,
    dimensions: [],
    metrics: [
      {
        definition: {
          key,
          numerator: 'distinct users',
          denominator: 'distinct users',
          grouping: [],
          window: 'UTC',
          nullTreatment: 'N/A',
        },
        values,
      },
    ],
  };
}
it('shows an empty cohort without a 100% baseline and retains known zero counts', () => {
  render(
    <UpdatedHomeFunnel
      title="Top Picks"
      meta="Previous-stage rates"
      values={[
        value(0, 0, { stage: 'preview_impression', stageOrdinal: 1 }, 'users'),
        value(0, null, { stage: 'preview_click', stageOrdinal: 2 }),
        value(null, null, { stage: 'full_analysis_opened', stageOrdinal: 3 }),
      ]}
    />
  );
  expect(screen.queryByText('100% cohort baseline')).not.toBeInTheDocument();
  expect(
    screen.getByLabelText('Prediction Card impression N/A')
  ).toBeInTheDocument();
  expect(screen.getAllByText('0 users')).toHaveLength(2);
  expect(
    screen.getAllByTestId('updated-home-funnel-stage')[2]
  ).toHaveTextContent('N/A');
});
it('shows observed zero overall conversion while the previous-stage rate is unavailable', () => {
  render(
    <UpdatedHomeFunnel
      title="Top Picks"
      meta="Previous-stage rates"
      values={[
        value(
          100,
          100,
          { stage: 'preview_impression', stageOrdinal: 1 },
          'users'
        ),
        value(0, 0, { stage: 'preview_click', stageOrdinal: 2 }),
        value(0, null, { stage: 'full_analysis_opened', stageOrdinal: 3 }),
      ]}
    />
  );
  expect(screen.getByText('Overall conversion: 0%')).toBeInTheDocument();
  expect(
    screen.getByText('0 / 100 users · first → last stage')
  ).toBeInTheDocument();
  const stages = screen.getAllByTestId('updated-home-funnel-stage');
  expect(within(stages[1]).getByText('0%')).toBeInTheDocument();
  expect(within(stages[2]).getByText('0 users')).toBeInTheDocument();
  expect(
    within(stages[2]).getByText('N/A · No prior cohort.')
  ).toBeInTheDocument();
});
it('keeps invalid response order and unclamped rate labels while clamping tracks', () => {
  render(
    <UpdatedHomeFunnel
      title="Full Access"
      meta="Previous-stage rates"
      values={[
        value(
          100,
          100,
          { stage: 'offer_impression', stageOrdinal: 2 },
          'users'
        ),
        value(120, 120.5, { stage: 'offer_click', stageOrdinal: 1 }),
        value(0, -5, { stage: 'verified_purchase', stageOrdinal: 3 }),
      ]}
    />
  );
  expect(screen.getByText('Overall conversion: N/A')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Backend stage order is invalid'
  );
  expect(
    screen
      .getAllByTestId('updated-home-funnel-stage')
      .map((stage) => stage.dataset.stage)
  ).toEqual(['offer_impression', 'offer_click', 'verified_purchase']);
  expect(
    screen.getByLabelText('Offer click 120.5%').firstElementChild
  ).toHaveStyle({ width: '100%' });
  expect(
    screen.getByLabelText('Verified purchase -5%').firstElementChild
  ).toHaveStyle({ width: '0%' });
});
it('renders latency percentiles in seconds alongside the main latency value', () => {
  render(
    <UpdatedHomeAnalyticsSection
      label="Purchases"
      dashboards={[
        dashboard(11, 'verification_latency_ms', [
          value(
            1,
            15492.68,
            {
              productId: 'pass',
              store: 'google_play',
              p50: 15492.683,
              p95: 27831.86805,
            },
            'milliseconds'
          ),
          value(
            1,
            33113.52,
            {
              productId: 'annual',
              store: 'app_store',
              p50: 33113.517,
              p95: 33298.59,
            },
            'milliseconds'
          ),
        ]),
      ]}
    />
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Show Verification latency breakdown' })
  );
  const metric = screen.getByTestId('updated-home-grouped-metric');
  expect(within(metric).getByText('P50 (s)')).toBeInTheDocument();
  expect(within(metric).getByText('P95 (s)')).toBeInTheDocument();
  expect(within(metric).getByText('27.832 s')).toBeInTheDocument();
  expect(within(metric).queryByText('15492.683')).not.toBeInTheDocument();
});
it('describes exit rates as users and discloses terminal time loss', () => {
  render(
    <UpdatedHomeAnalyticsSection
      label="Home"
      dashboards={[
        {
          ...dashboard(1, 'active_home_time_ms', [
            value(10, 32740, { statistic: 'mean' }, 'milliseconds'),
          ]),
          metrics: [
            ...dashboard(1, 'active_home_time_ms', [
              value(10, 32740, { statistic: 'mean' }, 'milliseconds'),
            ]).metrics,
            ...dashboard(1, 'home_exit_without_interaction_rate', [
              value(3, 30, {}),
            ]).metrics,
          ],
        },
      ]}
    />
  );
  expect(
    screen.getByText(/up to 15 seconds of terminal activity may be lost/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /share of Home users with a terminal checkpoint reporting zero interactions/i
    )
  ).toBeInTheDocument();
  expect(screen.queryByText(/Share of Home visits/)).not.toBeInTheDocument();
});
