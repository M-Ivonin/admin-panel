import type {
  CampaignAudienceDefinition,
  CampaignLocale,
} from '@/modules/campaigns/contracts';

export type EmailPublicationTopic =
  | 'sirbro_predictions'
  | 'sirbro_predictions_with_partner_offer'
  | 'sirbro_product_updates'
  | 'betting_partner_offers';

export type EmailPublicationState =
  | 'draft'
  | 'approved'
  | 'scheduled'
  | 'sending'
  | 'paused'
  | 'sent'
  | 'completed_no_send'
  | 'sent_with_failures'
  | 'cancelled'
  | 'failed'
  | 'superseded';

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
  sendGridTemplateId: string;
  sendGridTemplateVersion: string;
  audience: CampaignAudienceDefinition;
  frequencyCapHours: number;
  requireMinimumHealthSample?: boolean;
  contentByLocale: EmailContentByLocale;
  prediction?: { predictionId: string; analysisVersion: number };
  productUpdate?: { cta?: ProductUpdateCta };
  partnerOffer?: {
    partnerMarketConfigId: string;
    offerHeadlineByLocale: LocalizedString;
    offerBodyByLocale: LocalizedString;
    materialTermsByLocale: LocalizedString;
    offerExpiresAt: string;
    countryCode: string;
    regionCode?: string;
  };
  sponsoredPrediction?: {
    predictionId: string;
    analysisVersion: number;
    partnerMarketConfigId: string;
    offerHeadlineByLocale: LocalizedString;
    offerBodyByLocale: LocalizedString;
    materialTermsByLocale: LocalizedString;
    offerExpiresAt: string;
    countryCode: string;
    regionCode?: string;
  };
}

