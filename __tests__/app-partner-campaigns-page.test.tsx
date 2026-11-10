import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import AppPartnerCampaignsPage from '@/app/(admin)/dashboard/app-partner-campaigns/page';
import {
  getAppPartnerAnalytics,
  getAppPartnerCampaigns,
  pauseAppPartnerCampaign,
  saveAppPartnerCampaign,
  uploadAppPartnerCampaignImage,
} from '@/lib/api/app-partner-campaigns';
import { getPartnerMarketConfigs } from '@/lib/api/partner-market-configs';
import { getMarketingJurisdictions } from '@/lib/api/marketing-jurisdictions';
import type { AppPartnerCampaign } from '@/modules/app-partner-campaigns/types';
import type { MarketingJurisdiction } from '@/modules/marketing-jurisdictions/types';
import type { PartnerMarketConfig } from '@/modules/partner-market-configs/types';

jest.mock('@/lib/api/app-partner-campaigns', () => ({
  getAppPartnerAnalytics: jest.fn(),
  getAppPartnerCampaigns: jest.fn(),
  saveAppPartnerCampaign: jest.fn(),
  pauseAppPartnerCampaign: jest.fn(),
  uploadAppPartnerCampaignImage: jest.fn(),
}));
jest.mock('@/lib/api/partner-market-configs', () => ({
  getPartnerMarketConfigs: jest.fn(),
}));
jest.mock('@/lib/api/marketing-jurisdictions', () => ({
  getMarketingJurisdictions: jest.fn(),
}));

const dates = {
  legalReviewedAt: '2020-01-01T00:00:00Z',
  legalReviewExpiresAt: '2099-01-01T00:00:00Z',
  effectiveFrom: '2020-01-01T00:00:00Z',
  effectiveUntil: null,
  createdAt: '2020-01-01T00:00:00Z',
  updatedAt: '2020-01-01T00:00:00Z',
};
const market: PartnerMarketConfig = {
  ...dates,
  id: 'se-market',
  operatorKey: 'example',
  operatorDisplayName: 'Example Bet',
  operatorLegalName: 'Example Ltd',
  operatorLogoUrl: null,
  affiliateDisclosureByLocale: null,
  countryCode: 'SE',
  regionCode: null,
  status: 'approved',
  licenceReference: 'fixture',
  evidenceUrl: 'https://operator.example/approval',
  minimumAge: 18,
  emailEnabled: false,
  inAppEnabled: true,
  inAppConfigVersion: 'app-config-1',
  inAppBannerAffiliateUrl: 'https://tracking.example/matches',
  partnerOnlyAllowed: false,
  sponsoredPredictionAllowed: false,
  bonusAdvertisingAllowed: false,
  matchSpecificPromotionAllowed: false,
  requiredWarningText: 'Email policy',
  responsibleGamblingUrl: 'https://operator.example/support',
  operatorTermsUrl: 'https://operator.example/terms',
  operatorDestinationUrl: null,
  approvedDestinationHosts: ['tracking.example', 'operator.example'],
  affiliateConversionTypes: [],
  configVersion: 'config-1',
  killSwitchEnabled: false,
  killSwitchReason: null,
};
const rule: MarketingJurisdiction = {
  ...dates,
  id: 'se-rule',
  countryCode: 'SE',
  regionCode: null,
  status: 'approved',
  minimumAge: 19,
  predictionsEmailAllowed: false,
  productEmailAllowed: false,
  partnerOfferEmailAllowed: false,
  combinedPredictionOfferAllowed: false,
  bonusAdvertisingAllowed: false,
  matchSpecificPromotionAllowed: false,
  requiredWarningText: 'Email policy',
  warningLayoutRules: {},
  responsibleGamblingUrl: 'https://operator.example/support',
  regulatorSourceUrl: 'https://operator.example/approval',
  rulesVersion: 'rules-1',
  inAppRulesVersion: 'app-rules-1',
  inAppPartnerPolicy: {
    expiresAt: '2099-01-01T00:00:00Z',
    platforms: { ios: { minimumAge: 21, assurance: 'self_declaration' } },
    disclosureByLocale: {
      en: {
        warning: 'Approved app warning',
        supportUrl: 'https://operator.example/support',
        termsUrl: 'https://operator.example/terms',
      },
    },
  },
  statusReason: null,
};
const campaign: AppPartnerCampaign = {
  id: 'campaign-2',
  version: 'version-2',
  name: 'Sweden fixture',
  partnerMarketConfigId: market.id,
  status: 'draft',
  platforms: ['ios'],
  placements: ['matches_banner', 'compact_prediction', 'full_prediction'],
  startsAt: '2020-11-09T12:00:00.000Z',
  endsAt: '2098-12-01T00:00:00.000Z',
  minimumSessions: 2,
  minimumAge: 18,
  priority: 10,
  copyByLocale: {
    en: {
      adLabel: 'Advertising',
      cta: 'Visit Example Bet',
      affiliateDisclosure: 'Affiliate disclosure fixture',
      imageAlt: 'Example fixture artwork',
    },
  },
  bannerImages: { default: 'https://cdn.example/banner.png' },
  finalDestinationHosts: ['operator.example'],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  jest.mocked(getAppPartnerCampaigns).mockResolvedValue([]);
  jest.mocked(getPartnerMarketConfigs).mockResolvedValue([market]);
  jest.mocked(getMarketingJurisdictions).mockResolvedValue([rule]);
});

