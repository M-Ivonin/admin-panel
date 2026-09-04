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
    const fields: Record<string, string> = {
      'Country code': 'fr',
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
    expect(within(editDialog).getByLabelText(/^Region code/)).toBeDisabled();
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
    fireEvent.change(within(createDialog).getByLabelText('Country code'), {
      target: { value: 'US' },
    });
    expect(within(createDialog).getByLabelText(/^Region code/)).toBeRequired();
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
      })
    );
    expect(
      await screen.findByText('Example Bet configuration saved.')
    ).toBeInTheDocument();
  }, 15_000);

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
    fireEvent.mouseDown(within(editDialog).getByLabelText('Status'));
    expect(
      screen.queryByRole('option', { name: /^paused$/ })
    ).not.toBeInTheDocument();
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
    });
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
      within(editDialog).getByText(
        'Affiliate disclosure is required for all en, es, and pt locales.'
      )
    ).toBeInTheDocument();
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
    'Required warning text': '18+. Play responsibly.',
    'Responsible gambling URL': 'https://example.bet/responsible',
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
