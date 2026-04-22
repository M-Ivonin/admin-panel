import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export interface HomeBannerLocalizedContent {
  en: string;
  es: string;
  pt: string;
}

export interface HomeBannerAdminConfig {
  enabled: boolean;
  imageUrl: string | null;
  cta: HomeBannerLocalizedContent;
  deepLink: string | null;
  dismissOnAction: boolean;
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

  const raw = (await response.json()) as Partial<HomeBannerAdminConfig>;

  return {
    enabled: raw.enabled ?? false,
    imageUrl: raw.imageUrl ?? null,
    deepLink: raw.deepLink ?? null,
    dismissOnAction: raw.dismissOnAction ?? true,
    cta: raw.cta ?? {
      en: '',
      es: '',
      pt: '',
    },
    content: raw.content ?? {
      en: '',
      es: '',
      pt: '',
    },
    updatedAt: raw.updatedAt ?? new Date(0).toISOString(),
  };
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
  cta: HomeBannerLocalizedContent;
  deepLink?: string | null;
  dismissOnAction: boolean;
  imageFile?: File | null;
  removeImage?: boolean;
}): Promise<HomeBannerAdminConfig> {
  const body = new FormData();
  body.set('enabled', String(input.enabled));
  body.set('content', JSON.stringify(input.content));
  body.set('cta', JSON.stringify(input.cta));
  body.set('deepLink', input.deepLink?.trim() ?? '');
  body.set('dismissOnAction', String(input.dismissOnAction));

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
