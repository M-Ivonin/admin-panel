import { staticPublicContentRepository } from '@/modules/content/static-public-content-repository';

describe('staticPublicContentRepository', () => {
  it('returns a published home entity for localized routes', async () => {
    const page = await staticPublicContentRepository.getHome('en');

    expect(page).toMatchObject({
      locale: 'en',
      slug: '',
      status: 'published',
      indexability: 'index',
      canonicalPath: '/en',
    });
  });

  it('resolves legal pages by route slug', async () => {
    const page = await staticPublicContentRepository.getByRoute(
      'page',
      'es',
      'privacy'
    );

    expect(page).toMatchObject({
      locale: 'es',
      slug: 'privacy',
      canonicalPath: '/es/privacy',
    });
  });

  it('returns scaffolded trust pages as noindex', async () => {
    const page = await staticPublicContentRepository.getPage('about', 'en');

    expect(page).toMatchObject({
      locale: 'en',
      slug: 'about',
      status: 'published',
      indexability: 'noindex',
      canonicalPath: '/en/about',
    });
  });

  it('lists only indexable implemented routes', async () => {
    const routes = await staticPublicContentRepository.listIndexableRoutes();

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ locale: 'en', canonicalPath: '/en' }),
        expect.objectContaining({ locale: 'pt', canonicalPath: '/pt/privacy' }),
        expect.objectContaining({
          locale: 'en',
          canonicalPath: '/en/quizzes/tactical-identity',
        }),
      ])
    );
    expect(
      routes.find((route) => route.canonicalPath.includes('/about'))
    ).toBeUndefined();
    expect(
      routes.find((route) => route.canonicalPath.includes('/result/'))
    ).toBeUndefined();
  });

  it('returns a real quiz hub entity with four cards', async () => {
    const page = await staticPublicContentRepository.getQuizHub('en');

    expect(page).toMatchObject({
      routeType: 'quiz-hub',
      locale: 'en',
      canonicalPath: '/en/quizzes',
      indexability: 'index',
    });
    expect(page?.quizzes).toHaveLength(4);
    expect(page?.quizzes[0]).toMatchObject({
      slug: 'tactical-identity',
      canonicalPath: '/en/quizzes/tactical-identity',
    });
  });

  it('resolves quiz detail pages by slug', async () => {
    const page = await staticPublicContentRepository.getQuiz(
      'en',
      'fan-archetype'
    );

    expect(page).toMatchObject({
      routeType: 'quiz',
      slug: 'fan-archetype',
      title: 'Fan Archetype',
      canonicalPath: '/en/quizzes/fan-archetype',
    });
    expect(page?.questions).toHaveLength(6);
  });

  it('resolves quiz result pages by quiz slug and result slug', async () => {
    const page = await staticPublicContentRepository.getQuizResult(
      'en',
      'fan-archetype',
      'educated-ultra'
    );

    expect(page).toMatchObject({
      routeType: 'quiz-result',
      quizSlug: 'fan-archetype',
      resultSlug: 'educated-ultra',
      canonicalPath: '/en/quizzes/fan-archetype/result/educated-ultra',
      indexability: 'noindex',
    });
    expect(page?.result).toMatchObject({
      name: 'The Educated Ultra',
    });
  });
});
