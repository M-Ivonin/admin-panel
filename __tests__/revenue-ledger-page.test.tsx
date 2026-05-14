import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import RevenueLedgerPage from '../app/(admin)/dashboard/revenue-ledger/page';
import {
  getRevenueLedgerEntries,
  getTenjinDispatchRetryDiagnostics,
  reopenTenjinDispatchRetry,
} from '@/lib/api/revenue-ledger';

jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/modules/revenue-ledger/RevenueLedgerAccessGate', () => ({
  RevenueLedgerAccessGate: ({ children }: { children: React.ReactNode }) =>
    children,
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

jest.mock('@/lib/api/revenue-ledger', () => ({
  getRevenueLedgerEntries: jest.fn(),
  getTenjinDispatchRetryDiagnostics: jest.fn(),
  reopenTenjinDispatchRetry: jest.fn(),
}));

const emptySummary = {
  totalEntries: 0,
  recordedPositiveCount: 0,
  recordedNegativeCount: 0,
  skippedCount: 0,
  missingAmountCount: 0,
  byCurrency: [],
};

const populatedResponse = {
  items: [
    {
      id: 'ledger-1',
      userId: '11111111-1111-4111-8111-111111111111',
      store: 'google_play',
      eventType: 'initial_subscription',
      direction: 'positive',
      businessStatus: 'recorded',
      tenjinDispatchStatus: 'client_reported_sent',
      productId: 'pro_monthly',
      grossAmount: '9.99',
      currency: 'USD',
      orderId: 'order-1',
      purchaseToken: 'purchase-token-1',
      transactionId: null,
      originalTransactionId: null,
      eventTime: '2026-04-27T10:00:00.000Z',
      skipReason: null,
      dispatchSkipReason: null,
      lastDispatchError: null,
      createdAt: '2026-04-27T10:00:00.000Z',
      updatedAt: '2026-04-27T10:05:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 50,
  totalPages: 1,
  summary: {
    totalEntries: 1,
    recordedPositiveCount: 1,
    recordedNegativeCount: 0,
    skippedCount: 0,
    missingAmountCount: 0,
    byCurrency: [
      {
        currency: 'USD',
        positiveGrossAmount: '9.99',
        negativeGrossAmount: '0',
        netGrossAmount: '9.99',
        positiveCount: 1,
        negativeCount: 0,
      },
    ],
  },
};

describe('RevenueLedgerPage', () => {
  beforeEach(() => {
    (getRevenueLedgerEntries as jest.Mock).mockReset();
    (getTenjinDispatchRetryDiagnostics as jest.Mock).mockReset();
    (reopenTenjinDispatchRetry as jest.Mock).mockReset();
    (getRevenueLedgerEntries as jest.Mock).mockResolvedValue(populatedResponse);
  });

  it('renders ledger rows and currency summary', async () => {
    render(<RevenueLedgerPage />);

    expect(await screen.findByText('Revenue Ledger')).toBeTruthy();
    expect(await screen.findByText('pro_monthly')).toBeTruthy();
    expect(screen.getAllByText('9.99 USD').length).toBeGreaterThan(0);
    expect(screen.getByText('Order: order-1')).toBeTruthy();
    expect(screen.getByText('Client Reported Sent')).toBeTruthy();
    expect(getRevenueLedgerEntries).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
    );
  });

  it('shows loading and then the empty state', async () => {
    let resolveRequest: (value: unknown) => void = () => undefined;
    (getRevenueLedgerEntries as jest.Mock).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(<RevenueLedgerPage />);

    expect(screen.getByRole('progressbar')).toBeTruthy();

    await act(async () => {
      resolveRequest({
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
        summary: emptySummary,
      });
    });

    expect(
      await screen.findByText('No ledger rows match the current filters')
    ).toBeTruthy();
  });

  it('shows error state and refetches with an exact filter', async () => {
    (getRevenueLedgerEntries as jest.Mock)
      .mockRejectedValueOnce(new Error('Forbidden'))
      .mockResolvedValueOnce(populatedResponse);

    render(<RevenueLedgerPage />);

    expect(await screen.findByText('Forbidden')).toBeTruthy();
    expect(
      screen.queryByText('No ledger rows match the current filters')
    ).toBeNull();

    fireEvent.change(screen.getByLabelText('Order ID'), {
      target: { value: 'order-1' },
    });

    await waitFor(() => {
      expect(getRevenueLedgerEntries).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          orderId: 'order-1',
        })
      );
    });
  });

  it('loads Tenjin retry diagnostics and reopens an eligible row after confirmation', async () => {
    (getTenjinDispatchRetryDiagnostics as jest.Mock).mockResolvedValue({
      ledgerId: 'ledger-1',
      businessStatus: 'recorded',
      tenjinDispatchStatus: 'expired_without_client_report',
      grossSnapshotAvailable: true,
      dispatchTokenIssueCount: 1,
      sdkCallStartedAt: null,
      token: {
        state: 'expired',
        hasToken: true,
        issuedAt: '2026-04-27T10:01:00.000Z',
        expiresAt: '2026-04-27T10:16:00.000Z',
        isExpired: true,
      },
      retryEligibility: {
        eligible: true,
        reason: null,
      },
      nextAction: 'client_can_retry_after_app_update_or_restore',
    });
    (reopenTenjinDispatchRetry as jest.Mock).mockResolvedValue({
      ledgerId: 'ledger-1',
      businessStatus: 'recorded',
      tenjinDispatchStatus: 'pending_client_completion',
      grossSnapshotAvailable: true,
      dispatchTokenIssueCount: 1,
      token: {
        state: 'none',
        hasToken: false,
        issuedAt: null,
        expiresAt: null,
        isExpired: false,
      },
      retryEligibility: {
        eligible: true,
        reason: null,
      },
      nextAction: 'reopened_for_client_retry',
    });

    render(<RevenueLedgerPage />);

    fireEvent.click(await screen.findByRole('button', { name: /inspect/i }));

    const diagnosticsDialog = await screen.findByRole('dialog', {
      name: 'Tenjin Retry Diagnostics',
    });
    expect(diagnosticsDialog).toBeTruthy();
    expect(within(diagnosticsDialog).getByText('Eligible')).toBeTruthy();
    expect(
      within(diagnosticsDialog).getByText('Expired Without Client Report')
    ).toBeTruthy();
    expect(within(diagnosticsDialog).getByText('Issue count')).toBeTruthy();
    expect(within(diagnosticsDialog).getByText('1')).toBeTruthy();
    expect(
      within(diagnosticsDialog).getByText('SDK call started')
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: /reopen client retry/i })
    );
    fireEvent.click(screen.getByRole('button', { name: /confirm reopen/i }));

    expect(
      await screen.findByText('Row reopened for future client retry.')
    ).toBeTruthy();
    expect(reopenTenjinDispatchRetry).toHaveBeenCalledWith('ledger-1');
    await waitFor(() => {
      expect(getRevenueLedgerEntries).toHaveBeenCalledTimes(2);
    });
  });

  it('shows ineligible Tenjin retry diagnostics without the reopen action', async () => {
    (getTenjinDispatchRetryDiagnostics as jest.Mock).mockResolvedValue({
      ledgerId: 'ledger-1',
      businessStatus: 'recorded',
      tenjinDispatchStatus: 'sdk_call_started',
      grossSnapshotAvailable: true,
      dispatchTokenIssueCount: 1,
      sdkCallStartedAt: '2026-04-27T10:12:00.000Z',
      clientReportedSentAt: null,
      lastDispatchError: 'Client result not reported yet',
      token: {
        state: 'active',
        hasToken: true,
        issuedAt: '2026-04-27T10:01:00.000Z',
        expiresAt: '2026-04-27T10:16:00.000Z',
        isExpired: false,
      },
      retryEligibility: {
        eligible: false,
        reason: 'SDK call already started; reopening could double-count.',
      },
      nextAction: 'sdk_call_already_started',
    });

    render(<RevenueLedgerPage />);

    fireEvent.click(await screen.findByRole('button', { name: /inspect/i }));

    const diagnosticsDialog = await screen.findByRole('dialog', {
      name: 'Tenjin Retry Diagnostics',
    });
    expect(within(diagnosticsDialog).getByText('Not eligible')).toBeTruthy();
    expect(
      within(diagnosticsDialog).getByText(
        'SDK call already started; reopening could double-count.'
      )
    ).toBeTruthy();
    expect(
      within(diagnosticsDialog).getByText('Sdk Call Already Started')
    ).toBeTruthy();
    expect(
      within(diagnosticsDialog).getByText('Client result not reported yet')
    ).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: /reopen client retry/i })
    ).toBeNull();
  });
});
