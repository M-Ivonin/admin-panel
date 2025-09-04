/**
 * Token redaction utilities for secure logging
 */

/**
 * Redacts a token by keeping only the first 6 and last 4 characters
 * @param token - The token to redact
 * @returns The redacted token or null if token is invalid
 */
export function redactToken(token: string | null | undefined): string | null {
  if (!token || typeof token !== 'string') {
    return null;
  }
  
  // If token is too short, redact completely
  if (token.length <= 10) {
    return '***';
  }
  
  const first6 = token.substring(0, 6);
  const last4 = token.substring(token.length - 4);
  const middleLength = token.length - 10;
  const redacted = '*'.repeat(middleLength);
  
  return `${first6}${redacted}${last4}`;
}

/**
 * Creates a safe log object with redacted sensitive information
 * @param data - The data object to make safe for logging
 * @returns A safe object with redacted sensitive fields
 */
export function createSafeLogData(data: Record<string, any>): Record<string, any> {
  const safeData = { ...data };
  
  // Redact common sensitive field names
  const sensitiveFields = ['token', 'accessToken', 'refreshToken', 'apiKey', 'secret'];
  
  for (const field of sensitiveFields) {
    if (safeData[field]) {
      safeData[field] = redactToken(safeData[field]);
    }
  }
  
  return safeData;
}

/**
 * Validates if a token format looks reasonable (basic validation)
 * @param token - The token to validate
 * @returns True if token format appears valid
 */
export function isValidTokenFormat(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Basic validation: should be at least 10 characters and contain alphanumeric characters
  return token.length >= 10 && /^[a-zA-Z0-9._-]+$/.test(token);
}