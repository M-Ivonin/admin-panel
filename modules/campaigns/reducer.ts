/**
 * Shared reducer state for the campaign editor builder.
 */

import type {
  CampaignDeeplinkTarget,
  CampaignDraft,
  CampaignEditorCatalog,
  CampaignGoalDefinition,
  CampaignLocale,
  CampaignScenarioTemplateSummary,
  CampaignTargetApp,
  CampaignTriggerDefinition,
  EstimateAudienceResponse,
} from '@/modules/campaigns/contracts';
import {
  createScheduledCampaignTrigger,
  createEmptyCampaignDraft,
} from '@/modules/campaigns/defaults';
import {
  appendCampaignJourneyStepDraft,
  changeCampaignJourneyStepCustomDeeplink,
  changeCampaignJourneyStepDeeplink,
  getCampaignJourneyStepDraft,
  getFirstJourneyStepKey,
  removeCampaignJourneyStepDraft,
  updateCampaignJourneyStepDeliveryContent,
  updateCampaignJourneyStepDraft,
  type CampaignJourneyStepDraftPatch,
} from '@/modules/campaigns/journey-step-draft';
import { normalizeCampaignLocalesForTargetApps } from '@/modules/campaigns/target-app-locales';

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
  pauseCampaign: boolean;
  tokenPicker: boolean;
}

export interface CampaignEditorTokenTarget {
  stepKey: string;
  locale: CampaignLocale;
  field: 'title' | 'body';
  variantIndex?: number | null;
}

interface CampaignEditorTokenSelection {
  start?: number | null;
  end?: number | null;
}

export interface CampaignEditorActionResult {
  kind: 'save' | 'template' | 'test' | 'schedule' | 'archive' | 'pause';
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
      patch: Partial<
        Pick<CampaignDraft, 'name' | 'goal' | 'goalDefinition' | 'channel'>
      >;
    }
  | {
      type: 'toggleTargetApp';
      targetApp: CampaignTargetApp;
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
      deeplinkTarget: CampaignDeeplinkTarget | null;
    }
  | {
      type: 'removeJourneyStep';
      stepKey: string;
    }
  | {
      type: 'updateJourneyStepDraft';
      stepKey: string;
      patch: CampaignJourneyStepDraftPatch;
    }
  | {
      type: 'updateJourneyStepDeliveryContent';
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
      variantIndex?: number | null;
      selection?: CampaignEditorTokenSelection;
    }
  | {
      type: 'changeDeeplink';
      stepKey: string;
      locale: CampaignLocale;
      target: CampaignDeeplinkTarget | null;
    }
  | {
      type: 'changeCustomDeeplink';
      stepKey: string;
      locale: CampaignLocale;
      path: string | null;
    }
  | {
      type: 'changeGoalDefinition';
      goalDefinition: CampaignGoalDefinition | null;
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
      message?: string | null;
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
  retentionStageOptions: [],
  tokens: [],
  deeplinkOptions: [],
  sourceEvents: [],
  sendGuardOptions: [],
  goalOptions: [],
  defaults: {
    eventMaxSendsPerUser: null,
  },
};

function catalogArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeCampaignEditorCatalog(
  catalog: Partial<CampaignEditorCatalog> | null | undefined
): CampaignEditorCatalog {
  return {
    savedSegments: catalogArray(catalog?.savedSegments),
    scenarioTemplates: catalogArray(catalog?.scenarioTemplates),
    retentionStageOptions: catalogArray(catalog?.retentionStageOptions),
    tokens: catalogArray(catalog?.tokens),
    deeplinkOptions: catalogArray(catalog?.deeplinkOptions),
    sourceEvents: catalogArray(catalog?.sourceEvents),
    sendGuardOptions: catalogArray(catalog?.sendGuardOptions),
    goalOptions: catalogArray(catalog?.goalOptions),
    defaults: {
      eventMaxSendsPerUser:
        catalog?.defaults?.eventMaxSendsPerUser ??
        EMPTY_CATALOG.defaults.eventMaxSendsPerUser,
    },
  };
}