export interface EmailPublicationDefinition {
  name: string;
  topic?: EmailPublicationTopic;
  sendGridTemplateId: string;
  sendGridTemplateVersion: string;
  audience: CampaignAudienceDefinition;
  frequencyCapHours: number;
  requireMinimumHealthSample?: boolean;
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
  campaignName?: string | null;
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
  cohortAnchorAt: string | null;
  cohortHistoryComplete: boolean;
  autoPause: { at: string; reason: string | null } | null;
  lateIncident: {
    at: string;
    reason: string | null;
    acknowledgedAt: string | null;
    acknowledgementNote: string | null;
  } | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EmailAnalyticsCompleteness = 'complete' | 'incomplete' | 'N/A';
export type EmailAnalyticsMaturity = 'mature' | 'immature' | 'N/A';

export interface EmailAnalyticsCohort {
  size: number;
  denominator: number;
  active: number;
  rate: number | null;
}

export interface EmailAnalyticsRetentionWindow {
  maturity: EmailAnalyticsMaturity;
  completeness: EmailAnalyticsCompleteness;
  exposed: EmailAnalyticsCohort;
  control: EmailAnalyticsCohort;
}

/** Exact delivery engagement with backend-owned rates and completeness. */
export interface EmailAnalyticsEngagement {
  completeness: EmailAnalyticsCompleteness;
  denominator: number;
  metrics: {
    fullAnalysisClicks: number;
    productClicks: number;
    appOpens: number;
    initialSubscriptions: number;
  } | null;
  rates: {
    fullAnalysisClick: number | null;
    productClick: number | null;
    appOpen: number | null;
    initialSubscription: number | null;
  } | null;
}

export interface EmailPublicationAnalytics {
  dimensions: {
    campaign: string | null;
    publicationVersion: number;
    type: EmailPublicationTopic | null;
    operator: string;
    geo: string;
    league: string;
    market: string;
  };
  counts: {
    exposedSize: number;
    controlSize: number;
    accepted: number;
    delivered: number;
    delayed: number;
    hardBounce: number;
    blockReject: number;
    complaint: number;
    topicUnsubscribe: number;
    globalUnsubscribe: number;
    unsubscribe: number;
    fullAnalysisClicks: number;
    productClicks: number;
    appOpens: number;
    initialSubscriptions: number;
    partnerLandingViews: number;
    partnerContinues: number;
    affiliateConversions: number;
  };
  affiliateConversionsByType?: Record<string, number> | null;
  slices: Array<{
    engagement?: EmailAnalyticsEngagement;
    country?: string;
    campaign: string | null;
    publicationVersion: number;
    type: EmailPublicationTopic | null;
    operator: string;
    geo: string;
    locale: string;
    cohort: 'exposed' | 'control' | null;
    league: string;
    market: string;
    counts: {
      accepted: number;
      delivered: number;
      complaints: number;
      unsubscribes: number;
    };
    rates: {
      delivery: number | null;
      complaint: number | null;
      unsubscribe: number | null;
    };
  }>;
  rates: {
    delivery: number | null;
    revenuePerDeliveredEmail: number | null;
    revenuePerEligibleConfirmedPartnerSubscriber: number | null;
  };
  denominators: {
    delivered: number;
    providerAccepted: number;
    eligibleConfirmedAudience: number;
  };
  attributionCompleteness: {
    numerator: number;
    denominator: number;
    status: EmailAnalyticsCompleteness;
  };
  affiliateRevenue: {
    usd: number | null;
    completeness: EmailAnalyticsCompleteness;
  };
  tracedAttribution: {
    completeness: EmailAnalyticsCompleteness;
    available: boolean;
    eligibleDeliveries: number;
    tracedDeliveries: number;
    metrics: {
      fullAnalysisClicks: number;
      productClicks: number;
      appOpens: number;
      initialSubscriptions: number;
    } | null;
  };
  retention: {
    anchorAt: string | null;
    d7: EmailAnalyticsRetentionWindow;
    d30: EmailAnalyticsRetentionWindow;
    byLocale: Array<{
      locale: string;
      cohort: 'exposed' | 'control';
      size: number;
      d7: { denominator: number; active: number };
      d30: { denominator: number; active: number };
    }>;
  };
  sponsoredComparator:
    | { status: 'N/A'; label: 'observational' }
    | {
        status: 'available';
        label: 'observational';
        publicationId: string;
        publicationVersion: number;
        matching: {
          league: string | null;
          market: string | null;
          locale: 'same_locale_slice';
          lookbackDays: number;
        };
        slices: Array<{
          locale: string;
          sponsored: {
            engagement?: EmailAnalyticsEngagement;
            delivered: number;
            complaintRate: number | null;
            unsubscribeRate: number | null;
          };
          comparator: {
            engagement?: EmailAnalyticsEngagement;
            delivered: number;
            complaintRate: number | null;
            unsubscribeRate: number | null;
          };
        }>;
      };
  health: {
    status: 'healthy' | 'warning' | 'critical';
    reasons: string[];
    rates: {
      complaint: number | null;
      hardBounce: number | null;
      unsubscribe: number | null;
      delivery: number | null;
      maturedDelivery: number | null;
    };
    denominators: {
      complaint: number;
      hardBounce: number;
      unsubscribe: number;
      delivery: number;
      maturedDelivery: number;
    };
  };
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
  operatorTermsUrl?: string | null;
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

export interface SendGridTemplateReference {
  id: string;
  name: string;
  compatibleTopics: EmailPublicationTopic[];
  versions: Array<{
    id: string;
    name: string;
    active: boolean;
    updatedAt: string;
  }>;
}

export interface EmailMarketingRepository {
  list(state?: EmailPublicationState): Promise<EmailPublication[]>;
  get(id: string): Promise<EmailPublication>;
  getAnalytics(id: string): Promise<EmailPublicationAnalytics>;
  getAnalyticsExport(id: string): Promise<EmailPublicationAnalytics>;
  create(
    input: EmailPublicationInput,
    idempotencyKey: string
  ): Promise<EmailPublicationMutationResult>;
  edit(
    id: string,
    input: EmailPublicationInput & { expectedDefinitionVersion: number }
  ): Promise<EmailPublicationMutationResult>;
  preview(id: string, locale: CampaignLocale): Promise<EmailPreview>;
  approve(id: string): Promise<EmailPublicationMutationResult>;
  sendNow(id: string): Promise<EmailPublicationMutationResult>;
  schedule(
    id: string,
    input: { scheduledAtUtc: string; timezone: string }
  ): Promise<EmailPublicationMutationResult>;
  pause(id: string): Promise<EmailPublicationMutationResult>;
  resume(id: string): Promise<EmailPublicationMutationResult>;
  cancel(id: string, reason: string): Promise<EmailPublicationMutationResult>;
  acknowledgeIncident(
    id: string,
    note: string
  ): Promise<{ acknowledged: true }>;
  estimateAudience(
    audience: CampaignAudienceDefinition
  ): Promise<{ reachableUsers: number; warnings: string[] }>;
  listPredictionReferences(): Promise<PredictionReference[]>;
  listPartnerMarketConfigs(): Promise<PartnerMarketProjection[]>;
  listAudienceSources(): Promise<EmailAudienceSource[]>;
  listSendGridTemplates(): Promise<SendGridTemplateReference[]>;
}
