import type { Metadata } from 'next';
import { AppDocumentShell } from '@/components/providers/AppDocumentShell';
import { sirbroSiteIcons } from '@/modules/seo/site-icons';
import '../globals.css';

export const metadata: Metadata = {
  icons: sirbroSiteIcons,
  robots: {
    index: false,
    follow: false,
  },
};

export default function DeepLinkRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppDocumentShell lang="en" withProviders={false}>
      {children}
    </AppDocumentShell>
  );
}
