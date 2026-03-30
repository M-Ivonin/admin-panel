import {
  isIndexableContent,
  isIndexableQuiz,
  isIndexableQuizResult,
  isPublishedStatus,
} from '@/modules/content/policy';

describe('content policy', () => {
  it('treats published content as published', () => {
    expect(isPublishedStatus('published')).toBe(true);
    expect(isPublishedStatus('draft')).toBe(false);
    expect(isPublishedStatus('archived')).toBe(false);
  });

  it('allows only published + index content into the indexable set', () => {
    expect(
      isIndexableContent({ status: 'published', indexability: 'index' })
    ).toBe(true);
    expect(
      isIndexableContent({ status: 'published', indexability: 'noindex' })
    ).toBe(false);
    expect(isIndexableContent({ status: 'draft', indexability: 'index' })).toBe(
      false
    );
    expect(
      isIndexableContent({ status: 'archived', indexability: 'index' })
    ).toBe(false);
  });

  it('treats published quiz detail pages as indexable when they opt in', () => {
    expect(
      isIndexableQuiz({ status: 'published', indexability: 'index' })
    ).toBe(true);
    expect(
      isIndexableQuiz({ status: 'published', indexability: 'noindex' })
    ).toBe(false);
  });

  it('keeps quiz result pages out of the index by default', () => {
    expect(
      isIndexableQuizResult({ status: 'published', indexability: 'index' })
    ).toBe(false);
    expect(
      isIndexableQuizResult({ status: 'published', indexability: 'noindex' })
    ).toBe(false);
  });
});
