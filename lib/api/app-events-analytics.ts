import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export interface AppEventsAnalyticsParams {
  from?: string;
  to?: string;
  targetApp?: string;
  platform?: string;
  appVersion?: string;
  locale?: string;
  category?: string;
  eventKeys?: string[];
  cursor?: string;
  limit?: string;
}

export interface AppEventsAnalyticsMetadata {
  releaseDate: string;
  noBackfill: boolean;
  noBackfillMessage: string;
  defaultRangeDays: number;
  maxRangeDays: number;
  timezone: 'UTC';
}

export interface AppEventsAnalyticsSummary {
  totalEvents: number;
  uniqueUsers: number;
  screenOpenUniqueUsers: number;
  businessActionEvents: number;
}

export interface AppEventsCountByEvent {
  eventKey: string;
  category: string;
  count: number;
  uniqueUsers: number;
}

export interface AppEventsTimeSeriesBucket {
  bucketStart: string;
  eventKey: string;
  category?: string;
  count: number;
  uniqueUsers: number;
}

export interface AppEventsHeatmapBucket {
  dayOfWeek: number;
  hour: number;
  count: number;
  uniqueUsers: number;
}

export interface AppEventsAnalyticsFilters {
  targetApps: string[];
  platforms: string[];
  appVersions: string[];
  locales: string[];
  categories: string[];
  eventKeys: string[];
}

export interface AppEventsUnreadSocialActivityChannelTypeBreakdown {
  channelType: string;
  count: number;
  uniqueUsers: number;
  unreadCount: number;
}

export interface AppEventsAnalyticsBreakdowns {
  unreadSocialActivityByChannelType: AppEventsUnreadSocialActivityChannelTypeBreakdown[];
}

export interface AppEventsRecentEvent {
  id: string;
  eventKey: string;
  category: string;
  userId: string | null;
  occurredAt: string;
  targetApp: string | null;
  safeProperties: Record<string, unknown>;
}

export interface AppEventsAnalyticsResponse {
  metadata: AppEventsAnalyticsMetadata;
  range: {
    from: string;
    to: string;
  };
  summary: AppEventsAnalyticsSummary;
  countsByEvent: AppEventsCountByEvent[];
  timeSeries: AppEventsTimeSeriesBucket[];
  heatmapUtc: AppEventsHeatmapBucket[];
  filters: AppEventsAnalyticsFilters;
  breakdowns?: AppEventsAnalyticsBreakdowns;
  recentEvents: AppEventsRecentEvent[];
  nextCursor: string | null;
  emptyState: {
    kind: string;
    message: string;
  } | null;
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

async function parseAppEventsAnalyticsResponse<T>(
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
        `Failed to fetch App Events analytics: ${response.statusText}`
    );
  }

  return response.json();
}

export async function getAppEventsAnalytics(
  params: AppEventsAnalyticsParams = {}
): Promise<AppEventsAnalyticsResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item.trim().length > 0) {
          searchParams.append(key, item);
        }
      });
      return;
    }

    if (value !== undefined && value.trim().length > 0) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  const response = await adminAuthFetch({
    path: `/app-events/admin/analytics${queryString ? `?${queryString}` : ''}`,
    method: 'GET',
  });

  return parseAppEventsAnalyticsResponse(response);
}
