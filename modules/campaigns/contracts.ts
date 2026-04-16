/**
 * Shared contracts for the campaigns admin experience.
 */

import { RetentionStage } from '@/lib/api/users';

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'archived';

export type CampaignChannel = 'push';
export type CampaignLocale = 'en' | 'es' | 'pt';
export type CampaignReadiness = 'ready' | 'warning' | 'missing';

export type CampaignSegmentSource =
  | 'saved_segment'
  | 'manual_rules'
  | 'template_segment';

export type CampaignEntryTriggerType =
  | 'state_based'
  | 'event_based'
  | 'scheduled_recurring';

export type CampaignEventTriggerKey = string;

export type CampaignSendMode =
  | 'immediately'
  | 'after_delay'
  | 'specific_datetime';

export type CampaignTimezoneMode = 'user_local';

export type CampaignTokenKey =
  | 'first_name'
  | 'favorite_team'
  | 'bonus_points';

export type CampaignDeeplinkTarget =
  | 'continue_onboarding'
  | 'open_match_center'
  | 'open_rewards_wallet';

export type CampaignQuickView =
  | 'active_now'
  | 'needs_attention'
  | 'recent_drafts';

export interface CampaignOverviewStats {
  activeCampaigns: number;
  pausedCampaigns: number;
  scheduledCampaigns: number;
  sentToday: number;
  deliveredRate: number;
  avgCtr: number;
  ctrDeltaVsPrev7d: number;
  reachInProgress: number;
}

export interface CampaignListAudienceSummary {
  estimate: number | null;
  label: string;
}

export interface CampaignListTimingSummary {
  label: string;
  timestamp: string | null;
}

export interface CampaignListProgressSummary {
  sentCount: number | null;
  totalCount: number | null;
  progressPercent: number | null;
}

export interface CampaignListMetricSummary {
  label: 'ctr' | 'goal';
  value: string;
}

export interface CampaignListOwnerSummary {
  ownerName: string;
  activityLabel: string;
}

export interface CampaignListItem {
  id: string;
  name: string;
  goal: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  entryTriggerType: CampaignEntryTriggerType;
  audience: CampaignListAudienceSummary;
  timing: CampaignListTimingSummary;
  progress: CampaignListProgressSummary;
  metric: CampaignListMetricSummary;
  owner: CampaignListOwnerSummary;
  updatedAt: string;
  localeReadiness: Record<CampaignLocale, CampaignReadiness>;
}

export interface GetCampaignsOverviewParams {
  page: number;
  limit: number;
  search: string;
  statuses: CampaignStatus[];
  triggerTypes: CampaignEntryTriggerType[];
  quickView: CampaignQuickView | null;
}

export interface CampaignsOverviewResponse {
  stats: CampaignOverviewStats;
  items: CampaignListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CampaignSavedSegmentSummary {
  id: string;
  name: string;
  description: string;
  audienceEstimate: number | null;
  source: 'saved_segment' | 'template_segment';
}

export interface CampaignTemplateSummary {
  id: string;
  name: string;
  description: string;
  entryTriggerType: CampaignEntryTriggerType;
  deeplinkTarget: CampaignDeeplinkTarget;
}

export interface CampaignTokenDefinition {
  key: CampaignTokenKey;
  token: `{{${string}}}`;
  label: string;
  requiresFallback: boolean;
  description: string;
}

export interface CampaignDeeplinkOption {
  target: CampaignDeeplinkTarget;
  label: string;
  path: string;
}

export interface CampaignEventTriggerOption {
  key: CampaignEventTriggerKey;
  label: string;
  description: string;
}

export interface CampaignEditorCatalog {
  savedSegments: CampaignSavedSegmentSummary[];
  templates: CampaignTemplateSummary[];
  tokens: CampaignTokenDefinition[];
  deeplinkOptions: CampaignDeeplinkOption[];
  eventTriggers: CampaignEventTriggerOption[];
}

export interface CampaignAudienceCriteria {
  retentionStages: RetentionStage[];
  partnerId: string | null;
  locales: CampaignLocale[];
  requiresPushOptIn: boolean;
}

export interface CampaignSuppressionRules {
  excludeConvertedUsers: boolean;
  excludeRecentRecipients: boolean;
}

export type CampaignEntryTriggerConfig =
  | {
      type: 'state_based';
    }
  | {
      type: 'event_based';
      eventKey: CampaignEventTriggerKey;
    }
  | {
      type: 'scheduled_recurring';
      recurrenceRule: string;
    };

export interface CampaignAudienceDefinition {
  segmentSource: CampaignSegmentSource;
  sourceSegmentId: string | null;
  criteria: CampaignAudienceCriteria;
  suppression: CampaignSuppressionRules;
  trigger: CampaignEntryTriggerConfig;
}

export interface CampaignTimingRule {
  sendMode: CampaignSendMode;
  delayMinutes: number | null;
  scheduledAt: string | null;
  timezoneMode: CampaignTimezoneMode;
  sendWindowStart: string;
  sendWindowEnd: string;
  frequencyCapHours: number | null;
  stopOnGoalReached: boolean;
}

export interface CampaignLocaleContent {
  title: string;
  body: string;
  fallbackFirstName: string;
  deeplinkTarget: CampaignDeeplinkTarget;
}

export interface CampaignDraft {
  id: string | null;
  name: string;
  goal: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience: CampaignAudienceDefinition;
  timing: CampaignTimingRule;
  content: Record<CampaignLocale, CampaignLocaleContent>;
  updatedAt: string | null;
  createdBy: string | null;
}

export interface EstimateAudienceRequest {
  audience: CampaignAudienceDefinition;
}

export interface EstimateAudienceResponse {
  reachableUsers: number;
  warnings: string[];
  byRetentionStage?: Partial<Record<RetentionStage, number>>;
  byLocale?: Partial<Record<CampaignLocale, number>>;
}

export interface SaveSegmentRequest {
  name: string;
  audience: CampaignAudienceDefinition;
}

export interface SaveSegmentResponse {
  segment: CampaignSavedSegmentSummary;
}

export interface SendTestCampaignRequest {
  recipients: string[];
  locale: CampaignLocale;
}

export interface SendTestCampaignResponse {
  acceptedAt: string;
  warnings: string[];
}

export interface ScheduleCampaignRequest {
  confirm: true;
}

export interface ScheduleCampaignResponse {
  campaign: CampaignDraft;
  firstSendAt: string;
}

export interface ArchiveCampaignRequest {
  confirm: true;
}

export interface ArchiveCampaignResponse {
  campaign: CampaignDraft;
}

export interface UpsertCampaignDraftRequest {
  name: string;
  goal: string;
  channel: 'push';
  audience: CampaignAudienceDefinition;
  timing: CampaignTimingRule;
  content: Record<CampaignLocale, CampaignLocaleContent>;
}
