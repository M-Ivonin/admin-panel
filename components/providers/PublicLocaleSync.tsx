'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { i18n } from '@/lib/i18n/config';

export function PublicLocaleSync() {
  const pathname = usePathname();

  useEffect(() => {
    const nextLocale = pathname.split('/')[1];

    if (i18n.locales.includes(nextLocale as (typeof i18n.locales)[number])) {
      document.documentElement.lang = nextLocale;
      return;
    }

    document.documentElement.lang = i18n.defaultLocale;
  }, [pathname]);

  return null;
}
