/**
 * Shared reducer state for the campaign editor builder.
 */

import type {
  CampaignDeeplinkTarget,
  CampaignDraft,
  CampaignEditorCatalog,
  CampaignJourneyStep,
  CampaignLocale,
  CampaignScenarioTemplateSummary,
  CampaignTriggerDefinition,
  EstimateAudienceResponse,
} from '@/modules/campaigns/contracts';
import {
  createBlankStepLocaleMap,
  createEmptyCampaignDraft,
} from '@/modules/campaigns/defaults';

export enum CampaignEditorStep {
  AUDIENCE = 'audience',
  TRIGGER_JOURNEY = 'trigger_journey',
  STEP_CONTENT = 'step_content',
  REVIEW = 'review',
}

export interface CampaignEditorDialogs {
  saveTemplate: boolean;
  sendTest: boolean;
  schedule: boolean;
  discardChanges: boolean;
  archiveCampaign: boolean;
  tokenPicker: boolean;
}

export interface CampaignEditorTokenTarget {
  stepKey: string;
  locale: CampaignLocale;
  field: 'title' | 'body';
}

export interface CampaignEditorActionResult {
  kind: 'save' | 'template' | 'test' | 'schedule' | 'archive';
  message: string;
  warnings?: string[];
}

export interface CampaignEditorState {
  draft: CampaignDraft;
  catalog: CampaignEditorCatalog;
  estimate: EstimateAudienceResponse | null;
  activeStep: CampaignEditorStep;
  activeContentStepKey: string;
  isDirty: boolean;
  dialogs: CampaignEditorDialogs;
  tokenTarget: CampaignEditorTokenTarget | null;
  lastActionResult: CampaignEditorActionResult | null;
  lastPersistedDraft: CampaignDraft | null;
}

export type CampaignEditorAction =
  | {
      type: 'loadDraft';
      draft: CampaignDraft;
      catalog?: CampaignEditorCatalog;
      activeStep?: CampaignEditorStep;
      lastPersistedDraft?: CampaignDraft | null;
    }
  | {
      type: 'setCatalog';
      catalog: CampaignEditorCatalog;
    }
  | {
      type: 'setActiveStep';
      step: CampaignEditorStep;
    }
  | {
      type: 'setActiveContentStep';
      stepKey: string;
    }
  | {
      type: 'updateBasics';
      patch: Partial<Pick<CampaignDraft, 'name' | 'goal'>>;
    }
  | {
      type: 'applyScenarioTemplate';
      template: CampaignScenarioTemplateSummary;
    }
  | {
      type: 'updateAudienceCriteria';
      patch: Partial<CampaignDraft['audience']['criteria']>;
    }
  | {
      type: 'updateSuppressionRules';
      patch: Partial<CampaignDraft['audience']['suppression']>;
    }
  | {
      type: 'changeTrigger';
      trigger: CampaignTriggerDefinition;
    }
  | {
      type: 'appendJourneyStep';
      step: CampaignJourneyStep;
      deeplinkTarget: CampaignDeeplinkTarget | null;
    }
  | {
      type: 'removeJourneyStep';
      stepKey: string;
    }
  | {
      type: 'updateJourneyStep';
      stepKey: string;
      patch: Partial<Omit<CampaignJourneyStep, 'stepKey'>>;
    }
  | {
      type: 'updateStepLocaleContent';
      stepKey: string;
      locale: CampaignLocale;
      patch: Partial<CampaignDraft['content'][string][CampaignLocale]>;
    }
  | {
      type: 'insertToken';
      stepKey: string;
      locale: CampaignLocale;
      field: 'title' | 'body';
      token: string;
    }
  | {
      type: 'changeDeeplink';
      stepKey: string;
      locale: CampaignLocale;
      target: CampaignDeeplinkTarget | null;
    }
  | {
      type: 'openDialog';
      dialog: keyof CampaignEditorDialogs;
      tokenTarget?: CampaignEditorTokenTarget | null;
    }
  | {
      type: 'closeDialog';
      dialog: keyof CampaignEditorDialogs;
    }
  | {
      type: 'setEstimate';
      estimate: EstimateAudienceResponse | null;
    }
  | {
      type: 'markSaveSuccess';
      draft: CampaignDraft;
      message: string;
    }
  | {
      type: 'markActionSuccess';
      draft?: CampaignDraft;
      kind: CampaignEditorActionResult['kind'];
      message: string;
      warnings?: string[];
    }
  | {
      type: 'resetDirtyState';
    }
  | {
      type: 'discardChanges';
      fallbackDraft?: CampaignDraft;
    };

