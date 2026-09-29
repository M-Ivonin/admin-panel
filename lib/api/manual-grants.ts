import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export interface ManualGrant {
  id: string;
  userId: string;
  productKey: 'PASS_24H' | 'PASS_3D' | 'PRO_MONTHLY' | 'PRO_ANNUAL';
  startsAt: string;
  expiresAt: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  revokedAt: string | null;
  revokedBy: string | null;
  revokeReason: string | null;
}
export interface ManualGrantAccess {
  authorization: 'FREE' | 'FULL_ACCESS';
  accessSource: 'none' | 'commerce' | 'legacy_grandfathered';
  primaryEntitlement: {
    entitlementId: string;
    productKey: string;
    expiresAt: string | null;
  } | null;
}
export interface ManualGrantHistory {
  user: { id: string; email: string | null };
  environment: 'DEV' | 'PROD';
  access: ManualGrantAccess;
  activeGrant: ManualGrant | null;
  operation: ManualGrant | null;
  history: ManualGrant[];
  total: number;
  page: number;
  pageSize: number;
}
export interface ManualGrantRequest {
  operationId: string;
  productKey: 'PASS_24H' | 'PASS_3D' | 'PRO_MONTHLY' | 'PRO_ANNUAL';
  reason: string;
}
export class ManualGrantError extends Error {
  constructor(
    public status: number,
    public code: string,
    public retryAfterSeconds?: number
  ) {
    super(code);
  }
}
async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await adminAuthFetch({
    path,
    method: body ? 'POST' : 'GET',
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      code?: string;
      retryAfterSeconds?: number;
    };
    throw new ManualGrantError(
      response.status,
      error.code ?? 'REQUEST_FAILED',
      error.retryAfterSeconds
    );
  }
  return response.json();
}
const path = (userId: string) =>
  `/commerce/admin/users/${encodeURIComponent(userId)}/manual-grants`;
export const getManualGrants = (
  userId: string,
  page = 1,
  operationId?: string
) =>
  request<ManualGrantHistory>(
    `${path(userId)}?page=${page}${operationId ? `&operationId=${encodeURIComponent(operationId)}` : ''}`
  );
export const createManualGrant = (
  userId: string,
  input: ManualGrantRequest,
  password: string
) =>
  request<{ grant: ManualGrant; access: ManualGrantAccess }>(path(userId), {
    ...input,
    password,
  });
export const revokeManualGrant = (
  userId: string,
  grantId: string,
  reason: string,
  password: string
) =>
  request<{ grant: ManualGrant; access: ManualGrantAccess }>(
    `${path(userId)}/${encodeURIComponent(grantId)}/revoke`,
    { reason, password }
  );
