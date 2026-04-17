/**
 * Test-only in-memory repository for campaigns UI coverage.
 */

import { RetentionStage } from '@/lib/api/users';
import type {
  ArchiveCampaignResponse,
  CampaignAudienceDefinition,
  CampaignDraft,
  CampaignListItem,
  CampaignLocale,
  CampaignSavedSegmentSummary,
  CampaignStatus,
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
  createInitialCampaignEditorCatalog,
  createInitialCampaignsOverviewResponse,
  createSavedSegmentDefinitionMap,
} from '@/test-support/campaigns/mock-data';
import { type CampaignsRepository } from '@/modules/campaigns/repository';
import { getCampaignLocaleReadiness } from '@/modules/campaigns/selectors';

interface MockCampaignsState {
  drafts: Record<string, CampaignDraft>;
  overviewItems: CampaignListItem[];
  stats: ReturnType<typeof createInitialCampaignsOverviewResponse>['stats'];
  catalog: ReturnType<typeof createInitialCampaignEditorCatalog>;
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
};

const LOCALE_SHARES: Record<CampaignLocale, number> = {
  en: 0.5,
  es: 0.3,
  pt: 0.2,
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createInitialState(): MockCampaignsState {
  const overview = createInitialCampaignsOverviewResponse();

  return {
    drafts: createInitialCampaignDraftMap(),
    overviewItems: overview.items,
    stats: overview.stats,
    catalog: createInitialCampaignEditorCatalog(),
    savedSegmentDefinitions: createSavedSegmentDefinitionMap(),
    campaignSequence: 1,
    segmentSequence: 1,
    templateSequence: 1,
    timestampOffsetMinutes: 0,
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

  if (audience.suppression.excludeConvertedUsers) {
    postStageCount *= 0.88;
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
    const savedSegment = state.catalog.savedSegments.find(
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
      return { label: 'First send', timestamp: '2026-04-17T08:30:00.000Z' };
    }

    const nextDate = new Date(MOCK_TIME_ANCHOR_ISO);
    nextDate.setUTCMinutes(nextDate.getUTCMinutes() + delayMinutes);
    return { label: 'First send', timestamp: nextDate.toISOString() };
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
    localeReadiness: getCampaignLocaleReadiness(draft.content),
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
    return clone(state.catalog);
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

    state.catalog.savedSegments = [segment, ...state.catalog.savedSegments];
    state.savedSegmentDefinitions[segment.id] = clone({
      ...input.audience,
      segmentSource: 'saved_segment',
      sourceSegmentId: segment.id,
    });

    return { segment: clone(segment) };
  },

  async saveTemplate(input: SaveTemplateRequest): Promise<SaveTemplateResponse> {
    const template = {
      id: nextTemplateId(),
      name: input.name,
      description:
        input.description?.trim() || 'Saved from the current campaign builder.',
      definition: clone(input.definition),
      source: 'saved' as const,
    };

    state.catalog.scenarioTemplates = [
      template,
      ...state.catalog.scenarioTemplates,
    ];

    return { template: clone(template) };
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
        ? '2026-04-17T08:30:00.000Z'
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
