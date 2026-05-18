import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export type DiagnosticsMode = 'errors' | 'info' | 'debug' | 'trace';

export type DiagnosticsTargetType =
  | 'device'
  | 'user'
  | 'internal_qa'
  | 'app_version_build'
  | 'platform'
  | 'global_sample';

export type DiagnosticsCategory =
  | 'auth'
  | 'network'
  | 'navigation'
  | 'payments'
  | 'push_deeplinks'
  | 'app_lifecycle';

export type DiagnosticsEnvironment = 'local' | 'dev' | 'production';

export type DiagnosticsTarget = {
  type: DiagnosticsTargetType;
  environment?: DiagnosticsEnvironment;
  deviceId?: string;
  deviceIds?: string[];
  userId?: string;
  userEmail?: string;
  userEmails?: string[];
  platform?: string;
  appVersion?: string;
  buildNumber?: string;
};

export interface DiagnosticsCapabilities {
  canRead: boolean;
  canWrite: boolean;
  canTrace: boolean;
}

export interface DiagnosticsLimits {
  uploadIntervalSec: number;
  maxEventsPerMinute: number;
  maxBatchEvents: number;
  maxPayloadKb: number;
  breadcrumbLimit: number;
}

export interface DiagnosticsPolicy extends DiagnosticsLimits {
  id: string;
  mode: DiagnosticsMode;
  targetType: DiagnosticsTargetType;
  targetKey: string;
  target: DiagnosticsTarget;
  expiresAt: string;
  sampleRate: number;
  categories: DiagnosticsCategory[];
  reason: string;
  enabled: boolean;
  createdByEmail: string | null;
  disabledAt: string | null;
  disabledReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DiagnosticsPolicyListResponse {
  items: DiagnosticsPolicy[];
}

export type CreateDiagnosticsPolicyRequest = {
  mode: DiagnosticsMode;
  target: DiagnosticsTarget;
  expiresAt: string;
  sampleRate: number;
  uploadIntervalSec: number;
  maxEventsPerMinute: number;
  maxBatchEvents: number;
  maxPayloadKb: number;
  breadcrumbLimit: number;
  categories: DiagnosticsCategory[];
  reason: string;
};

export interface DisableDiagnosticsPolicyRequest {
  reason: string;
}

export type DiagnosticsAuditAction = 'create' | 'disable';

export interface DiagnosticsAuditEntry {
  id: string;
  policyId: string | null;
  action: DiagnosticsAuditAction;
  actorEmail: string | null;
  reason: string;
  targetType: DiagnosticsTargetType;
  target: DiagnosticsTarget;
  mode: DiagnosticsMode;
  ttlSeconds: number;
  sampling: { sampleRate: number };
  limits: DiagnosticsLimits;
  categories: DiagnosticsCategory[];
  beforeSnapshot: Record<string, unknown> | null;
  afterSnapshot: Record<string, unknown> | null;
  createdAt: string;
}

export interface DiagnosticsAuditResponse {
  items: DiagnosticsAuditEntry[];
}

export interface DiagnosticsTargetOptionsResponse {
  platforms: string[];
  recentUsers: string[];
  recentDevices: string[];
  appVersionBuilds: Array<{
    appVersion: string;
    buildNumber: string;
  }>;
}

export interface DiagnosticsPoliciesParams {
  activeOnly?: boolean;
}

export interface DiagnosticsAuditParams {
  from?: string;
  to?: string;
  limit?: number;
}

async function readAdminErrorMessage(
  response: Response
): Promise<string | null> {
  try {
    const body = (await response.json()) as
      | { message?: string | string[]; error?: string }
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

async function parseDiagnosticsResponse<T>(
  response: Response,
  fallbackMessage: string
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
      throw new Error(backendMessage ?? 'Diagnostics policy not found');
    }

    throw new Error(
      backendMessage ?? `${fallbackMessage}: ${response.statusText}`
    );
  }

  return response.json();
}

export async function getDiagnosticsCapabilities(): Promise<DiagnosticsCapabilities> {
  const response = await adminAuthFetch({
    path: '/diagnostics/admin/capabilities',
    method: 'GET',
  });

  return parseDiagnosticsResponse(
    response,
    'Failed to fetch diagnostics capabilities'
  );
}

export async function getDiagnosticsPolicies(
  params: DiagnosticsPoliciesParams = {}
): Promise<DiagnosticsPolicyListResponse> {
  const searchParams = new URLSearchParams();

  if (params.activeOnly !== undefined) {
    searchParams.set('activeOnly', String(params.activeOnly));
  }

  const queryString = searchParams.toString();
  const response = await adminAuthFetch({
    path: `/diagnostics/admin/policies${queryString ? `?${queryString}` : ''}`,
    method: 'GET',
  });

  return parseDiagnosticsResponse(
    response,
    'Failed to fetch diagnostics policies'
  );
}

export async function getDiagnosticsTargetOptions(): Promise<DiagnosticsTargetOptionsResponse> {
  const response = await adminAuthFetch({
    path: '/diagnostics/admin/target-options',
    method: 'GET',
  });

  return parseDiagnosticsResponse(
    response,
    'Failed to fetch diagnostics target options'
  );
}

export async function createDiagnosticsPolicy(
  input: CreateDiagnosticsPolicyRequest
): Promise<DiagnosticsPolicy> {
  const response = await adminAuthFetch({
    path: '/diagnostics/admin/policies',
    method: 'POST',
    body: JSON.stringify(input),
  });

  return parseDiagnosticsResponse(
    response,
    'Failed to create diagnostics policy'
  );
}

export async function disableDiagnosticsPolicy(
  id: string,
  input: DisableDiagnosticsPolicyRequest
): Promise<DiagnosticsPolicy> {
  const response = await adminAuthFetch({
    path: `/diagnostics/admin/policies/${id}/disable`,
    method: 'POST',
    body: JSON.stringify(input),
  });

  return parseDiagnosticsResponse(
    response,
    'Failed to disable diagnostics policy'
  );
}

export async function getDiagnosticsAudit(
  params: DiagnosticsAuditParams = {}
): Promise<DiagnosticsAuditResponse> {
  const searchParams = new URLSearchParams();

  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);
  if (params.limit) searchParams.set('limit', String(params.limit));

