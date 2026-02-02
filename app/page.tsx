'use client';

import { useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { i18n } from '@/lib/i18n/config';

// Root: send /admin to admin-login; otherwise load public landing at default locale
export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const path = window.location.pathname;

    if (path === '/admin') {
      if (isAuthenticated) {
        router.push('/en/dashboard');
      } else {
        router.push('/admin-login');
      }
      return;
    }

    // Only redirect the root path; leave deep-link targets intact
    if (path === '/') {
      redirect(`/${i18n.defaultLocale}`);
    }
  }, [isAuthenticated, router]);

  return null;
}