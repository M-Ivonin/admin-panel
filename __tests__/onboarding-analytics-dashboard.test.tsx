import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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
  recentEventsNextCursor: null,
};

const recentEvent = {
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
};

describe('OnboardingAnalyticsDashboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-09T08:47:47.000Z'));
    (getOnboardingFunnelAnalytics as jest.Mock).mockReset();
    (getOnboardingFunnelAnalytics as jest.Mock).mockResolvedValue(
      analyticsResponse
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads the last 7 days by default on first page open', async () => {
    render(<OnboardingAnalyticsDashboard />);

    expect(await screen.findByText('50%')).toBeInTheDocument();

    expect(getOnboardingFunnelAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '2026-07-02T00:00:00.000Z',
        to: '2026-07-09T23:59:59.999Z',
      })
    );
    expect(screen.getByLabelText('From')).toHaveValue('2026-07-02');
    expect(screen.getByLabelText('To')).toHaveValue('2026-07-09');
  });

  it('renders platform, locale, and app version filters as dropdowns', async () => {
    render(<OnboardingAnalyticsDashboard />);

    expect(await screen.findByText('50%')).toBeInTheDocument();

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

  it('reloads data immediately when a filter date changes and manually refreshes with the same filters', async () => {
    render(<OnboardingAnalyticsDashboard />);

    expect(await screen.findByText('50%')).toBeInTheDocument();
    const refreshButton = screen.getByRole('button', { name: 'Refresh' });

    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-07-01' },
    });

    await waitFor(() =>
      expect(getOnboardingFunnelAnalytics).toHaveBeenLastCalledWith(
        expect.objectContaining({
          from: '2026-07-01T00:00:00.000Z',
          to: '2026-07-09T23:59:59.999Z',
          app_product: 'SirBro',
        })
      )
    );

    const callsBeforeManualRefresh = (getOnboardingFunnelAnalytics as jest.Mock)
      .mock.calls.length;

    await waitFor(() => expect(refreshButton).not.toBeDisabled());
    fireEvent.click(refreshButton);

    await waitFor(() =>
      expect(getOnboardingFunnelAnalytics).toHaveBeenCalledTimes(
        callsBeforeManualRefresh + 1
      )
    );
    expect(getOnboardingFunnelAnalytics).toHaveBeenLastCalledWith(
      expect.objectContaining({
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-09T23:59:59.999Z',
        app_product: 'SirBro',
      })
    );
  });

  it('renders the dashboard navigation header', async () => {
    render(<OnboardingAnalyticsDashboard />);

    expect(await screen.findByText('50%')).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: /back/i });
    expect(backLink).toHaveAttribute('href', '/dashboard');
    expect(
      screen.getByRole('heading', { name: 'Onboarding Analytics' })
    ).toBeInTheDocument();
  });

  it('renders daily started and completed onboarding history as two lines', async () => {
    (getOnboardingFunnelAnalytics as jest.Mock).mockResolvedValue({
      ...analyticsResponse,
      range: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-03T23:59:59.999Z',
        timezone: 'UTC',
      },
      timeSeries: [
        {
          date: '2026-07-01',
          started: 2,
          completed: 1,
          completionRate: 0.5,
          dropOff: 1,
        },
        {
          date: '2026-07-02',
          started: 4,
          completed: 3,
          completionRate: 0.75,
          dropOff: 1,
        },
        {
          date: '2026-07-03',
          started: 5,
          completed: 5,
          completionRate: 1,
          dropOff: 0,
        },
      ],
    });

    render(<OnboardingAnalyticsDashboard />);

    expect(
      await screen.findByRole('heading', { name: 'Onboarding History' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('figure', {
        name: 'Daily started onboarding sessions and completion rate',
      })
    ).toBeInTheDocument();
    const legend = screen.getByRole('list', { name: 'Chart legend' });
    expect(within(legend).getByText('Started')).toBeInTheDocument();
    expect(within(legend).getByText('Completed %')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Started onboarding sessions line' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Onboarding completion rate line' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: '2026-07-01: 2 started, 50% completed',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: '2026-07-02: 4 started, 75% completed',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: '2026-07-03: 5 started, 100% completed',
      })
    ).toBeInTheDocument();
  });

  it('shows recent event identity, country, and language without exposing session ids as users', async () => {
    (getOnboardingFunnelAnalytics as jest.Mock).mockResolvedValue({
      ...analyticsResponse,
      recentEvents: [
        recentEvent,
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

  it('loads older recent events with the returned cursor', async () => {
    (getOnboardingFunnelAnalytics as jest.Mock)
      .mockResolvedValueOnce({
        ...analyticsResponse,
        recentEvents: [recentEvent],
        recentEventsNextCursor: 'cursor-1',
      })
      .mockResolvedValueOnce({
        ...analyticsResponse,
        recentEvents: [
          {
            ...recentEvent,
            id: 'event-older',
            step: 'favorites',
            eventName: 'step_viewed',
            action: null,
            occurredAt: '2026-07-03T12:28:42.000Z',
          },
        ],
        recentEventsNextCursor: null,
      });

    render(<OnboardingAnalyticsDashboard />);

    expect(
      await screen.findByText('Live ready / completed / go')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));

    await waitFor(() =>
      expect(getOnboardingFunnelAnalytics).toHaveBeenLastCalledWith(
        expect.objectContaining({
          recent_events_cursor: 'cursor-1',
          recent_events_limit: '50',
        })
      )
    );
    expect(
      await screen.findByText('Favorites / step_viewed')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Load more' })
    ).not.toBeInTheDocument();
  });
});
