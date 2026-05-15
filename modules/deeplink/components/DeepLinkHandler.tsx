'use client';

import { useEffect, useState } from 'react';
import { AppStoreButtons } from '@/components/AppStoreButtons';
import type { ClientDeepLinkConfig } from '@/modules/config/contracts';
import { DEEPLINK_FALLBACK_MS } from '@/modules/deeplink/constants';
import {
  createSafeLogData,
  redactToken,
} from '@/modules/deeplink/utils/redact';
import {
  detectPlatform,
  getAppStoreUrl,
  type Platform,
} from '@/modules/deeplink/utils/platform';
import {
  buildInternalAppDeepLink,
  normalizeAppPath,
  resolveClientDeepLinkConfigForHost,
} from '@/modules/deeplink/utils/app-links';
import type { Translations } from '@/lib/i18n/translations';

interface DeepLinkHandlerProps {
  appPath: string;
  channelId?: string;
  token?: string;
  config: ClientDeepLinkConfig;
  translations: Translations;
  variant?: 'channel' | 'generic';
}

export function DeepLinkHandler({
  appPath,
  channelId,
  token,
  config,
  translations,
  variant = 'generic',
}: DeepLinkHandlerProps) {
  const [platform, setPlatform] = useState<Platform>('desktop');
  const [attempted, setAttempted] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [resolvedConfig, setResolvedConfig] = useState(() =>
    typeof window === 'undefined'
      ? config
      : resolveClientDeepLinkConfigForHost(window.location.hostname, config)
  );
  const normalizedAppPath = normalizeAppPath(appPath);

  useEffect(() => {
    const platformInfo = detectPlatform();
    const hostConfig = resolveClientDeepLinkConfigForHost(
      window.location.hostname,
      config
    );
    setPlatform(platformInfo.platform);
    setResolvedConfig(hostConfig);

    const logData = createSafeLogData({
      channelId,
      token,
      appPath: normalizedAppPath,
      platform: platformInfo.platform,
      userAgent: platformInfo.userAgent,
      timestamp: new Date().toISOString(),
    });
    console.log('Deep link attempt:', logData);

    const deepLinkUrl = buildInternalAppDeepLink(
      normalizedAppPath,
      hostConfig.appCustomScheme
    );

    if (
      platformInfo.platform === 'ios' ||
      platformInfo.platform === 'android'
    ) {
      setAttempted(true);
      window.location.href = deepLinkUrl;

      const fallbackTimer = setTimeout(() => {
        setShowFallback(true);
        const storeUrl = getAppStoreUrl(
          platformInfo.platform,
          hostConfig.iosAppStoreUrl,
          hostConfig.androidPlayUrl
        );
        if (storeUrl) {
          window.location.href = storeUrl;
        }
      }, DEEPLINK_FALLBACK_MS);

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          clearTimeout(fallbackTimer);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearTimeout(fallbackTimer);
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
      };
    }

    setShowFallback(true);
  }, [channelId, token, config, normalizedAppPath]);

  const handleOpenApp = () => {
    const deepLinkUrl = buildInternalAppDeepLink(
      normalizedAppPath,
      resolvedConfig.appCustomScheme
    );
    window.location.href = deepLinkUrl;
  };

  if (platform !== 'desktop' && !showFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {translations.deepLink.openingApp}
          </h1>
          <p className="text-gray-600">
            {attempted
              ? translations.deepLink.appWillOpen
              : translations.deepLink.preparingApp}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {variant === 'channel'
              ? translations.deepLink.joinChannel
              : translations.deepLink.openApp}
          </h1>
          <p className="text-gray-600">
            {variant === 'channel'
              ? translations.deepLink.invitedToJoin
              : translations.deepLink.appWillOpen}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleOpenApp}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            aria-label="Open TipsterBro app"
          >
            {translations.deepLink.openApp}
          </button>

          <div className="text-sm text-gray-500 mb-4">
            {translations.deepLink.dontHaveApp}
          </div>

          <AppStoreButtons config={resolvedConfig} />
        </div>

        {variant === 'channel' && (
          <div className="mt-6 text-xs text-gray-400">
            {translations.deepLink.channelId}:{' '}
            {redactToken(channelId) || translations.deepLink.invalid}
          </div>
        )}
      </div>
    </div>
  );
}
