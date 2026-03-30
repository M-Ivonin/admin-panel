import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { PUBLIC_PAGE_PATHS } from '@/modules/content/public-pages';
import { buildLocalizedPath } from '@/modules/seo/route-registry';
import { PUBLIC_HUB_PATHS } from '@/modules/public/scaffold-pages';

interface NavigationItem {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  items: NavigationItem[];
}

const labels = {
  home: {
    en: 'Home',
    es: 'Inicio',
    pt: 'Início',
  },
  insights: {
    en: 'Insights',
    es: 'Insights',
    pt: 'Insights',
  },
  explore: {
    en: 'Explore',
    es: 'Explorar',
    pt: 'Explorar',
  },
  quizzes: {
    en: 'Quizzes',
    es: 'Quizzes',
    pt: 'Quizzes',
  },
  about: {
    en: 'About',
    es: 'Sobre',
    pt: 'Sobre',
  },
  aboutSirBro: {
    en: 'About SirBro',
    es: 'Sobre SirBro',
    pt: 'Sobre o SirBro',
  },
  teams: {
    en: 'Teams',
    es: 'Equipos',
    pt: 'Times',
  },
  players: {
    en: 'Players',
    es: 'Jugadores',
    pt: 'Jogadores',
  },
  leagues: {
    en: 'Leagues',
    es: 'Ligas',
    pt: 'Ligas',
  },
  topics: {
    en: 'Topics',
    es: 'Temas',
    pt: 'Temas',
  },
  methodology: {
    en: 'Methodology',
    es: 'Metodología',
    pt: 'Metodologia',
  },
  editorialPolicy: {
    en: 'Editorial Policy',
    es: 'Política Editorial',
    pt: 'Política Editorial',
  },
  aiTransparency: {
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
  product: {
    en: 'Product',
    es: 'Producto',
    pt: 'Produto',
  },
  company: {
    en: 'Company',
    es: 'Empresa',
    pt: 'Empresa',
  },
  legal: {
    en: 'Legal',
    es: 'Legal',
    pt: 'Legal',
  },
  howItWorks: {
    en: 'How It Works',
    es: 'Cómo Funciona',
    pt: 'Como Funciona',
  },
  chatPreview: {
    en: 'Chat Preview',
    es: 'Vista Previa Del Chat',
    pt: 'Prévia Do Chat',
  },
  trendingTopics: {
    en: 'Trending Topics',
    es: 'Temas En Tendencia',
    pt: 'Tópicos Em Alta',
  },
  downloadApp: {
    en: 'Download App',
    es: 'Descargar App',
    pt: 'Baixar App',
  },
  storesSocial: {
    en: 'Stores / Social',
    es: 'Tiendas / Social',
    pt: 'Lojas / Social',
  },
} as const satisfies Record<string, Record<Locale, string>>;

function localizedLabel(key: keyof typeof labels, locale: Locale) {
  return labels[key][locale];
}

function homeHref(locale: Locale) {
  return buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.home);
}

function localizedHref(locale: Locale, path: string) {
  return buildLocalizedPath(locale, path);
}

export function getPublicHeaderNavigation(locale: Locale) {
  return {
    primary: [
      { label: localizedLabel('home', locale), href: homeHref(locale) },
      {
        label: localizedLabel('insights', locale),
        href: localizedHref(locale, PUBLIC_HUB_PATHS.insights),
      },
      {
        label: localizedLabel('explore', locale),
        href: localizedHref(locale, PUBLIC_HUB_PATHS.topics),
      },
      {
        label: localizedLabel('quizzes', locale),
        href: localizedHref(locale, PUBLIC_HUB_PATHS.quizzes),
      },
      {
        label: localizedLabel('about', locale),
        href: localizedHref(locale, PUBLIC_PAGE_PATHS.about),
      },
    ] satisfies NavigationItem[],
    aboutMenu: [
      {
        label: localizedLabel('aboutSirBro', locale),
        href: localizedHref(locale, PUBLIC_PAGE_PATHS.about),
      },
      {
        label: localizedLabel('methodology', locale),
        href: localizedHref(locale, PUBLIC_PAGE_PATHS.methodology),
      },
      {
        label: localizedLabel('editorialPolicy', locale),
        href: localizedHref(locale, PUBLIC_PAGE_PATHS['editorial-policy']),
      },
      {
        label: localizedLabel('aiTransparency', locale),
        href: localizedHref(locale, PUBLIC_PAGE_PATHS['ai-transparency']),
      },
      {
        label: localizedLabel('faq', locale),
        href: localizedHref(locale, PUBLIC_PAGE_PATHS.faq),
      },
      {
        label: localizedLabel('contact', locale),
        href: localizedHref(locale, PUBLIC_PAGE_PATHS.contact),
      },
    ] satisfies NavigationItem[],
    explore: [
      {
        label: localizedLabel('teams', locale),
        href: localizedHref(locale, PUBLIC_HUB_PATHS.teams),
      },
      {
        label: localizedLabel('players', locale),
        href: localizedHref(locale, PUBLIC_HUB_PATHS.players),
      },
      {
        label: localizedLabel('leagues', locale),
        href: localizedHref(locale, PUBLIC_HUB_PATHS.leagues),
      },
      {
        label: localizedLabel('topics', locale),
        href: localizedHref(locale, PUBLIC_HUB_PATHS.topics),
      },
    ] satisfies NavigationItem[],
    cta: {
      label: localizedLabel('downloadApp', locale),
      href: `${homeHref(locale)}#download`,
    } satisfies NavigationItem,
  };
}

