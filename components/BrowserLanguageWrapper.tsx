'use client';

import { useEffect, useState } from 'react';
import { DeepLinkHandler } from '../lib/deep-link';
import { detectBrowserLocale } from '../lib/i18n/detect-browser-locale';
import { getDictionary } from '../lib/i18n/get-dictionary';
import { Translations } from '../lib/i18n/translations';

interface BrowserLanguageWrapperProps {
  channelId: string;
  token?: string;
  config: {
    appCustomScheme: string;
    iosAppStoreUrl: string;
    androidPlayUrl: string;
  };
  showError?: boolean;
}

export function BrowserLanguageWrapper({
  channelId,
  token,
  config,
  showError = false,
}: BrowserLanguageWrapperProps) {
  const [translations, setTranslations] = useState<Translations | null>(null);

  useEffect(() => {
    const locale = detectBrowserLocale();
    const dict = getDictionary(locale);
    setTranslations(dict);
  }, []);

  // Show loading state while detecting language
  if (!translations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error page if channelId is missing
  if (showError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {translations.deepLink.invalidLink}
            </h1>
            <p className="text-gray-600">
              {translations.deepLink.missingChannelId}
            </p>
          </div>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {translations.deepLink.goToHomepage}
          </a>
        </div>
      </div>
    );
  }

  // Render the deep link handler with translations
  return (
    <DeepLinkHandler
      channelId={channelId}
      token={token}
      appCustomScheme={config.appCustomScheme}
      iosAppStoreUrl={config.iosAppStoreUrl}
      androidPlayUrl={config.androidPlayUrl}
      translations={translations}
    />
  );
}
