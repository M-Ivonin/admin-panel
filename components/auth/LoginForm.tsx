'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login, loginWithMagicLink, isLoading, error } = useAuth();
  const [magicLinkToken, setMagicLinkToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleMagicLinkSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      await loginWithMagicLink(magicLinkToken);
      setSuccessMessage('Successfully logged in! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      console.error('Magic link login failed:', err);
    } finally {
      setIsSubmitting(false);
      setMagicLinkToken('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="token" className="text-sm font-medium text-gray-700">
                Magic Link Token
              </label>
              <Input
                id="token"
                type="text"
                placeholder="Paste your magic link token here"
                value={magicLinkToken}
                onChange={(e) => setMagicLinkToken(e.target.value)}
                disabled={isSubmitting || isLoading}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                You can get a magic link token by requesting one via email
              </p>
            </div>

            <Button
              type="submit"
              disabled={!magicLinkToken || isSubmitting || isLoading}
              className="w-full"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // This would integrate with Google OAuth
              // For now, showing placeholder
              alert('Google OAuth integration needed. Use magic link for now.');
            }}
          >
            Continue with Google
          </Button>

          <p className="text-xs text-center text-gray-500">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => {
                alert('Contact your administrator to create an account');
              }}
            >
              Contact admin
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
