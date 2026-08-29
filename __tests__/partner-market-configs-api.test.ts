import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import {
  getPartnerMarketConfigs,
  pausePartnerMarketConfig,
  savePartnerMarketConfig,
} from '@/lib/api/partner-market-configs';

jest.mock('@/modules/http/admin-auth-client', () => ({ adminAuthFetch: jest.fn() }));

const input = {
  operatorKey: 'example-bet', operatorLegalName: 'Example Bet Ltd', operatorDisplayName: 'Example Bet',
  operatorLogoUrl: 'https://cdn.example/logo.png', affiliateDisclosureByLocale: { en: 'Affiliate EN', es: 'Affiliate ES', pt: 'Affiliate PT' },
  countryCode: 'FR', status: 'draft' as const, licenceReference: 'LIC-1', evidenceUrl: 'https://regulator.example/evidence',
  minimumAge: 18, partnerOnlyAllowed: true, sponsoredPredictionAllowed: false, bonusAdvertisingAllowed: false,
  matchSpecificPromotionAllowed: false, requiredWarningText: '18+. Play responsibly.',
  responsibleGamblingUrl: 'https://example.bet/responsible', approvedDestinationHosts: ['example.bet'],
  legalReviewedAt: '2026-08-01T00:00:00.000Z', legalReviewExpiresAt: '2027-08-01T00:00:00.000Z',
  effectiveFrom: '2026-08-02T00:00:00.000Z', configVersion: 'legal-2026-08', killSwitchEnabled: false,
};

describe('partner market config API', () => {
  beforeEach(() => (adminAuthFetch as jest.Mock).mockReset());

  it('lists with normalized exact filters', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ items: [] }) });
    await expect(getPartnerMarketConfigs({ operatorKey: ' Example-Bet ', countryCode: ' fr ' })).resolves.toEqual([]);
    expect(adminAuthFetch).toHaveBeenCalledWith({ path: '/partner-market-configs/admin?operatorKey=example-bet&countryCode=FR', method: 'GET' });
  });

  it('uses PUT with the typed configuration body', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ id: 'config-1', ...input }) });
    await savePartnerMarketConfig(input);
    expect(adminAuthFetch).toHaveBeenCalledWith({ path: '/partner-market-configs/admin', method: 'PUT', body: JSON.stringify(input) });
  });

  it('uses the dedicated pause endpoint and trims its reason', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) });
    await pausePartnerMarketConfig('config/1', '  Legal review withdrawn  ');
    expect(adminAuthFetch).toHaveBeenCalledWith({ path: '/partner-market-configs/admin/config%2F1/pause', method: 'POST', body: JSON.stringify({ reason: 'Legal review withdrawn' }) });
  });

  it('surfaces backend validation messages', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({ ok: false, status: 400, statusText: 'Bad Request', json: async () => ({ message: ['countryCode must be longer than or equal to 2 characters', 'countryCode must be shorter than or equal to 2 characters'] }) });
    await expect(getPartnerMarketConfigs()).rejects.toThrow('countryCode must be longer');
  });
});
