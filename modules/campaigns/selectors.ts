/**
 * Derived selector helpers for the campaigns editor and overview.
 */

import { RetentionStage } from '@/lib/api/users';
import type {
  CampaignDraft,
  CampaignDeeplinkTarget,
  CampaignJourneyStep,
  CampaignLocale,
  CampaignReadiness,
  CampaignStepLocaleContent,
} from '@/modules/campaigns/contracts';
import { CampaignEditorStep } from '@/modules/campaigns/reducer';
import { describeCampaignScheduleRule } from '@/modules/campaigns/schedule';

const TOKEN_PATTERN = /{{([a-z_]+)}}/g;

const SOURCE_EVENT_LABELS: Record<string, string> = {
  app_opened: 'Opened app',
  onboarding_completed: 'Completed onboarding',
  match_center_opened: 'Opened match center',
  rewards_wallet_opened: 'Opened rewards wallet',
  subscription_started: 'Started subscription',
  subscription_renewed: 'Renewed subscription',
  in_app_purchase_completed: 'Completed in-app purchase',
  daily_streak_reminder: 'Daily streak reminder',
  weekly_quest_urgency: 'Weekly quest urgency',
  favorite_match_kickoff: 'Favorite match kickoff',
  weekly_stats_digest: 'Weekly stats digest',
  unread_social_activity: 'Unread social activity',
  live_challenge_starting_soon: 'Live challenge starting soon',
  live_challenge_results: 'Live challenge results available',
  stage_at_risk_wau: 'Became at-risk weekly user',
  stage_at_risk_mau: 'Became at-risk monthly user',
  stage_dead_user: 'Became inactive 30+ days',
  stage_reactivated: 'Reactivated after 7-29 days',
  stage_resurrected: 'Reactivated after 30+ days',
};

const SOURCE_EVENT_SOURCE_LABELS: Record<string, string> = {
  crm_source_events: 'CRM integration events',
  channels_favorite_matches: 'Favorite matches service',
};

const CAMPAIGN_GOAL_RULE_BY_DEEPLINK_TARGET: Partial<
  Record<
    CampaignDeeplinkTarget,
    {
      label: string;
      goalKey: string;
    }
  >
> = {
  continue_onboarding: {
    label: 'Continue onboarding',
    goalKey: 'onboarding_completed:global_state_event',
  },
  open_match_center: {
    label: 'Open match center',
    goalKey: 'match_center_opened:trace_required_response',
  },
  open_rewards_wallet: {
    label: 'Open rewards wallet',
    goalKey: 'rewards_wallet_opened:trace_required_response',
  },
};

const SUPPORTED_CAMPAIGN_GOAL_LABELS = [
  'Continue onboarding',
  'Open match center',
  'Open rewards wallet',
].join(', ');

export interface CampaignValidationSummary {
  errors: string[];
  warnings: string[];
  readiness: Record<CampaignLocale, CampaignReadiness>;
  stepReadiness: Record<string, Record<CampaignLocale, CampaignReadiness>>;
}

export interface CampaignDeeplinkGoalSelection {
  stepKey: string;
  stepOrder: number;
  locale: CampaignLocale;
  target: CampaignDeeplinkTarget;
  label: string;
  goalKey: string | null;
}

export interface CampaignDeeplinkGoalSummary {
  selections: CampaignDeeplinkGoalSelection[];
  unsupportedSelections: CampaignDeeplinkGoalSelection[];
  goalGroups: Array<{
    goalKey: string;
    label: string;
    selections: CampaignDeeplinkGoalSelection[];
  }>;
  hasMixedGoals: boolean;
}

export interface CampaignReviewModel {
  basics: Array<{ label: string; value: string }>;
  audience: Array<{ label: string; value: string }>;
  trigger: Array<{ label: string; value: string }>;
  journey: Array<{ label: string; value: string }>;
  content: Array<{ label: string; value: string; tone: 'default' | 'warning' }>;
  launchPlan: string[];
  preflightChecks: Array<{
    label: string;
    detail: string;
    status: 'ready' | 'warning';
  }>;
}

function extractTokens(value: string): string[] {
  const matches = value.match(TOKEN_PATTERN);
  return matches ?? [];
}

function hasMeaningfulText(value: string): boolean {
  return value.trim().length > 0;
}

function combineReadiness(
  left: CampaignReadiness,
  right: CampaignReadiness
): CampaignReadiness {
  if (left === 'missing' || right === 'missing') {
    return 'missing';
  }

  if (left === 'warning' || right === 'warning') {
    return 'warning';
  }

  return 'ready';
}

