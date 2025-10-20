import type { Metadata } from 'next';
import { i18n, type Locale } from '@/lib/i18n/config';
import '../globals.css';

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
  metadataBase: new URL(process.env.APP_HOST ? `https://${process.env.APP_HOST}` : 'https://sirbro.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'pt': '/pt',
      'es': '/es',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
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

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <html lang={params.lang}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#5b4eff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
