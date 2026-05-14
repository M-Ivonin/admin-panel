import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import {
  getRevenueLedgerEntries,
  getTenjinDispatchRetryDiagnostics,
  reopenTenjinDispatchRetry,
} from '@/lib/api/revenue-ledger';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

describe('getRevenueLedgerEntries', () => {
  beforeEach(() => {
    (adminAuthFetch as jest.Mock).mockReset();
  });

  it('serializes pagination, exact filters, and multi-value filters into query params', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
        summary: {
          totalEntries: 0,
          recordedPositiveCount: 0,
          recordedNegativeCount: 0,
          skippedCount: 0,
          missingAmountCount: 0,
          byCurrency: [],
        },
      }),
    });

    await getRevenueLedgerEntries({
      page: 2,
      limit: 100,
      store: 'google_play',
      eventTypes: ['initial_subscription', 'refund'],
      directions: ['positive', 'negative'],
      businessStatuses: ['recorded'],
      tenjinDispatchStatuses: [
        'client_reported_sent',
        'client_reported_failed',
      ],
      productId: 'pro_monthly',
      userId: '11111111-1111-4111-8111-111111111111',
      orderId: 'order-1',
      purchaseToken: 'purchase-token-1',
      transactionId: 'transaction-1',
      originalTransactionId: 'original-transaction-1',
      dateFrom: '2026-04-01T00:00:00.000Z',
      dateTo: '2026-04-30T23:59:59.999Z',
      sortBy: 'grossAmount',
      sortOrder: 'asc',
    });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path:
        '/revenue-ledger/admin/entries?page=2&limit=100&store=google_play&productId=pro_monthly&userId=11111111-1111-4111-8111-111111111111&orderId=order-1&purchaseToken=purchase-token-1&transactionId=transaction-1&originalTransactionId=original-transaction-1&dateFrom=2026-04-01T00%3A00%3A00.000Z&dateTo=2026-04-30T23%3A59%3A59.999Z&sortBy=grossAmount&sortOrder=asc&eventTypes=initial_subscription&eventTypes=refund&directions=positive&directions=negative&businessStatuses=recorded&tenjinDispatchStatuses=client_reported_sent&tenjinDispatchStatuses=client_reported_failed',
      method: 'GET',
    });
  });

  it('throws a readable forbidden error for 403 responses', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    await expect(getRevenueLedgerEntries()).rejects.toThrow('Forbidden');
  });
});

describe('Tenjin dispatch retry admin API', () => {
  beforeEach(() => {
    (adminAuthFetch as jest.Mock).mockReset();
  });

  it('loads diagnostics for one revenue ledger row without mutation', async () => {
    const diagnostics = {
      ledgerId: 'ledger/1',
      businessStatus: 'recorded',
      tenjinDispatchStatus: 'expired_without_client_report',
      grossSnapshotAvailable: true,
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
    };

    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(diagnostics),
    });

    await expect(
      getTenjinDispatchRetryDiagnostics('ledger/1')
    ).resolves.toEqual(diagnostics);
    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/revenue-ledger/admin/entries/ledger%2F1/tenjin-dispatch-retry',
      method: 'GET',
    });
  });

  it('posts the guarded reopen request for one revenue ledger row', async () => {
    const diagnostics = {
      ledgerId: 'ledger-1',
      businessStatus: 'recorded',
      tenjinDispatchStatus: 'pending_client_completion',
      grossSnapshotAvailable: true,
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
    };

    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(diagnostics),
    });

    await expect(reopenTenjinDispatchRetry('ledger-1')).resolves.toEqual(
      diagnostics
    );
    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/revenue-ledger/admin/entries/ledger-1/tenjin-dispatch-retry/reopen',
      method: 'POST',
    });
  });
});
