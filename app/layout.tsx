import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SirBro',
    template: '%s | SirBro',
  },
  description: 'Sports betting tips and community platform',
  keywords: ['sports betting', 'tips', 'community', 'analysis'],
  authors: [{ name: 'SirBro Team' }],
  creator: 'SirBro',
  publisher: 'SirBro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.APP_HOST ? `https://${process.env.APP_HOST}` : 'https://sirbro.com'),
  alternates: {
    canonical: '/',
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
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}