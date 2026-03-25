import type { PublicContentPageKey } from '@/modules/content/repository';

export const PUBLIC_PAGE_PATHS: Record<PublicContentPageKey, string> = {
  home: '',
  privacy: '/privacy',
  terms: '/terms',
  disclaimer: '/disclaimer',
  cookies: '/cookies',
  about: '/about',
  methodology: '/methodology',
  faq: '/faq',
};

export const IMPLEMENTED_PUBLIC_PAGE_KEYS = [
  'home',
  'privacy',
  'terms',
  'disclaimer',
  'cookies',
] as const satisfies readonly PublicContentPageKey[];

export type ImplementedPublicPageKey = (typeof IMPLEMENTED_PUBLIC_PAGE_KEYS)[number];
