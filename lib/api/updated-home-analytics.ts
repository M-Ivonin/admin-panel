import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export interface UpdatedHomeAnalyticsParams {
  from: string;
  to: string;
}

export interface UpdatedHomeMetricDefinition {
  key: string;
  numerator: string;
  denominator: string | null;
  window: string;
  grouping: string[];
  nullTreatment: string;
}

export interface UpdatedHomeMetricValue {
  dimensions: Record<string, unknown>;
  numerator: number | null;
  denominator: number | null;
  value: number | null;
  unit: string;
  naReason: string | null;
}

export interface UpdatedHomeDashboardBlock {
  id: number;
  name: string;
  definitionVersion: string;
  observationCompleteness: {
    isComplete: boolean;
    reason: string | null;
  };
  dimensions: string[];
  metrics: Array<{
    definition: UpdatedHomeMetricDefinition;
    values: UpdatedHomeMetricValue[];
  }>;
}

export interface UpdatedHomeAnalyticsResponse {
  definitionVersion: string;
  timezone: 'UTC';
  range: { from: string; to: string };
  dashboards: UpdatedHomeDashboardBlock[];
}

async function readError(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    return Array.isArray(body.message)
      ? body.message.join(' ')
      : (body.message ?? null);
  } catch {
    return null;
  }
}

/** Reads backend-computed Updated Home dashboards through the admin client. */
export async function getUpdatedHomeAnalytics(
  params: UpdatedHomeAnalyticsParams
): Promise<UpdatedHomeAnalyticsResponse> {
  const search = new URLSearchParams({ from: params.from, to: params.to });
  const response = await adminAuthFetch({
    path: `/updated-home-analytics/admin/dashboards?${search.toString()}`,
    method: 'GET',
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 403) throw new Error('Forbidden');
    throw new Error(
      (await readError(response)) ??
        `Failed to load Updated Home analytics: ${response.statusText}`
    );
  }
  return response.json();
}
