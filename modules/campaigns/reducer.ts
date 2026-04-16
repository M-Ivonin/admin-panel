/**
 * Shared reducer state for the campaign editor builder.
 */

import type {
  CampaignDeeplinkTarget,
  CampaignDraft,
  CampaignEditorCatalog,
  CampaignLocale,
  EstimateAudienceResponse,
} from '@/modules/campaigns/contracts';
import { createEmptyCampaignDraft } from '@/modules/campaigns/defaults';

export enum CampaignEditorStep {
  AUDIENCE = 'audience',
  TIMING = 'timing',
  CONTENT = 'content',
  REVIEW = 'review',
}

export interface CampaignEditorDialogs {
  saveSegment: boolean;
  templateLibrary: boolean;
  sendTest: boolean;
  schedule: boolean;
  discardChanges: boolean;
  archiveCampaign: boolean;
  tokenPicker: boolean;
}

export interface CampaignEditorTokenTarget {
  locale: CampaignLocale;
  field: 'title' | 'body';
}

export interface CampaignEditorActionResult {
  kind: 'save' | 'segment' | 'test' | 'schedule' | 'archive';
  message: string;
  warnings?: string[];
}

export interface CampaignEditorState {
  draft: CampaignDraft;
  catalog: CampaignEditorCatalog;
  estimate: EstimateAudienceResponse | null;
  activeStep: CampaignEditorStep;
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
      type: 'updateBasics';
      patch: Partial<Pick<CampaignDraft, 'name' | 'goal'>>;
    }
  | {
      type: 'changeSegmentSource';
      segmentSource: CampaignDraft['audience']['segmentSource'];
      sourceSegmentId: string | null;
    }
  | {
      type: 'applySavedSegment';
      segmentId: string;
      audience: CampaignDraft['audience'];
    }
  | {
      type: 'applyTemplateSegment';
      templateId: string;
      audience: CampaignDraft['audience'];
      contentPatch?: Partial<
        Record<CampaignLocale, Partial<CampaignDraft['content'][CampaignLocale]>>
      >;
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
      trigger: CampaignDraft['audience']['trigger'];
    }
  | {
      type: 'updateTiming';
      patch: Partial<CampaignDraft['timing']>;
    }
  | {
      type: 'updateLocaleContent';
      locale: CampaignLocale;
      patch: Partial<CampaignDraft['content'][CampaignLocale]>;
    }
  | {
      type: 'insertToken';
      locale: CampaignLocale;
      field: 'title' | 'body';
      token: string;
    }
  | {
      type: 'changeDeeplink';
      locale: CampaignLocale;
      target: CampaignDeeplinkTarget;
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
  templates: [],
  tokens: [],
  deeplinkOptions: [],
  eventTriggers: [],
};

const DEFAULT_DIALOGS: CampaignEditorDialogs = {
  saveSegment: false,
  templateLibrary: false,
  sendTest: false,
  schedule: false,
  discardChanges: false,
  archiveCampaign: false,
  tokenPicker: false,
};

function cloneDraft(draft: CampaignDraft): CampaignDraft {
  return JSON.parse(JSON.stringify(draft)) as CampaignDraft;
}

/**
 * Creates the reducer state for the shared create/edit editor.
 */
export function createCampaignEditorState(
  draft: CampaignDraft = createEmptyCampaignDraft(),
  catalog: CampaignEditorCatalog = EMPTY_CATALOG,
): CampaignEditorState {
  const initialDraft = cloneDraft(draft);

  return {
    draft: initialDraft,
    catalog,
    estimate: null,
    activeStep: CampaignEditorStep.AUDIENCE,
    isDirty: false,
    dialogs: { ...DEFAULT_DIALOGS },
    tokenTarget: null,
    lastActionResult: null,
    lastPersistedDraft: initialDraft.id ? cloneDraft(initialDraft) : null,
  };
}

function markDirty(state: CampaignEditorState, draft: CampaignDraft): CampaignEditorState {
  return {
    ...state,
    draft,
    isDirty: true,
    lastActionResult: null,
  };
}

