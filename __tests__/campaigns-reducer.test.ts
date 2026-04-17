import { createJourneyStep } from '@/modules/campaigns/defaults';
import { createEmptyCampaignDraft } from '@/modules/campaigns/defaults';
import {
  CampaignEditorStep,
  campaignEditorReducer,
  createCampaignEditorState,
} from '@/modules/campaigns/reducer';

describe('campaignEditorReducer', () => {
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
      },
    });

    expect(withEventTrigger.draft.trigger).toEqual({
      type: 'event_based',
      eventKey: 'app_opened',
      producerKey: 'crm_source_events',
      entryMode: 'first_eligible_event',
      reentryCooldownHours: 24,
    });
    expect(withEventTrigger.isDirty).toBe(true);
  });

  it('appends step_2 and step_3, then removes step_2 without rewriting surviving step keys', () => {
    const initialState = createCampaignEditorState(createEmptyCampaignDraft());

    const withStepTwo = campaignEditorReducer(initialState, {
      type: 'appendJourneyStep',
      step: createJourneyStep(2),
      deeplinkTarget: 'continue_onboarding',
    });
    const withStepThree = campaignEditorReducer(withStepTwo, {
      type: 'appendJourneyStep',
      step: createJourneyStep(3),
      deeplinkTarget: 'continue_onboarding',
    });
    const afterDelete = campaignEditorReducer(withStepThree, {
      type: 'removeJourneyStep',
      stepKey: 'step_2',
    });

    expect(withStepThree.draft.journey.steps.map((step) => step.stepKey)).toEqual([
      'step_1',
      'step_2',
      'step_3',
    ]);
    expect(afterDelete.draft.journey.steps.map((step) => step.stepKey)).toEqual([
      'step_1',
      'step_3',
    ]);
    expect(afterDelete.draft.journey.steps.map((step) => step.order)).toEqual([
      1,
      2,
    ]);
  });

  it('inserts a token into step-specific locale content and keeps the state dirty', () => {
    const draft = createEmptyCampaignDraft();
    draft.content.step_1.en.title = 'Welcome back';
    const initialState = createCampaignEditorState(draft);

    const nextState = campaignEditorReducer(initialState, {
      type: 'insertToken',
      stepKey: 'step_1',
      locale: 'en',
      field: 'title',
      token: '{{first_name}}',
    });

    expect(nextState.draft.content.step_1.en.title).toBe(
      'Welcome back {{first_name}}',
    );
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
});
