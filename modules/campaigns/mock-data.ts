/**
 * Deterministic mock seed factories for the campaigns admin UI.
 */

import { RetentionStage } from '@/lib/api/users';
import type {
  CampaignAudienceDefinition,
  CampaignDraft,
  CampaignEditorCatalog,
  CampaignsOverviewResponse,
  CampaignLocale,
  CampaignSavedSegmentSummary,
  CampaignTemplateSummary,
  CampaignTokenDefinition,
  CampaignDeeplinkOption,
  CampaignEventTriggerOption,
} from '@/modules/campaigns/contracts';

export const MOCK_TIME_ANCHOR_ISO = '2026-04-16T12:00:00.000Z';

const OVERVIEW_ITEMS: CampaignsOverviewResponse['items'] = [
  {
    id: 'cmp_onboarding_not_completed',
    name: 'onboarding_not_completed',
    goal: 'Recover onboarding completion',
    channel: 'push',
    status: 'active',
    entryTriggerType: 'state_based',
    audience: { estimate: 12480, label: 'New users' },
    timing: { label: 'Next send', timestamp: '2026-04-16T18:20:00.000Z' },
    progress: { sentCount: 4182, totalCount: 12480, progressPercent: 33.5 },
    metric: { label: 'ctr', value: '18.7%' },
    owner: { ownerName: 'Natalia', activityLabel: 'Updated 12 min ago' },
    updatedAt: '2026-04-16T11:48:00.000Z',
    localeReadiness: { en: 'ready', es: 'ready', pt: 'warning' },
  },
  {
    id: 'cmp_favorite_match_kickoff',
    name: 'favorite_match_kickoff',
    goal: 'Drive match-center opens',
    channel: 'push',
    status: 'paused',
    entryTriggerType: 'event_based',
    audience: { estimate: 9100, label: 'All active stages' },
    timing: { label: 'Last send', timestamp: '2026-04-16T16:45:00.000Z' },
    progress: { sentCount: 6840, totalCount: 9100, progressPercent: 75.2 },
    metric: { label: 'ctr', value: '22.1%' },
    owner: { ownerName: 'CRM bot', activityLabel: 'Paused by Natalia 6 min ago' },
    updatedAt: '2026-04-16T11:54:00.000Z',
    localeReadiness: { en: 'ready', es: 'ready', pt: 'ready' },
  },
  {
    id: 'cmp_stage_at_risk_wau',
    name: 'stage_at_risk_wau',
    goal: 'Retain at-risk weekly users',
    channel: 'push',
    status: 'active',
    entryTriggerType: 'state_based',
    audience: { estimate: 11000, label: 'At-risk WAU' },
    timing: { label: 'Next send', timestamp: '2026-04-16T19:00:00.000Z' },
    progress: { sentCount: 9022, totalCount: 11000, progressPercent: 82 },
    metric: { label: 'ctr', value: '16.4%' },
    owner: { ownerName: 'Natalia', activityLabel: 'Updated 28 min ago' },
    updatedAt: '2026-04-16T11:32:00.000Z',
    localeReadiness: { en: 'ready', es: 'ready', pt: 'warning' },
  },
  {
    id: 'cmp_stage_dead_user',
    name: 'stage_dead_user',
    goal: 'Bring back 30+ day inactive users',
    channel: 'push',
    status: 'scheduled',
    entryTriggerType: 'scheduled_recurring',
    audience: { estimate: 5320, label: 'Dead users' },
    timing: { label: 'First send', timestamp: '2026-04-17T08:30:00.000Z' },
    progress: { sentCount: 0, totalCount: 5320, progressPercent: 0 },
    metric: { label: 'goal', value: 'Bring back 30+ day inactive users' },
    owner: { ownerName: 'CRM bot', activityLabel: 'Scheduled 2 hours ago' },
    updatedAt: '2026-04-16T10:00:00.000Z',
    localeReadiness: { en: 'ready', es: 'ready', pt: 'warning' },
  },
];

