import { i18n } from '@/lib/i18n/config';
import type {
  AdminAppConfig,
  ClientDeepLinkConfig,
  DeepLinkConfig,
  PublicAppConfig,
} from './contracts';

function resolveApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

    if (isLocalhost) {
      return 'http://localhost:3001/v1';
    }
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'https://api.tipsterbro.com/v1';
}

export function getPublicAppConfig(): PublicAppConfig {
  const apiBaseUrl = resolveApiBaseUrl();

  return {
    appHost: process.env.APP_HOST || 'sirbro.com',
    defaultLocale: i18n.defaultLocale,
    supportedLocales: i18n.locales,
    apiBaseUrl,
    chatWidgetUrl:
      process.env.NEXT_PUBLIC_CHATBOT_WIDGET_URL ||
      'https://chatbot-widget-alpha-two.vercel.app/sirbro-chat.js',
    chatApiUrl: process.env.NEXT_PUBLIC_API_URL || apiBaseUrl,
    showMarkdown: process.env.SHOW_MARKDOWN ?? 'true',
  };
}

export function getAdminAppConfig(): AdminAppConfig {
  return {
    apiBaseUrl: resolveApiBaseUrl(),
  };
}

export function getDeepLinkConfig(): DeepLinkConfig {
  return {
    appCustomScheme: process.env.APP_CUSTOM_SCHEME || 'sirbro',
    appHost: process.env.APP_HOST || 'sirbro.com',
    iosAppStoreUrl:
      process.env.IOS_APP_STORE_URL || 'https://apps.apple.com/us/app/sirbro/id6753070536',
    iosBundle: process.env.IOS_BUNDLE_ID || 'ai.levantem.sirbro',
    iosTeamId: process.env.IOS_TEAM_ID || 'PLACEHOLDER_TEAM_ID',
    androidPlayUrl: process.env.ANDROID_PLAY_URL || '',
    androidPackageName: process.env.ANDROID_PACKAGE_NAME || 'ai.levantem.sirbro',
  };
}

export function getClientDeepLinkConfig(): ClientDeepLinkConfig {
  return {
    appCustomScheme: process.env.NEXT_PUBLIC_APP_CUSTOM_SCHEME || 'sirbro',
    iosAppStoreUrl:
      process.env.NEXT_PUBLIC_IOS_APP_STORE_URL || 'https://apps.apple.com/us/app/sirbro/id6753070536',
    androidPlayUrl: process.env.NEXT_PUBLIC_ANDROID_PLAY_URL || '',
  };
}
