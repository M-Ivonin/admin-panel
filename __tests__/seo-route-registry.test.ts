import { getIndexableSitemapEntries } from '@/modules/seo/route-registry';

describe('seo route registry', () => {
  it('includes only localized public indexable routes', () => {
    const entries = getIndexableSitemapEntries();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        '/en',
        '/es/privacy',
        '/pt/terms',
      ])
    );
    expect(urls.some((url) => url.includes('/invite/'))).toBe(false);
    expect(urls.some((url) => url.includes('/channels/'))).toBe(false);
    expect(urls.some((url) => url.includes('/dashboard'))).toBe(false);
    expect(urls.some((url) => url.includes('/admin-login'))).toBe(false);
  });
});
