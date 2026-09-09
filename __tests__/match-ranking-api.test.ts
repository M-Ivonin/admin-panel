import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import {
  activateMatchRankingConfiguration,
  bulkReviewMatchRankingCompetitions,
  createMatchRankingConfiguration,
  createMatchRankingOverride,
  deleteMatchRankingOverride,
  getMatchRankingAudit,
  getMatchRankingCompetitions,
  getMatchRankingConfigurations,
  getMatchRankingOverrides,
  getMatchFixtures,
  getSportmonksTeams,
  getSportmonksLeagues,
  mapMatchRankingCompetitionLeague,
  getTeamProminence,
  previewMatchRanking,
  updateMatchRankingCompetition,
  updateMatchRankingOverride,
  upsertTeamProminence,
} from '@/lib/api/match-ranking';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

const ok = (payload: unknown = {}) => ({
  ok: true,
  json: async () => payload,
});

describe('match ranking API', () => {
  beforeEach(() => (adminAuthFetch as jest.Mock).mockReset());

  it('uses normalized catalog filters and the complete review mutation', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue(ok({ items: [] }));
    await getMatchRankingCompetitions({
      query: '  Copa Libertadores ',
      reviewState: ' pending_review ',
      queue: 'ready',
    });
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/competitions?query=Copa+Libertadores&reviewState=pending_review&queue=ready',
      method: 'GET',
    });

    const input = {
      effectiveCategory: 1,
      countryCode: 'BR',
      confederation: 'CONMEBOL',
      scope: 'continental' as const,
      classification: 'senior' as const,
      reviewState: 'reviewed',
      reason: 'Verified against provider metadata',
    };
    (adminAuthFetch as jest.Mock).mockResolvedValue(ok(input));
    await updateMatchRankingCompetition('league/9', input);
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/competitions/league%2F9',
      method: 'PATCH',
      body: JSON.stringify(input),
    });

    await bulkReviewMatchRankingCompetitions(
      ['league-1', 'league-2'],
      'Provider metadata verified'
    );
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/competitions/bulk-review',
      method: 'POST',
      body: JSON.stringify({
        ids: ['league-1', 'league-2'],
        reason: 'Provider metadata verified',
      }),
    });
  });

  it('maps prominence and override CRUD to the supplied contracts', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue(ok([]));
    await getTeamProminence();
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/team-prominence',
      method: 'GET',
    });

    await getSportmonksTeams('  Palm  ');
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/teams?query=Palm',
      method: 'GET',
    });

    const prominence = {
      providerTeamId: 42,
      countryCode: 'BR',
      value: 20,
      reason: 'National audience prominence',
      reviewDueAt: null,
    };
    await upsertTeamProminence(prominence);
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/team-prominence',
      method: 'PUT',
      body: JSON.stringify(prominence),
    });

    await getMatchRankingOverrides();
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/overrides',
      method: 'GET',
    });

    await getMatchFixtures(' Arsenal ');
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/fixtures?query=Arsenal',
      method: 'GET',
    });

    const override = {
      fixtureId: 9001,
      countryCode: null,
      action: 'pin' as const,
      value: null,
      priority: 1,
      startsAt: '2026-09-08T10:00:00.000Z',
      endsAt: '2026-09-09T10:00:00.000Z',
      reason: 'Editorial final',
    };
    await createMatchRankingOverride(override);
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/overrides',
      method: 'POST',
      body: JSON.stringify(override),
    });
    await updateMatchRankingOverride('override/1', override);
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/overrides/override%2F1',
      method: 'PATCH',
      body: JSON.stringify(override),
    });
    await deleteMatchRankingOverride('override/1', 'Expired editorial need');
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/overrides/override%2F1',
      method: 'DELETE',
      body: JSON.stringify({ reason: 'Expired editorial need' }),
    });
  });

  it('searches and maps a Sportmonks league', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue(ok([]));
    await getSportmonksLeagues(' Gold Cup ');
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/leagues?query=Gold+Cup',
      method: 'GET',
    });

    const input = {
      providerLeagueId: 1112,
      reason: 'Matched by name and country',
    };
    await mapMatchRankingCompetitionLeague('league/1', input);
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/competitions/league%2F1/provider-mapping',
      method: 'PUT',
      body: JSON.stringify(input),
    });
  });

  it('maps configurations, preview, and audit to the supplied contracts', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue(ok({ items: [] }));
    await getMatchRankingConfigurations();
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/configurations',
      method: 'GET',
    });

    const configuration = {
      version: 'ranking-2026-09',
      rules: { threshold: 65 },
      countryAllowlist: ['BR', 'MX'],
      treatmentPercentage: 25,
      experimentId: 'top-matches-1',
      assignmentSalt: 'stable-salt',
      reason: 'Launch seed',
    };
    await createMatchRankingConfiguration(configuration);
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/configurations',
      method: 'POST',
      body: JSON.stringify(configuration),
    });
    await activateMatchRankingConfiguration('config/1', 'Product sign-off');
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/configurations/config%2F1/activate',
      method: 'POST',
      body: JSON.stringify({ reason: 'Product sign-off' }),
    });

    const preview = {
      date: '2026-09-08',
      timezone: 'Europe/Chisinau',
      countryCode: 'BR',
    };
    await previewMatchRanking(preview);
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/preview',
      method: 'POST',
      body: JSON.stringify(preview),
    });
    await getMatchRankingAudit();
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/admin/match-ranking/audit',
      method: 'GET',
    });
  });
});
