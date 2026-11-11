import {
  PartnerMarketConfigFormErrors,
  PartnerMarketConfigFormValues,
  PartnerMarketConfigInput,
} from './types';
import isFQDN from 'validator/lib/isFQDN';
import isURL from 'validator/lib/isURL';
import { requiresMarketingRegion } from '@/modules/marketing-jurisdictions/region-requirement';

const OPERATOR_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
const CONVERSION_TYPE_PATTERN = /^[a-z][a-z0-9_-]{0,63}$/;
export const CORE_AFFILIATE_CONVERSION_TYPES = [
  'registration',
  'ftd',
  'deposit',
  'commission',
  'reversal',
] as const;

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
  emailEnabled: true,
  inAppEnabled: false,
  partnerOnlyAllowed: false,
  sponsoredPredictionAllowed: false,
  bonusAdvertisingAllowed: false,
  matchSpecificPromotionAllowed: false,
  requiredWarningText: '',
  responsibleGamblingUrl: '',
  operatorTermsUrl: '',
  operatorDestinationUrl: '',
  inAppBannerAffiliateUrl: '',
  inAppFinalDestinationHosts: '',
  approvedDestinationHosts: '',
  affiliateConversionTypes: CORE_AFFILIATE_CONVERSION_TYPES.join('\n'),
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
  const effectiveUntil = values.effectiveUntil?.trim() ?? '';
  const killSwitchReason = values.killSwitchReason?.trim();
  const affiliateConversionTypes = Array.from(
    new Set([
      ...CORE_AFFILIATE_CONVERSION_TYPES,
      ...values.affiliateConversionTypes
        .split(/[\n,]/)
        .map((type) => type.trim().toLowerCase())
        .filter(Boolean),
    ])
  ).sort();

  return {
    operatorKey: values.operatorKey.trim().toLowerCase(),
    operatorLegalName: values.operatorLegalName.trim(),
    operatorDisplayName: values.operatorDisplayName.trim(),
    operatorLogoUrl: values.operatorLogoUrl.trim(),
    ...(values.emailEnabled
      ? {
          affiliateDisclosureByLocale: {
            en: values.affiliateDisclosureByLocale.en.trim(),
            es: values.affiliateDisclosureByLocale.es.trim(),
            pt: values.affiliateDisclosureByLocale.pt.trim(),
          },
          operatorTermsUrl: values.operatorTermsUrl.trim(),
          operatorDestinationUrl: values.operatorDestinationUrl.trim(),
        }
      : {}),
    countryCode: values.countryCode.trim().toUpperCase(),
    regionCode: values.regionCode?.trim().toUpperCase() || undefined,
    status: values.status,
    licenceReference: values.licenceReference.trim(),
    evidenceUrl: values.evidenceUrl.trim(),
    minimumAge: Number(values.minimumAge),
    emailEnabled: values.emailEnabled,
    inAppEnabled: values.inAppEnabled,
    partnerOnlyAllowed: values.partnerOnlyAllowed,
    sponsoredPredictionAllowed: values.sponsoredPredictionAllowed,
    bonusAdvertisingAllowed: values.bonusAdvertisingAllowed,
    matchSpecificPromotionAllowed: values.matchSpecificPromotionAllowed,
    requiredWarningText: values.requiredWarningText.trim(),
    responsibleGamblingUrl: values.responsibleGamblingUrl.trim(),
    inAppBannerAffiliateUrl: values.inAppBannerAffiliateUrl.trim() || null,
    inAppFinalDestinationHosts: normalizeApprovedDestinationHosts(
      values.inAppFinalDestinationHosts
    ),
    approvedDestinationHosts: normalizeApprovedDestinationHosts(
      values.approvedDestinationHosts
    ),
    affiliateConversionTypes,
    legalReviewedAt: toIso(values.legalReviewedAt),
    legalReviewExpiresAt: toIso(values.legalReviewExpiresAt),
    effectiveFrom: toIso(values.effectiveFrom),
    effectiveUntil: effectiveUntil ? toIso(effectiveUntil) : undefined,
    configVersion: values.configVersion.trim(),
    killSwitchEnabled: values.killSwitchEnabled,
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

  if (
    !isURL(input.operatorLogoUrl, {
      protocols: ['https'],
      require_protocol: true,
    }) ||
    !input.operatorLogoUrl.startsWith('https://')
  ) {
    errors.operatorLogoUrl = 'Enter a valid HTTPS operator logo URL.';
  }
  if (
    input.affiliateDisclosureByLocale &&
    Object.values(input.affiliateDisclosureByLocale).some((value) => !value)
  ) {
    errors.affiliateDisclosureByLocale =
      'Affiliate disclosure is required for all en, es, and pt locales.';
  }

  if (
    !OPERATOR_KEY_PATTERN.test(input.operatorKey) ||
    input.operatorKey.length > 80
  ) {
    errors.operatorKey = 'Use lowercase kebab-case, up to 80 characters.';
  }
  if (!COUNTRY_CODE_PATTERN.test(input.countryCode)) {
    errors.countryCode = 'Enter a two-letter country code.';
  }
  if (requiresMarketingRegion(input.countryCode) && !input.regionCode) {
    errors.regionCode = 'Region is required for this country.';
  }
  if (input.regionCode && input.regionCode.length > 8) {
    errors.regionCode = 'Use 1–8 characters.';
  }
  if (
    !Number.isInteger(input.minimumAge) ||
    input.minimumAge < 18 ||
    input.minimumAge > 125
  ) {
    errors.minimumAge = 'Enter a whole number from 18 to 125.';
  }
  if (!isBackendUrl(input.evidenceUrl))
    errors.evidenceUrl = 'Enter a valid URL.';
  if (!isBackendUrl(input.responsibleGamblingUrl)) {
    errors.responsibleGamblingUrl = 'Enter a valid URL.';
  }
  if (
    values.emailEnabled &&
    (!input.operatorTermsUrl ||
      !isURL(input.operatorTermsUrl, {
        protocols: ['https'],
        require_protocol: true,
      }) ||
      !input.operatorTermsUrl.startsWith('https://'))
  ) {
    errors.operatorTermsUrl = 'Enter a valid HTTPS operator terms URL.';
  }
  if (
    values.emailEnabled &&
    (!input.operatorDestinationUrl ||
      !isURL(input.operatorDestinationUrl, {
        protocols: ['https'],
        require_protocol: true,
      }) ||
      !input.operatorDestinationUrl.startsWith('https://'))
  )
    errors.operatorDestinationUrl =
      'Enter the exact approved HTTPS operator destination.';
  if (input.approvedDestinationHosts.length === 0) {
    errors.approvedDestinationHosts = 'Add at least one approved hostname.';
  } else if (hasNormalizedHostDuplicates(values.approvedDestinationHosts)) {
    errors.approvedDestinationHosts = 'Each approved hostname must be unique.';
  } else if (
    input.approvedDestinationHosts.some(
      (host) => !isFQDN(host, { require_tld: true })
    )
  ) {
    errors.approvedDestinationHosts =
      'Use hostnames only, without scheme, port, or path.';
  }
  if (
    input.operatorDestinationUrl &&
    !errors.operatorDestinationUrl &&
    !errors.approvedDestinationHosts
  ) {
    const destinationHost = new URL(
      input.operatorDestinationUrl
    ).hostname.toLowerCase();
    if (!input.approvedDestinationHosts.includes(destinationHost)) {
      errors.operatorDestinationUrl =
        'The destination hostname must be in approved hostnames.';
    }
  }
  const finalHosts = input.inAppFinalDestinationHosts ?? [];
  if (input.inAppEnabled && finalHosts.length === 0) {
    errors.inAppFinalDestinationHosts =
      'Add at least one final operator hostname when In-app is enabled.';
  } else if (finalHosts.length > 10) {
    errors.inAppFinalDestinationHosts = 'Enter up to 10 final operator hostnames.';
  } else if (
    finalHosts.some((host) => !input.approvedDestinationHosts.includes(host))
  ) {
    errors.inAppFinalDestinationHosts =
      'Every final operator hostname must also be an approved hostname.';
  }
  if (input.inAppEnabled && !input.inAppBannerAffiliateUrl) {
    errors.inAppBannerAffiliateUrl =
      'Enter an in-app banner affiliate link when In-app is enabled.';
  } else if (input.inAppBannerAffiliateUrl) {
    const bannerHost = getStandardHttpsHostname(input.inAppBannerAffiliateUrl);
    if (!bannerHost) {
      errors.inAppBannerAffiliateUrl = 'Enter a valid HTTPS banner link.';
    } else if (
      !errors.approvedDestinationHosts &&
      !input.approvedDestinationHosts.includes(bannerHost)
    ) {
      errors.inAppBannerAffiliateUrl =
        'The banner link must use an approved hostname.';
    }
  }
  const suppliedConversionTypes = values.affiliateConversionTypes
    .split(/[\n,]/)
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);
  if (
    suppliedConversionTypes.some((type) => !CONVERSION_TYPE_PATTERN.test(type))
  ) {
    errors.affiliateConversionTypes =
      'Use lowercase letters, numbers, underscores, or hyphens (up to 64 characters).';
  }
  validateDate(errors, 'legalReviewedAt', input.legalReviewedAt);
  validateDate(errors, 'legalReviewExpiresAt', input.legalReviewExpiresAt);
  validateDate(errors, 'effectiveFrom', input.effectiveFrom);
  if (input.effectiveUntil)
    validateDate(errors, 'effectiveUntil', input.effectiveUntil);

  if (
    !errors.legalReviewedAt &&
    !errors.legalReviewExpiresAt &&
    input.legalReviewExpiresAt <= input.legalReviewedAt
  ) {
    errors.legalReviewExpiresAt = 'Expiry must be after the legal review date.';
  }
  if (
    !errors.effectiveFrom &&
    !errors.effectiveUntil &&
    input.effectiveUntil &&
    input.effectiveUntil <= input.effectiveFrom
  ) {
    errors.effectiveUntil = 'End date must be after the effective start.';
  }
  if (values.killSwitchEnabled && !input.killSwitchReason) {
    errors.killSwitchReason =
      'A reason is required while the kill switch is enabled.';
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
  else if (max && value.length > max)
    errors[field] = `Use no more than ${max} characters.`;
}

