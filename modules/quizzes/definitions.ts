import type { QuizDefinition } from '@/modules/quizzes/types';

/**
 * Stores the four imported SirBro quizzes in one normalized lookup map.
 */
export const QUIZ_DEFINITIONS: Record<string, QuizDefinition> = {
  'tactical-identity': {
    slug: 'tactical-identity',
    locale: 'all',
    title: 'Tactical Identity',
    hubSubtitle: 'What kind of football thinker are you?',
    hubStatLine: '10 Questions · 3 Archetypes',
    eyebrow: 'SirBro Presents',
    liveBadgeLabel: 'Live Quiz',
    heroTitlePrimary: 'Tactical',
    heroTitleAccent: 'Identity',
    landingDescription: '10 questions. 3 archetypes. One tactical DNA.',
    landingEmphasis: 'Where do you stand?',
    landingStats: [
      { value: '10', label: 'Questions' },
      { value: '3', label: 'Archetypes' },
      { value: '50K+', label: 'Players' },
    ],
    questionnaireLabel: 'Tactical Quiz',
    startButtonLabel: 'Start Quiz',
    nextButtonLabel: 'Next',
    finishButtonLabel: 'Reveal Identity',
    resultHeading: 'Your Tactical Identity',
    shareCardLabel: 'SirBro × Tactical ID',
    shareFileBasename: 'sirbro-tactical-identity',
    shareCallToActionLabel: 'Join 50,000+ tactical minds on SirBro',
    shareCallToActionUrl: 'https://sirbro.com/download',
    retakeButtonLabel: 'Retake Quiz',
    shareButtonLabel: 'Share Result',
    axes: [
      {
        key: 'purist',
        label: 'Purist',
        shortLabel: 'PUR',
        corner: 'top',
        hint: 'Guardiola',
        zoneLabel: 'ARTIST',
      },
      {
        key: 'heavyMetal',
        label: 'Heavy Metal',
        shortLabel: 'HVM',
        corner: 'bottom-left',
        hint: 'Klopp',
        zoneLabel: 'DESTROYER',
      },
      {
        key: 'pragmatist',
        label: 'Pragmatist',
        shortLabel: 'PRA',
        corner: 'bottom-right',
        hint: 'Mourinho',
        zoneLabel: 'ARCHITECT',
      },
    ],
    plot: {
      centerLabel: 'SPECIALIST',
    },
    questions: [
      {
        id: 1,
        text: "What's your football philosophy?",
        labelLeft: 'Win at all costs',
        labelRight: 'Win with beautiful football',
        weights: { purist: [0, 1], pragmatist: [1, 0], heavyMetal: [0.3, 0.2] },
      },
      {
        id: 2,
        text: 'How does your backline defend?',
        labelLeft: 'Parking the bus',
        labelRight: 'High-line pressing',
        weights: { purist: [0, 0.4], pragmatist: [1, 0], heavyMetal: [0.1, 1] },
      },
      {
        id: 3,
        text: "Who's your ideal playmaker?",
        labelLeft: 'Patient number 10',
        labelRight: 'Box-to-box engine',
        weights: {
          purist: [1, 0.1],
          pragmatist: [0.2, 0.3],
          heavyMetal: [0, 1],
        },
      },
      {
        id: 4,
        text: "What's your transfer strategy?",
        labelLeft: 'Proven veterans',
        labelRight: 'Hidden data gems',
        weights: {
          purist: [0.2, 0.6],
          pragmatist: [1, 0.5],
          heavyMetal: [0.1, 0.3],
        },
      },
      {
        id: 5,
        text: 'How do you like your victories?',
        labelLeft: 'Clinical 1-0 wins',
        labelRight: 'Chaotic 4-3 thrillers',
        weights: { purist: [0.1, 0.3], pragmatist: [1, 0], heavyMetal: [0, 1] },
      },
      {
        id: 6,
        text: 'How does your midfield operate?',
        labelLeft: 'Possession control',
        labelRight: 'Direct long balls',
        weights: {
          purist: [1, 0],
          pragmatist: [0.3, 0.8],
          heavyMetal: [0, 0.6],
        },
      },
      {
        id: 7,
        text: 'You just lost the ball. What happens next?',
        labelLeft: 'Drop deep and regroup',
        labelRight: 'Counter-press immediately',
        weights: { purist: [0.3, 0.2], pragmatist: [1, 0], heavyMetal: [0, 1] },
      },
      {
        id: 8,
        text: 'How do you evaluate modern football?',
        labelLeft: 'Focus on xG stats',
        labelRight: 'Eye-test and passion',
        weights: {
          purist: [0.5, 0.3],
          pragmatist: [0.7, 0.1],
          heavyMetal: [0, 1],
        },
      },
      {
        id: 9,
        text: "It's the 60th minute. Your plan isn't working.",
        labelLeft: "Late tactical tweak at 80'",
        labelRight: 'Early impact sub now',
        weights: {
          purist: [0.4, 0.2],
          pragmatist: [1, 0.3],
          heavyMetal: [0, 1],
        },
      },
      {
        id: 10,
        text: 'What does your dream stadium look like?',
        labelLeft: 'Traditional fortress',
        labelRight: 'Modern data-optimized arena',
        weights: {
          purist: [0.3, 0.5],
          pragmatist: [0.5, 0.8],
          heavyMetal: [1, 0.1],
        },
      },
    ],
    results: [
      {
        key: 'specialist',
        slug: 'specialist',
        name: 'The Specialist',
        description:
          "You're the tactical chameleon every board secretly wants. You'd give a TED talk on gegenpressing, then park the bus in a cup final without blinking.",
      },
      {
        key: 'purist',
        slug: 'purist',
        name: 'The Purist',
        description:
          "You'd rather lose 5-4 playing tiki-taka than win 1-0 with a long ball. Your ideal Saturday is watching Cruyff highlights while polishing a possession-stats spreadsheet.",
      },
      {
        key: 'pragmatist',
        slug: 'pragmatist',
        name: 'The Pragmatist',
        description:
          "Results are your religion and clean sheets are your hymns. You'd play five centre-backs in a World Cup final and sleep like a baby afterwards.",
      },
      {
        key: 'heavyMetal',
        slug: 'heavy-metal',
        name: 'The Heavy Metal',
        description:
          "Your idea of a defensive strategy is scoring more goals than you concede. You'd counter-press at your own wedding if someone intercepted the cake.",
      },
    ],
    balanceThreshold: 10,
    resultRules: [
      { resultKey: 'specialist', balanced: true },
      { resultKey: 'purist', dominantAxisKey: 'purist' },
      { resultKey: 'pragmatist', dominantAxisKey: 'pragmatist' },
      { resultKey: 'heavyMetal', dominantAxisKey: 'heavyMetal' },
    ],
  },
  'fan-archetype': {
    slug: 'fan-archetype',
    locale: 'all',
    title: 'Fan Archetype',
    hubSubtitle: 'Analyst, Ultra, or Glory Hunter?',
    hubStatLine: '6 Questions · 3 Archetypes',
    eyebrow: 'SirBro Presents',
    liveBadgeLabel: 'Live Quiz',
    heroTitlePrimary: 'Fan',
    heroTitleAccent: 'Archetype',
    landingDescription: '6 questions. 3 fan types. One identity.',
    landingEmphasis: 'Are you an Analyst, an Ultra, or a Glory Hunter?',
    landingStats: [
      { value: '6', label: 'Questions' },
      { value: '3', label: 'Archetypes' },
      { value: '50K+', label: 'Fans' },
    ],
    questionnaireLabel: 'Fan Archetype',
    startButtonLabel: 'Start Quiz',
    nextButtonLabel: 'Next',
    finishButtonLabel: 'Reveal Archetype',
    resultHeading: 'Your Fan Archetype',
    shareCardLabel: 'SirBro × Fan Archetype',
    shareFileBasename: 'sirbro-fan-archetype',
    shareCallToActionLabel: 'Join 50,000+ football obsessives on SirBro',
    shareCallToActionUrl: 'https://sirbro.com/download',
    retakeButtonLabel: 'Retake Quiz',
    shareButtonLabel: 'Share Result',
    axes: [
      {
        key: 'analyst',
        label: 'Analyst',
        shortLabel: 'ANL',
        corner: 'top',
        hint: 'Stats & xG',
        zoneLabel: 'NERD',
      },
      {
        key: 'ultra',
        label: 'Ultra',
        shortLabel: 'ULT',
        corner: 'bottom-left',
        hint: 'Loyalty & Atmosphere',
        zoneLabel: 'FANATIC',
      },
      {
        key: 'gloryHunter',
        label: 'Glory Hunter',
        shortLabel: 'GLR',
        corner: 'bottom-right',
        hint: 'Stars & Trophies',
        zoneLabel: 'STAR CHASER',
      },
    ],
    plot: {
      centerLabel: 'COMPLETE FAN',
    },
    questions: [
      {
        id: 1,
        text: 'Why do you support your team?',
        labelLeft: 'Local heritage & family tradition',
        labelRight: 'Global success & star power',
        weights: { analyst: [0.2, 0.3], ultra: [1, 0], gloryHunter: [0, 1] },
      },
      {
        id: 2,
        text: 'What do you do right after a match?',
        labelLeft: 'Watch fan-cams & celebrations',
        labelRight: 'Analyze heatmaps & xG data',
        weights: { analyst: [0, 1], ultra: [1, 0], gloryHunter: [0.3, 0.2] },
      },
      {
        id: 3,
        text: 'How do you consume transfer news?',
        labelLeft: 'Fabrizio Romano tweets & drama',
        labelRight: 'Scout reports & data profiles',
        weights: { analyst: [0, 1], ultra: [0.4, 0.1], gloryHunter: [1, 0.2] },
      },
      {
        id: 4,
        text: 'A new player joins your club. What matters most?',
        labelLeft: 'Jersey sales & vibes',
        labelRight: 'Progressive passing stats',
        weights: { analyst: [0, 1], ultra: [0.3, 0.1], gloryHunter: [1, 0] },
      },
      {
        id: 5,
        text: 'What is football really about?',
        labelLeft: 'The soul of the stadium',
        labelRight: 'Entertainment & global brand',
        weights: { analyst: [0.2, 0.3], ultra: [1, 0], gloryHunter: [0, 1] },
      },
      {
        id: 6,
        text: 'What makes a player a true legend?',
        labelLeft: 'One-club loyalty for life',
        labelRight: "Ballon d'Or & trophy hauls",
        weights: { analyst: [0.2, 0.4], ultra: [1, 0], gloryHunter: [0, 1] },
      },
    ],
    results: [
      {
        key: 'completeFan',
        slug: 'complete-fan',
        name: 'The Complete Fan',
        description:
          "You live in the stands, crunch the numbers, AND own every shirt. You're the rare breed who can chant for 90 minutes then debate expected threat models in the car park.",
      },
      {
        key: 'dataDrivenDiehard',
        slug: 'data-driven-diehard',
        name: 'The Data-Driven Diehard',
        description:
          "You bleed your club's colors but back it up with spreadsheets. Your matchday ritual is half terrace singing, half live xG tracking on your phone.",
      },
      {
        key: 'analyst',
        slug: 'analyst',
        name: 'The Analyst',
        description:
          "You see the game in numbers. While others celebrate the goal, you're already checking the xG timeline. Your browser has more football data tabs than a scouting department.",
      },
      {
        key: 'educatedUltra',
        slug: 'educated-ultra',
        name: 'The Educated Ultra',
        description:
          "You bring the noise AND the knowledge. You'll out-chant any stand, then calmly explain why the pressing trigger was wrong using StatsBomb data.",
      },
      {
        key: 'ultra',
        slug: 'ultra',
        name: 'The Ultra',
        description:
          "Football isn't a sport to you — it's a religion. You were born into this club and you'll leave in a coffin draped in its colors. Atmosphere is everything.",
      },
      {
        key: 'bandwagonKing',
        slug: 'bandwagon-king',
        name: 'The Bandwagon King',
        description:
          "You follow the bright lights but you've got just enough local loyalty to defend your choices. Your wardrobe is 40% kits from clubs you've 'always supported.'",
      },
      {
        key: 'gloryHunter',
        slug: 'glory-hunter',
        name: 'The Glory Hunter',
        description:
          "If they're winning, you're watching. Your favorite team is whoever just signed the biggest star. You've got three 'main clubs' and zero shame about it.",
      },
    ],
    balanceThreshold: 10,
    resultRules: [
      { resultKey: 'completeFan', balanced: true },
      {
        resultKey: 'dataDrivenDiehard',
        dominantAxisKey: 'analyst',
        secondaryAxisKey: 'ultra',
        secondaryMinScore: 25,
      },
      { resultKey: 'analyst', dominantAxisKey: 'analyst' },
      {
        resultKey: 'educatedUltra',
        dominantAxisKey: 'ultra',
        secondaryAxisKey: 'analyst',
        secondaryMinScore: 25,
      },
      { resultKey: 'ultra', dominantAxisKey: 'ultra' },
      {
        resultKey: 'bandwagonKing',
        dominantAxisKey: 'gloryHunter',
        secondaryAxisKey: 'ultra',
        secondaryMinScore: 25,
      },
      { resultKey: 'gloryHunter', dominantAxisKey: 'gloryHunter' },
    ],
  },
  'transfer-guru': {
    slug: 'transfer-guru',
    locale: 'all',
    title: 'Transfer Guru',
    hubSubtitle: 'Moneyballer, Academy Purist, or Galactico Hunter?',
    hubStatLine: '6 Questions · 3 Philosophies',
    eyebrow: 'SirBro Presents',
    liveBadgeLabel: 'Live Quiz',
    heroTitlePrimary: 'Transfer',
    heroTitleAccent: 'Guru',
    landingDescription: '6 questions. 3 philosophies. One recruitment DNA.',
    landingEmphasis: 'Moneyballer, Academy Purist, or Galactico Hunter?',
    landingStats: [
      { value: '6', label: 'Questions' },
      { value: '3', label: 'Philosophies' },
      { value: '50K+', label: 'Directors' },
    ],
    questionnaireLabel: 'Transfer Guru',
    startButtonLabel: 'Start Quiz',
    nextButtonLabel: 'Next',
    finishButtonLabel: 'Reveal Result',
    resultHeading: 'Your Recruitment Philosophy',
    shareCardLabel: 'SirBro × Transfer Guru',
    shareFileBasename: 'sirbro-transfer-guru',
    shareCallToActionLabel: 'Join 50,000+ recruitment minds on SirBro',
    shareCallToActionUrl: 'https://sirbro.com/download',
    retakeButtonLabel: 'Retake Quiz',
    shareButtonLabel: 'Share Result',
    axes: [
      {
        key: 'moneyball',
        label: 'Moneyballer',
        shortLabel: 'MNY',
        corner: 'top',
        hint: 'Data & Value',
        zoneLabel: 'SPREADSHEET',
      },
      {
        key: 'academy',
        label: 'Academy',
        shortLabel: 'ACA',
        corner: 'bottom-left',
        hint: 'Youth & Loyalty',
        zoneLabel: 'YOUTH',
      },
      {
        key: 'galactico',
        label: 'Galactico',
        shortLabel: 'GAL',
        corner: 'bottom-right',
        hint: 'Stars & Trophies',
        zoneLabel: 'BIG SPENDER',
      },
    ],
    plot: {
      centerLabel: 'BALANCED',
    },
    questions: [
      {
        id: 1,
        text: 'Time to sign a new star. Who do you go for?',
        labelLeft: '19-year-old with elite xG stats',
        labelRight: 'Proven 28-year-old superstar',
        weights: { moneyball: [1, 0], academy: [0.3, 0.1], galactico: [0, 1] },
      },
      {
        id: 2,
        text: "You have £100m to spend. What's the plan?",
        labelLeft: 'Three high-potential academy stars',
        labelRight: 'One world-class marquee signing',
        weights: { moneyball: [0.3, 0.2], academy: [1, 0], galactico: [0, 1] },
      },
      {
        id: 3,
        text: 'Where do you find your next signing?',
        labelLeft: "Your eyes and the club's history",
        labelRight: 'Advanced data algorithms',
        weights: { moneyball: [0, 1], academy: [1, 0], galactico: [0.2, 0.2] },
      },
      {
        id: 4,
        text: 'What does your ideal squad look like?',
        labelLeft: 'Loyal local legends',
        labelRight: 'Global icons and influencers',
        weights: { moneyball: [0.2, 0.3], academy: [1, 0], galactico: [0, 1] },
      },
      {
        id: 5,
        text: "A star player's value peaks. What do you do?",
        labelLeft: 'Keep them until they retire at the club',
        labelRight: 'Sell and reinvest at peak value',
        weights: { moneyball: [0, 1], academy: [1, 0], galactico: [0.3, 0.1] },
      },
      {
        id: 6,
        text: 'Describe your ideal signing.',
        labelLeft: 'Statistically underrated gem from the 2nd division',
        labelRight: "Ballon d'Or contender",
        weights: { moneyball: [1, 0], academy: [0.2, 0.1], galactico: [0, 1] },
      },
    ],
    results: [
      {
        key: 'balancedDirector',
        slug: 'balanced-director',
        name: 'The Balanced Director',
        description:
          "You play all the angles — data, youth, and star power. Your boardroom has a spreadsheet, a scouting map, AND a poster of Zidane. You're basically Ed Woodward if Ed Woodward was actually competent.",
      },
      {
        key: 'spreadsheetScoutHybrid',
        slug: 'spreadsheet-scout-plus',
        name: 'The Spreadsheet Scout',
        description:
          'You find diamonds in the rough and polish them in-house. Your laptop has more tabs open than a library — half scouting databases, half youth development plans.',
      },
      {
        key: 'spreadsheetScout',
        slug: 'spreadsheet-scout',
        name: 'The Spreadsheet Scout',
        description:
          "You don't watch highlights — you watch expected goals charts. While others chase names on the back of shirts, you chase value per 90. Your transfer budget has a better ROI than the stock market.",
      },
      {
        key: 'youthVisionaryHybrid',
        slug: 'youth-visionary-plus',
        name: 'The Youth Visionary',
        description:
          "You grow your own and back it up with data. Your academy has a better scouting network than most first teams. Every youth graduate's xG is tattooed on your brain.",
      },
      {
        key: 'youthVisionary',
        slug: 'youth-visionary',
        name: 'The Youth Visionary',
        description:
          "Why buy when you can build? Your transfer window is just promoting another 17-year-old from the U-23s. Your idea of a blockbuster signing is renewing a homegrown player's contract.",
      },
      {
        key: 'bigSpenderHybrid',
        slug: 'big-spender-plus',
        name: 'The Big Spender',
        description:
          "You want the biggest names but you've got a soft spot for a local lad. Your team sheet reads like a FIFA Ultimate Team with one sentimental pick in the squad.",
      },
      {
        key: 'bigSpender',
        slug: 'big-spender',
        name: 'The Big Spender',
        description:
          "Go big or go home. If they haven't been on the cover of FIFA, you're not interested. Your transfer budget looks like a phone number and your wage bill makes accountants cry.",
      },
    ],
    balanceThreshold: 10,
    resultRules: [
      { resultKey: 'balancedDirector', balanced: true },
      {
        resultKey: 'spreadsheetScoutHybrid',
        dominantAxisKey: 'moneyball',
        secondaryAxisKey: 'academy',
        secondaryMinScore: 25,
      },
      { resultKey: 'spreadsheetScout', dominantAxisKey: 'moneyball' },
      {
        resultKey: 'youthVisionaryHybrid',
        dominantAxisKey: 'academy',
        secondaryAxisKey: 'moneyball',
        secondaryMinScore: 25,
      },
      { resultKey: 'youthVisionary', dominantAxisKey: 'academy' },
      {
        resultKey: 'bigSpenderHybrid',
        dominantAxisKey: 'galactico',
        secondaryAxisKey: 'academy',
        secondaryMinScore: 25,
      },
      { resultKey: 'bigSpender', dominantAxisKey: 'galactico' },
    ],
  },
  'goat-philosophy': {
    slug: 'goat-philosophy',
    locale: 'all',
    title: 'G.O.A.T. Philosophy',
    hubSubtitle: 'Statistician, Artist, or Winner?',
    hubStatLine: '6 Questions · 3 Philosophies',
    eyebrow: 'SirBro Presents',
    liveBadgeLabel: 'Live Quiz',
    heroTitlePrimary: 'G.O.A.T.',
    heroTitleAccent: 'Philosophy',
    landingDescription: '6 questions. 3 philosophies. One G.O.A.T. DNA.',
    landingEmphasis: 'Statistician, Artist, or Winner?',
    landingStats: [
      { value: '6', label: 'Questions' },
      { value: '3', label: 'Philosophies' },
      { value: '50K+', label: 'Debaters' },
    ],
    questionnaireLabel: 'G.O.A.T. Philosophy',
    startButtonLabel: 'Start Quiz',
    nextButtonLabel: 'Next',
    finishButtonLabel: 'Reveal Result',
    resultHeading: 'Your G.O.A.T. Philosophy',
    shareCardLabel: 'SirBro × G.O.A.T. Philosophy',
    shareFileBasename: 'sirbro-goat-philosophy',
    shareCallToActionLabel: 'Join 50,000+ GOAT debaters on SirBro',
    shareCallToActionUrl: 'https://sirbro.com/download',
    retakeButtonLabel: 'Retake Quiz',
    shareButtonLabel: 'Share Result',
    axes: [
      {
        key: 'stats',
        label: 'Statistician',
        shortLabel: 'STA',
        corner: 'top',
        hint: 'Ronaldo',
        zoneLabel: 'RECORD',
      },
      {
        key: 'artist',
        label: 'Artist',
        shortLabel: 'ART',
        corner: 'bottom-left',
        hint: 'Zidane',
        zoneLabel: 'ROMANTIC',
      },
      {
        key: 'winner',
        label: 'Winner',
        shortLabel: 'WIN',
        corner: 'bottom-right',
        hint: 'Pele',
        zoneLabel: 'TROPHY',
      },
    ],
    plot: {
      centerLabel: 'LEGACY',
    },
    questions: [
      {
        id: 1,
        text: "What's more impressive for a G.O.A.T.?",
        labelLeft: 'Score 30 goals for 20 years straight',
        labelRight: '3 years of untouchable genius',
        weights: { stats: [1, 0], artist: [0, 1], winner: [0.2, 0.2] },
      },
      {
        id: 2,
        text: 'How important is the World Cup?',
        labelLeft: 'Just a 7-game tournament',
        labelRight: 'The ultimate requirement for greatness',
        weights: { stats: [1, 0], artist: [0.2, 0.2], winner: [0, 1] },
      },
      {
        id: 3,
        text: 'What makes a player special?',
        labelLeft: 'A freak of nature — speed, power, endurance',
        labelRight: 'A master of the ball — touch, vision, flair',
        weights: { stats: [1, 0], artist: [0, 1], winner: [0.2, 0.2] },
      },
      {
        id: 4,
        text: "What's the greater legacy?",
        labelLeft: 'Score a hat-trick in a World Cup final',
        labelRight: 'Change the way the game is played forever',
        weights: { stats: [0.2, 0.1], artist: [0, 1], winner: [1, 0] },
      },
      {
        id: 5,
        text: 'Consistency vs. Peak — what matters more?',
        labelLeft: 'Machine-like consistency, year after year',
        labelRight: 'Moments of pure, unrepeatable magic',
        weights: { stats: [1, 0], artist: [0, 1], winner: [0.2, 0.2] },
      },
      {
        id: 6,
        text: 'The ultimate G.O.A.T. question:',
        labelLeft: 'The one with the most medals and trophies',
        labelRight: 'The one who was the most skilled player ever',
        weights: { stats: [0.2, 0.1], artist: [0, 1], winner: [1, 0] },
      },
    ],
    results: [
      {
        key: 'legacyJudge',
        slug: 'legacy-judge',
        name: 'The Legacy Judge',
        description:
          "You weigh it all — the stats, the skill, and the silverware. You don't pick sides in the GOAT debate, you write 3,000-word threads about it. Your group chat fears your voice notes.",
      },
      {
        key: 'recordBreakerRomantic',
        slug: 'record-breaker-romantic',
        name: 'The Record Breaker',
        description:
          "You love the numbers but you appreciate the flair. Your GOAT has a highlights reel AND a Wikipedia page that crashes your browser. Ronaldo's goal tally is your love language.",
      },
      {
        key: 'recordBreaker',
        slug: 'record-breaker',
        name: 'The Record Breaker',
        description:
          "Goals, assists, appearances — if it's not in the spreadsheet, it didn't happen. Your GOAT is whoever has the biggest numbers. You've memorized career stats the way others memorize song lyrics.",
      },
      {
        key: 'footballRomanticStats',
        slug: 'football-romantic-plus',
        name: 'The Football Romantic',
        description:
          "You love the beautiful game and respect the receipts. Your GOAT nutmegs defenders AND tops the assists chart. Zidane's Bernabeu volley lives rent-free in your head.",
      },
      {
        key: 'footballRomantic',
        slug: 'football-romantic',
        name: 'The Football Romantic',
        description:
          "Trophies are temporary, but a Ronaldinho elastico is forever. Your GOAT is whoever made you fall in love with football. You've rewatched that one YouTube compilation 400 times.",
      },
      {
        key: 'trophyCollectorArtist',
        slug: 'trophy-collector-plus',
        name: 'The Trophy Collector',
        description:
          "Trophies come first, but you still want them won with style. Your GOAT lifts the World Cup AND does a rainbow flick in the final. You'd pick Messi — but only because of 2022.",
      },
      {
        key: 'trophyCollector',
        slug: 'trophy-collector',
        name: 'The Trophy Collector',
        description:
          "No trophy, no talk. Your GOAT's Wikipedia page is just a list of medals. You end every debate with 'but how many World Cups?' and walk away before they can answer.",
      },
    ],
    balanceThreshold: 10,
    resultRules: [
      { resultKey: 'legacyJudge', balanced: true },
      {
        resultKey: 'recordBreakerRomantic',
        dominantAxisKey: 'stats',
        secondaryAxisKey: 'artist',
        secondaryMinScore: 25,
      },
      { resultKey: 'recordBreaker', dominantAxisKey: 'stats' },
      {
        resultKey: 'footballRomanticStats',
        dominantAxisKey: 'artist',
        secondaryAxisKey: 'stats',
        secondaryMinScore: 25,
      },
      { resultKey: 'footballRomantic', dominantAxisKey: 'artist' },
      {
        resultKey: 'trophyCollectorArtist',
        dominantAxisKey: 'winner',
        secondaryAxisKey: 'artist',
        secondaryMinScore: 25,
      },
      { resultKey: 'trophyCollector', dominantAxisKey: 'winner' },
    ],
  },
};

/**
 * Lists quiz definitions in the donor ordering used by the public hub.
 */
export function listQuizDefinitions(): QuizDefinition[] {
  return Object.values(QUIZ_DEFINITIONS);
}

/**
 * Resolves one quiz definition by its public slug.
 */
export function getQuizDefinition(slug: string): QuizDefinition | null {
  return QUIZ_DEFINITIONS[slug] ?? null;
}
