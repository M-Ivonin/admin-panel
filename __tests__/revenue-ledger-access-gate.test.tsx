import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RevenueLedgerAccessGate } from '@/modules/revenue-ledger/RevenueLedgerAccessGate';

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

describe('RevenueLedgerAccessGate', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children immediately when an access cookie is already valid', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ hasAccess: true, passwordConfigured: true }),
    });

    render(
      <RevenueLedgerAccessGate>
        <div>Ledger table</div>
      </RevenueLedgerAccessGate>
    );

    expect(await screen.findByText('Ledger table')).toBeTruthy();
    expect(global.fetch).toHaveBeenCalledWith('/api/revenue-ledger-access', {
      credentials: 'same-origin',
    });
  });

  it('unlocks children after submitting the correct password', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ hasAccess: false, passwordConfigured: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hasAccess: true }),
      });

    render(
      <RevenueLedgerAccessGate>
        <div>Ledger table</div>
      </RevenueLedgerAccessGate>
    );

    expect(await screen.findByText('Revenue Ledger access')).toBeTruthy();
    expect(screen.queryByText('Ledger table')).toBeNull();

    fireEvent.change(await screen.findByLabelText(/Password/), {
      target: { value: 'ledger-secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enter' }));

    await waitFor(() => {
      expect(screen.getByText('Ledger table')).toBeTruthy();
    });
    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/revenue-ledger-access',
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: 'ledger-secret' }),
      }
    );
  });

  it('keeps children hidden when the password is rejected', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ hasAccess: false, passwordConfigured: true }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ hasAccess: false, message: 'Invalid password.' }),
      });

    render(
      <RevenueLedgerAccessGate>
        <div>Ledger table</div>
      </RevenueLedgerAccessGate>
    );

    expect(await screen.findByText('Revenue Ledger access')).toBeTruthy();

    fireEvent.change(await screen.findByLabelText(/Password/), {
      target: { value: 'wrong-secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enter' }));

    expect(await screen.findByText('Invalid password.')).toBeTruthy();
    expect(screen.queryByText('Ledger table')).toBeNull();
  });
});
