import { RetentionStage } from '@/lib/api/users';
import { createJourneyStep } from '@/modules/campaigns/defaults';
import { createEmptyCampaignDraft } from '@/modules/campaigns/defaults';
import {
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
      type: 'scheduled_recurring',
      recurrenceRule: '',
      timezoneMode: 'user_local',
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
      type: 'scheduled_recurring',
      recurrenceRule: 'FREQ=MONTHLY;BYHOUR=9;BYMINUTE=0',
      timezoneMode: 'user_local',
    };

    const summary = getCampaignValidationSummary(draft);

    expect(summary.errors).toContain(
      'Recurring campaigns require a valid daily or weekly local-time schedule.'
    );
    expect(canScheduleCampaign(draft)).toBe(false);
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
    draft.goal = 'Recover onboarding completion';
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

  it('blocks scheduling when any selected locale is missing for any journey step', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover onboarding completion';
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
    draft.goal = 'Recover onboarding completion';
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

  it('allows scheduling when selected locales need review but are not missing', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover onboarding completion';
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

});
