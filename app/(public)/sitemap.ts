import type { MetadataRoute } from 'next';
import { getIndexableSitemapEntries } from '@/modules/seo/route-registry';

export default function sitemap(): MetadataRoute.Sitemap {
  return getIndexableSitemapEntries();
}
