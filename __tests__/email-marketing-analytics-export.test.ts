import { buildEmailAnalyticsJson } from '@/components/email-marketing/analytics-export';
import type { EmailPublicationAnalytics } from '@/modules/email-marketing/contracts';

it('exports aggregate analytics while stripping forbidden recipient identity fields', () => {
  const analytics = {
    dimensions: { campaign: 'campaign-1' },
    counts: { delivered: 17 },
    nested: {
      rawEmail: 'person@example.com',
      dob: '1990-01-01',
      user_id: 'user-secret',
      recipient_id: 'recipient-id-secret',
      audience_user_ids: ['audience-user-secret'],
      recipientHandle: 'recipient-secret',
      opaqueClickId: 'click-secret',
      delivery_trace_id: 'trace-secret',
      providerToken: 'provider-secret',
    },
  } as unknown as EmailPublicationAnalytics;

  const exported = buildEmailAnalyticsJson(analytics);

  expect(exported).toContain('campaign-1');
  expect(exported).toContain('"delivered": 17');
  expect(exported).not.toMatch(
    /person@example|1990-01-01|user-secret|recipient-id-secret|audience-user-secret|recipient-secret|click-secret|trace-secret|provider-secret/
  );
});
