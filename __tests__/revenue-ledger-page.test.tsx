import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import RevenueLedgerPage from '@/app/(admin)/dashboard/revenue-ledger/page';
import { getRevenueLedgerEntries } from '@/lib/api/revenue-ledger';

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

jest.mock('@/lib/api/revenue-ledger', () => ({
  getRevenueLedgerEntries: jest.fn(),
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
      }),
    );
  });

  it('shows loading and then the empty state', async () => {
    let resolveRequest: (value: unknown) => void = () => undefined;
    (getRevenueLedgerEntries as jest.Mock).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
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
      await screen.findByText('No ledger rows match the current filters'),
    ).toBeTruthy();
  });

  it('shows error state and refetches with an exact filter', async () => {
    (getRevenueLedgerEntries as jest.Mock)
      .mockRejectedValueOnce(new Error('Forbidden'))
      .mockResolvedValueOnce(populatedResponse);

    render(<RevenueLedgerPage />);

    expect(await screen.findByText('Forbidden')).toBeTruthy();
    expect(
      screen.queryByText('No ledger rows match the current filters'),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Order ID'), {
      target: { value: 'order-1' },
    });

    await waitFor(() => {
      expect(getRevenueLedgerEntries).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          orderId: 'order-1',
        }),
      );
    });
  });
});