const EMPTY_CATALOG: CampaignEditorCatalog = {
  savedSegments: [],
  scenarioTemplates: [],
  tokens: [],
  deeplinkOptions: [],
  sourceEvents: [],
};

const DEFAULT_DIALOGS: CampaignEditorDialogs = {
  saveTemplate: false,
  sendTest: false,
  schedule: false,
  discardChanges: false,
  archiveCampaign: false,
  tokenPicker: false,
};

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneDraft(draft: CampaignDraft): CampaignDraft {
  return cloneValue(draft);
}

function getFirstStepKey(draft: CampaignDraft): string {
  return draft.journey.steps[0]?.stepKey ?? 'step_1';
}

function normalizeJourneySteps(
  steps: CampaignJourneyStep[]
): CampaignJourneyStep[] {
  return steps.map((step, index) => ({
    ...step,
    order: index + 1,
    anchor: index === 0 ? { type: 'trigger' } : { type: 'previous_step' },
  }));
}

/**
 * Creates the reducer state for the shared create/edit editor.
 */
export function createCampaignEditorState(
  draft: CampaignDraft = createEmptyCampaignDraft(),
  catalog: CampaignEditorCatalog = EMPTY_CATALOG
): CampaignEditorState {
  const initialDraft = cloneDraft(draft);

  return {
    draft: initialDraft,
    catalog,
    estimate: null,
    activeStep: CampaignEditorStep.AUDIENCE,
    activeContentStepKey: getFirstStepKey(initialDraft),
    isDirty: false,
    dialogs: { ...DEFAULT_DIALOGS },
    tokenTarget: null,
    lastActionResult: null,
    lastPersistedDraft: initialDraft.id ? cloneDraft(initialDraft) : null,
  };
}

function markDirty(
  state: CampaignEditorState,
  draft: CampaignDraft,
  activeContentStepKey = state.activeContentStepKey
): CampaignEditorState {
  return {
    ...state,
    draft,
    activeContentStepKey,
    isDirty: true,
    lastActionResult: null,
  };
}

/**
 * Handles all local campaign editor state transitions.
 */
