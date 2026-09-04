import isURL from 'validator/lib/isURL';
import {
  MarketingJurisdictionFormErrors,
  MarketingJurisdictionFormValues,
  MarketingJurisdictionInput,
} from './types';
import { requiresMarketingRegion } from './region-requirement';

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

export const emptyMarketingJurisdictionForm: MarketingJurisdictionFormValues = {
  countryCode: '',
  regionCode: '',
  status: 'legal_review_required',
  minimumAge: '18',
  predictionsEmailAllowed: false,
  productEmailAllowed: false,
  partnerOfferEmailAllowed: false,
  combinedPredictionOfferAllowed: false,
  bonusAdvertisingAllowed: false,
  matchSpecificPromotionAllowed: false,
  requiredWarningText: '',
  warningLayoutRules: '{}',
  responsibleGamblingUrl: '',
  regulatorSourceUrl: '',
  legalReviewedAt: '',
  legalReviewExpiresAt: '',
  effectiveFrom: '',
  effectiveUntil: '',
  rulesVersion: '',
};

export function normalizeMarketingJurisdictionForm(
  values: MarketingJurisdictionFormValues
): MarketingJurisdictionInput {
  const effectiveUntil = values.effectiveUntil?.trim() ?? '';
  return {
    ...values,
    countryCode: values.countryCode.trim().toUpperCase(),
    regionCode: values.regionCode?.trim().toUpperCase() || undefined,
    minimumAge: Number(values.minimumAge),
    requiredWarningText: values.requiredWarningText.trim(),
    warningLayoutRules: parseJsonObject(values.warningLayoutRules),
    responsibleGamblingUrl: values.responsibleGamblingUrl.trim(),
    regulatorSourceUrl: values.regulatorSourceUrl.trim(),
    legalReviewedAt: toIso(values.legalReviewedAt),
    legalReviewExpiresAt: toIso(values.legalReviewExpiresAt),
    effectiveFrom: toIso(values.effectiveFrom),
    effectiveUntil: effectiveUntil ? toIso(effectiveUntil) : undefined,
    rulesVersion: values.rulesVersion.trim(),
  };
}

export function validateMarketingJurisdictionForm(
  values: MarketingJurisdictionFormValues
): MarketingJurisdictionFormErrors {
  const errors: MarketingJurisdictionFormErrors = {};
  const input = normalizeMarketingJurisdictionForm(values);
  if (!COUNTRY_CODE_PATTERN.test(input.countryCode)) errors.countryCode = 'Enter a two-letter country code.';
  if (requiresMarketingRegion(input.countryCode) && !input.regionCode) {
    errors.regionCode = 'Region is required for this country.';
  }
  if (input.regionCode && input.regionCode.length > 8) errors.regionCode = 'Use 1–8 characters.';
  if (!Number.isInteger(input.minimumAge) || input.minimumAge < 1 || input.minimumAge > 125) {
    errors.minimumAge = 'Enter a whole number from 1 to 125.';
  }
  if (!input.requiredWarningText) errors.requiredWarningText = 'Required.';
  if (!input.rulesVersion || input.rulesVersion.length > 80) errors.rulesVersion = 'Required, up to 80 characters.';
  if (!isBackendUrl(input.responsibleGamblingUrl)) errors.responsibleGamblingUrl = 'Enter a valid URL.';
  if (!isBackendUrl(input.regulatorSourceUrl)) errors.regulatorSourceUrl = 'Enter a valid URL.';
  try {
    const parsed = JSON.parse(values.warningLayoutRules);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error();
  } catch {
    errors.warningLayoutRules = 'Enter a valid JSON object.';
  }
  validateDate(errors, 'legalReviewedAt', input.legalReviewedAt);
  validateDate(errors, 'legalReviewExpiresAt', input.legalReviewExpiresAt);
  validateDate(errors, 'effectiveFrom', input.effectiveFrom);
  if (input.effectiveUntil) validateDate(errors, 'effectiveUntil', input.effectiveUntil);
  if (!errors.legalReviewedAt && !errors.legalReviewExpiresAt && input.legalReviewExpiresAt <= input.legalReviewedAt) {
    errors.legalReviewExpiresAt = 'Expiry must be after the legal review date.';
  }
  if (!errors.effectiveFrom && !errors.effectiveUntil && input.effectiveUntil && input.effectiveUntil <= input.effectiveFrom) {
    errors.effectiveUntil = 'End date must be after the effective start.';
  }
  return errors;
}

function parseJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && !Array.isArray(parsed) && typeof parsed === 'object'
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function validateDate(
  errors: MarketingJurisdictionFormErrors,
  field: keyof MarketingJurisdictionFormValues,
  value: string
): void {
  if (!value || Number.isNaN(Date.parse(value))) errors[field] = 'Enter a valid date and time.';
}

function isBackendUrl(value: string): boolean {
  return isURL(value, { require_tld: false });
}

function toIso(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
