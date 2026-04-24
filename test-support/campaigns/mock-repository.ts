/**
 * Test-only in-memory repository for campaigns UI coverage.
 */

import { RetentionStage } from '@/lib/api/users';
import type {
  ArchiveCampaignResponse,
  CampaignAudienceDefinition,
  CampaignDeeplinkOption,
  CampaignDraft,
  CampaignEditorCatalog,
  CampaignGoalOption,
  CampaignListItem,
  CampaignLocale,
  CampaignScenarioTemplateSummary,
  CampaignSavedSegmentSummary,
  CampaignSourceEventOption,
  CampaignStatus,
  CampaignTokenDefinition,
  EstimateAudienceRequest,
  EstimateAudienceResponse,
  GetCampaignsOverviewParams,
  SaveSegmentRequest,
  SaveTemplateRequest,
  SaveTemplateResponse,
  ScheduleCampaignResponse,
  SendTestCampaignResponse,
  UpsertCampaignDraftRequest,
} from '@/modules/campaigns/contracts';
import {
  MOCK_TIME_ANCHOR_ISO,
  createInitialCampaignDraftMap,
  createInitialCampaignsOverviewResponse,
  createInitialSavedSegments,
  createInitialScenarioTemplates,
  createSavedSegmentDefinitionMap,
} from '@/test-support/campaigns/mock-data';
import { type CampaignsRepository } from '@/modules/campaigns/repository';
import {
  canScheduleCampaign,
  getCampaignLocaleReadiness,
} from '@/modules/campaigns/selectors';

interface MockCampaignsState {
  drafts: Record<string, CampaignDraft>;
  overviewItems: CampaignListItem[];
  stats: ReturnType<typeof createInitialCampaignsOverviewResponse>['stats'];
  savedSegments: CampaignSavedSegmentSummary[];
  scenarioTemplates: CampaignScenarioTemplateSummary[];
  savedSegmentDefinitions: Record<string, CampaignAudienceDefinition>;
  campaignSequence: number;
  segmentSequence: number;
  templateSequence: number;
  timestampOffsetMinutes: number;
}

const STAGE_WEIGHTS: Record<RetentionStage, number> = {
  [RetentionStage.NEW]: 12480,
  [RetentionStage.CURRENT]: 9100,
  [RetentionStage.AT_RISK_WAU]: 11000,
  [RetentionStage.AT_RISK_MAU]: 7800,
  [RetentionStage.DEAD]: 5320,
  [RetentionStage.REACTIVATED]: 4120,
  [RetentionStage.RESURRECTED]: 2800,
  [RetentionStage.PRE_REG_ONBOARDING_INCOMPLETE]: 3200,
};

const LOCALE_SHARES: Record<CampaignLocale, number> = {
  en: 0.5,
  es: 0.3,
  pt: 0.2,
};

const EDITOR_TOKENS: CampaignTokenDefinition[] = [
  {
    key: 'first_name',
    token: '{{first_name}}',
    label: 'First name',
    requiresFallback: true,
    description: 'Personalizes the notification with the user first name.',
  },
  {
    key: 'favorite_team',
    token: '{{favorite_team}}',
    label: 'Favorite team',
    requiresFallback: false,
    description: 'Inserts the current favorite team name.',
  },
  {
    key: 'bonus_points',
    token: '{{bonus_points}}',
    label: 'Bonus points',
    requiresFallback: false,
    description: 'Inserts the current bonus points balance.',
  },
];

const EDITOR_DEEPLINK_OPTIONS: CampaignDeeplinkOption[] = [
  {
    target: 'continue_onboarding',
    label: 'Continue onboarding',
    path: '/setup-content-preferences',
  },
  {
    target: 'open_match_center',
    label: 'Open match center',
    path: '/matches',
  },
  {
    target: 'open_rewards_wallet',
    label: 'Open rewards wallet',
    path: '/profile',
  },
];

