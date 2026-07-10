import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import RevenueLedgerPage from '@/app/(admin)/dashboard/revenue-ledger/page';
import { getRevenueLedgerEntries } from '@/lib/api/revenue-ledger';

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
}));

const emptySummary = {
  totalEntries: 0,
  recordedPositiveCount: 0,
  recordedNegativeCount: 0,
  skippedCount: 0,
  missingAmountCount: 0,
  byCurrency: [],
  dailyUsdRevenue: [],
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
    usdRevenue: {
      baseCurrency: 'USD',
      netGrossAmountUsd: '9.99',
      positiveGrossAmountUsd: '9.99',
      negativeGrossAmountUsd: '0.00',
      rateDate: '2026-07-10',
      source: 'ExchangeRate-API Open Access',
      sourceUrl: 'https://www.exchangerate-api.com',
      missingCurrencies: [],
    },
    dailyUsdRevenue: [
      {
        date: '2026-07-09',
        netGrossAmountUsd: '4.99',
        positiveGrossAmountUsd: '4.99',
        negativeGrossAmountUsd: '0.00',
        positiveCount: 1,
        negativeCount: 0,
      },
      {
        date: '2026-07-10',
        netGrossAmountUsd: '5.00',
        positiveGrossAmountUsd: '5.00',
        negativeGrossAmountUsd: '0.00',
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

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders ledger rows and currency summary', async () => {
    render(<RevenueLedgerPage />);

    expect(await screen.findByText('Revenue Ledger')).toBeTruthy();
    expect(await screen.findByText('pro_monthly')).toBeTruthy();
    expect(screen.getAllByText('Total USD revenue').length).toBeGreaterThan(0);
    expect(screen.getAllByText('9.99 USD').length).toBeGreaterThan(0);
    expect(screen.getAllByText('9.99 USD').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('img', { name: 'Daily USD revenue chart' })
    ).toBeTruthy();
    expect(screen.getByText('Positive revenue')).toBeTruthy();
    expect(screen.queryByText('Negative revenue')).toBeNull();
    expect(screen.getAllByText('$9.99').length).toBeGreaterThan(0);
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

  it('pads the chart to the selected date range when From moves earlier', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-10T12:34:00.000Z'));

    render(<RevenueLedgerPage />);

    expect(await screen.findByText('Revenue Ledger')).toBeTruthy();
    expect(screen.queryByText('Jun 17')).toBeNull();

    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-06-17T00:00' },
    });

    await waitFor(() => {
      expect(getRevenueLedgerEntries).toHaveBeenLastCalledWith(
        expect.objectContaining({
          dateFrom: new Date('2026-06-17T00:00').toISOString(),
        })
      );
    });

    expect(screen.getByText('Jun 17')).toBeTruthy();
  });

  it('starts with the last week date range and only operator-facing identity filters', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-10T12:34:00.000Z'));

    render(<RevenueLedgerPage />);

    expect(await screen.findByText('Revenue Ledger')).toBeTruthy();
    expect(screen.getByLabelText('From')).toHaveValue('2026-07-03T00:00');
    expect(screen.getByLabelText('To')).toHaveValue('2026-07-10T23:59');
    expect(screen.queryByLabelText('Purchase token')).toBeNull();
    expect(screen.queryByLabelText('Transaction ID')).toBeNull();
    expect(screen.queryByLabelText('Original transaction ID')).toBeNull();
    expect(getRevenueLedgerEntries).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: new Date('2026-07-03T00:00').toISOString(),
        dateTo: new Date('2026-07-10T23:59').toISOString(),
      })
    );

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));

    await waitFor(() => {
      expect(getRevenueLedgerEntries).toHaveBeenLastCalledWith(
        expect.not.objectContaining({
          dateFrom: expect.any(String),
          dateTo: expect.any(String),
        })
      );
    });
  });

  it('describes Google Play subscription cancellation as auto-renew cancellation', async () => {
    (getRevenueLedgerEntries as jest.Mock).mockResolvedValueOnce({
      ...populatedResponse,
      items: [
        {
          ...populatedResponse.items[0],
          id: 'ledger-canceled',
          eventType: 'subscription_canceled',
          direction: 'none',
          grossAmount: null,
          currency: null,
          tenjinDispatchStatus: 'not_applicable',
          dispatchSkipReason: 'google_play_subscription_canceled_not_revenue_v1',
        },
      ],
    });

    render(<RevenueLedgerPage />);

    expect(await screen.findByText('Auto-renew canceled')).toBeTruthy();
    expect(screen.queryByText('Subscription Canceled')).toBeNull();
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
});
