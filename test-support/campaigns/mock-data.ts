/**
 * Test-only seed factories for campaigns UI coverage.
 */

import { RetentionStage } from '@/lib/api/users';
import type {
  CampaignAudienceDefinition,
  CampaignDraft,
  CampaignEditorCatalog,
  CampaignsOverviewResponse,
  CampaignScenarioTemplateSummary,
  CampaignSavedSegmentSummary,
  CampaignSourceEventOption,
  CampaignTokenDefinition,
  CampaignDeeplinkOption,
} from '@/modules/campaigns/contracts';
import {
  createBlankStepLocaleMap,
  createEmptyCampaignDraft as createDefaultEmptyCampaignDraft,
  createJourneyStep,
} from '@/modules/campaigns/defaults';

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
    owner: {
      ownerName: 'CRM bot',
      activityLabel: 'Paused by Natalia 6 min ago',
    },
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
    audienceDefinition: {
      segmentSource: 'saved_segment',
      sourceSegmentId: 'seg_new_users_setup_dropoff',
      criteria: {
        retentionStages: [RetentionStage.NEW],
        userIds: [],
        locales: ['en', 'es', 'pt'],
      },
      suppression: {
        excludeConvertedUsers: true,
        excludeUsersWithoutPushOpens: false,
      },
    },
    source: 'saved_segment',
  },
  {
    id: 'seg_at_risk_wau',
    name: 'At-risk WAU',
    description: 'Inactive today, but active during the last 1–6 days.',
    audienceEstimate: 8920,
    audienceDefinition: {
      segmentSource: 'saved_segment',
      sourceSegmentId: 'seg_at_risk_wau',
      criteria: {
        retentionStages: [RetentionStage.AT_RISK_WAU],
        userIds: [],
        locales: ['en', 'es', 'pt'],
      },
      suppression: {
        excludeConvertedUsers: true,
        excludeUsersWithoutPushOpens: false,
      },
    },
    source: 'saved_segment',
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

const SOURCE_EVENTS: CampaignSourceEventOption[] = [
  {
    eventKey: 'app_opened',
    producerKey: 'crm_source_events',
    label: 'Opened app',
    description:
      'User opened the app and the mobile app sent the authenticated CRM source event.',
  },
  {
    eventKey: 'onboarding_completed',
    producerKey: 'crm_source_events',
    label: 'Completed onboarding',
    description:
      'User completed onboarding and the mobile app sent the public CRM source event.',
  },
  {
    eventKey: 'subscription_started',
    producerKey: 'crm_source_events',
    label: 'Started subscription',
    description:
      'User started a paid subscription and the backend emitted the CRM source event from a store purchase or Stripe invoice.',
  },
  {
    eventKey: 'subscription_renewed',
    producerKey: 'crm_source_events',
    label: 'Renewed subscription',
    description:
      'User renewed an active subscription and the backend emitted the CRM source event from a store or Stripe renewal.',
  },
  {
    eventKey: 'in_app_purchase_completed',
    producerKey: 'crm_source_events',
    label: 'Completed in-app purchase',
    description:
      'User completed a one-time in-app purchase and the backend emitted the CRM source event from the store verification flow.',
  },
  {
    eventKey: 'daily_streak_reminder',
    producerKey: 'crm_source_events',
    label: 'Daily streak reminder',
    description:
      'User had a streak yesterday but no activity today, and the CRM scheduler emitted the reminder source event.',
  },
  {
    eventKey: 'weekly_quest_urgency',
    producerKey: 'crm_source_events',
    label: 'Weekly quest urgency',
    description:
      'User is close to finishing the weekly quest and the CRM scheduler emitted the urgency source event.',
  },
  {
    eventKey: 'favorite_match_kickoff',
    producerKey: 'channels_favorite_matches',
    label: 'Favorite match kickoff',
    description:
      'A favorite team or league match is close to kickoff and the channels service emitted a source event.',
  },
  {
    eventKey: 'weekly_stats_digest',
    producerKey: 'crm_source_events',
    label: 'Weekly stats digest',
    description:
      'Weekly stats digest is ready for the user and the CRM scheduler emitted the digest source event.',
  },
  {
    eventKey: 'unread_social_activity',
    producerKey: 'crm_source_events',
    label: 'Unread social activity',
    description:
      'User has unread channel activity and the CRM scheduler emitted the social activity source event.',
  },
  {
    eventKey: 'live_challenge_starting_soon',
    producerKey: 'crm_source_events',
    label: 'Live challenge starting soon',
    description:
      'A joined live challenge starts soon and the backend emitted the CRM source event.',
  },
  {
    eventKey: 'live_challenge_results',
    producerKey: 'crm_source_events',
    label: 'Live challenge results available',
    description:
      'A live challenge finished and the backend emitted the results source event.',
  },
];

const SAVED_SEGMENT_DEFINITIONS: Record<string, CampaignAudienceDefinition> = {
  seg_new_users_setup_dropoff: {
    segmentSource: 'saved_segment',
    sourceSegmentId: 'seg_new_users_setup_dropoff',
    criteria: {
      retentionStages: [RetentionStage.NEW],
      userIds: [],
      locales: ['en', 'es', 'pt'],
    },
    suppression: {
      excludeConvertedUsers: true,
      excludeUsersWithoutPushOpens: false,
    },
  },
  seg_at_risk_wau: {
    segmentSource: 'saved_segment',
    sourceSegmentId: 'seg_at_risk_wau',
    criteria: {
      retentionStages: [RetentionStage.AT_RISK_WAU],
      userIds: [],
      locales: ['en', 'es', 'pt'],
    },
    suppression: {
      excludeConvertedUsers: true,
      excludeUsersWithoutPushOpens: false,
    },
  },
};

function buildMultiStepContent(
  firstTarget:
    | 'continue_onboarding'
    | 'open_match_center'
    | 'open_rewards_wallet',
  secondTarget:
    | 'continue_onboarding'
    | 'open_match_center'
    | 'open_rewards_wallet'
): CampaignDraft['content'] {
  return {
    step_1: {
      ...createBlankStepLocaleMap(firstTarget),
      en: {
        title: 'Complete your setup, {{first_name}}',
        body: 'Open SirBro now and finish the final onboarding steps.',
        fallbackFirstName: 'there',
        deeplinkTarget: firstTarget,
      },
      es: {
        title: 'Completa tu configuracion, {{first_name}}',
        body: 'Abre SirBro y termina los ultimos pasos del onboarding.',
        fallbackFirstName: 'amigo',
        deeplinkTarget: firstTarget,
      },
      pt: {
        title: 'Conclua sua configuracao',
        body: 'Abra o SirBro e finalize as etapas do onboarding.',
        fallbackFirstName: '',
        deeplinkTarget: firstTarget,
      },
    },
    step_2: {
      ...createBlankStepLocaleMap(secondTarget),
      en: {
        title: 'Still one step left',
        body: 'Come back and finish your setup journey.',
        fallbackFirstName: 'there',
        deeplinkTarget: secondTarget,
      },
      es: {
        title: 'Aun falta un paso',
        body: 'Vuelve y completa tu journey de setup.',
        fallbackFirstName: 'amigo',
        deeplinkTarget: secondTarget,
      },
      pt: {
        title: 'Ainda falta um passo',
        body: 'Volte e conclua sua jornada de setup.',
        fallbackFirstName: '',
        deeplinkTarget: secondTarget,
      },
    },
  };
}

const SCENARIO_TEMPLATES: CampaignScenarioTemplateSummary[] = [
  {
    id: 'tpl_onboarding_recovery',
    name: 'Onboarding recovery',
    description:
      'Three-step recovery flow for new users who did not finish setup.',
    source: 'shipped',
    definition: {
      name: 'Onboarding recovery',
      goal: 'Recover onboarding completion',
      channel: 'push',
      audience: SAVED_SEGMENT_DEFINITIONS.seg_new_users_setup_dropoff,
      trigger: {
        type: 'state_based',
        qualificationMode: 'when_user_matches_audience',
        reentryCooldownHours: 24,
      },
      journey: {
        steps: [createJourneyStep(1), createJourneyStep(2)],
      },
      content: buildMultiStepContent(
        'continue_onboarding',
        'continue_onboarding',
      ),
    },
  },
  {
    id: 'tpl_favorite_match_kickoff',
    name: 'Favorite match kickoff',
    description:
      'Event-driven reminder before kickoff with a direct link into match center.',
    source: 'shipped',
    definition: {
      name: 'Favorite match kickoff',
      goal: 'Drive match-center opens',
      channel: 'push',
      audience: {
        segmentSource: 'manual_rules',
        sourceSegmentId: null,
        criteria: {
          retentionStages: [
            RetentionStage.NEW,
            RetentionStage.CURRENT,
            RetentionStage.AT_RISK_WAU,
            RetentionStage.AT_RISK_MAU,
            RetentionStage.REACTIVATED,
            RetentionStage.RESURRECTED,
          ],
          userIds: [],
          locales: ['en', 'es', 'pt'],
        },
        suppression: {
          excludeConvertedUsers: false,
          excludeUsersWithoutPushOpens: false,
        },
      },
      trigger: {
        type: 'event_based',
        eventKey: 'favorite_match_kickoff',
        producerKey: 'channels_favorite_matches',
        entryMode: 'first_eligible_event',
        reentryCooldownHours: 24,
      },
      journey: {
        steps: [{ ...createJourneyStep(1), delayMinutes: 0 }],
      },
      content: {
        step_1: {
          ...createBlankStepLocaleMap('open_match_center'),
          en: {
            title: '{{favorite_team}} kicks off soon',
            body: 'Open match center before the first whistle.',
            fallbackFirstName: 'there',
            deeplinkTarget: 'open_match_center',
          },
          es: {
            title: '{{favorite_team}} empieza pronto',
            body: 'Abre el match center antes del pitazo inicial.',
            fallbackFirstName: 'amigo',
            deeplinkTarget: 'open_match_center',
          },
          pt: {
            title: '{{favorite_team}} comeca em breve',
            body: 'Abra o match center antes do apito inicial.',
            fallbackFirstName: 'amigo',
            deeplinkTarget: 'open_match_center',
          },
        },
      },
    },
  },
];

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
    })
  ) as CampaignsOverviewResponse;
}

