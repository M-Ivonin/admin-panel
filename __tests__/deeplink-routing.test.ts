import { DEEPLINK_ROUTE_PREFIXES } from '@/modules/deeplink/constants';
import {
  buildInternalAppDeepLink,
  resolveClientDeepLinkConfigForHost,
} from '@/modules/deeplink/utils/app-links';

describe('deep link routing', () => {
  it('keeps external match links on the public deep-link route', () => {
    for (const pathname of [
      '/matches/12345',
      '/profile/support-chat',
      '/settings',
      '/setup-content-preferences',
    ]) {
      expect(
        DEEPLINK_ROUTE_PREFIXES.some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
        )
      ).toBe(true);
    }
  });

  it('builds internal app scheme links from public paths', () => {
    expect(
      buildInternalAppDeepLink('/matches/12345?source=push', 'tipsterbro')
    ).toBe('tipsterbro://matches/12345?source=push');
    expect(buildInternalAppDeepLink('/?tab=offers', 'sirbro')).toBe(
      'sirbro://?tab=offers'
    );
  });

  it('selects TipsterBro redirect settings on the TipsterBro domain', () => {
    const config = resolveClientDeepLinkConfigForHost('tipsterbro.com', {
      appCustomScheme: 'sirbro',
      iosAppStoreUrl: 'https://apps.apple.com/us/app/sirbro/id6753070536',
      androidPlayUrl:
        'https://play.google.com/store/apps/details?id=ai.levantem.sirbro',
    });

    expect(config.appCustomScheme).toBe('tipsterbro');
    expect(config.androidPlayUrl).toBe(
      'https://play.google.com/store/apps/details?id=ai.levantem.tipsterbro'
    );
  });
});
