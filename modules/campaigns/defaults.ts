/**
 * Live-safe draft defaults and catalog application helpers for campaigns.
 */

import { RetentionStage } from '@/lib/api/users';
import type {
  CampaignAudienceDefinition,
  CampaignDeeplinkTarget,
  CampaignDraft,
  CampaignEditorCatalog,
  CampaignLocale,
  CampaignLocaleContent,
  CampaignSavedSegmentSummary,
  CampaignTemplateSummary,
} from '@/modules/campaigns/contracts';

const DEFAULT_LOCALES: CampaignLocale[] = ['en', 'es', 'pt'];
const DEFAULT_DEEPLINK_TARGET: CampaignDeeplinkTarget = 'continue_onboarding';

function createLocaleContent(
  deeplinkTarget: CampaignDeeplinkTarget,
): Record<CampaignLocale, CampaignLocaleContent> {
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

function getDefaultDeeplinkTarget(
  catalog?: CampaignEditorCatalog,
): CampaignDeeplinkTarget {
  return catalog?.deeplinkOptions[0]?.target ?? DEFAULT_DEEPLINK_TARGET;
}

export function createEmptyCampaignDraft(
  catalog?: CampaignEditorCatalog,
): CampaignDraft {
  const deeplinkTarget = getDefaultDeeplinkTarget(catalog);

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
        partnerId: null,
        locales: [...DEFAULT_LOCALES],
        requiresPushOptIn: true,
      },
      suppression: {
        excludeConvertedUsers: true,
        excludeRecentRecipients: true,
      },
      trigger: {
        type: 'state_based',
      },
    },
    timing: {
      sendMode: 'after_delay',
      delayMinutes: 20,
      scheduledAt: null,
      timezoneMode: 'user_local',
      sendWindowStart: '08:00',
      sendWindowEnd: '22:00',
      frequencyCapHours: 24,
      stopOnGoalReached: true,
    },
    content: createLocaleContent(deeplinkTarget),
    updatedAt: null,
    createdBy: null,
  };
}

export function applySavedSegmentSelection(
  audience: CampaignAudienceDefinition,
  segment: CampaignSavedSegmentSummary,
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

export function applyTemplateSelection(
  draft: CampaignDraft,
  template: CampaignTemplateSummary,
): {
  audience: CampaignAudienceDefinition;
  contentPatch: Partial<
    Record<CampaignLocale, Partial<CampaignDraft['content'][CampaignLocale]>>
  >;
} {
  const contentPatch = (Object.keys(draft.content) as CampaignLocale[]).reduce(
    (accumulator, locale) => {
      accumulator[locale] = {
        deeplinkTarget: template.deeplinkTarget,
      };
      return accumulator;
    },
    {} as Partial<
      Record<CampaignLocale, Partial<CampaignDraft['content'][CampaignLocale]>>
    >,
  );

  return {
    audience: {
      ...(template.audienceDefinition ?? draft.audience),
      segmentSource: 'template_segment',
      sourceSegmentId: template.id,
    },
    contentPatch,
  };
}
