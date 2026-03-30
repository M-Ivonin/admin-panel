import type { Locale } from '@/lib/i18n/config';
import type {
  QuizAxisDefinition,
  QuizLandingStat,
  QuizQuestionDefinition,
  QuizResultDefinition,
} from '@/modules/quizzes/types';

export type LocalizedSlug = {
  locale: Locale;
  slug: string;
};

export type ContentStatus = 'draft' | 'published' | 'archived';
export type Indexability = 'index' | 'noindex';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface SourceReference {
  label: string;
  url: string;
}

export interface AuthorProfile {
  name: string;
  slug?: string;
}

export interface SeoPageBase {
  id: string;
  locale: Locale;
  slug: string;
  status: ContentStatus;
  indexability: Indexability;
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  publishedAt?: string;
  updatedAt?: string;
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Reuses the quiz domain axis definition inside content-facing DTOs.
 */
export type QuizAxisView = QuizAxisDefinition;

/**
 * Reuses the quiz domain question definition inside content-facing DTOs.
 */
export type QuizQuestionView = QuizQuestionDefinition;

/**
 * Reuses the quiz domain result definition inside content-facing DTOs.
 */
export type QuizResultView = QuizResultDefinition;

/**
 * Reuses the quiz domain landing stat definition inside content-facing DTOs.
 */
export type QuizLandingStatView = QuizLandingStat;

/**
 * Describes one quiz card shown on the public quiz hub.
 */
export interface QuizListItem extends SeoPageBase {
  routeType: 'quiz';
  hubSubtitle: string;
  hubStatLine: string;
}

/**
 * Describes the public quiz hub page.
 */
export interface QuizHubPage extends SeoPageBase {
  routeType: 'quiz-hub';
  intro: string;
  quizzes: QuizListItem[];
}

/**
 * Describes one public quiz detail page.
 */
export interface QuizPage extends SeoPageBase {
  routeType: 'quiz';
  eyebrow: string;
  liveBadgeLabel: string;
  heroTitlePrimary: string;
  heroTitleAccent: string;
  landingDescription: string;
  landingEmphasis: string;
  landingStats: QuizLandingStatView[];
  questionnaireLabel: string;
  startButtonLabel: string;
  nextButtonLabel: string;
  finishButtonLabel: string;
  resultHeading: string;
  shareCardLabel: string;
  shareFileBasename: string;
  shareCallToActionLabel: string;
  shareCallToActionUrl: string;
  retakeButtonLabel: string;
  shareButtonLabel: string;
  axes: QuizAxisView[];
  plotCenterLabel: string;
  questions: QuizQuestionView[];
  results: QuizResultView[];
}

/**
 * Describes one public quiz result page.
 */
export interface QuizResultPage extends SeoPageBase {
  routeType: 'quiz-result';
  quizSlug: string;
  resultSlug: string;
  quizTitle: string;
  resultHeading: string;
  result: QuizResultView;
  shareCardLabel: string;
  shareFileBasename: string;
  shareCallToActionLabel: string;
  shareCallToActionUrl: string;
  retakeButtonLabel: string;
  shareButtonLabel: string;
  axes: QuizAxisView[];
  plotCenterLabel: string;
}