  const queryString = searchParams.toString();
  const response = await adminAuthFetch({
    path: `/diagnostics/admin/audit${queryString ? `?${queryString}` : ''}`,
    method: 'GET',
  });

  return parseDiagnosticsResponse(
    response,
    'Failed to fetch diagnostics audit'
  );
}

export function getDiagnosticsTtlLimitMinutes(
  mode: DiagnosticsMode,
  targetType: DiagnosticsTargetType
): number | null {
  if (mode === 'trace') {
    return 60;
  }

  if (targetType === 'global_sample') {
    return 30;
  }

  if (mode === 'debug' && (targetType === 'user' || targetType === 'device')) {
    return 24 * 60;
  }

  return null;
}

export function buildDiagnosticsLokiUrl(
  policy: Pick<
    DiagnosticsPolicy,
    'id' | 'mode' | 'targetType' | 'createdAt' | 'expiresAt'
  >
): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_DIAGNOSTICS_LOKI_EXPLORE_URL;

  if (!baseUrl) {
    return null;
  }

  try {
    const url = new URL(baseUrl);
    const expr = `{source=~"mobile-.*|mobile-app"} |= "${policy.id}" |= "policyTargetType" |= "${policy.targetType}" |= "${policy.mode}"`;
    const from = policy.createdAt
      ? new Date(new Date(policy.createdAt).getTime() - 5 * 60 * 1000)
      : null;
    const to = new Date(new Date(policy.expiresAt).getTime() + 5 * 60 * 1000);

    if (from && Number.isFinite(from.getTime())) {
      url.searchParams.set('from', String(from.getTime()));
    }
    if (Number.isFinite(to.getTime())) {
      url.searchParams.set('to', String(to.getTime()));
    }
    url.searchParams.set(
      'left',
      JSON.stringify({
        datasource: 'Loki',
        queries: [{ expr }],
      })
    );

    return url.toString();
  } catch {
    return null;
  }
}
