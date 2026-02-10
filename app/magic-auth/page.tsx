'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { exchangeMagicLinkForApp } from '@/lib/api/auth';
import { detectPlatform, getAppStoreUrl } from '@/lib/platform';
import { getClientConfig } from '@/lib/config';

const ANDROID_PACKAGE = 'ai.levantem.sirbro';

type Status = 'loading' | 'ready' | 'error';

function MagicAuthContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);
  const [intentUrl, setIntentUrl] = useState<string | null>(null);

  const config = getClientConfig();
  const platform = detectPlatform();

  useEffect(() => {
    const token = searchParams.get('token');
    const locale = searchParams.get('locale') || 'en-us';
    const errorParam = searchParams.get('error');

    if (errorParam === 'invalid_link') {
      setStatus('error');
      setError('This magic link is invalid or has expired.');
      return;
    }

    if (!token) {
      setStatus('error');
      setError('No token provided.');
      return;
    }

    const exchange = async () => {
      try {
        const result = await exchangeMagicLinkForApp(token);

        const params = `access_token=${result.accessToken}&refresh_token=${result.refreshToken}&user_id=${encodeURIComponent(result.user.id)}&email=${encodeURIComponent(result.user.email)}&name=${encodeURIComponent(result.user.name)}&locale=${locale}`;

        // Custom scheme URL (works on iOS user tap + Android fallback)
        const schemeUrl = `${config.appCustomScheme}://auth/callback?${params}`;
        setDeepLinkUrl(schemeUrl);

        // Android Intent URL (works reliably in WebViews like Gmail)
        const intent = `intent://auth/callback?${params}#Intent;scheme=${config.appCustomScheme};package=${ANDROID_PACKAGE};end`;
        setIntentUrl(intent);

        // Show the button immediately — don't try programmatic redirect
        setStatus('ready');
      } catch {
        setStatus('error');
        setError('This magic link is invalid or has expired.');
      }
    };

    exchange();
  }, [searchParams, config.appCustomScheme]);

  const openAppUrl = platform.isAndroid ? intentUrl : deepLinkUrl;

  const handleDownload = () => {
    const storeUrl = getAppStoreUrl(
      platform.platform,
      config.iosAppStoreUrl,
      config.androidPlayUrl,
    );
    if (storeUrl) {
      window.open(storeUrl, '_blank');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
          <p className="text-white text-lg">Verifying your magic link...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="max-w-md w-full bg-gray-900 rounded-lg shadow-lg p-8 text-center mx-4">
          <div className="text-red-400 text-4xl mb-4">!</div>
          <h1 className="text-white text-xl font-bold mb-2">
            Magic Link Error
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <p className="text-gray-500 text-sm">
            Please request a new magic link from the app.
          </p>
        </div>
      </div>
    );
  }

  // Token exchanged — show button for user to tap (user-initiated = works in WebViews)
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full bg-gray-900 rounded-lg shadow-lg p-8 text-center mx-4">
        <h1 className="text-white text-2xl font-bold mb-2">
          Welcome to SirBro
        </h1>
        <p className="text-gray-400 mb-6">
          Your magic link has been verified. Tap below to open the app.
        </p>

        <div className="space-y-4">
          {/* Use <a> tag — more reliable than window.location.href in WebViews */}
          <a
            href={openAppUrl || '#'}
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Open SirBro App
          </a>

          <div className="text-gray-500 text-sm">
            Don&apos;t have the app?
          </div>

          <button
            onClick={handleDownload}
            className="w-full border border-gray-600 text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Download SirBro
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MagicAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <MagicAuthContent />
    </Suspense>
  );
}
