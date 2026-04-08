import { publicApiFetch } from '@/modules/http/public-client';

/**
 * Request magic link to be sent to email
 */
export async function requestMagicLink(
  email: string,
  options?: { adminPanelUrl?: string }
): Promise<void> {
  const response = await publicApiFetch({
    path: '/auth/magic-link',
    method: 'POST',
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
      locale: 'en-us',
      adminPanelUrl: options?.adminPanelUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to send magic link');
  }
}

/**
 * Exchange magic link token for JWT tokens (admin panel)
 */
export async function exchangeMagicLinkToken(token: string): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string };
}> {
  const response = await publicApiFetch({
    path: '/auth/magic-link/exchange',
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error('Invalid or expired magic link');
  }

  return response.json();
}

/**
 * Exchange magic link token for JWT tokens (mobile app users)
 */
export async function exchangeMagicLinkForApp(token: string): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string };
}> {
  const response = await publicApiFetch({
    path: '/auth/magic-link/exchange-app',
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error('Invalid or expired magic link');
  }

  return response.json();
}