afterEach(() => {
  jest.restoreAllMocks();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function change(dialog: HTMLElement, label: string, value: string) {
  fireEvent.change(within(dialog).getByLabelText(new RegExp(`^${label}`)), {
    target: { value },
  });
}

function choose(dialog: HTMLElement, label: string, option: string) {
  fireEvent.mouseDown(
    within(dialog).getByRole('combobox', { name: new RegExp(`^${label}`) })
  );
  fireEvent.click(screen.getByRole('option', { name: option }));
}

function click(dialog: HTMLElement, role: 'tab' | 'button', name: string) {
  fireEvent.click(within(dialog).getByRole(role, { name }));
}

it('keeps the retried campaign and status when the original response arrives last', async () => {
  const initialCampaigns = deferred<AppPartnerCampaign[]>();
  const retryCampaigns = deferred<AppPartnerCampaign[]>();
  const initialMarkets = deferred<PartnerMarketConfig[]>();
  const retryMarkets = deferred<PartnerMarketConfig[]>();
  const latestCampaign: AppPartnerCampaign = { ...campaign, status: 'active' };
  jest
    .mocked(getAppPartnerCampaigns)
    .mockReturnValueOnce(initialCampaigns.promise)
    .mockReturnValueOnce(retryCampaigns.promise);
  jest
    .mocked(getPartnerMarketConfigs)
    .mockReturnValueOnce(initialMarkets.promise)
    .mockReturnValueOnce(retryMarkets.promise);

  render(<AppPartnerCampaignsPage />);
  await act(async () => {
    initialMarkets.reject(new Error('Initial market policy request failed'));
  });
  expect(screen.getByRole('status')).toHaveTextContent(
    'Loading app partner campaigns'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

  await act(async () => {
    retryCampaigns.resolve([latestCampaign]);
  });
  expect(screen.getByText(latestCampaign.name)).toBeInTheDocument();
  expect(screen.getByText('active')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();

  await act(async () => {
    retryMarkets.resolve([market]);
  });
  expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled();

  const obsoleteName = 'Previous campaign name';
  await act(async () => {
    initialCampaigns.resolve([
      { ...campaign, name: obsoleteName, version: 'version-1' },
    ]);
  });
  expect(screen.getByText(latestCampaign.name)).toBeInTheDocument();
  expect(screen.getByText('active')).toBeInTheDocument();
  expect(screen.queryByText(obsoleteName)).not.toBeInTheDocument();
});

it('keeps the retry loading and hides a superseded campaign error', async () => {
  const initialCampaigns = deferred<AppPartnerCampaign[]>();
  const retryCampaigns = deferred<AppPartnerCampaign[]>();
  jest
    .mocked(getAppPartnerCampaigns)
    .mockReturnValueOnce(initialCampaigns.promise)
    .mockReturnValueOnce(retryCampaigns.promise);
  jest
    .mocked(getPartnerMarketConfigs)
    .mockRejectedValueOnce(new Error('Initial market policy request failed'));

  render(<AppPartnerCampaignsPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));

  const obsoleteError = 'Previous campaign request failed';
  await act(async () => {
    initialCampaigns.reject(new Error(obsoleteError));
  });
  expect(screen.queryByText(obsoleteError)).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(
    'Loading app partner campaigns'
  );

  await act(async () => {
    retryCampaigns.resolve([campaign]);
  });
  expect(screen.getByText(campaign.name)).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('saves a disabled draft with explicit timezone and rejects a one-session minimum', async () => {
  jest.mocked(saveAppPartnerCampaign).mockResolvedValue(campaign);
  render(<AppPartnerCampaignsPage />);
  await screen.findByText('No app partner campaigns found');
  fireEvent.click(screen.getByRole('button', { name: 'Create campaign' }));
  const editor = screen.getByRole('region', {
    name: 'Create app partner campaign',
  });
  change(editor, 'Campaign name', 'Sweden fixture');
  choose(
    editor,
    'Operator-market configuration',
    'Example Bet · SE · In-app on'
  );
  change(editor, 'Starts at', '2026-11-09T13:30');
  change(editor, 'Ends at', '2026-11-10T13:30');
  change(editor, 'UTC offset', '+01:30');
  change(editor, 'Minimum sessions', '1');
  click(editor, 'button', 'Save draft');
  expect(
    within(editor).getByText(/minimum sessions must be/i)
  ).toBeInTheDocument();
  expect(saveAppPartnerCampaign).not.toHaveBeenCalled();

  change(editor, 'Minimum sessions', '2');
  click(editor, 'button', 'Save draft');
  await screen.findByText('Sweden fixture saved.');
  expect(saveAppPartnerCampaign).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'draft',
      placements: [],
      platforms: [],
      startsAt: '2026-11-09T12:00:00.000Z',
      minimumSessions: 2,
    }),
    undefined
  );
});

it('previews the winner, age prompt, localized fallback and ad-free suppression without writes', async () => {
  const competitor = {
    ...campaign,
    id: 'campaign-1',
    name: 'Earlier ID wins',
    status: 'active' as const,
  };
  jest.mocked(getAppPartnerCampaigns).mockResolvedValue([campaign, competitor]);
  render(<AppPartnerCampaignsPage />);
  await screen.findByText(campaign.name);
  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
  const editor = screen.getByRole('region', {
    name: 'Edit app partner campaign',
  });
  click(editor, 'button', 'Fixture preview');
  expect(
    within(editor).getByText(/Winning campaign · Earlier ID wins/)
  ).toBeInTheDocument();
  expect(
    within(editor).getByText('Are you 21 years old or older?')
  ).toBeInTheDocument();
  expect(within(editor).queryByRole('img')).not.toBeInTheDocument();
  change(editor, 'Foreground visits', '1');
  expect(within(editor).getByText(/second genuine visit/)).toBeInTheDocument();
  change(editor, 'Foreground visits', '2');
  choose(editor, 'Age fixture', 'Self-declared threshold');
  change(editor, 'Evidence threshold', '21');
  choose(editor, 'Preview locale', 'ES');
  choose(editor, 'Preview device', 'Tablet');
  expect(
    within(editor).getByRole('img', { name: 'Example fixture artwork' })
  ).toHaveAttribute('src', campaign.bannerImages?.default);
  expect(within(editor).getByText(/Approved app warning/)).toBeInTheDocument();
  expect(
    within(editor).getByRole('button', { name: 'Visit Example Bet' })
  ).toBeDisabled();
  choose(editor, 'Preview placement', 'Match · Predictions banner');
  expect(within(editor).queryByRole('img')).not.toBeInTheDocument();
  expect(
    within(editor).getByRole('button', { name: 'Visit Example Bet' })
  ).toBeDisabled();
  choose(editor, 'Preview placement', 'Full Analysis · Fixed banner');
  expect(
    within(editor).getByRole('button', { name: 'Visit Example Bet' })
  ).toBeDisabled();
  choose(editor, 'Access fixture', 'Subscription or explicit ad-free');
  expect(
    within(editor).getByText(/fixture has ad-free access/)
  ).toBeInTheDocument();
  expect(
    within(editor).queryByRole('button', { name: 'Visit Example Bet' })
  ).not.toBeInTheDocument();
  await act(async () => click(editor, 'button', 'Back to campaigns'));
  expect(screen.getAllByRole('button', { name: 'Edit' })[0]).toHaveFocus();
  expect(saveAppPartnerCampaign).not.toHaveBeenCalled();
  expect(uploadAppPartnerCampaignImage).not.toHaveBeenCalled();
}, 15_000);

it('saves a verified banner upload and pauses the versioned campaign', async () => {
  const bannerUrl = 'https://cdn.example/replaced.png';
  const active = {
    ...campaign,
    version: 'version-active',
    status: 'active' as const,
  };
  jest
    .mocked(getAppPartnerCampaigns)
    .mockResolvedValueOnce([{ ...campaign, bannerImages: null }])
    .mockResolvedValueOnce([active])
    .mockResolvedValue([{ ...active, status: 'paused' }]);
  jest.mocked(saveAppPartnerCampaign).mockResolvedValue(active);
  jest
    .mocked(uploadAppPartnerCampaignImage)
    .mockRejectedValueOnce(new Error('Could not upload banner'))
    .mockResolvedValue(bannerUrl);
  jest
    .mocked(pauseAppPartnerCampaign)
    .mockResolvedValue({ ...active, status: 'paused' });
  render(<AppPartnerCampaignsPage />);
  await screen.findByText(campaign.name);
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  const editor = screen.getByRole('region', {
    name: 'Edit app partner campaign',
  });
  choose(editor, 'Status', 'Active');
  click(editor, 'button', 'Continue');
  expect(
    within(editor).getByRole('button', { name: 'Localized creative' })
  ).toHaveAttribute('aria-pressed', 'true');
  const file = new File(['fixture-image'], 'creative.png', {
    type: 'image/png',
  });
  const uploadInput = within(editor).getByLabelText(
    'Custom banner background image'
  );
  fireEvent.change(uploadInput, { target: { files: [file] } });
  const uploadError = await within(editor).findByText('Could not upload banner');
  expect(uploadError.closest('[role="alert"]')).toHaveFocus();

  fireEvent.change(uploadInput, { target: { files: [file] } });
  await within(editor).findByRole('button', {
    name: 'Restore built-in stadium artwork',
  });
  click(editor, 'button', 'Activate campaign');
  await screen.findByText('Sweden fixture saved.');
  expect(saveAppPartnerCampaign).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'active',
      bannerImages: { default: bannerUrl },
      copyByLocale: campaign.copyByLocale,
    }),
    expect.objectContaining({ id: campaign.id, version: campaign.version })
  );
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Pause' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  const pause = screen.getByRole('dialog', { name: 'Pause Sweden fixture?' });
  click(pause, 'button', 'Confirm pause');
  await screen.findByText('Sweden fixture paused.');
  expect(pauseAppPartnerCampaign).toHaveBeenCalledWith(active);
});