/**
 * Handles all local campaign editor state transitions.
 */
export function campaignEditorReducer(
  state: CampaignEditorState,
  action: CampaignEditorAction,
): CampaignEditorState {
  switch (action.type) {
    case 'loadDraft':
      return {
        ...state,
        draft: cloneDraft(action.draft),
        catalog: action.catalog ?? state.catalog,
        activeStep: action.activeStep ?? state.activeStep,
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
    case 'updateBasics':
      return markDirty(state, {
        ...state.draft,
        ...action.patch,
      });
    case 'changeSegmentSource':
      return markDirty(state, {
        ...state.draft,
        audience: {
          ...state.draft.audience,
          segmentSource: action.segmentSource,
          sourceSegmentId: action.sourceSegmentId,
        },
      });
    case 'applySavedSegment':
      return markDirty(state, {
        ...state.draft,
        audience: cloneDraft({
          ...state.draft,
          audience: {
            ...action.audience,
            segmentSource: 'saved_segment',
            sourceSegmentId: action.segmentId,
          },
        }).audience,
      });
    case 'applyTemplateSegment':
      return markDirty(state, {
        ...state.draft,
        audience: cloneDraft({
          ...state.draft,
          audience: {
            ...action.audience,
            segmentSource: 'template_segment',
            sourceSegmentId: action.templateId,
          },
        }).audience,
        content: {
          ...state.draft.content,
          ...(Object.keys(action.contentPatch ?? {}) as CampaignLocale[]).reduce(
            (accumulator, locale) => ({
              ...accumulator,
              [locale]: {
                ...state.draft.content[locale],
                ...action.contentPatch?.[locale],
              },
            }),
            {} as CampaignDraft['content'],
          ),
        },
      });
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
        audience: {
          ...state.draft.audience,
          trigger: action.trigger,
        },
      });
    case 'updateTiming':
      return markDirty(state, {
        ...state.draft,
        timing: {
          ...state.draft.timing,
          ...action.patch,
        },
      });
    case 'updateLocaleContent':
      return markDirty(state, {
        ...state.draft,
        content: {
          ...state.draft.content,
          [action.locale]: {
            ...state.draft.content[action.locale],
            ...action.patch,
          },
        },
      });
    case 'insertToken': {
      const currentValue = state.draft.content[action.locale][action.field];
      const nextValue = [currentValue, action.token].filter(Boolean).join(
        currentValue ? ' ' : '',
      );

      return markDirty(state, {
        ...state.draft,
        content: {
          ...state.draft.content,
          [action.locale]: {
            ...state.draft.content[action.locale],
            [action.field]: nextValue,
          },
        },
      });
    }
    case 'changeDeeplink':
      return markDirty(state, {
        ...state.draft,
        content: {
          ...state.draft.content,
          [action.locale]: {
            ...state.draft.content[action.locale],
            deeplinkTarget: action.target,
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
    case 'markSaveSuccess':
      return {
        ...state,
        draft: cloneDraft(action.draft),
        estimate: state.estimate,
        isDirty: false,
        lastPersistedDraft: cloneDraft(action.draft),
        lastActionResult: {
          kind: 'save',
          message: action.message,
        },
      };
    case 'markActionSuccess':
      return {
        ...state,
        draft: action.draft ? cloneDraft(action.draft) : state.draft,
        isDirty: false,
        lastPersistedDraft: action.draft
          ? cloneDraft(action.draft)
          : state.lastPersistedDraft,
        lastActionResult: {
          kind: action.kind,
          message: action.message,
          warnings: action.warnings,
        },
      };
    case 'resetDirtyState':
      return {
        ...state,
        isDirty: false,
      };
    case 'discardChanges':
      return {
        ...state,
        draft: cloneDraft(
          action.fallbackDraft ?? state.lastPersistedDraft ?? createEmptyCampaignDraft(),
        ),
        estimate: null,
        isDirty: false,
        dialogs: {
          ...state.dialogs,
          discardChanges: false,
        },
        lastActionResult: null,
      };
    default:
      return state;
  }
}
