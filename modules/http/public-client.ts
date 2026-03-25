import { getPublicAppConfig } from '@/modules/config/runtime';
import { buildApiUrl } from '@/modules/http/shared';

export interface PublicFetchOptions extends RequestInit {
  path: string;
}

export async function publicApiFetch({
  path,
  headers,
  ...options
}: PublicFetchOptions): Promise<Response> {
  const { apiBaseUrl } = getPublicAppConfig();
  const resolvedHeaders = new Headers(headers);

  if (!resolvedHeaders.has('Content-Type') && options.body) {
    resolvedHeaders.set('Content-Type', 'application/json');
  }

  return fetch(buildApiUrl(apiBaseUrl, path), {
    ...options,
    headers: resolvedHeaders,
  });
}
