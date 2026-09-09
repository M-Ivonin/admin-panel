export type CompetitionScope =
  | 'domestic'
  | 'continental'
  | 'global'
  | 'unknown';

export type CompetitionClassification =
  | 'senior'
  | 'women'
  | 'youth'
  | 'reserve'
  | 'friendly'
  | 'unknown';

export interface MatchRankingCompetition {
  id: string;
  providerLeagueId: number | null;
  name: string;
  providerCategory: number | null;
  effectiveCategory: number | null;
  countryCode: string | null;
  confederation: string | null;
  scope: CompetitionScope;
  classification: CompetitionClassification;
  reviewState: string;
  metadataSource: string;
  metadataFreshAt: string | null;
  metadataLastSuccessAt: string | null;
  metadataLastError: string | null;
  suggestedClassification: Exclude<CompetitionClassification, 'unknown'>;
  needsAttention: boolean;
}

export type MatchRankingCatalogQueue = '' | 'ready' | 'attention';

export interface MatchRankingCompetitionUpdate {
  effectiveCategory: number | null;
  countryCode: string | null;
  confederation: string | null;
  scope: CompetitionScope;
  classification: CompetitionClassification;
  reviewState?: string;
  reason: string;
}

export interface TeamProminence {
  id: string;
  providerTeamId: number;
  teamName?: string | null;
  countryCode: string | null;
  value: number;
  reason: string;
  reviewedBy: string;
  reviewedAt: string;
  reviewDueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamProminenceInput {
  id?: string;
  providerTeamId: number;
  countryCode?: string | null;
  countryCodes?: string[];
  value: number;
  reason: string;
  reviewDueAt: string | null;
}

export interface SportmonksTeamOption {
  id: number;
  name: string;
  country: string | null;
}

export interface SportmonksLeagueOption {
  id: number;
  name: string;
  country: string | null;
}

export interface MatchFixtureOption {
  id: number;
  homeTeamName: string;
  awayTeamName: string;
  leagueName: string;
  date: string;
}

export type MatchRankingOverrideAction = 'pin' | 'exclude_top' | 'adjust';

export interface MatchRankingOverride {
  id: string;
  fixtureId: number;
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  leagueName?: string | null;
  fixtureDate?: string | null;
  countryCode: string | null;
  action: MatchRankingOverrideAction;
  value: number | null;
  priority: number | null;
  startsAt: string;
  endsAt: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchRankingOverrideInput {
  fixtureId: number;
  countryCode?: string | null;
  countryCodes?: string[];
  action: MatchRankingOverrideAction;
  value: number | null;
  priority: number | null;
  startsAt: string;
  endsAt: string;
  reason: string;
}

export interface MatchRankingConfiguration {
  id: string;
  version: string;
  rules: Record<string, unknown>;
  countryAllowlist: string[];
  treatmentPercentage: number;
  experimentId: string;
  assignmentSalt: string;
  active: boolean;
  activatedAt: string | null;
  activatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MatchRankingConfigurationInput {
  version: string;
  rules: Record<string, unknown>;
  countryAllowlist: string[];
  treatmentPercentage: number;
  experimentId: string;
  assignmentSalt: string;
  reason: string;
}

export interface MatchRankingPreviewInput {
  date: string;
  timezone: string;
  countryCode: string | null;
}

export interface MatchRankingComponents {
  B: number;
  L: number;
  T: number;
  S: number;
  U: number;
  E: number;
}

export interface MatchRankingPreviewFixture {
  fixtureId: number;
  competitionId: number;
  homeTeamName?: string;
  awayTeamName?: string;
  kickoff?: string | null;
  components: MatchRankingComponents;
  importance: number;
  topScore: number;
  eligible: boolean;
  pinned?: boolean;
  tieBreak?: string;
  exclusionReason: string | null;
}

export interface MatchRankingPreviewGroup {
  competitionId: number;
  competitionName?: string;
  groupScore: number;
  followed: boolean;
  fixtures: MatchRankingPreviewFixture[];
}

export interface MatchRankingPreview {
  rankingVersion: string;
  generatedAt: string;
  topMatches: MatchRankingPreviewFixture[];
  groups: MatchRankingPreviewGroup[];
}

export interface MatchRankingAuditEvent {
  id: string;
  targetType: string;
  targetId: string;
  actor: string;
  reason: string;
  beforeValue: Record<string, unknown> | null;
  afterValue: Record<string, unknown> | null;
  createdAt: string;
}
