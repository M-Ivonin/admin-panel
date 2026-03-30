import type { Locale } from '@/lib/i18n/config';

/**
 * Describes the fixed corner positions used by the ternary plot.
 */
export type QuizAxisCorner = 'top' | 'bottom-left' | 'bottom-right';

/**
 * Stores the normalized percentage scores for each quiz axis.
 */
export type QuizScoreMap = Record<string, number>;

/**
 * Defines how one slider answer contributes to an axis at values 0 and 100.
 */
export type QuizAnswerWeight = [number, number];

/**
 * Captures one axis used by quiz scoring and result visualization.
 */
export interface QuizAxisDefinition {
  key: string;
  label: string;
  shortLabel: string;
  corner: QuizAxisCorner;
  hint: string;
  zoneLabel: string;
}

/**
 * Represents one slider-based quiz question.
 */
export interface QuizQuestionDefinition {
  id: number;
  text: string;
  labelLeft: string;
  labelRight: string;
  weights: Record<string, QuizAnswerWeight>;
}

/**
 * Defines one stat chip shown on the quiz landing screen.
 */
export interface QuizLandingStat {
  value: string;
  label: string;
}

/**
 * Describes one stable result page variant for a quiz.
 */
export interface QuizResultDefinition {
  key: string;
  slug: string;
  name: string;
  description: string;
}

/**
 * Encodes one rule used to resolve the dominant quiz result.
 */
export interface QuizResultRule {
  resultKey: string;
  dominantAxisKey?: string;
  secondaryAxisKey?: string;
  secondaryMinScore?: number;
  balanced?: boolean;
}

/**
 * Groups the labels used by the generic ternary plot renderer.
 */
export interface QuizPlotDefinition {
  centerLabel: string;
}

/**
 * Stores the normalized quiz definition consumed by routes and UI.
 */
export interface QuizDefinition {
  slug: string;
  locale: Locale | 'all';
  title: string;
  hubSubtitle: string;
  hubStatLine: string;
  eyebrow: string;
  liveBadgeLabel: string;
  heroTitlePrimary: string;
  heroTitleAccent: string;
  landingDescription: string;
  landingEmphasis: string;
  landingStats: QuizLandingStat[];
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
  questions: QuizQuestionDefinition[];
  axes: QuizAxisDefinition[];
  plot: QuizPlotDefinition;
  results: QuizResultDefinition[];
  balanceThreshold: number;
  resultRules: QuizResultRule[];
}
