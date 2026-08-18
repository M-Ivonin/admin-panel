import type {
  CampaignDraft,
  CampaignListItem,
  CampaignStatsPeriod,
} from '@/modules/campaigns/contracts';

export interface CampaignJsonExport {
  exportedAt: string;
  metricsPeriod: {
    type: CampaignStatsPeriod;
    from?: string;
    to?: string;
  };
  campaign: {
    definition: CampaignDraft;
    performance: CampaignListItem;
  };
}

export function buildCampaignJson(campaignExport: CampaignJsonExport): string {
  return JSON.stringify(campaignExport, null, 2);
}

export function downloadCampaignJson(campaignExport: CampaignJsonExport): void {
  const json = buildCampaignJson(campaignExport);
  const url = URL.createObjectURL(
    new Blob([json], { type: 'application/json;charset=utf-8' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `campaign_${campaignExport.campaign.definition.name}_${campaignExport.metricsPeriod.type}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
