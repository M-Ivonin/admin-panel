import {
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
  placements: ['matches_banner', 'compact_prediction'],
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
  predictionUrl: 'https://operator.example/prediction',
  predictionOverrides: {},
  finalDestinationHosts: ['operator.example'],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getAppPartnerCampaigns).mockResolvedValue([]);
  jest.mocked(getPartnerMarketConfigs).mockResolvedValue([market]);
  jest.mocked(getMarketingJurisdictions).mockResolvedValue([rule]);
});

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

it('saves a disabled draft with explicit timezone and rejects a one-session minimum', async () => {
  jest.mocked(saveAppPartnerCampaign).mockResolvedValue(campaign);
  render(<AppPartnerCampaignsPage />);
  await screen.findByText('No app partner campaigns found');
  fireEvent.click(screen.getByRole('button', { name: 'Create campaign' }));
  const dialog = screen.getByRole('dialog', {
    name: 'Create app partner campaign',
  });
  change(dialog, 'Campaign name', 'Sweden fixture');
  choose(
    dialog,
    'Operator-market configuration',
    'Example Bet · SE · In-app on'
  );
  change(dialog, 'Starts at', '2026-11-09T13:30');
  change(dialog, 'Ends at', '2026-11-10T13:30');
  change(dialog, 'UTC offset', '+01:30');
  change(dialog, 'Minimum sessions', '1');
  click(dialog, 'button', 'Save campaign');
  expect(
    within(dialog).getByText(/minimum sessions must be/i)
  ).toBeInTheDocument();
  expect(saveAppPartnerCampaign).not.toHaveBeenCalled();

  change(dialog, 'Minimum sessions', '2');
  click(dialog, 'button', 'Save campaign');
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
  const dialog = screen.getByRole('dialog', {
    name: 'Edit app partner campaign',
  });
  click(dialog, 'tab', 'Fixture preview');
  expect(
    within(dialog).getByText(/Winning campaign · Earlier ID wins/)
  ).toBeInTheDocument();
  expect(
    within(dialog).getByText('Are you 21 years old or older?')
  ).toBeInTheDocument();
  expect(within(dialog).queryByRole('img')).not.toBeInTheDocument();
  change(dialog, 'Foreground visits', '1');
  expect(within(dialog).getByText(/second genuine visit/)).toBeInTheDocument();
  change(dialog, 'Foreground visits', '2');
  choose(dialog, 'Age fixture', 'Self-declared threshold');
  change(dialog, 'Evidence threshold', '21');
  choose(dialog, 'Preview locale', 'ES');
  choose(dialog, 'Preview device', 'Tablet');
  expect(
    within(dialog).getByRole('img', { name: 'Example fixture artwork' })
  ).toHaveAttribute('src', campaign.bannerImages?.default);
  expect(within(dialog).getByText(/Approved app warning/)).toBeInTheDocument();
  expect(
    within(dialog).getByRole('button', { name: 'Visit Example Bet' })
  ).toBeDisabled();
  choose(dialog, 'Preview placement', 'Compact prediction footer');
  expect(within(dialog).queryByRole('img')).not.toBeInTheDocument();
  expect(
    within(dialog).getByRole('button', { name: 'Visit Example Bet' })
  ).toBeDisabled();
  choose(dialog, 'Access fixture', 'Subscription or explicit ad-free');
  expect(
    within(dialog).getByText(/fixture has ad-free access/)
  ).toBeInTheDocument();
  expect(
    within(dialog).queryByRole('button', { name: 'Visit Example Bet' })
  ).not.toBeInTheDocument();
  expect(saveAppPartnerCampaign).not.toHaveBeenCalled();
  expect(uploadAppPartnerCampaignImage).not.toHaveBeenCalled();
}, 15_000);

it('validates the banner before activation, saves a verified upload and pauses the versioned campaign', async () => {
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
  jest.mocked(uploadAppPartnerCampaignImage).mockResolvedValue(bannerUrl);
  jest
    .mocked(pauseAppPartnerCampaign)
    .mockResolvedValue({ ...active, status: 'paused' });
  render(<AppPartnerCampaignsPage />);
  await screen.findByText(campaign.name);
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  const dialog = screen.getByRole('dialog', {
    name: 'Edit app partner campaign',
  });
  choose(dialog, 'Status', 'Active');
  click(dialog, 'button', 'Activate campaign');
  expect(
    within(dialog).getByText(/upload the default banner image/i)
  ).toBeInTheDocument();
  expect(saveAppPartnerCampaign).not.toHaveBeenCalled();
  click(dialog, 'tab', 'Localized creative');
  const file = new File(['fixture-image'], 'creative.png', {
    type: 'image/png',
  });
  fireEvent.change(within(dialog).getByLabelText('Default banner image'), {
    target: { files: [file] },
  });
  await within(dialog).findByRole('button', { name: 'Remove default banner' });
  click(dialog, 'button', 'Activate campaign');
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
      openFailures: 1,
      agePrompts: 3,
      ageYes: 1,
      ageNo: 1,
      ageDismissed: 1,
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
        openResult: 'failed',
        impressionId: 'fixture-impression',
        fixtureId: null,
        predictionVersionId: null,
        screen: 'matches',
      },
    ],
  });
  render(<AppPartnerCampaignsPage />);
  fireEvent.click(screen.getByRole('tab', { name: 'Analytics' }));
  expect(
    await screen.findByText(
      /40\.00% \(4 linked taps \/ 10 qualified impressions\)/
    )
  ).toBeInTheDocument();
  expect(
    screen.getByText(/25\.00% \(2 linked clickers \/ 8 unique viewers\)/)
  ).toBeInTheDocument();
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
  fireEvent.change(screen.getByLabelText('Country code'), {
    target: { value: 'se' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Apply analytics filters' })
  );
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
});
