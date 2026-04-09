import type { Locale } from '@/lib/i18n/config';

function repeatForAllLocales<T>(value: T): Record<Locale, T> {
  return { en: value, es: value, pt: value };
}

export const trustLinkLabels: Record<Locale, string[]> = {
  en: ['About SirBro', 'Methodology', 'Editorial Policy', 'AI Transparency', 'FAQ', 'Contact'],
  es: ['Sobre SirBro', 'Metodología', 'Política Editorial', 'Transparencia de IA', 'FAQ', 'Contacto'],
  pt: ['Sobre o SirBro', 'Metodologia', 'Política Editorial', 'Transparência de IA', 'FAQ', 'Contato'],
};

export const heroStoryCardCopy: Record<Locale, string> = {
  en: 'Live match updates, summarized in seconds.',
  es: 'Actualizaciones del partido en vivo, resumidas en segundos.',
  pt: 'Atualizações da partida ao vivo, resumidas em segundos.',
};

export const heroPanelChipLabel: Record<Locale, string> = {
  en: 'Proprietary Sports AI Model',
  es: 'Modelo deportivo propietario',
  pt: 'Modelo esportivo proprietário',
};

export const trustContactRowLabel: Record<Locale, string> = {
  en: 'Contact  ·  Business, support and media inquiries',
  es: 'Contacto  ·  Negocios, soporte y consultas de medios',
  pt: 'Contato  ·  Negócios, suporte e contatos de mídia',
};

export const credibilityPanelCopy: Record<
  Locale,
  { title: string; description: string }
> = {
  en: {
    title: 'Why SirBro is trusted',
    description:
      'Everyone has opinions. We focus on clarity.',
  },
  es: {
    title: 'Por qué SirBro es creíble',
    description:
      'Descubre cómo funciona nuestro análisis, cómo se revisa el contenido y dónde la IA ayuda a convertir datos en decisiones claras.',
  },
  pt: {
    title: 'Por que o SirBro é confiável',
    description:
      'Veja como nossa análise funciona, como o conteúdo é revisado e onde a IA ajuda a transformar dados em decisões claras.',
  },
};

export const showcaseSectionCopy = repeatForAllLocales({
  title: 'See the match board. Ask the analyst. Follow the game state live.',
  description:
    'SirBro turns football noise into a real mobile product: a fast matches overview, actionable AI chat and a live timeline that keeps context visible.',
});

export const methodologySectionTitle = repeatForAllLocales(
  'How SirBro helps you read the match faster.'
);

export const discoverySectionCopy: Record<
  Locale,
  {
    title: string;
    description: string;
    featured: { title: string; description: string; tag: string };
    quiz: { title: string; description: string; cta: string };
    engine: { title: string; description: string; note: string };
  }
