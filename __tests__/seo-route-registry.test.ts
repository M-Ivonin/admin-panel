import { getIndexableSitemapEntries } from '@/modules/seo/route-registry';

describe('seo route registry', () => {
  it('includes localized public indexable routes and quiz detail pages only', async () => {
    const entries = await getIndexableSitemapEntries();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        '/en',
        '/es/privacy',
        '/pt/terms',
        '/en/quizzes/tactical-identity',
        '/es/quizzes/fan-archetype',
      ])
    );
    expect(urls.some((url) => url.includes('/invite/'))).toBe(false);
    expect(urls.some((url) => url.includes('/channels/'))).toBe(false);
    expect(urls.some((url) => url.includes('/dashboard'))).toBe(false);
    expect(urls.some((url) => url.includes('/admin-login'))).toBe(false);
    expect(urls.some((url) => url.includes('/result/'))).toBe(false);
  });
});
