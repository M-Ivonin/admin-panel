import type { Locale } from '@/lib/i18n/config';
import type {
  QuizHubPage,
  QuizListItem,
  QuizPage,
  QuizResultPage,
  SeoPageBase,
} from '@/modules/content/types';

export type PublicContentPageKey =
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

export type PublicContentRouteType =
  | 'page'
  | 'insight-hub'
  | 'insight'
  | 'team-hub'
  | 'team'
  | 'player-hub'
  | 'player'
  | 'league-hub'
  | 'league'
  | 'topic-hub'
  | 'topic'
  | 'quiz-hub'
  | 'quiz'
  | 'quiz-result';

export interface PublicContentListParams {
  page?: number;
  limit?: number;
}

export interface PublicContentRepository {
  /** Returns the localized public homepage entity. */
  getHome(locale: Locale): Promise<SeoPageBase | null>;

  /** Returns one localized static public page entity. */
  getPage(
    pageKey: PublicContentPageKey,
    locale: Locale
  ): Promise<SeoPageBase | null>;

  /** Resolves one entity by generic route type for legacy scaffold routes. */
  getByRoute(
    type: PublicContentRouteType,
    locale: Locale,
    slug: string
  ): Promise<SeoPageBase | null>;

  /** Lists generic entities for legacy scaffold flows. */
  listByType(
    type: PublicContentRouteType,
    locale: Locale,
    pagination?: PublicContentListParams
  ): Promise<SeoPageBase[]>;

  /** Returns the localized public quiz hub page. */
  getQuizHub(locale: Locale): Promise<QuizHubPage | null>;

  /** Returns one localized public quiz detail page. */
  getQuiz(locale: Locale, slug: string): Promise<QuizPage | null>;

  /** Returns one localized public quiz result page. */
  getQuizResult(
    locale: Locale,
    quizSlug: string,
    resultSlug: string
  ): Promise<QuizResultPage | null>;

  /** Lists the localized quizzes shown on the hub page. */
  listQuizzes(
    locale: Locale,
    pagination?: PublicContentListParams
  ): Promise<QuizListItem[]>;

  /** Lists every route that may safely appear in the sitemap. */
  listIndexableRoutes(): Promise<
    Array<Pick<SeoPageBase, 'locale' | 'canonicalPath' | 'updatedAt'>>
  >;
}
