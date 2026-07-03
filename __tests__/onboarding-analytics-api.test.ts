import { getOnboardingFunnelAnalytics } from '@/lib/api/onboarding-analytics';
import { adminAuthFetch } from '@/modules/http/admin-auth-client';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

describe('onboarding analytics api', () => {
  beforeEach(() => {
    (adminAuthFetch as jest.Mock).mockReset();
  });

  it('serializes dashboard filters into backend query params', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        range: {
          from: '2026-06-01T00:00:00.000Z',
          to: '2026-06-30T23:59:59.999Z',
          timezone: 'UTC',
        },
        summary: {
          sessionsStarted: 0,
          sessionsCompleted: 0,
          completionRate: 0,
          averageSecondsToCompletion: null,
        },
        filters: {
          platforms: ['ios'],
          locales: ['en-us'],
          appVersions: ['1.1.300'],
        },
        steps: [],
        transitions: [],
        timeSeries: [],
        heatmap: [],
        recentEvents: [],
      }),
    });

    await getOnboardingFunnelAnalytics({
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.999Z',
      platform: 'ios',
      app_product: 'SirBro',
      app_version: '1.1.300',
      locale: 'en-us',
    });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/onboarding-funnel/admin/analytics?from=2026-06-01T00%3A00%3A00.000Z&to=2026-06-30T23%3A59%3A59.999Z&platform=ios&app_product=SirBro&app_version=1.1.300&locale=en-us',
      method: 'GET',
    });
  });

  it('serializes recent events pagination params', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        range: {
          from: '2026-06-01T00:00:00.000Z',
          to: '2026-06-30T23:59:59.999Z',
          timezone: 'UTC',
        },
        summary: {
          sessionsStarted: 0,
          sessionsCompleted: 0,
          completionRate: 0,
          averageSecondsToCompletion: null,
        },
        filters: {
          platforms: [],
          locales: [],
          appVersions: [],
        },
        steps: [],
        transitions: [],
        timeSeries: [],
        heatmap: [],
        recentEvents: [],
        recentEventsNextCursor: null,
      }),
    });

    await getOnboardingFunnelAnalytics({
      app_product: 'SirBro',
      recent_events_limit: '50',
      recent_events_cursor: 'cursor-1',
    });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/onboarding-funnel/admin/analytics?app_product=SirBro&recent_events_limit=50&recent_events_cursor=cursor-1',
      method: 'GET',
    });
  });

  it('surfaces forbidden responses as readable admin errors', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    await expect(getOnboardingFunnelAnalytics()).rejects.toThrow('Forbidden');
  });
});
