import { TextDecoder, TextEncoder } from 'util';

Object.assign(globalThis, { TextDecoder, TextEncoder });
const edgeRuntime = jest.requireActual('undici') as Pick<
  typeof globalThis,
  'Request' | 'Response' | 'Headers'
>;
Object.assign(globalThis, edgeRuntime);
const { GET: getAssetLinks } = jest.requireActual(
  '@/app/(deeplink)/.well-known/assetlinks.json/route'
) as typeof import('@/app/(deeplink)/.well-known/assetlinks.json/route');
const { GET: getAppleAssociation } = jest.requireActual(
  '@/app/(deeplink)/.well-known/apple-app-site-association/route'
) as typeof import('@/app/(deeplink)/.well-known/apple-app-site-association/route');

describe('domain app associations', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      APP_HOST: 'sirbro.com',
      IOS_TEAM_ID: 'TEAM123',
      IOS_BUNDLE_ID: 'ai.levantem.sirbro',
      ANDROID_PACKAGE_NAME: 'ai.levantem.sirbro',
      IOS_BUNDLE_IDS: 'ai.levantem.sirbro,ai.levantem.tipsterbro',
      ANDROID_PACKAGE_NAMES: 'ai.levantem.sirbro,ai.levantem.tipsterbro',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it.each([
    ['sirbro.com', 'ai.levantem.sirbro'],
    ['tipsterbro.com', 'ai.levantem.tipsterbro'],
    ['www.sirbro.com', 'ai.levantem.sirbro'],
    ['www.tipsterbro.com', 'ai.levantem.tipsterbro'],
    ['TIPSTERBRO.COM:3107', 'ai.levantem.tipsterbro'],
  ])('associates %s only with %s despite shared deployment settings', async (host, appId) => {
    const androidResponse = await getAssetLinks(new Request(
      'http://localhost:3107/.well-known/assetlinks.json',
      { headers: { host } }
    ));
    const statements = await androidResponse.json();

    expect(androidResponse.status).toBe(200);
    expect(androidResponse.headers.get('content-type')).toContain('application/json');
    expect(statements).toHaveLength(1);
    expect(statements[0]).toEqual({
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: appId,
        sha256_cert_fingerprints: expect.arrayContaining([expect.any(String)]),
      },
    });

    const appleResponse = await getAppleAssociation(new Request(
      'http://localhost:3107/.well-known/apple-app-site-association',
      { headers: { host } }
    ));
    const association = await appleResponse.json();

    expect(appleResponse.status).toBe(200);
    expect(association.applinks.details).toHaveLength(1);
    expect(association.applinks.details[0].appIDs).toEqual([`TEAM123.${appId}`]);
    expect(association.webcredentials.apps).toEqual([`TEAM123.${appId}`]);
  });
});
