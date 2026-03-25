import type { Metadata } from 'next';
import { i18n, type Locale } from '@/lib/i18n/config';
import type { SeoPageBase } from '@/modules/content/types';
import { getPublicAppConfig } from '@/modules/config/runtime';
import { buildLocalizedAlternates, buildLocalizedPath } from '@/modules/seo/route-registry';

interface BuildPageMetadataInput {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  index?: boolean;
}

const ogLocales: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  pt: 'pt_PT',
};

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  index = true,
}: BuildPageMetadataInput): Metadata {
  const { appHost } = getPublicAppConfig();
  const metadataBase = new URL(`https://${appHost}`);
  const canonical = buildLocalizedPath(locale, path);

  return {
    title,
    description,
    metadataBase,
    alternates: {
      canonical,
      languages: {
        ...buildLocalizedAlternates(path),
        'x-default': buildLocalizedPath(i18n.defaultLocale, path),
      },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
      siteName: 'SirBro',
      locale: ogLocales[locale],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@sirbro',
    },
    robots: {
      index,
      follow: index,
      googleBot: {
        index,
        follow: index,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function buildContentPageMetadata(page: SeoPageBase): Metadata {
  const localizedPrefix = `/${page.locale}`;
  const path = page.canonicalPath === localizedPrefix
    ? ''
    : page.canonicalPath.replace(localizedPrefix, '');

  return buildPageMetadata({
    locale: page.locale,
    path,
    title: page.metaTitle,
    description: page.metaDescription,
    index: page.indexability === 'index',
  });
}
