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
  countryCode: string;
  regionCode?: string;
  status: PartnerMarketConfigStatus;
  licenceReference: string;
  evidenceUrl: string;
  minimumAge: number;
  partnerOnlyAllowed: boolean;
  sponsoredPredictionAllowed: boolean;
  bonusAdvertisingAllowed: boolean;
  matchSpecificPromotionAllowed: boolean;
  requiredWarningText: string;
  responsibleGamblingUrl: string;
  approvedDestinationHosts: string[];
  legalReviewedAt: string;
  legalReviewExpiresAt: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  configVersion: string;
  killSwitchEnabled: boolean;
  killSwitchReason?: string;
}

export interface PartnerMarketConfig
  extends Omit<PartnerMarketConfigInput, 'regionCode' | 'killSwitchReason'> {
  id: string;
  regionCode: string | null;
  killSwitchReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerMarketConfigFilters {
  operatorKey?: string;
  countryCode?: string;
}

export interface PartnerMarketConfigFormValues
  extends Omit<PartnerMarketConfigInput, 'minimumAge' | 'approvedDestinationHosts'> {
  minimumAge: string;
  approvedDestinationHosts: string;
}

export type PartnerMarketConfigFormErrors = Partial<
  Record<keyof PartnerMarketConfigFormValues, string>
>;
