import type { InAppPartnerPolicy } from './types';

export const appPlatforms = { ios: 'iOS', android: 'Android' } as const;
export type AppPlatform = keyof typeof appPlatforms;
export const appPlatformKeys: AppPlatform[] = ['ios', 'android'];

type PlatformDraft = {
  enabled: boolean;
  minimumAge: string;
  assurance: '' | NonNullable<
    InAppPartnerPolicy['platforms'][AppPlatform]
  >['assurance'];
};

export const emptyDisclosure = {
  locale: '',
  warning: '',
  supportUrl: '',
  termsUrl: '',
};

export function toInAppPolicyDraft(policy?: InAppPartnerPolicy | null) {
  const platform = (key: AppPlatform): PlatformDraft => {
    const existing = policy?.platforms[key];
    return {
      enabled: Boolean(existing),
      minimumAge: existing ? String(existing.minimumAge) : '',
      assurance: existing?.assurance ?? '',
    };
  };

  return {
    enabled: Boolean(policy),
    expiresAt: policy?.expiresAt ?? '',
    platforms: { ios: platform('ios'), android: platform('android') },
    disclosures: [
      { ...emptyDisclosure, ...policy?.disclosureByLocale.en, locale: 'en' },
      ...Object.entries(policy?.disclosureByLocale ?? {})
        .filter(([locale]) => locale !== 'en')
        .map(([locale, disclosure]) => ({ locale, ...disclosure })),
    ],
  };
}

export type InAppPolicyDraft = ReturnType<typeof toInAppPolicyDraft>;

export function readInAppPolicy(
  draft: InAppPolicyDraft
): InAppPartnerPolicy | null | string {
  if (!draft.enabled) return null;
  if (!Number.isFinite(Date.parse(draft.expiresAt)))
    return 'Enter an in-app policy expiry date and time.';

  const platforms: InAppPartnerPolicy['platforms'] = {};
  for (const key of appPlatformKeys) {
    const { enabled, minimumAge, assurance } = draft.platforms[key];
    if (!enabled) continue;
    const age = Number(minimumAge);
    if (!Number.isInteger(age) || age < 18 || age > 125) {
      return `${appPlatforms[key]} minimum age must be a whole number from 18 to 125.`;
    }
    if (!assurance) {
      return `Select an age assurance method for ${appPlatforms[key]}.`;
    }
    platforms[key] = { minimumAge: age, assurance };
  }
  if (!platforms.ios && !platforms.android)
    return 'Select at least one platform.';

  const disclosureByLocale: InAppPartnerPolicy['disclosureByLocale'] = {};
  for (const { locale, warning, supportUrl, termsUrl } of draft.disclosures) {
    const code = locale.trim();
    if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(code))
      return 'Enter a locale such as fr or pt-BR.';
    if (Object.prototype.hasOwnProperty.call(disclosureByLocale, code))
      return `Add only one disclosure for ${code}.`;
    if (!warning.trim()) return `Enter the warning for ${code}.`;
    if (!isHttpsUrl(supportUrl) || !isHttpsUrl(termsUrl)) {
      return `Enter valid HTTPS support and terms URLs for ${code}.`;
    }
    disclosureByLocale[code] = { warning, supportUrl, termsUrl };
  }

  return { expiresAt: draft.expiresAt, platforms, disclosureByLocale };
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' && !url.username && !url.password && !url.port
    );
  } catch {
    return false;
  }
}
