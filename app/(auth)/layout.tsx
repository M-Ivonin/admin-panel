import type { Metadata } from 'next';
import { AppDocumentShell } from '@/components/providers/AppDocumentShell';
import '../globals.css';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppDocumentShell lang="en">{children}</AppDocumentShell>;
}
