import type { Locale } from '@/lib/i18n/config';

export type LocalizedSlug = {
  locale: Locale;
  slug: string;
};

export type ContentStatus = 'draft' | 'published' | 'archived';
export type Indexability = 'index' | 'noindex';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface SourceReference {
  label: string;
  url: string;
}

export interface AuthorProfile {
  name: string;
  slug?: string;
}

export interface SeoPageBase {
  id: string;
  locale: Locale;
  slug: string;
  status: ContentStatus;
  indexability: Indexability;
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  publishedAt?: string;
  updatedAt?: string;
  breadcrumbs: BreadcrumbItem[];
}
