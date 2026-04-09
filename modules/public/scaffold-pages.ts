import type { Locale } from '@/lib/i18n/config';
import { PUBLIC_PAGE_PATHS } from '@/modules/content/public-pages';

export const PUBLIC_HUB_PATHS = {
  insights: '/insights',
  teams: '/teams',
  players: '/players',
  leagues: '/leagues',
  topics: '/topics',
  quizzes: '/quizzes',
} as const;

export const PUBLIC_DETAIL_ROUTE_PATTERNS = {
  insight: '/insights/[slug]',
  team: '/teams/[slug]',
  player: '/players/[slug]',
  league: '/leagues/[slug]',
  topic: '/topics/[slug]',
  quiz: '/quizzes/[slug]',
  quizResult: '/quizzes/[slug]/result/[resultSlug]',
} as const;

export type PublicTrustPageKey =
  | 'about'
  | 'methodology'
  | 'editorial-policy'
  | 'ai-transparency'
  | 'faq'
  | 'contact';

export type PublicHubPageKey = keyof typeof PUBLIC_HUB_PATHS;

export type PublicScaffoldPageKey = PublicTrustPageKey | PublicHubPageKey;

type LocalizedString = Record<Locale, string>;

interface PublicScaffoldPageDefinition {
  path: string;
  category: 'trust' | 'hub';
  title: LocalizedString;
  description: LocalizedString;
  plannedSections: Record<Locale, string[]>;
}

