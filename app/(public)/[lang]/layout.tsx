import type { Metadata } from 'next';
import { i18n } from '@/lib/i18n/config';
import { PublicChatWidget } from '@/components/public/PublicChatWidget';
import { getPublicAppConfig } from '@/modules/config/runtime';

const { appHost } = getPublicAppConfig();

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const metadata: Metadata = {
  title: {
    default: 'SirBro',
    template: '%s | SirBro',
  },
  description: 'Safe & risky tips, stats breakdowns, player form, match picks, and smart strategies — all in one place.',
  keywords: ['football', 'predictions', 'betting', 'tips', 'sports'],
  authors: [{ name: 'Levantem AI LTD' }],
  creator: 'Levantem AI LTD',
  publisher: 'Levantem AI LTD',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(`https://${appHost}`),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'SirBro',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@sirbro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function LangLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  return (
    <>
      {children}
      <PublicChatWidget />
    </>
  );
}
