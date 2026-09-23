'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  authenticateWithGoogle,
  exchangeMagicLink,
  storeTokens,
  clearTokens,
  getAccessToken,
  isTokenExpired,
  decodeToken,
  authUserFromAccessToken,
  AuthUser,
} from '@/lib/auth';

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (idToken: string) => Promise<void>;
  loginWithMagicLink: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from stored session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = getAccessToken();

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as AuthUser;
        const normalized = authUserFromAccessToken(token, parsed) || parsed;
        setUser(normalized);
        if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
          localStorage.setItem('user', JSON.stringify(normalized));
        }
      } catch {
        localStorage.removeItem('user');
      }
    } else if (token) {
      // If no user in localStorage but have valid token, try to decode user from token
      const decoded = decodeToken(token);

      // Check if token has expiration and if it's expired
      if (decoded && decoded.exp && isTokenExpired(token)) {
        clearTokens();
        setUser(null);
      } else if (decoded && decoded.email) {
        // Token is valid (either no expiration or not expired yet)
        const user: AuthUser = {
          id: decoded.sub || decoded.appUserId || '',
          appUserId: decoded.appUserId,
          email: decoded.email,
          name: decoded.name || decoded.email,
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (idToken: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authenticateWithGoogle(idToken);
        storeTokens(response.tokens);
        const user =
          authUserFromAccessToken(response.tokens.accessToken, response.user) ||
          response.user;
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loginWithMagicLink = useCallback(
    async (token: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await exchangeMagicLink(token);
        storeTokens(response.tokens);
        const user =
          authUserFromAccessToken(response.tokens.accessToken, response.user) ||
          response.user;
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Magic link login failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    loginWithMagicLink,
    logout,
    isAuthenticated: !!user || !!getAccessToken(),
  };
}