export function campaignEditorReducer(
  state: CampaignEditorState,
  action: CampaignEditorAction
): CampaignEditorState {
  switch (action.type) {
    case 'loadDraft': {
      const nextDraft = cloneDraft(action.draft);

      return {
        ...state,
        draft: nextDraft,
        catalog: action.catalog ?? state.catalog,
        activeStep: action.activeStep ?? state.activeStep,
        activeContentStepKey: getFirstStepKey(nextDraft),
        estimate: null,
        isDirty: false,
        dialogs: { ...DEFAULT_DIALOGS },
        tokenTarget: null,
        lastActionResult: null,
        lastPersistedDraft:
          action.lastPersistedDraft === undefined
            ? action.draft.id
              ? cloneDraft(action.draft)
              : null
            : action.lastPersistedDraft
              ? cloneDraft(action.lastPersistedDraft)
              : null,
      };
    }
    case 'setCatalog':
      return {
        ...state,
        catalog: action.catalog,
      };
    case 'setActiveStep':
      return {
        ...state,
        activeStep: action.step,
      };
    case 'setActiveContentStep':
      return {
        ...state,
        activeContentStepKey: action.stepKey,
      };
    case 'updateBasics':
      return markDirty(state, {
        ...state.draft,
        ...action.patch,
      });
    case 'applyScenarioTemplate': {
      const templateDefinition = cloneValue(action.template.definition);
      return markDirty(
        state,
        {
          ...state.draft,
          name: templateDefinition.name,
          goal: templateDefinition.goal,
          channel: templateDefinition.channel,
          audience: {
            ...templateDefinition.audience,
            segmentSource: 'template_segment',
            sourceSegmentId: action.template.id,
          },
          trigger: templateDefinition.trigger,
          journey: templateDefinition.journey,
          content: templateDefinition.content,
        },
        templateDefinition.journey.steps[0]?.stepKey ?? state.activeContentStepKey
      );
    }
    case 'updateAudienceCriteria':
      return markDirty(state, {
        ...state.draft,
        audience: {
          ...state.draft.audience,
          criteria: {
            ...state.draft.audience.criteria,
            ...action.patch,
          },
        },
      });
    case 'updateSuppressionRules':
      return markDirty(state, {
        ...state.draft,
        audience: {
          ...state.draft.audience,
          suppression: {
            ...state.draft.audience.suppression,
            ...action.patch,
          },
        },
      });
    case 'changeTrigger':
      return markDirty(state, {
        ...state.draft,
        trigger: action.trigger,
      });
    case 'appendJourneyStep':
      return markDirty(
        state,
        {
          ...state.draft,
          journey: {
            steps: [...state.draft.journey.steps, action.step],
          },
          content: {
            ...state.draft.content,
            [action.step.stepKey]: createBlankStepLocaleMap(
              action.deeplinkTarget
            ),
          },
        },
        action.step.stepKey
      );
    case 'removeJourneyStep': {
      const nextSteps = normalizeJourneySteps(
        state.draft.journey.steps.filter(
          (step) => step.stepKey !== action.stepKey
        )
      );
      const nextContent = Object.fromEntries(
        Object.entries(state.draft.content).filter(
          ([stepKey]) => stepKey !== action.stepKey
        )
      ) as CampaignDraft['content'];
      const nextActiveStepKey =
        state.activeContentStepKey === action.stepKey
          ? (nextSteps[0]?.stepKey ?? getFirstStepKey(state.draft))
          : state.activeContentStepKey;

      return markDirty(
        state,
        {
          ...state.draft,
          journey: {
            steps: nextSteps,
          },
          content: nextContent,
        },
        nextActiveStepKey
      );
    }
    case 'updateJourneyStep':
      return markDirty(state, {
        ...state.draft,
        journey: {
          steps: state.draft.journey.steps.map((step) =>
            step.stepKey === action.stepKey
              ? { ...step, ...action.patch }
              : step
          ),
        },
      });
    case 'updateStepLocaleContent':
      return markDirty(state, {
        ...state.draft,
        content: {
          ...state.draft.content,
          [action.stepKey]: {
            ...state.draft.content[action.stepKey],
            [action.locale]: {
              ...state.draft.content[action.stepKey][action.locale],
              ...action.patch,
            },
          },
        },
      });
    case 'insertToken': {
      const currentValue =
        state.draft.content[action.stepKey][action.locale][action.field];
      const nextValue = [currentValue, action.token]
        .filter(Boolean)
        .join(currentValue ? ' ' : '');

      return markDirty(state, {
        ...state.draft,
        content: {
          ...state.draft.content,
          [action.stepKey]: {
            ...state.draft.content[action.stepKey],
            [action.locale]: {
              ...state.draft.content[action.stepKey][action.locale],
              [action.field]: nextValue,
            },
          },
        },
      });
    }
    case 'changeDeeplink':
      return markDirty(state, {
        ...state.draft,
        content: {
          ...state.draft.content,
          [action.stepKey]: {
            ...state.draft.content[action.stepKey],
            [action.locale]: {
              ...state.draft.content[action.stepKey][action.locale],
              deeplinkTarget: action.target,
            },
          },
        },
      });
    case 'openDialog':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          [action.dialog]: true,
        },
        tokenTarget: action.tokenTarget ?? state.tokenTarget,
      };
    case 'closeDialog':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          [action.dialog]: false,
        },
        tokenTarget: action.dialog === 'tokenPicker' ? null : state.tokenTarget,
      };
    case 'setEstimate':
      return {
        ...state,
        estimate: action.estimate,
      };
    case 'markSaveSuccess': {
      const nextDraft = cloneDraft(action.draft);
      return {
        ...state,
        draft: nextDraft,
        activeContentStepKey: getFirstStepKey(nextDraft),
        isDirty: false,
        lastActionResult: {
          kind: 'save',
          message: action.message,
        },
        lastPersistedDraft: cloneDraft(nextDraft),
      };
    }
    case 'markActionSuccess': {
      const nextDraft = action.draft ? cloneDraft(action.draft) : state.draft;
      return {
        ...state,
        draft: nextDraft,
        activeContentStepKey: getFirstStepKey(nextDraft),
        isDirty: action.draft ? false : state.isDirty,
        lastActionResult: {
          kind: action.kind,
          message: action.message,
          warnings: action.warnings,
        },
        lastPersistedDraft: action.draft
          ? cloneDraft(nextDraft)
          : state.lastPersistedDraft,
      };
    }
    case 'resetDirtyState':
      return {
        ...state,
        isDirty: false,
      };
    case 'discardChanges': {
      const fallbackDraft =
        action.fallbackDraft ??
        state.lastPersistedDraft ??
        createEmptyCampaignDraft(state.catalog);
      const nextDraft = cloneDraft(fallbackDraft);
      return {
        ...state,
        draft: nextDraft,
        activeContentStepKey: getFirstStepKey(nextDraft),
        estimate: null,
        isDirty: false,
        dialogs: {
          ...state.dialogs,
          discardChanges: false,
        },
        tokenTarget: null,
        lastActionResult: null,
      };
    }
    default:
      return state;
  }
}
