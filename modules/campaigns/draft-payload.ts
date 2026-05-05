import type {
  CampaignDraft,
  CampaignGoalDefinition,
  UpsertCampaignDraftRequest,
} from '@/modules/campaigns/contracts';
import { withInAppExpirationDefault } from '@/modules/campaigns/journey-step-draft';

export function normalizeCampaignGoalDefinition(
  goalDefinition: CampaignGoalDefinition | null
): CampaignGoalDefinition | null {
  if (!goalDefinition) {
    return null;
  }

  return {
    ...goalDefinition,
    rewardPoints: goalDefinition.rewardPoints ?? 0,
  };
}

export function buildUpsertCampaignDraftPayload(
  draft: CampaignDraft
): UpsertCampaignDraftRequest {
  return {
    name: draft.name,
    goal: draft.goal,
    goalDefinition: normalizeCampaignGoalDefinition(draft.goalDefinition),
    channel: draft.channel,
    audience: draft.audience,
    trigger: draft.trigger,
    journey: {
      steps: draft.journey.steps.map(withInAppExpirationDefault),
    },
    content: draft.content,
  };
}