function formatStepLocaleLabel(selection: {
  stepOrder: number;
  locale: CampaignLocale;
}): string {
  return `Step ${selection.stepOrder} ${selection.locale.toUpperCase()}`;
}

function formatGoalSelectionLocations(
  selections: CampaignDeeplinkGoalSelection[]
): string {
  return selections.map((selection) => formatStepLocaleLabel(selection)).join(', ');
}

function formatDeeplinkTargetLabel(target: CampaignDeeplinkTarget): string {
  return (
    CAMPAIGN_GOAL_RULE_BY_DEEPLINK_TARGET[target]?.label ??
    target
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}

function getLocaleWarnings(
  locale: CampaignLocale,
  stepKey: string,
  content: CampaignStepLocaleContent
): string[] {
  const warnings: string[] = [];
  const usedTokens = [
    ...extractTokens(content.title),
    ...extractTokens(content.body),
  ];

  if (!hasMeaningfulText(content.title) && !hasMeaningfulText(content.body)) {
    warnings.push(`Step ${stepKey} · locale ${locale.toUpperCase()} is empty.`);
    return warnings;
  }

  if (!hasMeaningfulText(content.title) || !hasMeaningfulText(content.body)) {
    warnings.push(
      `Step ${stepKey} · locale ${locale.toUpperCase()} still needs title and body copy.`
    );
  }

  if (
    usedTokens.includes('{{first_name}}') &&
    !hasMeaningfulText(content.fallbackFirstName)
  ) {
    warnings.push(
      `Step ${stepKey} · locale ${locale.toUpperCase()} uses {{first_name}} without fallbackFirstName.`
    );
  }

  return warnings;
}

function formatRetentionStage(stage: RetentionStage): string {
  switch (stage) {
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
      return stage;
  }
}

function formatTrigger(draft: CampaignDraft): string {
  if (draft.trigger.type === 'state_based') {
    return 'State based';
  }

  if (draft.trigger.type === 'event_based') {
    return 'Source event';
  }

  return 'Scheduled';
}

function describeTriggerDetails(draft: CampaignDraft): string {
  if (draft.trigger.type === 'state_based') {
    return `Users enter when they match the selected audience. Re-entry after ${draft.trigger.reentryCooldownHours ?? 'no'} hour(s).`;
  }

  if (draft.trigger.type === 'event_based') {
    const eventLabel =
      SOURCE_EVENT_LABELS[draft.trigger.eventKey] ?? draft.trigger.eventKey;
    const sourceLabel =
      SOURCE_EVENT_SOURCE_LABELS[draft.trigger.producerKey] ??
      draft.trigger.producerKey;

    return `${eventLabel} from ${sourceLabel}. Re-entry after ${draft.trigger.reentryCooldownHours ?? 'no'} hour(s).`;
  }

  return describeCampaignScheduleRule(draft.trigger.recurrenceRule);
}

function describeJourneyStep(step: CampaignJourneyStep): string {
  const delayLabel = step.sameLocalTimeNextDay
    ? 'next day at the same local time'
    : `${step.delayMinutes ?? 0} min after the previous anchor`;

  return `Step ${step.order} · ${delayLabel} · send between ${step.sendWindowStart}-${step.sendWindowEnd} · cap ${step.frequencyCapHours ?? 'none'}h · stop later steps when goal is reached`;
}

/**
 * Derives locale readiness from one localized step-content map.
 */
export function getCampaignStepLocaleReadiness(
  content: Record<CampaignLocale, CampaignStepLocaleContent>
): Record<CampaignLocale, CampaignReadiness> {
  return (Object.keys(content) as CampaignLocale[]).reduce(
    (accumulator, locale) => {
      const localeContent = content[locale];
      const warnings = getLocaleWarnings(locale, 'content', localeContent);

      if (
        !hasMeaningfulText(localeContent.title) &&
        !hasMeaningfulText(localeContent.body)
      ) {
        accumulator[locale] = 'missing';
      } else if (warnings.length > 0) {
        accumulator[locale] = 'warning';
      } else {
        accumulator[locale] = 'ready';
      }

      return accumulator;
    },
    {} as Record<CampaignLocale, CampaignReadiness>
  );
}

/**
 * Derives aggregate locale readiness across all journey steps.
 */
export function getCampaignLocaleReadiness(
  content: CampaignDraft['content']
): Record<CampaignLocale, CampaignReadiness> {
  const aggregate: Record<CampaignLocale, CampaignReadiness> = {
    en: 'ready',
    es: 'ready',
    pt: 'ready',
  };

  Object.values(content).forEach((stepContent) => {
    const readiness = getCampaignStepLocaleReadiness(stepContent);
    (Object.keys(readiness) as CampaignLocale[]).forEach((locale) => {
      aggregate[locale] = combineReadiness(
        aggregate[locale],
        readiness[locale]
      );
    });
  });

  return aggregate;
}

/**
 * Describes all non-null deeplink selections and their goal mapping status.
 */
export function getCampaignDeeplinkGoalSummary(
  draft: CampaignDraft
): CampaignDeeplinkGoalSummary {
  const selections = draft.journey.steps.flatMap((step) => {
    const stepContent = draft.content[step.stepKey];
    if (!stepContent) {
      return [];
    }

    return (Object.keys(stepContent) as CampaignLocale[])
      .map((locale) => {
        const target = stepContent[locale].deeplinkTarget;
        if (!target) {
          return null;
        }

        const goalRule = CAMPAIGN_GOAL_RULE_BY_DEEPLINK_TARGET[target];

        return {
          stepKey: step.stepKey,
          stepOrder: step.order,
          locale,
          target,
          label: formatDeeplinkTargetLabel(target),
          goalKey: goalRule?.goalKey ?? null,
        };
      })
      .filter(
        (selection): selection is CampaignDeeplinkGoalSelection =>
          selection !== null
      );
  });

  const unsupportedSelections = selections.filter(
    (selection) => selection.goalKey === null
  );
  const goalGroups = Array.from(
    selections
      .filter(
        (selection): selection is CampaignDeeplinkGoalSelection & {
          goalKey: string;
        } => selection.goalKey !== null
      )
      .reduce((accumulator, selection) => {
        const currentGroup = accumulator.get(selection.goalKey);
        if (currentGroup) {
          currentGroup.selections.push(selection);
          return accumulator;
        }

        accumulator.set(selection.goalKey, {
          goalKey: selection.goalKey,
          label: selection.label,
          selections: [selection],
        });
        return accumulator;
      }, new Map<string, { goalKey: string; label: string; selections: CampaignDeeplinkGoalSelection[] }>())
      .values()
  );

  return {
    selections,
    unsupportedSelections,
    goalGroups,
    hasMixedGoals: goalGroups.length > 1,
  };
}

/**
 * Lists draft-save blockers that are enforced by the backend even before scheduling.
 */
export function getCampaignSaveBlockingErrors(
  draft: CampaignDraft
): string[] {
  const goalSummary = getCampaignDeeplinkGoalSummary(draft);
  const errors: string[] = [];

  if (goalSummary.unsupportedSelections.length > 0) {
    const unsupportedTargets = Array.from(
      new Set(
        goalSummary.unsupportedSelections.map((selection) => selection.label)
      )
    ).join(', ');

    errors.push(
      `Only ${SUPPORTED_CAMPAIGN_GOAL_LABELS} can be used as non-empty follow-up actions. Replace or clear ${unsupportedTargets} in ${formatGoalSelectionLocations(goalSummary.unsupportedSelections)} before saving the draft.`
    );
  }

  if (goalSummary.hasMixedGoals) {
    const mixedGoalDetails = goalSummary.goalGroups
      .map(
        (group) =>
          `${group.label} in ${formatGoalSelectionLocations(group.selections)}`
      )
      .join('; ');

    errors.push(
      `All non-empty follow-up actions across the campaign must point to one supported goal. Mixed actions found: ${mixedGoalDetails}.`
    );
  }

  return errors;
}

/**
 * Lists all tokens referenced across all step content blocks.
 */
export function getUsedCampaignTokens(
  draft: CampaignDraft
): Array<'{{first_name}}' | '{{favorite_team}}' | '{{bonus_points}}'> {
  const tokens = new Set<
    '{{first_name}}' | '{{favorite_team}}' | '{{bonus_points}}'
  >();

  Object.values(draft.content).forEach((stepContent) => {
    (Object.keys(stepContent) as CampaignLocale[]).forEach((locale) => {
      extractTokens(stepContent[locale].title).forEach((token) => {
        if (
          token === '{{first_name}}' ||
          token === '{{favorite_team}}' ||
          token === '{{bonus_points}}'
        ) {
          tokens.add(token);
        }
      });

      extractTokens(stepContent[locale].body).forEach((token) => {
        if (
          token === '{{first_name}}' ||
          token === '{{favorite_team}}' ||
          token === '{{bonus_points}}'
        ) {
          tokens.add(token);
        }
      });
    });
  });

  return [...tokens];
}

/**
 * Builds the canonical validation summary consumed by UI banners and action gates.
 */
export function getCampaignValidationSummary(
  draft: CampaignDraft
): CampaignValidationSummary {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stepReadiness = Object.fromEntries(
    Object.entries(draft.content).map(([stepKey, stepContent]) => [
      stepKey,
      (Object.keys(stepContent) as CampaignLocale[]).reduce(
        (accumulator, locale) => {
          const localeContent = stepContent[locale];
          const localeWarnings = getLocaleWarnings(
            locale,
            stepKey,
            localeContent
          );
          warnings.push(...localeWarnings);

          if (
            !hasMeaningfulText(localeContent.title) &&
            !hasMeaningfulText(localeContent.body)
          ) {
            accumulator[locale] = 'missing';
          } else if (localeWarnings.length > 0) {
            accumulator[locale] = 'warning';
          } else {
            accumulator[locale] = 'ready';
          }

          return accumulator;
        },
        {} as Record<CampaignLocale, CampaignReadiness>
      ),
    ])
  ) as Record<string, Record<CampaignLocale, CampaignReadiness>>;
  const readiness = getCampaignLocaleReadiness(draft.content);
  const usedTokens = getUsedCampaignTokens(draft);

  if (!hasMeaningfulText(draft.name)) {
    errors.push('Campaign name is required.');
  }

  if (!hasMeaningfulText(draft.goal)) {
    errors.push('Campaign goal is required.');
  }

  if (draft.audience.criteria.retentionStages.length === 0) {
    errors.push('Select at least one retention stage.');
  }

  if (draft.audience.criteria.locales.length === 0) {
    errors.push('Select at least one locale.');
  }

  if (draft.journey.steps.length === 0) {
    errors.push('Add at least one journey step.');
  }

  const stepKeySet = new Set<string>();
  draft.journey.steps.forEach((step, index) => {
    if (stepKeySet.has(step.stepKey)) {
      errors.push(`Duplicate journey step key: ${step.stepKey}.`);
    }
    stepKeySet.add(step.stepKey);

    const expectedAnchor = index === 0 ? 'trigger' : 'previous_step';
    if (step.anchor.type !== expectedAnchor) {
      errors.push(
        `Step ${step.order} must anchor to ${expectedAnchor.replace('_', ' ')}.`
      );
    }
  });

  if (
    draft.trigger.type === 'scheduled_recurring' &&
    !draft.trigger.recurrenceRule.trim()
  ) {
    errors.push('Recurring campaigns require an RFC5545 RRULE.');
  }

  if (
    draft.trigger.type === 'event_based' &&
    (!draft.trigger.eventKey.trim() || !draft.trigger.producerKey.trim())
  ) {
    errors.push('Event-based campaigns require a shipped source event.');
  }

  draft.journey.steps.forEach((step) => {
    if (!draft.content[step.stepKey]) {
      errors.push(`Missing content map for ${step.stepKey}.`);
      return;
    }

    draft.audience.criteria.locales.forEach((locale) => {
      if (stepReadiness[step.stepKey]?.[locale] === 'missing') {
        errors.push(
          `Step ${step.stepKey} is missing ${locale.toUpperCase()} content.`
        );
      }
    });
  });

  if (
    usedTokens.includes('{{first_name}}') &&
    Object.values(draft.content).some((stepContent) =>
      (Object.keys(stepContent) as CampaignLocale[]).some(
        (locale) =>
          [
            ...extractTokens(stepContent[locale].title),
            ...extractTokens(stepContent[locale].body),
          ].includes('{{first_name}}') &&
          !hasMeaningfulText(stepContent[locale].fallbackFirstName)
      )
    )
  ) {
    warnings.push('Every locale using {{first_name}} needs a fallback value.');
  }

  errors.push(...getCampaignSaveBlockingErrors(draft));

  return { errors, warnings, readiness, stepReadiness };
}

/**
 * Returns whether the requested editor step is ready to advance.
 */
export function canContinueCampaignStep(
  step: CampaignEditorStep,
  draft: CampaignDraft
): boolean {
  const validation = getCampaignValidationSummary(draft);

  if (step === CampaignEditorStep.AUDIENCE) {
    return (
      hasMeaningfulText(draft.name) &&
      hasMeaningfulText(draft.goal) &&
      draft.audience.criteria.retentionStages.length > 0 &&
      draft.audience.criteria.locales.length > 0
    );
  }

  if (step === CampaignEditorStep.TRIGGER_JOURNEY) {
    return !validation.errors.some(
      (error) =>
        error.includes('journey') ||
        error.includes('source event') ||
        error.includes('Recurring')
    );
  }

  if (step === CampaignEditorStep.STEP_CONTENT) {
    return draft.audience.criteria.locales.every(
      (locale) => validation.readiness[locale] !== 'missing'
    ) && getCampaignSaveBlockingErrors(draft).length === 0;
  }

  return true;
}

/**
 * Returns whether the draft is eligible for a test send.
 */
export function canSendTestCampaign(draft: CampaignDraft): boolean {
  const firstStepKey = draft.journey.steps[0]?.stepKey;
  if (!firstStepKey) {
    return false;
  }

  const firstStepReadiness =
    getCampaignValidationSummary(draft).stepReadiness[firstStepKey];
  return (
    hasMeaningfulText(draft.name) &&
    hasMeaningfulText(draft.goal) &&
    getCampaignSaveBlockingErrors(draft).length === 0 &&
    Boolean(firstStepReadiness) &&
    Object.values(firstStepReadiness).some((value) => value === 'ready')
  );
}

/**
 * Returns whether the draft can be scheduled.
 */
export function canScheduleCampaign(draft: CampaignDraft): boolean {
  const validation = getCampaignValidationSummary(draft);
  return (
    draft.status !== 'archived' &&
    draft.status !== 'scheduled' &&
    validation.errors.length === 0 &&
    draft.audience.criteria.locales.every(
      (locale) => validation.readiness[locale] === 'ready'
    )
  );
}

/**
 * Returns whether the draft can be archived.
 */
export function canArchiveCampaign(draft: CampaignDraft): boolean {
  return draft.id !== null && draft.status !== 'archived';
}

/**
 * Builds the review-step view model from the canonical draft.
 */
export function buildCampaignReviewModel(
  draft: CampaignDraft
): CampaignReviewModel {
  const validation = getCampaignValidationSummary(draft);
  const selectedUserIds = draft.audience.criteria.userIds ?? [];
  const localeList = draft.audience.criteria.locales
    .map((locale) => locale.toUpperCase())
    .join(', ');

  return {
    basics: [
      { label: 'Campaign', value: draft.name || 'Untitled draft' },
      { label: 'Goal', value: draft.goal || 'No goal yet' },
      { label: 'Channel', value: draft.channel.toUpperCase() },
    ],
    audience: [
      {
        label: 'Retention',
        value:
          draft.audience.criteria.retentionStages
            .map((stage) => formatRetentionStage(stage))
            .join(', ') || 'Not set',
      },
      {
        label: 'Specific users',
        value:
          selectedUserIds.length > 0
            ? `${selectedUserIds.length} selected`
            : 'All matching users',
      },
      { label: 'Locales', value: localeList || 'None selected' },
    ],
    trigger: [
      { label: 'Trigger', value: formatTrigger(draft) },
      { label: 'Details', value: describeTriggerDetails(draft) },
    ],
    journey: draft.journey.steps.map((step) => ({
      label: `Step ${step.order}`,
      value: describeJourneyStep(step),
    })),
    content: draft.journey.steps.flatMap((step) =>
      draft.audience.criteria.locales.map((locale) => ({
        label: `Step ${step.order} · ${locale.toUpperCase()}`,
        value:
          validation.stepReadiness[step.stepKey]?.[locale] === 'ready'
            ? 'Ready'
            : validation.stepReadiness[step.stepKey]?.[locale] === 'warning'
              ? 'Needs review'
              : 'Missing',
        tone:
          validation.stepReadiness[step.stepKey]?.[locale] === 'ready'
            ? 'default'
            : 'warning',
      }))
    ),
    launchPlan: [
      `${draft.audience.criteria.retentionStages.length} retention rule set(s)`,
      selectedUserIds.length > 0
        ? `${selectedUserIds.length} specific user(s) selected`
        : 'No specific-user filter',
      `${draft.journey.steps.length} journey step(s)`,
      `${draft.audience.criteria.locales.length} locale(s) targeted`,
    ],
    preflightChecks: [
      {
        label: 'Content completeness',
        detail:
          validation.warnings[0] ??
          'All selected locales are ready across every journey step.',
        status: validation.warnings.length > 0 ? 'warning' : 'ready',
      },
      {
        label: 'Trigger & journey',
        detail:
          validation.errors[0] ?? 'Trigger and journey rules are configured.',
        status: validation.errors.length > 0 ? 'warning' : 'ready',
      },
      {
        label: 'Safety',
        detail: canSendTestCampaign(draft)
          ? 'Test send is available before scheduling.'
          : 'Resolve validation errors before testing.',
        status: canSendTestCampaign(draft) ? 'ready' : 'warning',
      },
    ],
  };
}
