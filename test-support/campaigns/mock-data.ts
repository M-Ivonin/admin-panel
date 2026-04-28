/**
 * Test-only seed factories for campaigns UI coverage.
 */

import { RetentionStage } from '@/lib/api/users';
import type {
  CampaignAudienceDefinition,
  CampaignDeeplinkTarget,
  CampaignDraft,
  CampaignsOverviewResponse,
  CampaignScenarioTemplateSummary,
  CampaignSavedSegmentSummary,
} from '@/modules/campaigns/contracts';
import {
  createBlankStepLocaleMap,
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
    audience: {
      estimate: 3200,
      currentEstimate: 2740,
      label: 'Pre-Reg Onboarding Incomplete',
    },
    timing: { label: 'Next send', timestamp: '2026-04-16T18:20:00.000Z' },
    progress: {
      sentCount: 1072,
      totalCount: 3200,
      failedCount: 120,
      skippedCount: 8,
      inProgressCount: 2000,
      openCount: 200,
      deliveredRate: 89.9,
      ctr: 18.7,
      progressPercent: 33.5,
      uniqueRecipientCount: 2400,
      journeyInstanceCount: 2400,
      deliveryRowCount: 3200,
      failureReasons: [
        { reason: 'invalid_fcm_token', count: 72 },
        { reason: 'missing_fcm_token', count: 48 },
      ],
    },
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
    audience: {
      estimate: 9100,
      currentEstimate: 8840,
      label: 'All active stages',
    },
    timing: { label: 'Last send', timestamp: '2026-04-16T16:45:00.000Z' },
    progress: {
      sentCount: 6840,
      totalCount: 9100,
      failedCount: 230,
      skippedCount: 430,
      inProgressCount: 1600,
      openCount: 1512,
      deliveredRate: 96.7,
      ctr: 22.1,
      progressPercent: 75.2,
      uniqueRecipientCount: 8200,
      journeyInstanceCount: 8200,
      deliveryRowCount: 9100,
      failureReasons: [{ reason: 'firebase_not_delivered', count: 230 }],
    },
    metric: {
      label: 'ctr',
      value: '22.1%',
      traceGoalEventCount: 0,
      untracedGoalEventCount: 0,
      sourceEventsWithoutUserCount: 0,
    },
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
    audience: { estimate: 11000, currentEstimate: 10820, label: 'At-risk WAU' },
    timing: { label: 'Next send', timestamp: '2026-04-16T19:00:00.000Z' },
    progress: {
      sentCount: 9022,
      totalCount: 11000,
      failedCount: 380,
      skippedCount: 0,
      inProgressCount: 1598,
      openCount: 1479,
      deliveredRate: 96,
      ctr: 16.4,
      progressPercent: 82,
      uniqueRecipientCount: 10400,
      journeyInstanceCount: 10400,
      deliveryRowCount: 11000,
      failureReasons: [{ reason: 'invalid_fcm_token', count: 380 }],
    },
    metric: {
      label: 'ctr',
      value: '16.4%',
      traceGoalEventCount: 24,
      untracedGoalEventCount: 11,
      sourceEventsWithoutUserCount: 3,
    },
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
    audience: { estimate: 5320, currentEstimate: 4890, label: 'Dead users' },
    timing: {
      label: 'First evaluation',
      timestamp: '2026-04-17T08:30:00.000Z',
    },
    progress: {
      sentCount: 0,
      totalCount: 5320,
      failedCount: 0,
      skippedCount: 0,
      inProgressCount: 0,
      openCount: 0,
      deliveredRate: 0,
      ctr: 0,
      progressPercent: 0,
      uniqueRecipientCount: 0,
      journeyInstanceCount: 0,
      deliveryRowCount: 0,
      failureReasons: [],
    },
    metric: {
      label: 'goal',
      value: 'Bring back 30+ day inactive users',
      traceGoalEventCount: 0,
      untracedGoalEventCount: 0,
      sourceEventsWithoutUserCount: 0,
    },
    owner: { ownerName: 'CRM bot', activityLabel: 'Scheduled 2 hours ago' },
    updatedAt: '2026-04-16T10:00:00.000Z',
    localeReadiness: { en: 'ready', es: 'ready', pt: 'warning' },
  },
];

