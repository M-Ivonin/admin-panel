import { getAppEventsAnalytics } from '@/lib/api/app-events-analytics';
import { adminAuthFetch } from '@/modules/http/admin-auth-client';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

describe('app events analytics api', () => {
  beforeEach(() => {
    (adminAuthFetch as jest.Mock).mockReset();
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        metadata: {
          releaseDate: '2026-07-09',
          noBackfill: true,
          noBackfillMessage:
            'Registered-user App Event analytics start at the App Events release date.',
          defaultRangeDays: 14,
          maxRangeDays: 90,
          timezone: 'UTC',
        },
        range: {
          from: '2026-07-09T00:00:00.000Z',
          to: '2026-07-09T23:59:59.999Z',
        },
        summary: {
          totalEvents: 0,
          uniqueUsers: 0,
          screenOpenUniqueUsers: 0,
          businessActionEvents: 0,
        },
        countsByEvent: [],
        timeSeries: [],
        heatmapUtc: [],
        filters: {
          targetApps: [],
          platforms: [],
          appVersions: [],
          locales: [],
          categories: [],
          eventKeys: [],
        },
        recentEvents: [],
        nextCursor: null,
        emptyState: null,
      }),
    });
  });

  it('serializes bounded dashboard filters into backend query params', async () => {
    await getAppEventsAnalytics({
      from: '2026-07-09T00:00:00.000Z',
      to: '2026-07-09T23:59:59.999Z',
      targetApp: 'SirBro',
      platform: 'ios',
      appVersion: '1.1.280+282',
      locale: 'en',
      category: 'matches',
      eventKeys: ['matches_screen_opened', 'match_details_opened'],
      limit: '50',
      cursor: 'event-cursor-1',
    });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/app-events/admin/analytics?from=2026-07-09T00%3A00%3A00.000Z&to=2026-07-09T23%3A59%3A59.999Z&targetApp=SirBro&platform=ios&appVersion=1.1.280%2B282&locale=en&category=matches&eventKeys=matches_screen_opened&eventKeys=match_details_opened&limit=50&cursor=event-cursor-1',
      method: 'GET',
    });
  });

  it('surfaces forbidden responses as readable admin errors', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    await expect(getAppEventsAnalytics()).rejects.toThrow('Forbidden');
  });
});
