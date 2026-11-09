import type { MarketingJurisdiction } from '@/modules/marketing-jurisdictions/types';
import type { PartnerMarketConfig } from '@/modules/partner-market-configs/types';
import { getStandardHttpsHostname } from '@/modules/partner-market-configs/validation';
import {
  placementLabels,
  platformLabels,
  type AppPartnerCampaign,
  type AppPartnerCampaignCopy,
  type AppPartnerCampaignInput,
  type AppPartnerPlacement,
  type AppPartnerPlatform,
} from './types';

export type CampaignForm = Omit<
  AppPartnerCampaignInput,
  'minimumSessions' | 'minimumAge' | 'priority' | 'finalDestinationHosts'
> & {
  minimumSessions: string;
  minimumAge: string;
  priority: string;
  finalDestinationHosts: string;
  utcOffset: string;
};

export const emptyCampaignCopy: AppPartnerCampaignCopy = {
  adLabel: '',
  cta: '',
  affiliateDisclosure: '',
  headline: '',
  imageAlt: '',
};

export const campaignCopyFields = [
  { field: 'adLabel', label: 'Advertising label', maxLength: 80 },
  { field: 'cta', label: 'Button text', maxLength: 100 },
  {
    field: 'affiliateDisclosure',
    label: 'Affiliate disclosure',
    maxLength: 300,
  },
  { field: 'headline', label: 'Headline (optional)', maxLength: 160 },
  { field: 'imageAlt', label: 'Banner image description', maxLength: 200 },
] as const;

export function campaignForm(campaign?: AppPartnerCampaign): CampaignForm {
  return {
    name: campaign?.name ?? '',
    partnerMarketConfigId: campaign?.partnerMarketConfigId ?? '',
    status: campaign?.status ?? 'draft',
    platforms: campaign?.platforms ?? [],
    placements: campaign?.placements ?? [],
    startsAt: campaign
      ? new Date(campaign.startsAt).toISOString().slice(0, -1)
      : '',
    endsAt: campaign
      ? new Date(campaign.endsAt).toISOString().slice(0, -1)
      : '',
    minimumSessions: String(campaign?.minimumSessions ?? 2),
    minimumAge: String(campaign?.minimumAge ?? 18),
    priority: String(campaign?.priority ?? 0),
    copyByLocale: campaign?.copyByLocale ?? {},
    bannerImages: campaign?.bannerImages ?? null,
    predictionUrl: campaign?.predictionUrl ?? null,
    predictionOverrides: campaign?.predictionOverrides ?? {},
    finalDestinationHosts: campaign?.finalDestinationHosts.join('\n') ?? '',
    utcOffset: '+00:00',
  };
}

export function jurisdictionFor(
  market: PartnerMarketConfig | undefined,
  jurisdictions: MarketingJurisdiction[]
): MarketingJurisdiction | undefined {
  return jurisdictions.find(
    (rule) =>
      rule.countryCode === market?.countryCode &&
      rule.regionCode === market?.regionCode
  );
}

export function campaignMarketIsAvailable(
  market: PartnerMarketConfig | undefined,
  rule: MarketingJurisdiction | undefined,
  platform: AppPartnerPlatform,
  at: number
): boolean {
  const policy = rule?.inAppPartnerPolicy;
  return Boolean(
    market?.status === 'approved' &&
      market.inAppEnabled &&
      market.inAppConfigVersion &&
      !market.killSwitchEnabled &&
      (market.countryCode === 'SE'
        ? market.regionCode === null
        : market.countryCode === 'US' &&
          /^[A-Z]{2}$/.test(market.regionCode ?? '')) &&
      rule?.status === 'approved' &&
      rule.inAppRulesVersion &&
      policy?.platforms[platform] &&
      Date.parse(policy.expiresAt) > at &&
      approvalCurrent(market, at) &&
      approvalCurrent(rule, at)
  );
}

