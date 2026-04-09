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
      chips: ['Insights de fútbol', 'Volatilidad del partido'],
      title: 'El analista de fútbol más inteligente en tu bolsillo.',
      description:
        'SirBro convierte el estado en vivo del partido, el impacto de lesiones, los cambios de alineación, la forma del jugador y el análisis táctico en decisiones más rápidas y con menos ruido.',
      proof:
        'Modelo deportivo propietario con contexto en vivo, controles editoriales y acceso móvil inmediato.',
      trustLine:
        'Solo para fines de entretenimiento. No aceptamos apuestas. Analizamos el juego.',
      openAppLabel: 'Abrir app',
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
        'Compite con amigos, compara picks y sube en rankings privados construidos alrededor de señales de fútbol.',
    },
    showcase: {
      eyebrow: 'Producto',
      title:
        'Insights que cambian decisiones. Chatea con el analista. Compite con la comunidad.',
      description:
        'La homepage pasa rápido de la promesa al producto mostrando superficies reales de la app en lugar de claims abstractos.',
      items: [
        {
          title: 'Feed de insights',
          description:
            'Sigue impacto de lesiones, giros de momentum y cambios del panorama del partido en un feed claro.',
          accentLabel: 'Impacto de lesión',
          accentValue: 'Titular en duda',
          lines: ['Cambio esperado: +9%', 'Riesgo de presión', 'Alerta tardía'],
        },
        {
          title: 'Widget de chat',
          description:
            'Haz preguntas rápidas de fútbol y recibe respuestas directas sin perder el contexto del partido.',
          accentLabel: 'Prompt en vivo',
          accentValue: 'Ventaja en 2ª parte',
          lines: ['Fatiga de alineación', 'Sobrecarga por banda', 'Riesgo de transición'],
        },
        {
          title: 'Fan Arena',
          description:
            'Convierte inteligencia futbolística en competencia social con rachas, rangos y ligas privadas.',
          accentLabel: 'Leaderboard',
          accentValue: '#2 esta semana',
          lines: ['+18 confianza', '3 picks ganados', 'Liga de amigos'],
        },
      ],
    },
    methodology: {
      eyebrow: 'De señal a acción',
      title: 'Cómo SirBro detecta la señal, añade contexto futbolístico y te ayuda a actuar más rápido.',
      description:
        'Esta sección combina proceso y confianza desde temprano para que la página sea creíble sin convertirse en otro capítulo de confianza.',
      requiredCopy:
        'SirBro procesa millones de patrones históricos y datos de partido en vivo a través de nuestra capa de inteligencia propietaria. No solo mostramos estadísticas; analizamos volatilidad, cambios de alineación y momentum para identificar la señal dentro del ruido.',
      steps: [
        {
          step: '01',
          title: 'Detecta la señal',
          description:
            'Lee estado del partido, forma del jugador, cambios de alineación y volatilidad antes de que sean obvios.',
        },
        {
          step: '02',
          title: 'Añade contexto',
          description:
            'Traduce datos crudos en análisis táctico, momentum y consecuencias futbolísticas por rol.',
        },
        {
          step: '03',
          title: 'Decide o profundiza',
          description:
            'Abre la app, sigue la cadena del insight o salta a páginas de equipos, jugadores, ligas y temas.',
        },
      ],
      trustItems: [
        {
          title: 'Metodología',
          description: 'Mira cómo el modelo convierte estado del partido e historia en insights explicables.',
          href: '/methodology',
        },
        {
          title: 'Política editorial',
          description: 'Entiende las reglas de revisión detrás de insights y actualizaciones públicas.',
          href: '/editorial-policy',
        },
        {
          title: 'IA + revisión humana',
          description: 'Aprende dónde ayuda la automatización y dónde entra el juicio humano.',
          href: '/ai-transparency',
        },
        {
          title: 'Sobre SirBro',
          description: 'Conoce la historia del producto, la capa de confianza y la misión.',
          href: '/about',
        },
      ],
    },
    discovery: {
      eyebrow: 'Funciones',
      title: 'Todo lo que necesitas para obtener insights de fútbol en un solo lugar',
      features: [
        'Predicciones de fútbol impulsadas por IA',
        'Seguimiento en vivo del partido y su timeline',
        'Estadísticas de rendimiento de equipos y jugadores',
        'Análisis táctico e indicadores de momentum',
        'Insights diarios de partidos en las principales ligas',
        'Chat interactivo para preguntas de fútbol al instante',
        'Discusiones de la comunidad y desafíos de partido',
      ],
      useCasesTitle: 'Para quién es SirBro',
      useCases: [
        'Aficionados al fútbol que quieren entender más a fondo el juego',
        'Usuarios que buscan insights de partido estructurados',
        'Entusiastas del deporte guiados por datos',
        'Fans casuales que quieren respuestas más rápidas',
        'Comunidades que comentan partidos en tiempo real',
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
        title: 'Cobertura de las principales ligas de fútbol y soccer del mundo',
        description:
          'SirBro ofrece insights y análisis para:',
        note: 'Y más, con actualización diaria.',
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
      title: 'Insights de fútbol, explicados con claridad',
      description:
        'Estas respuestas refuerzan confianza, aclaran cobertura y preparan la página para FAQPage.',
      items: [
        {
          question: '¿Cómo predice SirBro la volatilidad del partido?',
          answer:
            'SirBro combina patrones históricos, cambios de alineación, disponibilidad de jugadores y variaciones del estado del partido para detectar volatilidad antes de que sea evidente.',
        },
        {
          question: '¿Qué ligas de fútbol cubre?',
          answer:
            'La homepage destaca EPL, La Liga, Serie A, Ligue 1, Brasileirao, Liga MX y MLS, mientras el producto también abre rutas más profundas por equipos, jugadores y temas.',
        },
        {
          question: '¿El chat de SirBro está disponible en español y portugués?',
          answer:
            'Sí. La experiencia pública soporta inglés, español y portugués, y la dirección del chat sigue ese mismo camino multilingüe.',
        },
        {
          question: '¿Cómo compito con amigos en Fan Arena?',
          answer:
            'Abre la app, entra en tu leaderboard de comunidad y compara rachas, picks y lecturas de fútbol con tus amigos dentro de Fan Arena.',
        },
      ],
    },
    finalCta: {
      eyebrow: 'Instala SirBro',
      title: 'Descarga la app, mantén la señal cerca y pasa más rápido del ruido a un insight de fútbol.',
      description:
        'Las CTAs de instalación siguen siendo primarias, mientras los insights quedan a un toque para quien quiera explorar antes.',
      primaryCtaLabel: 'App Store',
      secondaryCtaLabel: 'Explorar insights',
      secondaryStoreCtaLabel: 'Google Play',
    },
  },
  pt: {
    hero: {
      chips: ['Insights de futebol', 'Volatilidade da partida'],
      title: 'O analista de futebol mais inteligente no seu bolso.',
      description:
        'SirBro transforma estado ao vivo da partida, impacto de lesoes, mudancas de escalação, forma do jogador e analise tatica em decisoes mais rapidas e sem ruido.',
      proof:
        'Modelo esportivo proprietario com contexto ao vivo, controles editoriais e acesso movel imediato.',
      trustLine:
        'Apenas para fins de entretenimento. Nao aceitamos apostas. Analisamos o jogo.',
      openAppLabel: 'Abrir app',
      previewTitle: 'Panorama ao vivo',
      previewSubtitle: 'Arsenal vs Liverpool',
      previewHighlights: [
        { label: 'Volatilidade', value: 'Alta' },
        { label: 'Mudanca por escalação', value: '+12%' },
        { label: 'Momento', value: 'Arsenal em alta' },
      ],
      chatPrompt: 'Quem tem vantagem no 2º tempo?',
      fanArenaTitle: 'Fan Arena',
      fanArenaCopy:
        'Compita com amigos, compare picks e suba em rankings privados construidos sobre sinais de futebol.',
    },
    showcase: {
      eyebrow: 'Produto',
      title:
        'Insights que mudam decisoes. Converse com o analista. Compita com a comunidade.',
      description:
        'A homepage vai rapido da promessa ao produto mostrando superficies reais do app em vez de claims abstratos.',
      items: [
        {
          title: 'Feed de insights',
          description:
            'Acompanhe impacto de lesoes, viradas de momentum e mudancas no panorama do jogo em um feed claro.',
          accentLabel: 'Impacto de lesao',
          accentValue: 'Titular em duvida',
          lines: ['Mudanca esperada: +9%', 'Risco de pressao', 'Alerta tardio'],
        },
        {
          title: 'Widget de chat',
          description:
            'Faça perguntas rapidas sobre futebol e receba respostas objetivas sem perder o contexto da partida.',
          accentLabel: 'Prompt ao vivo',
          accentValue: 'Vantagem no 2º tempo',
          lines: ['Fadiga da escalação', 'Sobrecarga pelos lados', 'Risco de transição'],
        },
        {
          title: 'Fan Arena',
          description:
            'Transforme inteligencia de futebol em competicao social com sequencias, ranking e ligas privadas.',
          accentLabel: 'Leaderboard',
          accentValue: '#2 nesta semana',
          lines: ['+18 confianca', '3 picks vencidos', 'Liga de amigos'],
        },
      ],
    },
    methodology: {
      eyebrow: 'Do sinal a acao',
      title: 'Como o SirBro encontra o sinal, adiciona contexto de futebol e ajuda voce a agir mais rapido.',
      description:
        'Esta secao combina processo e confianca cedo para que a pagina pareca crivel sem virar mais um capitulo isolado.',
      requiredCopy:
        'O SirBro processa milhoes de padroes historicos e dados de match-state ao vivo por meio da nossa camada proprietaria de inteligencia. Nao entregamos apenas estatisticas; analisamos volatilidade, mudancas de escalação e momentum para identificar o sinal dentro do ruido.',
      steps: [
        {
          step: '01',
          title: 'Encontre o sinal',
          description:
            'Leia estado da partida, forma do jogador, mudancas de escalação e volatilidade antes que fiquem obvios.',
        },
        {
          step: '02',
          title: 'Adicione contexto',
          description:
            'Transforme dados crus em analise tatica, momentum e consequencias de futebol por funcao.',
        },
        {
          step: '03',
          title: 'Decida ou aprofunde',
          description:
            'Abra o app, siga a trilha do insight ou navegue por paginas de times, jogadores, ligas e topicos.',
        },
      ],
      trustItems: [
        {
          title: 'Metodologia',
          description: 'Veja como o modelo transforma estado do jogo e historico em insights explicaveis.',
          href: '/methodology',
        },
        {
          title: 'Politica editorial',
          description: 'Entenda as regras de revisao por tras dos insights e das atualizacoes publicas.',
          href: '/editorial-policy',
        },
        {
          title: 'IA + revisao humana',
          description: 'Saiba onde a automacao ajuda e onde o julgamento humano segue no circuito.',
          href: '/ai-transparency',
        },
        {
          title: 'Sobre o SirBro',
          description: 'Conheca a historia do produto, a camada de confianca e a missao.',
          href: '/about',
        },
      ],
    },
    discovery: {
      eyebrow: 'Recursos',
      title: 'Tudo o que voce precisa para ter insights de futebol em um so lugar',
      features: [
        'Predicoes de futebol com IA',
        'Acompanhamento ao vivo da partida e timeline',
        'Estatisticas de desempenho de times e jogadores',
        'Analise tatica e indicadores de momentum',
        'Insights diarios de partidas nas principais ligas',
        'Chat interativo para perguntas de futebol em tempo real',
        'Discussoes da comunidade e desafios de partida',
      ],
      useCasesTitle: 'Para quem o SirBro foi feito',
      useCases: [
        'Torcedores que querem entender o jogo com mais profundidade',
        'Usuarios que buscam insights estruturados sobre as partidas',
        'Entusiastas de esporte orientados por dados',
        'Fans casuais que querem respostas mais rapidas',
        'Comunidades que discutem partidas em tempo real',
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
        title: 'Cobertura das principais ligas de futebol do mundo',
        description:
          'O SirBro oferece insights e analises para:',
        note: 'E muito mais, com atualizacao diaria.',
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
          standings: 'Tabela',
          topGoalscorers: 'Artilheiros',
          assists: 'Assistencias',
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
      title: 'Insights de futebol, explicados com clareza',
      description:
        'Essas respostas reforcam confianca, esclarecem cobertura e preparam a pagina para FAQPage.',
      items: [
        {
          question: 'Como o SirBro preve a volatilidade da partida?',
          answer:
            'O SirBro combina padroes historicos, mudancas de escalação, disponibilidade de jogadores e variacoes de match-state para detectar volatilidade antes que ela fique evidente.',
        },
        {
          question: 'Quais ligas de futebol sao cobertas?',
          answer:
            'A homepage destaca EPL, La Liga, Serie A, Ligue 1, Brasileirao, Liga MX e MLS, enquanto o produto tambem abre rotas mais profundas por times, jogadores e topicos.',
        },
        {
          question: 'O chat do SirBro esta disponivel em espanhol e portugues?',
          answer:
            'Sim. A experiencia publica suporta ingles, espanhol e portugues, e a direcao do chat segue esse mesmo caminho multilingue.',
        },
        {
          question: 'Como posso competir com amigos no Fan Arena?',
          answer:
            'Abra o app, entre no leaderboard da sua comunidade e compare sequencias, picks e leituras de futebol com amigos dentro do fluxo do Fan Arena.',
        },
      ],
    },
    finalCta: {
      eyebrow: 'Instale o SirBro',
      title: 'Baixe o app, mantenha o sinal por perto e saia mais rapido do ruido para o insight.',
      description:
        'As CTAs de instalacao continuam primarias, enquanto os insights ficam a um toque para quem quer explorar antes.',
      primaryCtaLabel: 'App Store',
      secondaryCtaLabel: 'Explorar insights',
      secondaryStoreCtaLabel: 'Google Play',
    },
  },
};

export function getHomepageContent(locale: Locale): HomepageContent {
  return homepageContent[locale];
}
