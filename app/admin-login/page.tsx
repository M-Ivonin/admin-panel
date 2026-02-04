'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, Loader2, CheckCircle } from 'lucide-react';
import { requestMagicLink } from '@/lib/api/auth';
import { storeTokens } from '@/lib/auth';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle tokens from URL (redirected from magic link verify)
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userId = searchParams.get('user_id');
    const userEmail = searchParams.get('email');
    const userName = searchParams.get('name');
    const urlError = searchParams.get('error');

    if (urlError) {
      setError('This magic link is invalid or has expired.');
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens
      storeTokens({ accessToken, refreshToken });

      // Store user info
      if (userId && userEmail) {
        localStorage.setItem('user', JSON.stringify({
          id: userId,
          email: userEmail,
          name: userName || userEmail,
        }));
      }

      // Redirect to dashboard
      router.push('/en/dashboard');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await requestMagicLink(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send magic link'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">🎯 Tipster Admin</CardTitle>
          <CardDescription>
            Enter your email to receive a sign-in link
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <p className="font-semibold mb-2">Check your email!</p>
                <p className="text-sm">
                  We sent you a magic link. Click it to sign in.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={!email || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Magic Link
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-gray-500">
              Only authorized emails can access this panel
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminLoginContent />
    </Suspense>
  );
}