const SAVED_SEGMENTS: CampaignSavedSegmentSummary[] = [
  {
    id: 'seg_new_users_setup_dropoff',
    name: 'Pre-Reg Onboarding Incomplete',
    description: '3,200 reachable · started onboarding but not registered',
    audienceEstimate: 3200,
    audienceDefinition: {
      segmentSource: 'saved_segment',
      sourceSegmentId: 'seg_new_users_setup_dropoff',
      criteria: {
        retentionStages: [RetentionStage.PRE_REG_ONBOARDING_INCOMPLETE],
        userIds: [],
        locales: ['en', 'es', 'pt'],
      },
      suppression: {
        excludeUsersWithoutPushOpens: false,
      },
    },
    source: 'saved_segment',
    displayOrder: 10,
    chipColor: '#06b6d4',
  },
  {
    id: 'seg_new_users',
    name: 'New Users',
    description: 'Registered users in their first active lifecycle window.',
    audienceEstimate: 12480,
    audienceDefinition: {
      segmentSource: 'saved_segment',
      sourceSegmentId: 'seg_new_users',
      criteria: {
        retentionStages: [RetentionStage.NEW],
        userIds: [],
        locales: ['en', 'es', 'pt'],
      },
      suppression: {
        excludeUsersWithoutPushOpens: false,
      },
    },
    source: 'saved_segment',
    displayOrder: 20,
    chipColor: '#2563eb',
  },
  {
    id: 'seg_current_users',
    name: 'Current Users',
    description: 'Recently active registered users.',
    audienceEstimate: 9100,
    audienceDefinition: {
      segmentSource: 'saved_segment',
      sourceSegmentId: 'seg_current_users',
      criteria: {
        retentionStages: [RetentionStage.CURRENT],
        userIds: [],
        locales: ['en', 'es', 'pt'],
      },
      suppression: {
        excludeUsersWithoutPushOpens: false,
      },
    },
    source: 'saved_segment',
    displayOrder: 30,
    chipColor: '#16a34a',
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
        excludeUsersWithoutPushOpens: false,
      },
    },
    source: 'saved_segment',
    displayOrder: 40,
    chipColor: '#d97706',
  },
  {
    id: 'seg_at_risk_mau',
    name: 'At-risk MAU',
    description:
      'Inactive today and the last 1-6 days, but active during the last 7-29 days.',
    audienceEstimate: 7800,
    audienceDefinition: {
      segmentSource: 'saved_segment',
      sourceSegmentId: 'seg_at_risk_mau',
      criteria: {
        retentionStages: [RetentionStage.AT_RISK_MAU],
        userIds: [],
        locales: ['en', 'es', 'pt'],
      },
      suppression: {
        excludeUsersWithoutPushOpens: false,
      },
    },
    source: 'saved_segment',
    displayOrder: 50,
    chipColor: '#ea580c',
  },
  {
    id: 'seg_dead_user',
    name: 'Dead Users',
    description: 'Inactive for 30+ days.',
    audienceEstimate: 5320,
    audienceDefinition: {
      segmentSource: 'saved_segment',
      sourceSegmentId: 'seg_dead_user',
      criteria: {
        retentionStages: [RetentionStage.DEAD],
        userIds: [],
        locales: ['en', 'es', 'pt'],
      },
      suppression: {
        excludeUsersWithoutPushOpens: false,
      },
    },
    source: 'saved_segment',
    displayOrder: 60,
    chipColor: '#6b7280',
  },
  {
    id: 'seg_reactivated',
    name: 'Reactivated',
    description: 'First day back after 7-29 days away.',
    audienceEstimate: 4120,
    audienceDefinition: {
      segmentSource: 'saved_segment',
      sourceSegmentId: 'seg_reactivated',
      criteria: {
        retentionStages: [RetentionStage.REACTIVATED],
        userIds: [],
        locales: ['en', 'es', 'pt'],
      },
      suppression: {
        excludeUsersWithoutPushOpens: false,
      },
    },
    source: 'saved_segment',
    displayOrder: 70,
    chipColor: '#7c3aed',
  },
  {
    id: 'seg_resurrected',
    name: 'Resurrected',
    description: 'First day back after 30+ days away.',
    audienceEstimate: 2800,
    audienceDefinition: {
      segmentSource: 'saved_segment',
      sourceSegmentId: 'seg_resurrected',
      criteria: {
        retentionStages: [RetentionStage.RESURRECTED],
        userIds: [],
        locales: ['en', 'es', 'pt'],
      },
      suppression: {
        excludeUsersWithoutPushOpens: false,
      },
    },
    source: 'saved_segment',
    displayOrder: 80,
    chipColor: '#db2777',
  },
];

const SAVED_SEGMENT_DEFINITIONS: Record<string, CampaignAudienceDefinition> = {
  seg_new_users_setup_dropoff: {
    segmentSource: 'saved_segment',
    sourceSegmentId: 'seg_new_users_setup_dropoff',
    criteria: {
      retentionStages: [RetentionStage.PRE_REG_ONBOARDING_INCOMPLETE],
      userIds: [],
      locales: ['en', 'es', 'pt'],
    },
    suppression: {
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
      excludeUsersWithoutPushOpens: false,
    },
  },
};

