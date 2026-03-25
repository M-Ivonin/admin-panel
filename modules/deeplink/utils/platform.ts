export type Platform = 'ios' | 'android' | 'desktop';

export interface PlatformInfo {
  platform: Platform;
  userAgent: string;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
}

export function detectPlatform(userAgent?: string): PlatformInfo {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');

  const isIOS = /iPhone|iPad|iPod|iOS/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isDesktop = !isIOS && !isAndroid;

  let platform: Platform;
  if (isIOS) {
    platform = 'ios';
  } else if (isAndroid) {
    platform = 'android';
  } else {
    platform = 'desktop';
  }

  return {
    platform,
    userAgent: ua,
    isIOS,
    isAndroid,
    isDesktop,
  };
}

export function getAppStoreUrl(
  platform: Platform,
  iosUrl?: string,
  androidUrl?: string
): string | null {
  switch (platform) {
    case 'ios':
      return iosUrl || null;
    case 'android':
      return androidUrl || null;
    default:
      return null;
  }
}

export function supportsDeepLinking(platform: Platform): boolean {
  return platform === 'ios' || platform === 'android';
}