const SAVED_SEGMENTS: CampaignSavedSegmentSummary[] = [
  {
    id: 'seg_new_users_setup_dropoff',
    name: 'New users · onboarding not completed',
    description: '12,480 reachable · best for 3-step reminders',
    audienceEstimate: 12480,
    source: 'saved_segment',
  },
  {
    id: 'seg_at_risk_wau',
    name: 'At-risk WAU',
    description: 'Inactive today, but active during the last 1–6 days.',
    audienceEstimate: 8920,
    source: 'saved_segment',
  },
  {
    id: 'seg_template_match_kickoff',
    name: 'Favorite match kickoff',
    description: '15 min before kickoff · max 3 notifications per day',
    audienceEstimate: 9100,
    source: 'template_segment',
  },
];

const TEMPLATES: CampaignTemplateSummary[] = [
  {
    id: 'tpl_onboarding_recovery',
    name: 'Onboarding recovery',
    description: '3-step push flow after setup drop-off.',
    entryTriggerType: 'state_based',
    deeplinkTarget: 'continue_onboarding',
  },
  {
    id: 'tpl_favorite_match_kickoff',
    name: 'Favorite match kickoff',
    description: '15 min reminder with deep link into match center.',
    entryTriggerType: 'event_based',
    deeplinkTarget: 'open_match_center',
  },
];

const TOKENS: CampaignTokenDefinition[] = [
  {
    key: 'first_name',
    token: '{{first_name}}',
    label: 'First name',
    requiresFallback: true,
    description: 'Personalizes the notification with the user first name.',
  },
  {
    key: 'favorite_team',
    token: '{{favorite_team}}',
    label: 'Favorite team',
    requiresFallback: false,
    description: 'Inserts the current favorite team name.',
  },
  {
    key: 'bonus_points',
    token: '{{bonus_points}}',
    label: 'Bonus points',
    requiresFallback: false,
    description: 'Inserts the current bonus points balance.',
  },
];

const DEEPLINK_OPTIONS: CampaignDeeplinkOption[] = [
  {
    target: 'continue_onboarding',
    label: 'Continue onboarding',
    path: 'app://setup/continue',
  },
  {
    target: 'open_match_center',
    label: 'Open match center',
    path: 'app://matches/center',
  },
  {
    target: 'open_rewards_wallet',
    label: 'Open rewards wallet',
    path: 'app://rewards/wallet',
  },
];

const EVENT_TRIGGERS: CampaignEventTriggerOption[] = [
  {
    key: 'opened_app',
    label: 'Opened app',
    description: 'User performed an app open event.',
  },
  {
    key: 'favorited_match',
    label: 'Favorited match',
    description: 'User added a match to favorites.',
  },
];

