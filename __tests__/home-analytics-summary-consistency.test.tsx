import {
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react';
import { overviewRequests, overviewWindow } from '@/lib/api/admin-overview';
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
    dashboard(9, 'pass_24h_repeat_purchase_rate', [
      { numerator: 0, denominator: 1 },
    ]),
    {
      ...dashboard(10, 'pass_to_monthly_conversion_rate', [
        { numerator: 1, denominator: 2 },
        { numerator: 0, denominator: 8 },
      ]),
      conversionWindow: {
        asOf: '2026-10-10T00:00:00.000Z',
        cohortDays: 30,
        observationDays: 30,
        from: '2026-08-11',
        to: '2026-09-09',
      },
    },
  ],
};

it('keeps the six rates on admin Overview and carries its exact time range into the detailed report', async () => {
  const view = render(
    <HomeAnalyticsOverview
      data={{ week: data, daily: [{ date: '2026-10-10', data }] }}
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
    await screen.findByRole('region', { name: 'Home' });
    expect(
      screen.queryByRole('region', { name: 'Overview' })
    ).not.toBeInTheDocument();
    expect(getUpdatedHomeAnalytics).toHaveBeenCalledWith(range);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(getUpdatedHomeAnalytics).toHaveBeenLastCalledWith(range);
    await screen.findByRole('region', { name: 'Home' });
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
  expect(passes.querySelector('#dashboard-10')).toBeInTheDocument();
  expect(
    within(passes).getByText(/Passes expired: 2026-08-11 – 2026-09-09 UTC/)
  ).toBeVisible();
  expect(
    within(passes).getByText(/independent of the page date filter/)
  ).toBeVisible();
});

it('defaults direct Home Analytics navigation to the last seven UTC dates', async () => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const firstDay = new Date(now.getTime() - 6 * 86_400_000).toISOString().slice(0, 10);
  jest.mocked(getUpdatedHomeAnalytics).mockClear().mockResolvedValue(data);
  render(<UpdatedHomeAnalyticsDashboard />);
  await screen.findByRole('region', { name: 'Home' });
  expect(getUpdatedHomeAnalytics).toHaveBeenCalledWith({
    from: `${firstDay}T00:00:00.000Z`,
    to: `${today}T23:59:59.999Z`,
  });
});

it('uses distinct-user weekly totals for headlines, daily points for charts, and links to pass conversion', async () => {
  const weekRange = { from: '2026-10-04T00:00:00.000Z', to: range.to };
  const daily = {
    ...data,
    dashboards: data.dashboards.map((block) =>
      block.id === 6
        ? dashboard(6, 'top_picks_activation_funnel', [
            { stage: 'preview_impression', numerator: 1, denominator: null },
            { stage: 'full_analysis_opened', numerator: 1, denominator: 1 },
          ])
        : block
    ),
  };
  const week = {
    ...daily,
    range: weekRange,
    dashboards: daily.dashboards.map((block) =>
      block.id === 6
        ? dashboard(6, 'top_picks_activation_funnel', [
            { stage: 'preview_impression', numerator: 2, denominator: null },
            { stage: 'full_analysis_opened', numerator: 1, denominator: 1 },
          ])
        : block
    ),
  };
  Object.assign(window.location, { hostname: 'localhost' });
  const originalFetch = global.fetch;
  const requests: string[] = [];
  global.fetch = jest.fn(async (input) => {
    const url = String(input);
    requests.push(url);
    const from = new URL(url).searchParams.get('from');
    const to = new URL(url).searchParams.get('to');
    return {
      ok: true,
      json: async () =>
        from === weekRange.from && to === weekRange.to ? week : daily,
    } as Response;
  });
  try {
    const result = await overviewRequests(
      overviewWindow('2026-10-10', new Date(range.to)),
      new AbortController().signal
    ).homeAnalytics();
    render(
      <HomeAnalyticsOverview
        data={result}
        periodLabel="Oct 10"
        partial={true}
      />
    );
    const card = screen.getByRole('article', {
      name: 'Paid Top Picks activation',
    });
    expect(within(card).getByText('50%')).toBeInTheDocument();
    expect(within(card).getByText('1 / 2 users')).toBeInTheDocument();
    expect(within(card).getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('2026-10-10: 100%')
    );
    const href = new URL(
      within(card).getByRole('link').getAttribute('href')!,
      'http://localhost'
    );
    expect(href.searchParams.get('from')).toBe(weekRange.from);
    expect(href.searchParams.get('to')).toBe(weekRange.to);
    const pass = screen.getByRole('article', {
      name: 'Pass-to-subscription conversion',
    });
    expect(within(pass).getByRole('link')).toHaveAttribute(
      'href',
      expect.stringContaining('#dashboard-10')
    );
    expect(within(pass).queryByRole('img')).not.toBeInTheDocument();
    expect(
      within(pass).getByText(/Passes expired: 2026-08-11 – 2026-09-09 UTC/)
    ).toBeVisible();
    expect(requests).toHaveLength(8);
  } finally {
    global.fetch = originalFetch;
  }
});

it('scrolls a linked pass conversion block into view after its backend data arrives', async () => {
  const previousHref = window.location.href;
  const previousScroll = Object.getOwnPropertyDescriptor(
    Element.prototype,
    'scrollIntoView'
  );
  const scroll = jest.fn();
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: scroll,
  });
  window.location.href =
    'http://localhost/dashboard/updated-home-analytics#dashboard-10';
  jest.mocked(getUpdatedHomeAnalytics).mockResolvedValue(data);
  try {
    render(<UpdatedHomeAnalyticsDashboard />);
    await screen.findByRole('region', { name: 'Passes' });
    await waitFor(() =>
      expect(scroll).toHaveBeenCalledWith({ block: 'start' })
    );
    expect(scroll.mock.instances[0]).toBe(
      document.getElementById('dashboard-10')
    );
  } finally {
    window.location.href = previousHref;
    if (previousScroll)
      Object.defineProperty(
        Element.prototype,
        'scrollIntoView',
        previousScroll
      );
    else delete (Element.prototype as Partial<Element>).scrollIntoView;
  }
});
