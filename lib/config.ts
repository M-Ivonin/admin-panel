/**
 * Configuration utilities for environment variables
 */
import type {
  ClientDeepLinkConfig,
  DeepLinkConfig,
} from '@/modules/config/contracts';
import {
  getClientDeepLinkConfig,
  getDeepLinkConfig,
} from '@/modules/config/runtime';

/**
 * Gets the app configuration from environment variables
 * @returns App configuration object
 * @throws Error if required environment variables are missing
 */
export function getAppConfig(): DeepLinkConfig {
  return getDeepLinkConfig();
}

/**
 * Validates that required configuration is present
 * @param config - The app configuration
 * @returns Array of missing required fields
 */
export function validateConfig(config: DeepLinkConfig): string[] {
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
  return getClientDeepLinkConfig();
}

export type AppConfig = DeepLinkConfig;
export type ClientConfig = ClientDeepLinkConfig;
