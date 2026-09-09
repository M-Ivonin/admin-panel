import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import type {
  MatchRankingAuditEvent,
  MatchRankingCompetition,
  MatchRankingCompetitionUpdate,
  MatchRankingCatalogQueue,
  MatchRankingConfiguration,
  MatchRankingConfigurationInput,
  MatchRankingOverride,
  MatchRankingOverrideInput,
  MatchRankingPreview,
  MatchRankingPreviewInput,
  TeamProminence,
  TeamProminenceInput,
  SportmonksTeamOption,
  SportmonksLeagueOption,
  MatchFixtureOption,
} from '@/modules/match-ranking/types';

const BASE_PATH = '/admin/match-ranking';

export async function getMatchRankingCompetitions(
  filters: {
    query?: string;
    reviewState?: string;
    queue?: MatchRankingCatalogQueue;
  } = {}
): Promise<MatchRankingCompetition[]> {
  const params = new URLSearchParams();
  if (filters.query?.trim()) params.set('query', filters.query.trim());
  if (filters.reviewState?.trim()) {
    params.set('reviewState', filters.reviewState.trim());
  }
  if (filters.queue) params.set('queue', filters.queue);
  const query = params.toString();
  return readList(
    await adminAuthFetch({
      path: `${BASE_PATH}/competitions${query ? `?${query}` : ''}`,
      method: 'GET',
    })
  );
}

export async function bulkReviewMatchRankingCompetitions(
  ids: string[],
  reason: string
): Promise<MatchRankingCompetition[]> {
  return readList(
    await adminAuthFetch({
      path: `${BASE_PATH}/competitions/bulk-review`,
      method: 'POST',
      body: JSON.stringify({ ids, reason: reason.trim() }),
    })
  );
}

export async function updateMatchRankingCompetition(
  id: string,
  input: MatchRankingCompetitionUpdate
): Promise<MatchRankingCompetition> {
  return readJson(
    await adminAuthFetch({
      path: `${BASE_PATH}/competitions/${encodeURIComponent(id)}`,
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  );
}

export async function getTeamProminence(): Promise<TeamProminence[]> {
  return readList(
    await adminAuthFetch({
      path: `${BASE_PATH}/team-prominence`,
      method: 'GET',
    })
  );
}

export async function getSportmonksTeams(
  query: string
): Promise<SportmonksTeamOption[]> {
  const params = new URLSearchParams({ query: query.trim() });
  return readList(
    await adminAuthFetch({
      path: `${BASE_PATH}/teams?${params.toString()}`,
      method: 'GET',
    })
  );
}

export async function getSportmonksLeagues(
  query: string
): Promise<SportmonksLeagueOption[]> {
  const params = new URLSearchParams({ query: query.trim() });
  return readList(
    await adminAuthFetch({
      path: `${BASE_PATH}/leagues?${params.toString()}`,
      method: 'GET',
    })
  );
}

export async function mapMatchRankingCompetitionLeague(
  id: string,
  input: { providerLeagueId: number; reason: string }
): Promise<MatchRankingCompetition> {
  return readJson(
    await adminAuthFetch({
      path: `${BASE_PATH}/competitions/${encodeURIComponent(id)}/provider-mapping`,
      method: 'PUT',
      body: JSON.stringify(input),
    })
  );
}

export async function upsertTeamProminence(
  input: TeamProminenceInput
): Promise<TeamProminence | TeamProminence[]> {
  return readJson(
    await adminAuthFetch({
      path: `${BASE_PATH}/team-prominence`,
      method: 'PUT',
      body: JSON.stringify(input),
    })
  );
}

export async function getMatchRankingOverrides(): Promise<
  MatchRankingOverride[]
> {
  return readList(
    await adminAuthFetch({ path: `${BASE_PATH}/overrides`, method: 'GET' })
  );
}

export async function getMatchFixtures(
  query: string
): Promise<MatchFixtureOption[]> {
  const params = new URLSearchParams({ query: query.trim() });
  return readList(
    await adminAuthFetch({
      path: `${BASE_PATH}/fixtures?${params.toString()}`,
      method: 'GET',
    })
  );
}

export async function createMatchRankingOverride(
  input: MatchRankingOverrideInput
): Promise<MatchRankingOverride | MatchRankingOverride[]> {
  return readJson(
    await adminAuthFetch({
      path: `${BASE_PATH}/overrides`,
      method: 'POST',
      body: JSON.stringify(input),
    })
  );
}

export async function updateMatchRankingOverride(
  id: string,
  input: MatchRankingOverrideInput
): Promise<MatchRankingOverride | MatchRankingOverride[]> {
  return readJson(
    await adminAuthFetch({
      path: `${BASE_PATH}/overrides/${encodeURIComponent(id)}`,
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  );
}

export async function deleteMatchRankingOverride(
  id: string,
  reason: string
): Promise<void> {
  await requireOk(
    await adminAuthFetch({
      path: `${BASE_PATH}/overrides/${encodeURIComponent(id)}`,
      method: 'DELETE',
      body: JSON.stringify({ reason: reason.trim() }),
    })
  );
}

export async function getMatchRankingConfigurations(): Promise<
  MatchRankingConfiguration[]
> {
  return readList(
    await adminAuthFetch({
      path: `${BASE_PATH}/configurations`,
      method: 'GET',
    })
  );
}

export async function createMatchRankingConfiguration(
  input: MatchRankingConfigurationInput
): Promise<MatchRankingConfiguration> {
  return readJson(
    await adminAuthFetch({
      path: `${BASE_PATH}/configurations`,
      method: 'POST',
      body: JSON.stringify(input),
    })
  );
}

export async function activateMatchRankingConfiguration(
  id: string,
  reason: string
): Promise<MatchRankingConfiguration> {
  return readJson(
    await adminAuthFetch({
      path: `${BASE_PATH}/configurations/${encodeURIComponent(id)}/activate`,
      method: 'POST',
      body: JSON.stringify({ reason: reason.trim() }),
    })
  );
}

export async function previewMatchRanking(
  input: MatchRankingPreviewInput
): Promise<MatchRankingPreview> {
  return readJson(
    await adminAuthFetch({
      path: `${BASE_PATH}/preview`,
      method: 'POST',
      body: JSON.stringify(input),
    })
  );
}

export async function getMatchRankingAudit(): Promise<
  MatchRankingAuditEvent[]
> {
  return readList(
    await adminAuthFetch({ path: `${BASE_PATH}/audit`, method: 'GET' })
  );
}

async function readList<T>(response: Response): Promise<T[]> {
  const payload = await readJson<T[] | { items: T[] }>(response);
  return Array.isArray(payload) ? payload : payload.items;
}

async function readJson<T>(response: Response): Promise<T> {
  await requireOk(response);
  return response.json() as Promise<T>;
}

async function requireOk(response: Response): Promise<void> {
  if (!response.ok) {
    let message = response.statusText || `Request failed (${response.status})`;
    try {
      const payload = (await response.json()) as {
        message?: string | string[];
      };
      if (Array.isArray(payload.message)) message = payload.message.join(' ');
      else if (payload.message) message = payload.message;
    } catch {
      // Keep the HTTP status when the API did not return a JSON error.
    }
    throw new Error(message);
  }
}
