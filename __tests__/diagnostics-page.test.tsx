import { act, fireEvent, render, screen } from '@testing-library/react';
import RemoteDiagnosticsPage from '@/app/(admin)/dashboard/remote-diagnostics/page';
import {
  createDiagnosticsPolicy,
  disableDiagnosticsPolicy,
  getDiagnosticsAudit,
  getDiagnosticsCapabilities,
  getDiagnosticsPolicies,
  type DiagnosticsPolicy,
} from '@/lib/api/diagnostics';

jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

jest.mock('@/lib/api/diagnostics', () => {
  const actual = jest.requireActual('@/lib/api/diagnostics');

  return {
    ...actual,
    createDiagnosticsPolicy: jest.fn(),
    disableDiagnosticsPolicy: jest.fn(),
    getDiagnosticsAudit: jest.fn(),
    getDiagnosticsCapabilities: jest.fn(),
    getDiagnosticsPolicies: jest.fn(),
  };
});

const activePolicy: DiagnosticsPolicy = {
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
  categories: ['auth', 'network'],
  reason: 'Investigating support ticket',
  enabled: true,
  createdByEmail: 'writer@example.com',
  disabledAt: null,
  disabledReason: null,
  createdAt: '2026-05-16T10:00:00.000Z',
  updatedAt: '2026-05-16T10:00:00.000Z',
};

const disabledPolicy: DiagnosticsPolicy = {
  ...activePolicy,
  id: 'policy-disabled',
  enabled: false,
  disabledAt: '2026-05-16T10:30:00.000Z',
  disabledReason: 'Issue resolved',
};

function mockReadableCapabilities(canWrite = true, canTrace = false) {
  (getDiagnosticsCapabilities as jest.Mock).mockResolvedValue({
    canRead: true,
    canWrite,
    canTrace,
  });
}

function mockPageData() {
  (getDiagnosticsPolicies as jest.Mock).mockImplementation(
    (params?: { activeOnly?: boolean }) =>
      Promise.resolve({
        items: params?.activeOnly
          ? [activePolicy]
          : [activePolicy, disabledPolicy],
      })
  );
  (getDiagnosticsAudit as jest.Mock).mockResolvedValue({
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
  });
}

