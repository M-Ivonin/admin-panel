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
  pricing?: {
    policyVersion: string;
    capturedAt: string;
    status: 'available' | 'unavailable';
    quotes: Array<{
      store: 'google_play' | 'app_store';
      platform: 'android' | 'ios';
      capturedAt: string;
      validUntil: string;
      storefront: {
        territory: string;
        source: 'native_storefront';
        capturedAt: string;
      };
    }>;
  };
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

export interface PortraitShadowSelection {
  candidateId: string;
  reasonCode: string;
  templateId: string;
  locale: string;
  channel: 'none';
  dispatchAt: string;
  expiresAt: string;
  materialVersion: string;
}
export interface PortraitShadowDecision {
  id: string;
  snapshotId: string;
  createdAt: string;
  completedAt: string | null;
  status: 'pending' | 'completed';
  triggerKey: string;
  mode: 'shadow';
  dispatchEnabled: false;
  source: 'baseline' | 'model';
  baseline: PortraitShadowSelection;
  selection: PortraitShadowSelection;
  selectedCandidate: {
    kind: string;
    opportunityId: string;
    proposedChannel: string;
    disposition: string;
    destination: string | null;
    copy: { title: string; body: string } | null;
  };
  input: {
    snapshot: {
      id: string;
      asOf: string;
      schemaVersion: number;
      featureVersion: string;
    };
    evaluatedAt: string;
    targetApp: string;
    versions: Record<string, string>;
    facts: { selectedWindow: { days: number; from: string; to: string } };
    current: {
      capturedAt: string;
      access: { authorization: string };
      pendingCommerce: boolean;
      activeInApp: boolean | null;
      preferences: { effectivePredictions: string; revision: string };
    };
    exclusions: string[];
    capabilities: Record<string, string>;
  };
  validator: { accepted: boolean; reasons: string[] };
  model: {
    status: string;
    model: string;
    responseId: string | null;
    latencyMs: number;
    inputTokens: number | null;
    outputTokens: number | null;
    store: false;
    retention: string;
  };
}
export interface PortraitDecisionHistory {
  mode: 'shadow';
  dispatchEnabled: false;
  status: 'available' | 'restricted';
  capabilities: Record<string, string>;
  items: PortraitShadowDecision[];
}
export interface PortraitDecisionReplay {
  status: 'replayed' | 'version_unavailable';
  decisionId?: string;
  snapshotId?: string;
  inputDigest?: string;
  baseline?: PortraitShadowSelection;
  savedSelection?: PortraitShadowSelection;
  validator?: { accepted: boolean };
  modelCalled: false;
  dispatchEnabled: false;
}

/** Reads existing decision evidence without evaluating, publishing or sending. */
export async function getUserPortraitDecisionHistory(
  userId: string
): Promise<PortraitDecisionHistory> {
  return readDecisionEvidence<PortraitDecisionHistory>(userId, '');
}

/** Replays the frozen validator/rule comparison with no new provider request. */
export async function replayUserPortraitDecision(
  userId: string,
  decisionId: string
): Promise<PortraitDecisionReplay> {
  return readDecisionEvidence<PortraitDecisionReplay>(
    userId,
    `/${encodeURIComponent(decisionId)}/replay`
  );
}

async function readDecisionEvidence<T>(
  userId: string,
  suffix: string
): Promise<T> {
  const response = await adminAuthFetch({
    path: `/app-events/admin/engagement/portraits/${encodeURIComponent(userId)}/decisions${suffix}`,
    method: 'GET',
  });
  if (!response.ok)
    throw new Error(`Could not load decision evidence (${response.status}).`);
  return response.json();
}
