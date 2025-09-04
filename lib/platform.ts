/**
 * Platform detection utilities for mobile deep linking
 */

export type Platform = 'ios' | 'android' | 'desktop';

export interface PlatformInfo {
  platform: Platform;
  userAgent: string;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
}

/**
 * Detects the user's platform based on user agent
 * @param userAgent - The user agent string (defaults to navigator.userAgent)
 * @returns Platform information object
 */
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

/**
 * Gets the appropriate app store URL based on platform
 * @param platform - The detected platform
 * @param iosUrl - iOS App Store URL
 * @param androidUrl - Android Play Store URL
 * @returns The app store URL or null if not available
 */
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

/**
 * Checks if deep linking is supported on the current platform
 * @param platform - The detected platform
 * @returns True if deep linking is supported
 */
export function supportsDeepLinking(platform: Platform): boolean {
  return platform === 'ios' || platform === 'android';
}