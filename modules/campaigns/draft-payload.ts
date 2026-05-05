import type {
  CampaignDraft,
  CampaignGoalDefinition,
  UpsertCampaignDraftRequest,
} from '@/modules/campaigns/contracts';

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
    journey: draft.journey,
    content: draft.content,
  };
}
