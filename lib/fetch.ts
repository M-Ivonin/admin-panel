/**
 * Custom fetch wrapper with authentication support
 */

import { getAccessToken, getApiBaseUrl } from './auth';

export interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Fetch wrapper that automatically includes authorization header
 */
export async function authenticatedFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  // Build full URL if relative
  const fullUrl = url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`;

  // Add auth header if token exists and not skipped
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      if (!fetchOptions.headers) {
        fetchOptions.headers = {};
      }
      const headers = fetchOptions.headers as Record<string, string>;
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Set default content-type
  if (!fetchOptions.headers) {
    fetchOptions.headers = {};
  }
  const headers = fetchOptions.headers as Record<string, string>;
  if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(fullUrl, fetchOptions);

  // Handle 401 - token expired
  if (response.status === 401) {
    // Clear stored tokens and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return response;
}