it('reports linked CTR denominators and opens the existing user portrait', async () => {
  jest.mocked(getAppPartnerAnalytics).mockResolvedValue({
    summary: {
      impressions: 10,
      uniqueViewers: 8,
      clicks: 5,
      linkedClicks: 4,
      linkedClickers: 2,
      earlyClicks: 1,
      blockedClicks: 1,
    },
    clicks: [
      {
        tapId: 'fixture-tap',
        userId: 'user/one',
        occurredAt: '2026-11-09T12:00:00.000Z',
        campaignId: campaign.id,
        placement: 'matches_banner',
        platform: 'ios',
        countryCode: 'SE',
        regionCode: null,
        accessType: 'free',
        threshold: 21,
        sessionOrdinal: 2,
        displayedVersion: 'version-1',
        resolvedVersion: 'version-2',
        resolution: 'allowed',
        impressionId: 'fixture-impression',
        fixtureId: null,
        predictionVersionId: null,
        screen: 'matches',
      },
    ],
  });
  render(<AppPartnerCampaignsPage />);
  fireEvent.click(screen.getByRole('tab', { name: 'Analytics' }));
  expect(await screen.findByText('40.00%')).toBeVisible();
  expect(screen.getByText('4 linked taps / 10 impressions')).toBeVisible();
  expect(screen.getByText('25.00%')).toBeVisible();
  expect(screen.getByText('2 linked clickers / 8 viewers')).toBeVisible();
  expect(screen.getByRole('link', { name: 'user/one' })).toHaveAttribute(
    'href',
    '/dashboard/users/user%2Fone/portrait'
  );
  const dayMs = 86_400_000;
  const today = Date.now();
  const fromDay = new Date(today - 3 * dayMs).toISOString().slice(0, 10);
  const throughDay = new Date(today - 2 * dayMs).toISOString().slice(0, 10);
  const nextDay = new Date(today - dayMs).toISOString().slice(0, 10);
  fireEvent.change(screen.getByLabelText('From date (UTC)'), {
    target: { value: fromDay },
  });
  fireEvent.change(screen.getByLabelText('Through date (UTC)'), {
    target: { value: throughDay },
  });
  fireEvent.click(screen.getByText('More filters'));
  fireEvent.change(screen.getByLabelText('Country code'), {
    target: { value: ' se ' },
  });
  expect(screen.getByText('Unapplied changes')).toBeVisible();
  expect(getAppPartnerAnalytics).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  await waitFor(() =>
    expect(getAppPartnerAnalytics).toHaveBeenLastCalledWith(
      expect.objectContaining({
        from: `${fromDay}T00:00:00.000Z`,
        to: `${nextDay}T00:00:00.000Z`,
        countryCode: 'SE',
      })
    )
  );
  await screen.findByText(/40\.00%/);
  expect(screen.queryByText('Unapplied changes')).not.toBeInTheDocument();
  expect(screen.getByText('Country: SE')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Country code'), {
    target: { value: '   ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  await screen.findByText('40.00%');
  expect(screen.queryByText(/^Country:/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
  await screen.findByText(/40\.00%/);
  expect(screen.queryByText('Country: SE')).not.toBeInTheDocument();
  expect(getAppPartnerAnalytics).toHaveBeenLastCalledWith(
    expect.objectContaining({ countryCode: undefined, regionCode: undefined })
  );
});
