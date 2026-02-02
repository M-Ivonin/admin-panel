import Cookies from 'js-cookie';
/**
 * Authentication utilities
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

/**
 * Get API base URL from environment
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

    if (isLocalhost) {
      return 'http://localhost:3001';
    }
  }

  return 'https://api.tipsterbro.com/v1';
}

/**
 * Exchange magic link token for JWT
 */
export async function exchangeMagicLink(token: string): Promise<AuthResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/exchange-magic-link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error(`Magic link exchange failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Authenticate with Google ID token
 */
export async function authenticateWithGoogle(
  idToken: string
): Promise<AuthResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error(`Google authentication failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Store authentication tokens in cookies
 */
export function storeTokens(tokens: AuthTokens): void {
  const cookieOptions = {
    expires: 365, // 1 рік (токени безстрокові на backend)
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/', // Important: make cookies available for all paths
  };

  Cookies.set('accessToken', tokens.accessToken, cookieOptions);

  if (tokens.refreshToken) {
    Cookies.set('refreshToken', tokens.refreshToken, cookieOptions);
  }
}

/**
 * Get stored access token from cookies
 */
export function getAccessToken(): string | null {
  return Cookies.get('accessToken') || null;
}

/**
 * Get stored refresh token from cookies
 */
export function getRefreshToken(): string | null {
  return Cookies.get('refreshToken') || null;
}

/**
 * Clear authentication tokens from cookies
 */
export function clearTokens(): void {
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return !!token;
}

/**
 * Decode JWT token (basic implementation)
 */
export function decodeToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Use atob for browser compatibility
    const payload = JSON.parse(
      typeof window !== 'undefined'
        ? atob(parts[1])
        : Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    return payload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch {
    return true;
  }
}
