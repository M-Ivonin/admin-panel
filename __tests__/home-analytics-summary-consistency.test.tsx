import { fireEvent, render, screen, within } from '@testing-library/react';
import { HomeAnalyticsOverview } from '@/components/overview/HomeAnalyticsOverview';
import { UpdatedHomeAnalyticsDashboard } from '@/components/updated-home-analytics/UpdatedHomeAnalyticsDashboard';
import {
  getUpdatedHomeAnalytics,
  type UpdatedHomeAnalyticsResponse,
  type UpdatedHomeDashboardBlock,
  type UpdatedHomeMetricValue,
} from '@/lib/api/updated-home-analytics';

jest.mock('@/lib/api/updated-home-analytics', () => ({
  getUpdatedHomeAnalytics: jest.fn(),
}));
const complete = { isComplete: true, reason: null };
function dashboard(
  id: number,
  key: string,
  values: Array<{
    stage?: string;
    numerator: number;
    denominator: number | null;
  }>
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
          numerator: 'Users or attempts',
          denominator: 'Prior stage',
          window: 'UTC',
          grouping: [],
          nullTreatment: 'N/A',
        },
        values: values.map(
          (
            { stage, numerator, denominator },
            index
          ): UpdatedHomeMetricValue => ({
            dimensions: stage
              ? { stage, stageOrdinal: index + 1 }
              : { accessState: index ? 'paid' : 'free' },
            numerator,
            denominator,
            value:
              denominator === null
                ? numerator
                : (100 * numerator) / denominator,
            unit: denominator === null ? 'users' : 'percent',
            formula: {
              numerator: 'Users or attempts',
              denominator: 'Prior stage',
            },
            completeness: complete,
            naReason: null,
          })
        ),
      },
    ],
  };
}
const range = {
  from: '2026-10-10T00:00:00.000Z',
  to: '2026-10-10T14:30:00.000Z',
};
const data: UpdatedHomeAnalyticsResponse = {
  range,
  timezone: 'UTC',
  definitionVersion: 'v1',
  dashboards: [
    dashboard(1, 'home_load_success_rate', [
      { numerator: 90, denominator: 100 },
      { numerator: 10, denominator: 10 },
    ]),
    dashboard(2, 'free_pick_activation_funnel', [
      { stage: 'home_viewed', numerator: 200, denominator: null },
      {
        stage: 'free_pick_prediction_card_opened',
        numerator: 30,
        denominator: 60,
      },
    ]),
    dashboard(3, 'full_access_funnel', [
      { stage: 'offer_impression', numerator: 100, denominator: null },
      { stage: 'verified_purchase', numerator: 5, denominator: 10 },
    ]),
    dashboard(6, 'top_picks_activation_funnel', [
      { stage: 'preview_impression', numerator: 80, denominator: null },
      { stage: 'full_analysis_opened', numerator: 20, denominator: 40 },
    ]),
    dashboard(5, 'collection_purchase_funnel', [
      { stage: 'collection_page_viewed', numerator: 40, denominator: null },
      { stage: 'purchase_succeeded', numerator: 2, denominator: 4 },
    ]),
    dashboard(13, 'ai_chat_unlock_funnel', [
      { stage: 'locked_screen_viewed', numerator: 50, denominator: null },
      { stage: 'purchase_succeeded', numerator: 3, denominator: 6 },
    ]),
    dashboard(10, 'pass_to_monthly_conversion_rate', [
      { numerator: 1, denominator: 2 },
      { numerator: 0, denominator: 8 },
    ]),
  ],
};

it('shows the same six conversion and activation rates on both summaries and carries the exact time range into the detailed report', async () => {
  const view = render(
    <HomeAnalyticsOverview
      data={{ today: data, daily: [{ date: '2026-10-10', data }] }}
      periodLabel="Oct 10"
      partial={false}
    />
  );
  const expected = [
    ['Full Access purchase conversion', '5%'],
    ['Free Pick activation', '15%'],
    ['Paid Top Picks activation', '25%'],
    ['Collections purchase conversion', '5%'],
    ['AI Chat unlock conversion', '6%'],
    ['Pass-to-subscription conversion', '10%'],
  ];
  for (const [name, value] of expected) {
    const card = screen.getByRole('article', { name });
    expect(card).toHaveTextContent(value);
    const href = within(card).getByRole('link').getAttribute('href')!;
    const url = new URL(href, 'http://localhost');
    expect(url.searchParams.get('from')).toBe(range.from);
    expect(url.searchParams.get('to')).toBe(range.to);
  }
  expect(
    screen.queryByRole('article', { name: 'Home load success' })
  ).not.toBeInTheDocument();
  expect(screen.getAllByRole('article')).toHaveLength(6);
  const href = within(screen.getByRole('article', { name: expected[0][0] }))
    .getByRole('link')
    .getAttribute('href')!;
  view.unmount();
  const previousHref = window.location.href;
  window.location.href = `http://localhost${href}`;
  jest.mocked(getUpdatedHomeAnalytics).mockResolvedValue(data);
  try {
    render(<UpdatedHomeAnalyticsDashboard />);
    const summary = await screen.findByRole('region', { name: 'Overview' });
    for (const [name, value] of expected)
      expect(
        within(summary).getByRole('link', { name: `${name}: ${value}` })
      ).toBeInTheDocument();
    expect(getUpdatedHomeAnalytics).toHaveBeenCalledWith(range);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(getUpdatedHomeAnalytics).toHaveBeenLastCalledWith(range);
    await screen.findByRole('region', { name: 'Overview' });
    expect(screen.getByLabelText('From (UTC)')).toHaveValue('2026-10-10');
    expect(screen.getByLabelText('To (UTC)')).toHaveValue('2026-10-10');
  } finally {
    window.location.href = previousHref;
  }
});

it('shows whole-funnel conversion beside previous-stage percentages', async () => {
  jest.mocked(getUpdatedHomeAnalytics).mockResolvedValue(data);
  render(<UpdatedHomeAnalyticsDashboard />);
  const fullAccess = await screen.findByRole('region', { name: 'Full Access' });
  expect(
    within(fullAccess).getByText('Overall conversion: 5%')
  ).toBeInTheDocument();
  expect(
    within(fullAccess).getByText('5 / 100 users · first → last stage')
  ).toBeInTheDocument();
  expect(
    within(fullAccess).getByLabelText('Verified purchase 50%')
  ).toBeInTheDocument();
});

it('shows pooled pass conversion rather than an average of country/product rates', async () => {
  jest.mocked(getUpdatedHomeAnalytics).mockResolvedValue(data);
  render(<UpdatedHomeAnalyticsDashboard />);
  const passes = await screen.findByRole('region', { name: 'Passes' });
  expect(within(passes).getByText('10%')).toBeInTheDocument();
  expect(within(passes).getByText('OVERALL CONVERSION')).toBeInTheDocument();
});

it('defaults direct Home Analytics navigation to the current UTC day', async () => {
  const today = new Date().toISOString().slice(0, 10);
  jest.mocked(getUpdatedHomeAnalytics).mockClear().mockResolvedValue(data);
  render(<UpdatedHomeAnalyticsDashboard />);
  await screen.findByRole('region', { name: 'Overview' });
  expect(getUpdatedHomeAnalytics).toHaveBeenCalledWith({
    from: `${today}T00:00:00.000Z`,
    to: `${today}T23:59:59.999Z`,
  });
});
