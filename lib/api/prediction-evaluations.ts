import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export type PredictionEvaluationStatus =
  | 'pending'
  | 'evaluated'
  | 'not_found'
  | 'unsupported'
  | 'failed';

export type PredictionEvaluationSourceType =
  | 'match_prediction'
  | 'prediction_session'
  | 'published_prediction';

export type PredictionEvaluationSlotKey = 'primary' | 'safe' | 'risky' | 'main';

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
  v9?: PredictionEvaluationV9Metrics;
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
  averageOdds: number | null;
}

export interface PredictionEvaluationSummary extends PredictionEvaluationStats {
  v9?: PredictionEvaluationV9Summary;
  fixtureCount: number;
  predictionCount: number;
}

export interface PredictionEvaluationRoiMetrics {
  settledPicks: number;
  totalStaked: number;
  totalReturn: number;
  netProfit: number;
  roiPercent: number | null;
}

export type PredictionEvaluationSettlement = 'FULL_WIN' | 'HALF_WIN' | 'PUSH' | 'HALF_LOSS' | 'FULL_LOSS' | 'VOID';
export type PredictionEvaluationFlowType = 'all' | 'ON_DEMAND' | 'PREMADE';

export interface PredictionEvaluationV9Metrics extends PredictionEvaluationAccuracyBreakdown, Partial<PredictionEvaluationRoiMetrics> {
  predictionCount: number;
  fixtureCount: number;
  pending: number;
  notFound: number;
  unsupported: number;
  failed: number;
}

export interface PredictionEvaluationV9Summary extends PredictionEvaluationV9Metrics {
  byMarket: Array<PredictionEvaluationV9Metrics & { marketKey: string | null }>;
  byOdds: Array<PredictionEvaluationV9Metrics & { lowerInclusive: number | null; upperExclusive: number | null }>;
}

export interface PredictionEvaluationItem {
  flowType?: string | null;
  settlement?: PredictionEvaluationSettlement | null;
  roiEligible?: boolean;
  roiExclusionReason?: string | null;
  stakeUnits?: number | null;
  returnUnits?: number | null;
  profitUnits?: number | null;
  isValue?: boolean | null;
  conservativeEv?: number | null;
  predictionId?: string | null;
  revision?: number | null;
  publishedAt?: string | null;
  sourceCreatedAt?: string | null;
  canonicalMarketKey?: string | null;
  selectionKey?: string | null;
  selectionLabel?: string | null;
  line?: number | null;
  periodKey?: string | null;
  withdrawnAt?: string | null;
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

export type PredictionEvaluationScope = 'all' | 'top_picks' | 'other';

export type PredictionEvaluationPublicationStatus = 'all' | 'published' | 'unpublished';

export interface PredictionEvaluationFilters {
  flowType?: PredictionEvaluationFlowType;
  predictionScope?: PredictionEvaluationScope;
  publicationStatus?: PredictionEvaluationPublicationStatus;
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
  oddsFrom?: number;
  oddsTo?: number;
  sortBy?: PredictionEvaluationGroupSortField;
  sortOrder?: PredictionEvaluationGroupSortOrder;
}

/**
 * Loads grouped prediction evaluation data for the admin dashboard.
 */
export async function getPredictionEvaluationGroups(
  params: PredictionEvaluationFilters = {},
): Promise<PaginatedPredictionEvaluationGroupsResponse> {
  return fetchPredictionEvaluations(params, false);
}

export interface PredictionEvaluationExport {
  schemaVersion: 1;
  calculatedAt: string;
  filters: Omit<PredictionEvaluationFilters, 'page' | 'limit'>;
  staking: { stakeUnits: 1; oddsSource: 'prediction_version.reference_odds' };
  summary: PredictionEvaluationSummary;
  rows: Array<PredictionEvaluationItem & { predictionVersionId: string | null; leagueId: number | null; engineVersion: string | null; configVersion: string | null }>;
}

export async function exportPredictionEvaluations(params: PredictionEvaluationFilters = {}): Promise<PredictionEvaluationExport> {
  return fetchPredictionEvaluations(params, true);
}

async function fetchPredictionEvaluations(params: PredictionEvaluationFilters, exporting: false): Promise<PaginatedPredictionEvaluationGroupsResponse>;
async function fetchPredictionEvaluations(params: PredictionEvaluationFilters, exporting: true): Promise<PredictionEvaluationExport>;
async function fetchPredictionEvaluations(params: PredictionEvaluationFilters, exporting: boolean): Promise<PaginatedPredictionEvaluationGroupsResponse | PredictionEvaluationExport> {
  const searchParams = new URLSearchParams();

  if (params.flowType) searchParams.set('flowType', params.flowType);
  if (params.predictionScope) searchParams.set('predictionScope', params.predictionScope);
  if (params.publicationStatus) searchParams.set('publicationStatus', params.publicationStatus);
  if (!exporting && params.page) searchParams.set('page', params.page.toString());
  if (!exporting && params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.league) searchParams.set('league', params.league);
  if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
  if (params.dateTo) searchParams.set('dateTo', params.dateTo);
  if (params.oddsFrom !== undefined) {
    searchParams.set('oddsFrom', params.oddsFrom.toString());
  }
  if (params.oddsTo !== undefined) {
    searchParams.set('oddsTo', params.oddsTo.toString());
  }
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
    path: `/match-predictions/admin/evaluations${exporting ? '/export' : ''}${queryString ? `?${queryString}` : ''}`,
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