const SAVED_SEGMENT_DEFINITIONS: Record<string, CampaignAudienceDefinition> = {
  seg_new_users_setup_dropoff: {
    segmentSource: 'saved_segment',
    sourceSegmentId: 'seg_new_users_setup_dropoff',
    criteria: {
      retentionStages: [RetentionStage.NEW],
      partnerId: null,
      locales: ['en', 'es', 'pt'],
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
  seg_at_risk_wau: {
    segmentSource: 'saved_segment',
    sourceSegmentId: 'seg_at_risk_wau',
    criteria: {
      retentionStages: [RetentionStage.AT_RISK_WAU],
      partnerId: null,
      locales: ['en', 'es', 'pt'],
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
  seg_template_match_kickoff: {
    segmentSource: 'template_segment',
    sourceSegmentId: 'seg_template_match_kickoff',
    criteria: {
      retentionStages: [RetentionStage.CURRENT, RetentionStage.REACTIVATED],
      partnerId: null,
      locales: ['en', 'es', 'pt'],
      requiresPushOptIn: true,
    },
    suppression: {
      excludeConvertedUsers: false,
      excludeRecentRecipients: true,
    },
    trigger: {
      type: 'event_based',
      eventKey: 'favorited_match',
    },
  },
};

const TEMPLATE_AUDIENCE_DEFINITIONS: Record<string, CampaignAudienceDefinition> = {
  tpl_onboarding_recovery: {
    segmentSource: 'template_segment',
    sourceSegmentId: 'tpl_onboarding_recovery',
    criteria: {
      retentionStages: [RetentionStage.NEW],
      partnerId: null,
      locales: ['en', 'es', 'pt'],
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
  tpl_favorite_match_kickoff: {
    segmentSource: 'template_segment',
    sourceSegmentId: 'tpl_favorite_match_kickoff',
    criteria: {
      retentionStages: [RetentionStage.CURRENT, RetentionStage.REACTIVATED],
      partnerId: null,
      locales: ['en', 'es', 'pt'],
      requiresPushOptIn: true,
    },
    suppression: {
      excludeConvertedUsers: false,
      excludeRecentRecipients: true,
    },
    trigger: {
      type: 'event_based',
      eventKey: 'favorited_match',
    },
  },
};

const TEMPLATE_CONTENT_PRESETS: Record<
  string,
  Partial<Record<CampaignLocale, Partial<CampaignDraft['content'][CampaignLocale]>>>
> = {
  tpl_onboarding_recovery: {
    en: {
      title: 'Finish {{first_name}} setup',
      body: 'Get back to SirBro and complete the final onboarding steps.',
      fallbackFirstName: 'there',
      deeplinkTarget: 'continue_onboarding',
    },
    es: {
      title: 'Termina tu configuracion',
      body: 'Vuelve a SirBro y completa los pasos finales del onboarding.',
      fallbackFirstName: 'amigo',
      deeplinkTarget: 'continue_onboarding',
    },
    pt: {
      title: 'Conclua sua configuracao',
      body: 'Volte ao SirBro e conclua as etapas finais do onboarding.',
      fallbackFirstName: 'amigo',
      deeplinkTarget: 'continue_onboarding',
    },
  },
  tpl_favorite_match_kickoff: {
    en: {
      title: '{{favorite_team}} kicks off soon',
      body: 'Jump into match center before kickoff and stay ahead of every play.',
      deeplinkTarget: 'open_match_center',
    },
    es: {
      title: '{{favorite_team}} juega pronto',
      body: 'Entra al centro del partido antes del inicio y sigue cada jugada.',
      deeplinkTarget: 'open_match_center',
    },
    pt: {
      title: '{{favorite_team}} entra em campo ja',
      body: 'Abra o match center antes do apito inicial e acompanhe tudo.',
      deeplinkTarget: 'open_match_center',
    },
  },
};

/**
 * Creates the seeded overview response used by the overview screen.
 */
export function createInitialCampaignsOverviewResponse(): CampaignsOverviewResponse {
  return JSON.parse(
    JSON.stringify({
      stats: {
        activeCampaigns: 8,
        pausedCampaigns: 3,
        scheduledCampaigns: 4,
        sentToday: 124800,
        deliveredRate: 93.4,
        avgCtr: 18.7,
        ctrDeltaVsPrev7d: 2.3,
        reachInProgress: 31900,
      },
      items: OVERVIEW_ITEMS,
      total: OVERVIEW_ITEMS.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    }),
  ) as CampaignsOverviewResponse;
}

/**
 * Creates the initial mutable draft map for seeded campaigns.
 */
export function createInitialCampaignDraftMap(): Record<string, CampaignDraft> {
  return JSON.parse(
    JSON.stringify({
      cmp_onboarding_not_completed: {
        id: 'cmp_onboarding_not_completed',
        name: 'onboarding_not_completed',
        goal: 'Recover onboarding completion',
        channel: 'push',
        status: 'active',
        audience: SAVED_SEGMENT_DEFINITIONS.seg_new_users_setup_dropoff,
        timing: {
          sendMode: 'after_delay',
          delayMinutes: 20,
          scheduledAt: null,
          timezoneMode: 'user_local',
          sendWindowStart: '08:00',
          sendWindowEnd: '22:00',
          frequencyCapHours: 6,
          stopOnGoalReached: true,
        },
        content: {
          en: {
            title: 'Complete your setup, {{first_name}}',
            body: 'Open SirBro now and finish the final onboarding steps.',
            fallbackFirstName: 'there',
            deeplinkTarget: 'continue_onboarding',
          },
          es: {
            title: 'Completa tu configuracion, {{first_name}}',
            body: 'Abre SirBro y termina los ultimos pasos del onboarding.',
            fallbackFirstName: 'amigo',
            deeplinkTarget: 'continue_onboarding',
          },
          pt: {
            title: 'Conclua sua configuracao',
            body: 'Abra o SirBro e finalize as etapas do onboarding.',
            fallbackFirstName: '',
            deeplinkTarget: 'continue_onboarding',
          },
        },
        updatedAt: '2026-04-16T11:48:00.000Z',
        createdBy: 'Natalia',
      },
      cmp_favorite_match_kickoff: {
        id: 'cmp_favorite_match_kickoff',
        name: 'favorite_match_kickoff',
        goal: 'Drive match-center opens',
        channel: 'push',
        status: 'paused',
        audience: TEMPLATE_AUDIENCE_DEFINITIONS.tpl_favorite_match_kickoff,
        timing: {
          sendMode: 'after_delay',
          delayMinutes: 15,
          scheduledAt: null,
          timezoneMode: 'user_local',
          sendWindowStart: '08:00',
          sendWindowEnd: '22:00',
          frequencyCapHours: 24,
          stopOnGoalReached: false,
        },
        content: {
          en: {
            title: '{{favorite_team}} kicks off in 15 min',
            body: 'Go to match center before the first whistle.',
            fallbackFirstName: 'there',
            deeplinkTarget: 'open_match_center',
          },
          es: {
            title: '{{favorite_team}} empieza en 15 min',
            body: 'Ve al centro del partido antes del pitazo inicial.',
            fallbackFirstName: 'amigo',
            deeplinkTarget: 'open_match_center',
          },
          pt: {
            title: '{{favorite_team}} comeca em 15 min',
            body: 'Abra o match center antes do apito inicial.',
            fallbackFirstName: 'amigo',
            deeplinkTarget: 'open_match_center',
          },
        },
        updatedAt: '2026-04-16T11:54:00.000Z',
        createdBy: 'CRM bot',
      },
      cmp_stage_at_risk_wau: {
        id: 'cmp_stage_at_risk_wau',
        name: 'stage_at_risk_wau',
        goal: 'Retain at-risk weekly users',
        channel: 'push',
        status: 'active',
        audience: {
          segmentSource: 'manual_rules',
          sourceSegmentId: null,
          criteria: {
            retentionStages: [RetentionStage.AT_RISK_WAU],
            partnerId: null,
            locales: ['en', 'es', 'pt'],
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
          sendMode: 'immediately',
          delayMinutes: null,
          scheduledAt: null,
          timezoneMode: 'user_local',
          sendWindowStart: '16:00',
          sendWindowEnd: '19:00',
          frequencyCapHours: 24,
          stopOnGoalReached: true,
        },
        content: {
          en: {
            title: 'Your next pick is waiting, {{first_name}}',
            body: 'Open SirBro and catch up with the latest match insights.',
            fallbackFirstName: 'there',
            deeplinkTarget: 'open_match_center',
          },
          es: {
            title: 'Tu siguiente pick te espera, {{first_name}}',
            body: 'Abre SirBro y ponte al dia con los ultimos insights.',
            fallbackFirstName: 'amigo',
            deeplinkTarget: 'open_match_center',
          },
          pt: {
            title: 'Seu proximo pick esta te esperando',
            body: 'Abra o SirBro e veja os ultimos insights de partida.',
            fallbackFirstName: '',
            deeplinkTarget: 'open_match_center',
          },
        },
        updatedAt: '2026-04-16T11:32:00.000Z',
        createdBy: 'Natalia',
      },
      cmp_stage_dead_user: {
        id: 'cmp_stage_dead_user',
        name: 'stage_dead_user',
        goal: 'Bring back 30+ day inactive users',
        channel: 'push',
        status: 'scheduled',
        audience: {
          segmentSource: 'manual_rules',
          sourceSegmentId: null,
          criteria: {
            retentionStages: [RetentionStage.DEAD],
            partnerId: null,
            locales: ['en', 'es', 'pt'],
            requiresPushOptIn: true,
          },
          suppression: {
            excludeConvertedUsers: true,
            excludeRecentRecipients: true,
          },
          trigger: {
            type: 'scheduled_recurring',
            recurrenceRule:
              'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=8;BYMINUTE=30',
          },
        },
        timing: {
          sendMode: 'specific_datetime',
          delayMinutes: null,
          scheduledAt: '2026-04-17T08:30:00.000Z',
          timezoneMode: 'user_local',
          sendWindowStart: '08:00',
          sendWindowEnd: '22:00',
          frequencyCapHours: 48,
          stopOnGoalReached: true,
        },
        content: {
          en: {
            title: 'Come back for fresh rewards, {{first_name}}',
            body: 'Open SirBro and see what changed since your last visit.',
            fallbackFirstName: 'there',
            deeplinkTarget: 'open_rewards_wallet',
          },
          es: {
            title: 'Vuelve por nuevas recompensas, {{first_name}}',
            body: 'Abre SirBro y descubre lo nuevo desde tu ultima visita.',
            fallbackFirstName: 'amigo',
            deeplinkTarget: 'open_rewards_wallet',
          },
          pt: {
            title: 'Volte para novas recompensas',
            body: 'Abra o SirBro e veja o que mudou desde sua ultima visita.',
            fallbackFirstName: '',
            deeplinkTarget: 'open_rewards_wallet',
          },
        },
        updatedAt: '2026-04-16T10:00:00.000Z',
        createdBy: 'CRM bot',
      },
    }),
  ) as Record<string, CampaignDraft>;
}

/**
 * Creates the catalog used by the campaign editor.
 */
export function createInitialCampaignEditorCatalog(): CampaignEditorCatalog {
  return JSON.parse(
    JSON.stringify({
      savedSegments: SAVED_SEGMENTS,
      templates: TEMPLATES,
      tokens: TOKENS,
      deeplinkOptions: DEEPLINK_OPTIONS,
      eventTriggers: EVENT_TRIGGERS,
    }),
  ) as CampaignEditorCatalog;
}

/**
 * Creates the blank create-mode draft required by the implementation spec.
 */
export function createEmptyCampaignDraft(): CampaignDraft {
  return {
    id: null,
    name: '',
    goal: '',
    channel: 'push',
    status: 'draft',
    audience: {
      segmentSource: 'saved_segment',
      sourceSegmentId: 'seg_new_users_setup_dropoff',
      criteria: {
        retentionStages: [RetentionStage.NEW],
        partnerId: null,
        locales: ['en', 'es', 'pt'],
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
    content: {
      en: {
        title: '',
        body: '',
        fallbackFirstName: '',
        deeplinkTarget: 'continue_onboarding',
      },
      es: {
        title: '',
        body: '',
        fallbackFirstName: '',
        deeplinkTarget: 'continue_onboarding',
      },
      pt: {
        title: '',
        body: '',
        fallbackFirstName: '',
        deeplinkTarget: 'continue_onboarding',
      },
    },
    updatedAt: null,
    createdBy: 'spec-local-user',
  };
}

/**
 * Returns immutable saved segment definitions used to apply presets.
 */
export function createSavedSegmentDefinitionMap(): Record<
  string,
  CampaignAudienceDefinition
> {
  return JSON.parse(JSON.stringify(SAVED_SEGMENT_DEFINITIONS)) as Record<
    string,
    CampaignAudienceDefinition
  >;
}

/**
 * Returns immutable template definitions used to apply presets.
 */
export function createTemplateAudienceDefinitionMap(): Record<
  string,
  CampaignAudienceDefinition
> {
  return JSON.parse(JSON.stringify(TEMPLATE_AUDIENCE_DEFINITIONS)) as Record<
    string,
    CampaignAudienceDefinition
  >;
}

/**
 * Returns localized template content presets for the content step.
 */
export function createTemplateContentPresetMap(): typeof TEMPLATE_CONTENT_PRESETS {
  return JSON.parse(JSON.stringify(TEMPLATE_CONTENT_PRESETS)) as typeof TEMPLATE_CONTENT_PRESETS;
}
