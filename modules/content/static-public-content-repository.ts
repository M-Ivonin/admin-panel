import { i18n, type Locale } from '@/lib/i18n/config';
import { getPublicPageSeoCopy } from '@/modules/seo/public-page-copy';
import {
  IMPLEMENTED_PUBLIC_PAGE_KEYS,
  type ImplementedPublicPageKey,
  PUBLIC_PAGE_PATHS,
} from '@/modules/content/public-pages';
import { isIndexableContent } from '@/modules/content/policy';
import {
  HOME_LABEL,
  buildLocalizedContentPath,
} from '@/modules/content/locale-labels';
import { staticQuizRepository } from '@/modules/content/static-quiz-repository';
import type {
  PublicContentListParams,
  PublicContentPageKey,
  PublicContentRepository,
  PublicContentRouteType,
} from '@/modules/content/repository';
import type { BreadcrumbItem, SeoPageBase } from '@/modules/content/types';

const STATIC_PAGE_INDEXABILITY: Record<
  ImplementedPublicPageKey,
  SeoPageBase['indexability']
> = {
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

/**
 * Builds breadcrumbs for one implemented static public page.
 */
function buildBreadcrumbs(
  pageKey: ImplementedPublicPageKey,
  locale: Locale
): BreadcrumbItem[] {
  if (pageKey === 'home') {
    return [
      {
        label: HOME_LABEL[locale],
        href: buildLocalizedContentPath(locale, ''),
      },
    ];
  }

  const seoCopy = getPublicPageSeoCopy(pageKey, locale);

  return [
    {
      label: HOME_LABEL[locale],
      href: buildLocalizedContentPath(locale, ''),
    },
    {
      label: seoCopy.title,
      href: buildLocalizedContentPath(locale, PUBLIC_PAGE_PATHS[pageKey]),
    },
  ];
}

/**
 * Maps one static page key into a localized SEO page DTO.
 */
function buildPageEntity(
  pageKey: PublicContentPageKey,
  locale: Locale
): SeoPageBase | null {
  if (
    !IMPLEMENTED_PUBLIC_PAGE_KEYS.includes(pageKey as ImplementedPublicPageKey)
  ) {
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
    canonicalPath: buildLocalizedContentPath(locale, path),
    breadcrumbs: buildBreadcrumbs(implementedPageKey, locale),
  };
}

/**
 * Resolves one implemented public page key from a route slug.
 */
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
  /** Returns the localized public homepage entity. */
  async getHome(locale: Locale) {
    return buildPageEntity('home', locale);
  },

  /** Returns one localized static public page entity. */
  async getPage(pageKey: PublicContentPageKey, locale: Locale) {
    return buildPageEntity(pageKey, locale);
  },

  /** Resolves legacy scaffold routes through the static page map only. */
  async getByRoute(type: PublicContentRouteType, locale: Locale, slug: string) {
    if (type !== 'page') {
      return null;
    }

    const pageKey = resolveImplementedPageBySlug(slug);
    return pageKey ? buildPageEntity(pageKey, locale) : null;
  },

  /** Lists legacy scaffold entities for the page route type only. */
  async listByType(
    type: PublicContentRouteType,
    locale: Locale,
    pagination?: PublicContentListParams
  ) {
    if (type !== 'page') {
      return [];
    }

    const pages = IMPLEMENTED_PUBLIC_PAGE_KEYS.map((pageKey) =>
      buildPageEntity(pageKey, locale)
    ).filter((page): page is SeoPageBase => page !== null);

    if (!pagination?.limit) {
      return pages;
    }

    const pageNumber = pagination.page ?? 1;
    const start = (pageNumber - 1) * pagination.limit;
    return pages.slice(start, start + pagination.limit);
  },

  /** Returns the localized quiz hub entity. */
  async getQuizHub(locale: Locale) {
    return staticQuizRepository.getQuizHub(locale);
  },

  /** Returns one localized quiz detail entity. */
  async getQuiz(locale: Locale, slug: string) {
    return staticQuizRepository.getQuiz(locale, slug);
  },

  /** Returns one localized quiz result entity. */
  async getQuizResult(locale: Locale, quizSlug: string, resultSlug: string) {
    return staticQuizRepository.getQuizResult(locale, quizSlug, resultSlug);
  },

  /** Lists localized quiz hub cards. */
  async listQuizzes(locale: Locale, pagination?: PublicContentListParams) {
    return staticQuizRepository.listQuizzes(locale, pagination);
  },

  /** Lists the full indexable route set exposed by the static repository composition root. */
  async listIndexableRoutes() {
    const now = new Date().toISOString();

    const staticRoutes = IMPLEMENTED_PUBLIC_PAGE_KEYS.flatMap((pageKey) =>
      i18n.locales.map((locale) => buildPageEntity(pageKey, locale))
    )
      .filter(
        (page): page is SeoPageBase => page !== null && isIndexableContent(page)
      )
      .map((page) => ({
        locale: page.locale,
        canonicalPath: page.canonicalPath,
        updatedAt: page.updatedAt ?? now,
      }));

    const quizRoutes = (await staticQuizRepository.listIndexableRoutes()).map(
      (route) => ({
        ...route,
        updatedAt: route.updatedAt ?? now,
      })
    );

    return [...staticRoutes, ...quizRoutes];
  },
};
