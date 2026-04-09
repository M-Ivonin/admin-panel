import { resolveBrowserApiBaseUrl } from '@/modules/config/runtime';

describe('admin runtime config', () => {
  it('uses local API for localhost', () => {
    expect(resolveBrowserApiBaseUrl('localhost')).toBe(
      'http://localhost:3001/v1'
    );
  });

  it('uses dev API for Vercel preview deployments', () => {
    expect(
      resolveBrowserApiBaseUrl(
        'admin-panel-git-dev-levantem-projects-0af0306a.vercel.app'
      )
    ).toBe('https://api-dev.tipsterbro.com/v1');
  });
});
