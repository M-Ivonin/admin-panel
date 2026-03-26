import type { Locale } from '@/lib/i18n/config';

export interface HomepageStat {
  value: string;
  label: string;
}

export interface HomepageStep {
  step: string;
  title: string;
  description: string;
}

export interface HomepageInsightCard {
  category: string;
  title: string;
  description: string;
  href: string;
}

export interface HomepageTopicCard {
  title: string;
  description: string;
  href: string;
}

export interface HomepageEntityCard {
  label: string;
  title: string;
  description: string;
  href: string;
}

export interface HomepageTrustCard {
  title: string;
  description: string;
  href: string;
}

export interface HomepageFaqItem {
  question: string;
  answer: string;
}

export interface HomepageContent {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    supportingLabel: string;
    supportingText: string;
    stats: HomepageStat[];
    secondaryCtaLabel: string;
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    description: string;
    steps: HomepageStep[];
  };
  trust: {
    eyebrow: string;
    title: string;
    description: string;
    cards: HomepageTrustCard[];
  };
  insights: {
    eyebrow: string;
    title: string;
    description: string;
    featured: HomepageInsightCard;
    items: HomepageInsightCard[];
    ctaLabel: string;
  };
  topics: {
    eyebrow: string;
    title: string;
    description: string;
    items: HomepageTopicCard[];
  };
  entities: {
    eyebrow: string;
    title: string;
    description: string;
    items: HomepageEntityCard[];
  };
  quiz: {
    eyebrow: string;
    title: string;
    description: string;
    cardTitle: string;
    cardDescription: string;
    href: string;
    ctaLabel: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    items: HomepageFaqItem[];
  };
  methodology: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  finalCta: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
}

