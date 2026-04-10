import type { Locale } from '@/lib/i18n/config';

export interface HomepageLinkItem {
  label: string;
  href: string;
}

export interface HomepageFeaturePreview {
  title: string;
  description: string;
  accentLabel: string;
  accentValue: string;
  lines: string[];
}

export interface HomepageStep {
  step: string;
  title: string;
  description: string;
}

export interface HomepageTrustItem {
  title: string;
  description: string;
  href: string;
}

export interface HomepageActionCard {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}

export interface HomepageSeoEngineEntry {
  badge: string;
  name: string;
  value: string;
  outlook: string;
  href: string;
}

export interface HomepageSeoEngineLeague {
  label: string;
  standings: HomepageSeoEngineEntry[];
  topGoalscorers: HomepageSeoEngineEntry[];
  assists: HomepageSeoEngineEntry[];
}

export interface HomepageFaqItem {
  question: string;
  answer: string;
}

export interface HomepageContent {
  hero: {
    chips: string[];
    title: string;
    description: string;
    supportingText?: string;
    proof: string;
    trustLine?: string;
    openAppLabel: string;
    previewTitle: string;
    previewSubtitle: string;
    previewHighlights: Array<{ label: string; value: string }>;
    chatPrompt: string;
    fanArenaTitle: string;
    fanArenaCopy: string;
  };
  showcase: {
    eyebrow: string;
    title: string;
    description: string;
    items: HomepageFeaturePreview[];
  };
  methodology: {
    eyebrow: string;
    title: string;
    description: string;
    requiredCopy?: string;
    steps: HomepageStep[];
    trustItems: HomepageTrustItem[];
  };
  discovery: {
    eyebrow: string;
    title: string;
    description?: string;
    features?: string[];
    useCasesTitle?: string;
    useCases?: string[];
    topicLinks: HomepageLinkItem[];
    featuredInsight: HomepageActionCard;
    quiz: HomepageActionCard;
    seoEngine: {
      eyebrow: string;
      title: string;
      description: string;
      leagueLabels?: string[];
      note?: string;
      metricLabels: {
        standings: string;
        topGoalscorers: string;
        assists: string;
      };
      leagues: HomepageSeoEngineLeague[];
    };
  };
  faq: {
    eyebrow: string;
    title: string;
    description?: string;
    items: HomepageFaqItem[];
  };
  finalCta: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    secondaryStoreCtaLabel?: string;
  };
}

