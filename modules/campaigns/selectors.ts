/**
 * Derived selector helpers for the campaigns editor and overview.
 */

import { RetentionStage } from '@/lib/api/users';
import { CAMPAIGN_GOAL_REWARD_POINTS_MAX } from '@/modules/campaigns/contracts';
import type {
  CampaignDraft,
  CampaignJourneyStep,
  CampaignLocale,
  CampaignReadiness,
  CampaignStepLocaleContent,
} from '@/modules/campaigns/contracts';
import { CampaignEditorStep } from '@/modules/campaigns/reducer';
import {
  describeCampaignScheduleRule,
  isValidCampaignScheduleDate,
  parseCampaignScheduleRule,
} from '@/modules/campaigns/schedule';

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

/**
 * Warns operators that tracked-goal runtime behavior is disabled for the draft.
 */
export const MISSING_TRACKED_GOAL_WARNING =
  'Tracked goal is not set. Campaign success, suppression, and stop-on-goal behavior will not be measured.';

export interface CampaignValidationSummary {
  errors: string[];
  warnings: string[];
  readiness: Record<CampaignLocale, CampaignReadiness>;
  stepReadiness: Record<string, Record<CampaignLocale, CampaignReadiness>>;
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

const ALL_CAMPAIGN_LOCALES: CampaignLocale[] = ['en', 'es', 'pt'];

function extractTokens(value: string): string[] {
  const matches = value.match(TOKEN_PATTERN);
  return matches ?? [];
}

function hasMeaningfulText(value: string): boolean {
  return value.trim().length > 0;
}

function hasAudienceTargeting(draft: CampaignDraft): boolean {
  return (
    draft.audience.criteria.retentionStages.length > 0 ||
    draft.audience.criteria.userIds.length > 0
  );
}

function getGoalRewardPoints(draft: CampaignDraft): number {
  return draft.goalDefinition?.rewardPoints ?? 0;
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
    case RetentionStage.PRE_REG_ONBOARDING_INCOMPLETE:
      return 'Pre-reg onboarding incomplete';
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

  return describeCampaignScheduleRule(draft.trigger.recurrenceRule, {
    startDate: draft.trigger.startDate,
    maxOccurrences: draft.trigger.maxOccurrences,
  });
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
  content: CampaignDraft['content'],
  locales: CampaignLocale[] = ALL_CAMPAIGN_LOCALES
): Record<CampaignLocale, CampaignReadiness> {
  const aggregate: Record<CampaignLocale, CampaignReadiness> = {
    en: 'ready',
    es: 'ready',
    pt: 'ready',
  };

  Object.values(content).forEach((stepContent) => {
    const readiness = getCampaignStepLocaleReadiness(stepContent);
    locales.forEach((locale) => {
      aggregate[locale] = combineReadiness(
        aggregate[locale],
        readiness[locale]
      );
    });
  });

  return aggregate;
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
  const selectedLocales = draft.audience.criteria.locales;

  if (draft.goalDefinition === null) {
    warnings.push(MISSING_TRACKED_GOAL_WARNING);
  }

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
          if (selectedLocales.includes(locale)) {
            warnings.push(...localeWarnings);
          }

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
  const readiness = getCampaignLocaleReadiness(draft.content, selectedLocales);
  const usedTokens = getUsedCampaignTokens(draft);

  if (!hasMeaningfulText(draft.name)) {
    errors.push('Campaign name is required.');
  }

  if (!hasMeaningfulText(draft.goal)) {
    errors.push('Campaign goal is required.');
  }

  if (
    draft.goalDefinition &&
    (!Number.isInteger(getGoalRewardPoints(draft)) ||
      getGoalRewardPoints(draft) < 0 ||
      getGoalRewardPoints(draft) > CAMPAIGN_GOAL_REWARD_POINTS_MAX)
  ) {
    errors.push(
      `Goal reward points must be zero or a positive whole number no greater than ${CAMPAIGN_GOAL_REWARD_POINTS_MAX}.`
    );
  }

  if (!hasAudienceTargeting(draft)) {
    errors.push('Select at least one retention stage or specific user.');
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
  } else if (
    draft.trigger.type === 'scheduled_recurring' &&
    !parseCampaignScheduleRule(draft.trigger.recurrenceRule)
  ) {
    errors.push(
      'Recurring campaigns require a valid daily or weekly local-time schedule.'
    );
  }

  if (
    draft.trigger.type === 'scheduled_recurring' &&
    (!draft.trigger.startDate?.trim() ||
      !isValidCampaignScheduleDate(draft.trigger.startDate))
  ) {
    errors.push('Recurring campaigns require a valid start date.');
  }

  if (
    draft.trigger.type === 'scheduled_recurring' &&
    draft.trigger.maxOccurrences !== null &&
    draft.trigger.maxOccurrences !== undefined &&
    (!Number.isInteger(draft.trigger.maxOccurrences) ||
      draft.trigger.maxOccurrences <= 0)
  ) {
    errors.push(
      'Recurring campaigns require a positive max occurrences value.'
    );
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

    selectedLocales.forEach((locale) => {
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
      selectedLocales.some(
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
      hasAudienceTargeting(draft) &&
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
    );
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
      (locale) => validation.readiness[locale] !== 'missing'
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
      {
        label: 'Tracked goal',
        value: draft.goalDefinition
          ? `${draft.goalDefinition.eventKey} (${draft.goalDefinition.attributionMode})`
          : 'None',
      },
      {
        label: 'Goal reward',
        value:
          getGoalRewardPoints(draft) > 0
            ? `${getGoalRewardPoints(draft)} points`
            : 'None',
      },
      { label: 'Channel', value: draft.channel.toUpperCase() },
    ],
    audience: [
      {
        label: 'Retention',
        value:
          draft.audience.criteria.retentionStages.length > 0
            ? draft.audience.criteria.retentionStages
                .map((stage) => formatRetentionStage(stage))
                .join(', ')
            : selectedUserIds.length > 0
              ? 'Specific users only'
              : 'Not set',
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
      draft.audience.criteria.retentionStages.length > 0
        ? `${draft.audience.criteria.retentionStages.length} retention rule set(s)`
        : selectedUserIds.length > 0
          ? 'Specific users only'
          : 'No audience targeting yet',
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
          'All selected locales have at least non-missing content across every journey step.',
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
