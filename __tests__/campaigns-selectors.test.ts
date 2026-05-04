import { RetentionStage } from '@/lib/api/users';
import { CAMPAIGN_GOAL_REWARD_POINTS_MAX } from '@/modules/campaigns/contracts';
import {
  createEmptyCampaignDraft,
  createJourneyStep,
  createScheduledCampaignTrigger,
} from '@/modules/campaigns/defaults';
import {
  buildCampaignReviewModel,
  canScheduleCampaign,
  getCampaignLocaleReadiness,
  getCampaignValidationSummary,
  MISSING_TRACKED_GOAL_WARNING,
} from '@/modules/campaigns/selectors';

describe('campaign selectors', () => {
  it('returns a PT warning when localized content is incomplete', () => {
    const draft = createEmptyCampaignDraft();
    draft.content.step_1.pt.title = 'Volte agora';
    draft.content.step_1.pt.body = '';

    const readiness = getCampaignLocaleReadiness(draft.content);

    expect(readiness.pt).toBe('warning');
  });

  it('marks recurring campaigns invalid when the recurrence rule is missing', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Recurring';
    draft.goal = 'Weekly check-in';
    draft.trigger = {
      ...createScheduledCampaignTrigger(),
      recurrenceRule: '',
    };

    const summary = getCampaignValidationSummary(draft);

    expect(summary.errors).toContain(
      'Recurring campaigns require an RFC5545 RRULE.'
    );
  });

  it('blocks scheduling when the recurrence rule is not a supported daily or weekly local-time rule', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Recurring';
    draft.goal = 'Weekly check-in';
    draft.audience.criteria.retentionStages = [RetentionStage.NEW];
    draft.trigger = {
      ...createScheduledCampaignTrigger(),
      recurrenceRule: 'FREQ=MONTHLY;BYHOUR=9;BYMINUTE=0',
    };

    const summary = getCampaignValidationSummary(draft);

    expect(summary.errors).toContain(
      'Recurring campaigns require a valid daily or weekly local-time schedule.'
    );
    expect(canScheduleCampaign(draft)).toBe(false);
  });

  it('blocks event-based campaigns when max sends per user is not positive', () => {
    const draft = createEmptyCampaignDraft();
    draft.trigger = {
      type: 'event_based',
      eventKey: 'app_opened',
      producerKey: 'crm_source_events',
      entryMode: 'first_eligible_event',
      reentryCooldownHours: 24,
      maxSendsPerUser: 0,
    };

    const summary = getCampaignValidationSummary(draft);

    expect(summary.errors).toContain(
      'Event-based campaigns require a positive max sends per user value.'
    );
  });

  it('blocks scheduling when the recurring start date is missing', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Recurring';
    draft.goal = 'Weekly check-in';
    draft.audience.criteria.retentionStages = [RetentionStage.NEW];
    draft.trigger = {
      ...createScheduledCampaignTrigger(),
      startDate: null,
    };

    const summary = getCampaignValidationSummary(draft);

    expect(summary.errors).toContain(
      'Recurring campaigns require a valid start date.'
    );
  });

  it('warns when {{first_name}} is used without a locale fallback', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Token test';
    draft.goal = 'Validate fallback';
    draft.content.step_1.en.title = 'Hello {{first_name}}';
    draft.content.step_1.en.body = 'Welcome back';
    draft.content.step_1.es.title = 'Hola';
    draft.content.step_1.es.body = 'Bienvenido';
    draft.content.step_1.pt.title = 'Ola';
    draft.content.step_1.pt.body = 'Bem-vindo';

    const summary = getCampaignValidationSummary(draft);

    expect(summary.warnings).toContain(
      'Every locale using {{first_name}} needs a fallback value.'
    );
  });

  it('warns when no tracked goal is selected without blocking scheduling', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover authorization completion';
    draft.goalDefinition = null;
    draft.content.step_1.en = {
      title: 'Hello {{first_name}}',
      body: 'Finish setup',
      fallbackFirstName: 'there',
      deeplinkTarget: 'continue_onboarding',
    };
    draft.content.step_1.es = {
      title: 'Hola {{first_name}}',
      body: 'Completa tu setup',
      fallbackFirstName: 'amigo',
      deeplinkTarget: 'continue_onboarding',
    };
    draft.content.step_1.pt = {
      title: 'Ola {{first_name}}',
      body: 'Conclua seu setup',
      fallbackFirstName: 'amigo',
      deeplinkTarget: 'continue_onboarding',
    };

    const summary = getCampaignValidationSummary(draft);

    expect(summary.warnings).toContain(MISSING_TRACKED_GOAL_WARNING);
    expect(canScheduleCampaign(draft)).toBe(true);
  });

  it('blocks scheduling when goal reward points exceed the supported points range', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover authorization completion';
    draft.goalDefinition = {
      eventKey: 'match_center_opened',
      attributionMode: 'trace_required_response',
      rewardPoints: CAMPAIGN_GOAL_REWARD_POINTS_MAX + 1,
    };
    draft.content.step_1.en = {
      title: 'Open match center',
      body: 'See fresh fixtures',
      fallbackFirstName: 'there',
      deeplinkTarget: 'open_match_center',
    };

    const summary = getCampaignValidationSummary(draft);

    expect(summary.errors).toContain(
      `Goal reward points must be zero or a positive whole number no greater than ${CAMPAIGN_GOAL_REWARD_POINTS_MAX}.`
    );
    expect(canScheduleCampaign(draft)).toBe(false);
  });

  it('blocks scheduling when any selected locale is missing for any journey step', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover authorization completion';
    draft.audience.criteria.retentionStages = [RetentionStage.NEW];
    draft.audience.criteria.locales = ['en', 'es'];
    draft.journey.steps = [createJourneyStep(1), createJourneyStep(2)];
    draft.content.step_2 = {
      en: {
        title: 'Second step',
        body: 'Ready',
        fallbackFirstName: 'there',
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
    };
    draft.content.step_1.en = {
      title: 'Hello {{first_name}}',
      body: 'Finish setup',
      fallbackFirstName: 'there',
      deeplinkTarget: 'continue_onboarding',
    };
    draft.content.step_1.es = {
      title: 'Hola {{first_name}}',
      body: 'Completa tu setup',
      fallbackFirstName: 'amigo',
      deeplinkTarget: 'continue_onboarding',
    };

    expect(canScheduleCampaign(draft)).toBe(false);
  });

  it('enables scheduling once required content is ready across every step', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover authorization completion';
    draft.audience.criteria.retentionStages = [RetentionStage.NEW];
    draft.audience.criteria.locales = ['en', 'es', 'pt'];
    draft.journey.steps = [createJourneyStep(1), createJourneyStep(2)];
    draft.content.step_1 = {
      en: {
        title: 'Hello {{first_name}}',
        body: 'Finish setup',
        fallbackFirstName: 'there',
        deeplinkTarget: 'continue_onboarding',
      },
      es: {
        title: 'Hola {{first_name}}',
        body: 'Completa tu setup',
        fallbackFirstName: 'amigo',
        deeplinkTarget: 'continue_onboarding',
      },
      pt: {
        title: 'Ola {{first_name}}',
        body: 'Conclua seu setup',
        fallbackFirstName: 'amigo',
        deeplinkTarget: 'continue_onboarding',
      },
    };
    draft.content.step_2 = {
      en: {
        title: 'Second step',
        body: 'Back again',
        fallbackFirstName: 'there',
        deeplinkTarget: 'continue_onboarding',
      },
      es: {
        title: 'Segundo paso',
        body: 'Vuelve otra vez',
        fallbackFirstName: 'amigo',
        deeplinkTarget: 'continue_onboarding',
      },
      pt: {
        title: 'Segundo passo',
        body: 'Volte mais uma vez',
        fallbackFirstName: 'amigo',
        deeplinkTarget: 'continue_onboarding',
      },
    };

    expect(canScheduleCampaign(draft)).toBe(true);
  });

  it('summarizes Match center opened send guards on journey steps', () => {
    const draft = createEmptyCampaignDraft();
    draft.journey.steps[0].sendGuards = [{ action: 'match_center_opened' }];

    const reviewModel = buildCampaignReviewModel(draft);
    const summary = getCampaignValidationSummary(draft);

    expect(reviewModel.journey[0].value).toContain(
      'skips if Opened match center since journey start'
    );
    expect(summary.errors).not.toContain(
      'Step step_1 has an unsupported send guard.'
    );
  });

  it('rejects multiple send guards on one journey step', () => {
    const draft = createEmptyCampaignDraft();
    draft.journey.steps[0].sendGuards = [
      { action: 'opened_app' },
      { action: 'match_center_opened' },
    ];

    const summary = getCampaignValidationSummary(draft);

    expect(summary.errors).toContain(
      'Step step_1 supports only one send guard.'
    );
  });

  it('summarizes backend activation send guards on journey steps', () => {
    const draft = createEmptyCampaignDraft();
    draft.journey.steps[0].sendGuards = [
      { action: 'voted_for_prediction' },
    ];

    const reviewModel = buildCampaignReviewModel(draft);
    const summary = getCampaignValidationSummary(draft);

    expect(reviewModel.journey[0].value).toContain(
      'skips if Voted for prediction since journey start'
    );
    expect(summary.errors).not.toContain(
      'Step step_1 has an unsupported send guard.'
    );
  });

  it('summarizes new backend activation tracked goals', () => {
    const draft = createEmptyCampaignDraft();
    draft.goalDefinition = {
      eventKey: 'chat_in_ai_chat',
      attributionMode: 'global_state_event',
    };

    const reviewModel = buildCampaignReviewModel(draft);

    expect(reviewModel.basics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Tracked goal',
          value: 'Chatted in AI chat',
        }),
      ])
    );
  });

  it('rejects unsupported send guard conditions', () => {
    const draft = createEmptyCampaignDraft();
    draft.journey.steps[0].sendGuards = [
      {
        action: 'opened_app',
        propertyMatches: [
          { propertyKey: 'device.meta', expectedValue: 'ios' },
        ],
      } as any,
    ];

    const summary = getCampaignValidationSummary(draft);

    expect(summary.errors).toContain(
      'Step step_1 has unsupported send guard conditions.'
    );
  });

  it('allows scheduling when selected locales need review but are not missing', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover authorization completion';
    draft.audience.criteria.retentionStages = [RetentionStage.NEW];
    draft.audience.criteria.locales = ['en', 'pt'];
    draft.content.step_1.en = {
      title: 'Hello {{first_name}}',
      body: 'Finish setup',
      fallbackFirstName: 'there',
      deeplinkTarget: 'continue_onboarding',
    };
    draft.content.step_1.pt = {
      title: 'Ola {{first_name}}',
      body: 'Conclua seu setup',
      fallbackFirstName: '',
      deeplinkTarget: 'continue_onboarding',
    };

    expect(getCampaignValidationSummary(draft).readiness.pt).toBe('warning');
    expect(canScheduleCampaign(draft)).toBe(true);
  });

  it('allows specific-user audiences without retention stages', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover authorization completion';
    draft.audience.criteria.retentionStages = [];
    draft.audience.criteria.userIds = ['user-1'];
    draft.audience.criteria.locales = ['en'];
    draft.content.step_1.en = {
      title: 'Hello {{first_name}}',
      body: 'Finish setup',
      fallbackFirstName: 'there',
      deeplinkTarget: 'continue_onboarding',
    };

    const summary = getCampaignValidationSummary(draft);

    expect(summary.errors).not.toContain(
      'Select at least one retention stage or specific user.'
    );
    expect(canScheduleCampaign(draft)).toBe(true);
  });

  it('ignores unselected locales in readiness warnings and schedule gating', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover authorization completion';
    draft.audience.criteria.retentionStages = [RetentionStage.NEW];
    draft.audience.criteria.locales = ['en'];
    draft.content.step_1.en = {
      title: 'Hello {{first_name}}',
      body: 'Finish setup',
      fallbackFirstName: 'there',
      deeplinkTarget: 'continue_onboarding',
    };

    const summary = getCampaignValidationSummary(draft);

    expect(summary.warnings).not.toContain('Step step_1 · locale ES is empty.');
    expect(summary.warnings).not.toContain('Step step_1 · locale PT is empty.');
    expect(summary.errors).not.toContain('Step step_1 is missing ES content.');
    expect(summary.errors).not.toContain('Step step_1 is missing PT content.');
    expect(summary.readiness.en).toBe('ready');
    expect(canScheduleCampaign(draft)).toBe(true);
  });

});
