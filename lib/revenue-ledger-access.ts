import { createHmac, timingSafeEqual } from 'crypto';

export const REVENUE_LEDGER_ACCESS_COOKIE = 'revenueLedgerAccess';
export const REVENUE_LEDGER_ACCESS_MAX_AGE_SECONDS = 60 * 60 * 8;

const TOKEN_PAYLOAD = 'revenue-ledger-access:v1';

export function getRevenueLedgerPassword(): string | undefined {
  const password = process.env.REVENUE_LEDGER_PASSWORD?.trim();
  return password || undefined;
}

export function isRevenueLedgerPasswordConfigured(): boolean {
  return Boolean(getRevenueLedgerPassword());
}

export function createRevenueLedgerAccessToken(
  password: string,
  authToken: string
): string {
  return createHmac('sha256', password)
    .update(TOKEN_PAYLOAD)
    .update(authToken)
    .digest('hex');
}

export function isRevenueLedgerAccessTokenValid(
  token: string | undefined,
  authToken: string | undefined
): boolean {
  const password = getRevenueLedgerPassword();

  if (!token || !password || !authToken) {
    return false;
  }

  const expectedToken = createRevenueLedgerAccessToken(password, authToken);
  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expectedToken);

  if (tokenBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(tokenBuffer, expectedBuffer);
}

export function isRevenueLedgerPasswordValid(candidate: unknown): boolean {
  const password = getRevenueLedgerPassword();

  if (typeof candidate !== 'string' || !password) {
    return false;
  }

  const candidateBuffer = Buffer.from(candidate);
  const passwordBuffer = Buffer.from(password);

  if (candidateBuffer.length !== passwordBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, passwordBuffer);
}
