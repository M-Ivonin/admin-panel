import type { CampaignAnalyticsExport } from '@/modules/campaigns/contracts';

export function buildCampaignJson(
  campaignExport: CampaignAnalyticsExport
): string {
  return JSON.stringify(campaignExport, null, 2);
}

export function downloadCampaignJson(
  campaignExport: CampaignAnalyticsExport
): void {
  const json = buildCampaignJson(campaignExport);
  const url = URL.createObjectURL(
    new Blob([json], { type: 'application/json;charset=utf-8' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `campaign_${campaignExport.campaign.identity.name}_${campaignExport.period.type}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
