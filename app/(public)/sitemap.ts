import type { MetadataRoute } from 'next';
import { getIndexableSitemapEntries } from '@/modules/seo/route-registry';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getIndexableSitemapEntries();
}
