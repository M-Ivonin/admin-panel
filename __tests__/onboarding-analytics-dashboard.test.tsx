import { render, screen } from '@testing-library/react';
import { OnboardingAnalyticsDashboard } from '@/components/onboarding-analytics/OnboardingAnalyticsDashboard';
import { getOnboardingFunnelAnalytics } from '@/lib/api/onboarding-analytics';

jest.mock('@/lib/api/onboarding-analytics', () => ({
  getOnboardingFunnelAnalytics: jest.fn(),
}));

const analyticsResponse = {
  range: {
    from: '2026-06-01T00:00:00.000Z',
    to: '2026-06-30T23:59:59.999Z',
    timezone: 'UTC' as const,
  },
  summary: {
    sessionsStarted: 2,
    sessionsCompleted: 1,
    completionRate: 0.5,
    averageSecondsToCompletion: 120,
  },
  filters: {
    platforms: ['android', 'ios'],
    locales: ['en-us', 'pt-br'],
    appVersions: ['1.1.300', '1.1.301'],
  },
  steps: [],
  transitions: [],
  timeSeries: [],
  heatmap: [],
  recentEvents: [],
};

describe('OnboardingAnalyticsDashboard', () => {
  beforeEach(() => {
    (getOnboardingFunnelAnalytics as jest.Mock).mockReset();
    (getOnboardingFunnelAnalytics as jest.Mock).mockResolvedValue(
      analyticsResponse
    );
  });

  it('renders platform, locale, and app version filters as dropdowns', async () => {
    render(<OnboardingAnalyticsDashboard />);

    expect(await screen.findByText('Started')).toBeInTheDocument();

    expect(
      screen.getByRole('combobox', { name: /platform/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /locale/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /app version/i })
    ).toBeInTheDocument();
  });

  it('renders the dashboard navigation header', async () => {
    render(<OnboardingAnalyticsDashboard />);

    expect(await screen.findByText('Started')).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: /back/i });
    expect(backLink).toHaveAttribute('href', '/dashboard');
    expect(
      screen.getByRole('heading', { name: 'Onboarding Analytics' })
    ).toBeInTheDocument();
  });
});
