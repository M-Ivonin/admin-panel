/**
 * Repository boundary for all campaigns admin interactions.
 */

import { createEmptyCampaignDraft } from '@/modules/campaigns/defaults';
import { buildUpsertCampaignDraftPayload } from '@/modules/campaigns/draft-payload';
import {
  archiveCampaign,
  createCampaignDraft,
  deleteCampaignTemplate,
  estimateCampaignAudience,
  getCampaignOverviewItemMetrics,
  getCampaignsOverviewStats,
  getCampaignDraft,
  getCampaignEditorCatalog,
  getCampaignsOverview,
  pauseCampaign,
  resetCampaignDiagnostics,
  saveCampaignSegment,
  saveCampaignTemplate,
  scheduleCampaign,
  sendCampaignTest,
  updateCampaignTemplate,
  updateCampaignDraft,
} from '@/lib/api/campaigns';
import type {
  ArchiveCampaignRequest,
  ArchiveCampaignResponse,
  DeleteTemplateResponse,
  CampaignDraft,
  CampaignDiagnosticsResetResponse,
  CampaignEditorCatalog,
  CampaignOverviewItemMetricsResponse,
  CampaignOverviewStatsResponse,
  CampaignsOverviewResponse,
  EstimateAudienceRequest,
  EstimateAudienceResponse,
  GetCampaignOverviewItemMetricsParams,
  GetCampaignOverviewStatsParams,
  GetCampaignsOverviewParams,
  PauseCampaignRequest,
  PauseCampaignResponse,
  SaveSegmentRequest,
  SaveSegmentResponse,
  SaveTemplateRequest,
  SaveTemplateResponse,
  UpdateTemplateRequest,
  UpdateTemplateResponse,
  ScheduleCampaignRequest,
  ScheduleCampaignResponse,
  SendTestCampaignRequest,
  SendTestCampaignResponse,
  UpsertCampaignDraftRequest,
} from '@/modules/campaigns/contracts';

export type GetCampaignsOverviewMethod = (
  params: GetCampaignsOverviewParams
) => Promise<CampaignsOverviewResponse>;

export type GetCampaignsOverviewStatsMethod = (
  params: GetCampaignOverviewStatsParams
) => Promise<CampaignOverviewStatsResponse>;

export type GetCampaignOverviewItemMetricsMethod = (
  params: GetCampaignOverviewItemMetricsParams
) => Promise<CampaignOverviewItemMetricsResponse>;

export type GetCampaignEditorCatalogMethod =
  () => Promise<CampaignEditorCatalog>;

export type GetCampaignDraftMethod = (id: string) => Promise<CampaignDraft>;

export type CreateCampaignDraftMethod = (
  input: UpsertCampaignDraftRequest
) => Promise<CampaignDraft>;

export type UpdateCampaignDraftMethod = (
  id: string,
  input: UpsertCampaignDraftRequest
) => Promise<CampaignDraft>;

export type EstimateCampaignAudienceMethod = (
  input: EstimateAudienceRequest
) => Promise<EstimateAudienceResponse>;

export type SaveCampaignSegmentMethod = (
  input: SaveSegmentRequest
) => Promise<SaveSegmentResponse>;

export type SaveCampaignTemplateMethod = (
  input: SaveTemplateRequest
) => Promise<SaveTemplateResponse>;

export type UpdateCampaignTemplateMethod = (
  id: string,
  input: UpdateTemplateRequest
) => Promise<UpdateTemplateResponse>;

export type DeleteCampaignTemplateMethod = (
  id: string
) => Promise<DeleteTemplateResponse>;

export type SendCampaignTestMethod = (
  id: string,
  input: SendTestCampaignRequest
) => Promise<SendTestCampaignResponse>;

export type ScheduleCampaignMethod = (
  id: string,
  input: ScheduleCampaignRequest
) => Promise<ScheduleCampaignResponse>;

export type ArchiveCampaignMethod = (
  id: string,
  input: ArchiveCampaignRequest
) => Promise<ArchiveCampaignResponse>;

export type PauseCampaignMethod = (
  id: string,
  input: PauseCampaignRequest
) => Promise<PauseCampaignResponse>;

export type ResetCampaignDiagnosticsMethod = (
  id: string
) => Promise<CampaignDiagnosticsResetResponse>;

export interface ScheduleCampaignDraftResult extends ScheduleCampaignResponse {
  persistedDraftId: string;
}

export type ScheduleCampaignDraftMethod = (
  draft: CampaignDraft
) => Promise<ScheduleCampaignDraftResult>;

export interface SendCampaignTestDraftResult extends SendTestCampaignResponse {
  persistedDraft: CampaignDraft;
}

export type SendCampaignTestDraftMethod = (
  draft: CampaignDraft,
  input: SendTestCampaignRequest
) => Promise<SendCampaignTestDraftResult>;

export interface PauseCampaignDraftResult extends PauseCampaignResponse {
  persistedDraftId: string;
}

export type PauseCampaignDraftMethod = (
  draft: CampaignDraft
) => Promise<PauseCampaignDraftResult>;

export interface SaveCampaignDraftResult {
  draft: CampaignDraft;
  wasCreated: boolean;
}

export type SaveCampaignDraftMethod = (
  draft: CampaignDraft
) => Promise<SaveCampaignDraftResult>;

export interface LoadCampaignEditorInput {
  mode: 'create' | 'edit';
  campaignId?: string;
}

