import {
  buildDiagnosticsLokiUrl,
  buildDiagnosticsBackendLokiUrl,
  createDiagnosticsPolicy,
  disableDiagnosticsPolicy,
  getDiagnosticsBackendLogSetting,
  getDiagnosticsCapabilities,
  getDiagnosticsPolicies,
  getDiagnosticsTargetOptions,
  getDiagnosticsTtlLimitMinutes,
  updateDiagnosticsBackendLogSetting,
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
  targetKey: 'production:user@example.com',
  target: {
    type: 'user',
    userEmail: 'user@example.com',
    environment: 'production',
  },
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

  it('loads and updates backend log forwarding mode', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        mode: 'production',
        updatedByEmail: null,
        updatedAt: null,
      }),
    });

    await expect(getDiagnosticsBackendLogSetting()).resolves.toEqual({
      mode: 'production',
      updatedByEmail: null,
      updatedAt: null,
    });
    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/diagnostics/admin/backend-log-setting',
      method: 'GET',
    });

    (adminAuthFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        mode: 'dev',
        updatedByEmail: 'writer@example.com',
        updatedAt: '2026-05-16T10:00:00.000Z',
      }),
    });

    await updateDiagnosticsBackendLogSetting({ mode: 'dev' });
    expect(adminAuthFetch).toHaveBeenLastCalledWith({
      path: '/diagnostics/admin/backend-log-setting',
      method: 'PUT',
      body: JSON.stringify({ mode: 'dev' }),
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
        appVersion: '1.2.3',
        buildNumber: '45',
        environment: 'dev',
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
          appVersion: '1.2.3',
          buildNumber: '45',
          environment: 'dev',
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

  it('loads diagnostics target options for dropdowns', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        platforms: ['android', 'ios'],
        appVersionBuilds: [{ appVersion: '1.2.3', buildNumber: '45' }],
      }),
    });

    await expect(getDiagnosticsTargetOptions()).resolves.toEqual({
      platforms: ['android', 'ios'],
      appVersionBuilds: [{ appVersion: '1.2.3', buildNumber: '45' }],
    });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/diagnostics/admin/target-options',
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
      '{log_origin="mobile",policy_mode="debug",policy_target_type="user"} |= "policy-debug"'
    );
  });

  it('builds backend Loki links with backend origin and selected environment', () => {
    process.env.NEXT_PUBLIC_DIAGNOSTICS_LOKI_EXPLORE_URL =
      'https://grafana.example.com/explore';

    expect(buildDiagnosticsBackendLokiUrl('off')).toBeNull();

    const url = new URL(buildDiagnosticsBackendLokiUrl('dev') ?? '');
    const left = JSON.parse(url.searchParams.get('left') ?? '{}') as {
      queries: Array<{ expr: string }>;
    };

    expect(url.origin + url.pathname).toBe(
      'https://grafana.example.com/explore'
    );
    expect(left.queries[0]?.expr).toBe(
      '{log_origin="backend",environment="dev"}'
    );
  });
});
