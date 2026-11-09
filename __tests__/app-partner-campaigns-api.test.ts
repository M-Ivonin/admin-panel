import {
  getAppPartnerAnalytics,
  getAppPartnerAnalyticsCsv,
  getAppPartnerCampaigns,
  pauseAppPartnerCampaign,
  saveAppPartnerCampaign,
  uploadAppPartnerCampaignImage,
} from '@/lib/api/app-partner-campaigns';
import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import type { AppPartnerCampaignInput } from '@/modules/app-partner-campaigns/types';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

const input: AppPartnerCampaignInput = {
  name: 'SE autumn fixture',
  partnerMarketConfigId: 'market-fixture',
  status: 'draft',
  platforms: ['ios'],
  placements: ['matches_banner'],
  startsAt: '2026-11-09T12:00:00.000Z',
  endsAt: '2026-12-01T00:00:00.000Z',
  minimumSessions: 2,
  minimumAge: 18,
  priority: 0,
  copyByLocale: {},
  bannerImages: null,
  predictionUrl: null,
  predictionOverrides: {},
  finalDestinationHosts: [],
};
const saved = { ...input, id: 'campaign/one', version: 'v1' };

beforeEach(() => jest.mocked(adminAuthFetch).mockReset());

it('lists, creates and edits campaigns through their authenticated admin endpoint', async () => {
  jest
    .mocked(adminAuthFetch)
    .mockResolvedValueOnce({ ok: true, json: async () => [saved] } as Response)
    .mockResolvedValue({ ok: true, json: async () => saved } as Response);
  await expect(getAppPartnerCampaigns()).resolves.toEqual([saved]);
  await expect(saveAppPartnerCampaign(input)).resolves.toEqual(saved);
  const changes = { ...input, name: 'Updated fixture' };
  await saveAppPartnerCampaign(changes, saved);
  expect(adminAuthFetch).toHaveBeenNthCalledWith(1, {
    path: '/app-partner-campaigns/admin',
    method: 'GET',
  });
  expect(adminAuthFetch).toHaveBeenNthCalledWith(2, {
    path: '/app-partner-campaigns/admin',
    method: 'POST',
    body: JSON.stringify(input),
  });
  expect(adminAuthFetch).toHaveBeenNthCalledWith(3, {
    path: '/app-partner-campaigns/admin/campaign%2Fone',
    method: 'PUT',
    body: JSON.stringify({ ...changes, expectedVersion: saved.version }),
  });
});

it('uses the same authenticated filters for analytics and CSV', async () => {
  const report = { summary: {}, clicks: [] };
  const csv = new Blob(['tapId,screen\nfixture,matches\n'], {
    type: 'text/csv',
  });
  jest
    .mocked(adminAuthFetch)
    .mockResolvedValueOnce({ ok: true, json: async () => report } as Response)
    .mockResolvedValueOnce({ ok: true, blob: async () => csv } as Response);
  const filters = {
    campaignId: 'campaign/one',
    regionCode: ' ',
    userId: 'user+one',
  };
  await expect(getAppPartnerAnalytics(filters)).resolves.toEqual(report);
  await expect(getAppPartnerAnalyticsCsv(filters)).resolves.toEqual(csv);
  const calls = jest
    .mocked(adminAuthFetch)
    .mock.calls.map(([request]) => request);
  expect(calls.map((call) => call.path)).toEqual([
    '/app-partner-campaigns/admin/analytics?campaignId=campaign%2Fone&userId=user%2Bone',
    '/app-partner-campaigns/admin/analytics.csv?campaignId=campaign%2Fone&userId=user%2Bone',
  ]);
  expect(calls[1].headers).toEqual({ Accept: 'text/csv' });
});

it('uses the versioned pause command and surfaces a stale-write conflict', async () => {
  jest.mocked(adminAuthFetch).mockResolvedValue({
    ok: false,
    status: 409,
    json: async () => ({
      message: ['Campaign changed. Reload before saving.'],
    }),
  } as Response);
  await expect(pauseAppPartnerCampaign(saved)).rejects.toThrow(
    'Campaign changed. Reload before saving.'
  );
  expect(adminAuthFetch).toHaveBeenCalledWith({
    path: '/app-partner-campaigns/admin/campaign%2Fone/pause',
    method: 'POST',
    body: JSON.stringify({ expectedVersion: saved.version }),
  });
});

it('uses the campaign image endpoint and the backend-returned upload URL', async () => {
  const imageUrl = 'https://cdn.example.invalid/banner.png';
  const file = new File(['fixture'], 'banner.png', { type: 'image/png' });
  jest.mocked(adminAuthFetch).mockResolvedValue({
    ok: true,
    json: async () => ({ imageUrl }),
  } as Response);
  await expect(uploadAppPartnerCampaignImage(file)).resolves.toEqual(imageUrl);
  const [request] = jest.mocked(adminAuthFetch).mock.calls[0];
  expect(request).toMatchObject({
    path: '/app-partner-campaigns/admin/images',
    method: 'POST',
  });
  expect((request.body as FormData).get('image')).toEqual(file);
});
