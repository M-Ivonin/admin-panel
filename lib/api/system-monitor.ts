import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export type Outcome =
  | 'pass'
  | 'warn'
  | 'fail'
  | 'unavailable'
  | 'interrupted'
  | 'unknown';
export interface MonitorRun {
  runId: string;
  checkId: string;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  outcome: Outcome;
  durationMs: number | null;
  httpStatus: number | null;
  failedStep: string | null;
  errorCode: string | null;
  diagnostic: string | null;
}
export interface MonitorCheck {
  checkId: string;
  required: boolean;
  enabled: boolean;
  intervalMs: number;
  deadlineMs: number;
  status: Outcome;
  lastRun: MonitorRun | null;
}
export interface MonitorOverview {
  generatedAt: string;
  environment: string;
  workerHeartbeatAt: string | null;
  checks: MonitorCheck[];
  delivery: {
    slackPending: number;
    slackFailed: number;
    lokiPending: number;
    lokiDropped: number;
  };
}
export interface HistoryBucket {
  at: string;
  pass: number;
  warn: number;
  fail: number;
  unavailable: number;
  interrupted: number;
  unknown: number;
  latencyMs: number | null;
}
export interface Page<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}
export interface MonitorHistory extends Page<MonitorRun> {
  buckets: HistoryBucket[];
}
export interface MonitorIncident {
  incidentId: string;
  checkId: string;
  kind: 'target' | 'coverage';
  openedAt: string;
  confirmedAt: string | null;
  resolvedAt: string | null;
  reason: string;
  blockedChecks: string[];
}
export type LogService = 'system-monitor' | 'backend' | 'n8n';
export interface MonitorLogs {
  items: { at: string; service: LogService; level: string; message: string }[];
  truncated: boolean;
  grafanaUrl?: string;
}
export interface HistoryQuery {
  checkId: string;
  from: string;
  to: string;
  limit: number;
  offset: number;
}
export class MonitorApiError extends Error {
  constructor(public readonly status: number) {
    super(`System monitor request failed (${status})`);
  }
}
async function get<T>(
  resource: string,
  query?: Record<string, string | number>
): Promise<T> {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) =>
    params.set(key, String(value))
  );
  const response = await adminAuthFetch({
    path: `/system-monitor/admin/${resource}${params.toString() ? `?${params}` : ''}`,
    method: 'GET',
    cache: 'no-store',
  });
  if (!response.ok) throw new MonitorApiError(response.status);
  return response.json() as Promise<T>;
}
export const monitorApi = {
  capabilities: () => get<{ canRead: boolean }>('capabilities'),
  overview: () => get<MonitorOverview>('overview'),
  history: (query: HistoryQuery) =>
    get<MonitorHistory>('history', { ...query }),
  incidents: (query: {
    from: string;
    to: string;
    limit: number;
    offset: number;
    id?: string;
  }) => get<Page<MonitorIncident>>('incidents', query),
  run: (runId: string) =>
    get<MonitorRun>(`checks/${encodeURIComponent(runId)}`),
  logs: (query: {
    service: LogService;
    from: string;
    to: string;
    limit: number;
  }) => get<MonitorLogs>('logs', query),
};
