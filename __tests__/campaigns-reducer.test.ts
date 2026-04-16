import { createEmptyCampaignDraft } from '@/modules/campaigns/mock-data';
import {
  CampaignEditorStep,
  campaignEditorReducer,
  createCampaignEditorState,
} from '@/modules/campaigns/reducer';

describe('campaignEditorReducer', () => {
  it('changes segment source and trigger type through the shared draft', () => {
    const initialState = createCampaignEditorState(createEmptyCampaignDraft());

    const withManualSource = campaignEditorReducer(initialState, {
      type: 'changeSegmentSource',
      segmentSource: 'manual_rules',
      sourceSegmentId: null,
    });

    const withEventTrigger = campaignEditorReducer(withManualSource, {
      type: 'changeTrigger',
      trigger: { type: 'event_based', eventKey: 'opened_app' },
    });

    expect(withManualSource.draft.audience.segmentSource).toBe('manual_rules');
    expect(withEventTrigger.draft.audience.trigger).toEqual({
      type: 'event_based',
      eventKey: 'opened_app',
    });
    expect(withEventTrigger.isDirty).toBe(true);
  });

  it('switches send mode inside the timing block', () => {
    const initialState = createCampaignEditorState(createEmptyCampaignDraft());

    const nextState = campaignEditorReducer(initialState, {
      type: 'updateTiming',
      patch: {
        sendMode: 'specific_datetime',
        scheduledAt: '2026-04-18T15:00:00.000Z',
      },
    });

    expect(nextState.draft.timing.sendMode).toBe('specific_datetime');
    expect(nextState.draft.timing.scheduledAt).toBe('2026-04-18T15:00:00.000Z');
    expect(nextState.isDirty).toBe(true);
  });

  it('inserts a token into locale content and keeps the state dirty', () => {
    const initialState = createCampaignEditorState({
      ...createEmptyCampaignDraft(),
      content: {
        en: {
          ...createEmptyCampaignDraft().content.en,
          title: 'Welcome back',
        },
        es: createEmptyCampaignDraft().content.es,
        pt: createEmptyCampaignDraft().content.pt,
      },
    });

    const nextState = campaignEditorReducer(initialState, {
      type: 'insertToken',
      locale: 'en',
      field: 'title',
      token: '{{first_name}}',
    });

    expect(nextState.draft.content.en.title).toBe('Welcome back {{first_name}}');
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
