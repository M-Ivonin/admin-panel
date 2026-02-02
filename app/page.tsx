'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import AdminLoginPage from './admin-login/page';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/en/dashboard');
    }
  }, [isAuthenticated, router]);

  // Show login form directly if not authenticated
  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return null;
}