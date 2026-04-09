import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { PublicScaffoldPage } from '@/components/public/PublicScaffoldPage';
import { staticPublicContentRepository } from '@/modules/content/static-public-content-repository';
import { type PublicContentPageKey } from '@/modules/content/repository';
import { buildPageMetadata, buildContentPageMetadata } from '@/modules/seo/metadata';
import {
  getPublicScaffoldPageDefinition,
  type PublicHubPageKey,
  type PublicTrustPageKey,
} from '@/modules/public/scaffold-pages';

type RouteParams = Promise<{ lang: Locale }>;

export async function generateTrustScaffoldMetadata(
  pageKey: PublicTrustPageKey,
  params: RouteParams
): Promise<Metadata> {
  const { lang } = await params;
  const page = await staticPublicContentRepository.getPage(pageKey as PublicContentPageKey, lang);

  if (!page) {
    return {};
  }

  return buildContentPageMetadata(page);
}

export async function renderTrustScaffoldPage(
  pageKey: PublicTrustPageKey,
  params: RouteParams
) {
  const { lang } = await params;
  const definition = getPublicScaffoldPageDefinition(pageKey, lang);

  return (
    <PublicScaffoldPage
      locale={lang}
      title={definition.title}
      description={definition.description}
      category={definition.category}
      plannedSections={definition.plannedSections}
    />
  );
}

export async function generateHubScaffoldMetadata(
  pageKey: PublicHubPageKey,
  params: RouteParams
): Promise<Metadata> {
  const { lang } = await params;
  const definition = getPublicScaffoldPageDefinition(pageKey, lang);

  return buildPageMetadata({
    locale: lang,
    path: definition.path,
    title: definition.title,
    description: definition.description,
    index: false,
  });
}

export async function renderHubScaffoldPage(
  pageKey: PublicHubPageKey,
  params: RouteParams
) {
  const { lang } = await params;
  const definition = getPublicScaffoldPageDefinition(pageKey, lang);

  return (
    <PublicScaffoldPage
      locale={lang}
      title={definition.title}
      description={definition.description}
      category={definition.category}
      plannedSections={definition.plannedSections}
    />
  );
}
