import type { CampaignAudienceDefinition, CampaignLocale } from '@/modules/campaigns/contracts';

export type EmailPublicationTopic =
  | 'sirbro_predictions'
  | 'sirbro_product_updates'
  | 'betting_partner_offers';

export type EmailPublicationState =
  | 'draft' | 'approved' | 'scheduled' | 'sending' | 'paused' | 'sent'
  | 'completed_no_send' | 'sent_with_failures' | 'cancelled' | 'failed' | 'superseded';

export type EmailLocaleContent = {
  subject: string;
  preheader: string;
  htmlBody: string;
  textBody: string;
};

export type LocalizedString = Record<CampaignLocale, string>;
export type EmailContentByLocale = Record<CampaignLocale, EmailLocaleContent>;

export interface ProductUpdateCta {
  labelByLocale: LocalizedString;
  url: string;
}

export interface EmailPublicationInput {
  name: string;
  topic: EmailPublicationTopic;
  audience: CampaignAudienceDefinition;
  frequencyCapHours: number;
  contentByLocale: EmailContentByLocale;
  prediction?: { predictionId: string; analysisVersion: number };
  productUpdate?: { cta?: ProductUpdateCta };
  partnerOffer?: {
    partnerMarketConfigId: string;
    offerHeadlineByLocale: LocalizedString;
    offerBodyByLocale: LocalizedString;
    materialTermsByLocale: LocalizedString;
    offerExpiresAt: string;
    destinationUrl: string;
    countryCode: string;
    regionCode?: string;
  };
}

export interface EmailPublicationDefinition {
  name: string;
  topic?: EmailPublicationTopic;
  audience: CampaignAudienceDefinition;
  frequencyCapHours: number;
  contentByLocale: EmailContentByLocale;
}

export interface EmailPublicationCounters {
  accepted: number;
  delivered: number;
  bounced: number;
  dropped: number;
  skipped: number;
  failed: number;
  ambiguous: number;
  pending: number;
}

export interface EmailPublication {
  id: string;
  campaignId: string;
  definitionVersion: number;
  topic: EmailPublicationTopic;
  state: EmailPublicationState;
  definition: EmailPublicationDefinition;
  typeData: Record<string, unknown>;
  approvalSnapshot: Record<string, unknown> | null;
  schedule: { scheduledAtUtc: string; timezone: string } | null;
  counters: EmailPublicationCounters;
  terminalReason: string | null;
  terminalAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailPreview {
  locale: CampaignLocale;
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

export interface EmailPublicationMutationResult {
  id: string;
  state: EmailPublicationState;
}

export interface PredictionReference {
  id: string;
  analysisVersion: number;
  predictionStatus: string;
  teamsNames?: string;
  leagueName?: string;
  fixtureTime?: string;
}

export interface PartnerMarketProjection {
  id: string;
  operatorDisplayName: string;
  operatorLogoUrl?: string | null;
  affiliateDisclosureByLocale?: LocalizedString | null;
  minimumAge: number;
  requiredWarningText: string;
  responsibleGamblingUrl: string;
  countryCode: string;
  regionCode: string | null;
  status: string;
  killSwitchEnabled: boolean;
}

export interface EmailAudienceSource {
  id: string;
  name: string;
  description: string;
  source: 'saved_segment' | 'template_segment';
  audience: CampaignAudienceDefinition;
}

export interface EmailMarketingRepository {
  list(state?: EmailPublicationState): Promise<EmailPublication[]>;
  get(id: string): Promise<EmailPublication>;
  create(input: EmailPublicationInput, idempotencyKey: string): Promise<EmailPublicationMutationResult>;
  edit(id: string, input: EmailPublicationInput & { expectedDefinitionVersion: number }): Promise<EmailPublicationMutationResult>;
  preview(id: string, locale: CampaignLocale): Promise<EmailPreview>;
  approve(id: string): Promise<EmailPublicationMutationResult>;
  sendNow(id: string): Promise<EmailPublicationMutationResult>;
  schedule(id: string, input: { scheduledAtUtc: string; timezone: string }): Promise<EmailPublicationMutationResult>;
  pause(id: string): Promise<EmailPublicationMutationResult>;
  resume(id: string): Promise<EmailPublicationMutationResult>;
  cancel(id: string, reason: string): Promise<EmailPublicationMutationResult>;
  estimateAudience(audience: CampaignAudienceDefinition): Promise<{ reachableUsers: number; warnings: string[] }>;
  listPredictionReferences(): Promise<PredictionReference[]>;
  listPartnerMarketConfigs(): Promise<PartnerMarketProjection[]>;
  listAudienceSources(): Promise<EmailAudienceSource[]>;
}
