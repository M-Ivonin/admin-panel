# Revenue Ledger Admin Screen

## Scope

The admin screen at `/dashboard/revenue-ledger` provides a read-only table for inspecting revenue ledger rows, gross revenue snapshots, correction rows, and Tenjin SDK dispatch state.

It does not support ledger edits, manual corrections, refund actions, reconciliation, CSV export, backfill, or free-text search.

## Backend Endpoint

The screen reads only through:

`GET /revenue-ledger/admin/entries`

Backend access requires JWT authentication and a backend admin email check.

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
