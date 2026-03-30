import type {
  ContentStatus,
  Indexability,
  QuizPage,
  QuizResultPage,
  SeoPageBase,
} from '@/modules/content/types';

/**
 * Returns whether one content status should be treated as published.
 */
export function isPublishedStatus(status: ContentStatus) {
  return status === 'published';
}

/**
 * Returns whether one generic content entity may be indexed.
 */
export function isIndexableContent({
  status,
  indexability,
}:
  | Pick<SeoPageBase, 'status' | 'indexability'>
  | {
      status: ContentStatus;
      indexability: Indexability;
    }) {
  return isPublishedStatus(status) && indexability === 'index';
}

/**
 * Returns whether one quiz detail page may be indexed.
 */
export function isIndexableQuiz(
  page: Pick<QuizPage, 'status' | 'indexability'>
) {
  return isIndexableContent(page);
}

/**
 * Returns whether one quiz result page may be indexed.
 */
export function isIndexableQuizResult(
  page: Pick<QuizResultPage, 'status' | 'indexability'>
) {
  void page;
  return false;
}
