import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export type PredictionEvaluationStatus =
  | 'pending'
  | 'evaluated'
  | 'not_found'
  | 'unsupported'
  | 'failed';

export type PredictionEvaluationSourceType =
  | 'match_prediction'
  | 'prediction_session';

export type PredictionEvaluationSlotKey = 'primary' | 'safe' | 'risky';

export type PredictionEvaluationOutcomeType = 'win' | 'loss' | 'void';

export type PredictionEvaluationGroupSortField =
  | 'prediction_created_at'
  | 'fixture_time'
  | 'status'
  | 'total'
  | 'evaluated'
  | 'correct'
  | 'accuracy'
  | 'pending'
  | 'not_found'
  | 'unsupported'
  | 'failed';

export type PredictionEvaluationGroupSortOrder = 'asc' | 'desc';

export interface PredictionEvaluationStats {
  total: number;
  evaluated: number;
  correct: number;
  accuracy: number | null;
  pending: number;
  notFound: number;
  unsupported: number;
  failed: number;
  safe: PredictionEvaluationAccuracyBreakdown;
  risky: PredictionEvaluationAccuracyBreakdown;
}

export interface PredictionEvaluationAccuracyBreakdown {
  evaluated: number;
  correct: number;
  accuracy: number | null;
}

export interface PredictionEvaluationSummary extends PredictionEvaluationStats {
  fixtureCount: number;
  predictionCount: number;
}

export interface PredictionEvaluationItem {
  id: string;
  fixtureId: number;
  sourceType: PredictionEvaluationSourceType;
  sourceId: string;
  slotKey: PredictionEvaluationSlotKey;
  marketKey: string | null;
  predictionValue: string;
  confidenceValue: number | null;
  oddsValue: number | null;
  status: PredictionEvaluationStatus;
  isCorrect: boolean | null;
  outcomeType: PredictionEvaluationOutcomeType | null;
  reasonCode: string | null;
  evaluatedAt: string | null;
  createdAt: string;
}

export interface FixtureEvaluationGroup {
  fixtureId: number;
  fixtureTime: string | null;
  leagueName: string | null;
  homeTeamName: string | null;
  awayTeamName: string | null;
  stats: PredictionEvaluationStats;
  predictions: PredictionEvaluationItem[];
}

export interface PaginatedPredictionEvaluationGroupsResponse {
  items: FixtureEvaluationGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: PredictionEvaluationSummary;
}

export interface PredictionEvaluationFilters {
  page?: number;
  limit?: number;
  search?: string;
  statuses?: PredictionEvaluationStatus[];
  sourceTypes?: PredictionEvaluationSourceType[];
  slotKeys?: PredictionEvaluationSlotKey[];
  marketKeys?: string[];
  league?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: PredictionEvaluationGroupSortField;
  sortOrder?: PredictionEvaluationGroupSortOrder;
}

/**
 * Loads grouped prediction evaluation data for the admin dashboard.
 */
export async function getPredictionEvaluationGroups(
  params: PredictionEvaluationFilters = {},
): Promise<PaginatedPredictionEvaluationGroupsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.league) searchParams.set('league', params.league);
  if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
  if (params.dateTo) searchParams.set('dateTo', params.dateTo);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  params.statuses?.forEach((status) => searchParams.append('statuses', status));
  params.sourceTypes?.forEach((sourceType) =>
    searchParams.append('sourceTypes', sourceType),
  );
  params.slotKeys?.forEach((slotKey) => searchParams.append('slotKeys', slotKey));
  params.marketKeys?.forEach((marketKey) =>
    searchParams.append('marketKeys', marketKey),
  );

  const queryString = searchParams.toString();
  const response = await adminAuthFetch({
    path: `/match-predictions/admin/evaluations${queryString ? `?${queryString}` : ''}`,
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Forbidden');
    }
    throw new Error(
      `Failed to fetch prediction evaluations: ${response.statusText}`,
    );
  }

  return response.json();
}
