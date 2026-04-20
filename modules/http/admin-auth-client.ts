import { clearTokens, getAccessToken } from '@/lib/auth';
import { getAdminAppConfig } from '@/modules/config/runtime';
import { buildApiUrl } from '@/modules/http/shared';

export interface AdminFetchOptions extends RequestInit {
  path: string;
  skipAuth?: boolean;
}

export async function adminAuthFetch({
  path,
  skipAuth = false,
  headers,
  body,
  ...options
}: AdminFetchOptions): Promise<Response> {
  const { apiBaseUrl } = getAdminAppConfig();
  const resolvedHeaders = new Headers(headers);

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      resolvedHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  if (!(body instanceof FormData) && !resolvedHeaders.has('Content-Type')) {
    resolvedHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildApiUrl(apiBaseUrl, path), {
    ...options,
    body,
    headers: resolvedHeaders,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    clearTokens();
    window.location.href = '/admin-login';
  }

  return response;
}
