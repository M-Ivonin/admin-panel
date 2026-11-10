export const appPartnerPlatforms = ['ios', 'android'] as const;
export const appPartnerPlacements = [
  'matches_banner',
  'compact_prediction',
  'full_prediction',
] as const;
export const appPartnerLocales = ['en', 'es', 'pt'] as const;

export type AppPartnerPlatform = (typeof appPartnerPlatforms)[number];
export type AppPartnerPlacement = (typeof appPartnerPlacements)[number];
export type AppPartnerLocale = (typeof appPartnerLocales)[number];
export type AppPartnerCampaignStatus = 'draft' | 'active' | 'paused';

export const placementLabels: Record<AppPartnerPlacement, string> = {
  matches_banner: 'Matches banner',
  compact_prediction: 'Match · Predictions banner',
  full_prediction: 'Full Analysis · Fixed banner',
};
export const platformLabels: Record<AppPartnerPlatform, string> = {
  ios: 'iOS',
  android: 'Android',
};

export interface AppPartnerCampaignCopy {
  adLabel: string;
  cta: string;
  affiliateDisclosure: string;
  headline?: string;
  imageAlt?: string;
}

export interface AppPartnerCampaignImages {
  default: string;
  phone?: string;
  tablet?: string;
}

export interface AppPartnerCampaignInput {
  name: string;
  partnerMarketConfigId: string;
  status: AppPartnerCampaignStatus;
  platforms: AppPartnerPlatform[];
  placements: AppPartnerPlacement[];
  startsAt: string;
  endsAt: string;
  minimumSessions: number;
  minimumAge: number;
  priority: number;
  copyByLocale: Record<string, AppPartnerCampaignCopy>;
  bannerImages: AppPartnerCampaignImages | null;
  finalDestinationHosts: string[];
}

export interface AppPartnerCampaign extends AppPartnerCampaignInput {
  id: string;
  version: string;
}

export type AppPartnerAnalyticsFilters = Partial<{
  campaignId: string;
  operatorMarketId: string;
  from: string;
  to: string;
  placement: AppPartnerPlacement;
  platform: AppPartnerPlatform;
  countryCode: string;
  regionCode: string;
  accessType: string;
  minimumAge: string;
  sessionOrdinal: string;
  creativeVersion: string;
  userId: string;
}>;

export interface AppPartnerAnalytics {
  summary: {
    impressions: number;
    uniqueViewers: number;
    clicks: number;
    linkedClicks: number;
    linkedClickers: number;
    earlyClicks: number;
    blockedClicks: number;
  };
  clicks: {
    tapId: string;
    userId: string;
    occurredAt: string;
    campaignId: string;
    placement: AppPartnerPlacement;
    platform: AppPartnerPlatform;
    countryCode: string;
    regionCode: string | null;
    accessType: string;
    threshold: number;
    sessionOrdinal: number;
    displayedVersion: string;
    resolvedVersion: string | null;
    resolution: string;
    impressionId: string | null;
    fixtureId: string | null;
    predictionVersionId: string | null;
    screen: string | null;
  }[];
}