function approvalCurrent(
  row: Pick<
    PartnerMarketConfig,
    'legalReviewedAt' | 'legalReviewExpiresAt' | 'effectiveFrom'
  > & { effectiveUntil?: string | null },
  at: number
): boolean {
  return (
    Date.parse(row.legalReviewedAt) <= at &&
    Date.parse(row.legalReviewExpiresAt) > at &&
    Date.parse(row.effectiveFrom) <= at &&
    (!row.effectiveUntil || Date.parse(row.effectiveUntil) > at)
  );
}

export function placementUrl(
  campaign: AppPartnerCampaignInput,
  market: PartnerMarketConfig | undefined,
  placement: AppPartnerPlacement
): string | null | undefined {
  return placement === 'matches_banner'
    ? market?.inAppBannerAffiliateUrl
    : (campaign.predictionOverrides[placement] ?? campaign.predictionUrl);
}

export function campaignInput(
  form: CampaignForm,
  market: PartnerMarketConfig | undefined,
  rule: MarketingJurisdiction | undefined,
  now = Date.now()
): AppPartnerCampaignInput {
  const name = form.name.trim();
  if (!name || name.length > 160)
    throw new Error('Enter a campaign name of up to 160 characters.');
  if (!market) throw new Error('Select an operator-market configuration.');
  const startsAt = scheduleIso(form.startsAt, form.utcOffset);
  const endsAt = scheduleIso(form.endsAt, form.utcOffset);
  if (endsAt <= startsAt) throw new Error('End time must be after start time.');

  const minimumSessions = integer(
    form.minimumSessions,
    2,
    2_147_483_647,
    'Minimum sessions'
  );
  const minimumAge = integer(form.minimumAge, 18, 125, 'Campaign age floor');
  const priority = integer(
    form.priority,
    -2_147_483_648,
    2_147_483_647,
    'Priority'
  );
  const copyByLocale = Object.fromEntries(
    Object.entries(form.copyByLocale).flatMap(([locale, copy]) => {
      const trimmed: AppPartnerCampaignCopy = {
        adLabel: copy.adLabel.trim(),
        cta: copy.cta.trim(),
        affiliateDisclosure: copy.affiliateDisclosure.trim(),
      };
      for (const { field, label, maxLength } of campaignCopyFields) {
        const value = copy[field]?.trim() ?? '';
        if (value.length > maxLength) {
          throw new Error(
            `${label} (${locale.toUpperCase()}) must be at most ${maxLength} characters.`
          );
        }
        if (value) trimmed[field] = value;
      }
      if (!Object.values(trimmed).some(Boolean)) return [];
      if (!trimmed.adLabel || !trimmed.cta || !trimmed.affiliateDisclosure) {
        throw new Error(
          `Complete the advertising label, button text and affiliate disclosure for ${locale.toUpperCase()}.`
        );
      }
      return [[locale, trimmed]];
    })
  );
  const finalDestinationHosts = [
    ...new Set(
      form.finalDestinationHosts
        .split(/[\n,]/)
        .map((value) => value.trim().toLowerCase().replace(/\.$/, ''))
        .filter(Boolean)
    ),
  ];
  if (
    finalDestinationHosts.some(
      (host) => !market.approvedDestinationHosts.includes(host)
    )
  ) {
    throw new Error(
      'Each final operator hostname must be approved on the partner market.'
    );
  }
  const predictionUrl = form.predictionUrl?.trim() || null;
  const predictionOverrides = { ...form.predictionOverrides };
  for (const placement of ['compact_prediction', 'full_prediction'] as const) {
    const value = predictionOverrides[placement]?.trim();
    if (value) predictionOverrides[placement] = value;
    else delete predictionOverrides[placement];
  }
  for (const url of [predictionUrl, ...Object.values(predictionOverrides)]) {
    if (url && !isApprovedDestination(url, market)) {
      throw new Error(
        'Prediction links must use HTTPS and an approved hostname.'
      );
    }
  }

  const input: AppPartnerCampaignInput = {
    name,
    partnerMarketConfigId: market.id,
    status: form.status,
    platforms: form.platforms,
    placements: form.placements,
    startsAt,
    endsAt,
    minimumSessions,
    minimumAge,
    priority,
    copyByLocale,
    bannerImages: form.bannerImages,
    predictionUrl,
    predictionOverrides,
    finalDestinationHosts,
  };
  if (input.status === 'active') {
    validateActivation(input, market, rule, now);
  }
  return input;
}

