import { fireEvent, render, screen, within } from '@testing-library/react';
import { UpdatedHomeAnalyticsDashboard } from '@/components/updated-home-analytics/UpdatedHomeAnalyticsDashboard';
import { getUpdatedHomeAnalytics } from '@/lib/api/updated-home-analytics';

jest.mock('@/lib/api/updated-home-analytics', () => ({
  getUpdatedHomeAnalytics: jest.fn(),
}));

const completeness = { isComplete: false, reason: 'Final observation window is incomplete.' };

function dashboard(id: number, name: string, metricKey: string, stages?: string[]) {
  return {
    id,
    name,
    definitionVersion: 'updated-home-dashboards-v1.1',
    observationCompleteness: completeness,
    dimensions: stages ? ['stage'] : ['access_state'],
    metrics: [
      {
        definition: {
          key: metricKey,
          numerator: `backend numerator for ${metricKey}`,
          denominator: `backend denominator for ${metricKey}`,
          window: 'backend UTC window',
          grouping: stages ? ['stage'] : ['access_state'],
          nullTreatment: `backend N/A rule for ${metricKey}`,
        },
        values: (stages ?? ['']).map((stage, index) => ({
          formula: {
            numerator: `backend numerator for ${metricKey}`,
            denominator: `backend denominator for ${metricKey}`,
          },
          dimensions: stage ? { stage } : { accessState: 'full_access' },
          numerator: index === 0 ? 40 : null,
          denominator: index === 0 ? null : 40,
          value: index === 0 ? 40 : null,
          unit: index === 0 ? 'users' : 'percent',
          completeness,
          naReason: index === 0 ? null : `backend N/A for ${stage}`,
        })),
      },
    ],
  };
}

const response = {
  definitionVersion: 'updated-home-dashboards-v1.1',
  timezone: 'UTC' as const,
  range: {
    from: '2026-08-01T00:00:00.000Z',
    to: '2026-08-11T23:59:59.999Z',
  },
  dashboards: [
    dashboard(1, 'Home quality', 'home_load_success_rate'),
    dashboard(2, 'Free Pick activation', 'free_pick_activation_funnel', [
      'home_viewed',
      'free_pick_impression',
      'free_pick_clicked',
      'free_pick_prediction_card_opened',
    ]),
    dashboard(3, 'Full Access conversion', 'full_access_funnel'),
    dashboard(4, 'Paywall by product and country', 'conversion_by_product_country'),
    dashboard(5, 'Collections assisted conversion', 'collection_assisted_conversion_rate'),
    dashboard(6, 'Top Picks and Parlays', 'top_picks_activation_funnel', [
      'preview_impression',
      'preview_click',
      'full_analysis_opened',
    ]),
    dashboard(7, 'Paid Top Picks Full Analysis', 'section_reach_rate'),
    dashboard(8, 'Top Picks result return', 'top_picks_result_return_funnel'),
    dashboard(9, 'Pass usage and expiration', 'pass_24h_repeat_purchase_rate'),
    dashboard(10, 'Pass-to-subscription conversion', 'pass_to_monthly_conversion_rate'),
    dashboard(11, 'Purchase failures and verification', 'verified_started_rate'),
    dashboard(12, 'Retention by core action', 'd1_d7_d30_retention'),
  ],
};

describe('Updated Home dashboard backend projection rendering', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-11T10:00:00.000Z'));
    (getUpdatedHomeAnalytics as jest.Mock).mockResolvedValue(response);
  });

  afterEach(() => jest.useRealTimers());

  it('renders the #344 projection without inventing funnels, formulas, or revenue', async () => {
    render(<UpdatedHomeAnalyticsDashboard />);

    const overview = await screen.findByRole('region', { name: 'Overview' });
    expect(within(overview).getByText('Free Pick → Prediction Card')).toBeInTheDocument();
    expect(within(overview).getByText('Paid Top Picks: Prediction Card → Full Analysis')).toBeInTheDocument();
    expect(within(overview).getByText('Prediction Card opened')).toBeInTheDocument();
    expect(within(overview).getByText('Full Analysis opened')).toBeInTheDocument();
    expect(within(overview).queryByText(/Free Pick.*Full Analysis/i)).not.toBeInTheDocument();

    expect(screen.queryByText('backend numerator for home_load_success_rate')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /Calculation details/ })[0]);
    expect(screen.getByText('backend numerator for home_load_success_rate')).toBeInTheDocument();
    expect(screen.getByText('backend denominator for home_load_success_rate')).toBeInTheDocument();
    expect(screen.getByText('backend UTC window')).toBeInTheDocument();
    expect(screen.queryByText('Final observation window is incomplete.')).not.toBeInTheDocument();
    expect(screen.queryByText('backend N/A for free_pick_impression')).not.toBeInTheDocument();

    expect(screen.getAllByTestId('updated-home-dashboard-section').map((section) => section.getAttribute('aria-label'))).toEqual([
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
    expect(screen.queryByText(/revenue/i)).not.toBeInTheDocument();
  });
});