export interface LoadCampaignEditorResult {
  catalog: CampaignEditorCatalog;
  draft: CampaignDraft;
  lastPersistedDraft: CampaignDraft | null;
}

export type LoadCampaignEditorMethod = (
  input: LoadCampaignEditorInput
) => Promise<LoadCampaignEditorResult>;

export class CampaignEditorActionError extends Error {
  persistedDraftId: string | null;

  constructor(message: string, options?: { persistedDraftId?: string | null }) {
    super(message);
    this.name = 'CampaignEditorActionError';
    this.persistedDraftId = options?.persistedDraftId ?? null;
  }
}

export interface CampaignsRepository {
  getCampaignsOverview: GetCampaignsOverviewMethod;
  getCampaignsOverviewStats: GetCampaignsOverviewStatsMethod;
  getCampaignOverviewItemMetrics: GetCampaignOverviewItemMetricsMethod;
  loadEditor: LoadCampaignEditorMethod;
  getEditorCatalog: GetCampaignEditorCatalogMethod;
  getCampaign: GetCampaignDraftMethod;
  createCampaignDraft: CreateCampaignDraftMethod;
  updateCampaignDraft: UpdateCampaignDraftMethod;
  saveDraft: SaveCampaignDraftMethod;
  estimateAudience: EstimateCampaignAudienceMethod;
  saveSegment: SaveCampaignSegmentMethod;
  saveTemplate: SaveCampaignTemplateMethod;
  updateTemplate: UpdateCampaignTemplateMethod;
  deleteTemplate: DeleteCampaignTemplateMethod;
  sendTestCampaign: SendCampaignTestMethod;
  sendTestDraft: SendCampaignTestDraftMethod;
  scheduleCampaign: ScheduleCampaignMethod;
  scheduleDraft: ScheduleCampaignDraftMethod;
  archiveCampaign: ArchiveCampaignMethod;
  pauseCampaign: PauseCampaignMethod;
  resetCampaignDiagnostics: ResetCampaignDiagnosticsMethod;
  pauseDraft: PauseCampaignDraftMethod;
}

async function persistCampaignDraft(
  draft: CampaignDraft
): Promise<CampaignDraft> {
  const payload = buildUpsertCampaignDraftPayload(draft);

  return draft.id === null
    ? createCampaignDraft(payload)
    : updateCampaignDraft(draft.id, payload);
}

export const campaignsRepository: CampaignsRepository = {
  getCampaignsOverview,
  getCampaignsOverviewStats,
  getCampaignOverviewItemMetrics,
  async loadEditor(input) {
    const catalog = await getCampaignEditorCatalog();

    if (input.mode === 'edit' && input.campaignId) {
      const draft = await getCampaignDraft(input.campaignId);

      return {
        catalog,
        draft,
        lastPersistedDraft: draft,
      };
    }

    return {
      catalog,
      draft: createEmptyCampaignDraft(),
      lastPersistedDraft: null,
    };
  },
  getEditorCatalog: getCampaignEditorCatalog,
  getCampaign: getCampaignDraft,
  createCampaignDraft,
  updateCampaignDraft,
  async saveDraft(draft) {
    const savedDraft = await persistCampaignDraft(draft);

    return {
      draft: savedDraft,
      wasCreated: draft.id === null,
    };
  },
  estimateAudience: estimateCampaignAudience,
  saveSegment: saveCampaignSegment,
  saveTemplate: saveCampaignTemplate,
  updateTemplate: updateCampaignTemplate,
  deleteTemplate: deleteCampaignTemplate,
  sendTestCampaign: sendCampaignTest,
  async sendTestDraft(draft, input) {
    const persistedDraft = await persistCampaignDraft(draft);

    let response: SendTestCampaignResponse;
    try {
      response = await sendCampaignTest(persistedDraft.id!, input);
    } catch (error) {
      throw toCampaignEditorActionError(error, persistedDraft.id);
    }

    return {
      ...response,
      persistedDraft,
    };
  },
  scheduleCampaign,
  async scheduleDraft(draft) {
    const savedDraft = await persistCampaignDraft(draft);
    let response: ScheduleCampaignResponse;
    try {
      response = await scheduleCampaign(savedDraft.id!, {
        confirm: true,
      });
    } catch (error) {
      throw toCampaignEditorActionError(error, savedDraft.id);
    }

    return {
      ...response,
      persistedDraftId: savedDraft.id!,
    };
  },
  archiveCampaign,
  pauseCampaign,
  resetCampaignDiagnostics,
  async pauseDraft(draft) {
    const persistedDraft = await persistCampaignDraft(draft);
    let response: PauseCampaignResponse;
    try {
      response = await pauseCampaign(persistedDraft.id!, {
        confirm: true,
      });
    } catch (error) {
      throw toCampaignEditorActionError(error, persistedDraft.id);
    }

    return {
      ...response,
      persistedDraftId: persistedDraft.id!,
    };
  },
};

function toCampaignEditorActionError(
  error: unknown,
  persistedDraftId: string | null
): CampaignEditorActionError {
  if (error instanceof CampaignEditorActionError) {
    return error;
  }

  const message =
    error instanceof Error && error.message.trim().length > 0
      ? error.message
      : 'Campaign editor action failed';

  return new CampaignEditorActionError(message, { persistedDraftId });
}
