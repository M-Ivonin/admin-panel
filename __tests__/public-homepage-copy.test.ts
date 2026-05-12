import { getHomepageContent } from '@/modules/public/homepage-content';
import { getPublicPageSeoCopy } from '@/modules/seo/public-page-copy';

describe('public homepage copy', () => {
  it('uses approved insights wording for English public website copy', () => {
    const content = getHomepageContent('en');
    const seoCopy = getPublicPageSeoCopy('home', 'en');

    expect(content.hero.proof).toBe(
      'Get AI-powered football and soccer real-time insights, match analysis, player and team stats across top leagues including Premier League, La Liga, Serie A, Bundesliga, MLS, and more — all in one app.'
    );
    expect(content.showcase.items[0]).toMatchObject({
      title: 'AI Football Insights',
      description:
        'Get structured insights based on data, not opinion — from safe scenarios to higher-risk outcomes.',
    });
    expect(content.discovery.features).toContain(
      'AI-powered football and soccer insights'
    );
    expect(content.faq.items[0]?.question).toBe(
      'How does SirBro generate football and soccer insights?'
    );
    expect(
      `${content.hero.proof} ${seoCopy.title} ${seoCopy.description}`
    ).not.toMatch(/\bpredictions?\b/i);
  });

  it('keeps localized public homepage copy aligned with insights wording', () => {
    const spanishCopy = JSON.stringify(getHomepageContent('es'));
    const portugueseCopy = JSON.stringify(getHomepageContent('pt'));

    expect(
      `${spanishCopy} ${JSON.stringify(getPublicPageSeoCopy('home', 'es'))}`
    ).not.toMatch(/predicciones?/i);
    expect(
      `${portugueseCopy} ${JSON.stringify(getPublicPageSeoCopy('home', 'pt'))}`
    ).not.toMatch(/previs(?:ão|ões|oes|ao)/i);
  });
});
