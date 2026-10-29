import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export interface EngagementExclusion {
  id: string;
  kind: 'email' | 'installation';
  value: string;
  userId: string | null;
}
export interface EngagementInstallation {
  installationId: string;
  platform: string;
  hardware: string | null;
  simulator: boolean;
  engagementMs: number;
  excluded?: boolean;
  events?: number;
}
export interface EngagementAccount {
  day: string;
  userId: string;
  name: string | null;
  email: string | null;
  active: boolean;
  engagementMs: number;
  installations: EngagementInstallation[];
}
export interface EngagementDay {
  day: string;
  status: 'missing' | 'preliminary' | 'ready';
  syncedAt: string | null;
  activeUsers: number;
  totalEngagementMs: number;
  averageEngagementMs: number | null;
  anonymousEngagementMs: number;
  unknownEngagementMs: number;
  excludedEngagementMs: number;
}
export interface EngagementReport {
  timezone: string;
  metric: string;
  overlapPolicy: string;
  configured: boolean;
  range: { from: string; to: string; includeExcluded: boolean };
  days: EngagementDay[];
  users: EngagementAccount[];
  exclusions: EngagementExclusion[];
  installations: EngagementInstallation[];
}
export interface EngagementQuery {
  from: string;
  to: string;
  includeExcluded: boolean;
  userId?: string;
}
const base = '/app-events/admin/engagement';

/** Uses the shared authenticated admin client and preserves server validation errors. */
async function request<T>(
  path: string,
  method: string,
  body?: unknown
): Promise<T> {
  const response = await adminAuthFetch({
    path,
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const error: { message?: string | string[] } = await response
      .json()
      .catch(() => ({}));
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(' ')
        : error.message || `Request failed (${response.status}).`
    );
  }
  return response.json();
}

/** Reads persisted engagement without launching a BigQuery job. */
export function getEngagementReport(
  query: EngagementQuery
): Promise<EngagementReport> {
  const params = new URLSearchParams({
    from: query.from,
    to: query.to,
    includeExcluded: String(query.includeExcluded),
  });
  if (query.userId) params.set('userId', query.userId);
  return request(`${base}?${params}`, 'GET');
}
/** Requests a bounded source refresh and retains previously imported days on failure. */
export function syncEngagement(
  from: string,
  to: string
): Promise<{ importedDays: number; busy: boolean }> {
  return request(`${base}/sync`, 'POST', { from, to });
}
/** Adds a shared email or installation exclusion. */
export function addEngagementExclusion(
  kind: EngagementExclusion['kind'],
  value: string
): Promise<EngagementExclusion[]> {
  return request(`${base}/exclusions`, 'POST', { kind, value });
}
/** Removes one exclusion without deleting source measurements. */
export function removeEngagementExclusion(
  id: string
): Promise<EngagementExclusion[]> {
  return request(`${base}/exclusions/${encodeURIComponent(id)}`, 'DELETE');
}

export interface PersonalizationSettings {
  minimumContactIntervalHours: number;
  aiCallsPerUser24h: number;
  aiCallsPerDay: number;
  revision: number;
  updatedAt: string;
  updatedBy: string | null;
}

export function getPersonalizationSettings(): Promise<PersonalizationSettings> {
  return request(`${base}/personalization-settings`, 'GET');
}

export function savePersonalizationSettings(
  minimumContactIntervalHours: number,
  expectedRevision: number,
  aiLimits?: Pick<
    PersonalizationSettings,
    'aiCallsPerUser24h' | 'aiCallsPerDay'
  >
): Promise<PersonalizationSettings> {
  return request(`${base}/personalization-settings`, 'PATCH', {
    minimumContactIntervalHours,
    expectedRevision,
    ...aiLimits,
  });
}
