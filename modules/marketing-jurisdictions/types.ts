export type MarketingJurisdictionStatus =
  | 'blocked'
  | 'legal_review_required'
  | 'approved'
  | 'paused';

export interface MarketingJurisdictionInput {
  countryCode: string;
  regionCode?: string;
  status: MarketingJurisdictionStatus;
  minimumAge: number;
  predictionsEmailAllowed: boolean;
  productEmailAllowed: boolean;
  partnerOfferEmailAllowed: boolean;
  combinedPredictionOfferAllowed: boolean;
  bonusAdvertisingAllowed: boolean;
  matchSpecificPromotionAllowed: boolean;
  requiredWarningText: string;
  warningLayoutRules: Record<string, unknown>;
  responsibleGamblingUrl: string;
  regulatorSourceUrl: string;
  legalReviewedAt: string;
  legalReviewExpiresAt: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  rulesVersion: string;
}

export interface MarketingJurisdiction extends Omit<MarketingJurisdictionInput, 'regionCode' | 'effectiveUntil'> {
  id: string;
  regionCode: string | null;
  effectiveUntil: string | null;
  statusReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingJurisdictionFilters {
  countryCode?: string;
}

export interface MarketingJurisdictionFormValues
  extends Omit<MarketingJurisdictionInput, 'minimumAge' | 'warningLayoutRules'> {
  minimumAge: string;
  warningLayoutRules: string;
}

export type MarketingJurisdictionFormErrors = Partial<
  Record<keyof MarketingJurisdictionFormValues, string>
>;
