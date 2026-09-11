import type { CampaignAnalyticsExport } from '@/modules/campaigns/contracts';

export function buildCampaignJson(
  campaignExport: CampaignAnalyticsExport
): string {
  return JSON.stringify(campaignExport, null, 2);
}

export function downloadCampaignJson(
  campaignExport: CampaignAnalyticsExport
): void {
  downloadJson(
    buildCampaignJson(campaignExport),
    `campaign_${campaignExport.campaign.identity.name}_${campaignExport.period.type}.json`
  );
}

export function downloadCampaignsJson(
  campaignExports: CampaignAnalyticsExport[]
): void {
  downloadJson(
    JSON.stringify(campaignExports, null, 2),
    `campaigns_${new Date().toISOString().slice(0, 10)}.json`
  );
}

function downloadJson(json: string, filename: string): void {
  const url = URL.createObjectURL(
    new Blob([json], { type: 'application/json;charset=utf-8' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