describe('RemoteDiagnosticsPage', () => {
  beforeEach(() => {
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-05-16T10:00:00.000Z').getTime());
    process.env.NEXT_PUBLIC_DIAGNOSTICS_LOKI_EXPLORE_URL = '';
    (createDiagnosticsPolicy as jest.Mock).mockReset();
    (disableDiagnosticsPolicy as jest.Mock).mockReset();
    (getDiagnosticsAudit as jest.Mock).mockReset();
    (getDiagnosticsCapabilities as jest.Mock).mockReset();
    (getDiagnosticsPolicies as jest.Mock).mockReset();
    mockReadableCapabilities();
    mockPageData();
    (createDiagnosticsPolicy as jest.Mock).mockResolvedValue(activePolicy);
    (disableDiagnosticsPolicy as jest.Mock).mockResolvedValue({
      ...activePolicy,
      enabled: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('gates the section when backend capabilities deny diagnostics read access', async () => {
    (getDiagnosticsCapabilities as jest.Mock).mockResolvedValue({
      canRead: false,
      canWrite: false,
      canTrace: false,
    });

    render(<RemoteDiagnosticsPage />);

    expect(
      await screen.findByText('Remote Diagnostics access required')
    ).toBeTruthy();
    expect(getDiagnosticsPolicies).not.toHaveBeenCalled();
  });

  it('shows active and recent policies, audit entries, and hides trace without canTrace', async () => {
    process.env.NEXT_PUBLIC_DIAGNOSTICS_LOKI_EXPLORE_URL =
      'https://grafana.example.com/explore';

    render(<RemoteDiagnosticsPage />);

    expect(await screen.findByText('Remote Diagnostics')).toBeTruthy();
    expect((await screen.findAllByText('policy-debug')).length).toBeGreaterThan(
      0
    );
    expect(screen.getByText('policy-disabled')).toBeTruthy();
    expect(screen.getByText(/writer@example.com/)).toBeTruthy();
    expect(screen.getByText('Issue resolved')).toBeTruthy();
    expect(screen.getAllByText('upload 60s').length).toBeGreaterThan(0);
    expect(screen.getAllByText('network').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/debug on user: user-1/i).length
    ).toBeGreaterThan(0);
    expect(screen.getByText(/TTL 60m/i)).toBeTruthy();
    expect(screen.getByText(/"after"/i)).toBeTruthy();
    expect(
      screen.getAllByRole('link', { name: /open in grafana/i })[0]
    ).toHaveAttribute('href', expect.stringContaining('grafana.example.com'));
    expect(
      [
        'device',
        'user',
        'internal_qa',
        'app_version_build',
        'platform',
        'global_sample',
      ].every((targetType) => screen.getByRole('option', { name: targetType }))
    ).toBe(true);
    expect(screen.queryByRole('option', { name: 'trace' })).toBeNull();
  });

  it('validates TTL, reason, target details, and global sample rate before create', async () => {
    render(<RemoteDiagnosticsPage />);

    await screen.findByText('Remote Diagnostics');

    fireEvent.change(screen.getByLabelText('Target type'), {
      target: { value: 'global_sample' },
    });
    expect(
      screen.getByText(/Global sample policies affect random users/i)
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Expires in minutes'), {
      target: { value: '45' },
    });
    fireEvent.change(screen.getByLabelText('Sample rate'), {
      target: { value: '' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create policy' }));
    });

    expect(await screen.findByText('Reason is required.')).toBeTruthy();
    expect(
      screen.getByText('Sample rate is required for global sample policies.')
    ).toBeTruthy();
    expect(
      screen.getByText('TTL must be 30 minutes or less for this policy.')
    ).toBeTruthy();
    expect(createDiagnosticsPolicy).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Target type'), {
      target: { value: 'device' },
    });
    fireEvent.change(screen.getByLabelText('Expires in minutes'), {
      target: { value: '60' },
    });
    fireEvent.change(screen.getByLabelText('Sample rate'), {
      target: { value: '0.5' },
    });
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Investigating a device issue' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create policy' }));
    });

    expect(await screen.findByText('Device ID is required.')).toBeTruthy();
    expect(createDiagnosticsPolicy).not.toHaveBeenCalled();
  });

  it('creates target-specific payloads and disables active policies', async () => {
    mockReadableCapabilities(true, true);
    render(<RemoteDiagnosticsPage />);

    await screen.findByText('Remote Diagnostics');

    const targetType = screen.getByLabelText('Target type');
    const reason = screen.getByLabelText('Reason');

    fireEvent.change(screen.getByLabelText('Mode'), {
      target: { value: 'trace' },
    });
    expect(screen.getByRole('option', { name: 'trace' })).toBeTruthy();

    fireEvent.change(reason, {
      target: { value: 'Investigating app build regression' },
    });
    fireEvent.change(targetType, { target: { value: 'app_version_build' } });
    expect(screen.queryByRole('option', { name: 'trace' })).toBeNull();
    fireEvent.change(screen.getByLabelText('Platform'), {
      target: { value: 'ios' },
    });
    fireEvent.change(screen.getByLabelText('App version'), {
      target: { value: '1.2.3' },
    });
    fireEvent.change(screen.getByLabelText('Build number'), {
      target: { value: '45' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create policy' }));
    });

    expect(createDiagnosticsPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'debug',
        target: {
          type: 'app_version_build',
          platform: 'ios',
          appVersion: '1.2.3',
          buildNumber: '45',
        },
        reason: 'Investigating app build regression',
      })
    );

    fireEvent.change(screen.getByLabelText('Disable reason for policy-debug'), {
      target: { value: 'Issue resolved' },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Disable policy-debug' })
      );
    });

    expect(disableDiagnosticsPolicy).toHaveBeenCalledWith('policy-debug', {
      reason: 'Issue resolved',
    });
  });
});