> = {
  en: {
    title: 'Discover more from SirBro',
    description:
      'Explore featured insight, try a football quiz and jump into pages for teams, players and leagues without losing the fast app-first feel.',
    featured: {
      title: 'Why Real Madrid look more dangerous when Bellingham starts higher between the lines.',
      description: 'Real Madrid · Jude Bellingham · Tactical analysis · Lineup changes',
      tag: 'This week’s read',
    },
    quiz: {
      title: 'What kind of football thinker are you?',
      description:
        'Take a quick football quiz, compare your instincts and keep exploring SirBro beyond the first scroll.',
      cta: 'Start Quiz',
    },
    engine: {
      title: 'Explore teams, players and leagues',
      description:
        'Each visible name stays crawlable and linked so the homepage supports team pages, player pages, and long-tail football intent.',
      note: 'Follow the names, then go deeper into the pages behind them.',
    },
  },
  es: {
    title: 'Descubre más de SirBro',
    description:
      'Explora un insight destacado, prueba un quiz de fútbol y entra en páginas de equipos, jugadores y ligas sin perder la sensación rápida y app-first.',
    featured: {
      title:
        'Por qué el Real Madrid parece más peligroso cuando Bellingham arranca más arriba entre líneas.',
      description: 'Real Madrid · Jude Bellingham · Análisis táctico · Cambios de alineación',
      tag: 'La lectura de la semana',
    },
    quiz: {
      title: '¿Qué tipo de pensador de fútbol eres?',
      description:
        'Haz un quiz rápido de fútbol, compara tu instinto y sigue explorando SirBro más allá del primer scroll.',
      cta: 'Empezar quiz',
    },
    engine: {
      title: 'Explora equipos, jugadores y ligas',
      description:
        'Cada nombre visible mantiene un enlace crawlable para apoyar páginas de equipos, jugadores e intención long-tail.',
      note: 'Sigue los nombres y luego entra en las páginas que hay detrás.',
    },
  },
  pt: {
    title: 'Descubra mais do SirBro',
    description:
      'Explore um insight em destaque, faça um quiz de futebol e entre nas páginas de times, jogadores e ligas sem perder a sensação rápida e app-first.',
    featured: {
      title:
        'Por que o Real Madrid parece mais perigoso quando Bellingham começa mais alto entrelinhas.',
      description: 'Real Madrid · Jude Bellingham · Análise tática · Mudanças na escalação',
      tag: 'A leitura da semana',
    },
    quiz: {
      title: 'Que tipo de pensador de futebol é você?',
      description:
        'Faça um quiz rápido de futebol, compare seu instinto e continue explorando o SirBro além da primeira rolagem.',
      cta: 'Começar quiz',
    },
    engine: {
      title: 'Explore times, jogadores e ligas',
      description:
        'Cada nome visível continua com link crawlable para apoiar páginas de times, jogadores e intenção long-tail.',
      note: 'Siga os nomes e depois entre nas páginas por trás deles.',
    },
  },
};

export const faqSectionTitle = repeatForAllLocales(
  'Quick answers about how SirBro works, what it covers and what you can do inside the app.'
);

export const finalCtaCopy = repeatForAllLocales({
  title: 'Download SirBro and stay one step ahead of the match.',
  description:
    'Get live football insight, AI chat and match context in one fast mobile experience built for every game day.',
});

export const seoSummaryCards: Record<
  Locale,
  Array<{ eyebrow: string; title: string; description: string }>
> = {
  en: [
    {
      eyebrow: 'Team page',
      title: 'Real Madrid',
      description:
        'Latest form, likely edges and the next big talking points around the club.',
    },
    {
      eyebrow: 'Player page',
      title: 'Kylian Mbappe',
      description:
        'Form, role and matchup context around one of the players shaping the game.',
    },
    {
      eyebrow: 'League page',
      title: 'Premier League',
      description:
        'Standings, top scorers and the storylines setting the pace this week.',
    },
  ],
  es: [
    {
      eyebrow: 'Página de equipo',
      title: 'Real Madrid',
      description:
        'Forma reciente, ventajas probables y los siguientes temas fuertes alrededor del club.',
    },
    {
      eyebrow: 'Página de jugador',
      title: 'Kylian Mbappe',
      description:
        'Forma, rol y contexto del duelo alrededor de uno de los jugadores que marcan el partido.',
    },
    {
      eyebrow: 'Página de liga',
      title: 'Premier League',
      description:
        'Clasificación, goleadores y las historias que marcan el ritmo esta semana.',
    },
  ],
  pt: [
    {
      eyebrow: 'Página de time',
      title: 'Real Madrid',
      description:
        'Forma recente, vantagens prováveis e os próximos grandes assuntos ao redor do clube.',
    },
    {
      eyebrow: 'Página de jogador',
      title: 'Kylian Mbappe',
      description:
        'Forma, papel e contexto de duelo em torno de um dos jogadores que mais moldam o jogo.',
    },
    {
      eyebrow: 'Página de liga',
      title: 'Premier League',
      description:
        'Tabela, artilheiros e as histórias que estão ditando o ritmo nesta semana.',
    },
  ],
};
