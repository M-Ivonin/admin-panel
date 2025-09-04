/**
 * Configuration utilities for environment variables
 */

export interface AppConfig {
  appCustomScheme: string;
  appHost: string;
  iosAppStoreUrl: string;
  iosBundle: string;
  iosTeamId: string;
  androidPlayUrl: string;
  androidPackageName: string;
}

/**
 * Gets the app configuration from environment variables
 * @returns App configuration object
 * @throws Error if required environment variables are missing
 */
export function getAppConfig(): AppConfig {
  const config = {
    appCustomScheme: process.env.APP_CUSTOM_SCHEME || 'tipsterbro',
    appHost: process.env.APP_HOST || 'tipsterbro.com',
    iosAppStoreUrl: process.env.IOS_APP_STORE_URL || '',
    iosBundle: process.env.IOS_BUNDLE_ID || '',
    iosTeamId: process.env.IOS_TEAM_ID || 'PLACEHOLDER_TEAM_ID',
    androidPlayUrl: process.env.ANDROID_PLAY_URL || '',
    androidPackageName: process.env.ANDROID_PACKAGE_NAME || '',
  };

  return config;
}

/**
 * Validates that required configuration is present
 * @param config - The app configuration
 * @returns Array of missing required fields
 */
export function validateConfig(config: AppConfig): string[] {
  const missing: string[] = [];
  
  if (!config.appCustomScheme) missing.push('APP_CUSTOM_SCHEME');
  if (!config.appHost) missing.push('APP_HOST');
  
  return missing;
}

/**
 * Gets client-safe configuration (excludes server-only values)
 * @returns Client-safe configuration object
 */
export function getClientConfig() {
  return {
    appCustomScheme: process.env.NEXT_PUBLIC_APP_CUSTOM_SCHEME || 'tipsterbro',
    iosAppStoreUrl: process.env.NEXT_PUBLIC_IOS_APP_STORE_URL || '',
    androidPlayUrl: process.env.NEXT_PUBLIC_ANDROID_PLAY_URL || '',
  };
}