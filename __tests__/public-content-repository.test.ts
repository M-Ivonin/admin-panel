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
    const page = await staticPublicContentRepository.getByRoute('page', 'es', 'privacy');

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
      ])
    );
    expect(routes.find((route) => route.canonicalPath.includes('/about'))).toBeUndefined();
  });
});
