/**
 * Owns editor-facing journey step drafts while preserving the persisted
 * campaign shape expected by the API.
 */

import type {
  CampaignDeeplinkTarget,
  CampaignDraft,
  CampaignJourneyStep,
  CampaignJourneyStepDraft,
  CampaignLocale,
  CampaignStepLocaleContent,
} from '@/modules/campaigns/contracts';

export const DEFAULT_CAMPAIGN_IN_APP_EXPIRATION_MINUTES = 1440;

export type CampaignJourneyStepDraftPatch = Partial<
  Omit<CampaignJourneyStep, 'stepKey' | 'order' | 'anchor'>
>;

/**
 * Creates one blank localized Delivery content map for a Journey step.
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
 * Creates one append-only Journey step using the approved defaults.
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
    inAppExpirationMinutes: DEFAULT_CAMPAIGN_IN_APP_EXPIRATION_MINUTES,
    sendGuards: [],
  };
}

/**
 * Creates the editor's deep Journey step draft: timing, Send Guard, and
 * localized Delivery content travel together.
 */
export function createCampaignJourneyStepDraft(
  order: number,
  deeplinkTarget: CampaignDeeplinkTarget | null = null
): CampaignJourneyStepDraft {
  return {
    ...createJourneyStep(order),
    localizedDeliveryContent: createBlankStepLocaleMap(deeplinkTarget),
  };
}

/**
 * Returns the editor-facing Journey step drafts from the persisted draft.
 */
export function getCampaignJourneyStepDrafts(
  draft: Pick<CampaignDraft, 'journey' | 'content'>
): CampaignJourneyStepDraft[] {
  return draft.journey.steps.map((step) => ({
    ...withInAppExpirationDefault(step),
    localizedDeliveryContent:
      draft.content[step.stepKey] ?? createBlankStepLocaleMap(null),
  }));
}

export function getCampaignJourneyStepDraft(
  draft: Pick<CampaignDraft, 'journey' | 'content'>,
  stepKey: string
): CampaignJourneyStepDraft | null {
  return (
    getCampaignJourneyStepDrafts(draft).find(
      (stepDraft) => stepDraft.stepKey === stepKey
    ) ?? null
  );
}

export function getFirstJourneyStepKey(
  draft: Pick<CampaignDraft, 'journey'>
): string {
  return draft.journey.steps[0]?.stepKey ?? 'step_1';
}

export function getMissingJourneyStepContentKeys(
  draft: Pick<CampaignDraft, 'journey' | 'content'>
): string[] {
  return draft.journey.steps
    .filter((step) => !draft.content[step.stepKey])
    .map((step) => step.stepKey);
}

export function appendCampaignJourneyStepDraft(
  draft: CampaignDraft,
  deeplinkTarget: CampaignDeeplinkTarget | null
): CampaignDraft {
  const nextStepKey = getNextJourneyStepKey(draft);
  const stepDraft = {
    ...createCampaignJourneyStepDraft(
      draft.journey.steps.length + 1,
      deeplinkTarget
    ),
    stepKey: nextStepKey,
  };

  return {
    ...draft,
    journey: {
      steps: [...draft.journey.steps, materializeJourneyStep(stepDraft)],
    },
    content: {
      ...draft.content,
      [stepDraft.stepKey]: stepDraft.localizedDeliveryContent,
    },
  };
}

export function removeCampaignJourneyStepDraft(
  draft: CampaignDraft,
  stepKey: string
): CampaignDraft {
  const nextSteps = normalizeJourneySteps(
    draft.journey.steps.filter((step) => step.stepKey !== stepKey)
  );
  const nextContent = Object.fromEntries(
    Object.entries(draft.content).filter(
      ([contentStepKey]) => contentStepKey !== stepKey
    )
  ) as CampaignDraft['content'];

  return {
    ...draft,
    journey: {
      steps: nextSteps,
    },
    content: nextContent,
  };
}

export function updateCampaignJourneyStepDraft(
  draft: CampaignDraft,
  stepKey: string,
  patch: CampaignJourneyStepDraftPatch
): CampaignDraft {
  return {
    ...draft,
    journey: {
      steps: draft.journey.steps.map((step) =>
        step.stepKey === stepKey
          ? withInAppExpirationDefault({ ...step, ...patch })
          : withInAppExpirationDefault(step)
      ),
    },
  };
}

export function updateCampaignJourneyStepDeliveryContent(
  draft: CampaignDraft,
  stepKey: string,
  locale: CampaignLocale,
  patch: Partial<CampaignStepLocaleContent>
): CampaignDraft {
  const stepContent = draft.content[stepKey] ?? createBlankStepLocaleMap(null);
  const localeContent = stepContent[locale] ?? createBlankLocaleContent(null);

  return {
    ...draft,
    content: {
      ...draft.content,
      [stepKey]: {
        ...stepContent,
        [locale]: {
          ...localeContent,
          ...patch,
        },
      },
    },
  };
}

export function changeCampaignJourneyStepDeeplink(
  draft: CampaignDraft,
  stepKey: string,
  locale: CampaignLocale,
  target: CampaignDeeplinkTarget | null
): CampaignDraft {
  return updateCampaignJourneyStepDeliveryContent(draft, stepKey, locale, {
    deeplinkTarget: target,
  });
}

function materializeJourneyStep(
  stepDraft: CampaignJourneyStepDraft
): CampaignJourneyStep {
  return {
    stepKey: stepDraft.stepKey,
    order: stepDraft.order,
    anchor: stepDraft.anchor,
    delayMinutes: stepDraft.delayMinutes,
    sameLocalTimeNextDay: stepDraft.sameLocalTimeNextDay,
    sendWindowStart: stepDraft.sendWindowStart,
    sendWindowEnd: stepDraft.sendWindowEnd,
    exitRule: stepDraft.exitRule,
    frequencyCapHours: stepDraft.frequencyCapHours,
    inAppExpirationMinutes:
      stepDraft.inAppExpirationMinutes ??
      DEFAULT_CAMPAIGN_IN_APP_EXPIRATION_MINUTES,
    sendGuards: stepDraft.sendGuards,
  };
}

function normalizeJourneySteps(
  steps: CampaignJourneyStep[]
): CampaignJourneyStep[] {
  return steps.map((step, index) => ({
    ...withInAppExpirationDefault(step),
    order: index + 1,
    anchor: index === 0 ? { type: 'trigger' } : { type: 'previous_step' },
  }));
}

function withInAppExpirationDefault(
  step: CampaignJourneyStep
): CampaignJourneyStep {
  return {
    ...step,
    inAppExpirationMinutes:
      step.inAppExpirationMinutes ??
      DEFAULT_CAMPAIGN_IN_APP_EXPIRATION_MINUTES,
  };
}

function getNextJourneyStepKey(draft: Pick<CampaignDraft, 'journey'>): string {
  const usedKeys = new Set(draft.journey.steps.map((step) => step.stepKey));
  const existingNumbers = draft.journey.steps
    .map((step) => /^step_(\d+)$/.exec(step.stepKey)?.[1])
    .filter((value): value is string => Boolean(value))
    .map((value) => Number(value));
  let nextNumber = Math.max(draft.journey.steps.length, ...existingNumbers) + 1;

  while (usedKeys.has(`step_${nextNumber}`)) {
    nextNumber += 1;
  }

  return `step_${nextNumber}`;
}

function createBlankLocaleContent(
  deeplinkTarget: CampaignDeeplinkTarget | null
): CampaignStepLocaleContent {
  return {
    title: '',
    body: '',
    fallbackFirstName: '',
    deeplinkTarget,
  };
}
