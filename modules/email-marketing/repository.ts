import { getPartnerMarketConfigs } from '@/lib/api/partner-market-configs';
import type { CampaignAudienceDefinition, CampaignLocale } from '@/modules/campaigns/contracts';
import type {
  EmailMarketingRepository,
  EmailPreview,
  EmailPublication,
  EmailPublicationMutationResult,
  EmailPublicationState,
  PartnerMarketProjection,
  PredictionReference,
} from '@/modules/email-marketing/contracts';
import { adminAuthFetch } from '@/modules/http/admin-auth-client';

const ROOT = '/campaigns/admin/email-publications';

export class EmailMarketingRepositoryError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'EmailMarketingRepositoryError';
  }
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = response.statusText || `Request failed (${response.status})`;
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message)) message = payload.message.join(' ');
      else if (payload.message) message = payload.message;
    } catch {
      // Preserve the backend HTTP message when no JSON error body is available.
    }
    throw new EmailMarketingRepositoryError(message, response.status);
  }
  return response.json() as Promise<T>;
}

async function request<T>(path: string, method = 'GET', body?: unknown, headers?: HeadersInit): Promise<T> {
  return readJson<T>(await adminAuthFetch({
    path, method, headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  }));
}

const command = (id: string, action: string, body?: unknown) =>
  request<EmailPublicationMutationResult>(`${ROOT}/${encodeURIComponent(id)}/${action}`, 'POST', body);

export const emailMarketingRepository: EmailMarketingRepository = {
  async list(state?: EmailPublicationState) {
    const query = state ? `?state=${encodeURIComponent(state)}` : '';
    return (await request<{ items: EmailPublication[] }>(`${ROOT}${query}`)).items;
  },
  get: (id) => request(`${ROOT}/${encodeURIComponent(id)}`),
  create: (input, idempotencyKey) => request(ROOT, 'POST', input, { 'Idempotency-Key': idempotencyKey }),
  edit: (id, input) => request(`${ROOT}/${encodeURIComponent(id)}`, 'PUT', input),
  preview: (id, locale) => request<EmailPreview>(`${ROOT}/${encodeURIComponent(id)}/preview?locale=${locale}`),
  approve: (id) => command(id, 'approve'),
  sendNow: (id) => command(id, 'send-now'),
  schedule: (id, input) => command(id, 'schedule', input),
  pause: (id) => command(id, 'pause'),
  resume: (id) => command(id, 'resume'),
  cancel: (id, reason) => command(id, 'cancel', { reason: reason.trim() }),
  estimateAudience: (audience: CampaignAudienceDefinition) => request(`${ROOT}/estimate-audience`, 'POST', { audience }),
  async listPredictionReferences(): Promise<PredictionReference[]> {
    return (await request<{ items: PredictionReference[] }>(`${ROOT}/references/predictions`)).items;
  },
  async listPartnerMarketConfigs(): Promise<PartnerMarketProjection[]> {
    return (await getPartnerMarketConfigs()).filter((item) => item.status === 'approved' && !item.killSwitchEnabled);
  },
};

export function createEmailPublicationIdempotencyKey(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `email-publication-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export type { CampaignLocale };
