export type BasketballLeagueTier = 1 | 2 | 3 | 4;

export type BasketballLeague = {
  id: number;
  name: string;
  logoUrl: string | null;
};

export type BasketballRankingConfiguration = {
  id: string;
  version: string;
  leagueTiers: Record<string, BasketballLeagueTier>;
  active: boolean;
  createdAt: string;
};

export type BasketballRankingDraft = Pick<
  BasketballRankingConfiguration,
  'version' | 'leagueTiers'
> & { reason: string };

export type BasketballRankingPreviewInput = {
  date: string;
  timezone: string;
  configurationId?: string;
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
  topMatches: BasketballRankingGame[];
  groups: {
    league: BasketballRankingGame['league'];
    matches: BasketballRankingPreviewGame[];
  }[];
};
