import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import {
  PartnerMarketConfig,
  PartnerMarketConfigFilters,
  PartnerMarketConfigInput,
} from '@/modules/partner-market-configs/types';

export async function getPartnerMarketConfigs(
  filters: PartnerMarketConfigFilters = {}
): Promise<PartnerMarketConfig[]> {
  const params = new URLSearchParams();
  if (filters.operatorKey?.trim()) params.set('operatorKey', filters.operatorKey.trim().toLowerCase());
  if (filters.countryCode?.trim()) params.set('countryCode', filters.countryCode.trim().toUpperCase());
  const query = params.toString();
  const response = await adminAuthFetch({
    path: `/partner-market-configs/admin${query ? `?${query}` : ''}`,
    method: 'GET',
  });
  return (await readJson<{ items: PartnerMarketConfig[] }>(response)).items;
}

export async function savePartnerMarketConfig(
  input: PartnerMarketConfigInput
): Promise<PartnerMarketConfig> {
  return readJson<PartnerMarketConfig>(
    await adminAuthFetch({
      path: '/partner-market-configs/admin',
      method: 'PUT',
      body: JSON.stringify(input),
    })
  );
}

export async function pausePartnerMarketConfig(
  id: string,
  reason: string
): Promise<PartnerMarketConfig> {
  return readJson<PartnerMarketConfig>(
    await adminAuthFetch({
      path: `/partner-market-configs/admin/${encodeURIComponent(id)}/pause`,
      method: 'POST',
      body: JSON.stringify({ reason: reason.trim() }),
    })
  );
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