const EDITOR_SOURCE_EVENTS: CampaignSourceEventOption[] = [
  {
    eventKey: 'app_opened',
    producerKey: 'crm_source_events',
    label: 'Opened app',
    description:
      'User opened the app and the mobile app sent the authenticated CRM source event.',
  },
  {
    eventKey: 'onboarding_completed',
    producerKey: 'crm_source_events',
    label: 'Completed onboarding',
    description:
      'User completed onboarding and the mobile app sent the public CRM source event.',
  },
  {
    eventKey: 'subscription_started',
    producerKey: 'crm_source_events',
    label: 'Started subscription',
    description:
      'User started a paid subscription and the backend emitted the CRM source event from a store purchase or Stripe invoice.',
  },
  {
    eventKey: 'subscription_renewed',
    producerKey: 'crm_source_events',
    label: 'Renewed subscription',
    description:
      'User renewed an active subscription and the backend emitted the CRM source event from a store or Stripe renewal.',
  },
  {
    eventKey: 'in_app_purchase_completed',
    producerKey: 'crm_source_events',
    label: 'Completed in-app purchase',
    description:
      'User completed a one-time in-app purchase and the backend emitted the CRM source event from the store verification flow.',
  },
  {
    eventKey: 'daily_streak_reminder',
    producerKey: 'crm_source_events',
    label: 'Daily streak reminder',
    description:
      'User had a streak yesterday but no activity today, and the CRM scheduler emitted the reminder source event.',
  },
  {
    eventKey: 'weekly_quest_urgency',
    producerKey: 'crm_source_events',
    label: 'Weekly quest urgency',
    description:
      'User is close to finishing the weekly quest and the CRM scheduler emitted the urgency source event.',
  },
  {
    eventKey: 'favorite_match_kickoff',
    producerKey: 'channels_favorite_matches',
    label: 'Favorite match kickoff',
    description:
      'A favorite team or league match is close to kickoff and the channels service emitted a source event.',
  },
  {
    eventKey: 'weekly_stats_digest',
    producerKey: 'crm_source_events',
    label: 'Weekly stats digest',
    description:
      'Weekly stats digest is ready for the user and the CRM scheduler emitted the digest source event.',
  },
  {
    eventKey: 'unread_social_activity',
    producerKey: 'crm_source_events',
    label: 'Unread social activity',
    description:
      'User has unread channel activity and the CRM scheduler emitted the social activity source event.',
  },
  {
    eventKey: 'live_challenge_starting_soon',
    producerKey: 'crm_source_events',
    label: 'Live challenge starting soon',
    description:
      'A joined live challenge starts soon and the backend emitted the CRM source event.',
  },
  {
    eventKey: 'live_challenge_results',
    producerKey: 'crm_source_events',
    label: 'Live challenge results available',
    description:
      'A live challenge finished and the backend emitted the results source event.',
  },
];

