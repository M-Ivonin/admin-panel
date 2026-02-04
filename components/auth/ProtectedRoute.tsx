'use client';

import { ReactNode, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { storeTokens } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRouteInner({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [tokensProcessed, setTokensProcessed] = useState(false);

  // Set mounted state only on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle tokens from URL (redirected from magic link verify)
  useEffect(() => {
    if (!isMounted) return;

    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userId = searchParams.get('user_id');
    const userEmail = searchParams.get('email');
    const userName = searchParams.get('name');

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

      // Remove tokens from URL for cleaner look
      const url = new URL(window.location.href);
      url.searchParams.delete('access_token');
      url.searchParams.delete('refresh_token');
      url.searchParams.delete('user_id');
      url.searchParams.delete('email');
      url.searchParams.delete('name');
      url.searchParams.delete('locale');
      window.history.replaceState({}, '', url.pathname);

      // Force reload to pick up new auth state
      window.location.reload();
      return;
    }

    setTokensProcessed(true);
  }, [isMounted, searchParams]);

  useEffect(() => {
    if (isMounted && tokensProcessed && !isAuthenticated) {
      router.push('/admin-login');
    }
  }, [isMounted, tokensProcessed, isAuthenticated, router]);

  // Always show loader during SSR and initial client render
  if (!isMounted || !tokensProcessed || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProtectedRouteInner>{children}</ProtectedRouteInner>
    </Suspense>
  );
}
