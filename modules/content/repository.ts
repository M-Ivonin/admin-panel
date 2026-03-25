import type { Locale } from '@/lib/i18n/config';
import type { SeoPageBase } from '@/modules/content/types';

export type PublicContentPageKey =
  | 'home'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'cookies'
  | 'about'
  | 'methodology'
  | 'faq';

export type PublicContentRouteType = 'page' | 'insight' | 'entity' | 'quiz';

export interface PublicContentListParams {
  page?: number;
  limit?: number;
}

export interface PublicContentRepository {
  getHome(locale: Locale): Promise<SeoPageBase | null>;
  getPage(pageKey: PublicContentPageKey, locale: Locale): Promise<SeoPageBase | null>;
  getByRoute(
    type: PublicContentRouteType,
    locale: Locale,
    slug: string
  ): Promise<SeoPageBase | null>;
  listByType(
    type: PublicContentRouteType,
    locale: Locale,
    pagination?: PublicContentListParams
  ): Promise<SeoPageBase[]>;
  listIndexableRoutes(): Promise<Array<Pick<SeoPageBase, 'locale' | 'canonicalPath' | 'updatedAt'>>>;
}