const definitions: Record<PublicScaffoldPageKey, PublicScaffoldPageDefinition> = {
  about: {
    path: PUBLIC_PAGE_PATHS.about,
    category: 'trust',
    title: {
      en: 'About SirBro',
      es: 'Sobre SirBro',
      pt: 'Sobre o SirBro',
    },
    description: {
      en: 'Mission, product positioning, and the trust layer for the public site.',
      es: 'Misión, posicionamiento del producto y capa de confianza para el sitio público.',
      pt: 'Missão, posicionamento do produto e camada de confiança para o site público.',
    },
    plannedSections: {
      en: ['Mission', 'Who SirBro Is', 'Three Product Pillars', 'Global Footprint', 'Fair Play And Transparency'],
      es: ['Misión', 'Qué Es SirBro', 'Tres Pilares Del Producto', 'Presencia Global', 'Juego Limpio Y Transparencia'],
      pt: ['Missão', 'O Que É O SirBro', 'Três Pilares Do Produto', 'Presença Global', 'Jogo Limpo E Transparência'],
    },
  },
  methodology: {
    path: PUBLIC_PAGE_PATHS.methodology,
    category: 'trust',
    title: {
      en: 'Methodology',
      es: 'Metodología',
      pt: 'Metodologia',
    },
    description: {
      en: 'How analysis signals, evidence, and interpretation will be structured across the site.',
      es: 'Cómo se estructurarán las señales, la evidencia y la interpretación del análisis en el sitio.',
      pt: 'Como sinais, evidências e interpretação de análise serão estruturados no site.',
    },
    plannedSections: {
      en: ['Signal Inputs', 'How Facts Become Analysis', 'Review Rules', 'Update Policy'],
      es: ['Entradas De Señales', 'Cómo Los Hechos Se Convierten En Análisis', 'Reglas De Revisión', 'Política De Actualización'],
      pt: ['Entradas De Sinais', 'Como Fatos Viram Análise', 'Regras De Revisão', 'Política De Atualização'],
    },
  },
  'editorial-policy': {
    path: PUBLIC_PAGE_PATHS['editorial-policy'],
    category: 'trust',
    title: {
      en: 'Editorial Policy',
      es: 'Política Editorial',
      pt: 'Política Editorial',
    },
    description: {
      en: 'Source handling, change management, and quality rules for future football content.',
      es: 'Gestión de fuentes, control de cambios y reglas de calidad para el futuro contenido de fútbol.',
      pt: 'Gestão de fontes, controle de mudanças e regras de qualidade para o futuro conteúdo de futebol.',
    },
    plannedSections: {
      en: ['Source Standards', 'Fact Checks', 'Revision Rules', 'Outdated Content Handling'],
      es: ['Estándares De Fuentes', 'Verificación De Hechos', 'Reglas De Revisión', 'Gestión De Contenido Obsoleto'],
      pt: ['Padrões De Fontes', 'Checagem De Fatos', 'Regras De Revisão', 'Tratamento De Conteúdo Desatualizado'],
    },
  },
  'ai-transparency': {
    path: PUBLIC_PAGE_PATHS['ai-transparency'],
    category: 'trust',
    title: {
      en: 'AI Transparency',
      es: 'Transparencia de IA',
      pt: 'Transparência de IA',
    },
    description: {
      en: 'How AI will be used, reviewed, and constrained across SirBro public content.',
      es: 'Cómo se usará, revisará y limitará la IA en el contenido público de SirBro.',
      pt: 'Como a IA será usada, revisada e limitada no conteúdo público do SirBro.',
    },
    plannedSections: {
      en: ['AI Use Cases', 'Human Review', 'Limitations', 'Safeguards'],
      es: ['Casos De Uso De IA', 'Revisión Humana', 'Limitaciones', 'Salvaguardas'],
      pt: ['Casos De Uso De IA', 'Revisão Humana', 'Limitações', 'Salvaguardas'],
    },
  },
  faq: {
    path: PUBLIC_PAGE_PATHS.faq,
    category: 'trust',
    title: {
      en: 'FAQ',
      es: 'Preguntas Frecuentes',
      pt: 'Perguntas Frequentes',
    },
    description: {
      en: 'Planned answers for product, analysis, trust, and platform questions.',
      es: 'Respuestas planificadas para preguntas sobre producto, análisis, confianza y plataforma.',
      pt: 'Respostas planejadas para perguntas sobre produto, análise, confiança e plataforma.',
    },
    plannedSections: {
      en: ['Product Questions', 'Analysis Questions', 'Trust Questions', 'Platform Questions'],
      es: ['Preguntas Del Producto', 'Preguntas De Análisis', 'Preguntas De Confianza', 'Preguntas De La Plataforma'],
      pt: ['Perguntas Do Produto', 'Perguntas De Análise', 'Perguntas De Confiança', 'Perguntas Da Plataforma'],
    },
  },
  contact: {
    path: PUBLIC_PAGE_PATHS.contact,
    category: 'trust',
    title: {
      en: 'Contact',
      es: 'Contacto',
      pt: 'Contato',
    },
    description: {
      en: 'The future public contact surface for support, partnerships, and legal communication.',
      es: 'La futura superficie pública de contacto para soporte, colaboraciones y comunicación legal.',
      pt: 'A futura área pública de contato para suporte, parcerias e comunicação legal.',
    },
    plannedSections: {
      en: ['Support', 'Partnerships', 'Press', 'Legal'],
      es: ['Soporte', 'Colaboraciones', 'Prensa', 'Legal'],
      pt: ['Suporte', 'Parcerias', 'Imprensa', 'Jurídico'],
    },
  },
  insights: {
    path: PUBLIC_HUB_PATHS.insights,
    category: 'hub',
    title: {
      en: 'Insights',
      es: 'Insights',
      pt: 'Insights',
    },
    description: {
      en: 'Hub route for latest insights, analysis clusters, and future long-tail football content.',
      es: 'Ruta hub para insights recientes, clústeres de análisis y futuro contenido long-tail de fútbol.',
      pt: 'Rota hub para insights recentes, clusters de análise e futuro conteúdo long-tail de futebol.',
    },
    plannedSections: {
      en: ['Latest Insights', 'Featured Insight', 'Topic Clusters', 'Entity Shortcuts'],
      es: ['Últimos Insights', 'Insight Destacado', 'Clústeres Temáticos', 'Atajos De Entidades'],
      pt: ['Últimos Insights', 'Insight Em Destaque', 'Clusters Temáticos', 'Atalhos De Entidades'],
    },
  },
  teams: {
    path: PUBLIC_HUB_PATHS.teams,
    category: 'hub',
    title: {
      en: 'Teams',
      es: 'Equipos',
      pt: 'Times',
    },
    description: {
      en: 'Directory hub for team pages and team-related football analysis.',
      es: 'Hub directorio para páginas de equipos y análisis futbolístico relacionado.',
      pt: 'Hub diretório para páginas de times e análise de futebol relacionada.',
    },
    plannedSections: {
      en: ['Featured Teams', 'Latest Team Insights', 'League Connections'],
      es: ['Equipos Destacados', 'Últimos Insights De Equipos', 'Conexiones Con Ligas'],
      pt: ['Times Em Destaque', 'Últimos Insights De Times', 'Conexões Com Ligas'],
    },
  },
  players: {
    path: PUBLIC_HUB_PATHS.players,
    category: 'hub',
    title: {
      en: 'Players',
      es: 'Jugadores',
      pt: 'Jogadores',
    },
    description: {
      en: 'Directory hub for player pages and player-driven analysis surfaces.',
      es: 'Hub directorio para páginas de jugadores y superficies de análisis impulsadas por jugadores.',
      pt: 'Hub diretório para páginas de jogadores e superfícies de análise orientadas por jogadores.',
    },
    plannedSections: {
      en: ['Featured Players', 'Form Signals', 'Role And Usage Links'],
      es: ['Jugadores Destacados', 'Señales De Forma', 'Enlaces De Rol Y Uso'],
      pt: ['Jogadores Em Destaque', 'Sinais De Forma', 'Links De Papel E Uso'],
    },
  },
  leagues: {
    path: PUBLIC_HUB_PATHS.leagues,
    category: 'hub',
    title: {
      en: 'Leagues',
      es: 'Ligas',
      pt: 'Ligas',
    },
    description: {
      en: 'Directory hub for league pages and competition-level analysis clusters.',
      es: 'Hub directorio para páginas de ligas y clústeres de análisis a nivel de competición.',
      pt: 'Hub diretório para páginas de ligas e clusters de análise em nível de competição.',
    },
    plannedSections: {
      en: ['Featured Leagues', 'League Insights', 'Team Clusters'],
      es: ['Ligas Destacadas', 'Insights De Ligas', 'Clústeres De Equipos'],
      pt: ['Ligas Em Destaque', 'Insights De Ligas', 'Clusters De Times'],
    },
  },
  topics: {
    path: PUBLIC_HUB_PATHS.topics,
    category: 'hub',
    title: {
      en: 'Topics',
      es: 'Temas',
      pt: 'Temas',
    },
    description: {
      en: 'Evergreen hub for injuries, lineups, form, tactics, and other football topics.',
      es: 'Hub evergreen para lesiones, alineaciones, forma, táctica y otros temas de fútbol.',
      pt: 'Hub evergreen para lesões, escalações, forma, tática e outros temas de futebol.',
    },
    plannedSections: {
      en: ['Injuries', 'Lineups', 'Form', 'Tactics'],
      es: ['Lesiones', 'Alineaciones', 'Forma', 'Táctica'],
      pt: ['Lesões', 'Escalações', 'Forma', 'Tática'],
    },
  },
  quizzes: {
    path: PUBLIC_HUB_PATHS.quizzes,
    category: 'hub',
    title: {
      en: 'Quizzes',
      es: 'Quizzes',
      pt: 'Quizzes',
    },
    description: {
      en: 'Social and shareable hub for football quizzes, kept outside the core SEO layer.',
      es: 'Hub social y compartible para quizzes de fútbol, mantenido fuera de la capa SEO principal.',
      pt: 'Hub social e compartilhável para quizzes de futebol, mantido fora da camada principal de SEO.',
    },
    plannedSections: {
      en: ['Featured Quizzes', 'Trending Quizzes', 'Shareable Results'],
      es: ['Quizzes Destacados', 'Quizzes En Tendencia', 'Resultados Compartibles'],
      pt: ['Quizzes Em Destaque', 'Quizzes Em Alta', 'Resultados Compartilháveis'],
    },
  },
};

export function getPublicScaffoldPageDefinition(
  key: PublicScaffoldPageKey,
  locale: Locale
) {
  const definition = definitions[key];

  return {
    key,
    category: definition.category,
    path: definition.path,
    title: definition.title[locale],
    description: definition.description[locale],
    plannedSections: definition.plannedSections[locale],
  };
}
