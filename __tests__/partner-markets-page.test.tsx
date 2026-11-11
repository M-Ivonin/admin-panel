import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import PartnerMarketsPage from '@/app/(admin)/dashboard/partner-markets/page';
import {
  getPartnerMarketConfigs,
  pausePartnerMarketConfig,
  savePartnerMarketConfig,
} from '@/lib/api/partner-market-configs';
import {
  getMarketingJurisdictions,
  pauseMarketingJurisdiction,
  saveMarketingJurisdiction,
} from '@/lib/api/marketing-jurisdictions';

jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/lib/api/partner-market-configs', () => ({
  getPartnerMarketConfigs: jest.fn(),
  pausePartnerMarketConfig: jest.fn(),
  savePartnerMarketConfig: jest.fn(),
}));
jest.mock('@/lib/api/marketing-jurisdictions', () => ({
  getMarketingJurisdictions: jest.fn(),
  pauseMarketingJurisdiction: jest.fn(),
  saveMarketingJurisdiction: jest.fn(),
}));

const config = {
  id: 'config-1',
  operatorKey: 'example-bet',
  operatorLegalName: 'Example Bet Ltd',
  operatorDisplayName: 'Example Bet',
  operatorLogoUrl: 'https://cdn.example/logo.png',
  affiliateDisclosureByLocale: {
    en: 'Affiliate EN',
    es: 'Affiliate ES',
    pt: 'Affiliate PT',
  },
  countryCode: 'FR',
  regionCode: null,
  status: 'approved' as const,
  licenceReference: 'LIC-1',
  evidenceUrl: 'https://regulator.example/evidence',
  minimumAge: 18,
  partnerOnlyAllowed: true,
  sponsoredPredictionAllowed: true,
  bonusAdvertisingAllowed: false,
  matchSpecificPromotionAllowed: false,
  requiredWarningText: '18+. Play responsibly.',
  responsibleGamblingUrl: 'https://example.bet/responsible',
  operatorTermsUrl: 'https://example.bet/terms',
  operatorDestinationUrl: 'https://example.bet/offer',
  approvedDestinationHosts: ['example.bet'],
  affiliateConversionTypes: [
    'commission',
    'deposit',
    'ftd',
    'registration',
    'reversal',
    'qualified_lead',
  ],
  legalReviewedAt: '2026-08-01T10:00:00.000Z',
  legalReviewExpiresAt: '2027-08-01T10:00:00.000Z',
  effectiveFrom: '2026-08-02T10:00:00.000Z',
  effectiveUntil: null,
  configVersion: 'legal-1',
  killSwitchEnabled: false,
  killSwitchReason: null,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

const frJurisdiction = {
  id: 'rule-fr',
  countryCode: 'FR',
  regionCode: null,
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
  effectiveUntil: null,
  rulesVersion: 'fr-2026-08',
  statusReason: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('PartnerMarketsPage', () => {
  beforeEach(() => {
    (getPartnerMarketConfigs as jest.Mock).mockReset();
    (savePartnerMarketConfig as jest.Mock).mockReset();
    (pausePartnerMarketConfig as jest.Mock).mockReset();
    (getMarketingJurisdictions as jest.Mock)
      .mockReset()
      .mockResolvedValue([frJurisdiction]);
    (saveMarketingJurisdiction as jest.Mock).mockReset();
    (pauseMarketingJurisdiction as jest.Mock).mockReset();
  });

  it('manages jurisdiction rules in a separate tab on the Partner markets screen', async () => {
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([]);
    (getMarketingJurisdictions as jest.Mock).mockResolvedValue([
      {
        id: 'rule-1',
        countryCode: 'FR',
        regionCode: null,
        status: 'approved',
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
        effectiveUntil: null,
        rulesVersion: 'fr-2026-08',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    ]);
    render(<PartnerMarketsPage />);

    expect(
      await screen.findByRole('tab', { name: 'Partner configurations' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Jurisdiction rules' }));

    expect(
      await screen.findByText('FR · Version fr-2026-08')
    ).toBeInTheDocument();
    expect(screen.getByText('Partner offers')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add jurisdiction rule' })
    ).toBeEnabled();
    expect(getMarketingJurisdictions).toHaveBeenCalledWith({ countryCode: '' });
  });

  it('edits and removes the in-app policy through the jurisdiction dialog', async () => {
    const policy = {
      expiresAt: '2027-07-01T12:00:30.000Z',
      platforms: { ios: { minimumAge: 21, assurance: 'verified' } },
      disclosureByLocale: {
        en: {
          warning: 'Play responsibly.',
          supportUrl: 'https://example.fr/support',
          termsUrl: 'https://example.fr/terms',
        },
      },
    };
    const rule = {
      ...frJurisdiction,
      rulesVersion: `${'r'.repeat(78)}😀 `,
      requiredWarningText: '18+. Play responsibly. ',
      legalReviewedAt: '2026-08-01T00:00:05.000Z',
      legalReviewExpiresAt: '2026-08-01T00:00:55.000Z',
      inAppPartnerPolicy: policy,
    };
    const updated = {
      ...rule,
      inAppPartnerPolicy: {
        ...policy,
        platforms: { ios: { ...policy.platforms.ios, minimumAge: 22 } },
      },
    };
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([]);
    (getMarketingJurisdictions as jest.Mock)
      .mockResolvedValueOnce([rule])
      .mockResolvedValueOnce([updated])
      .mockResolvedValue([{ ...updated, inAppPartnerPolicy: null }]);
    (saveMarketingJurisdiction as jest.Mock)
      .mockResolvedValueOnce(updated)
      .mockResolvedValue({ ...updated, inAppPartnerPolicy: null });

    render(<PartnerMarketsPage />);
    fireEvent.click(screen.getByRole('tab', { name: 'Jurisdiction rules' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));

    const age = screen.getByRole('spinbutton', { name: 'iOS minimum age' });
    expect(age).toHaveValue(21);
    fireEvent.change(age, { target: { value: '17' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save rule' }));
    expect(await screen.findByText('iOS minimum age must be a whole number from 18 to 125.')).toBeVisible();
    expect(saveMarketingJurisdiction).not.toHaveBeenCalled();

    fireEvent.change(age, { target: { value: '22' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save rule' }));
    await screen.findByText('FR jurisdiction rule saved.');
    expect(saveMarketingJurisdiction).toHaveBeenLastCalledWith(expect.objectContaining({
      inAppPartnerPolicy: updated.inAppPartnerPolicy,
      expectedUpdatedAt: rule.updatedAt,
      rulesVersion: rule.rulesVersion,
      requiredWarningText: rule.requiredWarningText,
      legalReviewedAt: rule.legalReviewedAt,
      legalReviewExpiresAt: rule.legalReviewExpiresAt,
    }));

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('spinbutton', { name: 'iOS minimum age' })).toHaveValue(22);
    fireEvent.click(screen.getByLabelText('Configure in-app partner ads'));
    fireEvent.click(screen.getByRole('button', { name: 'Save rule' }));
    await waitFor(() => expect(saveMarketingJurisdiction).toHaveBeenLastCalledWith(
      expect.objectContaining({ inAppPartnerPolicy: null })
    ));
  });

  it('keeps jurisdiction creation independent from a pending partner request', async () => {
    (getPartnerMarketConfigs as jest.Mock).mockReturnValue(
      new Promise(() => undefined)
    );
    (getMarketingJurisdictions as jest.Mock).mockResolvedValue([]);
    render(<PartnerMarketsPage />);

    expect(
      screen.getByRole('button', { name: 'Add configuration' })
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('tab', { name: 'Jurisdiction rules' }));

    expect(
      await screen.findByText('No jurisdiction rules found')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add jurisdiction rule' })
    ).toBeEnabled();
  });

  it('creates a reviewed jurisdiction rule through the jurisdiction tab', async () => {
    const savedRule = {
      id: 'rule-1',
      countryCode: 'FR',
      regionCode: null,
      status: 'approved' as const,
      minimumAge: 18,
      predictionsEmailAllowed: false,
      productEmailAllowed: false,
      partnerOfferEmailAllowed: true,
      combinedPredictionOfferAllowed: false,
      bonusAdvertisingAllowed: false,
      matchSpecificPromotionAllowed: false,
      requiredWarningText: '18+. Play responsibly.',
      warningLayoutRules: {},
      responsibleGamblingUrl: 'https://example.fr/responsible',
      regulatorSourceUrl: 'https://regulator.example/fr',
      legalReviewedAt: '2026-08-01T10:00:00.000Z',
      legalReviewExpiresAt: '2027-08-01T10:00:00.000Z',
      effectiveFrom: '2026-08-02T10:00:00.000Z',
      effectiveUntil: null,
      rulesVersion: 'fr-2026-08',
      statusReason: null,
      createdAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-01T10:00:00.000Z',
    };
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([]);
    (getMarketingJurisdictions as jest.Mock).mockResolvedValue([]);
    (saveMarketingJurisdiction as jest.Mock).mockResolvedValue(savedRule);
    render(<PartnerMarketsPage />);
    await screen.findByText('No partner market configurations found');
    fireEvent.click(screen.getByRole('tab', { name: 'Jurisdiction rules' }));
    await screen.findByText('No jurisdiction rules found');
    fireEvent.click(
      screen.getByRole('button', { name: 'Add jurisdiction rule' })
    );
    const dialog = screen.getByRole('dialog', {
      name: 'Add jurisdiction rule',
    });
    const countrySelect = within(dialog).getByRole('combobox', {
      name: 'Country',
    });
    fireEvent.change(countrySelect, { target: { value: 'France' } });
    fireEvent.click(screen.getByRole('option', { name: '🇫🇷 France (FR)' }));
    const fields: Record<string, string> = {
      'Minimum age': '18',
      'Required warning text': '18+. Play responsibly.',
      'Responsible gambling URL': 'https://example.fr/responsible',
      'Regulator source URL': 'https://regulator.example/fr',
      'Legal reviewed at': '2026-08-01T10:00',
      'Legal review expires at': '2027-08-01T10:00',
      'Effective from': '2026-08-02T10:00',
      'Rules version': 'fr-2026-08',
    };
    for (const [label, value] of Object.entries(fields)) {
      fireEvent.change(within(dialog).getByLabelText(label), {
        target: { value },
      });
    }
    fireEvent.mouseDown(within(dialog).getByLabelText('Status'));
    fireEvent.click(screen.getByRole('option', { name: 'approved' }));
    fireEvent.click(within(dialog).getByLabelText('Partner offers'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save rule' }));

    await waitFor(() =>
      expect(saveMarketingJurisdiction).toHaveBeenCalledWith(
        expect.objectContaining({
          countryCode: 'FR',
          status: 'approved',
          minimumAge: 18,
          partnerOfferEmailAllowed: true,
          warningLayoutRules: {},
          rulesVersion: 'fr-2026-08',
        })
      )
    );
    expect(
      await screen.findByText('FR jurisdiction rule saved.')
    ).toBeInTheDocument();
  });

  it('marks region as required for US rules and explains immutable locations', async () => {
    const usRule = {
      id: 'rule-us',
      countryCode: 'US',
      regionCode: null,
      status: 'approved' as const,
      minimumAge: 18,
      predictionsEmailAllowed: true,
      productEmailAllowed: true,
      partnerOfferEmailAllowed: true,
      combinedPredictionOfferAllowed: true,
      bonusAdvertisingAllowed: true,
      matchSpecificPromotionAllowed: true,
      requiredWarningText: '18+',
      warningLayoutRules: {},
      responsibleGamblingUrl: 'https://example.com/responsible',
      regulatorSourceUrl: 'https://example.com/regulator',
      legalReviewedAt: '2026-08-01T00:00:00.000Z',
      legalReviewExpiresAt: '2027-08-01T00:00:00.000Z',
      effectiveFrom: '2026-08-02T00:00:00.000Z',
      effectiveUntil: null,
      rulesVersion: 'us-2026-08',
      statusReason: null,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    };
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([]);
    (getMarketingJurisdictions as jest.Mock).mockResolvedValue([usRule]);
    render(<PartnerMarketsPage />);
    fireEvent.click(screen.getByRole('tab', { name: 'Jurisdiction rules' }));
    await screen.findByText('US · Version us-2026-08');
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const editDialog = screen.getByRole('dialog', {
      name: 'Edit jurisdiction rule',
    });
    expect(
      within(editDialog).getByRole('combobox', { name: /Country/ })
    ).toBeDisabled();
    expect(
      within(editDialog).getByRole('combobox', { name: /Region/ })
    ).toBeDisabled();
    expect(
      within(editDialog).getByText(
        'Location cannot be changed. Create a new rule for another country or region.'
      )
    ).toBeInTheDocument();
    fireEvent.click(within(editDialog).getByRole('button', { name: 'Cancel' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Add jurisdiction rule' })
    );
    const createDialog = screen.getByRole('dialog', {
      name: 'Add jurisdiction rule',
    });
    const countrySelect = within(createDialog).getByRole('combobox', {
      name: 'Country',
    });
    fireEvent.change(countrySelect, {
      target: { value: 'United States' },
    });
    fireEvent.click(
      screen.getByRole('option', { name: '🇺🇸 United States (US)' })
    );
    const regionSelect = within(createDialog).getByRole('combobox', {
      name: /Region/,
    });
    expect(regionSelect).toBeRequired();
    fireEvent.mouseDown(regionSelect);
    expect(
      screen.getByRole('option', { name: 'California (CA)' })
    ).toBeInTheDocument();
    fireEvent.keyDown(regionSelect, { key: 'Escape' });
    fireEvent.click(
      within(createDialog).getByRole('button', { name: 'Save rule' })
    );
    expect(
      within(createDialog).getByText('Region is required for this country.')
    ).toBeInTheDocument();
    expect(saveMarketingJurisdiction).not.toHaveBeenCalled();
  });

  it('shows loading, then the list with legal facts and send warning', async () => {
    let resolveList: (value: (typeof config)[]) => void = () => undefined;
    (getPartnerMarketConfigs as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      })
    );
    render(<PartnerMarketsPage />);
    expect(
      screen.getByText(/Loading partner market configurations/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add configuration' })
    ).toBeDisabled();
    resolveList([config]);
    expect(await screen.findByText('Example Bet')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add configuration' })
    ).toBeEnabled();
    expect(
      screen.getByText(/Partner-only, Sponsored predictions/)
    ).toBeInTheDocument();
    expect(screen.getByText('example.bet')).toBeInTheDocument();
    expect(
      screen.getByText(/Draft configurations do not permit email sends/)
    ).toBeInTheDocument();
  });

  it('renders empty and error states', async () => {
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValueOnce([]);
    const { unmount } = render(<PartnerMarketsPage />);
    expect(
      await screen.findByText('No partner market configurations found')
    ).toBeInTheDocument();
    unmount();
    (getPartnerMarketConfigs as jest.Mock).mockRejectedValueOnce(
      new Error('Access denied')
    );
    render(<PartnerMarketsPage />);
    expect(await screen.findByText('Access denied')).toBeInTheDocument();
  });

  it('retries an unchanged filter request', async () => {
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([]);
    render(<PartnerMarketsPage />);
    await screen.findByText('No partner market configurations found');
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    await waitFor(() =>
      expect(getPartnerMarketConfigs).toHaveBeenCalledTimes(2)
    );
  });

  it('creates a normalized draft and displays success', async () => {
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([]);
    (savePartnerMarketConfig as jest.Mock).mockResolvedValue(config);
    render(<PartnerMarketsPage />);
    await screen.findByText('No partner market configurations found');
    fireEvent.click(screen.getByRole('button', { name: 'Add configuration' }));
    const createDialog = screen.getByRole('dialog', {
      name: 'Add partner market',
    });
    expect(within(createDialog).getByLabelText('Email')).toBeChecked();
    expect(within(createDialog).getByLabelText('In-app')).not.toBeChecked();
    expect(
      within(createDialog).queryByLabelText('Country code')
    ).not.toBeInTheDocument();
    expect(
      within(createDialog).queryByLabelText(/^Region code/)
    ).not.toBeInTheDocument();
    const jurisdictionSelect = await within(createDialog).findByRole(
      'combobox',
      { name: /Jurisdiction rule/ }
    );
    await waitFor(() => expect(jurisdictionSelect).toBeEnabled());
    fireEvent.mouseDown(jurisdictionSelect);
    fireEvent.click(
      screen.getByRole('option', { name: 'FR · Country-wide · approved' })
    );
    fillRequiredForm(createDialog);
    fireEvent.click(
      within(createDialog).getByRole('button', { name: 'Save configuration' })
    );
    await waitFor(() => expect(savePartnerMarketConfig).toHaveBeenCalled());
    expect(savePartnerMarketConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        operatorKey: 'example-bet',
        countryCode: 'FR',
        status: 'draft',
        approvedDestinationHosts: ['example.bet'],
        emailEnabled: true,
        inAppEnabled: false,
        inAppBannerAffiliateUrl: null,
      })
    );
    expect(
      await screen.findByText('Example Bet configuration saved.')
    ).toBeInTheDocument();
  }, 15_000);

  it('inherits jurisdiction disclosures and only accepts a stricter partner age', async () => {
    const market = {
      ...config,
      countryCode: 'SE',
      inAppEnabled: true,
      legalReviewedAt: '2020-01-01T00:00:00Z',
      effectiveFrom: '2020-01-01T00:00:00Z',
      legalReviewExpiresAt: '2090-01-01T00:00:00Z',
    };
    const jurisdiction = {
      ...frJurisdiction,
      countryCode: 'SE',
      minimumAge: 21,
      requiredWarningText: 'Market-specific warning.',
      responsibleGamblingUrl: 'https://example.se/support',
      legalReviewedAt: '2020-01-01T00:00:00Z',
      effectiveFrom: '2020-01-01T00:00:00Z',
      legalReviewExpiresAt: '2090-01-01T00:00:00Z',
      inAppRulesVersion: 'app-1',
      inAppPartnerPolicy: {
        expiresAt: '2090-01-01T00:00:00Z',
        platforms: { ios: { minimumAge: 21, assurance: 'self_declaration' } },
        disclosureByLocale: {
          en: { warning: 'Warning', supportUrl: 'https://example.se/support', termsUrl: 'https://example.se/terms' },
        },
      },
    };
    (getPartnerMarketConfigs as jest.Mock)
      .mockResolvedValueOnce([market])
      .mockResolvedValue([{ ...market, minimumAge: 23 }]);
    (getMarketingJurisdictions as jest.Mock).mockResolvedValue([jurisdiction]);
    (savePartnerMarketConfig as jest.Mock).mockResolvedValue({ ...market, minimumAge: 23 });

    render(<PartnerMarketsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Edit partner market' }));
    fireEvent.click(dialog.getByText('Licence and restrictions'));
    expect(await dialog.findByText('Market-specific warning.')).toBeVisible();
    expect(dialog.getByText('https://example.se/support')).toBeVisible();
    expect(dialog.getByText('Jurisdiction platforms: iOS')).toBeVisible();
    expect(dialog.getByText('Android is not allowed by this jurisdiction.')).toBeVisible();
    expect(dialog.getByText('An in-app banner affiliate link is required.')).toBeVisible();
    const bannerLink = dialog.getByRole('textbox', { name: 'In-app banner affiliate link' });
    for (const value of [
      'https://unapproved.example/banner',
      'https://example.bet/banner#offer',
      `https://example.bet/${'a'.repeat(2029)}`,
    ]) {
      fireEvent.change(bannerLink, { target: { value } });
      expect(dialog.getByText(/must be a valid HTTPS URL on an approved hostname/)).toBeVisible();
    }
    fireEvent.change(bannerLink, { target: { value: 'HTTPS://example.bet/' } });
    expect(dialog.queryByText(/must be a valid HTTPS URL on an approved hostname/)).not.toBeInTheDocument();
    fireEvent.change(bannerLink, { target: { value: '' } });
    const inApp = dialog.getByLabelText('In-app', { exact: true });
    fireEvent.click(inApp);
    expect(dialog.getByText('In-app is switched off for this partner.')).toBeVisible();
    fireEvent.click(inApp);
    expect(dialog.queryByRole('textbox', { name: 'Required warning text' })).not.toBeInTheDocument();
    const age = dialog.getByRole('textbox', { name: 'Higher partner minimum age' });
    expect(age).toHaveValue('');
    const save = dialog.getByRole('button', { name: 'Save configuration' });
    fireEvent.change(age, { target: { value: '21' } });
    fireEvent.click(save);
    expect(await dialog.findByText('Enter a whole number above 21, up to 125.')).toBeVisible();
    expect(savePartnerMarketConfig).not.toHaveBeenCalled();
    fireEvent.change(age, { target: { value: '23' } });
    fireEvent.change(bannerLink, { target: { value: 'https://example.bet/' } });
    fireEvent.change(dialog.getByRole('textbox', { name: 'Final operator hostnames' }), {
      target: { value: 'example.bet' },
    });
    fireEvent.click(save);
    await screen.findByText('Example Bet configuration saved.');
    expect(savePartnerMarketConfig).toHaveBeenCalledWith(expect.objectContaining({
      minimumAge: 23,
      requiredWarningText: jurisdiction.requiredWarningText,
      responsibleGamblingUrl: jurisdiction.responsibleGamblingUrl,
      inAppEnabled: true,
    }));

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const reopened = within(screen.getByRole('dialog', { name: 'Edit partner market' }));
    await reopened.findByText('Inherited from Jurisdiction Rules');
    fireEvent.click(reopened.getByText('Licence and restrictions'));
    const savedAge = reopened.getByRole('textbox', { name: 'Higher partner minimum age' });
    expect(savedAge).toHaveValue('23');
    fireEvent.change(savedAge, { target: { value: '2e' } });
    fireEvent.click(reopened.getByRole('button', { name: 'Save configuration' }));
    expect(await reopened.findByText('Enter a whole number above 21, up to 125.')).toBeVisible();
    expect(savePartnerMarketConfig).toHaveBeenCalledTimes(1);
  });

  it.each([
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ])(
    'saves and reopens independent channels (Email %s, In-app %s)',
    async (emailEnabled, inAppEnabled) => {
      const legacyConfig = {
        ...config,
        legalReviewedAt: '2026-08-01T10:00:43.123Z',
      };
      const inAppBannerAffiliateUrl = 'https://example.bet/matches?ref=sirbro';
      const saved = {
        ...legacyConfig,
        emailEnabled,
        inAppEnabled,
        inAppBannerAffiliateUrl,
        inAppFinalDestinationHosts: inAppEnabled ? ['example.bet'] : [],
      };
      (getPartnerMarketConfigs as jest.Mock)
        .mockResolvedValueOnce([legacyConfig])
        .mockResolvedValue([saved]);
      (savePartnerMarketConfig as jest.Mock).mockResolvedValue(saved);
      render(<PartnerMarketsPage />);

      expect(await screen.findByText('Email enabled')).toBeInTheDocument();
      expect(screen.getByText('In-app disabled')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      const editDialog = screen.getByRole('dialog', {
        name: 'Edit partner market',
      });
      await within(editDialog).findByText('Inherited from Jurisdiction Rules');
      if (!emailEnabled)
        fireEvent.click(within(editDialog).getByLabelText('Email'));
      if (inAppEnabled) {
        fireEvent.click(within(editDialog).getByLabelText('In-app'));
        fireEvent.click(
          within(editDialog).getByRole('button', { name: 'Save configuration' })
        );
        expect(within(editDialog).getByRole('textbox', { name: 'In-app banner affiliate link' }))
          .toHaveAccessibleDescription('Enter an in-app banner affiliate link when In-app is enabled.');
        expect(within(editDialog).getByRole('textbox', { name: 'Final operator hostnames' }))
          .toHaveAccessibleDescription('Add at least one final operator hostname when In-app is enabled.');
        expect(savePartnerMarketConfig).not.toHaveBeenCalled();
        fireEvent.change(within(editDialog).getByRole('textbox', { name: 'Final operator hostnames' }), {
          target: { value: 'example.bet' },
        });
      }
      fireEvent.change(
        within(editDialog).getByRole('textbox', { name: 'In-app banner affiliate link' }),
        {
          target: { value: inAppBannerAffiliateUrl },
        }
      );
      fireEvent.click(
        within(editDialog).getByRole('button', { name: 'Save configuration' })
      );

      await screen.findByText('Example Bet configuration saved.');
      expect(savePartnerMarketConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          emailEnabled,
          inAppEnabled,
          inAppBannerAffiliateUrl,
          inAppFinalDestinationHosts: saved.inAppFinalDestinationHosts,
          ...(emailEnabled ? { operatorDestinationUrl: legacyConfig.operatorDestinationUrl } : {}),
          legalReviewedAt: legacyConfig.legalReviewedAt,
          configVersion: legacyConfig.configVersion,
          expectedUpdatedAt: legacyConfig.updatedAt,
        })
      );
      expect(
        await screen.findByText(
          `Email ${emailEnabled ? 'enabled' : 'disabled'}`
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(`In-app ${inAppEnabled ? 'enabled' : 'disabled'}`)
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      const reopenedDialog = screen.getByRole('dialog', {
        name: 'Edit partner market',
      });
      await within(reopenedDialog).findByText('Inherited from Jurisdiction Rules');
      expect(
        within(reopenedDialog).getByRole('textbox', { name: 'In-app banner affiliate link' })
      ).toHaveValue(inAppBannerAffiliateUrl);
      if (inAppEnabled) {
        fireEvent.click(within(reopenedDialog).getByLabelText('In-app'));
      }
      fireEvent.change(within(reopenedDialog).getByRole('textbox', { name: 'Final operator hostnames' }), {
        target: { value: '' },
      });
      fireEvent.change(
        within(reopenedDialog).getByRole('textbox', { name: 'In-app banner affiliate link' }),
        {
          target: { value: '' },
        }
      );
      fireEvent.click(
        within(reopenedDialog).getByRole('button', {
          name: 'Save configuration',
        })
      );
      await waitFor(() =>
        expect(savePartnerMarketConfig).toHaveBeenLastCalledWith(
          expect.objectContaining({
            inAppEnabled: false,
            inAppBannerAffiliateUrl: null,
            inAppFinalDestinationHosts: [],
          })
        )
      );
    }
  );

  it('edits an existing row and uses the dedicated confirmed pause request', async () => {
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([config]);
    (savePartnerMarketConfig as jest.Mock).mockResolvedValue({
      ...config,
      configVersion: 'legal-2',
    });
    (pausePartnerMarketConfig as jest.Mock).mockResolvedValue({
      ...config,
      status: 'paused',
    });
    render(<PartnerMarketsPage />);
    await screen.findByText('Example Bet');
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const editDialog = screen.getByRole('dialog', {
      name: 'Edit partner market',
    });
    await within(editDialog).findByText('Inherited from Jurisdiction Rules');
    fireEvent.mouseDown(within(editDialog).getByLabelText('Status'));
    expect(
      screen.queryByRole('option', { name: /^paused$/ })
    ).not.toBeInTheDocument();
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
    });
    fireEvent.click(within(editDialog).getByText('Advanced settings'));
    fireEvent.change(within(editDialog).getByLabelText('Config version'), {
      target: { value: 'legal-2' },
    });
    fireEvent.click(
      within(editDialog).getByRole('button', { name: 'Save configuration' })
    );
    await waitFor(() =>
      expect(savePartnerMarketConfig).toHaveBeenCalledWith(
        expect.objectContaining({ configVersion: 'legal-2' })
      )
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Edit partner market' })
      ).not.toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    const pauseDialog = screen.getByRole('dialog', {
      name: 'Pause Example Bet?',
    });
    fireEvent.click(
      within(pauseDialog).getByRole('button', { name: 'Confirm pause' })
    );
    expect(
      within(pauseDialog).getByText('A pause reason is required.')
    ).toBeInTheDocument();
    fireEvent.change(within(pauseDialog).getByLabelText('Required reason'), {
      target: { value: ' Licence suspended ' },
    });
    fireEvent.click(
      within(pauseDialog).getByRole('button', { name: 'Confirm pause' })
    );
    await waitFor(() =>
      expect(pausePartnerMarketConfig).toHaveBeenCalledWith(
        'config-1',
        ' Licence suspended '
      )
    );
  });

  it('opens collapsed sections and focuses the first invalid field when saving', async () => {
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([{
      ...config,
      licenceReference: '',
      operatorLogoUrl: '',
    }]);
    render(<PartnerMarketsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Edit partner market' }));
    const licence = dialog.getByText('Licence and restrictions').closest('details');
    const advanced = dialog.getByText('Advanced settings').closest('details');
    expect(licence).not.toHaveAttribute('open');
    expect(advanced).not.toHaveAttribute('open');
    const save = dialog.getByRole('button', { name: 'Save configuration' });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);

    await waitFor(() => expect(dialog.getByLabelText('Licence reference')).toHaveFocus());
    expect(licence).toHaveAttribute('open');
    expect(advanced).toHaveAttribute('open');
    expect(dialog.getByLabelText('Operator logo URL')).toHaveAttribute('aria-invalid', 'true');
    expect(savePartnerMarketConfig).not.toHaveBeenCalled();
  });

  it('reveals Config version when the server requires a new version', async () => {
    const message = 'configVersion must change when operator logo, terms, affiliate disclosure or conversion allowlist changes';
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([config]);
    (savePartnerMarketConfig as jest.Mock).mockRejectedValueOnce(new Error(message));
    render(<PartnerMarketsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Edit partner market' }));
    const advanced = dialog.getByText('Advanced settings').closest('details');
    expect(advanced).not.toHaveAttribute('open');
    fireEvent.change(dialog.getByLabelText('Full operator terms URL'), {
      target: { value: 'https://example.bet/updated-terms' },
    });
    const save = dialog.getByRole('button', { name: 'Save configuration' });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);

    const version = dialog.getByLabelText('Config version');
    await waitFor(() => expect(version).toHaveFocus());
    expect(advanced).toHaveAttribute('open');
    expect(version).toHaveAccessibleDescription(message);
  });

  it('saves an in-app partner without email fields and restores their validation when Email is enabled', async () => {
    const market = {
      ...config,
      emailEnabled: false,
      inAppEnabled: true,
      inAppBannerAffiliateUrl: 'https://example.bet/banner',
      inAppFinalDestinationHosts: ['example.bet'],
      operatorDestinationUrl: null,
      operatorTermsUrl: null,
      affiliateDisclosureByLocale: null,
    };
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([market]);
    (savePartnerMarketConfig as jest.Mock).mockResolvedValue(market);
    render(<PartnerMarketsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Edit partner market' }));
    const save = dialog.getByRole('button', { name: 'Save configuration' });
    await waitFor(() => expect(save).toBeEnabled());
    expect(dialog.queryByLabelText('Exact operator destination URL')).not.toBeInTheDocument();
    expect(dialog.queryByLabelText('Affiliate disclosure (EN)')).not.toBeInTheDocument();
    expect(dialog.queryByLabelText('Full operator terms URL')).not.toBeInTheDocument();

    fireEvent.click(dialog.getByLabelText('Email'));
    fireEvent.click(save);
    expect(await dialog.findByText('Enter the exact approved HTTPS operator destination.')).toBeVisible();
    expect(savePartnerMarketConfig).not.toHaveBeenCalled();

    fireEvent.click(dialog.getByLabelText('Email'));
    fireEvent.click(save);
    await screen.findByText('Example Bet configuration saved.');
    const [payload] = (savePartnerMarketConfig as jest.Mock).mock.calls[0];
    expect(payload).toMatchObject({ emailEnabled: false, inAppEnabled: true, inAppBannerAffiliateUrl: market.inAppBannerAffiliateUrl });
    expect(payload).not.toHaveProperty('operatorDestinationUrl');
    expect(payload).not.toHaveProperty('operatorTermsUrl');
    expect(payload).not.toHaveProperty('affiliateDisclosureByLocale');
  });

  it('shows migrated missing display data and keeps it required when editing', async () => {
    const migratedConfig = {
      ...config,
      operatorLogoUrl: null,
      affiliateDisclosureByLocale: null,
      operatorTermsUrl: null,
      operatorDestinationUrl: null,
    };
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([migratedConfig]);
    render(<PartnerMarketsPage />);

    expect(await screen.findByText('Example Bet')).toBeInTheDocument();
    expect(screen.getAllByText('Missing')).toHaveLength(4);

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const editDialog = screen.getByRole('dialog', {
      name: 'Edit partner market',
    });
    await within(editDialog).findByText('Inherited from Jurisdiction Rules');
    expect(within(editDialog).getByLabelText('Operator logo URL')).toHaveValue(
      ''
    );
    expect(
      within(editDialog).getByLabelText('Affiliate disclosure (EN)')
    ).toHaveValue('');
    expect(
      within(editDialog).getByLabelText('Affiliate disclosure (ES)')
    ).toHaveValue('');
    expect(
      within(editDialog).getByLabelText('Affiliate disclosure (PT)')
    ).toHaveValue('');
    expect(
      within(editDialog).getByLabelText('Full operator terms URL')
    ).toHaveValue('');

    fireEvent.click(
      within(editDialog).getByRole('button', { name: 'Save configuration' })
    );
    expect(
      await within(editDialog).findByText(
        'Enter a valid HTTPS operator logo URL.'
      )
    ).toBeInTheDocument();
    expect(
      within(editDialog).getAllByText(
        'Affiliate disclosure is required for all en, es, and pt locales.'
      )
    ).toHaveLength(3);
    expect(
      within(editDialog).getByText('Enter a valid HTTPS operator terms URL.')
    ).toBeInTheDocument();
    expect(savePartnerMarketConfig).not.toHaveBeenCalled();
  });
});

function fillRequiredForm(container: HTMLElement): void {
  const values: Record<string, string> = {
    'Operator key': ' Example-Bet ',
    'Operator legal name': 'Example Bet Ltd',
    'Operator display name': 'Example Bet',
    'Operator logo URL': 'https://cdn.example/logo.png',
    'Licence reference': 'LIC-1',
    'Evidence URL': 'https://regulator.example/evidence',
    'Full operator terms URL': 'https://example.bet/terms',
    'Exact operator destination URL': 'https://example.bet/offer',
    'Approved destination hosts': 'EXAMPLE.BET',
    'Legal reviewed at': '2026-08-01T10:00',
    'Legal review expires at': '2027-08-01T10:00',
    'Effective from': '2026-08-02T10:00',
    'Config version': 'legal-1',
  };
  for (const [label, value] of Object.entries(values))
    fireEvent.change(within(container).getByLabelText(label), {
      target: { value },
    });
  fireEvent.change(
    within(container).getByLabelText('Affiliate disclosure (EN)'),
    { target: { value: 'Affiliate EN' } }
  );
  fireEvent.change(
    within(container).getByLabelText('Affiliate disclosure (ES)'),
    { target: { value: 'Affiliate ES' } }
  );
  fireEvent.change(
    within(container).getByLabelText('Affiliate disclosure (PT)'),
    { target: { value: 'Affiliate PT' } }
  );
}