function validateDate(
  errors: PartnerMarketConfigFormErrors,
  field: keyof PartnerMarketConfigFormValues,
  value: string
): void {
  if (!value || Number.isNaN(Date.parse(value)))
    errors[field] = 'Enter a valid date and time.';
}

function isBackendUrl(value: string): boolean {
  return isURL(value, { require_tld: false });
}

export function getStandardHttpsHostname(value: string): string | undefined {
  if (
    !/^https:\/\//i.test(value) ||
    !isURL(value, {
      protocols: ['https'],
      require_protocol: true,
      disallow_auth: true,
    })
  ) {
    return;
  }
  try {
    const url = new URL(value);
    if (!url.port) return url.hostname.toLowerCase().replace(/\.$/, '');
  } catch {
    return;
  }
}

export function isApprovedAppBannerDestination(
  value: string | null | undefined,
  approvedHosts: readonly string[]
): boolean {
  if (
    !value ||
    value.length > 2048 ||
    !/^https:\/\//i.test(value) ||
    /[\s\\]/.test(value)
  )
    return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.hash &&
      /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]+$/.test(url.hostname) &&
      !/^(?:\d+\.){3}\d+$/.test(url.hostname) &&
      approvedHosts.includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export function normalizeApprovedDestinationHosts(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[\n,]/)
        .map((host) => host.trim().toLowerCase().replace(/\.$/, ''))
        .filter(Boolean)
    ),
  ].sort();
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
