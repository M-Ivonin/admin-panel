import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { staticPublicContentRepository } from '@/modules/content/static-public-content-repository';
import type { PublicContentPageKey } from '@/modules/content/repository';
import { buildContentPageMetadata } from '@/modules/seo/metadata';

export type LegalPageKey = Extract<
  PublicContentPageKey,
  'privacy' | 'terms' | 'disclaimer' | 'cookies'
>;

type RouteParams = Promise<{ lang: Locale }>;

export async function generateLegalPageMetadata(
  pageKey: LegalPageKey,
  params: RouteParams
): Promise<Metadata> {
  const { lang } = await params;
  const page = await staticPublicContentRepository.getPage(pageKey, lang);

  if (!page) {
    return {};
  }

  return buildContentPageMetadata(page);
}
