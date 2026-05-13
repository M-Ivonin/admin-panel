import type { Metadata } from 'next';

export const sirbroSiteIcons = {
  icon: [
    {
      url: '/favicon.ico',
      sizes: '64x64',
      type: 'image/x-icon',
    },
    {
      url: '/assets/logo.svg',
      type: 'image/svg+xml',
    },
  ],
  shortcut: ['/favicon.ico'],
  apple: [
    {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  ],
} satisfies Metadata['icons'];
