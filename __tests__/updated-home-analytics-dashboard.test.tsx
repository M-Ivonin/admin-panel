import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { UpdatedHomeAnalyticsDashboard } from '@/components/updated-home-analytics/UpdatedHomeAnalyticsDashboard';
import {
  displayLabel,
  formatMetricUnit,
  formatMetricValue,
} from '@/components/updated-home-analytics/presentation';
import { getUpdatedHomeAnalytics } from '@/lib/api/updated-home-analytics';

jest.mock('@/lib/api/updated-home-analytics', () => ({
  getUpdatedHomeAnalytics: jest.fn(),
}));

const completeness = {
  isComplete: false,
  reason: 'The final 30 seconds are excluded while Home views may remain open.',
};

const dashboardNames = [
  'Home quality',
  'Free Pick activation',
  'Full Access conversion',
  'Paywall by product and country',
  'Collections assisted conversion',
  'Top Picks and Parlays',
  'Paid Top Picks Full Analysis',
  'Top Picks result return',
  'Pass usage and expiration',
  'Pass-to-subscription conversion',
  'Purchase failures and verification',
  'Retention by core action',
];

const metricKeys = [
  'home_load_success_rate',
  'free_pick_activation_funnel',
  'full_access_funnel',
  'conversion_by_product_country',
  'collection_assisted_conversion_rate',
  'top_picks_activation_funnel',
  'section_reach_rate',
  'top_picks_result_return_funnel',
  'pass_24h_repeat_purchase_rate',
  'pass_to_monthly_conversion_rate',
  'verified_started_rate',
  'd1_d7_d30_retention',
];

const stages: Readonly<Record<number, readonly string[]>> = {
  2: [
    'home_viewed',
    'free_pick_impression',
    'free_pick_clicked',
    'free_pick_prediction_card_opened',
  ],
  6: ['preview_impression', 'preview_click', 'full_analysis_opened'],
  8: [
    'preview_clicked',
    'full_analysis_opened',
    'prediction_saved',
    'settlement_eligible',
    'prediction_result_viewed',
  ],
};

function makeResponse() {
  return {
    definitionVersion: 'updated-home-dashboards-v1.1',
    timezone: 'UTC' as const,
    range: {
      from: '2026-07-28T00:00:00.000Z',
      to: '2026-08-11T23:59:59.999Z',
    },
    dashboards: dashboardNames.map((name, index) => {
      const id = index + 1;
      const key = metricKeys[index];
      const valueStages = stages[id] ?? [''];
      return {
        id,
        name,
        definitionVersion: 'updated-home-dashboards-v1.1',
        observationCompleteness: completeness,
        dimensions: valueStages[0] ? ['stage'] : ['access_state'],
        metrics: [
          {
            definition: {
              key,
              numerator: `distinct users in ${key}`,
              denominator: `distinct eligible users for ${key}`,
              window: 'backend UTC window',
              grouping: valueStages[0] ? ['stage'] : ['access_state'],
              nullTreatment: `backend N/A rule for ${key}`,
            },
            values: valueStages.map((stage, valueIndex) => ({
              formula: {
                numerator: `distinct users in ${key}`,
                denominator: `distinct eligible users for ${key}`,
              },
              dimensions: stage ? { stage } : { accessState: 'full_access' },
              numerator: valueIndex === 0 ? 40 : 20,
              denominator: valueIndex === 0 ? null : 40,
              value: valueIndex === 0 ? 40 : 50,
              unit: valueIndex === 0 ? 'users' : 'percent',
              completeness,
              naReason: null,
            })),
          },
        ],
      };
    }),
  };
}

