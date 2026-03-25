'use client';

import { useEffect, useState } from 'react';
import { AppStoreButtons } from '@/components/AppStoreButtons';
import type { ClientDeepLinkConfig } from '@/modules/config/contracts';
import { DEEPLINK_FALLBACK_MS } from '@/modules/deeplink/constants';
import { createSafeLogData, redactToken } from '@/modules/deeplink/utils/redact';
import { detectPlatform, getAppStoreUrl, type Platform } from '@/modules/deeplink/utils/platform';
import type { Translations } from '@/lib/i18n/translations';

interface DeepLinkHandlerProps {
  channelId: string;
  token?: string;
  config: ClientDeepLinkConfig;
  translations: Translations;
}

export function DeepLinkHandler({
  channelId,
  token,
  config,
  translations,
}: DeepLinkHandlerProps) {
  const [platform, setPlatform] = useState<Platform>('desktop');
  const [attempted, setAttempted] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const platformInfo = detectPlatform();
    setPlatform(platformInfo.platform);

    const logData = createSafeLogData({
      channelId,
      token,
      platform: platformInfo.platform,
      userAgent: platformInfo.userAgent,
      timestamp: new Date().toISOString(),
    });
    console.log('Deep link attempt:', logData);

    const deepLinkUrl = `${config.appCustomScheme}://channels/join?channelId=${encodeURIComponent(
      channelId
    )}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

    if (platformInfo.platform === 'ios' || platformInfo.platform === 'android') {
      setAttempted(true);
      window.location.href = deepLinkUrl;

      const fallbackTimer = setTimeout(() => {
        setShowFallback(true);
        const storeUrl = getAppStoreUrl(
          platformInfo.platform,
          config.iosAppStoreUrl,
          config.androidPlayUrl
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
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    setShowFallback(true);
  }, [channelId, token, config]);

  const handleOpenApp = () => {
    const deepLinkUrl = `${config.appCustomScheme}://channels/join?channelId=${encodeURIComponent(
      channelId
    )}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
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
            {translations.deepLink.joinChannel}
          </h1>
          <p className="text-gray-600">
            {translations.deepLink.invitedToJoin}
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

          <div className="text-sm text-gray-500 mb-4">{translations.deepLink.dontHaveApp}</div>

          <AppStoreButtons />
        </div>

        <div className="mt-6 text-xs text-gray-400">
          {translations.deepLink.channelId}: {redactToken(channelId) || translations.deepLink.invalid}
        </div>
      </div>
    </div>
  );
}
