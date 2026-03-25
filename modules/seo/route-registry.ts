import type { MetadataRoute } from 'next';
import { i18n, type Locale } from '@/lib/i18n/config';
import type { Indexability } from '@/modules/content/types';
import type { PublicContentPageKey } from '@/modules/content/repository';
import { PUBLIC_PAGE_PATHS } from '@/modules/content/public-pages';

export interface SeoRouteRegistryEntry {
  key: PublicContentPageKey;
  path: string;
  indexability: Indexability;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}

const registry: SeoRouteRegistryEntry[] = [
  { key: 'home', path: PUBLIC_PAGE_PATHS.home, indexability: 'index', changeFrequency: 'daily', priority: 1 },
  { key: 'privacy', path: PUBLIC_PAGE_PATHS.privacy, indexability: 'index', changeFrequency: 'monthly', priority: 0.4 },
  { key: 'terms', path: PUBLIC_PAGE_PATHS.terms, indexability: 'index', changeFrequency: 'monthly', priority: 0.4 },
  { key: 'disclaimer', path: PUBLIC_PAGE_PATHS.disclaimer, indexability: 'index', changeFrequency: 'monthly', priority: 0.4 },
  { key: 'cookies', path: PUBLIC_PAGE_PATHS.cookies, indexability: 'index', changeFrequency: 'monthly', priority: 0.3 },
];

export function getSeoRouteRegistry() {
  return registry;
}

export function buildLocalizedPath(locale: Locale, path: string) {
  return `/${locale}${path}`;
}

export function buildLocalizedAlternates(path: string) {
  return Object.fromEntries(
    i18n.locales.map((locale) => [locale, buildLocalizedPath(locale, path)])
  );
}

export function getIndexableSitemapEntries(): MetadataRoute.Sitemap {
  const now = new Date();

  return registry
    .filter((entry) => entry.indexability === 'index')
    .flatMap((entry) =>
      i18n.locales.map((locale) => ({
        url: buildLocalizedPath(locale, entry.path),
        lastModified: now,
        changeFrequency: entry.changeFrequency,
        priority: entry.priority,
      }))
    );
}
