import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import {
  getMarketingJurisdictions,
  pauseMarketingJurisdiction,
  saveMarketingJurisdiction,
} from '@/lib/api/marketing-jurisdictions';

jest.mock('@/modules/http/admin-auth-client', () => ({ adminAuthFetch: jest.fn() }));

const input = {
  countryCode: 'FR',
  status: 'approved' as const,
  minimumAge: 18,
  predictionsEmailAllowed: true,
  productEmailAllowed: true,
  partnerOfferEmailAllowed: true,
  combinedPredictionOfferAllowed: false,
  bonusAdvertisingAllowed: false,
  matchSpecificPromotionAllowed: false,
  requiredWarningText: '18+. Play responsibly.',
  warningLayoutRules: {},
  responsibleGamblingUrl: 'https://example.fr/responsible',
  regulatorSourceUrl: 'https://regulator.example/fr',
  legalReviewedAt: '2026-08-01T00:00:00.000Z',
  legalReviewExpiresAt: '2027-08-01T00:00:00.000Z',
  effectiveFrom: '2026-08-02T00:00:00.000Z',
  rulesVersion: 'fr-2026-08',
};

describe('marketing jurisdictions API', () => {
  beforeEach(() => (adminAuthFetch as jest.Mock).mockReset());

  it('lists exact country rules with a normalized filter', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ items: [] }) });
    await expect(getMarketingJurisdictions({ countryCode: ' fr ' })).resolves.toEqual([]);
    expect(adminAuthFetch).toHaveBeenCalledWith({ path: '/marketing-jurisdictions/admin?countryCode=FR', method: 'GET' });
  });

  it('uses the dedicated upsert and pause commands', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ id: 'rule-1', ...input }) });
    await saveMarketingJurisdiction(input);
    await pauseMarketingJurisdiction('rule/1', '  Legal review withdrawn  ');
    expect(adminAuthFetch).toHaveBeenNthCalledWith(1, { path: '/marketing-jurisdictions/admin', method: 'PUT', body: JSON.stringify(input) });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(2, { path: '/marketing-jurisdictions/admin/rule%2F1/pause', method: 'POST', body: JSON.stringify({ reason: 'Legal review withdrawn' }) });
  });
});
