import { authUserFromAccessToken } from '@/lib/auth';

function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.sig`;
}

describe('auth user identity', () => {
  it('normalizes stored legacy users to the backend token subject', () => {
    const user = authUserFromAccessToken(
      jwt({
        sub: 'backend-user-1',
        appUserId: 'app-user-1',
        email: 'admin@example.com',
      }),
      {
        id: 'app-user-1',
        email: 'old@example.com',
        name: 'Stored Admin',
      },
    );

    expect(user).toEqual({
      id: 'backend-user-1',
      appUserId: 'app-user-1',
      email: 'admin@example.com',
      name: 'Stored Admin',
    });
  });
});
