import type {
  CampaignLocale,
  CampaignTargetApp,
} from '@/modules/campaigns/contracts';

export const ALL_CAMPAIGN_LOCALES: CampaignLocale[] = ['en', 'es', 'pt'];
export const TIPSTER_BRO_CAMPAIGN_LOCALES: CampaignLocale[] = ['en'];

export function getAvailableCampaignLocales(
  targetApps: CampaignTargetApp[]
): CampaignLocale[] {
  return targetApps.length === 1 && targetApps.includes('TipsterBro')
    ? TIPSTER_BRO_CAMPAIGN_LOCALES
    : ALL_CAMPAIGN_LOCALES;
}

export function normalizeCampaignLocalesForTargetApps(
  locales: CampaignLocale[],
  targetApps: CampaignTargetApp[]
): CampaignLocale[] {
  const availableLocales = getAvailableCampaignLocales(targetApps);
  const normalizedLocales = locales.filter((locale) =>
    availableLocales.includes(locale)
  );

  return normalizedLocales.length > 0
    ? Array.from(new Set(normalizedLocales))
    : [availableLocales[0]];
}
