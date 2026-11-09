import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import type {
  AppPartnerAnalytics,
  AppPartnerAnalyticsFilters,
  AppPartnerCampaign,
  AppPartnerCampaignInput,
} from '@/modules/app-partner-campaigns/types';

const path = '/app-partner-campaigns/admin';

async function readJson<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  const fallback = response.statusText || `Request failed (${response.status})`;
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = payload?.message;
  throw new Error(
    (Array.isArray(message) ? message.join(' ') : message) || fallback
  );
}

export async function getAppPartnerCampaigns(): Promise<AppPartnerCampaign[]> {
  return readJson(await adminAuthFetch({ path, method: 'GET' }));
}

export async function saveAppPartnerCampaign(
  input: AppPartnerCampaignInput,
  campaign?: Pick<AppPartnerCampaign, 'id' | 'version'>
): Promise<AppPartnerCampaign> {
  return readJson(
    await adminAuthFetch({
      path: campaign ? `${path}/${encodeURIComponent(campaign.id)}` : path,
      method: campaign ? 'PUT' : 'POST',
      body: JSON.stringify(
        campaign ? { ...input, expectedVersion: campaign.version } : input
      ),
    })
  );
}

export async function pauseAppPartnerCampaign(
  campaign: Pick<AppPartnerCampaign, 'id' | 'version'>
): Promise<AppPartnerCampaign> {
  return readJson(
    await adminAuthFetch({
      path: `${path}/${encodeURIComponent(campaign.id)}/pause`,
      method: 'POST',
      body: JSON.stringify({ expectedVersion: campaign.version }),
    })
  );
}

export async function uploadAppPartnerCampaignImage(
  file: File
): Promise<string> {
  const body = new FormData();
  body.set('image', file);
  const response = await readJson<{ imageUrl: string }>(
    await adminAuthFetch({ path: `${path}/images`, method: 'POST', body })
  );
  return response.imageUrl;
}

export async function getAppPartnerAnalytics(
  filters: AppPartnerAnalyticsFilters
): Promise<AppPartnerAnalytics> {
  return readJson(
    await adminAuthFetch({
      path: analyticsPath('analytics', filters),
      method: 'GET',
    })
  );
}

export async function getAppPartnerAnalyticsCsv(
  filters: AppPartnerAnalyticsFilters
): Promise<Blob> {
  const response = await adminAuthFetch({
    path: analyticsPath('analytics.csv', filters),
    method: 'GET',
    headers: { Accept: 'text/csv' },
  });
  if (!response.ok) return readJson(response);
  return response.blob();
}

function analyticsPath(
  endpoint: 'analytics' | 'analytics.csv',
  filters: AppPartnerAnalyticsFilters
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value?.trim()) params.set(key, value.trim());
  }
  const query = params.toString();
  return `${path}/${endpoint}${query ? `?${query}` : ''}`;
}
