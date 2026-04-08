import { headers } from 'next/headers';
import { AppDocumentShell } from '@/components/providers/AppDocumentShell';
import { PublicLocaleSync } from '@/components/providers/PublicLocaleSync';
import { i18n } from '@/lib/i18n/config';
import '../globals.css';

export default async function PublicRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const requestLocale = requestHeaders.get('x-app-locale');
  const locale = requestLocale && i18n.locales.includes(requestLocale as (typeof i18n.locales)[number])
    ? requestLocale
    : i18n.defaultLocale;

  return (
    <AppDocumentShell lang={locale} bodySuffix={<PublicLocaleSync />}>
      {children}
    </AppDocumentShell>
  );
}
