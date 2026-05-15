import { createEmptyCampaignDraft } from '@/modules/campaigns/defaults';
import {
  CampaignEditorStep,
  campaignEditorReducer,
  createCampaignEditorState,
} from '@/modules/campaigns/reducer';
import { getCampaignJourneyStepDrafts } from '@/modules/campaigns/journey-step-draft';
import type { CampaignScenarioTemplateSummary } from '@/modules/campaigns/contracts';

describe('campaignEditorReducer', () => {
  it('toggles Target Apps independently and allows an empty validation state', () => {
    const initialState = createCampaignEditorState(createEmptyCampaignDraft());

    const withTipsterBro = campaignEditorReducer(initialState, {
      type: 'toggleTargetApp',
      targetApp: 'TipsterBro',
    });
    const withoutSirBro = campaignEditorReducer(withTipsterBro, {
      type: 'toggleTargetApp',
      targetApp: 'SirBro',
    });
    const withoutAnyTargetApp = campaignEditorReducer(withoutSirBro, {
      type: 'toggleTargetApp',
      targetApp: 'TipsterBro',
    });

    expect(initialState.draft.targetApps).toEqual(['SirBro']);
    expect(withTipsterBro.draft.targetApps).toEqual(['SirBro', 'TipsterBro']);
    expect(withoutSirBro.draft.targetApps).toEqual(['TipsterBro']);
    expect(withoutAnyTargetApp.draft.targetApps).toEqual([]);
  });

  it('keeps all locales for both apps and only English for TipsterBro-only drafts', () => {
    const initialDraft = createEmptyCampaignDraft();
    initialDraft.audience.criteria.locales = ['en', 'es', 'pt'];
    const initialState = createCampaignEditorState(initialDraft);

    const bothApps = campaignEditorReducer(initialState, {
      type: 'toggleTargetApp',
      targetApp: 'TipsterBro',
    });
    const tipsterBroOnly = campaignEditorReducer(bothApps, {
      type: 'toggleTargetApp',
      targetApp: 'SirBro',
    });

    expect(bothApps.draft.targetApps).toEqual(['SirBro', 'TipsterBro']);
    expect(bothApps.draft.audience.criteria.locales).toEqual([
      'en',
      'es',
      'pt',
    ]);
    expect(tipsterBroOnly.draft.targetApps).toEqual(['TipsterBro']);
    expect(tipsterBroOnly.draft.audience.criteria.locales).toEqual(['en']);
  });

  it('preselects every compatible Target App when applying a scenario template', () => {
    const initialDraft = createEmptyCampaignDraft();
    const initialState = createCampaignEditorState(initialDraft);
    const template: CampaignScenarioTemplateSummary = {
      id: 'tpl_favorite_match_kickoff',
      name: 'Favorite match kickoff',
      description: 'Match-center compatible template',
      source: 'shipped',
      compatibleTargetApps: ['SirBro', 'TipsterBro'],
      compatibilityReason: null,
      definition: {
        ...initialDraft,
        name: 'Favorite match kickoff',
        goal: 'Drive match-center opens',
        targetApps: ['SirBro'],
      },
    };

    const nextState = campaignEditorReducer(initialState, {
      type: 'applyScenarioTemplate',
      template,
    });

    expect(nextState.draft.targetApps).toEqual(['SirBro', 'TipsterBro']);
  });

  it('changes the top-level trigger through the shared draft', () => {
    const initialState = createCampaignEditorState(createEmptyCampaignDraft());

    const withEventTrigger = campaignEditorReducer(initialState, {
      type: 'changeTrigger',
      trigger: {
        type: 'event_based',
        eventKey: 'app_opened',
        producerKey: 'crm_source_events',
        entryMode: 'first_eligible_event',
        reentryCooldownHours: 24,
        maxSendsPerUser: 3,
      },
    });

    expect(withEventTrigger.draft.trigger).toEqual({
      type: 'event_based',
      eventKey: 'app_opened',
      producerKey: 'crm_source_events',
      entryMode: 'first_eligible_event',
      reentryCooldownHours: 24,
      maxSendsPerUser: 3,
    });
    expect(withEventTrigger.isDirty).toBe(true);
  });

  it('appends step_2 and step_3, then removes step_2 without rewriting surviving step keys', () => {
    const initialState = createCampaignEditorState(createEmptyCampaignDraft());

    const withStepTwo = campaignEditorReducer(initialState, {
      type: 'appendJourneyStep',
      deeplinkTarget: null,
    });
    const withStepThree = campaignEditorReducer(withStepTwo, {
      type: 'appendJourneyStep',
      deeplinkTarget: null,
    });
    const afterDelete = campaignEditorReducer(withStepThree, {
      type: 'removeJourneyStep',
      stepKey: 'step_2',
    });

    expect(
      withStepThree.draft.journey.steps.map((step) => step.stepKey)
    ).toEqual(['step_1', 'step_2', 'step_3']);
    expect(afterDelete.draft.journey.steps.map((step) => step.stepKey)).toEqual(
      ['step_1', 'step_3']
    );
    expect(afterDelete.draft.journey.steps.map((step) => step.order)).toEqual([
      1, 2,
    ]);
  });

  it('inserts a token at the current cursor position and keeps the state dirty', () => {
    const draft = createEmptyCampaignDraft();
    draft.content.step_1.en.title = 'Welcome back';
    const initialState = createCampaignEditorState(draft);

    const nextState = campaignEditorReducer(initialState, {
      type: 'insertToken',
      stepKey: 'step_1',
      locale: 'en',
      field: 'title',
      token: '{{first_name}}',
      selection: {
        start: 8,
        end: 8,
      },
    });

    expect(nextState.draft.content.step_1.en.title).toBe(
      'Welcome {{first_name}}back'
    );
    expect(nextState.isDirty).toBe(true);
  });

  it('inserts a token into a message variant', () => {
    const draft = createEmptyCampaignDraft();
    draft.content.step_1.en.variants = [
      {
        title: '{{home}} starts soon',
        body: 'Open the match',
      },
    ];
    const initialState = createCampaignEditorState(draft);

    const nextState = campaignEditorReducer(initialState, {
      type: 'insertToken',
      stepKey: 'step_1',
      locale: 'en',
      field: 'title',
      token: '{{away}}',
      variantIndex: 0,
      selection: {
        start: 8,
        end: 8,
      },
    });

    expect(nextState.draft.content.step_1.en.variants?.[0].title).toBe(
      '{{home}}{{away}} starts soon'
    );
    expect(nextState.draft.content.step_1.en.title).toBe('');
    expect(nextState.isDirty).toBe(true);
  });

  it('resets dirty state after a save success and supports explicit reset', () => {
    const initialState = createCampaignEditorState(createEmptyCampaignDraft());

    const dirtyState = campaignEditorReducer(initialState, {
      type: 'updateBasics',
      patch: { name: 'Campaign Spec Local' },
    });

    const savedDraft = {
      ...dirtyState.draft,
      id: 'cmp_local_001',
      updatedAt: '2026-04-16T12:01:00.000Z',
    };

    const savedState = campaignEditorReducer(dirtyState, {
      type: 'markSaveSuccess',
      draft: savedDraft,
      message: 'Draft saved.',
    });

    const resetState = campaignEditorReducer(savedState, {
      type: 'resetDirtyState',
    });

    expect(savedState.isDirty).toBe(false);
    expect(savedState.lastPersistedDraft?.id).toBe('cmp_local_001');
    expect(savedState.lastActionResult?.kind).toBe('save');
    expect(resetState.isDirty).toBe(false);
  });

  it('updates the active step without altering the current draft snapshot', () => {
    const initialState = createCampaignEditorState(createEmptyCampaignDraft());

    const nextState = campaignEditorReducer(initialState, {
      type: 'setActiveStep',
      step: CampaignEditorStep.REVIEW,
    });

    expect(nextState.activeStep).toBe(CampaignEditorStep.REVIEW);
    expect(nextState.draft).toEqual(initialState.draft);
  });

  it('starts new drafts and newly added steps with no follow-up action selected', () => {
    const initialDraft = createEmptyCampaignDraft();
    const initialState = createCampaignEditorState(initialDraft);
    const nextState = campaignEditorReducer(initialState, {
      type: 'appendJourneyStep',
      deeplinkTarget: null,
    });

    expect(initialDraft.content.step_1.en.deeplinkTarget).toBeNull();
    expect(nextState.draft.content.step_2.en.deeplinkTarget).toBeNull();
    expect(nextState.draft.content.step_2.es.deeplinkTarget).toBeNull();
    expect(nextState.draft.content.step_2.pt.deeplinkTarget).toBeNull();
  });

  it('updates timing, Send Guard, and localized Delivery content through a journey step draft', () => {
    const initialState = createCampaignEditorState(createEmptyCampaignDraft());

    const withTimingAndGuard = campaignEditorReducer(initialState, {
      type: 'updateJourneyStepDraft',
      stepKey: 'step_1',
      patch: {
        delayMinutes: 45,
        sendGuards: [{ action: 'opened_app' }],
      },
    });
    const withDeliveryContent = campaignEditorReducer(withTimingAndGuard, {
      type: 'updateJourneyStepDeliveryContent',
      stepKey: 'step_1',
      locale: 'en',
      patch: {
        title: 'Welcome back',
        body: 'Open the app to continue',
      },
    });
    const withoutGuard = campaignEditorReducer(withDeliveryContent, {
      type: 'updateJourneyStepDraft',
      stepKey: 'step_1',
      patch: {
        sendGuards: [],
      },
    });
    const [stepDraft] = getCampaignJourneyStepDrafts(withDeliveryContent.draft);

    expect(stepDraft.delayMinutes).toBe(45);
    expect(stepDraft.sendGuards).toEqual([{ action: 'opened_app' }]);
    expect(stepDraft.localizedDeliveryContent.en).toMatchObject({
      title: 'Welcome back',
      body: 'Open the app to continue',
    });
    expect(
      campaignEditorReducer(withDeliveryContent, {
        type: 'updateJourneyStepDraft',
        stepKey: 'step_1',
        patch: {
          inAppExpirationMinutes: 90,
        },
      }).draft.journey.steps[0].inAppExpirationMinutes
    ).toBe(90);
    expect(withoutGuard.draft.journey.steps[0].sendGuards).toEqual([]);
  });
});
