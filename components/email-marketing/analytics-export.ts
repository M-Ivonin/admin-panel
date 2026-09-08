import type { EmailPublicationAnalytics } from '@/modules/email-marketing/contracts';

const FORBIDDEN_KEYS = new Set([
  'email',
  'rawemail',
  'dob',
  'userid',
  'userids',
  'recipientid',
  'recipientids',
  'audienceuserid',
  'audienceuserids',
  'recipienthandle',
  'opaqueclickid',
  'deliverytrace',
  'deliverytraceid',
  'providertoken',
]);

export function buildEmailAnalyticsJson(
  analytics: EmailPublicationAnalytics
): string {
  return JSON.stringify(
    analytics,
    (key, value) =>
      FORBIDDEN_KEYS.has(key.replace(/[^a-z]/gi, '').toLowerCase())
        ? undefined
        : value,
    2
  );
}

export function downloadEmailAnalyticsJson(
  publicationId: string,
  analytics: EmailPublicationAnalytics
): void {
  const blob = new Blob([buildEmailAnalyticsJson(analytics)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `email-publication-${publicationId}-analytics.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
