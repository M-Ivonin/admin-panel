import {
  PartnerMarketConfigFormErrors,
  PartnerMarketConfigFormValues,
  PartnerMarketConfigInput,
} from './types';
import isFQDN from 'validator/lib/isFQDN';
import isURL from 'validator/lib/isURL';

const OPERATOR_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

export const emptyPartnerMarketConfigForm: PartnerMarketConfigFormValues = {
  operatorKey: '',
  operatorLegalName: '',
  operatorDisplayName: '',
  operatorLogoUrl: '',
  affiliateDisclosureByLocale: { en: '', es: '', pt: '' },
  countryCode: '',
  regionCode: '',
  status: 'draft',
  licenceReference: '',
  evidenceUrl: '',
  minimumAge: '18',
  partnerOnlyAllowed: false,
  sponsoredPredictionAllowed: false,
  bonusAdvertisingAllowed: false,
  matchSpecificPromotionAllowed: false,
  requiredWarningText: '',
  responsibleGamblingUrl: '',
  approvedDestinationHosts: '',
  legalReviewedAt: '',
  legalReviewExpiresAt: '',
  effectiveFrom: '',
  effectiveUntil: '',
  configVersion: '',
  killSwitchEnabled: false,
  killSwitchReason: '',
};

export function normalizePartnerMarketConfigForm(
  values: PartnerMarketConfigFormValues
): PartnerMarketConfigInput {
  const hosts = Array.from(
    new Set(
      values.approvedDestinationHosts
        .split(/[\n,]/)
        .map((host) => host.trim().toLowerCase().replace(/\.$/, ''))
        .filter(Boolean)
    )
  ).sort();
  const effectiveUntil = values.effectiveUntil?.trim() ?? '';
  const killSwitchReason = values.killSwitchReason?.trim();

  return {
    ...values,
    operatorKey: values.operatorKey.trim().toLowerCase(),
    operatorLegalName: values.operatorLegalName.trim(),
    operatorDisplayName: values.operatorDisplayName.trim(),
    operatorLogoUrl: values.operatorLogoUrl.trim(),
    affiliateDisclosureByLocale: {
      en: values.affiliateDisclosureByLocale.en.trim(),
      es: values.affiliateDisclosureByLocale.es.trim(),
      pt: values.affiliateDisclosureByLocale.pt.trim(),
    },
    countryCode: values.countryCode.trim().toUpperCase(),
    regionCode: values.regionCode?.trim().toUpperCase() || undefined,
    licenceReference: values.licenceReference.trim(),
    evidenceUrl: values.evidenceUrl.trim(),
    minimumAge: Number(values.minimumAge),
    requiredWarningText: values.requiredWarningText.trim(),
    responsibleGamblingUrl: values.responsibleGamblingUrl.trim(),
    approvedDestinationHosts: hosts,
    legalReviewedAt: toIso(values.legalReviewedAt),
    legalReviewExpiresAt: toIso(values.legalReviewExpiresAt),
    effectiveFrom: toIso(values.effectiveFrom),
    effectiveUntil: effectiveUntil ? toIso(effectiveUntil) : undefined,
    configVersion: values.configVersion.trim(),
    killSwitchReason: values.killSwitchEnabled ? killSwitchReason : undefined,
  };
}

export function validatePartnerMarketConfigForm(
  values: PartnerMarketConfigFormValues
): PartnerMarketConfigFormErrors {
  const errors: PartnerMarketConfigFormErrors = {};
  const input = normalizePartnerMarketConfigForm(values);

  requiredAndMax(errors, 'operatorLegalName', input.operatorLegalName, 255);
  requiredAndMax(errors, 'operatorDisplayName', input.operatorDisplayName, 120);
  requiredAndMax(errors, 'licenceReference', input.licenceReference);
  requiredAndMax(errors, 'requiredWarningText', input.requiredWarningText);
  requiredAndMax(errors, 'configVersion', input.configVersion, 80);

  if (!isURL(input.operatorLogoUrl, { protocols: ['https'], require_protocol: true }) || !input.operatorLogoUrl.startsWith('https://')) {
    errors.operatorLogoUrl = 'Enter a valid HTTPS operator logo URL.';
  }
  if (Object.values(input.affiliateDisclosureByLocale).some((value) => !value)) {
    errors.affiliateDisclosureByLocale = 'Affiliate disclosure is required for all en, es, and pt locales.';
  }

  if (!OPERATOR_KEY_PATTERN.test(input.operatorKey) || input.operatorKey.length > 80) {
    errors.operatorKey = 'Use lowercase kebab-case, up to 80 characters.';
  }
  if (!COUNTRY_CODE_PATTERN.test(input.countryCode)) {
    errors.countryCode = 'Enter a two-letter country code.';
  }
  if (input.regionCode && input.regionCode.length > 8) {
    errors.regionCode = 'Use 1–8 characters.';
  }
  if (!Number.isInteger(input.minimumAge) || input.minimumAge < 18 || input.minimumAge > 125) {
    errors.minimumAge = 'Enter a whole number from 18 to 125.';
  }
  if (!isBackendUrl(input.evidenceUrl)) errors.evidenceUrl = 'Enter a valid URL.';
  if (!isBackendUrl(input.responsibleGamblingUrl)) {
    errors.responsibleGamblingUrl = 'Enter a valid URL.';
  }
  if (input.approvedDestinationHosts.length === 0) {
    errors.approvedDestinationHosts = 'Add at least one approved hostname.';
  } else if (hasNormalizedHostDuplicates(values.approvedDestinationHosts)) {
    errors.approvedDestinationHosts = 'Each approved hostname must be unique.';
  } else if (
    input.approvedDestinationHosts.some(
      (host) => !isFQDN(host, { require_tld: true })
    )
  ) {
    errors.approvedDestinationHosts = 'Use hostnames only, without scheme, port, or path.';
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
  if (values.killSwitchEnabled && !input.killSwitchReason) {
    errors.killSwitchReason = 'A reason is required while the kill switch is enabled.';
  } else if (input.killSwitchReason && input.killSwitchReason.length > 500) {
    errors.killSwitchReason = 'Use no more than 500 characters.';
  }
  return errors;
}

function requiredAndMax(
  errors: PartnerMarketConfigFormErrors,
  field: keyof PartnerMarketConfigFormValues,
  value: string,
  max?: number
): void {
  if (!value) errors[field] = 'Required.';
  else if (max && value.length > max) errors[field] = `Use no more than ${max} characters.`;
}

function validateDate(
  errors: PartnerMarketConfigFormErrors,
  field: keyof PartnerMarketConfigFormValues,
  value: string
): void {
  if (!value || Number.isNaN(Date.parse(value))) errors[field] = 'Enter a valid date and time.';
}

function isBackendUrl(value: string): boolean {
  return isURL(value, { require_tld: false });
}

function hasNormalizedHostDuplicates(value: string): boolean {
  const hosts = value
    .split(/[\n,]/)
    .map((host) => host.trim().toLowerCase().replace(/\.$/, ''))
    .filter(Boolean);
  return new Set(hosts).size !== hosts.length;
}

function toIso(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