function validateActivation(
  input: AppPartnerCampaignInput,
  market: PartnerMarketConfig,
  rule: MarketingJurisdiction | undefined,
  now: number
): void {
  if (Date.parse(input.endsAt) <= now)
    throw new Error('An expired campaign cannot be activated.');
  if (!input.platforms.length || !input.placements.length) {
    throw new Error(
      'Select at least one platform and one placement before activation.'
    );
  }
  if (!input.finalDestinationHosts.length) {
    throw new Error(
      'Enter at least one approved final operator hostname before activation.'
    );
  }
  for (const platform of input.platforms) {
    if (
      !campaignMarketIsAvailable(market, rule, platform, now) ||
      !campaignMarketIsAvailable(
        market,
        rule,
        platform,
        Math.max(now, Date.parse(input.startsAt))
      )
    ) {
      throw new Error(
        `Current In-app approval is required for ${platformLabels[platform]} through the campaign start.`
      );
    }
    if (
      rule?.inAppPartnerPolicy?.platforms[platform]?.assurance !==
      'self_declaration'
    ) {
      throw new Error(
        `${platformLabels[platform]} requires an age assurance method that is unavailable for this launch.`
      );
    }
  }
  const englishDisclosure = rule?.inAppPartnerPolicy?.disclosureByLocale.en;
  if (
    !englishDisclosure?.warning.trim() ||
    !getStandardHttpsHostname(englishDisclosure.supportUrl) ||
    !getStandardHttpsHostname(englishDisclosure.termsUrl)
  ) {
    throw new Error(
      'The approved jurisdiction policy must provide a warning, support URL and terms URL.'
    );
  }
  const englishCopy = input.copyByLocale.en;
  if (
    !englishCopy?.adLabel ||
    !englishCopy.cta ||
    !englishCopy.affiliateDisclosure
  ) {
    throw new Error(
      'English copy requires an advertising label, button text and affiliate disclosure.'
    );
  }
  const hasBanner = input.placements.includes('matches_banner');
  if (hasBanner && (!input.bannerImages?.default || !englishCopy.imageAlt)) {
    throw new Error(
      'Upload the default banner image and add its English description before activation.'
    );
  }
  for (const [locale, copy] of Object.entries(input.copyByLocale)) {
    if (hasBanner && !copy.imageAlt) {
      throw new Error(
        `Add a banner image description for ${locale.toUpperCase()} or clear that locale to use English.`
      );
    }
  }
  for (const placement of input.placements) {
    if (
      !isApprovedDestination(placementUrl(input, market, placement), market)
    ) {
      throw new Error(
        `${placementLabels[placement]} needs an HTTPS link on an approved hostname.`
      );
    }
  }
}

export function isApprovedDestination(
  url: string | null | undefined,
  market: PartnerMarketConfig
): boolean {
  if (!url || url.length > 2048) return false;
  const hostname = getStandardHttpsHostname(url);
  return Boolean(
    hostname && market.approvedDestinationHosts.includes(hostname)
  );
}

function scheduleIso(local: string, offset: string): string {
  if (!/^[+-](?:0\d|1[0-4]):[0-5]\d$/.test(offset.trim())) {
    throw new Error('Enter an explicit UTC offset such as +00:00 or +01:00.');
  }
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/.test(local) ||
    !Number.isFinite(Date.parse(`${local}${offset.trim()}`))
  ) {
    throw new Error('Enter valid start and end dates with times.');
  }
  return new Date(`${local}${offset.trim()}`).toISOString();
}

function integer(
  value: string,
  min: number,
  max: number,
  label: string
): number {
  const number = Number(value);
  if (
    !value.trim() ||
    !Number.isInteger(number) ||
    number < min ||
    number > max
  ) {
    throw new Error(`${label} must be a whole number from ${min} to ${max}.`);
  }
  return number;
}
