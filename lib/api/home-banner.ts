import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export interface HomeBannerLocalizedContent {
  en: string;
  es: string;
  pt: string;
}

export interface HomeBannerAdminConfig {
  enabled: boolean;
  imageUrl: string | null;
  cta: string | null;
  deepLink: string | null;
  content: HomeBannerLocalizedContent;
  updatedAt: string;
}

async function parseHomeBannerResponse(
  response: Response
): Promise<HomeBannerAdminConfig> {
  if (!response.ok) {
    const rawError = await response.text();
    throw new Error(rawError || 'Failed to load Home banner config');
  }

  return (await response.json()) as HomeBannerAdminConfig;
}

export async function getHomeBannerAdminConfig(): Promise<HomeBannerAdminConfig> {
  const response = await adminAuthFetch({
    path: '/home-banner/admin',
    method: 'GET',
  });

  return parseHomeBannerResponse(response);
}

export async function updateHomeBannerAdminConfig(input: {
  enabled: boolean;
  content: HomeBannerLocalizedContent;
  cta?: string | null;
  deepLink?: string | null;
  imageFile?: File | null;
  removeImage?: boolean;
}): Promise<HomeBannerAdminConfig> {
  const body = new FormData();
  body.set('enabled', String(input.enabled));
  body.set('content', JSON.stringify(input.content));
  body.set('cta', input.cta?.trim() ?? '');
  body.set('deepLink', input.deepLink?.trim() ?? '');

  if (input.removeImage) {
    body.set('removeImage', 'true');
  }

  if (input.imageFile) {
    body.set('image', input.imageFile);
  }

  const response = await adminAuthFetch({
    path: '/home-banner/admin',
    method: 'PUT',
    body,
  });

  return parseHomeBannerResponse(response);
}
