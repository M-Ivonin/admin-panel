import type { Locale } from '@/lib/i18n/config';
import { buildLocalizedPath, getSeoRouteRegistry } from '@/modules/seo/route-registry';
import { getPublicPageSeoCopy } from '@/modules/seo/public-page-copy';
import {
  IMPLEMENTED_PUBLIC_PAGE_KEYS,
  type ImplementedPublicPageKey,
  PUBLIC_PAGE_PATHS,
} from '@/modules/content/public-pages';
import { isIndexableContent } from '@/modules/content/policy';
import type {
  PublicContentListParams,
  PublicContentPageKey,
  PublicContentRepository,
  PublicContentRouteType,
} from '@/modules/content/repository';
import type { BreadcrumbItem, SeoPageBase } from '@/modules/content/types';

const HOME_LABEL: Record<Locale, string> = {
  en: 'Home',
  es: 'Inicio',
  pt: 'Início',
};

const STATIC_PAGE_INDEXABILITY: Record<ImplementedPublicPageKey, SeoPageBase['indexability']> = {
  home: 'index',
  privacy: 'index',
  terms: 'index',
  disclaimer: 'index',
  cookies: 'index',
  about: 'noindex',
  methodology: 'noindex',
  'editorial-policy': 'noindex',
  'ai-transparency': 'noindex',
  faq: 'noindex',
  contact: 'noindex',
};

function buildBreadcrumbs(pageKey: ImplementedPublicPageKey, locale: Locale): BreadcrumbItem[] {
  if (pageKey === 'home') {
    return [{ label: HOME_LABEL[locale], href: buildLocalizedPath(locale, '') }];
  }

  const seoCopy = getPublicPageSeoCopy(pageKey, locale);

  return [
    { label: HOME_LABEL[locale], href: buildLocalizedPath(locale, '') },
    { label: seoCopy.title, href: buildLocalizedPath(locale, PUBLIC_PAGE_PATHS[pageKey]) },
  ];
}

function buildPageEntity(pageKey: PublicContentPageKey, locale: Locale): SeoPageBase | null {
  if (!IMPLEMENTED_PUBLIC_PAGE_KEYS.includes(pageKey as ImplementedPublicPageKey)) {
    return null;
  }

  const implementedPageKey = pageKey as ImplementedPublicPageKey;

  const seoCopy = getPublicPageSeoCopy(implementedPageKey, locale);
  const path = PUBLIC_PAGE_PATHS[implementedPageKey];

  return {
    id: `${implementedPageKey}:${locale}`,
    locale,
    slug: path.replace(/^\//, ''),
    status: 'published',
    indexability: STATIC_PAGE_INDEXABILITY[implementedPageKey],
    title: seoCopy.title,
    metaTitle: seoCopy.title,
    metaDescription: seoCopy.description,
    canonicalPath: buildLocalizedPath(locale, path),
    breadcrumbs: buildBreadcrumbs(implementedPageKey, locale),
  };
}

function resolveImplementedPageBySlug(slug: string) {
  return IMPLEMENTED_PUBLIC_PAGE_KEYS.find((pageKey) => {
    const path = PUBLIC_PAGE_PATHS[pageKey];
    if (!path) {
      return slug === '';
    }

    return path.replace(/^\//, '') === slug;
  });
}

export const staticPublicContentRepository: PublicContentRepository = {
  async getHome(locale: Locale) {
    return buildPageEntity('home', locale);
  },

  async getPage(pageKey: PublicContentPageKey, locale: Locale) {
    return buildPageEntity(pageKey, locale);
  },

  async getByRoute(type: PublicContentRouteType, locale: Locale, slug: string) {
    if (type !== 'page') {
      return null;
    }

    const pageKey = resolveImplementedPageBySlug(slug);
    return pageKey ? buildPageEntity(pageKey, locale) : null;
  },

  async listByType(
    type: PublicContentRouteType,
    locale: Locale,
    pagination?: PublicContentListParams
  ) {
    if (type !== 'page') {
      return [];
    }

    const pages = IMPLEMENTED_PUBLIC_PAGE_KEYS.map((pageKey) => buildPageEntity(pageKey, locale))
      .filter((page): page is SeoPageBase => page !== null);

    if (!pagination?.limit) {
      return pages;
    }

    const pageNumber = pagination.page ?? 1;
    const start = (pageNumber - 1) * pagination.limit;
    return pages.slice(start, start + pagination.limit);
  },

  async listIndexableRoutes() {
    const now = new Date().toISOString();

    return getSeoRouteRegistry()
      .flatMap((entry) =>
        ['en', 'es', 'pt'].map((locale) => buildPageEntity(entry.key, locale as Locale))
      )
      .filter((page): page is SeoPageBase => page !== null && isIndexableContent(page))
      .map((page) => ({
        locale: page.locale,
        canonicalPath: page.canonicalPath,
        updatedAt: page.updatedAt ?? now,
      }));
  },
};
