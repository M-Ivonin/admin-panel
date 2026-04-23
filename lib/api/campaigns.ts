/**
 * Raw HTTP helpers for the future campaigns admin backend.
 */

import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import type {
  ArchiveCampaignRequest,
  ArchiveCampaignResponse,
  DeleteTemplateResponse,
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
  UpdateTemplateRequest,
  UpdateTemplateResponse,
  ScheduleCampaignRequest,
  ScheduleCampaignResponse,
  SendTestCampaignRequest,
  SendTestCampaignResponse,
  UpsertCampaignDraftRequest,
} from '@/modules/campaigns/contracts';

function appendQueryParam(
  searchParams: URLSearchParams,
  key: string,
  values: string[]
) {
  values.forEach((value) => {
    searchParams.append(key, value);
  });
}

async function readAdminErrorMessage(
  response: Response
): Promise<string | null> {
  try {
    const body = (await response.json()) as
      | {
          message?: string | string[];
          error?: string;
        }
      | undefined;

    if (Array.isArray(body?.message)) {
      return body.message.join(' ');
    }

    if (typeof body?.message === 'string' && body.message.trim().length > 0) {
      return body.message;
    }

    if (typeof body?.error === 'string' && body.error.trim().length > 0) {
      return body.error;
    }
  } catch {
    return null;
  }

  return null;
}

async function parseAdminResponse<T>(
  response: Response,
  message: string
): Promise<T> {
  if (!response.ok) {
    const backendMessage = await readAdminErrorMessage(response);

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    if (response.status === 403) {
      throw new Error('Forbidden');
    }

    if (response.status === 404) {
      throw new Error(backendMessage ?? 'Campaign not found');
    }

    throw new Error(backendMessage ?? `${message}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Loads the campaigns overview list and KPI payload.
 */
export async function getCampaignsOverview(
  params: GetCampaignsOverviewParams
): Promise<CampaignsOverviewResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search) {
    searchParams.set('search', params.search);
  }

  if (params.quickView) {
    searchParams.set('quickView', params.quickView);
  }

  appendQueryParam(searchParams, 'statuses', params.statuses);
  appendQueryParam(searchParams, 'triggerTypes', params.triggerTypes);

  const response = await adminAuthFetch({
    path: `/campaigns/admin/overview?${searchParams.toString()}`,
    method: 'GET',
  });

  return parseAdminResponse(response, 'Failed to fetch campaigns overview');
}

/**
 * Loads static editor catalogs for the builder.
 */
export async function getCampaignEditorCatalog(): Promise<CampaignEditorCatalog> {
  const response = await adminAuthFetch({
    path: '/campaigns/admin/catalog',
    method: 'GET',
  });

  return parseAdminResponse(response, 'Failed to fetch campaign catalog');
}

/**
 * Loads a single persisted campaign draft.
 */
export async function getCampaignDraft(id: string): Promise<CampaignDraft> {
  const response = await adminAuthFetch({
    path: `/campaigns/admin/${id}`,
    method: 'GET',
  });

  return parseAdminResponse(response, 'Failed to fetch campaign draft');
}

/**
 * Creates a new persisted campaign draft.
 */
export async function createCampaignDraft(
  input: UpsertCampaignDraftRequest
): Promise<CampaignDraft> {
  const response = await adminAuthFetch({
    path: '/campaigns/admin',
    method: 'POST',
    body: JSON.stringify(input),
  });

  return parseAdminResponse(response, 'Failed to create campaign draft');
}

/**
 * Updates an existing persisted campaign draft.
 */
export async function updateCampaignDraft(
  id: string,
  input: UpsertCampaignDraftRequest
): Promise<CampaignDraft> {
  const response = await adminAuthFetch({
    path: `/campaigns/admin/${id}`,
    method: 'PUT',
    body: JSON.stringify(input),
  });

  return parseAdminResponse(response, 'Failed to update campaign draft');
}

/**
 * Estimates the reachable audience for the current rules.
 */
export async function estimateCampaignAudience(
  input: EstimateAudienceRequest
): Promise<EstimateAudienceResponse> {
  const response = await adminAuthFetch({
    path: '/campaigns/admin/estimate-audience',
    method: 'POST',
    body: JSON.stringify(input),
  });

  return parseAdminResponse(response, 'Failed to estimate campaign audience');
}

/**
 * Saves the current audience rules as a reusable segment.
 */
export async function saveCampaignSegment(
  input: SaveSegmentRequest
): Promise<SaveSegmentResponse> {
  const response = await adminAuthFetch({
    path: '/campaigns/admin/segments',
    method: 'POST',
    body: JSON.stringify(input),
  });

  return parseAdminResponse(response, 'Failed to save campaign segment');
}

/**
 * Saves the current campaign definition as a reusable template.
 */
export async function saveCampaignTemplate(
  input: SaveTemplateRequest
): Promise<SaveTemplateResponse> {
  const response = await adminAuthFetch({
    path: '/campaigns/admin/templates',
    method: 'POST',
    body: JSON.stringify(input),
  });

  return parseAdminResponse(response, 'Failed to save campaign template');
}

/**
 * Updates an existing campaign scenario template.
 */
export async function updateCampaignTemplate(
  id: string,
  input: UpdateTemplateRequest
): Promise<UpdateTemplateResponse> {
  const response = await adminAuthFetch({
    path: `/campaigns/admin/templates/${id}`,
    method: 'PUT',
    body: JSON.stringify(input),
  });

  return parseAdminResponse(response, 'Failed to update campaign template');
}

/**
 * Deletes one saved campaign template.
 */
export async function deleteCampaignTemplate(
  id: string
): Promise<DeleteTemplateResponse> {
  const response = await adminAuthFetch({
    path: `/campaigns/admin/templates/${id}`,
    method: 'DELETE',
  });

  if (!response.ok) {
    const backendMessage = await readAdminErrorMessage(response);

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    if (response.status === 403) {
      throw new Error('Forbidden');
    }

    if (response.status === 404) {
      throw new Error(backendMessage ?? 'Template not found');
    }

    throw new Error(
      backendMessage ??
        `Failed to delete campaign template: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Requests a test send for the specified campaign.
 */
export async function sendCampaignTest(
  id: string,
  input: SendTestCampaignRequest
): Promise<SendTestCampaignResponse> {
  const response = await adminAuthFetch({
    path: `/campaigns/admin/${id}/send-test`,
    method: 'POST',
    body: JSON.stringify(input),
  });

  return parseAdminResponse(response, 'Failed to send campaign test');
}

/**
 * Schedules the specified campaign for delivery.
 */
export async function scheduleCampaign(
  id: string,
  input: ScheduleCampaignRequest
): Promise<ScheduleCampaignResponse> {
  const response = await adminAuthFetch({
    path: `/campaigns/admin/${id}/schedule`,
    method: 'POST',
    body: JSON.stringify(input),
  });

  return parseAdminResponse(response, 'Failed to schedule campaign');
}

/**
 * Archives the specified campaign.
 */
export async function archiveCampaign(
  id: string,
  input: ArchiveCampaignRequest
): Promise<ArchiveCampaignResponse> {
  const response = await adminAuthFetch({
    path: `/campaigns/admin/${id}/archive`,
    method: 'POST',
    body: JSON.stringify(input),
  });

  return parseAdminResponse(response, 'Failed to archive campaign');
}
