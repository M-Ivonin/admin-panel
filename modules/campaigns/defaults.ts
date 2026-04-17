/**
 * Live-safe draft defaults for campaigns.
 */

import { RetentionStage } from '@/lib/api/users';
import type {
  CampaignDeeplinkTarget,
  CampaignDraft,
  CampaignJourneyStep,
  CampaignLocale,
  CampaignStepLocaleContent,
  CampaignStepContentMap,
} from '@/modules/campaigns/contracts';
import {
  buildCampaignScheduleRule,
  DEFAULT_CAMPAIGN_MAX_OCCURRENCES,
  DEFAULT_CAMPAIGN_SCHEDULE,
  getDefaultCampaignScheduleStartDate,
} from '@/modules/campaigns/schedule';

const DEFAULT_LOCALES: CampaignLocale[] = ['en', 'es', 'pt'];

export function createScheduledCampaignTrigger(
  referenceDate = new Date()
): Extract<CampaignDraft['trigger'], { type: 'scheduled_recurring' }> {
  return {
    type: 'scheduled_recurring',
    recurrenceRule: buildCampaignScheduleRule(DEFAULT_CAMPAIGN_SCHEDULE),
    timezoneMode: 'user_local',
    startDate: getDefaultCampaignScheduleStartDate(referenceDate),
    maxOccurrences: DEFAULT_CAMPAIGN_MAX_OCCURRENCES,
  };
}

/**
 * Creates one blank localized content map for a specific journey step.
 */
export function createBlankStepLocaleMap(
  deeplinkTarget: CampaignDeeplinkTarget | null
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
    exitRule: 'stop_on_goal',
    frequencyCapHours: 24,
  };
}

/**
 * Creates the canonical empty campaign draft used in create mode.
 */
export function createEmptyCampaignDraft(): CampaignDraft {
  const firstStep = createJourneyStep(1);
  const content: CampaignStepContentMap = {
    [firstStep.stepKey]: createBlankStepLocaleMap(null),
  };

  return {
    id: null,
    name: '',
    goal: '',
    goalDefinition: null,
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
