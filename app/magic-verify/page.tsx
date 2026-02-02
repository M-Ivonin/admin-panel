'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { exchangeMagicLinkToken } from '@/lib/api/auth';
import { storeTokens } from '@/lib/auth';

function MagicVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setError('No token provided');
      return;
    }

    const verify = async () => {
      try {
        const result = await exchangeMagicLinkToken(token);

        // Зберегти токени в cookies
        storeTokens({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });

        // Зберегти user info в localStorage
        localStorage.setItem('user', JSON.stringify(result.user));

        setStatus('success');

        // Redirect на dashboard через 1 секунду
        setTimeout(() => {
          router.push('/en/dashboard');
        }, 1000);
      } catch (err) {
        setStatus('error');
        setError(
          err instanceof Error ? err.message : 'Failed to verify magic link'
        );
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verifying...</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Verifying your magic link...</p>
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Success! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <a
                href="/admin-login"
                className="block text-center text-blue-600 hover:underline text-sm"
              >
                Request a new magic link
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
