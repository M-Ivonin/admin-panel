import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import { getPredictionEvaluationGroups, exportPredictionEvaluations } from '@/lib/api/prediction-evaluations';

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

  it('sends the Top Picks selection to the backend', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ items: [] }) });
    await getPredictionEvaluationGroups({ predictionScope: 'top_picks', sourceTypes: ['published_prediction'] });
    expect(adminAuthFetch).toHaveBeenCalledWith({ path: '/match-predictions/admin/evaluations?predictionScope=top_picks&sourceTypes=published_prediction', method: 'GET' });
  });

  it.each(['all', 'published', 'unpublished'] as const)('sends publication %s independently of Top Picks', async (publicationStatus) => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ items: [] }) });
    await getPredictionEvaluationGroups({ predictionScope: 'top_picks', publicationStatus, sourceTypes: ['published_prediction'] });
    expect(adminAuthFetch).toHaveBeenLastCalledWith({ path: `/match-predictions/admin/evaluations?predictionScope=top_picks&publicationStatus=${publicationStatus}&sourceTypes=published_prediction`, method: 'GET' });
  });

  it('exports the complete filtered selection without pagination', async () => {
    const exportData = { schemaVersion: 1, calculatedAt: '2026-10-07T00:00:00Z', rows: [] };
    (adminAuthFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => exportData });
    await expect(exportPredictionEvaluations({ page: 3, limit: 10, flowType: 'ON_DEMAND', predictionScope: 'top_picks', publicationStatus: 'unpublished', statuses: ['evaluated'], sortBy: 'fixture_time', sortOrder: 'asc' })).resolves.toEqual(exportData);
    expect(adminAuthFetch).toHaveBeenLastCalledWith({ path: '/match-predictions/admin/evaluations/export?flowType=ON_DEMAND&predictionScope=top_picks&publicationStatus=unpublished&sortBy=fixture_time&sortOrder=asc&statuses=evaluated', method: 'GET' });
  });

  it.each(['all', 'ON_DEMAND', 'PREMADE'] as const)('sends flow %s independently', async (flowType) => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ items: [] }) });
    await getPredictionEvaluationGroups({ flowType });
    expect(adminAuthFetch).toHaveBeenLastCalledWith({ path: `/match-predictions/admin/evaluations?flowType=${flowType}`, method: 'GET' });
  });

  it('reports export errors and admin access denial', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 403, statusText: 'Forbidden' });
    await expect(exportPredictionEvaluations()).rejects.toThrow('Forbidden');
    (adminAuthFetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 413, statusText: 'Payload Too Large' });
    await expect(exportPredictionEvaluations()).rejects.toThrow('Payload Too Large');
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
