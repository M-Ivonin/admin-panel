/**
 * Live-safe draft defaults and saved-segment helpers for campaigns.
 */

import { RetentionStage } from '@/lib/api/users';
import type {
  CampaignAudienceDefinition,
  CampaignDeeplinkTarget,
  CampaignDraft,
  CampaignEditorCatalog,
  CampaignJourneyStep,
  CampaignLocale,
  CampaignSavedSegmentSummary,
  CampaignStepLocaleContent,
  CampaignStepContentMap,
} from '@/modules/campaigns/contracts';

const DEFAULT_LOCALES: CampaignLocale[] = ['en', 'es', 'pt'];
const DEFAULT_DEEPLINK_TARGET: CampaignDeeplinkTarget = 'continue_onboarding';

/**
 * Creates one blank localized content map for a specific journey step.
 */
export function createBlankStepLocaleMap(
  deeplinkTarget: CampaignDeeplinkTarget
): Record<CampaignLocale, CampaignStepLocaleContent> {
  return {
    en: {
      title: '',
      body: '',
      fallbackFirstName: '',
      deeplinkTarget,
    },
    es: {
      title: '',
      body: '',
      fallbackFirstName: '',
      deeplinkTarget,
    },
    pt: {
      title: '',
      body: '',
      fallbackFirstName: '',
      deeplinkTarget,
    },
  };
}

/**
 * Creates one append-only journey step using the approved defaults.
 */
export function createJourneyStep(order: number): CampaignJourneyStep {
  return {
    stepKey: `step_${order}`,
    order,
    anchor: order === 1 ? { type: 'trigger' } : { type: 'previous_step' },
    delayMinutes: order === 1 ? 20 : 60,
    sameLocalTimeNextDay: false,
    sendWindowStart: '08:00',
    sendWindowEnd: '22:00',
    exitRule: 'none',
    frequencyCapHours: 24,
  };
}

function getDefaultDeeplinkTarget(
  catalog?: CampaignEditorCatalog
): CampaignDeeplinkTarget {
  return catalog?.deeplinkOptions[0]?.target ?? DEFAULT_DEEPLINK_TARGET;
}

/**
 * Creates the canonical empty campaign draft used in create mode.
 */
export function createEmptyCampaignDraft(
  catalog?: CampaignEditorCatalog
): CampaignDraft {
  const deeplinkTarget = getDefaultDeeplinkTarget(catalog);
  const firstStep = createJourneyStep(1);
  const content: CampaignStepContentMap = {
    [firstStep.stepKey]: createBlankStepLocaleMap(deeplinkTarget),
  };

  return {
    id: null,
    name: '',
    goal: '',
    channel: 'push',
    status: 'draft',
    audience: {
      segmentSource: 'manual_rules',
      sourceSegmentId: null,
      criteria: {
        retentionStages: [RetentionStage.NEW],
        userIds: [],
        locales: [...DEFAULT_LOCALES],
      },
      suppression: {
        excludeConvertedUsers: true,
        excludeUsersWithoutPushOpens: false,
      },
    },
    trigger: {
      type: 'state_based',
      qualificationMode: 'when_user_matches_audience',
      reentryCooldownHours: 24,
    },
    journey: {
      steps: [firstStep],
    },
    content,
    updatedAt: null,
    createdBy: null,
  };
}

/**
 * Applies a saved segment to the current audience while preserving the new trigger/journey contract.
 */
export function applySavedSegmentSelection(
  audience: CampaignAudienceDefinition,
  segment: CampaignSavedSegmentSummary
): CampaignAudienceDefinition {
  if (segment.audienceDefinition) {
    return {
      ...segment.audienceDefinition,
      segmentSource: 'saved_segment',
      sourceSegmentId: segment.id,
    };
  }

  return {
    ...audience,
    segmentSource: 'saved_segment',
    sourceSegmentId: segment.id,
  };
}