export function getPublicFooterSections(locale: Locale): FooterSection[] {
  const t = getDictionary(locale);

  return [
    {
      title: localizedLabel('product', locale),
      items: [
        { label: localizedLabel('home', locale), href: homeHref(locale) },
        {
          label: localizedLabel('downloadApp', locale),
          href: `${homeHref(locale)}#download`,
        },
        {
          label: localizedLabel('howItWorks', locale),
          href: `${homeHref(locale)}#how-it-works`,
        },
      ],
    },
    {
      title: localizedLabel('insights', locale),
      items: [
        {
          label: localizedLabel('insights', locale),
          href: localizedHref(locale, PUBLIC_HUB_PATHS.insights),
        },
        {
          label: localizedLabel('trendingTopics', locale),
          href: localizedHref(locale, PUBLIC_HUB_PATHS.topics),
        },
        {
          label: localizedLabel('quizzes', locale),
          href: localizedHref(locale, PUBLIC_HUB_PATHS.quizzes),
        },
        {
          label: localizedLabel('faq', locale),
          href: localizedHref(locale, PUBLIC_PAGE_PATHS.faq),
        },
      ],
    },
    {
      title: localizedLabel('explore', locale),
      items: [
        {
          label: localizedLabel('teams', locale),
          href: localizedHref(locale, PUBLIC_HUB_PATHS.teams),
        },
        {
          label: localizedLabel('players', locale),
          href: localizedHref(locale, PUBLIC_HUB_PATHS.players),
        },
        {
          label: localizedLabel('leagues', locale),
          href: localizedHref(locale, PUBLIC_HUB_PATHS.leagues),
        },
        {
          label: localizedLabel('topics', locale),
          href: localizedHref(locale, PUBLIC_HUB_PATHS.topics),
        },
      ],
    },
    {
      title: localizedLabel('company', locale),
      items: [
        {
          label: localizedLabel('about', locale),
          href: localizedHref(locale, PUBLIC_PAGE_PATHS.about),
        },
        {
          label: localizedLabel('methodology', locale),
          href: localizedHref(locale, PUBLIC_PAGE_PATHS.methodology),
        },
        {
          label: localizedLabel('editorialPolicy', locale),
          href: localizedHref(locale, PUBLIC_PAGE_PATHS['editorial-policy']),
        },
        {
          label: localizedLabel('aiTransparency', locale),
          href: localizedHref(locale, PUBLIC_PAGE_PATHS['ai-transparency']),
        },
        {
          label: localizedLabel('contact', locale),
          href: localizedHref(locale, PUBLIC_PAGE_PATHS.contact),
        },
      ],
    },
    {
      title: localizedLabel('legal', locale),
      items: [
        {
          label: t.footer.privacy,
          href: localizedHref(locale, PUBLIC_PAGE_PATHS.privacy),
        },
        {
          label: t.footer.terms,
          href: localizedHref(locale, PUBLIC_PAGE_PATHS.terms),
        },
        {
          label: t.footer.disclaimer,
          href: localizedHref(locale, PUBLIC_PAGE_PATHS.disclaimer),
        },
        {
          label: t.footer.cookies,
          href: localizedHref(locale, PUBLIC_PAGE_PATHS.cookies),
        },
      ],
    },
  ];
}
