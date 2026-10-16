import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppDocumentShell } from '@/components/providers/AppDocumentShell';
import { sirbroSiteIcons } from '@/modules/seo/site-icons';
import '../globals.css';
import './scrollbars.css';

export const metadata: Metadata = {
  icons: sirbroSiteIcons,
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppDocumentShell lang="en">
      <ProtectedRoute>
        <AdminShell>{children}</AdminShell>
      </ProtectedRoute>
    </AppDocumentShell>
  );
}