function buildMultiStepContent(
  firstTarget: CampaignDeeplinkTarget | null,
  secondTarget: CampaignDeeplinkTarget | null,
  thirdTarget: CampaignDeeplinkTarget | null
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
    step_3: {
      ...createBlankStepLocaleMap(thirdTarget),
      en: {
        title: 'Finish setup today',
        body: 'Your personalized football feed is waiting after one last step.',
        fallbackFirstName: 'there',
        deeplinkTarget: thirdTarget,
      },
      es: {
        title: 'Termina la configuracion hoy',
        body: 'Tu feed de futbol personalizado te espera tras un ultimo paso.',
        fallbackFirstName: 'amigo',
        deeplinkTarget: thirdTarget,
      },
      pt: {
        title: 'Finalize a configuracao hoje',
        body: 'Seu feed de futebol personalizado espera apos a ultima etapa.',
        fallbackFirstName: '',
        deeplinkTarget: thirdTarget,
      },
    },
  };
}

const SCENARIO_TEMPLATES: CampaignScenarioTemplateSummary[] = [
  {
    id: 'tpl_onboarding_recovery',
    name: 'Onboarding recovery',
    description:
      'Three-step recovery flow for pre-registration users who did not finish setup.',
    source: 'shipped',
    definition: {
      name: 'Onboarding recovery',
      goal: 'Recover onboarding completion',
      goalDefinition: {
        eventKey: 'onboarding_completed',
        attributionMode: 'global_state_event',
      },
      channel: 'push',
      audience: SAVED_SEGMENT_DEFINITIONS.seg_new_users_setup_dropoff,
      trigger: {
        type: 'state_based',
        qualificationMode: 'when_user_matches_audience',
        reentryCooldownHours: 24,
      },
      journey: {
        steps: [
          createJourneyStep(1),
          createJourneyStep(2),
          createJourneyStep(3),
        ],
      },
      content: buildMultiStepContent(
        'continue_onboarding',
        'continue_onboarding',
        'continue_onboarding'
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
      goalDefinition: {
        eventKey: 'match_center_opened',
        attributionMode: 'trace_required_response',
      },
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
          excludeUsersWithoutPushOpens: false,
        },
      },
      trigger: {
        type: 'event_based',
        eventKey: 'favorite_match_kickoff',
        producerKey: 'channels_favorite_matches',
        entryMode: 'first_eligible_event',
        reentryCooldownHours: 24,
        maxSendsPerUser: 3,
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
        failedToday: 4200,
        attemptedToday: 129000,
        deliveredRateToday: 96.7,
        deliveredRate: 93.4,
        attemptedTotal: 2100000,
        deliveredTotal: 1961400,
        failedTotal: 138600,
        openedTotal: 366842,
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
  const thirdStep = createJourneyStep(3);

  return JSON.parse(
    JSON.stringify({
      cmp_onboarding_not_completed: {
        id: 'cmp_onboarding_not_completed',
        name: 'onboarding_not_completed',
        goal: 'Recover onboarding completion',
        goalDefinition: {
          eventKey: 'onboarding_completed',
          attributionMode: 'global_state_event',
        },
        channel: 'push',
        status: 'active',
        audience: SAVED_SEGMENT_DEFINITIONS.seg_new_users_setup_dropoff,
        trigger: {
          type: 'state_based',
          qualificationMode: 'when_user_matches_audience',
          reentryCooldownHours: 24,
        },
        journey: {
          steps: [firstStep, secondStep, thirdStep],
        },
        content: buildMultiStepContent(
          'continue_onboarding',
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
        goalDefinition: {
          eventKey: 'match_center_opened',
          attributionMode: 'trace_required_response',
        },
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
            excludeUsersWithoutPushOpens: false,
          },
        },
        trigger: {
          type: 'event_based',
          eventKey: 'favorite_match_kickoff',
          producerKey: 'channels_favorite_matches',
          entryMode: 'first_eligible_event',
          reentryCooldownHours: 24,
          maxSendsPerUser: 3,
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
        goalDefinition: {
          eventKey: 'match_center_opened',
          attributionMode: 'trace_required_response',
        },
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
            excludeUsersWithoutPushOpens: false,
          },
        },
        trigger: {
          type: 'scheduled_recurring',
          recurrenceRule:
            'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=8;BYMINUTE=30',
          timezoneMode: 'user_local',
          startDate: '2026-04-17',
          maxOccurrences: 3,
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
 * Returns the seeded saved segments consumed by the editor catalog.
 */
export function createInitialSavedSegments(): CampaignSavedSegmentSummary[] {
  return JSON.parse(
    JSON.stringify(SAVED_SEGMENTS)
  ) as CampaignSavedSegmentSummary[];
}

/**
 * Returns the seeded scenario templates consumed by the editor catalog.
 */
export function createInitialScenarioTemplates(): CampaignScenarioTemplateSummary[] {
  return JSON.parse(
    JSON.stringify(SCENARIO_TEMPLATES)
  ) as CampaignScenarioTemplateSummary[];
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
