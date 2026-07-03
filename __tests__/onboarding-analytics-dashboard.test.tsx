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

  it('shows recent event identity, country, and language without exposing session ids as users', async () => {
    (getOnboardingFunnelAnalytics as jest.Mock).mockResolvedValue({
      ...analyticsResponse,
      recentEvents: [
        {
          id: 'event-1',
          sessionId: '3eabcadf-eec9-4cb9-9fae-aee0b2969e80',
          userName: 'Ada Lovelace',
          userEmail: 'ada@example.com',
          userCountryCode: 'US',
          userLanguage: 'en-us',
          step: 'live_ready',
          eventName: 'completed',
          action: 'go',
          occurredAt: '2026-07-03T13:01:32.000Z',
        },
        {
          id: 'event-2',
          sessionId: '08800c1e-712b-4cfd-bab4-9c455451c649',
          userName: null,
          userEmail: null,
          userCountryCode: null,
          userLanguage: 'pt-br',
          step: 'favorites',
          eventName: 'step_viewed',
          action: null,
          occurredAt: '2026-07-03T12:28:42.000Z',
        },
      ],
    });

    render(<OnboardingAnalyticsDashboard />);

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('en-us')).toBeInTheDocument();
    expect(screen.getAllByText('Unknown')).toHaveLength(2);
    expect(screen.getByText('pt-br')).toBeInTheDocument();
    expect(
      screen.queryByText(/3eabcadf-eec9-4cb9-9fae-aee0b2969e80/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/08800c1e-712b-4cfd-bab4-9c455451c649/)
    ).not.toBeInTheDocument();
  });
});
