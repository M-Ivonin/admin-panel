import { i18n, type Locale } from '@/lib/i18n/config';
import { isIndexableQuiz } from '@/modules/content/policy';
import {
  HOME_LABEL,
  buildLocalizedContentPath,
} from '@/modules/content/locale-labels';
import type {
  QuizHubPage,
  QuizListItem,
  QuizPage,
  QuizResultPage,
  SeoPageBase,
} from '@/modules/content/types';
import type { PublicContentListParams } from '@/modules/content/repository';
import {
  buildQuizMetaTitle,
  buildQuizResultMetaTitle,
  getLocalizedQuizDefinition,
  getQuizUiCopy,
  listLocalizedQuizDefinitions,
} from '@/modules/quizzes/localization';

/**
 * Builds breadcrumbs for the public quiz hub route.
 */
function buildHubBreadcrumbs(locale: Locale) {
  const copy = getQuizUiCopy(locale);

  return [
    { label: HOME_LABEL[locale], href: buildLocalizedContentPath(locale, '') },
    {
      label: copy.hubBreadcrumbLabel,
      href: buildLocalizedContentPath(locale, '/quizzes'),
    },
  ];
}

/**
 * Builds breadcrumbs for one localized quiz detail route.
 */
function buildQuizBreadcrumbs(
  locale: Locale,
  quiz: Pick<QuizListItem, 'title' | 'canonicalPath'>
) {
  return [
    ...buildHubBreadcrumbs(locale),
    { label: quiz.title, href: quiz.canonicalPath },
  ];
}

/**
 * Maps one quiz definition into a small hub list item DTO.
 */
function buildQuizListItem(locale: Locale, slug: string): QuizListItem | null {
  const definition = getLocalizedQuizDefinition(locale, slug);
  if (!definition) {
    return null;
  }

  return {
    id: `quiz:${slug}:${locale}`,
    routeType: 'quiz',
    locale,
    slug,
    status: 'published',
    indexability: 'index',
    title: definition.title,
    metaTitle: buildQuizMetaTitle(locale, definition.title),
    metaDescription: `${definition.landingDescription} ${definition.landingEmphasis}`,
    canonicalPath: buildLocalizedContentPath(locale, `/quizzes/${slug}`),
    breadcrumbs: buildHubBreadcrumbs(locale),
    hubSubtitle: definition.hubSubtitle,
    hubStatLine: definition.hubStatLine,
  };
}

/**
 * Builds the localized quiz hub page DTO.
 */
function buildQuizHubPage(locale: Locale): QuizHubPage {
  const copy = getQuizUiCopy(locale);
  const quizzes = listLocalizedQuizDefinitions(locale)
    .map((quiz) => buildQuizListItem(locale, quiz.slug))
    .filter((quiz): quiz is QuizListItem => quiz !== null);

  return {
    id: `quiz-hub:${locale}`,
    routeType: 'quiz-hub',
    locale,
    slug: 'quizzes',
    status: 'published',
    indexability: 'index',
    title: copy.hubTitle,
    metaTitle: copy.hubMetaTitle,
    metaDescription: copy.hubMetaDescription,
    canonicalPath: buildLocalizedContentPath(locale, '/quizzes'),
    breadcrumbs: buildHubBreadcrumbs(locale),
    intro: copy.hubIntro,
    quizzes,
  };
}

/**
 * Builds the localized quiz detail DTO for one quiz slug.
 */
function buildQuizPage(locale: Locale, slug: string): QuizPage | null {
  const definition = getLocalizedQuizDefinition(locale, slug);
  const quizListItem = buildQuizListItem(locale, slug);

  if (!definition || !quizListItem) {
    return null;
  }

  return {
    ...quizListItem,
    breadcrumbs: buildQuizBreadcrumbs(locale, quizListItem),
    eyebrow: definition.eyebrow,
    liveBadgeLabel: definition.liveBadgeLabel,
    heroTitlePrimary: definition.heroTitlePrimary,
    heroTitleAccent: definition.heroTitleAccent,
    landingDescription: definition.landingDescription,
    landingEmphasis: definition.landingEmphasis,
    landingStats: definition.landingStats,
    questionnaireLabel: definition.questionnaireLabel,
    startButtonLabel: definition.startButtonLabel,
    nextButtonLabel: definition.nextButtonLabel,
    finishButtonLabel: definition.finishButtonLabel,
    resultHeading: definition.resultHeading,
    shareCardLabel: definition.shareCardLabel,
    shareFileBasename: definition.shareFileBasename,
    shareCallToActionLabel: definition.shareCallToActionLabel,
    shareCallToActionUrl: definition.shareCallToActionUrl,
    retakeButtonLabel: definition.retakeButtonLabel,
    shareButtonLabel: definition.shareButtonLabel,
    axes: definition.axes,
    plotCenterLabel: definition.plot.centerLabel,
    questions: definition.questions,
    results: definition.results,
  };
}

