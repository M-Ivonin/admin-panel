import type { MetadataRoute } from 'next';
import { i18n, type Locale } from '@/lib/i18n/config';
import type { Indexability } from '@/modules/content/types';
import type { PublicContentPageKey } from '@/modules/content/repository';
import { staticPublicContentRepository } from '@/modules/content/static-public-content-repository';
import { PUBLIC_PAGE_PATHS } from '@/modules/content/public-pages';

export interface SeoRouteRegistryEntry {
  key: PublicContentPageKey;
  path: string;
  indexability: Indexability;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}

const registry: SeoRouteRegistryEntry[] = [
  {
    key: 'home',
    path: PUBLIC_PAGE_PATHS.home,
    indexability: 'index',
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    key: 'privacy',
    path: PUBLIC_PAGE_PATHS.privacy,
    indexability: 'index',
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    key: 'terms',
    path: PUBLIC_PAGE_PATHS.terms,
    indexability: 'index',
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    key: 'disclaimer',
    path: PUBLIC_PAGE_PATHS.disclaimer,
    indexability: 'index',
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    key: 'cookies',
    path: PUBLIC_PAGE_PATHS.cookies,
    indexability: 'index',
    changeFrequency: 'monthly',
    priority: 0.3,
  },
];

/**
 * Returns the fixed SEO registry entries for fully static public pages.
 */
export function getSeoRouteRegistry() {
  return registry;
}

/**
 * Builds one localized path for a route suffix.
 */
export function buildLocalizedPath(locale: Locale, path: string) {
  return `/${locale}${path}`;
}

/**
 * Builds alternate language URLs for one localized route suffix.
 */
export function buildLocalizedAlternates(path: string) {
  return Object.fromEntries(
    i18n.locales.map((locale) => [locale, buildLocalizedPath(locale, path)])
  );
}

/**
 * Returns the sitemap defaults used for repository-driven quiz detail routes.
 */
function getDynamicRouteDefaults(canonicalPath: string) {
  if (/\/quizzes(\/|$)/.test(canonicalPath)) {
    return {
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    };
  }

  return {
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  };
}

/**
 * Returns the merged static + repository-driven indexable sitemap entries.
 */
export async function getIndexableSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const repositoryRoutes =
    await staticPublicContentRepository.listIndexableRoutes();
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();

  repositoryRoutes.forEach((route) => {
    if (route.canonicalPath.includes('/result/')) {
      return;
    }

    const defaults = getDynamicRouteDefaults(route.canonicalPath);
    byUrl.set(route.canonicalPath, {
      url: route.canonicalPath,
      lastModified: route.updatedAt ?? now,
      changeFrequency: defaults.changeFrequency,
      priority: defaults.priority,
    });
  });

  registry
    .filter((entry) => entry.indexability === 'index')
    .flatMap((entry) =>
      i18n.locales.map((locale) => ({
        url: buildLocalizedPath(locale, entry.path),
        lastModified: now,
        changeFrequency: entry.changeFrequency,
        priority: entry.priority,
      }))
    )
    .forEach((entry) => {
      byUrl.set(entry.url, entry);
    });

  return [...byUrl.values()];
}
