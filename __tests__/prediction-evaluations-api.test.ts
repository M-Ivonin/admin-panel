import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import { getPredictionEvaluationGroups } from '@/lib/api/prediction-evaluations';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

describe('getPredictionEvaluationGroups', () => {
  it('serializes pagination and multi-value filters into query params', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        summary: {
          fixtureCount: 0,
          predictionCount: 0,
          total: 0,
          evaluated: 0,
          correct: 0,
          accuracy: null,
          pending: 0,
          notFound: 0,
          unsupported: 0,
          failed: 0,
          safe: {
            evaluated: 0,
            correct: 0,
            accuracy: null,
            averageOdds: null,
          },
          risky: {
            evaluated: 0,
            correct: 0,
            accuracy: null,
            averageOdds: null,
          },
        },
      }),
    });

    await getPredictionEvaluationGroups({
      page: 2,
      limit: 50,
      search: 'arsenal',
      statuses: ['pending', 'failed'],
      sourceTypes: ['match_prediction'],
      slotKeys: ['safe', 'risky'],
      marketKeys: ['match_winner', 'double_chance'],
      league: 'Premier League',
      dateFrom: '2026-04-01',
      dateTo: '2026-04-08',
      oddsFrom: 1.4,
      oddsTo: 2.2,
      sortBy: 'status',
      sortOrder: 'asc',
    });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path:
        '/match-predictions/admin/evaluations?page=2&limit=50&search=arsenal&league=Premier+League&dateFrom=2026-04-01&dateTo=2026-04-08&oddsFrom=1.4&oddsTo=2.2&sortBy=status&sortOrder=asc&statuses=pending&statuses=failed&sourceTypes=match_prediction&slotKeys=safe&slotKeys=risky&marketKeys=match_winner&marketKeys=double_chance',
      method: 'GET',
    });
  });

  it('throws a readable forbidden error for 403 responses', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    await expect(getPredictionEvaluationGroups()).rejects.toThrow('Forbidden');
  });
});
