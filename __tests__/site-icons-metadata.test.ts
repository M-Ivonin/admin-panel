import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { metadata as adminMetadata } from '@/app/(admin)/layout';
import { metadata as authMetadata } from '@/app/(auth)/layout';
import { metadata as deeplinkMetadata } from '@/app/(deeplink)/layout';
import { metadata as publicMetadata } from '@/app/(public)/layout';
import manifest from '@/public/manifest.json';
import { sirbroSiteIcons } from '@/modules/seo/site-icons';

describe('site icon metadata', () => {
  it('uses SirBro favicon metadata across route group roots', () => {
    expect(adminMetadata.icons).toEqual(sirbroSiteIcons);
    expect(authMetadata.icons).toEqual(sirbroSiteIcons);
    expect(deeplinkMetadata.icons).toEqual(sirbroSiteIcons);
    expect(publicMetadata.icons).toEqual(sirbroSiteIcons);
  });

  it('wires the web manifest touch icon to the SirBro touch icon asset', () => {
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: '/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        }),
      ])
    );
  });

  it('ships real favicon and touch icon files', () => {
    const favicon = readFileSync(join(process.cwd(), 'public/favicon.ico'));
    const appleTouchIcon = statSync(
      join(process.cwd(), 'public/apple-touch-icon.png')
    );

    expect([...favicon.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
    expect(appleTouchIcon.size).toBeGreaterThan(0);
  });
});
