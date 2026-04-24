/**
 * Shared contracts for the campaigns admin experience.
 */

import { RetentionStage } from '@/lib/api/users';

export const CAMPAIGN_GOAL_REWARD_POINTS_MAX = 2_147_483_647;

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

export type CampaignQualificationMode = 'when_user_matches_audience';
export type CampaignEventEntryMode = 'first_eligible_event';
export type CampaignTimezoneMode = 'user_local';

export type CampaignTokenKey = 'first_name' | 'favorite_team' | 'bonus_points';

export type CampaignDeeplinkTarget =
  | 'continue_onboarding'
  | 'open_home'
  | 'open_home_feed'
  | 'open_offers'
  | 'open_points_offers'
  | 'open_power_ups_offers'
  | 'open_passes_offers'
  | 'open_ai_chat'
  | 'open_match_center'
  | 'open_channels'
  | 'open_explore'
  | 'open_rewards_wallet'
  | 'open_support_chat'
  | 'open_notifications'
  | 'open_settings'
  | 'open_content_preferences';

export type CampaignQuickView =
  | 'active_now'
  | 'needs_attention'
  | 'recent_drafts';

export type CampaignStatsPeriod =
  | 'all_time'
  | 'last_24_hours'
  | 'last_7_days'
  | 'custom';

export type CampaignSourceEventKey =
  | 'app_opened'
  | 'onboarding_completed'
  | 'match_center_opened'
  | 'rewards_wallet_opened'
  | 'subscription_started'
  | 'subscription_renewed'
  | 'in_app_purchase_completed'
  | 'daily_streak_reminder'
  | 'weekly_quest_urgency'
  | 'favorite_match_kickoff'
  | 'weekly_stats_digest'
  | 'unread_social_activity'
  | 'live_challenge_starting_soon'
  | 'live_challenge_results'
  | 'stage_at_risk_wau'
  | 'stage_at_risk_mau'
  | 'stage_dead_user'
  | 'stage_reactivated'
  | 'stage_resurrected';

export type CampaignSourceEventProducerKey =
  | 'crm_source_events'
  | 'channels_favorite_matches';

export type CampaignJourneyExitRule = 'none' | 'stop_on_goal';

export interface CampaignOverviewStats {
  activeCampaigns: number;
  pausedCampaigns: number;
  scheduledCampaigns: number;
  sentToday: number;
  failedToday?: number;
  attemptedToday?: number;
  deliveredRateToday?: number;
  deliveredRate: number;
  attemptedTotal?: number;
  deliveredTotal?: number;
  failedTotal?: number;
  openedTotal?: number;
  avgCtr: number;
  ctrDeltaVsPrev7d: number;
  reachInProgress: number;
}

export interface CampaignListAudienceSummary {
  estimate: number | null;
  currentEstimate: number | null;
  label: string;
}

export interface CampaignListTimingSummary {
  label: string;
  timestamp: string | null;
}

export interface CampaignListProgressSummary {
  sentCount: number | null;
  totalCount: number | null;
  failedCount?: number | null;
  skippedCount?: number | null;
  inProgressCount?: number | null;
  openCount?: number | null;
  uniqueRecipientCount?: number | null;
  journeyInstanceCount?: number | null;
  deliveryRowCount?: number | null;
  failureReasons?: CampaignFailureReasonSummary[] | null;
  deliveredRate?: number | null;
  ctr?: number | null;
  progressPercent: number | null;
}

export interface CampaignFailureReasonSummary {
  reason: string;
  count: number;
}

export interface CampaignListMetricSummary {
  label: 'ctr' | 'goal';
  value: string;
  detail?: string | null;
  reachedCount?: number | null;
  journeyCount?: number | null;
  attributionMode?: CampaignGoalAttributionMode | null;
  traceGoalEventCount?: number | null;
  untracedGoalEventCount?: number | null;
  sourceEventsWithoutUserCount?: number | null;
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
  localeReadiness: Partial<Record<CampaignLocale, CampaignReadiness>>;
}

