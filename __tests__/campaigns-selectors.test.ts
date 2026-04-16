import { RetentionStage } from '@/lib/api/users';
import { createEmptyCampaignDraft } from '@/modules/campaigns/mock-data';
import {
  canScheduleCampaign,
  getCampaignLocaleReadiness,
  getCampaignValidationSummary,
} from '@/modules/campaigns/selectors';

describe('campaign selectors', () => {
  it('returns a PT warning when localized content is incomplete', () => {
    const draft = createEmptyCampaignDraft();
    draft.content.pt.title = 'Volte agora';
    draft.content.pt.body = '';

    const readiness = getCampaignLocaleReadiness(draft.content);

    expect(readiness.pt).toBe('warning');
  });

  it('fails validation when excludeRecentRecipients is enabled without a frequency cap', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover onboarding completion';
    draft.timing.frequencyCapHours = null;
    draft.content.en = {
      title: 'Hi there',
      body: 'Body',
      fallbackFirstName: '',
      deeplinkTarget: 'continue_onboarding',
    };
    draft.content.es = {
      title: 'Hola',
      body: 'Cuerpo',
      fallbackFirstName: '',
      deeplinkTarget: 'continue_onboarding',
    };
    draft.content.pt = {
      title: 'Oi',
      body: 'Corpo',
      fallbackFirstName: '',
      deeplinkTarget: 'continue_onboarding',
    };

    const summary = getCampaignValidationSummary(draft);

    expect(summary.errors).toContain(
      'Frequency cap hours are required when excluding recent recipients.',
    );
  });

  it('marks recurring campaigns invalid when the recurrence rule is missing', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Recurring';
    draft.goal = 'Weekly check-in';
    draft.audience.trigger = {
      type: 'scheduled_recurring',
      recurrenceRule: '',
    };

    const summary = getCampaignValidationSummary(draft);

    expect(summary.errors).toContain('Recurring campaigns require an RFC5545 RRULE.');
  });

  it('warns when {{first_name}} is used without a locale fallback', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Token test';
    draft.goal = 'Validate fallback';
    draft.content.en.title = 'Hello {{first_name}}';
    draft.content.en.body = 'Welcome back';
    draft.content.es.title = 'Hola';
    draft.content.es.body = 'Bienvenido';
    draft.content.pt.title = 'Ola';
    draft.content.pt.body = 'Bem-vindo';

    const summary = getCampaignValidationSummary(draft);

    expect(summary.warnings).toContain(
      'Every locale using {{first_name}} needs a fallback value.',
    );
  });

  it('enables scheduling once required content and validations are complete', () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover onboarding completion';
    draft.audience.criteria.retentionStages = [RetentionStage.NEW];
    draft.audience.criteria.locales = ['en', 'es', 'pt'];
    draft.content.en = {
      title: 'Hello {{first_name}}',
      body: 'Finish setup',
      fallbackFirstName: 'there',
      deeplinkTarget: 'continue_onboarding',
    };
    draft.content.es = {
      title: 'Hola {{first_name}}',
      body: 'Completa tu setup',
      fallbackFirstName: 'amigo',
      deeplinkTarget: 'continue_onboarding',
    };
    draft.content.pt = {
      title: 'Ola {{first_name}}',
      body: 'Conclua seu setup',
      fallbackFirstName: 'amigo',
      deeplinkTarget: 'continue_onboarding',
    };
    draft.timing.sendMode = 'specific_datetime';
    draft.timing.scheduledAt = '2026-04-18T15:00:00.000Z';

    expect(canScheduleCampaign(draft)).toBe(true);
  });
});
