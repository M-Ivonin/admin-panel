import Cookies from 'js-cookie';
import { getAdminAppConfig } from '@/modules/config/runtime';
import { publicApiFetch } from '@/modules/http/public-client';
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

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawUser = localStorage.getItem('user');
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

/**
 * Get API base URL from environment
 */
export function getApiBaseUrl(): string {
  return getAdminAppConfig().apiBaseUrl;
}

/**
 * Exchange magic link token for JWT
 */
export async function exchangeMagicLink(token: string): Promise<AuthResponse> {
  const response = await publicApiFetch({
    path: '/auth/exchange-magic-link',
    method: 'POST',
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
  const response = await publicApiFetch({
    path: '/auth/google',
    method: 'POST',
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

export function getStoredAuthUser(): AuthUser | null {
  const storedUser = readStoredUser();
  if (storedUser) {
    return storedUser;
  }

  const token = getAccessToken();
  const decoded = token ? decodeToken(token) : null;

  if (!decoded?.email) {
    return null;
  }

  return {
    id: decoded.appUserId || decoded.sub || '',
    email: decoded.email,
    name: decoded.name || decoded.email,
  };
}

/**
 * Decode JWT token (basic implementation)
 */
interface DecodedAuthToken {
  exp?: number;
  email?: string;
  name?: string;
  appUserId?: string;
  sub?: string;
}

export function decodeToken(token: string): DecodedAuthToken | null {
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