const EDITOR_GOAL_OPTIONS: CampaignGoalOption[] = [
  {
    goalKey: 'app_opened:global_state_event',
    label: 'Opened app',
    eventKey: 'app_opened',
    attributionMode: 'global_state_event',
  },
  {
    goalKey: 'onboarding_completed:global_state_event',
    label: 'Onboarding completed',
    eventKey: 'onboarding_completed',
    attributionMode: 'global_state_event',
  },
  {
    goalKey: 'match_center_opened:trace_required_response',
    label: 'Match center opened',
    eventKey: 'match_center_opened',
    attributionMode: 'trace_required_response',
  },
  {
    goalKey: 'rewards_wallet_opened:trace_required_response',
    label: 'Rewards wallet opened',
    eventKey: 'rewards_wallet_opened',
    attributionMode: 'trace_required_response',
  },
  {
    goalKey: 'subscription_started:global_state_event',
    label: 'Started subscription',
    eventKey: 'subscription_started',
    attributionMode: 'global_state_event',
  },
  {
    goalKey: 'in_app_purchase_completed:global_state_event',
    label: 'Completed in-app purchase',
    eventKey: 'in_app_purchase_completed',
    attributionMode: 'global_state_event',
  },
  {
    goalKey: 'stage_reactivated:global_state_event',
    label: 'Reactivated after 7-29 days',
    eventKey: 'stage_reactivated',
    attributionMode: 'global_state_event',
  },
  {
    goalKey: 'stage_resurrected:global_state_event',
    label: 'Reactivated after 30+ days',
    eventKey: 'stage_resurrected',
    attributionMode: 'global_state_event',
  },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildRetentionStageOptions(
  savedSegments: CampaignSavedSegmentSummary[]
): CampaignEditorCatalog['retentionStageOptions'] {
  return savedSegments
    .flatMap((segment) => {
      const stages = segment.audienceDefinition?.criteria.retentionStages ?? [];
      const [stage] = stages;

      if (
        stages.length !== 1 ||
        !stage ||
        segment.displayOrder === null ||
        segment.displayOrder === undefined ||
        !segment.chipColor
      ) {
        return [];
      }

      return [
        {
          stage,
          label: segment.name,
          displayOrder: segment.displayOrder,
          chipColor: segment.chipColor,
        },
      ];
    })
    .sort(
      (left, right) =>
        left.displayOrder - right.displayOrder ||
        left.label.localeCompare(right.label)
    );
}

function createInitialState(): MockCampaignsState {
  const overview = createInitialCampaignsOverviewResponse();

  return {
    drafts: createInitialCampaignDraftMap(),
    overviewItems: overview.items,
    stats: overview.stats,
    savedSegments: createInitialSavedSegments(),
    scenarioTemplates: createInitialScenarioTemplates(),
    savedSegmentDefinitions: createSavedSegmentDefinitionMap(),
    campaignSequence: 1,
    segmentSequence: 1,
    templateSequence: 1,
    timestampOffsetMinutes: 0,
  };
}

function buildEditorCatalog(): CampaignEditorCatalog {
  const savedSegments = clone(state.savedSegments);

  return {
    savedSegments,
    scenarioTemplates: clone(state.scenarioTemplates),
    retentionStageOptions: buildRetentionStageOptions(savedSegments),
    tokens: clone(EDITOR_TOKENS),
    deeplinkOptions: clone(EDITOR_DEEPLINK_OPTIONS),
    sourceEvents: clone(EDITOR_SOURCE_EVENTS),
    goalOptions: clone(EDITOR_GOAL_OPTIONS),
  };
}

let state = createInitialState();

function statusCountKey(
  status: CampaignStatus
): keyof typeof state.stats | null {
  if (status === 'active') {
    return 'activeCampaigns';
  }

  if (status === 'paused') {
    return 'pausedCampaigns';
  }

  if (status === 'scheduled') {
    return 'scheduledCampaigns';
  }

  return null;
}

function incrementStatusCounts(previous: CampaignStatus, next: CampaignStatus) {
  const previousKey = statusCountKey(previous);
  const nextKey = statusCountKey(next);

  if (previousKey) {
    state.stats[previousKey] = Math.max(0, state.stats[previousKey] - 1);
  }

  if (nextKey) {
    state.stats[nextKey] += 1;
  }
}

function nextCampaignId(): string {
  const identifier = `cmp_local_${String(state.campaignSequence).padStart(3, '0')}`;
  state.campaignSequence += 1;
  return identifier;
}

function nextSegmentId(): string {
  const identifier = `seg_local_${String(state.segmentSequence).padStart(3, '0')}`;
  state.segmentSequence += 1;
  return identifier;
}

function nextTemplateId(): string {
  const identifier = `tpl_local_${String(state.templateSequence).padStart(3, '0')}`;
  state.templateSequence += 1;
  return identifier;
}

function nextTimestampIso(stepMinutes: number): string {
  state.timestampOffsetMinutes += stepMinutes;
  const nextDate = new Date(MOCK_TIME_ANCHOR_ISO);
  nextDate.setUTCMinutes(
    nextDate.getUTCMinutes() + state.timestampOffsetMinutes
  );
  return nextDate.toISOString();
}

function getAudienceEstimate(
  audience: CampaignAudienceDefinition
): EstimateAudienceResponse {
  const warnings: string[] = [];
  const uniqueStages = [...new Set(audience.criteria.retentionStages)];

  if (uniqueStages.length === 0) {
    return {
      reachableUsers: 0,
      warnings: ['Select at least one retention stage.'],
      byRetentionStage: {},
      byLocale: {},
    };
  }

  if (audience.criteria.locales.length === 0) {
    return {
      reachableUsers: 0,
      warnings: ['Select at least one locale.'],
      byRetentionStage: Object.fromEntries(
        uniqueStages.map((stage) => [stage, STAGE_WEIGHTS[stage]])
      ) as Partial<Record<RetentionStage, number>>,
      byLocale: {},
    };
  }

  const baseCount = uniqueStages.reduce(
    (sum, stage) => sum + STAGE_WEIGHTS[stage],
    0
  );

  let postStageCount = baseCount;

  if (audience.criteria.userIds.length > 0) {
    postStageCount = Math.min(postStageCount, audience.criteria.userIds.length);
  }

  if (audience.suppression.excludeUsersWithoutPushOpens) {
    postStageCount *= 0.86;
  }

  const selectedLocaleShare = audience.criteria.locales.reduce(
    (sum, locale) => sum + LOCALE_SHARES[locale],
    0
  );
  const reachableUsers = Math.floor(postStageCount * selectedLocaleShare);

  const byLocale: Partial<Record<CampaignLocale, number>> = {};
  let remaining = reachableUsers;

  audience.criteria.locales.forEach((locale, index) => {
    if (index === audience.criteria.locales.length - 1) {
      byLocale[locale] = remaining;
      return;
    }

    const localeCount = Math.floor(postStageCount * LOCALE_SHARES[locale]);
    byLocale[locale] = localeCount;
    remaining -= localeCount;
  });

  if (reachableUsers === 0) {
    warnings.push('Estimated audience is empty for the selected rules.');
  }

  return {
    reachableUsers,
    warnings,
    byRetentionStage: Object.fromEntries(
      uniqueStages.map((stage) => [stage, STAGE_WEIGHTS[stage]])
    ) as Partial<Record<RetentionStage, number>>,
    byLocale,
  };
}

function buildAudienceLabel(draft: CampaignDraft): string {
  const [primaryStage] = draft.audience.criteria.retentionStages;

  if (
    draft.audience.segmentSource === 'saved_segment' &&
    draft.audience.sourceSegmentId
  ) {
    const savedSegment = state.savedSegments.find(
      (segment) => segment.id === draft.audience.sourceSegmentId
    );
    if (savedSegment) {
      return savedSegment.name;
    }
  }

  switch (primaryStage) {
    case RetentionStage.NEW:
      return 'New users';
    case RetentionStage.CURRENT:
      return 'Current users';
    case RetentionStage.AT_RISK_WAU:
      return 'At-risk WAU';
    case RetentionStage.AT_RISK_MAU:
      return 'At-risk MAU';
    case RetentionStage.DEAD:
      return 'Dead users';
    case RetentionStage.REACTIVATED:
      return 'Reactivated';
    case RetentionStage.RESURRECTED:
      return 'Resurrected';
    case RetentionStage.PRE_REG_ONBOARDING_INCOMPLETE:
      return 'Pre-Reg Onboarding Incomplete';
    default:
      return 'Selected cohort';
  }
}

function buildTimingSummary(
  draft: CampaignDraft,
  fallbackTimestamp: string | null
): CampaignListItem['timing'] {
  const firstStep = draft.journey.steps[0];
  const delayMinutes = firstStep?.delayMinutes ?? 0;

  if (draft.status === 'paused') {
    return { label: 'Last send', timestamp: fallbackTimestamp };
  }

  if (draft.status === 'scheduled') {
    if (draft.trigger.type === 'scheduled_recurring') {
      return {
        label: 'First evaluation',
        timestamp: '2026-04-17T08:30:00.000Z',
      };
    }

    const nextDate = new Date(MOCK_TIME_ANCHOR_ISO);
    nextDate.setUTCMinutes(nextDate.getUTCMinutes() + delayMinutes);
    return { label: 'First send', timestamp: nextDate.toISOString() };
  }

  if (draft.trigger.type === 'scheduled_recurring') {
    return {
      label: 'Next evaluation',
      timestamp: '2026-04-16T12:15:00.000Z',
    };
  }

  const nextDate = new Date(MOCK_TIME_ANCHOR_ISO);
  nextDate.setUTCMinutes(nextDate.getUTCMinutes() + delayMinutes);
  return { label: 'Next send', timestamp: nextDate.toISOString() };
}

function formatCreatedBy(createdBy: string | null): string {
  if (!createdBy) {
    return 'Spec Local User';
  }

  return createdBy
    .split(/[_\-\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getOverviewLocaleReadiness(
  draft: CampaignDraft
): CampaignListItem['localeReadiness'] {
  const readiness = getCampaignLocaleReadiness(
    draft.content,
    draft.audience.criteria.locales
  );

  return draft.audience.criteria.locales.reduce(
    (accumulator, locale) => ({
      ...accumulator,
      [locale]: readiness[locale],
    }),
    {} as CampaignListItem['localeReadiness']
  );
}

function upsertOverviewItem(draft: CampaignDraft, activityLabel: string) {
  const estimate = getAudienceEstimate(draft.audience);
  const existingItemIndex = state.overviewItems.findIndex(
    (item) => item.id === draft.id
  );
  const existingItem =
    existingItemIndex >= 0 ? state.overviewItems[existingItemIndex] : null;

  const nextItem: CampaignListItem = {
    id: draft.id ?? nextCampaignId(),
    name: draft.name,
    goal: draft.goal,
    channel: draft.channel,
    status: draft.status,
    entryTriggerType: draft.trigger.type,
    audience: {
      estimate: estimate.reachableUsers,
      label: buildAudienceLabel(draft),
    },
    timing: buildTimingSummary(
      draft,
      existingItem?.timing.timestamp ?? draft.updatedAt
    ),
    progress: existingItem?.progress ?? {
      sentCount: 0,
      totalCount: estimate.reachableUsers,
      progressPercent: 0,
    },
    metric: existingItem?.metric ?? {
      label: 'goal',
      value: draft.goal,
    },
    owner: {
      ownerName:
        existingItem?.owner.ownerName ?? formatCreatedBy(draft.createdBy),
      activityLabel,
    },
    updatedAt: draft.updatedAt ?? nextTimestampIso(1),
    localeReadiness: getOverviewLocaleReadiness(draft),
  };

  if (existingItemIndex >= 0) {
    state.overviewItems[existingItemIndex] = nextItem;
  } else {
    state.overviewItems = [nextItem, ...state.overviewItems];
  }
}

function toDraft(
  id: string,
  input: UpsertCampaignDraftRequest,
  status: CampaignDraft['status'],
  createdBy: string | null,
  updatedAt: string
): CampaignDraft {
  return {
    id,
    name: input.name,
    goal: input.goal,
    goalDefinition: input.goalDefinition,
    channel: input.channel,
    status,
    audience: clone(input.audience),
    trigger: clone(input.trigger),
    journey: clone(input.journey),
    content: clone(input.content),
    updatedAt,
    createdBy,
  };
}

/**
 * Resets the in-memory repository to the seeded state for tests and live validation.
 */
export function resetMockCampaignsRepository() {
  state = createInitialState();
}

export const mockCampaignsRepository: CampaignsRepository = {
  async getCampaignsOverview(params: GetCampaignsOverviewParams) {
    const normalizedSearch = params.search.trim().toLowerCase();

    const filteredItems = state.overviewItems.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.goal.toLowerCase().includes(normalizedSearch) ||
        item.owner.ownerName.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        params.statuses.length === 0 || params.statuses.includes(item.status);

      const matchesTrigger =
        params.triggerTypes.length === 0 ||
        params.triggerTypes.includes(item.entryTriggerType);

      const matchesQuickView =
        params.quickView === null ||
        (params.quickView === 'active_now' && item.status === 'active') ||
        (params.quickView === 'recent_drafts' && item.status === 'draft') ||
        (params.quickView === 'needs_attention' &&
          Object.values(item.localeReadiness).some(
            (readiness) => readiness !== 'ready'
          ));

      return (
        matchesSearch && matchesStatus && matchesTrigger && matchesQuickView
      );
    });

    const startIndex = Math.max(0, (params.page - 1) * params.limit);
    const items = filteredItems.slice(startIndex, startIndex + params.limit);

    return {
      stats: clone(state.stats),
      items: clone(items),
      total: filteredItems.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.max(1, Math.ceil(filteredItems.length / params.limit)),
    };
  },

  async getEditorCatalog() {
    return buildEditorCatalog();
  },

  async getCampaign(id: string) {
    const draft = state.drafts[id];

    if (!draft) {
      throw new Error('Campaign not found');
    }

    return clone(draft);
  },

  async createCampaignDraft(input: UpsertCampaignDraftRequest) {
    const id = nextCampaignId();
    const updatedAt = nextTimestampIso(1);
    const draft = toDraft(id, input, 'draft', 'spec-local-user', updatedAt);

    state.drafts[id] = draft;
    upsertOverviewItem(draft, 'Updated just now');

    return clone(draft);
  },

  async updateCampaignDraft(id: string, input: UpsertCampaignDraftRequest) {
    const existing = state.drafts[id];

    if (!existing) {
      throw new Error('Campaign not found');
    }

    const updatedAt = nextTimestampIso(1);
    const draft = toDraft(
      id,
      input,
      existing.status,
      existing.createdBy,
      updatedAt
    );

    state.drafts[id] = draft;
    upsertOverviewItem(draft, 'Updated just now');

    return clone(draft);
  },

  async estimateAudience(input: EstimateAudienceRequest) {
    return getAudienceEstimate(input.audience);
  },

  async saveSegment(input: SaveSegmentRequest) {
    const estimate = getAudienceEstimate(input.audience);
    const segmentId = nextSegmentId();
    const segment: CampaignSavedSegmentSummary = {
      id: segmentId,
      name: input.name,
      description: `${estimate.reachableUsers.toLocaleString('en-US')} reachable · saved from builder`,
      audienceEstimate: estimate.reachableUsers,
      audienceDefinition: clone({
        ...input.audience,
        segmentSource: 'saved_segment',
        sourceSegmentId: segmentId,
      }),
      source: 'saved_segment',
    };

    state.savedSegments = [segment, ...state.savedSegments];
    state.savedSegmentDefinitions[segment.id] = clone({
      ...input.audience,
      segmentSource: 'saved_segment',
      sourceSegmentId: segment.id,
    });

    return { segment: clone(segment) };
  },

  async saveTemplate(
    input: SaveTemplateRequest
  ): Promise<SaveTemplateResponse> {
    const template = {
      id: nextTemplateId(),
      name: input.name,
      description:
        input.description?.trim() || 'Saved from the current campaign builder.',
      definition: clone(input.definition),
      source: 'saved' as const,
    };

    state.scenarioTemplates = [template, ...state.scenarioTemplates];

    return { template: clone(template) };
  },

  async updateTemplate(
    id: string,
    input: SaveTemplateRequest
  ): Promise<SaveTemplateResponse> {
    const existingTemplate = state.scenarioTemplates.find(
      (template) => template.id === id
    );

    if (!existingTemplate) {
      throw new Error('Campaign template not found');
    }

    const template = {
      ...existingTemplate,
      name: input.name,
      description:
        input.description?.trim() || 'Saved from the current campaign builder.',
      definition: clone(input.definition),
    };

    state.scenarioTemplates = state.scenarioTemplates.map((item) =>
      item.id === id ? template : item
    );

    return { template: clone(template) };
  },

  async deleteTemplate(id: string) {
    state.scenarioTemplates = state.scenarioTemplates.filter(
      (template) => template.id !== id
    );

    return { templateId: id };
  },

  async sendTestCampaign(id, input): Promise<SendTestCampaignResponse> {
    const draft = state.drafts[id];

    if (!draft) {
      throw new Error('Campaign not found');
    }

    const firstStepKey = draft.journey.steps[0]?.stepKey;
    if (!firstStepKey) {
      throw new Error('Campaign journey is empty');
    }

    const readiness = getCampaignLocaleReadiness({
      [firstStepKey]: draft.content[firstStepKey],
    });
    const warnings =
      readiness[input.locale] === 'ready'
        ? []
        : [`${input.locale.toUpperCase()} locale still needs review.`];

    return {
      acceptedAt: nextTimestampIso(1),
      warnings,
    };
  },

  async scheduleCampaign(id): Promise<ScheduleCampaignResponse> {
    const draft = state.drafts[id];

    if (!draft) {
      throw new Error('Campaign not found');
    }

    if (!canScheduleCampaign(draft)) {
      throw new Error('Campaign is not ready to schedule');
    }

    const previousStatus = draft.status;
    const updatedDraft = clone(draft);
    updatedDraft.status = 'scheduled';
    updatedDraft.updatedAt = nextTimestampIso(1);
    state.drafts[id] = updatedDraft;

    if (previousStatus !== 'scheduled') {
      incrementStatusCounts(previousStatus, 'scheduled');
    }

    const firstStep = updatedDraft.journey.steps[0];
    const firstSendAt =
      updatedDraft.trigger.type === 'scheduled_recurring'
        ? '2026-04-16T12:15:00.000Z'
        : new Date(
            new Date(MOCK_TIME_ANCHOR_ISO).getTime() +
              (firstStep?.delayMinutes ?? 0) * 60_000
          ).toISOString();

    upsertOverviewItem(updatedDraft, 'Scheduled just now');

    return {
      campaign: clone(updatedDraft),
      firstSendAt,
    };
  },

  async archiveCampaign(id): Promise<ArchiveCampaignResponse> {
    const draft = state.drafts[id];

    if (!draft) {
      throw new Error('Campaign not found');
    }

    const previousStatus = draft.status;
    const updatedDraft = clone(draft);
    updatedDraft.status = 'archived';
    updatedDraft.updatedAt = nextTimestampIso(1);
    state.drafts[id] = updatedDraft;

    if (previousStatus !== 'archived') {
      incrementStatusCounts(previousStatus, 'archived');
    }

    upsertOverviewItem(updatedDraft, 'Archived just now');

    return {
      campaign: clone(updatedDraft),
    };
  },
};

export const __private = {
  nextCampaignId,
  nextSegmentId,
  nextTimestampIso,
  getAudienceEstimate,
};
