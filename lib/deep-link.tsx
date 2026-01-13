'use client';

import { useEffect, useState } from 'react';
import { detectPlatform, getAppStoreUrl, type Platform } from './platform';
import { redactToken, createSafeLogData } from './redact';

interface DeepLinkHandlerProps {
  channelId: string;
  token?: string;
  appCustomScheme: string;
  iosAppStoreUrl: string;
  androidPlayUrl: string;
}

export function DeepLinkHandler({
  channelId,
  token,
  appCustomScheme,
  iosAppStoreUrl,
  androidPlayUrl,
}: DeepLinkHandlerProps) {
  const [platform, setPlatform] = useState<Platform>('desktop');
  const [attempted, setAttempted] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const platformInfo = detectPlatform();
    setPlatform(platformInfo.platform);

    // Log the attempt (with redacted token)
    const logData = createSafeLogData({
      channelId,
      token,
      platform: platformInfo.platform,
      userAgent: platformInfo.userAgent,
      timestamp: new Date().toISOString(),
    });
    console.log('Deep link attempt:', logData);

    // Build the deep link URL
    const deepLinkUrl = `${appCustomScheme}://channels/join?channelId=${encodeURIComponent(
      channelId
    )}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

    if (platformInfo.platform === 'ios' || platformInfo.platform === 'android') {
      // Attempt to open the deep link
      setAttempted(true);
      window.location.href = deepLinkUrl;

      // Set fallback timer
      const fallbackTimer = setTimeout(() => {
        setShowFallback(true);
        const storeUrl = getAppStoreUrl(
          platformInfo.platform,
          iosAppStoreUrl,
          androidPlayUrl
        );
        if (storeUrl) {
          window.location.href = storeUrl;
        }
      }, 1500);

      // Clear timer if user returns to the page (app opened successfully)
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
    } else {
      // Desktop - show the page immediately
      setShowFallback(true);
    }
  }, [channelId, token, appCustomScheme, iosAppStoreUrl, androidPlayUrl]);

  const handleOpenApp = () => {
    const deepLinkUrl = `${appCustomScheme}://channels/join?channelId=${encodeURIComponent(
      channelId
    )}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    window.location.href = deepLinkUrl;
  };

  const handleDownloadApp = (targetPlatform: 'ios' | 'android') => {
    const storeUrl = getAppStoreUrl(
      targetPlatform,
      iosAppStoreUrl,
      androidPlayUrl
    );
    if (storeUrl) {
      window.open(storeUrl, '_blank');
    }
  };

  if (platform !== 'desktop' && !showFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Opening TipsterBro...
          </h1>
          <p className="text-gray-600">
            {attempted
              ? 'If the app doesn\'t open, you\'ll be redirected to the app store.'
              : 'Preparing to open the app...'}
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
            Join SirBro Channel
          </h1>
          <p className="text-gray-600">
            You've been invited to join a channel on TipsterBro
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleOpenApp}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            aria-label="Open TipsterBro app"
          >
            Open SirBro App
          </button>

          <div className="text-sm text-gray-500 mb-4">Don't have the app?</div>

          <div className="space-y-3">
            {iosAppStoreUrl && (
              <button
                onClick={() => handleDownloadApp('ios')}
                className="w-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                aria-label="Download TipsterBro from App Store"
              >
                <img 
                  src="/assets/appstore.png" 
                  alt="Download on the App Store" 
                  className="h-12 w-auto mx-auto"
                />
              </button>
            )}

            {androidPlayUrl && (
              <button
                onClick={() => handleDownloadApp('android')}
                className="w-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
                aria-label="Download TipsterBro from Google Play"
              >
                <img 
                  src="/assets/playstore.png" 
                  alt="Get it on Google Play" 
                  className="h-12 w-auto mx-auto"
                />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Channel ID: {redactToken(channelId) || 'Invalid'}
        </div>
      </div>
    </div>
  );
}