export interface GetCampaignsOverviewParams {
  page: number;
  limit: number;
  search: string;
  statuses: CampaignStatus[];
  triggerTypes: CampaignEntryTriggerType[];
  quickView: CampaignQuickView | null;
  statsPeriod: CampaignStatsPeriod;
  statsFrom?: string;
  statsTo?: string;
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
  audienceDefinition?: CampaignAudienceDefinition;
  displayOrder?: number | null;
  chipColor?: string | null;
  source: 'saved_segment' | 'template_segment';
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

export interface CampaignSourceEventOption {
  eventKey: CampaignSourceEventKey;
  producerKey: CampaignSourceEventProducerKey;
  label: string;
  description: string;
}

export interface CampaignTemplateDefinition {
  name: string;
  goal: string;
  goalDefinition: CampaignGoalDefinition | null;
  channel: CampaignChannel;
  audience: CampaignAudienceDefinition;
  trigger: CampaignTriggerDefinition;
  journey: CampaignJourneyDefinition;
  content: CampaignStepContentMap;
}

export type CampaignScenarioTemplateSource = 'shipped' | 'saved';

export interface CampaignScenarioTemplateSummary {
  id: string;
  name: string;
  description: string;
  definition: CampaignTemplateDefinition;
  source: CampaignScenarioTemplateSource;
}

export interface CampaignRetentionStageOption {
  stage: RetentionStage;
  label: string;
  displayOrder: number;
  chipColor: string;
}

export interface CampaignEditorCatalog {
  savedSegments: CampaignSavedSegmentSummary[];
  scenarioTemplates: CampaignScenarioTemplateSummary[];
  retentionStageOptions: CampaignRetentionStageOption[];
  tokens: CampaignTokenDefinition[];
  deeplinkOptions: CampaignDeeplinkOption[];
  sourceEvents: CampaignSourceEventOption[];
  goalOptions: CampaignGoalOption[];
}

export interface CampaignAudienceCriteria {
  retentionStages: RetentionStage[];
  userIds: string[];
  locales: CampaignLocale[];
}

export interface CampaignSuppressionRules {
  excludeUsersWithoutPushOpens: boolean;
}

export interface CampaignAudienceDefinition {
  segmentSource: CampaignSegmentSource;
  sourceSegmentId: string | null;
  criteria: CampaignAudienceCriteria;
  suppression: CampaignSuppressionRules;
}

export type CampaignTriggerDefinition =
  | {
      type: 'state_based';
      qualificationMode: CampaignQualificationMode;
      reentryCooldownHours: number | null;
    }
  | {
      type: 'event_based';
      eventKey: CampaignSourceEventKey;
      producerKey: CampaignSourceEventProducerKey;
      entryMode: CampaignEventEntryMode;
      reentryCooldownHours: number | null;
    }
  | {
      type: 'scheduled_recurring';
      recurrenceRule: string;
      timezoneMode: CampaignTimezoneMode;
      startDate?: string | null;
      maxOccurrences?: number | null;
    };

export type CampaignJourneyAnchor =
  | { type: 'trigger' }
  | { type: 'previous_step' };

export interface CampaignJourneyStep {
  stepKey: string;
  order: number;
  anchor: CampaignJourneyAnchor;
  delayMinutes: number | null;
  sameLocalTimeNextDay: boolean;
  sendWindowStart: string;
  sendWindowEnd: string;
  exitRule: CampaignJourneyExitRule;
  frequencyCapHours: number | null;
}

export interface CampaignJourneyDefinition {
  steps: CampaignJourneyStep[];
}

export type CampaignGoalAttributionMode =
  | 'global_state_event'
  | 'trace_required_response';

export interface CampaignGoalDefinition {
  eventKey: CampaignSourceEventKey;
  attributionMode: CampaignGoalAttributionMode;
  rewardPoints?: number;
}

export interface CampaignGoalOption {
  goalKey: string;
  label: string;
  eventKey: CampaignSourceEventKey;
  attributionMode: CampaignGoalAttributionMode;
}

export interface CampaignStepLocaleContent {
  title: string;
  body: string;
  fallbackFirstName: string;
  deeplinkTarget: CampaignDeeplinkTarget | null;
}

export type CampaignStepContentMap = Record<
  string,
  Record<CampaignLocale, CampaignStepLocaleContent>
>;

export interface CampaignDraft {
  id: string | null;
  name: string;
  goal: string;
  goalDefinition: CampaignGoalDefinition | null;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience: CampaignAudienceDefinition;
  trigger: CampaignTriggerDefinition;
  journey: CampaignJourneyDefinition;
  content: CampaignStepContentMap;
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

export interface SaveTemplateRequest {
  name: string;
  description?: string;
  definition: UpsertCampaignDraftRequest;
}

export interface SaveTemplateResponse {
  template: CampaignScenarioTemplateSummary;
}

export type UpdateTemplateRequest = SaveTemplateRequest;

export type UpdateTemplateResponse = SaveTemplateResponse;

export interface DeleteTemplateResponse {
  templateId: string;
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
  goalDefinition: CampaignGoalDefinition | null;
  channel: 'push';
  audience: CampaignAudienceDefinition;
  trigger: CampaignTriggerDefinition;
  journey: CampaignJourneyDefinition;
  content: CampaignStepContentMap;
}
