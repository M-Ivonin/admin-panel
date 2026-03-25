'use client';

import { useEffect, useState } from 'react';
import type { ClientDeepLinkConfig } from '@/modules/config/contracts';
import { DeepLinkHandler } from '@/modules/deeplink/components/DeepLinkHandler';
import { detectBrowserLocale } from '@/lib/i18n/detect-browser-locale';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Translations } from '@/lib/i18n/translations';

interface BrowserLanguageWrapperProps {
  channelId: string;
  token?: string;
  config: ClientDeepLinkConfig;
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

  if (!translations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  return (
    <DeepLinkHandler
      channelId={channelId}
      token={token}
      config={config}
      translations={translations}
    />
  );
}