const DEFAULT_DIALOGS: CampaignEditorDialogs = {
  saveTemplate: false,
  sendTest: false,
  schedule: false,
  discardChanges: false,
  archiveCampaign: false,
  pauseCampaign: false,
  tokenPicker: false,
};

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneDraft(draft: CampaignDraft): CampaignDraft {
  return cloneValue(draft);
}

function normalizeNewScheduledTrigger(
  trigger: CampaignTriggerDefinition
): CampaignTriggerDefinition {
  if (trigger.type !== 'scheduled_recurring') {
    return trigger;
  }

  const defaults = createScheduledCampaignTrigger();

  return {
    ...defaults,
    ...trigger,
    startDate: defaults.startDate,
    maxOccurrences: trigger.maxOccurrences ?? defaults.maxOccurrences,
  };
}

function insertTokenAtSelection(params: {
  value: string;
  token: string;
  selection?: CampaignEditorTokenSelection;
}): string {
  const value = params.value ?? '';
  const defaultCursor = value.length;
  const requestedStart = params.selection?.start;
  const requestedEnd = params.selection?.end;
  const start =
    typeof requestedStart === 'number'
      ? Math.min(Math.max(requestedStart, 0), value.length)
      : defaultCursor;
  const end =
    typeof requestedEnd === 'number'
      ? Math.min(Math.max(requestedEnd, start), value.length)
      : start;

  return `${value.slice(0, start)}${params.token}${value.slice(end)}`;
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
    catalog: normalizeCampaignEditorCatalog(catalog),
    estimate: null,
    activeStep: CampaignEditorStep.AUDIENCE,
    activeContentStepKey: getFirstJourneyStepKey(initialDraft),
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
        catalog: normalizeCampaignEditorCatalog(action.catalog ?? state.catalog),
        activeStep: action.activeStep ?? state.activeStep,
        activeContentStepKey: getFirstJourneyStepKey(nextDraft),
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
        catalog: normalizeCampaignEditorCatalog(action.catalog),
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
    case 'toggleTargetApp': {
      const selected = state.draft.targetApps.includes(action.targetApp);
      const targetApps = selected
        ? state.draft.targetApps.filter(
            (targetApp) => targetApp !== action.targetApp
          )
        : [...state.draft.targetApps, action.targetApp];

      return markDirty(state, {
        ...state.draft,
        targetApps,
        audience: {
          ...state.draft.audience,
          criteria: {
            ...state.draft.audience.criteria,
            locales: normalizeCampaignLocalesForTargetApps(
              state.draft.audience.criteria.locales,
              targetApps
            ),
          },
        },
      });
    }
    case 'applyScenarioTemplate': {
      const templateDefinition = cloneValue(action.template.definition);
      const targetApps =
        (action.template.compatibleTargetApps?.length ?? 0) > 0
          ? Array.from(new Set(action.template.compatibleTargetApps))
          : templateDefinition.targetApps;

      return markDirty(
        state,
        {
          ...state.draft,
          name: templateDefinition.name,
          goal: templateDefinition.goal,
          targetApps,
          goalDefinition: templateDefinition.goalDefinition ?? null,
          channel: templateDefinition.channel,
          audience: {
            ...templateDefinition.audience,
            segmentSource: 'template_segment',
            sourceSegmentId: action.template.id,
            criteria: {
              ...templateDefinition.audience.criteria,
              locales: normalizeCampaignLocalesForTargetApps(
                templateDefinition.audience.criteria.locales,
                targetApps
              ),
            },
          },
          trigger: normalizeNewScheduledTrigger(templateDefinition.trigger),
          journey: templateDefinition.journey,
          content: templateDefinition.content,
        },
        templateDefinition.journey.steps[0]?.stepKey ??
          state.activeContentStepKey
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
            locales: normalizeCampaignLocalesForTargetApps(
              action.patch.locales ?? state.draft.audience.criteria.locales,
              state.draft.targetApps
            ),
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
    case 'appendJourneyStep': {
      const nextDraft = appendCampaignJourneyStepDraft(
        state.draft,
        action.deeplinkTarget
      );
      const nextStepKey =
        nextDraft.journey.steps[nextDraft.journey.steps.length - 1]?.stepKey ??
        getFirstJourneyStepKey(nextDraft);

      return markDirty(state, nextDraft, nextStepKey);
    }
    case 'removeJourneyStep': {
      const nextDraft = removeCampaignJourneyStepDraft(
        state.draft,
        action.stepKey
      );
      const nextActiveStepKey =
        state.activeContentStepKey === action.stepKey
          ? getFirstJourneyStepKey(nextDraft)
          : state.activeContentStepKey;

      return markDirty(state, nextDraft, nextActiveStepKey);
    }
    case 'updateJourneyStepDraft':
      return markDirty(
        state,
        updateCampaignJourneyStepDraft(
          state.draft,
          action.stepKey,
          action.patch
        )
      );
    case 'updateJourneyStepDeliveryContent':
      return markDirty(
        state,
        updateCampaignJourneyStepDeliveryContent(
          state.draft,
          action.stepKey,
          action.locale,
          action.patch
        )
      );
    case 'insertToken': {
      const currentContent = getCampaignJourneyStepDraft(
        state.draft,
        action.stepKey
      )?.localizedDeliveryContent[action.locale];
      const variantIndex =
        typeof action.variantIndex === 'number' ? action.variantIndex : null;
      const currentVariant =
        variantIndex !== null ? currentContent?.variants?.[variantIndex] : null;
      const currentValue =
        variantIndex !== null
          ? (currentVariant?.[action.field] ?? '')
          : (currentContent?.[action.field] ?? '');
      const nextValue = insertTokenAtSelection({
        value: currentValue,
        token: action.token,
        selection: action.selection,
      });
      const patch =
        variantIndex !== null
          ? {
              variants: (currentContent?.variants ?? []).map(
                (variant, index) =>
                  index === variantIndex
                    ? {
                        ...variant,
                        [action.field]: nextValue,
                      }
                    : variant
              ),
            }
          : {
              [action.field]: nextValue,
            };

      return markDirty(
        state,
        updateCampaignJourneyStepDeliveryContent(
          state.draft,
          action.stepKey,
          action.locale,
          patch
        )
      );
    }
    case 'changeGoalDefinition':
      return markDirty(state, {
        ...state.draft,
        goalDefinition: action.goalDefinition,
      });
    case 'changeDeeplink':
      return markDirty(
        state,
        changeCampaignJourneyStepDeeplink(
          state.draft,
          action.stepKey,
          action.locale,
          action.target
        )
      );
    case 'changeCustomDeeplink':
      return markDirty(
        state,
        changeCampaignJourneyStepCustomDeeplink(
          state.draft,
          action.stepKey,
          action.locale,
          action.path
        )
      );
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
        activeContentStepKey: getFirstJourneyStepKey(nextDraft),
        isDirty: false,
        lastActionResult: action.message
          ? {
              kind: 'save',
              message: action.message,
            }
          : null,
        lastPersistedDraft: cloneDraft(nextDraft),
      };
    }
    case 'markActionSuccess': {
      const nextDraft = action.draft ? cloneDraft(action.draft) : state.draft;
      return {
        ...state,
        draft: nextDraft,
        activeContentStepKey: getFirstJourneyStepKey(nextDraft),
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
        createEmptyCampaignDraft();
      const nextDraft = cloneDraft(fallbackDraft);
      return {
        ...state,
        draft: nextDraft,
        activeContentStepKey: getFirstJourneyStepKey(nextDraft),
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
