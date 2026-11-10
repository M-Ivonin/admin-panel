import type { MarketingJurisdiction } from '@/modules/marketing-jurisdictions/types';
import type { PartnerMarketConfig } from '@/modules/partner-market-configs/types';
import {
  campaignMarketIsAvailable,
  isApprovedDestination,
  jurisdictionFor,
} from './form';
import type {
  AppPartnerCampaign,
  AppPartnerCampaignCopy,
  AppPartnerLocale,
  AppPartnerPlacement,
  AppPartnerPlatform,
} from './types';

export type PreviewAccess =
  | 'free'
  | 'short_pass'
  | 'legacy_short_pass'
  | 'subscription'
  | 'unresolved';
export type PreviewAge =
  | 'unknown'
  | 'refused'
  | 'self_declaration'
  | 'verified';

export interface PreviewFixture {
  platform: AppPartnerPlatform;
  placement: AppPartnerPlacement;
  locale: AppPartnerLocale;
  device: 'phone' | 'tablet';
  sessions: number;
  approvedMarket: boolean;
  access: PreviewAccess;
  age: PreviewAge;
  evidenceAge: number;
  at: number;
}

type Candidate = {
  campaign: AppPartnerCampaign;
  market: PartnerMarketConfig;
  minimumAge: number;
  assurance: 'self_declaration' | 'verified';
  copy: AppPartnerCampaignCopy;
  imageUrl?: string;
  warning: string;
  supportUrl: string;
  termsUrl: string;
};

export type CampaignPreview =
  | { status: 'hidden'; reason: string }
  | { status: 'prompt' | 'eligible'; winner: Candidate };

export function resolveFixturePreview(
  candidates: AppPartnerCampaign[],
  marketContext: PartnerMarketConfig,
  markets: PartnerMarketConfig[],
  rules: MarketingJurisdiction[],
  fixture: PreviewFixture
): CampaignPreview {
  if (!fixture.approvedMarket) {
    return {
      status: 'hidden',
      reason: 'Market evidence is missing or unapproved.',
    };
  }
  if (fixture.access !== 'free' && fixture.access !== 'short_pass') {
    return {
      status: 'hidden',
      reason: 'The fixture has ad-free access or unresolved purchases.',
    };
  }
  if (fixture.sessions < 2) {
    return {
      status: 'hidden',
      reason: 'Partner placements start with a second genuine visit.',
    };
  }
  const sorted = [...candidates].sort(
    (a, b) => b.priority - a.priority || a.id.localeCompare(b.id)
  );
  for (const campaign of sorted) {
    const market = markets.find(
      (record) => record.id === campaign.partnerMarketConfigId
    );
    if (
      !market ||
      market.countryCode !== marketContext.countryCode ||
      market.regionCode !== marketContext.regionCode
    )
      continue;
    const rule = jurisdictionFor(market, rules);
    if (
      !rule ||
      !campaignMarketIsAvailable(market, rule, fixture.platform, fixture.at)
    )
      continue;
    const winner = matchCandidate(campaign, market, rule, fixture);
    if (!winner) continue;
    if (fixture.age === 'refused' && fixture.evidenceAge <= winner.minimumAge) {
      return {
        status: 'hidden',
        reason: 'The fixture declined the applicable age threshold.',
      };
    }
    if (
      (fixture.age === 'verified' ||
        (fixture.age === 'self_declaration' &&
          winner.assurance === 'self_declaration')) &&
      fixture.evidenceAge >= winner.minimumAge
    ) {
      return { status: 'eligible', winner };
    }
    return winner.assurance === 'self_declaration'
      ? { status: 'prompt', winner }
      : {
          status: 'hidden',
          reason: 'The approved policy requires stronger age assurance.',
        };
  }
  return {
    status: 'hidden',
    reason: 'No configured campaign is eligible for this fixture.',
  };
}

function matchCandidate(
  campaign: AppPartnerCampaign,
  market: PartnerMarketConfig,
  rule: MarketingJurisdiction,
  fixture: PreviewFixture
): Candidate | undefined {
  if (
    campaign.status !== 'active' ||
    !campaign.platforms.includes(fixture.platform) ||
    !campaign.placements.includes(fixture.placement) ||
    campaign.minimumSessions < 2 ||
    fixture.sessions < campaign.minimumSessions ||
    Date.parse(campaign.startsAt) > fixture.at ||
    Date.parse(campaign.endsAt) <= fixture.at ||
    !campaign.finalDestinationHosts.length ||
    !campaign.finalDestinationHosts.every((host) =>
      market.approvedDestinationHosts.includes(host)
    ) ||
    !isApprovedDestination(market.inAppBannerAffiliateUrl, market)
  )
    return;
  const policy = rule.inAppPartnerPolicy;
  const assurance = policy?.platforms[fixture.platform];
  const disclosure =
    policy?.disclosureByLocale[fixture.locale] ?? policy?.disclosureByLocale.en;
  const copy =
    campaign.copyByLocale[fixture.locale] ?? campaign.copyByLocale.en;
  const imageUrl =
    fixture.placement === 'matches_banner'
      ? campaign.bannerImages?.default
      : undefined;
  if (
    !assurance ||
    assurance.assurance !== 'self_declaration' ||
    !disclosure ||
    !copy?.adLabel ||
    !copy.cta ||
    !copy.affiliateDisclosure ||
    (imageUrl && !copy.imageAlt)
  )
    return;
  return {
    campaign,
    market,
    copy,
    imageUrl,
    assurance: assurance.assurance,
    minimumAge: Math.max(
      18,
      campaign.minimumAge,
      market.minimumAge,
      rule.minimumAge,
      assurance.minimumAge
    ),
    ...disclosure,
  };
}
