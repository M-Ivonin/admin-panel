import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export interface OnboardingFunnelAnalyticsParams {
  from?: string;
  to?: string;
  platform?: string;
  app_product?: string;
  app_version?: string;
  locale?: string;
}

export interface OnboardingFunnelSummary {
  sessionsStarted: number;
  sessionsCompleted: number;
  completionRate: number;
  averageSecondsToCompletion: number | null;
}

export interface OnboardingFunnelStep {
  step: string;
  order: number;
  views: number;
  actions: number;
  completions: number;
  dropOffs: number;
  averageSecondsToNextStep: number | null;
}

export interface OnboardingFunnelTransition {
  from: string;
  to: string;
  sessions: number;
  rate: number;
}

export interface OnboardingFunnelTimeSeriesBucket {
  date: string;
  started: number;
  completed: number;
  dropOff: number;
}

export interface OnboardingFunnelHeatmapBucket {
  dayOfWeek: number;
  hour: number;
  events: number;
  dropOffs: number;
}

export interface OnboardingFunnelRecentEvent {
  id: string;
  sessionId: string;
  step: string;
  eventName: string;
  action: string | null;
  occurredAt: string;
}

export interface OnboardingFunnelAnalyticsFilters {
  platforms: string[];
  locales: string[];
  appVersions: string[];
}

export interface OnboardingFunnelAnalyticsResponse {
  range: {
    from: string;
    to: string;
    timezone: 'UTC';
  };
  summary: OnboardingFunnelSummary;
  filters: OnboardingFunnelAnalyticsFilters;
  steps: OnboardingFunnelStep[];
  transitions: OnboardingFunnelTransition[];
  timeSeries: OnboardingFunnelTimeSeriesBucket[];
  heatmap: OnboardingFunnelHeatmapBucket[];
  recentEvents: OnboardingFunnelRecentEvent[];
}

async function readAdminErrorMessage(
  response: Response
): Promise<string | null> {
  try {
    const body = (await response.json()) as
      | { message?: string | string[]; error?: string }
      | undefined;

    if (Array.isArray(body?.message)) {
      return body.message.join(' ');
    }

    if (typeof body?.message === 'string' && body.message.trim().length > 0) {
      return body.message;
    }

    if (typeof body?.error === 'string' && body.error.trim().length > 0) {
      return body.error;
    }
  } catch {
    return null;
  }

  return null;
}

async function parseOnboardingAnalyticsResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    const backendMessage = await readAdminErrorMessage(response);

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    if (response.status === 403) {
      throw new Error('Forbidden');
    }

    throw new Error(
      backendMessage ??
        `Failed to fetch onboarding analytics: ${response.statusText}`
    );
  }

  return response.json();
}

export async function getOnboardingFunnelAnalytics(
  params: OnboardingFunnelAnalyticsParams = {}
): Promise<OnboardingFunnelAnalyticsResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value.trim().length > 0) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  const response = await adminAuthFetch({
    path: `/onboarding-funnel/admin/analytics${
      queryString ? `?${queryString}` : ''
    }`,
    method: 'GET',
  });

  return parseOnboardingAnalyticsResponse(response);
}