/**
 * Creates the initial mutable draft map for seeded campaigns.
 */
export function createInitialCampaignDraftMap(): Record<string, CampaignDraft> {
  const firstStep = createJourneyStep(1);
  const secondStep = createJourneyStep(2);

  return JSON.parse(
    JSON.stringify({
      cmp_onboarding_not_completed: {
        id: 'cmp_onboarding_not_completed',
        name: 'onboarding_not_completed',
        goal: 'Recover onboarding completion',
        channel: 'push',
        status: 'active',
        audience: SAVED_SEGMENT_DEFINITIONS.seg_new_users_setup_dropoff,
        trigger: {
          type: 'state_based',
          qualificationMode: 'when_user_matches_audience',
          reentryCooldownHours: 24,
        },
        journey: {
          steps: [firstStep, secondStep],
        },
        content: buildMultiStepContent(
          'continue_onboarding',
          'continue_onboarding'
        ),
        updatedAt: '2026-04-16T11:48:00.000Z',
        createdBy: 'Natalia',
      },
      cmp_favorite_match_kickoff: {
        id: 'cmp_favorite_match_kickoff',
        name: 'favorite_match_kickoff',
        goal: 'Drive match-center opens',
        channel: 'push',
        status: 'paused',
        audience: {
          segmentSource: 'manual_rules',
          sourceSegmentId: null,
          criteria: {
            retentionStages: [
              RetentionStage.CURRENT,
              RetentionStage.REACTIVATED,
            ],
            userIds: [],
            locales: ['en', 'es', 'pt'],
          },
          suppression: {
            excludeConvertedUsers: false,
            excludeUsersWithoutPushOpens: false,
          },
        },
        trigger: {
          type: 'event_based',
          eventKey: 'favorite_match_kickoff',
          producerKey: 'channels_favorite_matches',
          entryMode: 'first_eligible_event',
          reentryCooldownHours: 24,
        },
        journey: {
          steps: [firstStep],
        },
        content: {
          step_1: {
            ...createBlankStepLocaleMap('open_match_center'),
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
        audience: SAVED_SEGMENT_DEFINITIONS.seg_at_risk_wau,
        trigger: {
          type: 'state_based',
          qualificationMode: 'when_user_matches_audience',
          reentryCooldownHours: 24,
        },
        journey: {
          steps: [firstStep],
        },
        content: {
          step_1: {
            ...createBlankStepLocaleMap('open_match_center'),
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
            userIds: [],
            locales: ['en', 'es', 'pt'],
          },
          suppression: {
            excludeConvertedUsers: true,
            excludeUsersWithoutPushOpens: false,
          },
        },
        trigger: {
          type: 'scheduled_recurring',
          recurrenceRule:
            'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=8;BYMINUTE=30',
          timezoneMode: 'user_local',
        },
        journey: {
          steps: [firstStep],
        },
        content: {
          step_1: {
            ...createBlankStepLocaleMap('open_rewards_wallet'),
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
        },
        updatedAt: '2026-04-16T10:00:00.000Z',
        createdBy: 'CRM bot',
      },
    })
  ) as Record<string, CampaignDraft>;
}

/**
 * Creates the catalog used by the campaign editor.
 */
export function createInitialCampaignEditorCatalog(): CampaignEditorCatalog {
  return JSON.parse(
    JSON.stringify({
      savedSegments: SAVED_SEGMENTS,
      scenarioTemplates: SCENARIO_TEMPLATES,
      tokens: TOKENS,
      deeplinkOptions: DEEPLINK_OPTIONS,
      sourceEvents: SOURCE_EVENTS,
    })
  ) as CampaignEditorCatalog;
}

/**
 * Creates the blank create-mode draft required by the implementation spec.
 */
export function createEmptyCampaignDraft(): CampaignDraft {
  return createDefaultEmptyCampaignDraft(createInitialCampaignEditorCatalog());
}

/**
 * Returns immutable saved segment definitions used by the lifecycle library.
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
