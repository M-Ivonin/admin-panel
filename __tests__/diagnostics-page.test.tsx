import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import RemoteDiagnosticsPage from '@/app/(admin)/dashboard/remote-diagnostics/page';
import {
  createDiagnosticsPolicy,
  disableDiagnosticsPolicy,
  getDiagnosticsBackendLogSetting,
  getDiagnosticsAudit,
  getDiagnosticsCapabilities,
  getDiagnosticsPolicies,
  getDiagnosticsTargetOptions,
  updateDiagnosticsBackendLogSetting,
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
    getDiagnosticsBackendLogSetting: jest.fn(),
    getDiagnosticsAudit: jest.fn(),
    getDiagnosticsCapabilities: jest.fn(),
    getDiagnosticsPolicies: jest.fn(),
    getDiagnosticsTargetOptions: jest.fn(),
    updateDiagnosticsBackendLogSetting: jest.fn(),
  };
});

const activePolicy: DiagnosticsPolicy = {
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
        target: {
          type: 'user',
          userEmail: 'user@example.com',
          environment: 'production',
        },
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
  (getDiagnosticsTargetOptions as jest.Mock).mockResolvedValue({
    platforms: ['android', 'ios'],
    recentUsers: ['recent@example.com', 'user@example.com'],
    recentDevices: ['device-1', 'device-2'],
    appVersionBuilds: [
      { appVersion: '1.2.3', buildNumber: '45' },
      { appVersion: '1.2.3', buildNumber: '46' },
      { appVersion: '1.2.2', buildNumber: '44' },
    ],
  });
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

describe('RemoteDiagnosticsPage', () => {
  beforeEach(() => {
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-05-16T10:00:00.000Z').getTime());
    process.env.NEXT_PUBLIC_DIAGNOSTICS_LOKI_EXPLORE_URL = '';
    (createDiagnosticsPolicy as jest.Mock).mockReset();
    (disableDiagnosticsPolicy as jest.Mock).mockReset();
    (getDiagnosticsBackendLogSetting as jest.Mock).mockReset();
    (getDiagnosticsAudit as jest.Mock).mockReset();
    (getDiagnosticsCapabilities as jest.Mock).mockReset();
    (getDiagnosticsPolicies as jest.Mock).mockReset();
    (getDiagnosticsTargetOptions as jest.Mock).mockReset();
    (updateDiagnosticsBackendLogSetting as jest.Mock).mockReset();
    mockReadableCapabilities();
    mockPageData();
    (getDiagnosticsBackendLogSetting as jest.Mock).mockResolvedValue({
      mode: 'production',
      updatedByEmail: null,
      updatedAt: null,
    });
    (updateDiagnosticsBackendLogSetting as jest.Mock).mockResolvedValue({
      mode: 'dev',
      updatedByEmail: 'writer@example.com',
      updatedAt: '2026-05-16T10:00:00.000Z',
    });
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

  it('shows active policies, audit entries, target dropdowns, and hides trace without canTrace', async () => {
    process.env.NEXT_PUBLIC_DIAGNOSTICS_LOKI_EXPLORE_URL =
      'https://grafana.example.com/explore';

    render(<RemoteDiagnosticsPage />);

    expect(await screen.findByText('Remote Diagnostics')).toBeTruthy();
    expect(screen.getByLabelText('Backend logs')).toHaveValue('production');
    expect(screen.getByRole('option', { name: 'production' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'dev/debug' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'off' })).toBeTruthy();
    expect((await screen.findAllByText('policy-debug')).length).toBeGreaterThan(
      0
    );
    expect(screen.queryByText('policy-disabled')).toBeNull();
    expect(screen.getByText(/writer@example.com/)).toBeTruthy();
    expect(screen.getAllByText('upload 60s').length).toBeGreaterThan(0);
    expect(screen.getAllByText('network').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/debug on user: user@example.com \(production\)/i)
        .length
    ).toBeGreaterThan(0);
    expect(screen.getByText(/TTL 60m/i)).toBeTruthy();
    expect(
      screen.getByText(/Chronological log of who created or disabled/i)
    ).toBeTruthy();
    expect(getDiagnosticsAudit).toHaveBeenCalledWith({ limit: 5 });
    expect(screen.queryByText(/"after"/i)).toBeNull();
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
    fireEvent.change(screen.getByLabelText('Target type'), {
      target: { value: 'platform' },
    });
    expect(screen.getByLabelText('Platform')).toBeTruthy();
    expect(screen.getByRole('option', { name: 'android' })).toBeTruthy();
    expect(screen.getByLabelText('Environment')).toBeTruthy();
    expect(screen.getByRole('option', { name: 'local' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'dev' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'production' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: 'trace' })).toBeNull();
  });

  it('updates backend log forwarding from the header without creating a policy', async () => {
    render(<RemoteDiagnosticsPage />);

    await screen.findByText('Remote Diagnostics');

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Backend logs'), {
        target: { value: 'dev' },
      });
    });

    expect(updateDiagnosticsBackendLogSetting).toHaveBeenCalledWith({
      mode: 'dev',
    });
    expect(createDiagnosticsPolicy).not.toHaveBeenCalled();
    expect(await screen.findByText('Backend log setting updated.')).toBeTruthy();
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
    expect(screen.getByLabelText('Expires in minutes')).toHaveValue(30);
    expect(screen.getByLabelText('Sample rate')).toHaveValue(0.01);

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

  it('creates user policies with selected and manually entered email chips', async () => {
    render(<RemoteDiagnosticsPage />);

    await screen.findByText('Remote Diagnostics');

    const userEmails = screen.getByLabelText('User emails');
    fireEvent.change(userEmails, {
      target: { value: 'manual@example.com' },
    });
    fireEvent.keyDown(userEmails, { key: 'Enter' });
    fireEvent.change(userEmails, {
      target: { value: 'recent@example.com' },
    });
    fireEvent.keyDown(userEmails, { key: 'Enter' });
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Investigating user report' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create policy' }));
    });

    expect(createDiagnosticsPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        target: {
          type: 'user',
          userEmail: 'manual@example.com',
          userEmails: ['manual@example.com', 'recent@example.com'],
          environment: 'production',
        },
      })
    );
  });

  it('creates device policies with selected and manually entered device chips', async () => {
    render(<RemoteDiagnosticsPage />);

    await screen.findByText('Remote Diagnostics');

    fireEvent.change(screen.getByLabelText('Target type'), {
      target: { value: 'device' },
    });

    const deviceIds = screen.getByLabelText('Device IDs');
    fireEvent.change(deviceIds, {
      target: { value: 'manual-device' },
    });
    fireEvent.keyDown(deviceIds, { key: 'Enter' });
    fireEvent.change(deviceIds, {
      target: { value: 'device-1' },
    });
    fireEvent.keyDown(deviceIds, { key: 'Enter' });
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Investigating device report' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create policy' }));
    });

    expect(createDiagnosticsPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        target: {
          type: 'device',
          deviceId: 'manual-device',
          deviceIds: ['manual-device', 'device-1'],
          environment: 'production',
        },
      })
    );
  });

  it('keeps target-specific fields directly under the target type selector', async () => {
    render(<RemoteDiagnosticsPage />);

    await screen.findByText('Remote Diagnostics');

    const targetColumn = screen.getByTestId('diagnostics-target-column');

    expect(within(targetColumn).getByLabelText('Target type')).toBeTruthy();
    expect(within(targetColumn).getByLabelText('User emails')).toBeTruthy();
    expect(within(targetColumn).getByLabelText('Open')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Target type'), {
      target: { value: 'platform' },
    });

    expect(within(targetColumn).getByLabelText('Platform')).toBeTruthy();
    expect(screen.getByRole('option', { name: 'android' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Target type'), {
      target: { value: 'app_version_build' },
    });

    expect(within(targetColumn).getByLabelText('App version')).toBeTruthy();
    expect(within(targetColumn).getByLabelText('Build number')).toBeTruthy();
    expect(within(targetColumn).queryByLabelText('Platform')).toBeNull();
  });

  it('shows a blocking overlay while create and disable requests are pending', async () => {
    const createRequest = createDeferred<DiagnosticsPolicy>();
    (createDiagnosticsPolicy as jest.Mock).mockReturnValue(
      createRequest.promise
    );

    render(<RemoteDiagnosticsPage />);

    await screen.findByText('Remote Diagnostics');

    const userEmails = screen.getByLabelText('User emails');
    fireEvent.change(userEmails, {
      target: { value: 'user@example.com' },
    });
    fireEvent.keyDown(userEmails, { key: 'Enter' });
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Investigating user report' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create policy' }));

    expect(await screen.findByText('Applying policy changes...')).toBeVisible();
    expect(
      screen.getByRole('progressbar', {
        hidden: true,
        name: 'Applying policy changes',
      })
    ).toBeTruthy();

    await act(async () => {
      createRequest.resolve(activePolicy);
    });
    await waitFor(() =>
      expect(screen.getByText('Applying policy changes...')).not.toBeVisible()
    );

    const disableRequest = createDeferred<DiagnosticsPolicy>();
    (disableDiagnosticsPolicy as jest.Mock).mockReturnValue(
      disableRequest.promise
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Disable policy-debug' })
    );

    expect(await screen.findByText('Applying policy changes...')).toBeVisible();

    await act(async () => {
      disableRequest.resolve({ ...activePolicy, enabled: false });
    });
    await waitFor(() =>
      expect(screen.getByText('Applying policy changes...')).not.toBeVisible()
    );
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
    fireEvent.change(screen.getByLabelText('Environment'), {
      target: { value: 'dev' },
    });
    fireEvent.change(targetType, { target: { value: 'app_version_build' } });
    expect(screen.queryByRole('option', { name: 'trace' })).toBeNull();
    expect(screen.queryByLabelText('Platform')).toBeNull();
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
          appVersion: '1.2.3',
          buildNumber: '45',
          environment: 'dev',
        },
        reason: 'Investigating app build regression',
      })
    );

    expect(
      screen.queryByLabelText('Disable reason for policy-debug')
    ).toBeNull();

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Disable policy-debug' })
      );
    });

    expect(disableDiagnosticsPolicy).toHaveBeenCalledWith('policy-debug', {
      reason: 'Disabled from admin panel',
    });
  });
});
