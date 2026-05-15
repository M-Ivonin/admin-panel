/**
 * Live-safe draft defaults for campaigns.
 */

import { RetentionStage } from '@/lib/api/users';
import type {
  CampaignDraft,
  CampaignLocale,
  CampaignStepContentMap,
} from '@/modules/campaigns/contracts';
import {
  createBlankStepLocaleMap,
  createJourneyStep,
} from '@/modules/campaigns/journey-step-draft';
import {
  buildCampaignScheduleRule,
  DEFAULT_CAMPAIGN_MAX_OCCURRENCES,
  DEFAULT_CAMPAIGN_SCHEDULE,
  getDefaultCampaignScheduleStartDate,
} from '@/modules/campaigns/schedule';

const DEFAULT_LOCALES: CampaignLocale[] = ['en', 'es', 'pt'];

export { createBlankStepLocaleMap, createJourneyStep };

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
    targetApps: ['SirBro'],
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