const homepageContent: Record<Locale, HomepageContent> = {
  en: {
    hero: {
      chips: ['AI football insights', 'Live match analysis'],
      title: 'AI Football Predictions, Insights & Match Analysis — Without the Noise',
      description:
        'Most people follow games. Few understand them. SirBro turns live match data, player form, and tactical context into clear, fast football insights.',
      proof:
        'Get AI-powered football and soccer predictions, match analysis, team stats, and real-time insights across top leagues including Premier League, La Liga, Serie A, Bundesliga, MLS, and more — all in one app.',
      trustLine:
        'For entertainment purposes only. We don’t take bets. We analyze the game.',
      openAppLabel: 'Open App',
      previewTitle: 'Live match outlook',
      previewSubtitle: 'Arsenal vs Liverpool',
      previewHighlights: [
        { label: 'Volatility', value: 'High' },
        { label: 'Lineup swing', value: '+12%' },
        { label: 'Momentum', value: 'Arsenal up' },
      ],
      chatPrompt: 'Who has the edge in the 2nd half?',
      fanArenaTitle: 'Fan Arena',
      fanArenaCopy:
        'Compete with friends, compare picks, and move up private leaderboards built around football signals.',
    },
    showcase: {
      eyebrow: 'What SirBro does',
      title: 'See the game before it unfolds',
      description:
        'Football is not random. It only looks that way if you don’t see the signals.',
      items: [
        {
          title: 'AI Football Predictions',
          description:
            'Get structured predictions based on data, not opinion — from safe scenarios to higher-risk outcomes.',
          accentLabel: 'Prediction engine',
          accentValue: 'Data-first',
          lines: ['Structured outcomes', 'Scenario-based reads', 'Opinion-free analysis'],
        },
        {
          title: 'Team & Player Analysis',
          description:
            'Understand form, performance trends, and tactical patterns across leagues and competitions.',
          accentLabel: 'Analysis layer',
          accentValue: 'Form + context',
          lines: ['Performance trends', 'Role context', 'Tactical patterns'],
        },
        {
          title: 'Fan Arena',
          description:
            'Turn football intelligence into social competition with streaks, ranks, and friends-only boards.',
          accentLabel: 'Leaderboard',
          accentValue: '#2 this week',
          lines: ['+18 confidence', '3 picks won', 'Friends league'],
        },
      ],
    },
    methodology: {
      eyebrow: 'How it works',
      title: 'How SirBro analyzes football matches',
      description:
        'We don’t guess. We process.',
      steps: [
        {
          step: '01',
          title: 'Detect the signal',
          description:
            'SirBro tracks match data, player form, lineup changes, and volatility patterns to identify what actually matters.',
        },
        {
          step: '02',
          title: 'Add football context',
          description:
            'Raw stats don’t win games. Context does. We translate data into tactical meaning and real match impact.',
        },
        {
          step: '03',
          title: 'Deliver clear insights',
          description:
            'You get structured, actionable insights — without scrolling through noise.',
        },
      ],
      trustItems: [
        {
          title: 'Methodology',
          description:
            'Our analysis combines historical data, live match signals, and structured modeling to detect patterns early.',
          href: '/methodology',
        },
        {
          title: 'Editorial Oversight',
          description:
            'Insights are reviewed and structured to remain consistent, clear, and useful.',
          href: '/editorial-policy',
        },
        {
          title: 'AI + Human Layer',
          description: 'AI processes scale. Human logic keeps it grounded.',
          href: '/ai-transparency',
        },
        {
          title: 'Transparency',
          description: 'No guarantees. No promises. Just analysis.',
          href: '/disclaimer',
        },
      ],
    },
    discovery: {
      eyebrow: 'Features',
      title: 'Everything you need for football insights in one place',
      features: [
        'AI-powered football predictions',
        'Live match tracking and timeline',
        'Team and player performance stats',
        'Tactical analysis and momentum indicators',
        'Daily match insights across top leagues',
        'Interactive chat for instant football questions',
        'Community discussions and match challenges',
      ],
      useCasesTitle: 'Who SirBro is for',
      useCases: [
        'Football fans who want deeper understanding',
        'Users looking for structured match insights',
        'Data-driven sports enthusiasts',
        'Casual fans who want faster answers',
        'Communities discussing matches in real time',
      ],
      topicLinks: [
        { label: 'Injury impact', href: '/topics/injury-impact' },
        { label: 'Lineup changes', href: '/topics/lineup-changes' },
        { label: 'Player form', href: '/topics/player-form' },
        { label: 'Tactical analysis', href: '/topics/tactical-analysis' },
        { label: 'Stats breakdowns', href: '/topics/stats-breakdowns' },
      ],
      featuredInsight: {
        eyebrow: 'Featured insight',
        title: 'How lineup shifts change match volatility before kickoff',
        description:
          'A fast read on injury impact, role replacements, and momentum scenarios that reshape the football outlook.',
        href: '/insights/lineup-shifts-change-match-volatility',
        ctaLabel: 'Read insight',
      },
      quiz: {
        eyebrow: 'Featured quiz',
        title: 'Tactical Identity: What kind of football thinker are you?',
        description:
          'A compact engagement card that keeps users on site and introduces the product tone with a lighter interaction.',
        href: '/quizzes/tactical-identity-football-thinker',
        ctaLabel: 'Start Quiz',
      },
      seoEngine: {
        eyebrow: 'Leagues',
        title: 'Coverage across the world’s top football and soccer leagues',
        description:
          'SirBro provides insights and analysis for:',
        note: 'And more — updated daily.',
        leagueLabels: [
          'Premier League',
          'La Liga',
          'Serie A',
          'Bundesliga',
          'Ligue 1',
          'Brasileirão',
          'Liga MX',
          'MLS',
          'UEFA competitions',
          'FIFA World Cup 2026',
        ],
        metricLabels: {
          standings: 'Standings',
          topGoalscorers: 'Top Goalscorers',
          assists: 'Assists',
        },
        leagues: [
          {
            label: 'EPL',
            standings: [
              { badge: 'LIV', name: 'Liverpool', value: '74 pts', outlook: 'Trending Up', href: '/teams/liverpool' },
              { badge: 'ARS', name: 'Arsenal', value: '71 pts', outlook: 'Stable', href: '/teams/arsenal' },
              { badge: 'MCI', name: 'Manchester City', value: '69 pts', outlook: 'Late Push', href: '/teams/manchester-city' },
              { badge: 'AVL', name: 'Aston Villa', value: '60 pts', outlook: 'Pressure On', href: '/teams/aston-villa' },
            ],
            topGoalscorers: [
              { badge: 'HAA', name: 'Erling Haaland', value: '23 goals', outlook: 'Hot Finishing', href: '/players/erling-haaland' },
              { badge: 'SAL', name: 'Mohamed Salah', value: '21 goals', outlook: 'Reliable Edge', href: '/players/mohamed-salah' },
              { badge: 'SON', name: 'Son Heung-min', value: '17 goals', outlook: 'Fast Break Threat', href: '/players/son-heung-min' },
              { badge: 'ISA', name: 'Alexander Isak', value: '16 goals', outlook: 'Trending Up', href: '/players/alexander-isak' },
            ],
            assists: [
              { badge: 'KDB', name: 'Kevin De Bruyne', value: '11 assists', outlook: 'Chance Engine', href: '/players/kevin-de-bruyne' },
              { badge: 'SAK', name: 'Bukayo Saka', value: '10 assists', outlook: 'Stable Supply', href: '/players/bukayo-saka' },
              { badge: 'TRA', name: 'Trent Alexander-Arnold', value: '9 assists', outlook: 'Crossing Surge', href: '/players/trent-alexander-arnold' },
              { badge: 'PAL', name: 'Cole Palmer', value: '8 assists', outlook: 'Creative Rise', href: '/players/cole-palmer' },
            ],
          },
          {
            label: 'La Liga',
            standings: [
              { badge: 'RMA', name: 'Real Madrid', value: '78 pts', outlook: 'Trending Up', href: '/teams/real-madrid' },
              { badge: 'BAR', name: 'Barcelona', value: '73 pts', outlook: 'Chasing Hard', href: '/teams/barcelona' },
              { badge: 'GIR', name: 'Girona', value: '67 pts', outlook: 'Holding Strong', href: '/teams/girona' },
              { badge: 'ATM', name: 'Atletico Madrid', value: '63 pts', outlook: 'Volatile', href: '/teams/atletico-madrid' },
            ],
            topGoalscorers: [
              { badge: 'BEL', name: 'Jude Bellingham', value: '18 goals', outlook: 'Late Runs', href: '/players/jude-bellingham' },
              { badge: 'LEW', name: 'Robert Lewandowski', value: '17 goals', outlook: 'Box Threat', href: '/players/robert-lewandowski' },
              { badge: 'DOV', name: 'Artem Dovbyk', value: '16 goals', outlook: 'Trending Up', href: '/players/artem-dovbyk' },
              { badge: 'MOR', name: 'Alvaro Morata', value: '15 goals', outlook: 'Stable', href: '/players/alvaro-morata' },
            ],
            assists: [
              { badge: 'GUN', name: 'Ilkay Gundogan', value: '9 assists', outlook: 'Control Layer', href: '/players/ilkay-gundogan' },
              { badge: 'VIN', name: 'Vinicius Junior', value: '8 assists', outlook: 'Transition Threat', href: '/players/vinicius-junior' },
              { badge: 'SAV', name: 'Aleix Garcia', value: '8 assists', outlook: 'Build-up Boost', href: '/players/aleix-garcia' },
              { badge: 'GRI', name: 'Antoine Griezmann', value: '7 assists', outlook: 'Stable Supply', href: '/players/antoine-griezmann' },
            ],
          },
          {
            label: 'Serie A',
            standings: [
              { badge: 'INT', name: 'Inter', value: '82 pts', outlook: 'Dominant', href: '/teams/inter' },
              { badge: 'MIL', name: 'Milan', value: '68 pts', outlook: 'Chasing Hard', href: '/teams/milan' },
              { badge: 'JUV', name: 'Juventus', value: '66 pts', outlook: 'Stable', href: '/teams/juventus' },
              { badge: 'BOL', name: 'Bologna', value: '60 pts', outlook: 'Trending Up', href: '/teams/bologna' },
            ],
            topGoalscorers: [
              { badge: 'MRT', name: 'Lautaro Martinez', value: '24 goals', outlook: 'Elite Form', href: '/players/lautaro-martinez' },
              { badge: 'VLA', name: 'Dusan Vlahovic', value: '17 goals', outlook: 'Box Threat', href: '/players/dusan-vlahovic' },
              { badge: 'GIR', name: 'Olivier Giroud', value: '14 goals', outlook: 'Reliable Edge', href: '/players/olivier-giroud' },
              { badge: 'OSA', name: 'Victor Osimhen', value: '13 goals', outlook: 'Volatile Return', href: '/players/victor-osimhen' },
            ],
            assists: [
              { badge: 'CAL', name: 'Hakan Calhanoglu', value: '9 assists', outlook: 'Set-Piece Edge', href: '/players/hakan-calhanoglu' },
              { badge: 'LEA', name: 'Rafael Leao', value: '8 assists', outlook: 'Wide Threat', href: '/players/rafael-leao' },
              { badge: 'DIM', name: 'Federico Dimarco', value: '7 assists', outlook: 'Crossing Surge', href: '/players/federico-dimarco' },
              { badge: 'KVA', name: 'Khvicha Kvaratskhelia', value: '7 assists', outlook: 'Trending Up', href: '/players/khvicha-kvaratskhelia' },
            ],
          },
          {
            label: 'Ligue 1',
            standings: [
              { badge: 'PSG', name: 'Paris Saint-Germain', value: '76 pts', outlook: 'Stable', href: '/teams/paris-saint-germain' },
              { badge: 'MON', name: 'Monaco', value: '63 pts', outlook: 'Trending Up', href: '/teams/monaco' },
              { badge: 'BRE', name: 'Brest', value: '60 pts', outlook: 'Holding Strong', href: '/teams/brest' },
              { badge: 'LIL', name: 'Lille', value: '58 pts', outlook: 'Pressure On', href: '/teams/lille' },
            ],
            topGoalscorers: [
              { badge: 'MBA', name: 'Kylian Mbappe', value: '27 goals', outlook: 'Elite Form', href: '/players/kylian-mbappe' },
              { badge: 'LAC', name: 'Alexandre Lacazette', value: '15 goals', outlook: 'Reliable Edge', href: '/players/alexandre-lacazette' },
              { badge: 'DAV', name: 'Jonathan David', value: '14 goals', outlook: 'Stable', href: '/players/jonathan-david' },
              { badge: 'BAL', name: 'Ben Yedder', value: '13 goals', outlook: 'Late Burst', href: '/players/wissam-ben-yedder' },
            ],
            assists: [
              { badge: 'DEM', name: 'Ousmane Dembele', value: '11 assists', outlook: 'Chance Engine', href: '/players/ousmane-dembele' },
              { badge: 'CHR', name: 'Pierre Lees-Melou', value: '8 assists', outlook: 'Build-up Boost', href: '/players/pierre-lees-melou' },
              { badge: 'GOL', name: 'Golovin', value: '8 assists', outlook: 'Stable Supply', href: '/players/aleksandr-golovin' },
              { badge: 'ZHE', name: 'Rayan Cherki', value: '7 assists', outlook: 'Creative Rise', href: '/players/rayan-cherki' },
            ],
          },
          {
            label: 'Brasileirao',
            standings: [
              { badge: 'PAL', name: 'Palmeiras', value: '68 pts', outlook: 'Trending Up', href: '/teams/palmeiras' },
              { badge: 'FLA', name: 'Flamengo', value: '66 pts', outlook: 'Late Push', href: '/teams/flamengo' },
              { badge: 'BOT', name: 'Botafogo', value: '64 pts', outlook: 'Stable', href: '/teams/botafogo' },
              { badge: 'GRE', name: 'Gremio', value: '59 pts', outlook: 'Pressure On', href: '/teams/gremio' },
            ],
            topGoalscorers: [
              { badge: 'PED', name: 'Pedro', value: '19 goals', outlook: 'Box Threat', href: '/players/pedro' },
              { badge: 'VEG', name: 'Raphael Veiga', value: '16 goals', outlook: 'Trending Up', href: '/players/raphael-veiga' },
              { badge: 'SUA', name: 'Luis Suarez', value: '15 goals', outlook: 'Reliable Edge', href: '/players/luis-suarez' },
              { badge: 'HUL', name: 'Hulk', value: '14 goals', outlook: 'Power Threat', href: '/players/hulk' },
            ],
            assists: [
              { badge: 'DEA', name: 'De Arrascaeta', value: '12 assists', outlook: 'Chance Engine', href: '/players/giorgian-de-arrascaeta' },
              { badge: 'ARI', name: 'Arias', value: '9 assists', outlook: 'Stable Supply', href: '/players/jhon-arias' },
              { badge: 'PAY', name: 'Payet', value: '8 assists', outlook: 'Creative Rise', href: '/players/dimitri-payet' },
              { badge: 'PAU', name: 'Paulinho', value: '8 assists', outlook: 'Wide Threat', href: '/players/paulinho' },
            ],
          },
          {
            label: 'Liga MX',
            standings: [
              { badge: 'AME', name: 'Club America', value: '37 pts', outlook: 'Trending Up', href: '/teams/club-america' },
              { badge: 'TIG', name: 'Tigres', value: '33 pts', outlook: 'Stable', href: '/teams/tigres' },
              { badge: 'MON', name: 'Monterrey', value: '32 pts', outlook: 'Late Push', href: '/teams/monterrey' },
              { badge: 'TOL', name: 'Toluca', value: '30 pts', outlook: 'Volatile', href: '/teams/toluca' },
            ],
            topGoalscorers: [
              { badge: 'QUI', name: 'Quiñones', value: '13 goals', outlook: 'Hot Finishing', href: '/players/julian-quinones' },
              { badge: 'GIG', name: 'Gignac', value: '12 goals', outlook: 'Reliable Edge', href: '/players/andre-pierre-gignac' },
              { badge: 'CAN', name: 'Brandon Vazquez', value: '11 goals', outlook: 'Box Threat', href: '/players/brandon-vazquez' },
              { badge: 'MEN', name: 'Mendez', value: '10 goals', outlook: 'Trending Up', href: '/players/alan-mendez' },
            ],
            assists: [
              { badge: 'VAL', name: 'Diego Valdes', value: '9 assists', outlook: 'Chance Engine', href: '/players/diego-valdes' },
              { badge: 'CORD', name: 'Sebastian Cordova', value: '8 assists', outlook: 'Creative Rise', href: '/players/sebastian-cordova' },
              { badge: 'ROM', name: 'Luis Romo', value: '7 assists', outlook: 'Stable Supply', href: '/players/luis-romo' },
              { badge: 'AQU', name: 'Aquino', value: '7 assists', outlook: 'Wide Threat', href: '/players/javier-aquino' },
            ],
          },
          {
            label: 'MLS',
            standings: [
              { badge: 'MIA', name: 'Inter Miami', value: '34 pts', outlook: 'Trending Up', href: '/teams/inter-miami' },
              { badge: 'CIN', name: 'FC Cincinnati', value: '31 pts', outlook: 'Stable', href: '/teams/fc-cincinnati' },
              { badge: 'LAG', name: 'LA Galaxy', value: '29 pts', outlook: 'Late Push', href: '/teams/la-galaxy' },
              { badge: 'CLB', name: 'Columbus Crew', value: '28 pts', outlook: 'Creative Rise', href: '/teams/columbus-crew' },
            ],
            topGoalscorers: [
              { badge: 'MES', name: 'Lionel Messi', value: '12 goals', outlook: 'Elite Form', href: '/players/lionel-messi' },
              { badge: 'BEN', name: 'Christian Benteke', value: '11 goals', outlook: 'Box Threat', href: '/players/christian-benteke' },
              { badge: 'SUA', name: 'Luis Suarez', value: '10 goals', outlook: 'Reliable Edge', href: '/players/luis-suarez' },
              { badge: 'CUC', name: 'Cucho Hernandez', value: '9 goals', outlook: 'Trending Up', href: '/players/cucho-hernandez' },
            ],
            assists: [
              { badge: 'ALB', name: 'Jordi Alba', value: '8 assists', outlook: 'Chance Engine', href: '/players/jordi-alba' },
              { badge: 'MES', name: 'Lionel Messi', value: '7 assists', outlook: 'Stable Supply', href: '/players/lionel-messi' },
              { badge: 'RUS', name: 'Diego Rossi', value: '7 assists', outlook: 'Creative Rise', href: '/players/diego-rossi' },
              { badge: 'ACO', name: 'Luciano Acosta', value: '6 assists', outlook: 'Control Layer', href: '/players/luciano-acosta' },
            ],
          },
        ],
      },
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Football insights — explained simply',
      items: [
        {
          question: 'How does SirBro generate football predictions?',
          answer:
            'SirBro analyzes historical data, live match events, player performance, and tactical patterns to identify likely outcomes.',
        },
        {
          question: 'Are these betting tips?',
          answer:
            'No. SirBro provides football insights for informational and entertainment purposes only.',
        },
        {
          question: 'Which leagues are covered?',
          answer:
            'Top global leagues including Premier League, La Liga, Serie A, Bundesliga, and more.',
        },
        {
          question: 'Is SirBro free?',
          answer:
            'A free version is available with optional premium features for deeper insights.',
        },
        {
          question: 'Can I ask questions about matches?',
          answer:
            'Yes. SirBro includes an AI chat that answers football-related questions instantly.',
        },
      ],
    },
    finalCta: {
      eyebrow: 'Install SirBro',
      title: 'Stop guessing. Understand the game.',
      description:
        'Download SirBro and get faster, clearer football insights — every day.',
      primaryCtaLabel: 'App Store',
      secondaryCtaLabel: 'Explore Insights',
      secondaryStoreCtaLabel: 'Google Play',
    },
  },
  es: {
    hero: {
      chips: ['Predicciones de fútbol con IA', 'Análisis de partidos'],
      title:
        'Predicciones de Fútbol con IA, Análisis de Partidos e Insights — Sin Ruido',
      description:
        'La mayoría sigue los partidos. Pocos los entienden. SirBro transforma datos en vivo, forma de jugadores y contexto táctico en insights claros y rápidos.',
      proof:
        'Obtén predicciones de fútbol con IA, análisis de partidos, estadísticas de equipos y insights en tiempo real en ligas como Premier League, La Liga, Serie A, Bundesliga, MLS y más — todo en una sola app.',
      trustLine:
        'Solo para fines de entretenimiento. No aceptamos apuestas. Analizamos el juego.',
      openAppLabel: 'Descargar App',
      previewTitle: 'Panorama en vivo',
      previewSubtitle: 'Arsenal vs Liverpool',
      previewHighlights: [
        { label: 'Volatilidad', value: 'Alta' },
        { label: 'Cambio por alineación', value: '+12%' },
        { label: 'Momento', value: 'Arsenal arriba' },
      ],
      chatPrompt: '¿Quién tiene ventaja en la 2ª parte?',
      fanArenaTitle: 'Fan Arena',
      fanArenaCopy:
        'Participa en conversaciones, compara opiniones y sigue el pulso del partido.',
    },
    showcase: {
      eyebrow: 'Qué hace SirBro',
      title: 'Ve el partido antes de que pase',
      description:
        'El fútbol no es aleatorio. Solo lo parece si no ves las señales.',
      items: [
        {
          title: 'Predicciones de fútbol con IA',
          description:
            'Obtén predicciones estructuradas basadas en datos — desde escenarios más seguros hasta más variables.',
          accentLabel: 'Motor de predicción',
          accentValue: 'Datos primero',
          lines: ['Resultados estructurados', 'Lecturas por escenario', 'Análisis sin ruido'],
        },
        {
          title: 'Análisis de equipos y jugadores',
          description:
            'Entiende forma, tendencias y patrones tácticos en distintas ligas y competiciones.',
          accentLabel: 'Capa de análisis',
          accentValue: 'Forma + contexto',
          lines: ['Tendencias de rendimiento', 'Contexto por rol', 'Patrones tácticos'],
        },
        {
          title: 'Fan Arena',
          description:
            'Participa en conversaciones, compara opiniones y sigue el pulso del partido.',
          accentLabel: 'Leaderboard',
          accentValue: '#2 esta semana',
          lines: ['Conversaciones en vivo', 'Opiniones comparadas', 'Pulso del partido'],
        },
      ],
    },
    methodology: {
      eyebrow: 'Cómo funciona',
      title: 'Cómo SirBro analiza los partidos de fútbol',
      description: 'No adivinamos. Procesamos.',
      steps: [
        {
          step: '01',
          title: 'Detectar la señal',
          description:
            'Analizamos datos del partido, forma de jugadores, alineaciones y cambios clave.',
        },
        {
          step: '02',
          title: 'Añadir contexto futbolístico',
          description:
            'Los datos por sí solos no explican el juego. El contexto sí. Convertimos estadísticas en significado táctico real.',
        },
        {
          step: '03',
          title: 'Entregar claridad',
          description:
            'Recibes insights estructurados y útiles — sin ruido.',
        },
      ],
      trustItems: [
        {
          title: 'Metodología',
          description:
            'Combinamos datos históricos, señales en vivo y modelos estructurados.',
          href: '/methodology',
        },
        {
          title: 'Revisión editorial',
          description:
            'Los insights se organizan para ser claros y consistentes.',
          href: '/editorial-policy',
        },
        {
          title: 'IA + criterio humano',
          description: 'La IA escala. El criterio humano ajusta.',
          href: '/ai-transparency',
        },
        {
          title: 'Transparencia',
          description: 'Sin promesas. Sin garantías. Solo análisis.',
          href: '/disclaimer',
        },
      ],
    },
    discovery: {
      eyebrow: 'Funciones',
      title: 'Todo lo que necesitas para entender el fútbol en un solo lugar',
      features: [
        'Predicciones de fútbol con IA',
        'Seguimiento de partidos en vivo',
        'Estadísticas de equipos y jugadores',
        'Análisis táctico y señales de momentum',
        'Insights diarios de partidos',
        'Chat interactivo para preguntas rápidas',
        'Comunidad y desafíos de partidos',
      ],
      useCasesTitle: 'Para quién es SirBro',
      useCases: [
        'Fans que quieren entender mejor el fútbol',
        'Usuarios que buscan insights claros',
        'Personas orientadas a datos',
        'Fans casuales que quieren respuestas rápidas',
        'Comunidades que siguen partidos en tiempo real',
      ],
      topicLinks: [
        { label: 'Impacto de lesiones', href: '/topics/injury-impact' },
        { label: 'Cambios de alineación', href: '/topics/lineup-changes' },
        { label: 'Forma del jugador', href: '/topics/player-form' },
        { label: 'Análisis táctico', href: '/topics/tactical-analysis' },
        { label: 'Desglose estadístico', href: '/topics/stats-breakdowns' },
      ],
      featuredInsight: {
        eyebrow: 'Insight destacado',
        title: 'Cómo los cambios de alineación alteran la volatilidad antes del inicio',
        description:
          'Una lectura rápida sobre impacto de lesiones, reemplazos por rol y escenarios de momentum que cambian el panorama.',
        href: '/insights/lineup-shifts-change-match-volatility',
        ctaLabel: 'Leer insight',
      },
      quiz: {
        eyebrow: 'Quiz destacado',
        title: 'Identidad táctica: ¿qué tipo de pensador futbolístico eres?',
        description:
          'Una tarjeta ligera que mejora el engagement y presenta el tono del producto sin competir con la instalación.',
        href: '/quizzes/tactical-identity-football-thinker',
        ctaLabel: 'Empezar quiz',
      },
      seoEngine: {
        eyebrow: 'Ligas',
        title: 'Cobertura de las principales ligas del mundo',
        description: 'SirBro ofrece insights y análisis para:',
        note: 'Y más — actualizado cada día.',
        leagueLabels: [
          'Premier League',
          'La Liga',
          'Serie A',
          'Bundesliga',
          'Ligue 1',
          'Brasileirão',
          'Liga MX',
          'MLS',
          'Competiciones UEFA',
          'Mundial FIFA 2026',
        ],
        metricLabels: {
          standings: 'Tabla',
          topGoalscorers: 'Goleadores',
          assists: 'Asistencias',
        },
        leagues: [
          {
            label: 'EPL',
            standings: [
              { badge: 'LIV', name: 'Liverpool', value: '74 pts', outlook: 'En alza', href: '/teams/liverpool' },
              { badge: 'ARS', name: 'Arsenal', value: '71 pts', outlook: 'Estable', href: '/teams/arsenal' },
              { badge: 'MCI', name: 'Manchester City', value: '69 pts', outlook: 'Empuje final', href: '/teams/manchester-city' },
              { badge: 'AVL', name: 'Aston Villa', value: '60 pts', outlook: 'Bajo presión', href: '/teams/aston-villa' },
            ],
            topGoalscorers: [
              { badge: 'HAA', name: 'Erling Haaland', value: '23 goles', outlook: 'Racha fuerte', href: '/players/erling-haaland' },
              { badge: 'SAL', name: 'Mohamed Salah', value: '21 goles', outlook: 'Ventaja estable', href: '/players/mohamed-salah' },
              { badge: 'SON', name: 'Son Heung-min', value: '17 goles', outlook: 'Amenaza en transición', href: '/players/son-heung-min' },
              { badge: 'ISA', name: 'Alexander Isak', value: '16 goles', outlook: 'En alza', href: '/players/alexander-isak' },
            ],
            assists: [
              { badge: 'KDB', name: 'Kevin De Bruyne', value: '11 asist.', outlook: 'Motor creativo', href: '/players/kevin-de-bruyne' },
              { badge: 'SAK', name: 'Bukayo Saka', value: '10 asist.', outlook: 'Suministro estable', href: '/players/bukayo-saka' },
              { badge: 'TRA', name: 'Trent Alexander-Arnold', value: '9 asist.', outlook: 'Centro en alza', href: '/players/trent-alexander-arnold' },
              { badge: 'PAL', name: 'Cole Palmer', value: '8 asist.', outlook: 'Creatividad creciente', href: '/players/cole-palmer' },
            ],
          },
          {
            label: 'La Liga',
            standings: [
              { badge: 'RMA', name: 'Real Madrid', value: '78 pts', outlook: 'En alza', href: '/teams/real-madrid' },
              { badge: 'BAR', name: 'Barcelona', value: '73 pts', outlook: 'Persiguiendo', href: '/teams/barcelona' },
              { badge: 'GIR', name: 'Girona', value: '67 pts', outlook: 'Sosteniéndose', href: '/teams/girona' },
              { badge: 'ATM', name: 'Atletico Madrid', value: '63 pts', outlook: 'Volátil', href: '/teams/atletico-madrid' },
            ],
            topGoalscorers: [
              { badge: 'BEL', name: 'Jude Bellingham', value: '18 goles', outlook: 'Llegadas tardías', href: '/players/jude-bellingham' },
              { badge: 'LEW', name: 'Robert Lewandowski', value: '17 goles', outlook: 'Amenaza en área', href: '/players/robert-lewandowski' },
              { badge: 'DOV', name: 'Artem Dovbyk', value: '16 goles', outlook: 'En alza', href: '/players/artem-dovbyk' },
              { badge: 'MOR', name: 'Alvaro Morata', value: '15 goles', outlook: 'Estable', href: '/players/alvaro-morata' },
            ],
            assists: [
              { badge: 'GUN', name: 'Ilkay Gundogan', value: '9 asist.', outlook: 'Control del ritmo', href: '/players/ilkay-gundogan' },
              { badge: 'VIN', name: 'Vinicius Junior', value: '8 asist.', outlook: 'Amenaza al espacio', href: '/players/vinicius-junior' },
              { badge: 'SAV', name: 'Aleix Garcia', value: '8 asist.', outlook: 'Salida reforzada', href: '/players/aleix-garcia' },
              { badge: 'GRI', name: 'Antoine Griezmann', value: '7 asist.', outlook: 'Suministro estable', href: '/players/antoine-griezmann' },
            ],
          },
          {
            label: 'Serie A',
            standings: [
              { badge: 'INT', name: 'Inter', value: '82 pts', outlook: 'Dominante', href: '/teams/inter' },
              { badge: 'MIL', name: 'Milan', value: '68 pts', outlook: 'Persiguiendo', href: '/teams/milan' },
              { badge: 'JUV', name: 'Juventus', value: '66 pts', outlook: 'Estable', href: '/teams/juventus' },
              { badge: 'BOL', name: 'Bologna', value: '60 pts', outlook: 'En alza', href: '/teams/bologna' },
            ],
            topGoalscorers: [
              { badge: 'MRT', name: 'Lautaro Martinez', value: '24 goles', outlook: 'Forma elite', href: '/players/lautaro-martinez' },
              { badge: 'VLA', name: 'Dusan Vlahovic', value: '17 goles', outlook: 'Amenaza en área', href: '/players/dusan-vlahovic' },
              { badge: 'GIR', name: 'Olivier Giroud', value: '14 goles', outlook: 'Ventaja estable', href: '/players/olivier-giroud' },
              { badge: 'OSA', name: 'Victor Osimhen', value: '13 goles', outlook: 'Regreso volátil', href: '/players/victor-osimhen' },
            ],
            assists: [
              { badge: 'CAL', name: 'Hakan Calhanoglu', value: '9 asist.', outlook: 'Balón parado', href: '/players/hakan-calhanoglu' },
              { badge: 'LEA', name: 'Rafael Leao', value: '8 asist.', outlook: 'Amenaza exterior', href: '/players/rafael-leao' },
              { badge: 'DIM', name: 'Federico Dimarco', value: '7 asist.', outlook: 'Centros en alza', href: '/players/federico-dimarco' },
              { badge: 'KVA', name: 'Khvicha Kvaratskhelia', value: '7 asist.', outlook: 'En alza', href: '/players/khvicha-kvaratskhelia' },
            ],
          },
          {
            label: 'Ligue 1',
            standings: [
              { badge: 'PSG', name: 'Paris Saint-Germain', value: '76 pts', outlook: 'Estable', href: '/teams/paris-saint-germain' },
              { badge: 'MON', name: 'Monaco', value: '63 pts', outlook: 'En alza', href: '/teams/monaco' },
              { badge: 'BRE', name: 'Brest', value: '60 pts', outlook: 'Sosteniéndose', href: '/teams/brest' },
              { badge: 'LIL', name: 'Lille', value: '58 pts', outlook: 'Bajo presión', href: '/teams/lille' },
            ],
            topGoalscorers: [
              { badge: 'MBA', name: 'Kylian Mbappe', value: '27 goles', outlook: 'Forma elite', href: '/players/kylian-mbappe' },
              { badge: 'LAC', name: 'Alexandre Lacazette', value: '15 goles', outlook: 'Ventaja estable', href: '/players/alexandre-lacazette' },
              { badge: 'DAV', name: 'Jonathan David', value: '14 goles', outlook: 'Estable', href: '/players/jonathan-david' },
              { badge: 'BAL', name: 'Ben Yedder', value: '13 goles', outlook: 'Empuje final', href: '/players/wissam-ben-yedder' },
            ],
            assists: [
              { badge: 'DEM', name: 'Ousmane Dembele', value: '11 asist.', outlook: 'Motor creativo', href: '/players/ousmane-dembele' },
              { badge: 'CHR', name: 'Pierre Lees-Melou', value: '8 asist.', outlook: 'Salida reforzada', href: '/players/pierre-lees-melou' },
              { badge: 'GOL', name: 'Golovin', value: '8 asist.', outlook: 'Suministro estable', href: '/players/aleksandr-golovin' },
              { badge: 'ZHE', name: 'Rayan Cherki', value: '7 asist.', outlook: 'Creatividad creciente', href: '/players/rayan-cherki' },
            ],
          },
          {
            label: 'Brasileirao',
            standings: [
              { badge: 'PAL', name: 'Palmeiras', value: '68 pts', outlook: 'En alza', href: '/teams/palmeiras' },
              { badge: 'FLA', name: 'Flamengo', value: '66 pts', outlook: 'Empuje final', href: '/teams/flamengo' },
              { badge: 'BOT', name: 'Botafogo', value: '64 pts', outlook: 'Estable', href: '/teams/botafogo' },
              { badge: 'GRE', name: 'Gremio', value: '59 pts', outlook: 'Bajo presión', href: '/teams/gremio' },
            ],
            topGoalscorers: [
              { badge: 'PED', name: 'Pedro', value: '19 goles', outlook: 'Amenaza en área', href: '/players/pedro' },
              { badge: 'VEG', name: 'Raphael Veiga', value: '16 goles', outlook: 'En alza', href: '/players/raphael-veiga' },
              { badge: 'SUA', name: 'Luis Suarez', value: '15 goles', outlook: 'Ventaja estable', href: '/players/luis-suarez' },
              { badge: 'HUL', name: 'Hulk', value: '14 goles', outlook: 'Amenaza física', href: '/players/hulk' },
            ],
            assists: [
              { badge: 'DEA', name: 'De Arrascaeta', value: '12 asist.', outlook: 'Motor creativo', href: '/players/giorgian-de-arrascaeta' },
              { badge: 'ARI', name: 'Arias', value: '9 asist.', outlook: 'Suministro estable', href: '/players/jhon-arias' },
              { badge: 'PAY', name: 'Payet', value: '8 asist.', outlook: 'Creatividad creciente', href: '/players/dimitri-payet' },
              { badge: 'PAU', name: 'Paulinho', value: '8 asist.', outlook: 'Amenaza exterior', href: '/players/paulinho' },
            ],
          },
          {
            label: 'Liga MX',
            standings: [
              { badge: 'AME', name: 'Club America', value: '37 pts', outlook: 'En alza', href: '/teams/club-america' },
              { badge: 'TIG', name: 'Tigres', value: '33 pts', outlook: 'Estable', href: '/teams/tigres' },
              { badge: 'MON', name: 'Monterrey', value: '32 pts', outlook: 'Empuje final', href: '/teams/monterrey' },
              { badge: 'TOL', name: 'Toluca', value: '30 pts', outlook: 'Volátil', href: '/teams/toluca' },
            ],
            topGoalscorers: [
              { badge: 'QUI', name: 'Quiñones', value: '13 goles', outlook: 'Racha fuerte', href: '/players/julian-quinones' },
              { badge: 'GIG', name: 'Gignac', value: '12 goles', outlook: 'Ventaja estable', href: '/players/andre-pierre-gignac' },
              { badge: 'CAN', name: 'Brandon Vazquez', value: '11 goles', outlook: 'Amenaza en área', href: '/players/brandon-vazquez' },
              { badge: 'MEN', name: 'Mendez', value: '10 goles', outlook: 'En alza', href: '/players/alan-mendez' },
            ],
            assists: [
              { badge: 'VAL', name: 'Diego Valdes', value: '9 asist.', outlook: 'Motor creativo', href: '/players/diego-valdes' },
              { badge: 'CORD', name: 'Sebastian Cordova', value: '8 asist.', outlook: 'Creatividad creciente', href: '/players/sebastian-cordova' },
              { badge: 'ROM', name: 'Luis Romo', value: '7 asist.', outlook: 'Suministro estable', href: '/players/luis-romo' },
              { badge: 'AQU', name: 'Aquino', value: '7 asist.', outlook: 'Amenaza exterior', href: '/players/javier-aquino' },
            ],
          },
          {
            label: 'MLS',
            standings: [
              { badge: 'MIA', name: 'Inter Miami', value: '34 pts', outlook: 'En alza', href: '/teams/inter-miami' },
              { badge: 'CIN', name: 'FC Cincinnati', value: '31 pts', outlook: 'Estable', href: '/teams/fc-cincinnati' },
              { badge: 'LAG', name: 'LA Galaxy', value: '29 pts', outlook: 'Empuje final', href: '/teams/la-galaxy' },
              { badge: 'CLB', name: 'Columbus Crew', value: '28 pts', outlook: 'Creatividad creciente', href: '/teams/columbus-crew' },
            ],
            topGoalscorers: [
              { badge: 'MES', name: 'Lionel Messi', value: '12 goles', outlook: 'Forma elite', href: '/players/lionel-messi' },
              { badge: 'BEN', name: 'Christian Benteke', value: '11 goles', outlook: 'Amenaza en área', href: '/players/christian-benteke' },
              { badge: 'SUA', name: 'Luis Suarez', value: '10 goles', outlook: 'Ventaja estable', href: '/players/luis-suarez' },
              { badge: 'CUC', name: 'Cucho Hernandez', value: '9 goles', outlook: 'En alza', href: '/players/cucho-hernandez' },
            ],
            assists: [
              { badge: 'ALB', name: 'Jordi Alba', value: '8 asist.', outlook: 'Motor creativo', href: '/players/jordi-alba' },
              { badge: 'MES', name: 'Lionel Messi', value: '7 asist.', outlook: 'Suministro estable', href: '/players/lionel-messi' },
              { badge: 'RUS', name: 'Diego Rossi', value: '7 asist.', outlook: 'Creatividad creciente', href: '/players/diego-rossi' },
              { badge: 'ACO', name: 'Luciano Acosta', value: '6 asist.', outlook: 'Capa de control', href: '/players/luciano-acosta' },
            ],
          },
        ],
      },
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Insights de fútbol — explicados simple',
      items: [
        {
          question: '¿Cómo genera SirBro las predicciones?',
          answer:
            'Analiza datos históricos, eventos en vivo y rendimiento de jugadores.',
        },
        {
          question: '¿Son consejos de apuestas?',
          answer:
            'No. SirBro ofrece información con fines de entretenimiento.',
        },
        {
          question: '¿Qué ligas cubre?',
          answer:
            'Principales ligas globales como Premier League, La Liga y más.',
        },
        {
          question: '¿SirBro es gratis?',
          answer: 'Existe versión gratuita con opciones premium.',
        },
        {
          question: '¿Puedo hacer preguntas sobre partidos?',
          answer: 'Sí. El chat responde en segundos.',
        },
      ],
    },
    finalCta: {
      eyebrow: 'Instala SirBro',
      title: 'Deja de adivinar. Entiende el juego.',
      description:
        'Descarga SirBro y accede a insights más claros cada día.',
      primaryCtaLabel: 'App Store',
      secondaryCtaLabel: 'Explorar insights',
      secondaryStoreCtaLabel: 'Google Play',
    },
  },
  pt: {
    hero: {
      chips: ['Previsões de futebol com IA', 'Análise de partidas'],
      title:
        'Previsões de Futebol com IA, Análise de Partidas e Insights — Sem Ruído',
      description:
        'A maioria acompanha os jogos. Poucos entendem. O SirBro transforma dados ao vivo, forma dos jogadores e contexto tático em insights claros e rápidos.',
      proof:
        'Acesse previsões de futebol com IA, análise de partidas, estatísticas de times e insights em tempo real nas principais ligas como Premier League, La Liga, Serie A, Bundesliga, MLS e mais — tudo em um só app.',
      trustLine:
        'Apenas para entretenimento. Não aceitamos apostas. Analisamos o jogo.',
      openAppLabel: 'Baixar App',
      previewTitle: 'Panorama ao vivo',
      previewSubtitle: 'Arsenal vs Liverpool',
      previewHighlights: [
        { label: 'Volatilidade', value: 'Alta' },
        { label: 'Mudança por escalação', value: '+12%' },
        { label: 'Momento', value: 'Arsenal em alta' },
      ],
      chatPrompt: 'Quem tem vantagem no 2º tempo?',
      fanArenaTitle: 'Fan Arena',
      fanArenaCopy:
        'Participe de discussões e acompanhe o ritmo do jogo.',
    },
    showcase: {
      eyebrow: 'O que o SirBro faz',
      title: 'Veja o jogo antes de acontecer',
      description:
        'O futebol não é aleatório. Só parece se você não vê os sinais.',
      items: [
        {
          title: 'Previsões de futebol com IA',
          description:
            'Previsões estruturadas baseadas em dados — de cenários mais seguros a mais variáveis.',
          accentLabel: 'Motor de previsão',
          accentValue: 'Dados primeiro',
          lines: ['Resultados estruturados', 'Leituras por cenário', 'Análise sem ruído'],
        },
        {
          title: 'Análise de times e jogadores',
          description:
            'Entenda forma, desempenho e padrões táticos.',
          accentLabel: 'Camada de análise',
          accentValue: 'Forma + contexto',
          lines: ['Tendências de desempenho', 'Contexto por função', 'Padrões táticos'],
        },
        {
          title: 'Fan Arena',
          description:
            'Participe de discussões e acompanhe o ritmo do jogo.',
          accentLabel: 'Leaderboard',
          accentValue: '#2 nesta semana',
          lines: ['Discussões ao vivo', 'Ritmo do jogo', 'Comunidade ativa'],
        },
      ],
    },
    methodology: {
      eyebrow: 'Como funciona',
      title: 'Como o SirBro analisa partidas de futebol',
      description: 'Não é adivinhação. É processamento.',
      steps: [
        {
          step: '01',
          title: 'Detectar sinais',
          description:
            'Analisamos dados do jogo, forma dos jogadores e mudanças importantes.',
        },
        {
          step: '02',
          title: 'Adicionar contexto',
          description:
            'Dados não bastam. Contexto decide. Transformamos números em leitura tática.',
        },
        {
          step: '03',
          title: 'Entregar clareza',
          description:
            'Insights diretos, estruturados e sem ruído.',
        },
      ],
      trustItems: [
        {
          title: 'Metodologia',
          description:
            'Dados históricos + sinais ao vivo + modelos estruturados.',
          href: '/methodology',
        },
        {
          title: 'Curadoria editorial',
          description: 'Conteúdo organizado para ser claro e útil.',
          href: '/editorial-policy',
        },
        {
          title: 'IA + humano',
          description: 'Escala com controle.',
          href: '/ai-transparency',
        },
        {
          title: 'Transparência',
          description: 'Sem promessas. Apenas análise.',
          href: '/disclaimer',
        },
      ],
    },
    discovery: {
      eyebrow: 'Recursos',
      title: 'Tudo que você precisa para entender futebol',
      features: [
        'Previsões com IA',
        'Acompanhamento de partidas ao vivo',
        'Estatísticas de times e jogadores',
        'Análise tática e indicadores de momentum',
        'Insights diários',
        'Chat interativo',
        'Comunidade e desafios',
      ],
      useCasesTitle: 'Quem usa o SirBro',
      useCases: [
        'Fãs que querem entender mais',
        'Usuários orientados a dados',
        'Pessoas que buscam insights rápidos',
        'Comunidades de futebol',
        'Fãs casuais',
      ],
      topicLinks: [
        { label: 'Impacto de lesoes', href: '/topics/injury-impact' },
        { label: 'Mudancas de escalação', href: '/topics/lineup-changes' },
        { label: 'Forma do jogador', href: '/topics/player-form' },
        { label: 'Analise tatica', href: '/topics/tactical-analysis' },
        { label: 'Leitura estatistica', href: '/topics/stats-breakdowns' },
      ],
      featuredInsight: {
        eyebrow: 'Insight em destaque',
        title: 'Como mudancas de escalação alteram a volatilidade antes do apito inicial',
        description:
          'Uma leitura rapida sobre impacto de lesoes, substituicoes por funcao e cenarios de momentum que mudam o panorama.',
        href: '/insights/lineup-shifts-change-match-volatility',
        ctaLabel: 'Ler insight',
      },
      quiz: {
        eyebrow: 'Quiz em destaque',
        title: 'Identidade tatica: que tipo de pensador de futebol voce e?',
        description:
          'Um card leve que aumenta engajamento e apresenta o tom do produto sem competir com a instalacao.',
        href: '/quizzes/tactical-identity-football-thinker',
        ctaLabel: 'Comecar quiz',
      },
      seoEngine: {
        eyebrow: 'Ligas',
        title: 'Cobertura das principais ligas do mundo',
        description: 'O SirBro oferece insights e análises para:',
        note: 'Atualizado diariamente.',
        leagueLabels: [
          'Premier League',
          'La Liga',
          'Serie A',
          'Bundesliga',
          'Ligue 1',
          'Brasileirão',
          'Liga MX',
          'MLS',
          'Competições UEFA',
          'Copa do Mundo FIFA 2026',
        ],
        metricLabels: {
          standings: 'Tabela',
          topGoalscorers: 'Artilheiros',
          assists: 'Assistências',
        },
        leagues: [
          {
            label: 'EPL',
            standings: [
              { badge: 'LIV', name: 'Liverpool', value: '74 pts', outlook: 'Em alta', href: '/teams/liverpool' },
              { badge: 'ARS', name: 'Arsenal', value: '71 pts', outlook: 'Estavel', href: '/teams/arsenal' },
              { badge: 'MCI', name: 'Manchester City', value: '69 pts', outlook: 'Arrancada final', href: '/teams/manchester-city' },
              { badge: 'AVL', name: 'Aston Villa', value: '60 pts', outlook: 'Sob pressao', href: '/teams/aston-villa' },
            ],
            topGoalscorers: [
              { badge: 'HAA', name: 'Erling Haaland', value: '23 gols', outlook: 'Finalizacao forte', href: '/players/erling-haaland' },
              { badge: 'SAL', name: 'Mohamed Salah', value: '21 gols', outlook: 'Vantagem estavel', href: '/players/mohamed-salah' },
              { badge: 'SON', name: 'Son Heung-min', value: '17 gols', outlook: 'Ameaca em transicao', href: '/players/son-heung-min' },
              { badge: 'ISA', name: 'Alexander Isak', value: '16 gols', outlook: 'Em alta', href: '/players/alexander-isak' },
            ],
            assists: [
              { badge: 'KDB', name: 'Kevin De Bruyne', value: '11 assist.', outlook: 'Motor criativo', href: '/players/kevin-de-bruyne' },
              { badge: 'SAK', name: 'Bukayo Saka', value: '10 assist.', outlook: 'Fornecimento estavel', href: '/players/bukayo-saka' },
              { badge: 'TRA', name: 'Trent Alexander-Arnold', value: '9 assist.', outlook: 'Cruzamentos em alta', href: '/players/trent-alexander-arnold' },
              { badge: 'PAL', name: 'Cole Palmer', value: '8 assist.', outlook: 'Criatividade crescente', href: '/players/cole-palmer' },
            ],
          },
          {
            label: 'La Liga',
            standings: [
              { badge: 'RMA', name: 'Real Madrid', value: '78 pts', outlook: 'Em alta', href: '/teams/real-madrid' },
              { badge: 'BAR', name: 'Barcelona', value: '73 pts', outlook: 'Perseguindo', href: '/teams/barcelona' },
              { badge: 'GIR', name: 'Girona', value: '67 pts', outlook: 'Sustentando', href: '/teams/girona' },
              { badge: 'ATM', name: 'Atletico Madrid', value: '63 pts', outlook: 'Volatil', href: '/teams/atletico-madrid' },
            ],
            topGoalscorers: [
              { badge: 'BEL', name: 'Jude Bellingham', value: '18 gols', outlook: 'Entradas tardias', href: '/players/jude-bellingham' },
              { badge: 'LEW', name: 'Robert Lewandowski', value: '17 gols', outlook: 'Ameaca na area', href: '/players/robert-lewandowski' },
              { badge: 'DOV', name: 'Artem Dovbyk', value: '16 gols', outlook: 'Em alta', href: '/players/artem-dovbyk' },
              { badge: 'MOR', name: 'Alvaro Morata', value: '15 gols', outlook: 'Estavel', href: '/players/alvaro-morata' },
            ],
            assists: [
              { badge: 'GUN', name: 'Ilkay Gundogan', value: '9 assist.', outlook: 'Controle de ritmo', href: '/players/ilkay-gundogan' },
              { badge: 'VIN', name: 'Vinicius Junior', value: '8 assist.', outlook: 'Ameaca ao espaco', href: '/players/vinicius-junior' },
              { badge: 'SAV', name: 'Aleix Garcia', value: '8 assist.', outlook: 'Saida reforcada', href: '/players/aleix-garcia' },
              { badge: 'GRI', name: 'Antoine Griezmann', value: '7 assist.', outlook: 'Fornecimento estavel', href: '/players/antoine-griezmann' },
            ],
          },
          {
            label: 'Serie A',
            standings: [
              { badge: 'INT', name: 'Inter', value: '82 pts', outlook: 'Dominante', href: '/teams/inter' },
              { badge: 'MIL', name: 'Milan', value: '68 pts', outlook: 'Perseguindo', href: '/teams/milan' },
              { badge: 'JUV', name: 'Juventus', value: '66 pts', outlook: 'Estavel', href: '/teams/juventus' },
              { badge: 'BOL', name: 'Bologna', value: '60 pts', outlook: 'Em alta', href: '/teams/bologna' },
            ],
            topGoalscorers: [
              { badge: 'MRT', name: 'Lautaro Martinez', value: '24 gols', outlook: 'Forma elite', href: '/players/lautaro-martinez' },
              { badge: 'VLA', name: 'Dusan Vlahovic', value: '17 gols', outlook: 'Ameaca na area', href: '/players/dusan-vlahovic' },
              { badge: 'GIR', name: 'Olivier Giroud', value: '14 gols', outlook: 'Vantagem estavel', href: '/players/olivier-giroud' },
              { badge: 'OSA', name: 'Victor Osimhen', value: '13 gols', outlook: 'Retorno volatil', href: '/players/victor-osimhen' },
            ],
            assists: [
              { badge: 'CAL', name: 'Hakan Calhanoglu', value: '9 assist.', outlook: 'Bola parada', href: '/players/hakan-calhanoglu' },
              { badge: 'LEA', name: 'Rafael Leao', value: '8 assist.', outlook: 'Ameaca pelos lados', href: '/players/rafael-leao' },
              { badge: 'DIM', name: 'Federico Dimarco', value: '7 assist.', outlook: 'Cruzamentos em alta', href: '/players/federico-dimarco' },
              { badge: 'KVA', name: 'Khvicha Kvaratskhelia', value: '7 assist.', outlook: 'Em alta', href: '/players/khvicha-kvaratskhelia' },
            ],
          },
          {
            label: 'Ligue 1',
            standings: [
              { badge: 'PSG', name: 'Paris Saint-Germain', value: '76 pts', outlook: 'Estavel', href: '/teams/paris-saint-germain' },
              { badge: 'MON', name: 'Monaco', value: '63 pts', outlook: 'Em alta', href: '/teams/monaco' },
              { badge: 'BRE', name: 'Brest', value: '60 pts', outlook: 'Sustentando', href: '/teams/brest' },
              { badge: 'LIL', name: 'Lille', value: '58 pts', outlook: 'Sob pressao', href: '/teams/lille' },
            ],
            topGoalscorers: [
              { badge: 'MBA', name: 'Kylian Mbappe', value: '27 gols', outlook: 'Forma elite', href: '/players/kylian-mbappe' },
              { badge: 'LAC', name: 'Alexandre Lacazette', value: '15 gols', outlook: 'Vantagem estavel', href: '/players/alexandre-lacazette' },
              { badge: 'DAV', name: 'Jonathan David', value: '14 gols', outlook: 'Estavel', href: '/players/jonathan-david' },
              { badge: 'BAL', name: 'Ben Yedder', value: '13 gols', outlook: 'Arrancada final', href: '/players/wissam-ben-yedder' },
            ],
            assists: [
              { badge: 'DEM', name: 'Ousmane Dembele', value: '11 assist.', outlook: 'Motor criativo', href: '/players/ousmane-dembele' },
              { badge: 'CHR', name: 'Pierre Lees-Melou', value: '8 assist.', outlook: 'Saida reforcada', href: '/players/pierre-lees-melou' },
              { badge: 'GOL', name: 'Golovin', value: '8 assist.', outlook: 'Fornecimento estavel', href: '/players/aleksandr-golovin' },
              { badge: 'ZHE', name: 'Rayan Cherki', value: '7 assist.', outlook: 'Criatividade crescente', href: '/players/rayan-cherki' },
            ],
          },
          {
            label: 'Brasileirao',
            standings: [
              { badge: 'PAL', name: 'Palmeiras', value: '68 pts', outlook: 'Em alta', href: '/teams/palmeiras' },
              { badge: 'FLA', name: 'Flamengo', value: '66 pts', outlook: 'Arrancada final', href: '/teams/flamengo' },
              { badge: 'BOT', name: 'Botafogo', value: '64 pts', outlook: 'Estavel', href: '/teams/botafogo' },
              { badge: 'GRE', name: 'Gremio', value: '59 pts', outlook: 'Sob pressao', href: '/teams/gremio' },
            ],
            topGoalscorers: [
              { badge: 'PED', name: 'Pedro', value: '19 gols', outlook: 'Ameaca na area', href: '/players/pedro' },
              { badge: 'VEG', name: 'Raphael Veiga', value: '16 gols', outlook: 'Em alta', href: '/players/raphael-veiga' },
              { badge: 'SUA', name: 'Luis Suarez', value: '15 gols', outlook: 'Vantagem estavel', href: '/players/luis-suarez' },
              { badge: 'HUL', name: 'Hulk', value: '14 gols', outlook: 'Ameaca fisica', href: '/players/hulk' },
            ],
            assists: [
              { badge: 'DEA', name: 'De Arrascaeta', value: '12 assist.', outlook: 'Motor criativo', href: '/players/giorgian-de-arrascaeta' },
              { badge: 'ARI', name: 'Arias', value: '9 assist.', outlook: 'Fornecimento estavel', href: '/players/jhon-arias' },
              { badge: 'PAY', name: 'Payet', value: '8 assist.', outlook: 'Criatividade crescente', href: '/players/dimitri-payet' },
              { badge: 'PAU', name: 'Paulinho', value: '8 assist.', outlook: 'Ameaca pelos lados', href: '/players/paulinho' },
            ],
          },
          {
            label: 'Liga MX',
            standings: [
              { badge: 'AME', name: 'Club America', value: '37 pts', outlook: 'Em alta', href: '/teams/club-america' },
              { badge: 'TIG', name: 'Tigres', value: '33 pts', outlook: 'Estavel', href: '/teams/tigres' },
              { badge: 'MON', name: 'Monterrey', value: '32 pts', outlook: 'Arrancada final', href: '/teams/monterrey' },
              { badge: 'TOL', name: 'Toluca', value: '30 pts', outlook: 'Volatil', href: '/teams/toluca' },
            ],
            topGoalscorers: [
              { badge: 'QUI', name: 'Quiñones', value: '13 gols', outlook: 'Finalizacao forte', href: '/players/julian-quinones' },
              { badge: 'GIG', name: 'Gignac', value: '12 gols', outlook: 'Vantagem estavel', href: '/players/andre-pierre-gignac' },
              { badge: 'CAN', name: 'Brandon Vazquez', value: '11 gols', outlook: 'Ameaca na area', href: '/players/brandon-vazquez' },
              { badge: 'MEN', name: 'Mendez', value: '10 gols', outlook: 'Em alta', href: '/players/alan-mendez' },
            ],
            assists: [
              { badge: 'VAL', name: 'Diego Valdes', value: '9 assist.', outlook: 'Motor criativo', href: '/players/diego-valdes' },
              { badge: 'CORD', name: 'Sebastian Cordova', value: '8 assist.', outlook: 'Criatividade crescente', href: '/players/sebastian-cordova' },
              { badge: 'ROM', name: 'Luis Romo', value: '7 assist.', outlook: 'Fornecimento estavel', href: '/players/luis-romo' },
              { badge: 'AQU', name: 'Aquino', value: '7 assist.', outlook: 'Ameaca pelos lados', href: '/players/javier-aquino' },
            ],
          },
          {
            label: 'MLS',
            standings: [
              { badge: 'MIA', name: 'Inter Miami', value: '34 pts', outlook: 'Em alta', href: '/teams/inter-miami' },
              { badge: 'CIN', name: 'FC Cincinnati', value: '31 pts', outlook: 'Estavel', href: '/teams/fc-cincinnati' },
              { badge: 'LAG', name: 'LA Galaxy', value: '29 pts', outlook: 'Arrancada final', href: '/teams/la-galaxy' },
              { badge: 'CLB', name: 'Columbus Crew', value: '28 pts', outlook: 'Criatividade crescente', href: '/teams/columbus-crew' },
            ],
            topGoalscorers: [
              { badge: 'MES', name: 'Lionel Messi', value: '12 gols', outlook: 'Forma elite', href: '/players/lionel-messi' },
              { badge: 'BEN', name: 'Christian Benteke', value: '11 gols', outlook: 'Ameaca na area', href: '/players/christian-benteke' },
              { badge: 'SUA', name: 'Luis Suarez', value: '10 gols', outlook: 'Vantagem estavel', href: '/players/luis-suarez' },
              { badge: 'CUC', name: 'Cucho Hernandez', value: '9 gols', outlook: 'Em alta', href: '/players/cucho-hernandez' },
            ],
            assists: [
              { badge: 'ALB', name: 'Jordi Alba', value: '8 assist.', outlook: 'Motor criativo', href: '/players/jordi-alba' },
              { badge: 'MES', name: 'Lionel Messi', value: '7 assist.', outlook: 'Fornecimento estavel', href: '/players/lionel-messi' },
              { badge: 'RUS', name: 'Diego Rossi', value: '7 assist.', outlook: 'Criatividade crescente', href: '/players/diego-rossi' },
              { badge: 'ACO', name: 'Luciano Acosta', value: '6 assist.', outlook: 'Camada de controle', href: '/players/luciano-acosta' },
            ],
          },
        ],
      },
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Insights de futebol — simples e direto',
      items: [
        {
          question: 'Como o SirBro gera previsões?',
          answer:
            'Analisa dados históricos, eventos ao vivo e desempenho.',
        },
        {
          question: 'São dicas de aposta?',
          answer:
            'Não. Conteúdo apenas informativo e de entretenimento.',
        },
        {
          question: 'Quais ligas estão disponíveis?',
          answer: 'Principais ligas globais.',
        },
        {
          question: 'É gratuito?',
          answer: 'Sim, com opções premium.',
        },
        {
          question: 'Posso fazer perguntas?',
          answer: 'Sim, via chat.',
        },
      ],
    },
    finalCta: {
      eyebrow: 'Instale o SirBro',
      title: 'Pare de adivinhar. Entenda o jogo.',
      description:
        'Baixe o SirBro e tenha insights mais claros todos os dias.',
      primaryCtaLabel: 'App Store',
      secondaryCtaLabel: 'Explorar insights',
      secondaryStoreCtaLabel: 'Google Play',
    },
  },
};

export function getHomepageContent(locale: Locale): HomepageContent {
  return homepageContent[locale];
}
