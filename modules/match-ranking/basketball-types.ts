export type BasketballLeagueTier = 1 | 2 | 3 | 4;

export type BasketballLeague = {
  id: number;
  name: string;
  logoUrl: string | null;
};

export type BasketballRankingRules = {
  tier1: number;
  tier2: number;
  tier3: number;
  tier4: number;
  final: number;
  semifinal: number;
  quarterfinal: number;
  playoff: number;
  live: number;
  upcoming: number;
  completed: number;
  upcomingMinutes: number;
  topThreshold: number;
  topLimit: number;
  leagueCap: number;
  interestEnabled: boolean;
  interestWindowDays: number;
  interestRecentDays: number;
  interestRecentWeight: number;
  interestOlderWeight: number;
  interestTeamFactor: number;
  interestMinimumGames: number;
  interestMinimumDays: number;
  interestMultiplier: number;
  interestCap: number;
};

export type BasketballRankingConfiguration = {
  id: string;
  version: string;
  leagueTiers: Record<string, BasketballLeagueTier>;
  active: boolean;
  rules?: BasketballRankingRules;
  createdAt: string;
};

export type BasketballRankingDraft = Pick<
  BasketballRankingConfiguration,
  'version' | 'leagueTiers' | 'rules'
> & { reason: string };

export type BasketballRankingPreviewInput = {
  date: string;
  timezone: string;
  configurationId?: string;
  userId?: string;
};

type BasketballRankingGame = {
  id: number;
  startsAt: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: BasketballLeague;
  awayTeam: BasketballLeague;
  league: BasketballLeague & { flagUrl: string | null };
  stage: string | null;
  season: string;
};

export type BasketballRankingPreviewGame = {
  game: BasketballRankingGame;
  tier: BasketballLeagueTier | null;
  leagueScore: number;
  stageScore: number;
  timingScore: number;
  interestScore?: number;
  total: number;
  exclusionReason:
    | 'unrated_league'
    | 'ineligible_status'
    | 'below_threshold'
    | null;
};

export type BasketballRankingPreview = {
  configurationId: string | null;
  version: string | null;
  previewUser?: { id: string; email?: string | null };
  topMatches: BasketballRankingGame[];
  groups: {
    league: BasketballRankingGame['league'];
    matches: BasketballRankingPreviewGame[];
  }[];
};
