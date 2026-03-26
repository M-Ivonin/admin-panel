import type { PublicContentPageKey } from '@/modules/content/repository';

export const PUBLIC_PAGE_PATHS: Record<PublicContentPageKey, string> = {
  home: '',
  privacy: '/privacy',
  terms: '/terms',
  disclaimer: '/disclaimer',
  cookies: '/cookies',
  about: '/about',
  methodology: '/methodology',
  'editorial-policy': '/editorial-policy',
  'ai-transparency': '/ai-transparency',
  faq: '/faq',
  contact: '/contact',
};

export const IMPLEMENTED_PUBLIC_PAGE_KEYS = [
  'home',
  'privacy',
  'terms',
  'disclaimer',
  'cookies',
  'about',
  'methodology',
  'editorial-policy',
  'ai-transparency',
  'faq',
  'contact',
] as const satisfies readonly PublicContentPageKey[];

export type ImplementedPublicPageKey = (typeof IMPLEMENTED_PUBLIC_PAGE_KEYS)[number];
