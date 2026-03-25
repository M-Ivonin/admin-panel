import type { ContentStatus, Indexability, SeoPageBase } from '@/modules/content/types';

export function isPublishedStatus(status: ContentStatus) {
  return status === 'published';
}

export function isIndexableContent({
  status,
  indexability,
}: Pick<SeoPageBase, 'status' | 'indexability'> | {
  status: ContentStatus;
  indexability: Indexability;
}) {
  return isPublishedStatus(status) && indexability === 'index';
}
