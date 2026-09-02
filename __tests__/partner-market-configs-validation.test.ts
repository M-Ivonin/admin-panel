import {
  emptyPartnerMarketConfigForm,
  normalizePartnerMarketConfigForm,
  validatePartnerMarketConfigForm,
} from '@/modules/partner-market-configs/validation';

const valid = {
  ...emptyPartnerMarketConfigForm,
  operatorKey: ' Example-Bet ',
  operatorLegalName: ' Example Bet Ltd ',
  operatorDisplayName: ' Example Bet ',
  countryCode: ' fr ',
  regionCode: ' id-f ',
  licenceReference: ' LIC-1 ',
  evidenceUrl: 'https://regulator.example/evidence',
  minimumAge: '18',
  requiredWarningText: ' 18+ ',
  responsibleGamblingUrl: 'https://example.bet/responsible',
  operatorTermsUrl: 'https://example.bet/terms',
  approvedDestinationHosts: ' WWW.EXAMPLE.BET.\nexample.bet',
  legalReviewedAt: '2026-08-01T10:00',
  legalReviewExpiresAt: '2027-08-01T10:00',
  effectiveFrom: '2026-08-02T10:00',
  configVersion: ' legal-1 ',
  operatorLogoUrl: ' https://cdn.example/logo.png ',
  affiliateDisclosureByLocale: {
    en: ' Affiliate EN ',
    es: ' Affiliate ES ',
    pt: ' Affiliate PT ',
  },
};

describe('partner market config form validation', () => {
  it('normalizes identity and unique hostname values for the backend', () => {
    const result = normalizePartnerMarketConfigForm(valid);
    expect(result).toMatchObject({
      operatorKey: 'example-bet',
      countryCode: 'FR',
      regionCode: 'ID-F',
      minimumAge: 18,
      approvedDestinationHosts: ['example.bet', 'www.example.bet'],
      configVersion: 'legal-1',
    });
  });

  it('requires a kill-switch reason only while enabled', () => {
    expect(
      validatePartnerMarketConfigForm({ ...valid, killSwitchEnabled: true })
        .killSwitchReason
    ).toMatch(/required/);
    expect(
      validatePartnerMarketConfigForm({ ...valid, killSwitchEnabled: false })
        .killSwitchReason
    ).toBeUndefined();
  });

  it('rejects invalid hostnames and reversed legal/effective dates', () => {
    const errors = validatePartnerMarketConfigForm({
      ...valid,
      approvedDestinationHosts: 'https://example.bet/path',
      legalReviewExpiresAt: '2026-07-01T10:00',
      effectiveUntil: '2026-08-01T10:00',
    });
    expect(errors.approvedDestinationHosts).toMatch(/hostnames only/);
    expect(errors.legalReviewExpiresAt).toMatch(/after/);
    expect(errors.effectiveUntil).toMatch(/after/);
  });

  it('accepts backend-valid scheme-less URLs and rejects normalized duplicate hosts', () => {
    expect(
      validatePartnerMarketConfigForm({
        ...valid,
        evidenceUrl: 'regulator.example/evidence',
      }).evidenceUrl
    ).toBeUndefined();
    expect(
      validatePartnerMarketConfigForm({
        ...valid,
        approvedDestinationHosts: 'EXAMPLE.BET\nexample.bet',
      }).approvedDestinationHosts
    ).toMatch(/unique/);
  });

  it('matches backend validator behavior for URL host characters and IDNs', () => {
    expect(
      validatePartnerMarketConfigForm({
        ...valid,
        evidenceUrl: 'https://foo_bar/path',
      }).evidenceUrl
    ).toMatch(/valid URL/);
    expect(
      validatePartnerMarketConfigForm({
        ...valid,
        approvedDestinationHosts: 'éxample.com',
      }).approvedDestinationHosts
    ).toBeUndefined();
  });

  it('requires an HTTPS operator logo and all localized affiliate disclosures', () => {
    expect(
      validatePartnerMarketConfigForm({
        ...valid,
        operatorLogoUrl: 'http://cdn.example/logo.png',
      }).operatorLogoUrl
    ).toMatch(/HTTPS/);
    expect(
      validatePartnerMarketConfigForm({
        ...valid,
        operatorTermsUrl: 'http://example.bet/terms',
      }).operatorTermsUrl
    ).toMatch(/HTTPS/);
    expect(
      validatePartnerMarketConfigForm({
        ...valid,
        affiliateDisclosureByLocale: { en: 'EN', es: '', pt: 'PT' },
      }).affiliateDisclosureByLocale
    ).toMatch(/all en, es, and pt/);
    expect(normalizePartnerMarketConfigForm(valid)).toMatchObject({
      operatorLogoUrl: 'https://cdn.example/logo.png',
      affiliateDisclosureByLocale: {
        en: 'Affiliate EN',
        es: 'Affiliate ES',
        pt: 'Affiliate PT',
      },
    });
  });
});
