import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { UpdatedHomeAnalyticsDashboard } from '@/components/updated-home-analytics/UpdatedHomeAnalyticsDashboard';
import { getUpdatedHomeAnalytics } from '@/lib/api/updated-home-analytics';

jest.mock('@/lib/api/updated-home-analytics', () => ({
  getUpdatedHomeAnalytics: jest.fn(),
}));

const names = [
  'Home module performance',
  'Free Pick activation',
  'Full Access conversion',
  'Paywall by product and country',
  'Collections conversion',
  'Top Picks and Parlays',
  'Full Analysis engagement',
  'Completed Prediction Loops',
  'Pass usage and expiration',
  'Pass-to-subscription conversion',
  'Purchase failures and verification',
  'Retention by core action',
];

const response = {
  definitionVersion: 'updated-home-dashboards-v1.1',
  timezone: 'UTC' as const,
  range: {
    from: '2026-07-01T00:00:00.000Z',
    to: '2026-07-15T23:59:59.999Z',
  },
  dashboards: names.map((name, index) => ({
    id: index + 1,
    name,
    definitionVersion: 'updated-home-dashboards-v1.1',
    observationCompleteness: {
      isComplete: index !== 0,
      reason:
        index === 0 ? 'The final observation window is incomplete.' : null,
    },
    dimensions: [],
    metrics: [
      {
        definition: {
          key:
            index === 9
              ? 'subscription_cannibalization_pp'
              : index === 2
                ? 'revenue_per_home_user'
                : 'home_load_success_rate',
          numerator: 'eligible users',
          denominator: 'exposed users',
          window: 'requested UTC range',
          grouping: [],
          nullTreatment: 'N/A when empty',
        },
        values: [
          index === 9
            ? {
                dimensions: {},
                numerator: null,
                denominator: null,
                value: null,
                unit: 'percentage_points',
                naReason: 'N/A until an eligible experiment exists.',
              }
            : {
                dimensions: index === 2 ? { currency: 'USD' } : {},
                numerator: 1,
                denominator: 2,
                value: index === 2 ? 4.99 : 50,
                unit: index === 2 ? 'currency_per_user' : 'percent',
                naReason: null,
              },
        ],
      },
    ],
  })),
};

describe('UpdatedHomeAnalyticsDashboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-15T10:00:00.000Z'));
    (getUpdatedHomeAnalytics as jest.Mock).mockReset();
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue(response);
  });

  afterEach(() => jest.useRealTimers());

  it('renders all twelve backend sections, UTC metadata, currency and N/A states', async () => {
    render(<UpdatedHomeAnalyticsDashboard />);
    expect(
      await screen.findByText('Home module performance')
    ).toBeInTheDocument();
    for (const name of names) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(
      screen.getByText(/Currency totals stay separate/)
    ).toBeInTheDocument();
    expect(screen.getByText('4.99 USD')).toBeInTheDocument();
    expect(
      screen.getByText('Subscription cannibalization')
    ).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(
      screen.getByText('N/A until an eligible experiment exists.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('The final observation window is incomplete.')
    ).toBeInTheDocument();
    const grid = screen.getByTestId('updated-home-dashboard-grid');
    expect(getComputedStyle(grid).overflowX).toBe('hidden');
    expect(getUpdatedHomeAnalytics).toHaveBeenCalledWith({
      from: '2026-07-01T00:00:00.000Z',
      to: '2026-07-15T23:59:59.999Z',
    });
  });

  it('renders an empty observation state without inventing values', async () => {
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue({
      ...response,
      dashboards: response.dashboards.map((dashboard) => ({
        ...dashboard,
        metrics: dashboard.metrics.map((metric) => ({ ...metric, values: [] })),
      })),
    });
    render(<UpdatedHomeAnalyticsDashboard />);
    expect(
      await screen.findByText(/No eligible observations in this range/)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/N\/A · No eligible data/)).toHaveLength(12);
  });

  it('shows readable forbidden and loading states', async () => {
    let rejectRequest: (reason: Error) => void = () => undefined;
    (getUpdatedHomeAnalytics as jest.Mock).mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject;
        })
    );
    render(<UpdatedHomeAnalyticsDashboard />);
    expect(
      screen.getByLabelText('Loading Updated Home analytics')
    ).toBeInTheDocument();
    rejectRequest(new Error('Forbidden'));
    expect(await screen.findByText('Forbidden')).toBeInTheDocument();
  });

  it('does not let an older request overwrite a newer range', async () => {
    let resolveOlder: (value: typeof response) => void = () => undefined;
    let resolveNewer: (value: typeof response) => void = () => undefined;
    (getUpdatedHomeAnalytics as jest.Mock)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOlder = resolve;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveNewer = resolve;
          })
      );
    render(<UpdatedHomeAnalyticsDashboard />);
    fireEvent.change(screen.getByLabelText('From (UTC)'), {
      target: { value: '2026-06-30' },
    });
    await waitFor(() =>
      expect(getUpdatedHomeAnalytics).toHaveBeenCalledTimes(2)
    );

    await act(async () => {
      resolveNewer({
        ...response,
        range: {
          from: '2026-06-30T00:00:00.000Z',
          to: '2026-07-15T23:59:59.999Z',
        },
      });
    });
    expect(
      await screen.findByText(/2026-06-30 to 2026-07-15/)
    ).toBeInTheDocument();

    await act(async () => {
      resolveOlder({
        ...response,
        range: {
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-01-02T23:59:59.999Z',
        },
      });
    });
    expect(
      screen.queryByText(/2026-01-01 to 2026-01-02/)
    ).not.toBeInTheDocument();
  });
});
