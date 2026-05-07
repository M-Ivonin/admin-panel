import { createEmptyCampaignDraft } from '@/modules/campaigns/defaults';
import {
  appendCampaignJourneyStepDraft,
  getCampaignJourneyStepDrafts,
  getMissingJourneyStepContentKeys,
  removeCampaignJourneyStepDraft,
  updateCampaignJourneyStepDeliveryContent,
  updateCampaignJourneyStepDraft,
} from '@/modules/campaigns/journey-step-draft';

describe('campaign journey step draft module', () => {
  it('keeps timing, Send Guard, and localized Delivery content together', () => {
    const draft = createEmptyCampaignDraft();

    const withTimingAndGuard = updateCampaignJourneyStepDraft(draft, 'step_1', {
      delayMinutes: 45,
      sendGuards: [{ action: 'opened_app' }],
    });
    const withDeliveryContent = updateCampaignJourneyStepDeliveryContent(
      withTimingAndGuard,
      'step_1',
      'en',
      {
        title: 'Welcome back',
        body: 'Open the app to continue',
      }
    );

    expect(getCampaignJourneyStepDrafts(withDeliveryContent)[0]).toMatchObject({
      stepKey: 'step_1',
      delayMinutes: 45,
      sendGuards: [{ action: 'opened_app' }],
      localizedDeliveryContent: {
        en: {
          title: 'Welcome back',
          body: 'Open the app to continue',
        },
      },
    });
  });

  it('defaults and materializes in-app expiration on every Journey step', () => {
    const draft = createEmptyCampaignDraft();
    const withStepTwo = appendCampaignJourneyStepDraft(draft, null);
    const withEditedExpiration = updateCampaignJourneyStepDraft(
      withStepTwo,
      'step_2',
      {
        inAppExpirationMinutes: 60,
      }
    );

    expect(withEditedExpiration.journey.steps).toEqual([
      expect.objectContaining({
        stepKey: 'step_1',
        inAppExpirationMinutes: 1440,
      }),
      expect.objectContaining({
        stepKey: 'step_2',
        inAppExpirationMinutes: 60,
      }),
    ]);
    expect(getCampaignJourneyStepDrafts(withEditedExpiration)[1]).toMatchObject({
      stepKey: 'step_2',
      inAppExpirationMinutes: 60,
    });
  });

  it('adds and removes Journey step drafts without orphaning Delivery content', () => {
    const draft = createEmptyCampaignDraft();
    const withStepTwo = appendCampaignJourneyStepDraft(
      draft,
      'open_match_center'
    );
    const withStepThree = appendCampaignJourneyStepDraft(withStepTwo, null);
    const afterRemoveStepTwo = removeCampaignJourneyStepDraft(
      withStepThree,
      'step_2'
    );
    const afterReappend = appendCampaignJourneyStepDraft(
      afterRemoveStepTwo,
      null
    );

    expect(
      getCampaignJourneyStepDrafts(withStepThree).map((step) => step.stepKey)
    ).toEqual(['step_1', 'step_2', 'step_3']);
    expect(withStepThree.content.step_2.en.deeplinkTarget).toBe(
      'open_match_center'
    );
    expect(
      getCampaignJourneyStepDrafts(afterRemoveStepTwo).map((step) => step.order)
    ).toEqual([1, 2]);
    expect(afterRemoveStepTwo.content.step_2).toBeUndefined();
    expect(afterRemoveStepTwo.content.step_3).toBeDefined();
    expect(
      getCampaignJourneyStepDrafts(afterReappend).map((step) => step.stepKey)
    ).toEqual(['step_1', 'step_3', 'step_4']);
  });

  it('reports missing Delivery content for persisted drafts that are out of sync', () => {
    const draft = createEmptyCampaignDraft();
    const brokenDraft = appendCampaignJourneyStepDraft(draft, null);
    delete brokenDraft.content.step_2;

    expect(getMissingJourneyStepContentKeys(brokenDraft)).toEqual(['step_2']);
  });
});
