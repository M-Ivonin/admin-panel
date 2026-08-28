import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import PartnerMarketsPage from '@/app/(admin)/dashboard/partner-markets/page';
import {
  getPartnerMarketConfigs,
  pausePartnerMarketConfig,
  savePartnerMarketConfig,
} from '@/lib/api/partner-market-configs';

jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/lib/api/partner-market-configs', () => ({
  getPartnerMarketConfigs: jest.fn(),
  pausePartnerMarketConfig: jest.fn(),
  savePartnerMarketConfig: jest.fn(),
}));

const config = {
  id: 'config-1', operatorKey: 'example-bet', operatorLegalName: 'Example Bet Ltd', operatorDisplayName: 'Example Bet',
  countryCode: 'FR', regionCode: null, status: 'approved' as const, licenceReference: 'LIC-1', evidenceUrl: 'https://regulator.example/evidence',
  minimumAge: 18, partnerOnlyAllowed: true, sponsoredPredictionAllowed: true, bonusAdvertisingAllowed: false, matchSpecificPromotionAllowed: false,
  requiredWarningText: '18+. Play responsibly.', responsibleGamblingUrl: 'https://example.bet/responsible', approvedDestinationHosts: ['example.bet'],
  legalReviewedAt: '2026-08-01T10:00:00.000Z', legalReviewExpiresAt: '2027-08-01T10:00:00.000Z', effectiveFrom: '2026-08-02T10:00:00.000Z',
  effectiveUntil: null, configVersion: 'legal-1', killSwitchEnabled: false, killSwitchReason: null,
  createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-01T10:00:00.000Z',
};

describe('PartnerMarketsPage', () => {
  beforeEach(() => {
    (getPartnerMarketConfigs as jest.Mock).mockReset();
    (savePartnerMarketConfig as jest.Mock).mockReset();
    (pausePartnerMarketConfig as jest.Mock).mockReset();
  });

  it('shows loading, then the list with legal facts and send warning', async () => {
    let resolveList: (value: typeof config[]) => void = () => undefined;
    (getPartnerMarketConfigs as jest.Mock).mockReturnValue(new Promise((resolve) => { resolveList = resolve; }));
    render(<PartnerMarketsPage />);
    expect(screen.getByText(/Loading partner market configurations/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add configuration' })).toBeDisabled();
    resolveList([config]);
    expect(await screen.findByText('Example Bet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add configuration' })).toBeEnabled();
    expect(screen.getByText(/Partner-only, Sponsored predictions/)).toBeInTheDocument();
    expect(screen.getByText('example.bet')).toBeInTheDocument();
    expect(screen.getByText(/Draft configurations do not permit email sends/)).toBeInTheDocument();
  });

  it('renders empty and error states', async () => {
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValueOnce([]);
    const { unmount } = render(<PartnerMarketsPage />);
    expect(await screen.findByText('No partner market configurations found')).toBeInTheDocument();
    unmount();
    (getPartnerMarketConfigs as jest.Mock).mockRejectedValueOnce(new Error('Access denied'));
    render(<PartnerMarketsPage />);
    expect(await screen.findByText('Access denied')).toBeInTheDocument();
  });

  it('retries an unchanged filter request', async () => {
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([]);
    render(<PartnerMarketsPage />);
    await screen.findByText('No partner market configurations found');
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    await waitFor(() => expect(getPartnerMarketConfigs).toHaveBeenCalledTimes(2));
  });

  it('creates a normalized draft and displays success', async () => {
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([]);
    (savePartnerMarketConfig as jest.Mock).mockResolvedValue(config);
    render(<PartnerMarketsPage />);
    await screen.findByText('No partner market configurations found');
    fireEvent.click(screen.getByRole('button', { name: 'Add configuration' }));
    const createDialog = screen.getByRole('dialog', { name: 'Add partner market' });
    fillRequiredForm(createDialog);
    fireEvent.click(within(createDialog).getByRole('button', { name: 'Save configuration' }));
    await waitFor(() => expect(savePartnerMarketConfig).toHaveBeenCalled());
    expect(savePartnerMarketConfig).toHaveBeenCalledWith(expect.objectContaining({ operatorKey: 'example-bet', countryCode: 'FR', status: 'draft', approvedDestinationHosts: ['example.bet'] }));
    expect(await screen.findByText('Example Bet configuration saved.')).toBeInTheDocument();
  });

  it('edits an existing row and uses the dedicated confirmed pause request', async () => {
    (getPartnerMarketConfigs as jest.Mock).mockResolvedValue([config]);
    (savePartnerMarketConfig as jest.Mock).mockResolvedValue({ ...config, configVersion: 'legal-2' });
    (pausePartnerMarketConfig as jest.Mock).mockResolvedValue({ ...config, status: 'paused' });
    render(<PartnerMarketsPage />);
    await screen.findByText('Example Bet');
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const editDialog = screen.getByRole('dialog', { name: 'Edit partner market' });
    fireEvent.mouseDown(within(editDialog).getByLabelText('Status'));
    expect(screen.queryByRole('option', { name: /^paused$/ })).not.toBeInTheDocument();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    fireEvent.change(within(editDialog).getByLabelText('Config version'), { target: { value: 'legal-2' } });
    fireEvent.click(within(editDialog).getByRole('button', { name: 'Save configuration' }));
    await waitFor(() => expect(savePartnerMarketConfig).toHaveBeenCalledWith(expect.objectContaining({ configVersion: 'legal-2' })));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit partner market' })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    const pauseDialog = screen.getByRole('dialog', { name: 'Pause Example Bet?' });
    fireEvent.click(within(pauseDialog).getByRole('button', { name: 'Confirm pause' }));
    expect(within(pauseDialog).getByText('A pause reason is required.')).toBeInTheDocument();
    fireEvent.change(within(pauseDialog).getByLabelText('Required reason'), { target: { value: ' Licence suspended ' } });
    fireEvent.click(within(pauseDialog).getByRole('button', { name: 'Confirm pause' }));
    await waitFor(() => expect(pausePartnerMarketConfig).toHaveBeenCalledWith('config-1', ' Licence suspended '));
  });
});

function fillRequiredForm(container: HTMLElement): void {
  const values: Record<string, string> = {
    'Operator key': ' Example-Bet ', 'Operator legal name': 'Example Bet Ltd', 'Operator display name': 'Example Bet',
    'Country code': 'fr', 'Licence reference': 'LIC-1', 'Evidence URL': 'https://regulator.example/evidence',
    'Required warning text': '18+. Play responsibly.', 'Responsible gambling URL': 'https://example.bet/responsible',
    'Approved destination hosts': 'EXAMPLE.BET', 'Legal reviewed at': '2026-08-01T10:00',
    'Legal review expires at': '2027-08-01T10:00', 'Effective from': '2026-08-02T10:00', 'Config version': 'legal-1',
  };
  for (const [label, value] of Object.entries(values)) fireEvent.change(within(container).getByLabelText(label), { target: { value } });
}
