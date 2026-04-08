# Prediction Evaluation Admin Screen

## Routes

- dashboard card: `/dashboard`
- screen: `/dashboard/prediction-evaluations`

## Backend Contract

The admin screen reads grouped prediction evaluation data from:

- `GET /match-predictions/admin/evaluations`

Access rules:

- JWT required
- caller must be an admin email recognized by `MagicLinkService.isAdminEmail(...)`

## Query Parameters

- `page`
- `limit`
- `search`
- `statuses`
- `sourceTypes`
- `slotKeys`
- `marketKeys`
- `league`
- `dateFrom`
- `dateTo`
- `sortBy`
- `sortOrder`

Current default sort:

- `sortBy=prediction_created_at`
- `sortOrder=desc`

Supported sort fields:

- `prediction_created_at`
- `fixture_time`
- `status`
- `total`
- `evaluated`
- `correct`
- `accuracy`
- `pending`
- `unsupported`
- `failed`

Supported sort orders:

- `asc`
- `desc`

## UI Behavior

- pagination is fixture-group based
- filters are applied to prediction rows first, then matching fixture groups are paginated
- collapsed accordion rows show grouped accuracy stats for the filtered child rows only
- expanded accordion content shows only the prediction rows that matched the current filters
- session user identity is intentionally hidden in v1

## Fixture Metadata

Fixture header content is resolved at read time:

- prefer canonical `match_predictions`
- fall back to `prediction_sessions` when a canonical match prediction is not available

No extra display fields are persisted into `prediction_evaluations`.
