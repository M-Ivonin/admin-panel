import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export interface PortraitActivity {
  name: string;
  count: number;
  lastAt: string;
  observedDays: number;
  sessions: number | null;
}
export interface PortraitTimelineFact {
  key: string;
  source: string;
  name: string;
  at: string;
  ingestedAt: string | null;
  refs: Record<string, string>;
  platform: string | null;
  version: string | null;
  build: string | null;
}
export interface PortraitWindow {
  days: number;
  from: string;
  to: string;
  actionSource: string;
  screenSource: string;
  observedActions: number | null;
  observedActionDays: number | null;
  meaningfulActiveDays: number | null;
  sessions: number | null;
  daily: Array<{
    day: string;
    observedActions: number | null;
    meaningful: boolean | null;
  }>;
  peakDailyActions: number;
  heatmap: Array<{
    weekday: number;
    hour: number;
    count: number | null;
    intensity: number | null;
  }>;
  actions: PortraitActivity[];
  screens: PortraitActivity[];
  functions: Record<string, number | null>;
  chats: Record<string, number | null>;
  attempts: Array<{
    attemptId: string;
    events: Array<{ name: string; at: string }>;
    ledgerIds: string[];
  }>;
  paidUse: Array<{
    entitlementId: string;
    productKey: string;
    startsAt: string;
    expiresAt: string | null;
    firstRecordedUseAt: string | null;
  }>;
  coverage: {
    status: 'missing' | 'partial' | 'ready';
    importedDays: number;
    expectedDays: number;
    preliminaryDays: number;
    notes: string[];
  };
}
export interface PortraitSnapshot {
  id: string;
  userId: string;
  generatedAt: string;
  asOf: string;
  schemaVersion: number;
  featureVersion: string;
  platforms: Array<{
    source: string;
    platform: string;
    version: string | null;
    build: string | null;
    observations: number;
    lastAt: string;
  }>;
  timezone: { value: string; certainty: string; basis: string };
  locale: string | null;
  geo: {
    country: string | null;
    source: string | null;
    detectedAt: string | null;
  };
  storefront: { status: string };
  sourceWatermarks: Array<{
    source: string;
    occurredAt: string | null;
    receivedAt: string | null;
    status: string;
    records: number;
  }>;
  windows: Record<'1' | '7' | '30', PortraitWindow>;
  current: {
    access: {
      authorization: string;
      accessSource: string;
      primaryEntitlement: {
        productKey: string;
        startsAt: string;
        expiresAt: string | null;
        autoRenewing: boolean;
      } | null;
    };
    pendingCommerce: boolean;
    favorites: Array<{ id: string; name: string; kind: string }>;
    savedPicks: number;
    capturedAt: string;
  };
  observedInterests: Array<{
    reference: string;
    actions: number;
    lastAt: string;
    evidence: string;
  }>;
  returnProgress: {
    observedDates: string[];
    firstObservedAt: string | null;
    lastObservedAt: string | null;
    classification: string;
  };
  decisions: { status: 'not_enabled' };
}
export type PortraitResponse =
  | { status: 'not_ready' | 'restricted'; userId: string; snapshot: null }
  | {
      status: 'ready';
      userId: string;
      snapshot: PortraitSnapshot;
      selectedDays: number;
      selectedWindow: PortraitWindow;
      comparison: PortraitWindow;
      history: Array<{ id: string; asOf: string; generatedAt: string }>;
      timeline: {
        items: PortraitTimelineFact[];
        offset: number;
        nextOffset: number | null;
        total: number;
      };
      freshness: {
        ageSeconds: number;
        stale: boolean;
        targetSeconds: number;
        fallback: string;
      };
    };

/** Fetches the saved protected per-account projection; no import or analysis action is available here. */
export async function getUserPortrait(
  userId: string,
  query: { days: 7 | 30; snapshotId?: string; offset: number }
): Promise<PortraitResponse> {
  const params = new URLSearchParams({
    days: String(query.days),
    offset: String(query.offset),
  });
  if (query.snapshotId) params.set('snapshotId', query.snapshotId);
  const response = await adminAuthFetch({
    path: `/app-events/admin/engagement/portraits/${encodeURIComponent(userId)}?${params}`,
    method: 'GET',
  });
  if (!response.ok) {
    const data: { message?: string } = await response.json().catch(() => ({}));
    throw new Error(
      data.message ?? `Could not load portrait (${response.status}).`
    );
  }
  return response.json();
}
