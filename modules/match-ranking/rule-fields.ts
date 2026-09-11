export interface RankingRuleField {
  path: string;
  label: string;
  help: string;
  min?: number;
  max?: number;
  integer?: boolean;
}
export const rankingRuleGroups: {
  title: string;
  fields: RankingRuleField[];
}[] = [
  {
    title: 'Competition importance · B',
    fields: [
      ...[1, 2, 3, 4].map((category) => ({
        path: `categoryBaseline.${category}`,
        label: `Category ${category} base points`,
        help: `Base importance for category ${category}. Raises both Top Matches importance and league order.`,
      })),
      {
        path: 'unknownCategoryBaseline',
        label: 'Unknown category base points',
        help: 'Base points when the competition has no recognized category.',
      },
    ],
  },
  {
    title: 'Country relevance · L',
    fields: [
      {
        path: 'countryRelevance.domestic',
        label: 'Domestic competition',
        help: 'Points when a domestic competition belongs to the user’s ranking country. First matching country rule wins; bonuses do not stack.',
      },
      {
        path: 'countryRelevance.nationalTeam',
        label: 'National team',
        help: 'Points when the user’s senior national team participates, unless the domestic rule already matched.',
      },
      {
        path: 'countryRelevance.participantClub',
        label: 'Club from the user’s country',
        help: 'Points for a continental/global competition with a club from the ranking country, unless an earlier rule matched.',
      },
      {
        path: 'countryRelevance.confederation',
        label: 'Same confederation',
        help: 'Points for a continental competition in the user’s confederation, if no earlier country rule matched. Unknown user country gives L = 0.',
      },
    ],
  },
  {
    title: 'Team prominence · T',
    fields: [
      {
        path: 'teamProminence.cap',
        label: 'Team bonus cap',
        help: 'Maximum T after taking the higher team prominence and adding the both-elite bonus.',
        min: 0,
      },
      {
        path: 'teamProminence.bothEliteBonus',
        label: 'Both elite bonus',
        help: 'Extra points when both normalized team values equal the elite value.',
      },
      {
        path: 'teamProminence.eliteValue',
        label: 'Elite comparison value',
        help: 'Both team values must equal this number to receive the both-elite bonus. Team prominence is classified as 0, 10 or 20 in the Team prominence tab.',
      },
    ],
  },
  {
    title: 'Tournament stage · S',
    fields: [
      ...[
        'final',
        'semifinal',
        'quarterfinal',
        'playoff',
        'regular',
        'unknown',
      ].map((stage) => ({
        path: `stageBonus.${stage}`,
        label: `${stage[0].toUpperCase()}${stage.slice(1)} stage points`,
        help: `Points for the ${stage} stage, multiplied by the competition category factor. Unknown is used when no stage mapping exists.`,
      })),
      ...[1, 2, 3, 4].map((category) => ({
        path: `categoryStageFactor.${category}`,
        label: `Category ${category} stage factor`,
        help: `Multiplies stage points for category ${category}. For example, 0.5 awards half the stage points.`,
      })),
      {
        path: 'unknownCategoryStageFactor',
        label: 'Unknown category stage factor',
        help: 'Stage multiplier when the competition category is missing or unrecognized.',
      },
    ],
  },
  {
    title: 'Timing · U',
    fields: [
      {
        path: 'timing.live',
        label: 'Live match points',
        help: 'Today only: points for live, half-time, extra-time and penalties.',
      },
      {
        path: 'timing.upcoming',
        label: 'Starting soon points',
        help: 'Today only: points for a scheduled match inside the upcoming window.',
      },
      {
        path: 'timing.completed',
        label: 'Completed match points',
        help: 'Today only: score adjustment for completed matches. A negative number lowers their position.',
      },
      {
        path: 'timing.upcomingMinutes',
        label: 'Upcoming window (minutes)',
        help: 'Scheduled kickoff must be between now and this many minutes ahead, inclusive.',
        min: 0,
      },
    ],
  },
  {
    title: 'Selection and league order',
    fields: [
      {
        path: 'editorialAdjustmentCap',
        label: 'Editorial adjustment cap · E',
        help: 'Clamps an active fixture adjustment between minus and plus this value. It changes Top score, not importance or threshold eligibility.',
        min: 0,
      },
      {
        path: 'topImportanceThreshold',
        label: 'Top importance threshold',
        help: 'Ordinary matches need at least this importance. Sustained interest bypasses this threshold; pins also bypass it. Status and explicit exclusions still apply.',
      },
      {
        path: 'topMatchLimit',
        label: 'Top Matches limit',
        help: 'Maximum number of selected Top Matches.',
        min: 1,
        max: 20,
        integer: true,
      },
      {
        path: 'competitionCap',
        label: 'Matches per competition',
        help: 'Initial per-competition limit. Relaxed only when needed to fill remaining Top Matches places.',
        min: 1,
        max: 20,
        integer: true,
      },
      {
        path: 'groupComponentCap',
        label: 'League component cap',
        help: 'Caps the best stage-plus-team contribution to league order.',
        min: 0,
      },
      {
        path: 'groupTeamFactor',
        label: 'League team factor',
        help: 'Multiplies T inside the league-order formula. 0.5 counts half the team bonus.',
      },
    ],
  },
  {
    title: 'Personal interest · P',
    fields: [
      {
        path: 'interest.windowDays',
        label: 'Interest window (days)',
        help: 'How far back match-opening history is used: 1–30 days, default 30. This changes the ranking window, not event storage retention. Retention is configured separately on the backend (default 45 days). Reducing this window also lowers recent days and minimum days if necessary.',
        min: 1,
        max: 30,
        integer: true,
      },
      {
        path: 'interest.recentDays',
        label: 'Recent window (days)',
        help: 'Openings within this period receive the recent weight. Must not exceed the interest window.',
        min: 1,
        integer: true,
      },
      {
        path: 'interest.recentWeight',
        label: 'Recent opening weight',
        help: 'Weight of an opening inside the recent window. Repeated openings of one fixture on one UTC day count once.',
        min: Number.MIN_VALUE,
      },
      {
        path: 'interest.olderWeight',
        label: 'Older opening weight',
        help: 'Weight of an older opening still inside the interest window.',
        min: Number.MIN_VALUE,
      },
      {
        path: 'interest.teamFactor',
        label: 'Interest team factor',
        help: 'Multiplies opening weight for each participating team; the competition receives the full weight.',
        min: Number.MIN_VALUE,
      },
      {
        path: 'interest.minimumFixtures',
        label: 'Minimum distinct fixtures',
        help: 'An entity needs this many distinct opened fixtures to qualify for sustained interest.',
        min: 1,
        integer: true,
      },
      {
        path: 'interest.minimumDays',
        label: 'Minimum distinct days',
        help: 'An entity needs openings on this many UTC days to qualify. Must not exceed window days plus one.',
        min: 1,
        integer: true,
      },
      {
        path: 'interest.multiplier',
        label: 'Interest score multiplier',
        help: 'Multiplies H, the largest qualifying interest weight across the competition and both teams.',
        min: Number.MIN_VALUE,
      },
      {
        path: 'interest.bonusCap',
        label: 'Interest bonus cap',
        help: 'Maximum personal-interest points P added to the Top score.',
        min: Number.MIN_VALUE,
      },
    ],
  },
];

