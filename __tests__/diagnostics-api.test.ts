import {
  buildDiagnosticsLokiUrl,
  createDiagnosticsPolicy,
  disableDiagnosticsPolicy,
  getDiagnosticsAudit,
  getDiagnosticsCapabilities,
  getDiagnosticsPolicies,
  getDiagnosticsTtlLimitMinutes,
  type DiagnosticsPolicy,
} from '@/lib/api/diagnostics';
import { adminAuthFetch } from '@/modules/http/admin-auth-client';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

const policy: DiagnosticsPolicy = {
  id: 'policy-debug',
  mode: 'debug',
  targetType: 'user',
  targetKey: 'user-1',
  target: { type: 'user', userId: 'user-1' },
  expiresAt: '2026-05-16T11:00:00.000Z',
  sampleRate: 0.5,
  uploadIntervalSec: 60,
  maxEventsPerMinute: 30,
  maxBatchEvents: 20,
  maxPayloadKb: 64,
  breadcrumbLimit: 20,
  categories: ['network'],
  reason: 'Investigating support ticket',
  enabled: true,
  createdByEmail: 'writer@example.com',
  disabledAt: null,
  disabledReason: null,
  createdAt: '2026-05-16T10:00:00.000Z',
  updatedAt: '2026-05-16T10:00:00.000Z',
};

describe('diagnostics admin api', () => {
  beforeEach(() => {
    (adminAuthFetch as jest.Mock).mockReset();
    process.env.NEXT_PUBLIC_DIAGNOSTICS_LOKI_EXPLORE_URL = '';
  });

  it('loads capabilities from the dedicated diagnostics endpoint', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        canRead: true,
        canWrite: false,
        canTrace: false,
      }),
    });

    await expect(getDiagnosticsCapabilities()).resolves.toEqual({
      canRead: true,
      canWrite: false,
      canTrace: false,
    });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/diagnostics/admin/capabilities',
      method: 'GET',
    });
  });

  it('lists active or recent policies and surfaces backend errors', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ items: [policy] }),
    });

    await expect(getDiagnosticsPolicies({ activeOnly: true })).resolves.toEqual(
      {
        items: [policy],
      }
    );
    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/diagnostics/admin/policies?activeOnly=true',
      method: 'GET',
    });

    (adminAuthFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });
    await expect(getDiagnosticsPolicies()).rejects.toThrow('Forbidden');
  });

  it('creates and disables policies with backend-compatible payloads', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(policy),
    });

    await createDiagnosticsPolicy({
      mode: 'debug',
      target: {
        type: 'app_version_build',
        platform: 'ios',
        appVersion: '1.2.3',
        buildNumber: '45',
      },
      expiresAt: '2026-05-16T11:00:00.000Z',
      sampleRate: 0.25,
      uploadIntervalSec: 60,
      maxEventsPerMinute: 30,
      maxBatchEvents: 20,
      maxPayloadKb: 64,
      breadcrumbLimit: 20,
      categories: ['auth', 'network'],
      reason: 'Investigating release regression',
    });

    await disableDiagnosticsPolicy('policy-debug', {
      reason: 'Issue resolved',
    });

    expect(adminAuthFetch).toHaveBeenNthCalledWith(1, {
      path: '/diagnostics/admin/policies',
      method: 'POST',
      body: JSON.stringify({
        mode: 'debug',
        target: {
          type: 'app_version_build',
          platform: 'ios',
          appVersion: '1.2.3',
          buildNumber: '45',
        },
        expiresAt: '2026-05-16T11:00:00.000Z',
        sampleRate: 0.25,
        uploadIntervalSec: 60,
        maxEventsPerMinute: 30,
        maxBatchEvents: 20,
        maxPayloadKb: 64,
        breadcrumbLimit: 20,
        categories: ['auth', 'network'],
        reason: 'Investigating release regression',
      }),
    });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(2, {
      path: '/diagnostics/admin/policies/policy-debug/disable',
      method: 'POST',
      body: JSON.stringify({ reason: 'Issue resolved' }),
    });
  });

  it('loads backend audit entries with optional limit', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        items: [
          {
            id: 'audit-1',
            policyId: 'policy-debug',
            action: 'create',
            actorEmail: 'writer@example.com',
            reason: 'Investigating support ticket',
            targetType: 'user',
            target: { type: 'user', userId: 'user-1' },
            mode: 'debug',
            ttlSeconds: 3600,
            sampling: { sampleRate: 0.5 },
            limits: {
              uploadIntervalSec: 60,
              maxEventsPerMinute: 30,
              maxBatchEvents: 20,
              maxPayloadKb: 64,
              breadcrumbLimit: 20,
            },
            categories: ['network'],
            beforeSnapshot: null,
            afterSnapshot: {},
            createdAt: '2026-05-16T10:00:00.000Z',
          },
        ],
      }),
    });

    await getDiagnosticsAudit({ limit: 50 });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/diagnostics/admin/audit?limit=50',
      method: 'GET',
    });
  });

  it('reflects backend TTL caps and only builds Loki links when configured', () => {
    expect(getDiagnosticsTtlLimitMinutes('trace', 'user')).toBe(60);
    expect(getDiagnosticsTtlLimitMinutes('debug', 'device')).toBe(24 * 60);
    expect(getDiagnosticsTtlLimitMinutes('info', 'global_sample')).toBe(30);
    expect(buildDiagnosticsLokiUrl(policy)).toBeNull();

    process.env.NEXT_PUBLIC_DIAGNOSTICS_LOKI_EXPLORE_URL =
      'https://grafana.example.com/explore';

    const url = new URL(buildDiagnosticsLokiUrl(policy) ?? '');
    const left = JSON.parse(url.searchParams.get('left') ?? '{}') as {
      queries: Array<{ expr: string }>;
    };

    expect(url.origin + url.pathname).toBe(
      'https://grafana.example.com/explore'
    );
    expect(url.searchParams.get('from')).toBe(
      String(new Date('2026-05-16T09:55:00.000Z').getTime())
    );
    expect(url.searchParams.get('to')).toBe(
      String(new Date('2026-05-16T11:05:00.000Z').getTime())
    );
    expect(left.queries[0]?.expr).toBe(
      '{source=~"mobile-.*|mobile-app"} |= "policy-debug" |= "policyTargetType" |= "user" |= "debug"'
    );
  });
});