/**
 * Builds the localized quiz result DTO for one quiz/result slug pair.
 */
function buildQuizResultPage(
  locale: Locale,
  quizSlug: string,
  resultSlug: string
): QuizResultPage | null {
  const definition = getLocalizedQuizDefinition(locale, quizSlug);
  const quizPage = buildQuizPage(locale, quizSlug);
  const result =
    definition?.results.find((entry) => entry.slug === resultSlug) ?? null;

  if (!definition || !quizPage || !result) {
    return null;
  }

  return {
    id: `quiz-result:${quizSlug}:${resultSlug}:${locale}`,
    routeType: 'quiz-result',
    locale,
    slug: `${quizSlug}/result/${resultSlug}`,
    status: 'published',
    indexability: 'noindex',
    title: result.name,
    metaTitle: buildQuizResultMetaTitle(locale, result.name, definition.title),
    metaDescription: result.description,
    canonicalPath: buildLocalizedContentPath(
      locale,
      `/quizzes/${quizSlug}/result/${resultSlug}`
    ),
    breadcrumbs: [
      ...buildQuizBreadcrumbs(locale, quizPage),
      {
        label: result.name,
        href: buildLocalizedContentPath(
          locale,
          `/quizzes/${quizSlug}/result/${resultSlug}`
        ),
      },
    ],
    quizSlug,
    resultSlug,
    quizTitle: definition.title,
    resultHeading: definition.resultHeading,
    result,
    shareCardLabel: definition.shareCardLabel,
    shareFileBasename: definition.shareFileBasename,
    shareCallToActionLabel: definition.shareCallToActionLabel,
    shareCallToActionUrl: definition.shareCallToActionUrl,
    retakeButtonLabel: definition.retakeButtonLabel,
    shareButtonLabel: definition.shareButtonLabel,
    axes: definition.axes,
    plotCenterLabel: definition.plot.centerLabel,
  };
}

/**
 * Exposes the static quiz-backed repository methods used by the public site.
 */
export const staticQuizRepository = {
  /**
   * Returns the localized quiz hub page.
   */
  async getQuizHub(locale: Locale): Promise<QuizHubPage | null> {
    return buildQuizHubPage(locale);
  },

  /**
   * Returns one localized quiz detail page.
   */
  async getQuiz(locale: Locale, slug: string): Promise<QuizPage | null> {
    return buildQuizPage(locale, slug);
  },

  /**
   * Returns one localized quiz result page.
   */
  async getQuizResult(
    locale: Locale,
    quizSlug: string,
    resultSlug: string
  ): Promise<QuizResultPage | null> {
    return buildQuizResultPage(locale, quizSlug, resultSlug);
  },

  /**
   * Lists the localized quiz hub cards in donor order.
   */
  async listQuizzes(
    locale: Locale,
    pagination?: PublicContentListParams
  ): Promise<QuizListItem[]> {
    const quizzes = listLocalizedQuizDefinitions(locale)
      .map((quiz) => buildQuizListItem(locale, quiz.slug))
      .filter((quiz): quiz is QuizListItem => quiz !== null);

    if (!pagination?.limit) {
      return quizzes;
    }

    const pageNumber = pagination.page ?? 1;
    const start = (pageNumber - 1) * pagination.limit;
    return quizzes.slice(start, start + pagination.limit);
  },

  /**
   * Lists only the quiz detail routes that may be indexed.
   */
  async listIndexableRoutes(): Promise<
    Array<Pick<SeoPageBase, 'locale' | 'canonicalPath' | 'updatedAt'>>
  > {
    return i18n.locales
      .flatMap((locale) =>
        listLocalizedQuizDefinitions(locale)
          .map((quiz) => buildQuizPage(locale, quiz.slug))
          .filter(
            (quiz): quiz is QuizPage => quiz !== null && isIndexableQuiz(quiz)
          )
      )
      .map((quiz) => ({
        locale: quiz.locale,
        canonicalPath: quiz.canonicalPath,
        updatedAt: quiz.updatedAt,
      }));
  },
};
