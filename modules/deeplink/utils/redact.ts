export function redactToken(token: string | null | undefined): string | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  if (token.length <= 10) {
    return '***';
  }

  const first6 = token.substring(0, 6);
  const last4 = token.substring(token.length - 4);
  const middleLength = token.length - 10;
  const redacted = '*'.repeat(middleLength);

  return `${first6}${redacted}${last4}`;
}

export function createSafeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const safeData = { ...data };
  const sensitiveFields = ['token', 'accessToken', 'refreshToken', 'apiKey', 'secret'];

  for (const field of sensitiveFields) {
    if (typeof safeData[field] === 'string') {
      safeData[field] = redactToken(safeData[field] as string);
    }
  }

  return safeData;
}

export function isValidTokenFormat(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  return token.length >= 10 && /^[a-zA-Z0-9._-]+$/.test(token);
}
