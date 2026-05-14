import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export type RevenueLedgerStore = 'google_play' | 'app_store';

export type RevenueLedgerEventType =
  | 'initial_subscription'
  | 'subscription_renewal'
  | 'subscription_canceled'
  | 'subscription_recovered'
  | 'subscription_restarted'
  | 'consumable_purchase'
  | 'refund'
  | 'voided';

export type RevenueLedgerDirection = 'positive' | 'negative' | 'none';

export type RevenueLedgerBusinessStatus = 'recorded' | 'skipped';

export type TenjinSdkDispatchStatus =
  | 'not_applicable'
  | 'pending_client_completion'
  | 'ready_for_client_dispatch'
  | 'dispatch_token_issued'
  | 'sdk_call_started'
  | 'client_reported_sent'
  | 'client_reported_failed'
  | 'expired_without_client_report';

export type RevenueLedgerSortField = 'createdAt' | 'eventTime' | 'grossAmount';

export type RevenueLedgerSortOrder = 'asc' | 'desc';

export type AdminTenjinDispatchTokenState = 'none' | 'active' | 'expired';

export type AdminTenjinDispatchNextAction =
  | 'client_can_retry_after_app_update_or_restore'
  | 'already_sent'
  | 'sdk_call_already_started'
  | 'missing_gross_snapshot'
  | 'not_positive_revenue'
  | 'not_recorded'
  | 'dispatch_not_applicable'
  | 'retry_limit_reached'
  | 'cannot_reopen_current_status'
  | 'reopened_for_client_retry';

export interface RevenueLedgerEntry {
  id: string;
  userId: string | null;
  store: RevenueLedgerStore;
  eventType: RevenueLedgerEventType;
  direction: RevenueLedgerDirection;
  businessStatus: RevenueLedgerBusinessStatus;
  tenjinDispatchStatus: TenjinSdkDispatchStatus;
  productId: string;
  grossAmount: string | null;
  currency: string | null;
  orderId: string | null;
  purchaseToken: string | null;
  transactionId: string | null;
  originalTransactionId: string | null;
  eventTime: string | null;
  skipReason: string | null;
  dispatchSkipReason: string | null;
  lastDispatchError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTenjinDispatchTokenDiagnostics {
  state: AdminTenjinDispatchTokenState;
  hasToken: boolean;
  issuedAt: string | null;
  expiresAt: string | null;
  isExpired: boolean;
  issueCount?: number;
}

export interface AdminTenjinDispatchRetryEligibility {
  eligible: boolean;
  reason: string | null;
}

export interface AdminTenjinDispatchRetryDiagnostics {
  ledgerId: string;
  businessStatus: RevenueLedgerBusinessStatus;
  tenjinDispatchStatus: TenjinSdkDispatchStatus;
  grossSnapshotAvailable: boolean;
  dispatchTokenIssueCount?: number;
  eventTime?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  sdkCallStartedAt?: string | null;
  clientReportedSentAt?: string | null;
  clientReportedFailedAt?: string | null;
  dispatchSkipReason?: string | null;
  skipReason?: string | null;
  lastDispatchError?: string | null;
  token: AdminTenjinDispatchTokenDiagnostics;
  retryEligibility: AdminTenjinDispatchRetryEligibility;
  nextAction: AdminTenjinDispatchNextAction;
}

export interface RevenueLedgerCurrencySummary {
  currency: string;
  positiveGrossAmount: string;
  negativeGrossAmount: string;
  netGrossAmount: string;
  positiveCount: number;
  negativeCount: number;
}

export interface RevenueLedgerSummary {
  totalEntries: number;
  recordedPositiveCount: number;
  recordedNegativeCount: number;
  skippedCount: number;
  missingAmountCount: number;
  byCurrency: RevenueLedgerCurrencySummary[];
}

export interface PaginatedRevenueLedgerEntriesResponse {
  items: RevenueLedgerEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: RevenueLedgerSummary;
}

export interface RevenueLedgerFilters {
  page?: number;
  limit?: number;
  store?: RevenueLedgerStore;
  eventTypes?: RevenueLedgerEventType[];
  directions?: RevenueLedgerDirection[];
  businessStatuses?: RevenueLedgerBusinessStatus[];
  tenjinDispatchStatuses?: TenjinSdkDispatchStatus[];
  productId?: string;
  userId?: string;
  orderId?: string;
  purchaseToken?: string;
  transactionId?: string;
  originalTransactionId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: RevenueLedgerSortField;
  sortOrder?: RevenueLedgerSortOrder;
}

export async function getRevenueLedgerEntries(
  params: RevenueLedgerFilters = {}
): Promise<PaginatedRevenueLedgerEntriesResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.store) searchParams.set('store', params.store);
  if (params.productId) searchParams.set('productId', params.productId);
  if (params.userId) searchParams.set('userId', params.userId);
  if (params.orderId) searchParams.set('orderId', params.orderId);
  if (params.purchaseToken) {
    searchParams.set('purchaseToken', params.purchaseToken);
  }
  if (params.transactionId) {
    searchParams.set('transactionId', params.transactionId);
  }
  if (params.originalTransactionId) {
    searchParams.set('originalTransactionId', params.originalTransactionId);
  }
  if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
  if (params.dateTo) searchParams.set('dateTo', params.dateTo);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  params.eventTypes?.forEach((eventType) =>
    searchParams.append('eventTypes', eventType)
  );
  params.directions?.forEach((direction) =>
    searchParams.append('directions', direction)
  );
  params.businessStatuses?.forEach((businessStatus) =>
    searchParams.append('businessStatuses', businessStatus)
  );
  params.tenjinDispatchStatuses?.forEach((tenjinDispatchStatus) =>
    searchParams.append('tenjinDispatchStatuses', tenjinDispatchStatus)
  );

  const queryString = searchParams.toString();
  const response = await adminAuthFetch({
    path: `/revenue-ledger/admin/entries${queryString ? `?${queryString}` : ''}`,
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Forbidden');
    }
    throw new Error(`Failed to fetch revenue ledger: ${response.statusText}`);
  }

  return response.json();
}

export async function getTenjinDispatchRetryDiagnostics(
  ledgerId: string
): Promise<AdminTenjinDispatchRetryDiagnostics> {
  const response = await adminAuthFetch({
    path: `/revenue-ledger/admin/entries/${encodeURIComponent(
      ledgerId
    )}/tenjin-dispatch-retry`,
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Forbidden');
    }
    if (response.status === 404) {
      throw new Error('Revenue ledger row was not found');
    }
    throw new Error(
      `Failed to fetch Tenjin retry diagnostics: ${response.statusText}`
    );
  }

  return response.json();
}

export async function reopenTenjinDispatchRetry(
  ledgerId: string
): Promise<AdminTenjinDispatchRetryDiagnostics> {
  const response = await adminAuthFetch({
    path: `/revenue-ledger/admin/entries/${encodeURIComponent(
      ledgerId
    )}/tenjin-dispatch-retry/reopen`,
    method: 'POST',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Forbidden');
    }
    if (response.status === 404) {
      throw new Error('Revenue ledger row was not found');
    }
    throw new Error(`Failed to reopen Tenjin retry: ${response.statusText}`);
  }

  return response.json();
}
