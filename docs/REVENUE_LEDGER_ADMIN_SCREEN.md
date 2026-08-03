# Revenue Ledger Admin Screen

The event-type filter includes `Pass purchase` and sends the exact backend value
`pass_purchase`. When a Full Access row has no legacy Store order, token, or
transaction identity, the identity column falls back to safe
`commerceEntitlementId` and `commerceEventId` UUIDs. Raw provider references are
never rendered.

## Scope

The admin screen at `/dashboard/revenue-ledger` provides a read-only table for inspecting revenue ledger rows, gross revenue snapshots, correction rows, and Tenjin SDK dispatch state.

It does not support ledger edits, manual corrections, refund actions, reconciliation, CSV export, backfill, or free-text search.

## Tenjin Dispatch Alert

The screen shows an operator alert when the last seven days contain Tenjin
dispatch rows with `client_reported_failed` or
`expired_without_client_report`. The alert count comes from the same filtered
backend read model and its action applies the matching date and status filters.
It also clears unrelated ledger filters so the affected-row view matches the
global alert count. If the health query fails, the screen shows a monitoring
warning instead of treating the failed check as zero issues.

The backend expires dispatches without a client report through its hourly stale
dispatch job after the configured stale window (24 hours by default).

## Backend Endpoint

The screen reads only through:

`GET /revenue-ledger/admin/entries`

Backend access requires JWT authentication and a backend admin email check.

## Password Gate

The admin screen is also protected by a page-level password gate before ledger
data is requested from the backend.

Configure the password with the server-side environment variable
`REVENUE_LEDGER_PASSWORD`.

Successful unlocks set an httpOnly cookie for 8 hours. The cookie is bound to
the current admin access token and validated through the local admin-panel route
`/api/revenue-ledger-access`; browser code does not read the password or the
cookie value directly.

## Filters

The UI sends exact filters only:

- `store`
- `eventTypes`
- `directions`
- `businessStatuses`
- `tenjinDispatchStatuses`
- `productId`
- `userId`
- `orderId`
- `purchaseToken`
- `transactionId`
- `originalTransactionId`
- `dateFrom`
- `dateTo`

Pagination is bounded by the backend with a maximum `limit` of `100`.

## Sorting

The UI exposes only backend allowlisted sort fields:

- `createdAt`
- `eventTime`
- `grossAmount`

## Summary

The summary is calculated by the backend for the filtered scope, not by summing the current browser page.

Money is grouped by currency. Rows with missing amount or currency are excluded from monetary totals and counted separately.

When the backend provides the store-adjusted summary, the USD chart shows:

- gross ledger revenue;
- estimated Google Play/App Store commission;
- estimated net revenue after that commission.

The graph keeps gross and estimated net as separate lines and displays the
effective commission periods returned by the backend. The copy intentionally
labels net and commission as estimates: Tenjin can still differ because some
server-side events are not SDK-dispatchable and because refund, tax, and
rounding rules are external to this screen.

The UI remains backward compatible with a backend that has not yet added the
store-adjusted fields; in that case it renders the previous gross-only USD
summary.

If the exchange-rate response does not cover every filtered currency, the
screen labels the USD values as a partial estimate, lists the excluded
currencies, and shows the FX source and rate date. Currency-specific ledger
totals remain visible above the chart.
