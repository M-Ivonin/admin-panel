import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export type PublicSeoPageKey =
  | 'home'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'cookies'
  | 'about'
  | 'methodology'
  | 'editorial-policy'
  | 'ai-transparency'
  | 'faq'
  | 'contact';

interface PublicSeoCopy {
  title: string;
  description: string;
}

const legalDescriptions: Record<
  Exclude<PublicSeoPageKey, 'home'>,
  Record<Locale, string>
> = {
  privacy: {
    en: 'Learn how SirBro collects, stores, and protects personal data for the SirBro app and website.',
    es: 'Descubre cómo SirBro recopila, almacena y protege los datos personales en la app y el sitio web de SirBro.',
    pt: 'Saiba como o SirBro coleta, armazena e protege dados pessoais no app e no site do SirBro.',
  },
  terms: {
    en: 'Read the SirBro terms of service, product rules, and responsibilities for using the app and website.',
    es: 'Lee los términos de servicio de SirBro, las reglas del producto y las responsabilidades de uso.',
    pt: 'Leia os termos de serviço do SirBro, as regras do produto e as responsabilidades de uso.',
  },
  disclaimer: {
    en: 'Review the SirBro disclaimer for informational use, risk notice, and service limitations.',
    es: 'Consulta el descargo de responsabilidad de SirBro sobre uso informativo, riesgos y limitaciones del servicio.',
    pt: 'Consulte o aviso legal do SirBro sobre uso informativo, riscos e limitações do serviço.',
  },
  cookies: {
    en: 'See how SirBro uses cookies and similar technologies across the website and app experience.',
    es: 'Consulta cómo SirBro usa cookies y tecnologías similares en el sitio web y la app.',
    pt: 'Veja como o SirBro usa cookies e tecnologias semelhantes no site e na experiência do app.',
  },
  about: {
    en: 'Learn what SirBro is building, who the product is for, and how the platform approaches football intelligence.',
    es: 'Descubre qué está construyendo SirBro, para quién es el producto y cómo aborda la inteligencia futbolística.',
    pt: 'Saiba o que o SirBro está construindo, para quem o produto foi feito e como a plataforma aborda inteligência de futebol.',
  },
  methodology: {
    en: 'See how SirBro structures football analysis, signals, and interpretation before full methodology content is published.',
    es: 'Consulta cómo SirBro estructura el análisis, las señales y la interpretación futbolística antes de publicar la metodología completa.',
    pt: 'Veja como o SirBro estrutura análise, sinais e interpretação de futebol antes da publicação completa da metodologia.',
  },
  'editorial-policy': {
    en: 'Review the future editorial standards SirBro will apply to sources, updates, and analysis quality.',
    es: 'Revisa los futuros estándares editoriales que SirBro aplicará a fuentes, actualizaciones y calidad del análisis.',
    pt: 'Revise os futuros padrões editoriais que o SirBro aplicará a fontes, atualizações e qualidade da análise.',
  },
  'ai-transparency': {
    en: 'Understand how SirBro plans to use AI, human review, and safeguards for football analysis pages.',
    es: 'Comprende cómo SirBro planea usar IA, revisión humana y salvaguardas en las páginas de análisis futbolístico.',
    pt: 'Entenda como o SirBro pretende usar IA, revisão humana e salvaguardas nas páginas de análise de futebol.',
  },
  faq: {
    en: 'See the planned FAQ surface for product, analysis, and trust-related questions across the public site.',
    es: 'Consulta la superficie FAQ planificada para preguntas de producto, análisis y confianza en todo el sitio público.',
    pt: 'Veja a área de FAQ planejada para perguntas sobre produto, análise e confiança em todo o site público.',
  },
  contact: {
    en: 'Find the planned contact surface for product, support, legal, and partnership requests.',
    es: 'Encuentra la futura vía de contacto para producto, soporte, asuntos legales y colaboraciones.',
    pt: 'Encontre a futura área de contato para produto, suporte, assuntos legais e parcerias.',
  },
};

const trustTitles: Record<
  Exclude<PublicSeoPageKey, 'home' | 'privacy' | 'terms' | 'disclaimer' | 'cookies'>,
  Record<Locale, string>
> = {
  about: {
    en: 'About SirBro',
    es: 'Sobre SirBro',
    pt: 'Sobre o SirBro',
  },
  methodology: {
    en: 'Methodology',
    es: 'Metodología',
    pt: 'Metodologia',
  },
  'editorial-policy': {
    en: 'Editorial Policy',
    es: 'Política Editorial',
    pt: 'Política Editorial',
  },
  'ai-transparency': {
    en: 'AI Transparency',
    es: 'Transparencia de IA',
    pt: 'Transparência de IA',
  },
  faq: {
    en: 'FAQ',
    es: 'Preguntas Frecuentes',
    pt: 'Perguntas Frequentes',
  },
  contact: {
    en: 'Contact',
    es: 'Contacto',
    pt: 'Contato',
  },
};

function isTrustPageKey(
  pageKey: Exclude<PublicSeoPageKey, 'home'>
): pageKey is keyof typeof trustTitles {
  return pageKey in trustTitles;
}

export function getPublicPageSeoCopy(
  pageKey: PublicSeoPageKey,
  locale: Locale
): PublicSeoCopy {
  const t = getDictionary(locale);

  if (pageKey === 'home') {
    const homeCopy: Record<Locale, PublicSeoCopy> = {
      en: {
        title: 'AI Football Predictions & Match Insights',
        description:
          'Get AI-powered football and soccer predictions, match analysis, and real-time insights. Track teams, players, and matches with SirBro.',
      },
      es: {
        title: 'Predicciones de Fútbol con IA y Análisis de Partidos | SirBro',
        description:
          'Descubre predicciones de fútbol con IA, análisis de partidos e insights en tiempo real. Sigue equipos, jugadores y ligas con SirBro.',
      },
      pt: {
        title: 'Previsões de Futebol com IA e Análise de Partidas | SirBro',
        description:
          'Acesse previsões de futebol com IA, análise de jogos e insights em tempo real. Acompanhe times, jogadores e ligas com SirBro.',
      },
    };

    return homeCopy[locale];
  }

  if (isTrustPageKey(pageKey)) {
    return {
      title: trustTitles[pageKey][locale],
      description: legalDescriptions[pageKey][locale],
    };
  }

  return {
    title: t.footer[pageKey],
    description: legalDescriptions[pageKey][locale],
  };
}
