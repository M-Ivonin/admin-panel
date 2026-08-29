import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import {
  emailMarketingRepository,
  EmailMarketingRepositoryError,
} from '@/modules/email-marketing/repository';
import type { EmailPublicationInput } from '@/modules/email-marketing/contracts';
import { RetentionStage } from '@/lib/api/users';

jest.mock('@/modules/http/admin-auth-client', () => ({ adminAuthFetch: jest.fn() }));

const input: EmailPublicationInput = {
  name: 'Weekly product news',
  topic: 'sirbro_product_updates',
  audience: {
    segmentSource: 'manual_rules', sourceSegmentId: null,
    criteria: { retentionStages: [RetentionStage.CURRENT], userIds: [], locales: ['en', 'es', 'pt'] },
    suppression: { excludeUsersWithoutPushOpens: false },
  },
  frequencyCapHours: 48,
  contentByLocale: {
    en: { subject: 'News', preheader: 'Latest', htmlBody: '<p>News</p>', textBody: 'News' },
    es: { subject: 'Noticias', preheader: 'Último', htmlBody: '<p>Noticias</p>', textBody: 'Noticias' },
    pt: { subject: 'Notícias', preheader: 'Último', htmlBody: '<p>Notícias</p>', textBody: 'Notícias' },
  },
  productUpdate: {},
};

const ok = (payload: unknown) => ({ ok: true, json: async () => payload }) as Response;

describe('EmailMarketingRepository HTTP contract', () => {
  beforeEach(() => jest.mocked(adminAuthFetch).mockReset());

  it('uses the dedicated contour and reuses the supplied stable create key', async () => {
    jest.mocked(adminAuthFetch).mockResolvedValue(ok({ id: 'publication-1' }));
    await emailMarketingRepository.create(input, 'stable-key-1');
    await emailMarketingRepository.create(input, 'stable-key-1');
    expect(adminAuthFetch).toHaveBeenNthCalledWith(1, expect.objectContaining({
      path: '/campaigns/admin/email-publications', method: 'POST',
      headers: { 'Idempotency-Key': 'stable-key-1' }, body: JSON.stringify(input),
    }));
    expect(adminAuthFetch).toHaveBeenNthCalledWith(2, expect.objectContaining({
      headers: { 'Idempotency-Key': 'stable-key-1' },
    }));
  });

  it('sends expectedDefinitionVersion on edit and maps every semantic command', async () => {
    jest.mocked(adminAuthFetch).mockResolvedValue(ok({ id: 'publication-1' }));
    await emailMarketingRepository.edit('publication/1', { ...input, expectedDefinitionVersion: 3 });
    await emailMarketingRepository.approve('publication/1');
    await emailMarketingRepository.sendNow('publication/1');
    await emailMarketingRepository.schedule('publication/1', { scheduledAtUtc: '2026-09-01T08:00:00.000Z', timezone: 'Europe/Paris' });
    await emailMarketingRepository.pause('publication/1');
    await emailMarketingRepository.resume('publication/1');
    await emailMarketingRepository.cancel('publication/1', 'Cancelled by operator');
    expect(adminAuthFetch).toHaveBeenNthCalledWith(1, expect.objectContaining({
      path: '/campaigns/admin/email-publications/publication%2F1', method: 'PUT',
      body: expect.stringContaining('"expectedDefinitionVersion":3'),
    }));
    expect(jest.mocked(adminAuthFetch).mock.calls.slice(1).map(([request]) => request.path)).toEqual([
      '/campaigns/admin/email-publications/publication%2F1/approve',
      '/campaigns/admin/email-publications/publication%2F1/send-now',
      '/campaigns/admin/email-publications/publication%2F1/schedule',
      '/campaigns/admin/email-publications/publication%2F1/pause',
      '/campaigns/admin/email-publications/publication%2F1/resume',
      '/campaigns/admin/email-publications/publication%2F1/cancel',
    ]);
  });

  it('loads list/detail/preview/reference/estimate projections and preserves backend errors', async () => {
    jest.mocked(adminAuthFetch)
      .mockResolvedValueOnce(ok({ items: [] }))
      .mockResolvedValueOnce(ok({ id: 'publication-1' }))
      .mockResolvedValueOnce(ok({ locale: 'es', subject: 'Exacto', preheader: 'Exacto', html: '<p>Exacto</p>', text: 'Exacto' }))
      .mockResolvedValueOnce(ok({ items: [] }))
      .mockResolvedValueOnce(ok({ reachableUsers: 12, warnings: [] }));
    await emailMarketingRepository.list('paused');
    await emailMarketingRepository.get('publication-1');
    await emailMarketingRepository.preview('publication-1', 'es');
    await emailMarketingRepository.listPredictionReferences();
    await emailMarketingRepository.estimateAudience(input.audience);
    expect(jest.mocked(adminAuthFetch).mock.calls.map(([request]) => request.path)).toEqual([
      '/campaigns/admin/email-publications?state=paused',
      '/campaigns/admin/email-publications/publication-1',
      '/campaigns/admin/email-publications/publication-1/preview?locale=es',
      '/campaigns/admin/email-publications/references/predictions',
      '/campaigns/admin/email-publications/estimate-audience',
    ]);

    jest.mocked(adminAuthFetch).mockResolvedValueOnce({ ok: false, status: 409, statusText: 'Conflict', json: async () => ({ message: 'Exact backend conflict' }) } as Response);
    await expect(emailMarketingRepository.approve('publication-1')).rejects.toEqual(expect.objectContaining({
      name: 'EmailMarketingRepositoryError', status: 409, message: 'Exact backend conflict',
    } satisfies Partial<EmailMarketingRepositoryError>));
  });
});
