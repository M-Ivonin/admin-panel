import { redactToken, createSafeLogData, isValidTokenFormat } from '../lib/redact';

describe('redactToken', () => {
  it('should redact tokens correctly', () => {
    const token = 'abcdef1234567890xyz'; // 19 chars: 6 + 7 + 4 + 2 = 19, middle = 19-10 = 9
    const result = redactToken(token);
    expect(result).toBe('abcdef*********0xyz'); // 6 + 9 + 4 = 19
  });

  it('should return *** for short tokens', () => {
    const shortToken = 'abc123';
    const result = redactToken(shortToken);
    expect(result).toBe('***');
  });

  it('should return null for null/undefined tokens', () => {
    expect(redactToken(null)).toBe(null);
    expect(redactToken(undefined)).toBe(null);
    expect(redactToken('')).toBe(null);
  });

  it('should handle edge case of exactly 10 characters', () => {
    const token = '1234567890';
    const result = redactToken(token);
    expect(result).toBe('***');
  });

  it('should handle 11 character token', () => {
    const token = '12345678901';
    const result = redactToken(token);
    expect(result).toBe('123456*8901');
  });
});

describe('createSafeLogData', () => {
  it('should redact sensitive fields', () => {
    const data = {
      channelId: 'channel123',
      token: 'secret123456789token',
      accessToken: 'access123456789token',
      userId: 'user456',
    };

    const result = createSafeLogData(data);

    expect(result.channelId).toBe('channel123');
    expect(result.token).toBe('secret**********oken'); // 20 chars: 6 + 10 + 4
    expect(result.accessToken).toBe('access**********oken'); // 20 chars: 6 + 10 + 4
    expect(result.userId).toBe('user456');
  });

  it('should handle data without sensitive fields', () => {
    const data = {
      channelId: 'channel123',
      userId: 'user456',
      timestamp: '2024-01-01T00:00:00Z',
    };

    const result = createSafeLogData(data);
    expect(result).toEqual(data);
  });

  it('should not modify original data object', () => {
    const data = {
      token: 'secret123456789token',
      other: 'value',
    };

    const result = createSafeLogData(data);

    expect(data.token).toBe('secret123456789token'); // Original unchanged
    expect(result.token).toBe('secret**********oken'); // Copy is redacted
  });
});

describe('isValidTokenFormat', () => {
  it('should validate correct token formats', () => {
    expect(isValidTokenFormat('abcdef1234567890')).toBe(true);
    expect(isValidTokenFormat('token-with-dashes')).toBe(true);
    expect(isValidTokenFormat('token.with.dots')).toBe(true);
    expect(isValidTokenFormat('token_with_underscores')).toBe(true);
  });

  it('should reject invalid token formats', () => {
    expect(isValidTokenFormat('short')).toBe(false);
    expect(isValidTokenFormat('token with spaces')).toBe(false);
    expect(isValidTokenFormat('token@with#symbols')).toBe(false);
    expect(isValidTokenFormat(null)).toBe(false);
    expect(isValidTokenFormat(undefined)).toBe(false);
    expect(isValidTokenFormat('')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isValidTokenFormat('1234567890')).toBe(true); // Exactly 10 chars
    expect(isValidTokenFormat('123456789')).toBe(false); // 9 chars
  });
});