export type PartnerMarketConfigStatus =
  | 'draft'
  | 'approved'
  | 'paused'
  | 'expired'
  | 'blocked';

export interface PartnerMarketConfigInput {
  operatorKey: string;
  operatorLegalName: string;
  operatorDisplayName: string;
  operatorLogoUrl: string;
  affiliateDisclosureByLocale?: { en: string; es: string; pt: string };
  countryCode: string;
  regionCode?: string;
  status: PartnerMarketConfigStatus;
  licenceReference: string;
  evidenceUrl: string;
  minimumAge: number;
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  partnerOnlyAllowed: boolean;
  sponsoredPredictionAllowed: boolean;
  bonusAdvertisingAllowed: boolean;
  matchSpecificPromotionAllowed: boolean;
  requiredWarningText: string;
  responsibleGamblingUrl: string;
  operatorTermsUrl?: string;
  operatorDestinationUrl?: string;
  inAppBannerAffiliateUrl?: string | null;
  approvedDestinationHosts: string[];
  affiliateConversionTypes: string[];
  legalReviewedAt: string;
  legalReviewExpiresAt: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  configVersion: string;
  killSwitchEnabled: boolean;
  killSwitchReason?: string;
  expectedUpdatedAt?: string;
}

export interface PartnerMarketConfig
  extends Omit<
    PartnerMarketConfigInput,
    | 'regionCode'
    | 'killSwitchReason'
    | 'operatorLogoUrl'
    | 'affiliateDisclosureByLocale'
    | 'operatorTermsUrl'
    | 'operatorDestinationUrl'
    | 'effectiveUntil'
    | 'expectedUpdatedAt'
  > {
  id: string;
  regionCode: string | null;
  killSwitchReason: string | null;
  operatorLogoUrl: string | null;
  affiliateDisclosureByLocale: { en: string; es: string; pt: string } | null;
  operatorTermsUrl: string | null;
  operatorDestinationUrl: string | null;
  inAppConfigVersion?: string | null;
  effectiveUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerMarketConfigFilters {
  operatorKey?: string;
  countryCode?: string;
}

export interface PartnerMarketConfigFormValues
  extends Omit<
    PartnerMarketConfigInput,
    | 'affiliateDisclosureByLocale'
    | 'operatorTermsUrl'
    | 'operatorDestinationUrl'
    | 'minimumAge'
    | 'approvedDestinationHosts'
    | 'affiliateConversionTypes'
    | 'emailEnabled'
    | 'inAppEnabled'
    | 'inAppBannerAffiliateUrl'
    | 'expectedUpdatedAt'
  > {
  affiliateDisclosureByLocale: NonNullable<
    PartnerMarketConfigInput['affiliateDisclosureByLocale']
  >;
  operatorTermsUrl: string;
  operatorDestinationUrl: string;
  minimumAge: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  inAppBannerAffiliateUrl: string;
  approvedDestinationHosts: string;
  affiliateConversionTypes: string;
}

export type PartnerMarketConfigFormErrors = Partial<
  Record<keyof PartnerMarketConfigFormValues, string>
>;
