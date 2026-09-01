import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import {
  MarketingJurisdiction,
  MarketingJurisdictionFilters,
  MarketingJurisdictionInput,
} from '@/modules/marketing-jurisdictions/types';

export async function getMarketingJurisdictions(
  filters: MarketingJurisdictionFilters = {}
): Promise<MarketingJurisdiction[]> {
  const params = new URLSearchParams();
  if (filters.countryCode?.trim()) params.set('countryCode', filters.countryCode.trim().toUpperCase());
  const query = params.toString();
  const response = await adminAuthFetch({
    path: `/marketing-jurisdictions/admin${query ? `?${query}` : ''}`,
    method: 'GET',
  });
  return (await readJson<{ items: MarketingJurisdiction[] }>(response)).items;
}

export async function saveMarketingJurisdiction(
  input: MarketingJurisdictionInput
): Promise<MarketingJurisdiction> {
  return readJson<MarketingJurisdiction>(await adminAuthFetch({
    path: '/marketing-jurisdictions/admin',
    method: 'PUT',
    body: JSON.stringify(input),
  }));
}

export async function pauseMarketingJurisdiction(
  id: string,
  reason: string
): Promise<MarketingJurisdiction> {
  return readJson<MarketingJurisdiction>(await adminAuthFetch({
    path: `/marketing-jurisdictions/admin/${encodeURIComponent(id)}/pause`,
    method: 'POST',
    body: JSON.stringify({ reason: reason.trim() }),
  }));
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = response.statusText || `Request failed (${response.status})`;
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message)) message = payload.message.join(' ');
      else if (payload.message) message = payload.message;
    } catch {
      // Preserve the HTTP status text when the backend did not return JSON.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}
