import {
  createRevenueLedgerAccessToken,
  isRevenueLedgerAccessTokenValid,
  isRevenueLedgerPasswordConfigured,
  isRevenueLedgerPasswordValid,
} from '@/lib/revenue-ledger-access';

describe('revenue ledger access helpers', () => {
  const originalPassword = process.env.REVENUE_LEDGER_PASSWORD;

  afterEach(() => {
    process.env.REVENUE_LEDGER_PASSWORD = originalPassword;
  });

  it('requires a configured password', () => {
    delete process.env.REVENUE_LEDGER_PASSWORD;

    expect(isRevenueLedgerPasswordConfigured()).toBe(false);
    expect(isRevenueLedgerPasswordValid('secret')).toBe(false);
    expect(isRevenueLedgerAccessTokenValid('token', 'auth-token')).toBe(false);
  });

  it('validates passwords and signed access tokens', () => {
    process.env.REVENUE_LEDGER_PASSWORD = 'ledger-secret';

    const token = createRevenueLedgerAccessToken('ledger-secret', 'auth-token');

    expect(isRevenueLedgerPasswordConfigured()).toBe(true);
    expect(isRevenueLedgerPasswordValid('ledger-secret')).toBe(true);
    expect(isRevenueLedgerPasswordValid('wrong-secret')).toBe(false);
    expect(isRevenueLedgerAccessTokenValid(token, 'auth-token')).toBe(true);
    expect(isRevenueLedgerAccessTokenValid(token, 'other-auth-token')).toBe(
      false
    );
    expect(isRevenueLedgerAccessTokenValid('wrong-token', 'auth-token')).toBe(
      false
    );
  });
});
