'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { exchangeMagicLinkForApp } from '@/lib/api/auth';
import { detectPlatform, getAppStoreUrl } from '@/lib/platform';
import { getClientConfig } from '@/lib/config';

type Status = 'loading' | 'redirecting' | 'fallback' | 'error';

function MagicAuthContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);

  const config = getClientConfig();
  const platform = detectPlatform();

  useEffect(() => {
    const token = searchParams.get('token');
    const locale = searchParams.get('locale') || 'en-us';
    const errorParam = searchParams.get('error');

    // Handle error redirects from backend verify endpoint
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

    const exchangeAndRedirect = async () => {
      try {
        const result = await exchangeMagicLinkForApp(token);

        // Build deep link URL for the mobile app
        const url = `${config.appCustomScheme}://auth/callback?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&user_id=${encodeURIComponent(result.user.id)}&email=${encodeURIComponent(result.user.email)}&name=${encodeURIComponent(result.user.name)}&locale=${locale}`;
        setDeepLinkUrl(url);

        // Attempt to open the app
        setStatus('redirecting');
        window.location.href = url;

        // If the app doesn't open within 1.5s, show fallback UI
        const fallbackTimer = setTimeout(() => {
          setStatus('fallback');
        }, 1500);

        const handleVisibility = () => {
          if (document.visibilityState === 'hidden') {
            clearTimeout(fallbackTimer);
          }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
          clearTimeout(fallbackTimer);
          document.removeEventListener('visibilitychange', handleVisibility);
        };
      } catch {
        setStatus('error');
        setError('This magic link is invalid or has expired.');
      }
    };

    exchangeAndRedirect();
  }, [searchParams, config.appCustomScheme]);

  const handleOpenApp = () => {
    if (deepLinkUrl) {
      window.location.href = deepLinkUrl;
    }
  };

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

  if (status === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
          <h1 className="text-white text-xl font-semibold mb-2">
            Opening SirBro...
          </h1>
          <p className="text-gray-400">
            If the app doesn&apos;t open automatically, tap the button below.
          </p>
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

  // Fallback UI — app didn't open automatically
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full bg-gray-900 rounded-lg shadow-lg p-8 text-center mx-4">
        <h1 className="text-white text-2xl font-bold mb-2">
          Welcome to SirBro
        </h1>
        <p className="text-gray-400 mb-6">
          Your magic link has been verified. Open the app to continue.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleOpenApp}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Open SirBro App
          </button>

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
