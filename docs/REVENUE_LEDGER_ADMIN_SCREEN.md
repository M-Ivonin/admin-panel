# Revenue Ledger Admin Screen

## Scope

The admin screen at `/dashboard/revenue-ledger` provides a table for inspecting revenue ledger rows, gross revenue snapshots, correction rows, and Tenjin SDK dispatch state.

It also exposes a guarded Tenjin dispatch retry diagnostics and reopen flow for one ledger row at a time. This flow does not send revenue to Tenjin from the admin panel; it only reopens an eligible pre-SDK row so a future updated/restored iOS client can request a dispatch token and call the Tenjin SDK.

It does not support ledger edits, manual corrections, refund actions, reconciliation, CSV export, backfill, free-text search, or backend/admin Tenjin delivery.

## Backend Endpoint

The table reads through:

`GET /revenue-ledger/admin/entries`

The per-row Tenjin retry dialog uses:

- `GET /revenue-ledger/admin/entries/:ledgerId/tenjin-dispatch-retry`
- `POST /revenue-ledger/admin/entries/:ledgerId/tenjin-dispatch-retry/reopen`

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

## Tenjin Retry Diagnostics

Each row has an `Inspect` action that loads retry diagnostics for that ledger row without mutating it.

The dialog shows retry eligibility, backend reason, next action, current Tenjin dispatch status, token state, token timestamps, issue count when returned by the backend, row timestamps, dispatch skip reason, skip reason, and last dispatch error.

Eligible rows show a guarded `Reopen client retry` action. The action requires a second confirmation before the POST request is sent.

After a successful reopen, the dialog shows the returned diagnostics and the table is refreshed. Ineligible rows do not show the reopen action; the dialog shows the backend reason and next action instead.

Rows that are already `client_reported_sent` or have crossed the SDK call boundary must not be reopened, because repeating a Tenjin SDK purchase call can double-count revenue.
