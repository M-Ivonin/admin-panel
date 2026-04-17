/**
 * Repository boundary for all campaigns admin interactions.
 */

import {
  archiveCampaign,
  createCampaignDraft,
  estimateCampaignAudience,
  getCampaignDraft,
  getCampaignEditorCatalog,
  getCampaignsOverview,
  saveCampaignSegment,
  saveCampaignTemplate,
  scheduleCampaign,
  sendCampaignTest,
  updateCampaignDraft,
} from '@/lib/api/campaigns';
import type {
  ArchiveCampaignRequest,
  ArchiveCampaignResponse,
  CampaignDraft,
  CampaignEditorCatalog,
  CampaignsOverviewResponse,
  EstimateAudienceRequest,
  EstimateAudienceResponse,
  GetCampaignsOverviewParams,
  SaveSegmentRequest,
  SaveSegmentResponse,
  SaveTemplateRequest,
  SaveTemplateResponse,
  ScheduleCampaignRequest,
  ScheduleCampaignResponse,
  SendTestCampaignRequest,
  SendTestCampaignResponse,
  UpsertCampaignDraftRequest,
} from '@/modules/campaigns/contracts';

export type GetCampaignsOverviewMethod = (
  params: GetCampaignsOverviewParams,
) => Promise<CampaignsOverviewResponse>;

export type GetCampaignEditorCatalogMethod = () => Promise<CampaignEditorCatalog>;

export type GetCampaignDraftMethod = (id: string) => Promise<CampaignDraft>;

export type CreateCampaignDraftMethod = (
  input: UpsertCampaignDraftRequest,
) => Promise<CampaignDraft>;

export type UpdateCampaignDraftMethod = (
  id: string,
  input: UpsertCampaignDraftRequest,
) => Promise<CampaignDraft>;

export type EstimateCampaignAudienceMethod = (
  input: EstimateAudienceRequest,
) => Promise<EstimateAudienceResponse>;

export type SaveCampaignSegmentMethod = (
  input: SaveSegmentRequest,
) => Promise<SaveSegmentResponse>;

export type SaveCampaignTemplateMethod = (
  input: SaveTemplateRequest,
) => Promise<SaveTemplateResponse>;

export type SendCampaignTestMethod = (
  id: string,
  input: SendTestCampaignRequest,
) => Promise<SendTestCampaignResponse>;

export type ScheduleCampaignMethod = (
  id: string,
  input: ScheduleCampaignRequest,
) => Promise<ScheduleCampaignResponse>;

export type ArchiveCampaignMethod = (
  id: string,
  input: ArchiveCampaignRequest,
) => Promise<ArchiveCampaignResponse>;

export interface CampaignsRepository {
  getCampaignsOverview: GetCampaignsOverviewMethod;
  getEditorCatalog: GetCampaignEditorCatalogMethod;
  getCampaign: GetCampaignDraftMethod;
  createCampaignDraft: CreateCampaignDraftMethod;
  updateCampaignDraft: UpdateCampaignDraftMethod;
  estimateAudience: EstimateCampaignAudienceMethod;
  saveSegment: SaveCampaignSegmentMethod;
  saveTemplate: SaveCampaignTemplateMethod;
  sendTestCampaign: SendCampaignTestMethod;
  scheduleCampaign: ScheduleCampaignMethod;
  archiveCampaign: ArchiveCampaignMethod;
}

export const campaignsRepository: CampaignsRepository = {
  getCampaignsOverview,
  getEditorCatalog: getCampaignEditorCatalog,
  getCampaign: getCampaignDraft,
  createCampaignDraft,
  updateCampaignDraft,
  estimateAudience: estimateCampaignAudience,
  saveSegment: saveCampaignSegment,
  saveTemplate: saveCampaignTemplate,
  sendTestCampaign: sendCampaignTest,
  scheduleCampaign,
  archiveCampaign,
};