describe('UpdatedHomeAnalyticsDashboard', () => {
  it('presents millisecond metrics in seconds', () => {
    const value = {
      value: 8250,
      unit: 'milliseconds',
    } as Parameters<typeof formatMetricValue>[0];

    expect(formatMetricValue(value)).toBe('8.25 s');
    expect(formatMetricUnit(value)).toBe('seconds');
    expect(displayLabel('active_home_time_ms')).toBe('Active home time');
    expect(displayLabel('verification_latency_ms')).toBe('Verification latency');
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-11T10:00:00.000Z'));
    (getUpdatedHomeAnalytics as jest.Mock).mockReset();
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue(makeResponse());
  });

  afterEach(() => jest.useRealTimers());

  it('applies a UTC range and exposes every backend section and trace field', async () => {
    render(<UpdatedHomeAnalyticsDashboard />);
    expect(await screen.findByRole('region', { name: 'Overview' })).toBeInTheDocument();

    expect(screen.getByLabelText('From (UTC)')).toBeInTheDocument();
    expect(screen.getByLabelText('To (UTC)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export JSON' })).toBeEnabled();
    expect(screen.getByText('UTC · maximum 90 days · backend-computed')).toBeInTheDocument();

    const sectionLabels = screen
      .getAllByTestId('updated-home-dashboard-section')
      .map((section) => section.getAttribute('aria-label'));
    expect(sectionLabels).toEqual([
      'Home',
      'Free Pick',
      'Full Access',
      'Paywall',
      'Collections',
      'Top Picks/Parlays',
      'Full Analysis',
      'Top Picks Result Return',
      'Passes',
      'Purchases',
      'Retention',
    ]);
    const passes = screen.getByRole('region', { name: 'Passes' });
    expect(within(passes).getByText('Pass usage and expiration')).toBeInTheDocument();
    expect(within(passes).getByText('Pass-to-subscription conversion')).toBeInTheDocument();

    const firstMetric = screen.getAllByTestId('updated-home-metric-row')[0];
    expect(firstMetric).toHaveTextContent('WHAT IT SHOWS');
    expect(firstMetric).toHaveTextContent(
      'Share of Home load attempts that finished successfully.'
    );
    expect(firstMetric).toHaveTextContent('DIMENSIONSAccess State: Full access');
    expect(firstMetric).toHaveTextContent('VALUE40');
    expect(firstMetric).toHaveTextContent('UNITusers');
    expect(firstMetric).not.toHaveTextContent('NUMERATOR VALUE');
    expect(firstMetric).not.toHaveTextContent('FORMULA NUM');
    expect(firstMetric).not.toHaveTextContent('WINDOW');
    expect(firstMetric).not.toHaveTextContent('COMPLETENESS');
    expect(screen.queryByRole('button', { name: /Calculation details/ })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('From (UTC)'), {
      target: { value: '2026-05-14' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(getUpdatedHomeAnalytics).toHaveBeenCalledTimes(2));
    expect(getUpdatedHomeAnalytics).toHaveBeenLastCalledWith({
      from: '2026-05-14T00:00:00.000Z',
      to: '2026-08-11T23:59:59.999Z',
    });
  });

  it('keeps Overview compact and leaves detailed funnels in their sections', async () => {
    const response = makeResponse();
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue({
      ...response,
      dashboards: response.dashboards.map((dashboard) =>
        [2, 6, 8].includes(dashboard.id)
          ? {
              ...dashboard,
              metrics: dashboard.metrics.map((metric) => ({
                ...metric,
                values: [...metric.values].reverse(),
              })),
            }
          : dashboard
      ),
    });
    render(<UpdatedHomeAnalyticsDashboard />);
    const overview = await screen.findByRole('region', { name: 'Overview' });
    expect(within(overview).queryByTestId('updated-home-funnel')).not.toBeInTheDocument();
    expect(within(overview).getByRole('link', { name: /Free Pick activation/i })).toHaveAttribute('href', '#dashboard-2');
    expect(within(overview).getByRole('link', { name: /Paid Top Picks activation/i })).toHaveAttribute('href', '#dashboard-6');
    expect(within(overview).getByRole('link', { name: /Full Access purchase conversion/i })).toHaveAttribute('href', '#dashboard-3');
    expect(within(overview).getByRole('link', { name: /Home load success rate/i })).toHaveAttribute('href', '#dashboard-1');

    const freePick = screen.getByRole('region', { name: 'Free Pick' });
    expect(within(freePick).getByText('Free pick activation funnel')).toBeInTheDocument();
    const topPicks = screen.getByRole('region', { name: 'Top Picks/Parlays' });
    expect(within(topPicks).getByText('Top picks activation funnel')).toBeInTheDocument();

  });

  it('groups Home quality dimensions under one metric heading', async () => {
    const response = makeResponse();
    const home = response.dashboards[0];
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue({
      ...response,
      dashboards: [
        {
          ...home,
          metrics: [
            {
              definition: {
                key: 'module_reach_rate',
                numerator: 'distinct users with module impression',
                denominator: 'distinct users with settled Home view',
                window: 'backend UTC window',
                grouping: ['module_name', 'module_position'],
                nullTreatment: 'N/A when no settled Home users',
              },
              values: [
                {
                  formula: {
                    numerator: 'distinct users with module impression',
                    denominator: 'distinct users with settled Home view',
                  },
                  dimensions: { moduleName: 'feed', modulePosition: 7 },
                  numerator: 1,
                  denominator: 6,
                  value: 16.67,
                  unit: 'percent',
                  completeness,
                  naReason: null,
                },
                {
                  formula: {
                    numerator: 'distinct users with module impression',
                    denominator: 'distinct users with settled Home view',
                  },
                  dimensions: { moduleName: 'access_status', modulePosition: 1 },
                  numerator: 1,
                  denominator: 6,
                  value: 16.67,
                  unit: 'percent',
                  completeness,
                  naReason: null,
                },
                {
                  formula: {
                    numerator: 'distinct users with module impression',
                    denominator: 'distinct users with settled Home view',
                  },
                  dimensions: { moduleName: 'feed', modulePosition: 6 },
                  numerator: 1,
                  denominator: 6,
                  value: 16.67,
                  unit: 'percent',
                  completeness,
                  naReason: null,
                },
              ],
            },
          ],
        },
        ...response.dashboards.slice(1),
      ],
    });

    render(<UpdatedHomeAnalyticsDashboard />);
    const homeSection = await screen.findByRole('region', { name: 'Home' });
    const metric = within(homeSection).getByTestId('updated-home-grouped-metric');

    expect(within(metric).getAllByText('Module reach rate')).toHaveLength(1);
    expect(within(metric).getByText('3 breakdowns')).toBeInTheDocument();
    expect(within(metric).getByText('AVERAGE ACROSS BREAKDOWNS')).toBeInTheDocument();
    expect(within(within(metric).getByRole('button')).getByText('16.67%')).toBeInTheDocument();
    expect(
      within(metric).getAllByText('Share of Home visitors who scrolled far enough to see a module.')
    ).toHaveLength(1);
    const toggle = within(metric).getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    expect(within(metric).getByText('MODULE NAME')).toBeInTheDocument();
    expect(within(metric).getByText('POSITION')).toBeInTheDocument();
    const rows = within(metric).getAllByTestId('updated-home-metric-value-row');
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Access status116.67%percent'),
      expect.stringContaining('Feed616.67%percent'),
      expect.stringContaining('Feed716.67%percent'),
    ]);
    expect(within(metric).queryByText(/Module Name:/)).not.toBeInTheDocument();
    expect(within(metric).queryByText(/Module Position:/)).not.toBeInTheDocument();
    expect(within(metric).getAllByText('16.67%')).toHaveLength(4);
  });

  it('keeps loading and transport errors explicit and does not show stale metrics', async () => {
    let rejectRequest: (reason: Error) => void = () => undefined;
    (getUpdatedHomeAnalytics as jest.Mock).mockImplementation(
      () => new Promise((_, reject) => { rejectRequest = reject; })
    );
    render(<UpdatedHomeAnalyticsDashboard />);
    expect(screen.getByLabelText('Loading Updated Home analytics')).toBeInTheDocument();
    expect(screen.getByText('Loading backend analytics…')).toBeInTheDocument();
    await act(async () => rejectRequest(new Error('Forbidden')));
    expect(await screen.findByText('Forbidden')).toBeInTheDocument();
    expect(screen.queryByTestId('updated-home-dashboard-grid')).not.toBeInTheDocument();
  });

  it('groups large dimensional breakdowns outside Home without inventing an average', async () => {
    const response = makeResponse();
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue({
      ...response,
      dashboards: response.dashboards.map((dashboard) =>
        dashboard.id === 4
          ? {
              ...dashboard,
              metrics: [{
                ...dashboard.metrics[0],
                definition: {
                  ...dashboard.metrics[0].definition,
                  key: 'conversion_by_product_country',
                  grouping: ['country', 'placement', 'product_id'],
                },
                values: [
                  { ...dashboard.metrics[0].values[0], dimensions: { country: 'US', placement: 'offers', productId: 'pro' }, value: 20, unit: 'percent' },
                  { ...dashboard.metrics[0].values[0], dimensions: { country: 'US', placement: 'home_main_offer', productId: 'pass' }, value: 10, unit: 'percent' },
                ],
              }],
            }
          : dashboard
      ),
    });

    render(<UpdatedHomeAnalyticsDashboard />);
    const paywall = await screen.findByRole('region', { name: 'Paywall' });
    const metric = within(paywall).getByTestId('updated-home-grouped-metric');
    expect(within(metric).getByText('2 breakdowns')).toBeInTheDocument();
    expect(within(metric).queryByText(/average across breakdowns/i)).not.toBeInTheDocument();
    expect(within(metric).getByText('BREAKDOWNS')).toBeInTheDocument();

    fireEvent.click(within(metric).getByRole('button'));
    expect(within(metric).getByText('COUNTRY')).toBeInTheDocument();
    expect(within(metric).getByText('PLACEMENT')).toBeInTheDocument();
    expect(within(metric).getByText('PRODUCT ID')).toBeInTheDocument();
    expect(within(metric).getAllByTestId('updated-home-metric-value-row').map((row) => row.textContent)).toEqual([
      expect.stringContaining('USHome main offerPass10%percent'),
      expect.stringContaining('USOffersPro20%percent'),
    ]);
  });

  it('hides zero-value collection breakdowns until requested', async () => {
    const response = makeResponse();
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue({
      ...response,
      dashboards: response.dashboards.map((dashboard) =>
        dashboard.id === 5
          ? {
              ...dashboard,
              metrics: [{
                ...dashboard.metrics[0],
                definition: { ...dashboard.metrics[0].definition, key: 'collection_assisted_conversion_rate' },
                values: [
                  { ...dashboard.metrics[0].values[0], dimensions: { collectionId: 'league:1', collectionName: 'Premier League Picks', collectionType: 'matchday' }, value: 0, unit: 'percent' },
                  { ...dashboard.metrics[0].values[0], dimensions: { collectionId: 'league:2', collectionName: 'Championship Picks', collectionType: 'matchday' }, value: 25, unit: 'percent' },
                  { ...dashboard.metrics[0].values[0], dimensions: { collectionId: 'league:3', collectionName: 'La Liga Picks', collectionType: 'matchday' }, value: null, unit: 'percent' },
                ],
              }],
            }
          : dashboard
      ),
    });

    render(<UpdatedHomeAnalyticsDashboard />);
    const collections = await screen.findByRole('region', { name: 'Collections' });
    const metric = within(collections).getByTestId('updated-home-grouped-metric');
    expect(within(metric).getByText('1 converting · 1 with 0% · 1 N/A')).toBeInTheDocument();
    expect(within(metric).getAllByTestId('updated-home-metric-value-row')).toHaveLength(2);
    expect(within(metric).queryByText('League:1')).not.toBeInTheDocument();

    fireEvent.click(within(metric).getByRole('button', { name: /Show Collection assisted conversion rate breakdown/ }));
    expect(within(metric).getByText('COLLECTION NAME')).toBeInTheDocument();
    expect(within(metric).getByText('Championship Picks')).toBeInTheDocument();
    fireEvent.click(within(metric).getByRole('button', { name: 'Show 0% collections' }));
    expect(within(metric).getAllByTestId('updated-home-metric-value-row')).toHaveLength(3);
    expect(within(metric).getByText('League:1')).toBeInTheDocument();
    expect(within(metric).getByRole('button', { name: 'Hide 0% collections' })).toBeInTheDocument();
  });

  it('renders empty and N/A states without turning missing values into zero', async () => {
    const response = makeResponse();
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue({
      ...response,
      dashboards: response.dashboards.map((dashboard) =>
        dashboard.id === 1
          ? {
              ...dashboard,
              metrics: dashboard.metrics.map((metric) => ({
                ...metric,
                values: metric.values.map((value) => ({
                  ...value,
                  numerator: null,
                  denominator: 40,
                  value: null,
                  naReason: 'Exact backend N/A reason.',
                })),
              })),
            }
          : {
              ...dashboard,
              metrics: dashboard.metrics.map((metric) => ({ ...metric, values: [] })),
            }
      ),
    });
    render(<UpdatedHomeAnalyticsDashboard />);
    expect((await screen.findAllByText(/No eligible observations in this range/)).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
    expect(screen.queryByText('Exact backend N/A reason.')).not.toBeInTheDocument();
    expect(screen.getByText('No data for selected period')).toBeInTheDocument();
    const naMetric = screen.getAllByTestId('updated-home-metric-row')[0];
    expect(naMetric).toHaveTextContent('WHAT IT SHOWS');
    expect(naMetric).toHaveTextContent('VALUEN/A');
    expect(naMetric).toHaveTextContent('UNITusers');
  });

  it('renders partial and unsupported states from the response', async () => {
    const response = makeResponse();
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue({
      ...response,
      dashboards: response.dashboards.filter((dashboard) => dashboard.id !== 7),
    });
    render(<UpdatedHomeAnalyticsDashboard />);
    expect((await screen.findAllByText('Partial observation window')).length).toBeGreaterThan(0);
    expect(screen.queryByText(completeness.reason)).not.toBeInTheDocument();
    const unsupported = screen.getByRole('region', { name: 'Full Analysis' });
    expect(within(unsupported).getByText('Unsupported response')).toBeInTheDocument();
    expect(within(unsupported).getByText('This section was not returned by the backend.')).toBeInTheDocument();
  });

  it('rejects more than 90 inclusive UTC dates before calling the API', async () => {
    render(<UpdatedHomeAnalyticsDashboard />);
    await screen.findByRole('region', { name: 'Overview' });
    fireEvent.change(screen.getByLabelText('From (UTC)'), {
      target: { value: '2026-05-13' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(await screen.findByText('Maximum range is 90 days.')).toBeInTheDocument();
    expect(getUpdatedHomeAnalytics).toHaveBeenCalledTimes(1);
  });

  it('does not let an older request overwrite a newer range', async () => {
    const response = makeResponse();
    let resolveOlder: (value: typeof response) => void = () => undefined;
    let resolveNewer: (value: typeof response) => void = () => undefined;
    (getUpdatedHomeAnalytics as jest.Mock)
      .mockImplementationOnce(() => new Promise((resolve) => { resolveOlder = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveNewer = resolve; }));
    render(<UpdatedHomeAnalyticsDashboard />);
    fireEvent.change(screen.getByLabelText('From (UTC)'), {
      target: { value: '2026-07-27' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(getUpdatedHomeAnalytics).toHaveBeenCalledTimes(2));

    await act(async () => resolveNewer({
      ...response,
      range: { from: '2026-07-27T00:00:00.000Z', to: '2026-08-11T23:59:59.999Z' },
    }));
    expect(await screen.findByText(/2026-07-27 to 2026-08-11/)).toBeInTheDocument();

    await act(async () => resolveOlder({
      ...response,
      range: { from: '2026-01-01T00:00:00.000Z', to: '2026-01-02T23:59:59.999Z' },
    }));
    expect(screen.queryByText(/2026-01-01 to 2026-01-02/)).not.toBeInTheDocument();
  });
});
