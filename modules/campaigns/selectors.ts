/**
 * Derived selector helpers for the campaigns editor and overview.
 */

import { RetentionStage } from '@/lib/api/users';
import type {
  CampaignDraft,
  CampaignEntryTriggerType,
  CampaignLocale,
  CampaignLocaleContent,
  CampaignReadiness,
} from '@/modules/campaigns/contracts';
import { CampaignEditorStep } from '@/modules/campaigns/reducer';

const TOKEN_PATTERN = /{{([a-z_]+)}}/g;

export interface CampaignValidationSummary {
  errors: string[];
  warnings: string[];
  readiness: Record<CampaignLocale, CampaignReadiness>;
}

export interface CampaignReviewModel {
  basics: Array<{ label: string; value: string }>;
  audience: Array<{ label: string; value: string }>;
  timing: Array<{ label: string; value: string }>;
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

function getLocaleWarnings(
  locale: CampaignLocale,
  content: CampaignLocaleContent,
): string[] {
  const warnings: string[] = [];
  const usedTokens = [...extractTokens(content.title), ...extractTokens(content.body)];

  if (!hasMeaningfulText(content.title) && !hasMeaningfulText(content.body)) {
    warnings.push(`Locale ${locale.toUpperCase()} is empty.`);
    return warnings;
  }

  if (!hasMeaningfulText(content.title) || !hasMeaningfulText(content.body)) {
    warnings.push(`Locale ${locale.toUpperCase()} still needs title and body copy.`);
  }

  if (
    usedTokens.includes('{{first_name}}') &&
    !hasMeaningfulText(content.fallbackFirstName)
  ) {
    warnings.push(
      `Locale ${locale.toUpperCase()} uses {{first_name}} without fallbackFirstName.`,
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

function formatTrigger(type: CampaignEntryTriggerType): string {
  switch (type) {
    case 'state_based':
      return 'State based';
    case 'event_based':
      return 'Event based';
    case 'scheduled_recurring':
      return 'Scheduled recurring';
    default:
      return type;
  }
}

function formatSendMode(draft: CampaignDraft): string {
  if (draft.timing.sendMode === 'immediately') {
    return 'Immediately';
  }

  if (draft.timing.sendMode === 'after_delay') {
    return `After ${draft.timing.delayMinutes ?? 0} min`;
  }

  if (!draft.timing.scheduledAt) {
    return 'Specific date not set';
  }

  return new Date(draft.timing.scheduledAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Derives locale readiness from localized content only.
 */
export function getCampaignLocaleReadiness(
  content: CampaignDraft['content'],
): Record<CampaignLocale, CampaignReadiness> {
  return (Object.keys(content) as CampaignLocale[]).reduce(
    (accumulator, locale) => {
      const localeContent = content[locale];
      const warnings = getLocaleWarnings(locale, localeContent);

      if (!hasMeaningfulText(localeContent.title) && !hasMeaningfulText(localeContent.body)) {
        accumulator[locale] = 'missing';
      } else if (warnings.length > 0) {
        accumulator[locale] = 'warning';
      } else {
        accumulator[locale] = 'ready';
      }

      return accumulator;
    },
    {} as Record<CampaignLocale, CampaignReadiness>,
  );
}

/**
 * Lists all tokens referenced across locale content.
 */
export function getUsedCampaignTokens(
  draft: CampaignDraft,
): Array<'{{first_name}}' | '{{favorite_team}}' | '{{bonus_points}}'> {
  const tokens = new Set<
    '{{first_name}}' | '{{favorite_team}}' | '{{bonus_points}}'
  >();

  (Object.keys(draft.content) as CampaignLocale[]).forEach((locale) => {
    extractTokens(draft.content[locale].title).forEach((token) => {
      if (
        token === '{{first_name}}' ||
        token === '{{favorite_team}}' ||
        token === '{{bonus_points}}'
      ) {
        tokens.add(token);
      }
    });

    extractTokens(draft.content[locale].body).forEach((token) => {
      if (
        token === '{{first_name}}' ||
        token === '{{favorite_team}}' ||
        token === '{{bonus_points}}'
      ) {
        tokens.add(token);
      }
    });
  });

  return [...tokens];
}

/**
 * Builds the canonical validation summary consumed by UI banners and action gates.
 */
export function getCampaignValidationSummary(
  draft: CampaignDraft,
): CampaignValidationSummary {
  const errors: string[] = [];
  const warnings: string[] = [];
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

  if (
    draft.audience.suppression.excludeRecentRecipients &&
    draft.timing.frequencyCapHours === null
  ) {
    errors.push(
      'Frequency cap hours are required when excluding recent recipients.',
    );
  }

  if (
    draft.audience.trigger.type === 'scheduled_recurring' &&
    !draft.audience.trigger.recurrenceRule.trim()
  ) {
    errors.push('Recurring campaigns require an RFC5545 RRULE.');
  }

  if (
    draft.audience.trigger.type === 'event_based' &&
    !draft.audience.trigger.eventKey.trim()
  ) {
    errors.push('Event-based campaigns require an event trigger.');
  }

  if (draft.timing.sendMode === 'after_delay' && (draft.timing.delayMinutes ?? 0) <= 0) {
    errors.push('After-delay campaigns require a delay greater than zero.');
  }

  if (
    draft.timing.sendMode === 'specific_datetime' &&
    !draft.timing.scheduledAt
  ) {
    errors.push('Specific date & time is required for scheduled sends.');
  }

  (Object.keys(draft.content) as CampaignLocale[]).forEach((locale) => {
    warnings.push(...getLocaleWarnings(locale, draft.content[locale]));
  });

  if (
    usedTokens.includes('{{first_name}}') &&
    (Object.keys(draft.content) as CampaignLocale[]).some(
      (locale) =>
        [...extractTokens(draft.content[locale].title), ...extractTokens(draft.content[locale].body)].includes(
          '{{first_name}}',
        ) && !hasMeaningfulText(draft.content[locale].fallbackFirstName),
    )
  ) {
    warnings.push('Every locale using {{first_name}} needs a fallback value.');
  }

  return { errors, warnings, readiness };
}

/**
 * Returns whether the requested editor step is ready to advance.
 */
export function canContinueCampaignStep(
  step: CampaignEditorStep,
  draft: CampaignDraft,
): boolean {
  const validation = getCampaignValidationSummary(draft);

  if (step === CampaignEditorStep.AUDIENCE) {
    return (
      hasMeaningfulText(draft.name) &&
      hasMeaningfulText(draft.goal) &&
      draft.audience.criteria.retentionStages.length > 0 &&
      draft.audience.criteria.locales.length > 0 &&
      !validation.errors.some((error) =>
        error.includes('Event-based') || error.includes('Recurring'),
      )
    );
  }

  if (step === CampaignEditorStep.TIMING) {
    return !validation.errors.some((error) =>
      error.includes('Frequency cap') ||
      error.includes('After-delay') ||
      error.includes('Specific date'),
    );
  }

  if (step === CampaignEditorStep.CONTENT) {
    return Object.values(validation.readiness).every(
      (readiness) => readiness !== 'missing',
    );
  }

  return true;
}

/**
 * Returns whether the draft is eligible for a test send.
 */
export function canSendTestCampaign(draft: CampaignDraft): boolean {
  const readiness = getCampaignLocaleReadiness(draft.content);
  return (
    hasMeaningfulText(draft.name) &&
    hasMeaningfulText(draft.goal) &&
    Object.values(readiness).some((localeReadiness) => localeReadiness === 'ready')
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
    Object.values(validation.readiness).every((readiness) => readiness === 'ready')
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
export function buildCampaignReviewModel(draft: CampaignDraft): CampaignReviewModel {
  const validation = getCampaignValidationSummary(draft);
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
        label: 'Segment source',
        value: draft.audience.segmentSource.replace(/_/g, ' '),
      },
      {
        label: 'Trigger',
        value: formatTrigger(draft.audience.trigger.type),
      },
      {
        label: 'Retention',
        value:
          draft.audience.criteria.retentionStages
            .map((stage) => formatRetentionStage(stage))
            .join(', ') || 'Not set',
      },
      { label: 'Locales', value: localeList || 'None selected' },
    ],
    timing: [
      { label: 'Timing', value: formatSendMode(draft) },
      {
        label: 'Quiet hours',
        value: `${draft.timing.sendWindowStart} - ${draft.timing.sendWindowEnd}`,
      },
      {
        label: 'Frequency cap',
        value:
          draft.timing.frequencyCapHours === null
            ? 'Not set'
            : `${draft.timing.frequencyCapHours} hr`,
      },
    ],
    content: (Object.keys(validation.readiness) as CampaignLocale[]).map(
      (locale) => ({
        label: locale.toUpperCase(),
        value:
          validation.readiness[locale] === 'ready'
            ? 'Ready'
            : validation.readiness[locale] === 'warning'
              ? 'Needs review'
              : 'Missing',
        tone: validation.readiness[locale] === 'ready' ? 'default' : 'warning',
      }),
    ),
    launchPlan: [
      `${draft.audience.criteria.retentionStages.length} retention rule set(s)`,
      `${draft.audience.criteria.locales.length} locale(s) targeted`,
      `${draft.timing.sendWindowStart} - ${draft.timing.sendWindowEnd} delivery window`,
    ],
    preflightChecks: [
      {
        label: 'Content completeness',
        detail:
          validation.warnings[0] ??
          'All localized content is ready for launch.',
        status: validation.warnings.length > 0 ? 'warning' : 'ready',
      },
      {
        label: 'Scheduling',
        detail:
          draft.timing.sendMode === 'specific_datetime'
            ? 'Specific launch time is configured.'
            : 'Launch timing is configured.',
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