export function readRule(
  rules: Record<string, unknown>,
  path: string
): unknown {
  const [group, key] = path.split('.');
  return key
    ? (rules[group] as Record<string, unknown> | undefined)?.[key]
    : rules[group];
}
export function mergeRankingRules(
  defaults: Record<string, unknown>,
  overrides: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...defaults, ...overrides };
  for (const [key, value] of Object.entries(defaults)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = {
        ...value,
        ...(overrides[key] as Record<string, unknown> | undefined),
      };
    }
  }
  return result;
}
export function writeRule(
  rules: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const [group, key] = path.split('.');
  return key
    ? {
        ...rules,
        [group]: { ...(rules[group] as Record<string, unknown>), [key]: value },
      }
    : { ...rules, [group]: value };
}

/** Presets constrain operator input; existing valid custom values remain selectable. */
export function rankingRuleOptions(
  field: RankingRuleField,
  rules: Record<string, unknown>,
  initialRules: Record<string, unknown>,
  defaults: Record<string, unknown>
): number[] {
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const path = field.path;
  let values: number[];
  if (path === 'topMatchLimit' || path === 'competitionCap')
    values = range(1, 20);
  else if (path === 'interest.windowDays') values = range(1, 30);
  else if (path === 'interest.recentDays')
    values = range(1, Number(readRule(rules, 'interest.windowDays')));
  else if (path === 'interest.minimumDays')
    values = range(1, Number(readRule(rules, 'interest.windowDays')) + 1);
  else if (path === 'interest.minimumFixtures') values = range(1, 100);
  else if (path === 'timing.upcomingMinutes')
    values = [0, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 360, 720, 1440];
  else if (path === 'teamProminence.eliteValue') values = [0, 10, 20];
  else if (
    path.includes('Factor') ||
    path === 'interest.teamFactor' ||
    path.endsWith('Weight')
  )
    values = [0, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 10];
  else if (path === 'interest.multiplier')
    values = [0.1, 0.25, 0.5, 1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 100];
  else
    values = range(
      field.min !== undefined && field.min >= 0 ? Math.ceil(field.min) : -100,
      100
    );
  values.push(
    ...[initialRules, defaults]
      .map((source) => readRule(source, path))
      .filter((value): value is number => typeof value === 'number')
  );
  return [...new Set(values)]
    .filter((value) => {
      if (
        !Number.isFinite(value) ||
        (field.min !== undefined && value < field.min) ||
        (field.max !== undefined && value > field.max) ||
        (field.integer && !Number.isInteger(value))
      )
        return false;
      if (
        path === 'interest.recentDays' &&
        value > Number(readRule(rules, 'interest.windowDays'))
      )
        return false;
      if (
        path === 'interest.minimumDays' &&
        value > Number(readRule(rules, 'interest.windowDays')) + 1
      )
        return false;
      return true;
    })
    .sort((a, b) => a - b);
}
