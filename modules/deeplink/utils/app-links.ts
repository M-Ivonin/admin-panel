import type { ClientDeepLinkConfig } from '@/modules/config/contracts';

const SIRBRO_CLIENT_CONFIG: ClientDeepLinkConfig = {
  appCustomScheme: 'sirbro',
  iosAppStoreUrl:
    process.env.NEXT_PUBLIC_SIRBRO_IOS_APP_STORE_URL ||
    'https://apps.apple.com/us/app/sirbro/id6753070536',
  androidPlayUrl:
    process.env.NEXT_PUBLIC_SIRBRO_ANDROID_PLAY_URL ||
    'https://play.google.com/store/apps/details?id=ai.levantem.sirbro',
};

const TIPSTERBRO_CLIENT_CONFIG: ClientDeepLinkConfig = {
  appCustomScheme: 'tipsterbro',
  iosAppStoreUrl: process.env.NEXT_PUBLIC_TIPSTERBRO_IOS_APP_STORE_URL || '',
  androidPlayUrl:
    process.env.NEXT_PUBLIC_TIPSTERBRO_ANDROID_PLAY_URL ||
    'https://play.google.com/store/apps/details?id=ai.levantem.tipsterbro',
};

export function buildInternalAppDeepLink(path: string, scheme: string) {
  const normalizedPath = normalizeAppPath(path);
  return `${scheme}://${normalizedPath.slice(1)}`;
}

export function resolveClientDeepLinkConfigForHost(
  hostname: string,
  fallback: ClientDeepLinkConfig
): ClientDeepLinkConfig {
  const normalizedHost = hostname.toLowerCase();
  if (
    normalizedHost === 'tipsterbro.com' ||
    normalizedHost.endsWith('.tipsterbro.com')
  ) {
    return TIPSTERBRO_CLIENT_CONFIG;
  }

  if (
    normalizedHost === 'sirbro.com' ||
    normalizedHost.endsWith('.sirbro.com')
  ) {
    return SIRBRO_CLIENT_CONFIG;
  }

  return fallback;
}

export function normalizeAppPath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) {
    return '/';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