const homepageContent: Record<Locale, HomepageContent> = {
  en: {
    hero: {
      eyebrow: 'Football intelligence, not noise',
      title: 'Football insights shaped for match outlook, player form, and sharper decisions.',
      description:
        'SirBro turns injury impact, lineup changes, tactical analysis, and stats breakdowns into a clearer football workflow. Follow the signal, understand why it matters, and move from scattered takes to structured insight.',
      supportingLabel: 'What you get',
      supportingText:
        'A dark, data-first app experience with explainable football signals, trust pages, and entity hubs that connect insights to teams, players, leagues, and topics.',
      stats: [
        { value: 'Injury impact', label: 'Track what lineup absences really change' },
        { value: 'Player form', label: 'Read short-term momentum without guesswork' },
        { value: 'Tactical analysis', label: 'See shape, role shifts, and matchup edges' },
      ],
      secondaryCtaLabel: 'See methodology',
    },
    howItWorks: {
      eyebrow: 'How it works',
      title: 'A compact flow built around evidence, interpretation, and action.',
      description:
        'The homepage now works as a real SEO hub: it introduces the product, explains the analysis model, and routes users into the exact content layer they need next.',
      steps: [
        {
          step: '01',
          title: 'Spot the match signal',
          description:
            'Open the latest football insights around player form, lineup changes, match outlook, and statistical context.',
        },
        {
          step: '02',
          title: 'Understand why it matters',
          description:
            'Each insight frames the football angle clearly, so the reader sees context instead of isolated data points.',
        },
        {
          step: '03',
          title: 'Jump deeper by entity',
          description:
            'Move from a single insight into related teams, players, leagues, and topics through the site’s internal linking layer.',
        },
      ],
    },
    trust: {
      eyebrow: 'Trust layer',
      title: 'The public site is supported by methodology, editorial rules, and AI transparency.',
      description:
        'This section builds the trust stack from the roadmap and gives search engines stronger quality signals for a football-analysis product.',
      cards: [
        {
          title: 'About SirBro',
          description: 'What the product covers, who it is for, and where football intelligence fits inside the experience.',
          href: '/about',
        },
        {
          title: 'Methodology',
          description: 'How the product turns signals, evidence, and interpretation into structured football analysis.',
          href: '/methodology',
        },
        {
          title: 'Editorial policy',
          description: 'Source handling, updates, and quality rules for future insights and evergreen content.',
          href: '/editorial-policy',
        },
        {
          title: 'AI transparency',
          description: 'A clear explanation of where automation helps and where human review matters.',
          href: '/ai-transparency',
        },
      ],
    },
    insights: {
      eyebrow: 'Latest insights',
      title: 'Fresh angles on form, match state, and the details that shift expected outcomes.',
      description:
        'The layout leads with one featured insight, then supports it with compact secondary cards to mimic a modern editorial rail instead of a generic blog grid.',
      featured: {
        category: 'Featured insight',
        title: 'How a late lineup change can reshape ball progression before kickoff',
        description:
          'A practical read on injury impact, replacement profiles, and the tactical ripple effects that change the match outlook.',
        href: '/insights',
      },
      items: [
        {
          category: 'Player form',
          title: 'When hot finishing hides a declining chance profile',
          description: 'Use form with the right caveats instead of following headline numbers alone.',
          href: '/insights',
        },
        {
          category: 'Match outlook',
          title: 'What away pressing fatigue means for second-half control',
          description: 'A short scenario read combining schedule load, tactical shape, and state changes.',
          href: '/insights',
        },
        {
          category: 'Lineup changes',
          title: 'Which absences matter more than raw name value',
          description: 'Not every missing player changes the same layer of a team’s structure.',
          href: '/insights',
        },
        {
          category: 'Stats breakdown',
          title: 'How to read volume, quality, and game state together',
          description: 'A more useful lens for football analysis than one-metric snapshots.',
          href: '/insights',
        },
      ],
      ctaLabel: 'Explore all insights',
    },
    topics: {
      eyebrow: 'Trending topics',
      title: 'Entry points for evergreen discovery',
      description:
        'Topic hubs are designed to become strong internal-linking surfaces for recurring football intents, not thin archive pages.',
      items: [
        {
          title: 'Injury impact',
          description: 'Availability, replacements, and role-level consequences.',
          href: '/topics',
        },
        {
          title: 'Lineup changes',
          description: 'Projected elevens, rotation pressure, and tactical reshaping.',
          href: '/topics',
        },
        {
          title: 'Tactical analysis',
          description: 'Pressing triggers, spacing, role use, and matchup dynamics.',
          href: '/topics',
        },
        {
          title: 'Match outlook',
          description: 'Short-form reads on what is likely to decide the game.',
          href: '/topics',
        },
      ],
    },
    entities: {
      eyebrow: 'Teams, players, leagues',
      title: 'A compact entity rail that points users into the future evergreen layer.',
      description:
        'These cards are positioned as bridges between editorial content and upcoming entity hubs, supporting deeper crawl paths from the homepage.',
      items: [
        {
          label: 'Teams',
          title: 'Top team pages',
          description: 'Navigate into club-level context, recent signals, and connected insights.',
          href: '/teams',
        },
        {
          label: 'Players',
          title: 'Player form pages',
          description: 'Track momentum, role, availability, and why the change matters.',
          href: '/players',
        },
        {
          label: 'Leagues',
          title: 'League trend hubs',
          description: 'See recurring patterns, tempo shifts, and competition-level context.',
          href: '/leagues',
        },
      ],
    },
    quiz: {
      eyebrow: 'Featured quiz',
      title: 'A growth surface that supports discovery without overpowering the SEO core.',
      description:
        'Quizzes sit after the main editorial and entity sections so the homepage stays useful for search intent first and engagement second.',
      cardTitle: 'Which football signal do you actually trust before kickoff?',
      cardDescription:
        'A quick interactive route into injury reads, lineup signals, form, and tactical context.',
      href: '/quizzes',
      ctaLabel: 'Browse quizzes',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Clear answers for product, analysis, and trust-related questions.',
      description:
        'This block supports both users and structured data, turning homepage FAQs into a clearer trust and SEO surface.',
      items: [
        {
          question: 'What kind of football insights does SirBro focus on?',
          answer:
            'SirBro focuses on football insights around player form, injury impact, lineup changes, tactical analysis, match outlook, and stats breakdowns that help explain what is changing and why it matters.',
        },
        {
          question: 'Is SirBro only about match picks?',
          answer:
            'No. The product is designed to connect match picks with the reasoning behind them, so readers can move from raw tips into context, signals, and interpretation.',
        },
        {
          question: 'How does the site build trust around its analysis?',
          answer:
            'The public experience is tied to an explicit trust stack that includes About, Methodology, Editorial Policy, AI Transparency, and FAQ surfaces.',
        },
        {
          question: 'Can I explore content by teams, players, leagues, and topics?',
          answer:
            'Yes. The homepage is structured to lead users from featured insights into topic hubs and entity layers that connect related football content together.',
        },
      ],
    },
    methodology: {
      eyebrow: 'About the method',
      title: 'Designed as a premium product surface, backed by a usable analysis model.',
      description:
        'The design direction stays close to the SirBro app: dark surfaces, indigo accents, compact density, and strong editorial hierarchy. The content direction mirrors the roadmap: trust first, then insights, then discovery.',
      primaryCtaLabel: 'Read about SirBro',
      secondaryCtaLabel: 'Open methodology',
    },
    finalCta: {
      eyebrow: 'Ready to explore the product',
      title: 'Move from scattered football takes to a cleaner signal-first workflow.',
      description:
        'Use the homepage as a hub, open the app for deeper exploration, and keep following related insights, topics, teams, players, and leagues from one structure.',
      primaryCtaLabel: 'Download the app',
      secondaryCtaLabel: 'Open insights hub',
    },
  },
  pt: {
    hero: {
      eyebrow: 'Inteligência de futebol, sem ruído',
      title: 'Insights de futebol pensados para match outlook, forma de jogadores e decisões mais claras.',
      description:
        'O SirBro transforma injury impact, lineup changes, tactical analysis e stats breakdowns em um fluxo de leitura mais claro. Você acompanha o sinal, entende por que ele importa e sai de opiniões soltas para uma análise estruturada.',
      supportingLabel: 'O que você encontra',
      supportingText:
        'Uma experiência dark e orientada por dados, com sinais explicáveis de futebol, páginas de confiança e hubs de entidades que conectam insights a times, jogadores, ligas e tópicos.',
      stats: [
        { value: 'Injury impact', label: 'Entenda o que as ausências realmente mudam' },
        { value: 'Player form', label: 'Leia o momento do jogador com mais contexto' },
        { value: 'Tactical analysis', label: 'Veja funções, ajustes e vantagens de matchup' },
      ],
      secondaryCtaLabel: 'Ver metodologia',
    },
    howItWorks: {
      eyebrow: 'Como funciona',
      title: 'Um fluxo compacto construído sobre evidência, interpretação e ação.',
      description:
        'A homepage agora funciona como um SEO hub real: apresenta o produto, explica o modelo de análise e leva o usuário para a próxima camada de conteúdo certa.',
      steps: [
        {
          step: '01',
          title: 'Identifique o sinal do jogo',
          description:
            'Abra os últimos football insights sobre player form, lineup changes, match outlook e contexto estatístico.',
        },
        {
          step: '02',
          title: 'Entenda por que isso importa',
          description:
            'Cada insight enquadra o ângulo do futebol com clareza, para que o leitor veja contexto em vez de dados isolados.',
        },
        {
          step: '03',
          title: 'Aprofunde por entidade',
          description:
            'Saia de um insight isolado para times, jogadores, ligas e tópicos relacionados pela camada de internal linking do site.',
        },
      ],
    },
    trust: {
      eyebrow: 'Camada de confiança',
      title: 'O site público é sustentado por metodologia, regras editoriais e transparência de IA.',
      description:
        'Esta seção constrói a trust stack definida no roadmap e reforça sinais de qualidade para um produto de análise de futebol.',
      cards: [
        {
          title: 'Sobre o SirBro',
          description: 'O que o produto cobre, para quem ele foi feito e como a inteligência de futebol entra na experiência.',
          href: '/about',
        },
        {
          title: 'Metodologia',
          description: 'Como o produto transforma sinais, evidência e interpretação em análise estruturada.',
          href: '/methodology',
        },
        {
          title: 'Política editorial',
          description: 'Regras de fontes, atualização e qualidade para futuros insights e conteúdo evergreen.',
          href: '/editorial-policy',
        },
        {
          title: 'Transparência de IA',
          description: 'Uma explicação clara sobre onde a automação ajuda e onde a revisão humana é essencial.',
          href: '/ai-transparency',
        },
      ],
    },
    insights: {
      eyebrow: 'Últimos insights',
      title: 'Novos ângulos sobre forma, estado do jogo e detalhes que mudam o resultado esperado.',
      description:
        'O layout abre com um insight em destaque e o apoia com cartões compactos, imitando uma rail editorial moderna em vez de um grid de blog genérico.',
      featured: {
        category: 'Insight em destaque',
        title: 'Como uma mudança tardia na escalação pode alterar a progressão da bola antes do jogo',
        description:
          'Uma leitura prática sobre injury impact, perfis de reposição e os efeitos táticos que mudam o match outlook.',
        href: '/insights',
      },
      items: [
        {
          category: 'Player form',
          title: 'Quando uma fase goleadora esconde queda na qualidade das chances',
          description: 'Use a forma recente com os filtros certos, em vez de seguir só o número final.',
          href: '/insights',
        },
        {
          category: 'Match outlook',
          title: 'O que a fadiga de pressão fora de casa muda no controle do segundo tempo',
          description: 'Uma leitura curta que combina calendário, forma tática e estado do jogo.',
          href: '/insights',
        },
        {
          category: 'Lineup changes',
          title: 'Quais ausências importam mais do que o peso do nome',
          description: 'Nem toda baixa mexe com a mesma camada da estrutura de uma equipe.',
          href: '/insights',
        },
        {
          category: 'Stats breakdown',
          title: 'Como ler volume, qualidade e game state ao mesmo tempo',
          description: 'Uma lente mais útil para análise de futebol do que recortes por uma métrica só.',
          href: '/insights',
        },
      ],
      ctaLabel: 'Explorar todos os insights',
    },
    topics: {
      eyebrow: 'Tópicos em alta',
      title: 'Pontos de entrada para descoberta evergreen',
      description:
        'Os hubs de tópicos foram pensados para virar superfícies fortes de internal linking para intenções recorrentes de futebol.',
      items: [
        {
          title: 'Injury impact',
          description: 'Disponibilidade, reposição e consequências por função.',
          href: '/topics',
        },
        {
          title: 'Lineup changes',
          description: 'Prováveis escalações, rotação e reorganização tática.',
          href: '/topics',
        },
        {
          title: 'Tactical analysis',
          description: 'Pressão, ocupação de espaço, função e dinâmicas de matchup.',
          href: '/topics',
        },
        {
          title: 'Match outlook',
          description: 'Leituras curtas do que tende a decidir o jogo.',
          href: '/topics',
        },
      ],
    },
    entities: {
      eyebrow: 'Times, jogadores, ligas',
      title: 'Uma rail compacta de entidades que aponta para a futura camada evergreen.',
      description:
        'Esses cartões funcionam como pontes entre o conteúdo editorial e os hubs de entidades, apoiando caminhos mais profundos de navegação a partir da home.',
      items: [
        {
          label: 'Times',
          title: 'Páginas de times',
          description: 'Entre em contexto de clube, sinais recentes e insights conectados.',
          href: '/teams',
        },
        {
          label: 'Jogadores',
          title: 'Páginas de forma',
          description: 'Acompanhe momento, função, disponibilidade e por que a mudança importa.',
          href: '/players',
        },
        {
          label: 'Ligas',
          title: 'Hubs de tendências',
          description: 'Veja padrões recorrentes, ritmo e contexto em nível de competição.',
          href: '/leagues',
        },
      ],
    },
    quiz: {
      eyebrow: 'Quiz em destaque',
      title: 'Uma superfície de growth que ajuda na descoberta sem dominar o núcleo de SEO.',
      description:
        'Os quizzes aparecem depois das áreas editoriais e de entidades para manter a home útil primeiro para busca e depois para engajamento.',
      cardTitle: 'Em qual sinal de futebol você realmente confia antes do kickoff?',
      cardDescription:
        'Uma rota rápida para injury reads, sinais de escalação, forma recente e contexto tático.',
      href: '/quizzes',
      ctaLabel: 'Explorar quizzes',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Respostas claras para perguntas sobre produto, análise e confiança.',
      description:
        'Este bloco atende o usuário e também a structured data, transformando o FAQ da home em uma superfície mais forte de trust e SEO.',
      items: [
        {
          question: 'Que tipo de football insights o SirBro prioriza?',
          answer:
            'O SirBro prioriza football insights sobre player form, injury impact, lineup changes, tactical analysis, match outlook e stats breakdowns para explicar o que está mudando e por que isso importa.',
        },
        {
          question: 'O SirBro fala só de match picks?',
          answer:
            'Não. O produto foi desenhado para conectar match picks ao raciocínio por trás deles, levando o leitor de dicas soltas para contexto, sinais e interpretação.',
        },
        {
          question: 'Como o site constrói confiança na análise?',
          answer:
            'A experiência pública está ligada a uma trust stack explícita com páginas de About, Methodology, Editorial Policy, AI Transparency e FAQ.',
        },
        {
          question: 'Posso explorar conteúdo por times, jogadores, ligas e tópicos?',
          answer:
            'Sim. A homepage foi estruturada para levar o usuário de insights em destaque até hubs temáticos e camadas de entidades que conectam o conteúdo relacionado.',
        },
      ],
    },
    methodology: {
      eyebrow: 'Sobre o método',
      title: 'Pensado como uma superfície premium de produto, sustentada por um modelo de análise utilizável.',
      description:
        'A direção visual continua próxima do app SirBro: superfícies escuras, acentos em índigo, densidade compacta e hierarquia editorial forte. A direção de conteúdo segue o roadmap: confiança primeiro, depois insights, depois descoberta.',
      primaryCtaLabel: 'Ler sobre o SirBro',
      secondaryCtaLabel: 'Abrir metodologia',
    },
    finalCta: {
      eyebrow: 'Pronto para explorar',
      title: 'Saia de opiniões dispersas sobre futebol para um fluxo mais limpo e orientado por sinais.',
      description:
        'Use a homepage como hub, abra o app para ir mais fundo e continue navegando por insights, tópicos, times, jogadores e ligas em uma única estrutura.',
      primaryCtaLabel: 'Baixar o app',
      secondaryCtaLabel: 'Abrir hub de insights',
    },
  },
  es: {
    hero: {
      eyebrow: 'Inteligencia de fútbol, sin ruido',
      title: 'Insights de fútbol pensados para match outlook, forma de jugadores y decisiones más claras.',
      description:
        'SirBro convierte injury impact, lineup changes, tactical analysis y stats breakdowns en un flujo mucho más claro. Sigues la señal, entiendes por qué importa y pasas de opiniones dispersas a una lectura estructurada.',
      supportingLabel: 'Qué obtienes',
      supportingText:
        'Una experiencia dark y orientada por datos, con señales explicables de fútbol, páginas de confianza y hubs de entidades que conectan insights con equipos, jugadores, ligas y temas.',
      stats: [
        { value: 'Injury impact', label: 'Entiende qué cambian realmente las ausencias' },
        { value: 'Player form', label: 'Lee el momento del jugador con mejor contexto' },
        { value: 'Tactical analysis', label: 'Observa funciones, ajustes y ventajas de matchup' },
      ],
      secondaryCtaLabel: 'Ver metodología',
    },
    howItWorks: {
      eyebrow: 'Cómo funciona',
      title: 'Un flujo compacto construido sobre evidencia, interpretación y acción.',
      description:
        'La homepage ahora funciona como un SEO hub real: presenta el producto, explica el modelo de análisis y envía al usuario a la siguiente capa de contenido correcta.',
      steps: [
        {
          step: '01',
          title: 'Detecta la señal del partido',
          description:
            'Abre los últimos football insights sobre player form, lineup changes, match outlook y contexto estadístico.',
        },
        {
          step: '02',
          title: 'Entiende por qué importa',
          description:
            'Cada insight encuadra el ángulo futbolístico con claridad, para que el lector vea contexto en lugar de datos aislados.',
        },
        {
          step: '03',
          title: 'Profundiza por entidad',
          description:
            'Pasa de un insight concreto a equipos, jugadores, ligas y temas relacionados gracias a la capa de internal linking del sitio.',
        },
      ],
    },
    trust: {
      eyebrow: 'Capa de confianza',
      title: 'El sitio público se apoya en metodología, reglas editoriales y transparencia de IA.',
      description:
        'Esta sección construye la trust stack del roadmap y refuerza señales de calidad para un producto de análisis de fútbol.',
      cards: [
        {
          title: 'Sobre SirBro',
          description: 'Qué cubre el producto, para quién está pensado y cómo encaja la inteligencia futbolística.',
          href: '/about',
        },
        {
          title: 'Metodología',
          description: 'Cómo el producto convierte señales, evidencia e interpretación en análisis estructurado.',
          href: '/methodology',
        },
        {
          title: 'Política editorial',
          description: 'Reglas de fuentes, actualizaciones y calidad para futuros insights y contenido evergreen.',
          href: '/editorial-policy',
        },
        {
          title: 'Transparencia de IA',
          description: 'Una explicación clara de dónde ayuda la automatización y dónde importa la revisión humana.',
          href: '/ai-transparency',
        },
      ],
    },
    insights: {
      eyebrow: 'Últimos insights',
      title: 'Nuevos ángulos sobre forma, estado del partido y detalles que cambian el resultado esperado.',
      description:
        'La composición abre con un insight destacado y lo acompaña con tarjetas compactas, más cerca de una rail editorial moderna que de un blog genérico.',
      featured: {
        category: 'Insight destacado',
        title: 'Cómo un cambio tardío en la alineación puede alterar la progresión del balón antes del partido',
        description:
          'Una lectura práctica sobre injury impact, perfiles de reemplazo y los efectos tácticos que modifican el match outlook.',
        href: '/insights',
      },
      items: [
        {
          category: 'Player form',
          title: 'Cuando la racha goleadora oculta una caída en la calidad de las ocasiones',
          description: 'Usa la forma reciente con los filtros correctos en vez de seguir solo el dato final.',
          href: '/insights',
        },
        {
          category: 'Match outlook',
          title: 'Qué cambia la fatiga de presión visitante en el control del segundo tiempo',
          description: 'Una lectura breve que combina calendario, estructura táctica y game state.',
          href: '/insights',
        },
        {
          category: 'Lineup changes',
          title: 'Qué ausencias pesan más que el valor puro del nombre',
          description: 'No todas las bajas alteran la misma capa de la estructura del equipo.',
          href: '/insights',
        },
        {
          category: 'Stats breakdown',
          title: 'Cómo leer volumen, calidad y game state a la vez',
          description: 'Una lente más útil para el análisis de fútbol que los snapshots de una sola métrica.',
          href: '/insights',
        },
      ],
      ctaLabel: 'Explorar todos los insights',
    },
    topics: {
      eyebrow: 'Temas en tendencia',
      title: 'Puntos de entrada para descubrimiento evergreen',
      description:
        'Los topic hubs están diseñados para convertirse en superficies fuertes de internal linking para intenciones recurrentes de fútbol.',
      items: [
        {
          title: 'Injury impact',
          description: 'Disponibilidad, reemplazos y consecuencias por rol.',
          href: '/topics',
        },
        {
          title: 'Lineup changes',
          description: 'Posibles onces, rotación y reconfiguración táctica.',
          href: '/topics',
        },
        {
          title: 'Tactical analysis',
          description: 'Presión, espacios, roles y dinámicas de matchup.',
          href: '/topics',
        },
        {
          title: 'Match outlook',
          description: 'Lecturas breves sobre lo que probablemente decidirá el partido.',
          href: '/topics',
        },
      ],
    },
    entities: {
      eyebrow: 'Equipos, jugadores, ligas',
      title: 'Una rail compacta de entidades que apunta a la futura capa evergreen.',
      description:
        'Estas tarjetas funcionan como puentes entre el contenido editorial y los hubs de entidades, ayudando a crear rutas más profundas desde la homepage.',
      items: [
        {
          label: 'Equipos',
          title: 'Páginas de equipos',
          description: 'Entra en contexto de club, señales recientes e insights conectados.',
          href: '/teams',
        },
        {
          label: 'Jugadores',
          title: 'Páginas de forma',
          description: 'Sigue momento, rol, disponibilidad y por qué el cambio importa.',
          href: '/players',
        },
        {
          label: 'Ligas',
          title: 'Hubs de tendencia',
          description: 'Observa patrones recurrentes, ritmo y contexto a nivel de competición.',
          href: '/leagues',
        },
      ],
    },
    quiz: {
      eyebrow: 'Quiz destacado',
      title: 'Una superficie de growth que ayuda al descubrimiento sin desplazar el núcleo SEO.',
      description:
        'Los quizzes aparecen después de las secciones editoriales y de entidades para que la homepage siga siendo útil primero para búsqueda y después para engagement.',
      cardTitle: '¿En qué señal de fútbol confías realmente antes del kickoff?',
      cardDescription:
        'Una ruta rápida hacia injury reads, señales de alineación, forma reciente y contexto táctico.',
      href: '/quizzes',
      ctaLabel: 'Explorar quizzes',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Respuestas claras para preguntas de producto, análisis y confianza.',
      description:
        'Este bloque ayuda al usuario y también a la structured data, convirtiendo el FAQ de la homepage en una superficie más fuerte de trust y SEO.',
      items: [
        {
          question: '¿Qué tipo de football insights prioriza SirBro?',
          answer:
            'SirBro prioriza football insights sobre player form, injury impact, lineup changes, tactical analysis, match outlook y stats breakdowns para explicar qué está cambiando y por qué importa.',
        },
        {
          question: '¿SirBro solo trata de match picks?',
          answer:
            'No. El producto está diseñado para conectar los match picks con el razonamiento que hay detrás, llevando al lector desde tips aislados hacia contexto, señales e interpretación.',
        },
        {
          question: '¿Cómo construye confianza el sitio alrededor del análisis?',
          answer:
            'La experiencia pública está conectada a una trust stack explícita con páginas de About, Methodology, Editorial Policy, AI Transparency y FAQ.',
        },
        {
          question: '¿Puedo explorar contenido por equipos, jugadores, ligas y temas?',
          answer:
            'Sí. La homepage está estructurada para llevar al usuario desde insights destacados hacia topic hubs y capas de entidades que conectan contenido relacionado.',
        },
      ],
    },
    methodology: {
      eyebrow: 'Sobre el método',
      title: 'Pensado como una superficie premium de producto, respaldada por un modelo de análisis útil.',
      description:
        'La dirección visual se mantiene cerca de la app SirBro: superficies oscuras, acentos índigo, densidad compacta y jerarquía editorial fuerte. La dirección de contenido sigue el roadmap: confianza primero, luego insights y después descubrimiento.',
      primaryCtaLabel: 'Leer sobre SirBro',
      secondaryCtaLabel: 'Abrir metodología',
    },
    finalCta: {
      eyebrow: 'Listo para explorar',
      title: 'Pasa de opiniones dispersas sobre fútbol a un flujo más limpio y guiado por señales.',
      description:
        'Usa la homepage como hub, abre la app para profundizar y sigue navegando por insights, temas, equipos, jugadores y ligas desde una sola estructura.',
      primaryCtaLabel: 'Descargar la app',
      secondaryCtaLabel: 'Abrir hub de insights',
    },
  },
};

export function getHomepageContent(locale: Locale): HomepageContent {
  return homepageContent[locale];
}
