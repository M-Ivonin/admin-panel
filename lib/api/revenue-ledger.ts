import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export type RevenueLedgerStore = 'google_play' | 'app_store';

export type RevenueLedgerEventType =
  | 'initial_subscription'
  | 'subscription_renewal'
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

export type RevenueLedgerSortField =
  | 'createdAt'
  | 'eventTime'
  | 'grossAmount';

export type RevenueLedgerSortOrder = 'asc' | 'desc';

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
  params: RevenueLedgerFilters = {},
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
    searchParams.append('eventTypes', eventType),
  );
  params.directions?.forEach((direction) =>
    searchParams.append('directions', direction),
  );
  params.businessStatuses?.forEach((businessStatus) =>
    searchParams.append('businessStatuses', businessStatus),
  );
  params.tenjinDispatchStatuses?.forEach((tenjinDispatchStatus) =>
    searchParams.append('tenjinDispatchStatuses', tenjinDispatchStatus),
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
