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

  it('renders only backend-supported stages in the three journeys', async () => {
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
    expect(within(overview).getByText('Free Pick → Prediction Card')).toBeInTheDocument();
    expect(within(overview).getByText('Paid Top Picks: Prediction Card → Full Analysis')).toBeInTheDocument();
    expect(within(overview).getByText('Prediction Card opened')).toBeInTheDocument();
    expect(within(overview).getByText('Full Analysis opened')).toBeInTheDocument();
    expect(within(overview).queryByText(/Free Pick.*Full Analysis/i)).not.toBeInTheDocument();
    const overviewText = overview.textContent ?? '';
    expect(overviewText.indexOf('Home viewed')).toBeLessThan(
      overviewText.indexOf('Prediction Card opened')
    );
    expect(overviewText.indexOf('Prediction Card impression')).toBeLessThan(
      overviewText.indexOf('Full Analysis opened')
    );

    const resultReturn = screen.getByRole('region', { name: 'Top Picks Result Return' });
    for (const label of [
      'Prediction Card clicked',
      'Full Analysis opened',
      'Prediction saved',
      'Settlement eligible',
      'Prediction result viewed',
    ]) {
      expect(within(resultReturn).getByText(new RegExp(label))).toBeInTheDocument();
    }
    const resultRows = within(resultReturn).getAllByTestId('updated-home-metric-row');
    expect(resultRows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Prediction Card clicked'),
      expect.stringContaining('Full Analysis opened'),
      expect.stringContaining('Prediction saved'),
      expect.stringContaining('Settlement eligible'),
      expect.stringContaining('Prediction result viewed'),
    ]);
    expect(within(resultReturn).queryByText(/alert|breakdown|next/i)).not.toBeInTheDocument();
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
                  dimensions: { moduleName: 'feed', modulePosition: 6 },
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
                  dimensions: { moduleName: 'feed', modulePosition: 7 },
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
    expect(within(metric).getByText('2 breakdowns')).toBeInTheDocument();
    expect(within(metric).getByText('AVERAGE ACROSS BREAKDOWNS')).toBeInTheDocument();
    expect(within(within(metric).getByRole('button')).getByText('16.67%')).toBeInTheDocument();
    expect(
      within(metric).getAllByText('Share of Home visitors who scrolled far enough to see a module.')
    ).toHaveLength(1);
    const toggle = within(metric).getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    expect(within(metric).getByText('Module Name: Feed · Module Position: 6')).toBeInTheDocument();
    expect(within(metric).getByText('Module Name: Feed · Module Position: 7')).toBeInTheDocument();
    expect(within(metric).getAllByText('16.67%')).toHaveLength(3);
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
