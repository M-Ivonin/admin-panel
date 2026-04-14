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
- `dateFrom`
- `dateTo`
- `sortBy`
- `sortOrder`

`dateFrom` and `dateTo` now accept ISO-8601 datetime values as well as date-only values. The admin UI sends local `datetime-local` values converted to ISO timestamps.

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

## Accuracy Semantics

Accuracy is calculated by the backend from settlement credit and weight:

- `win`: credit `1`, weight `1`
- `loss`: credit `0`, weight `1`
- `void`: credit `0`, weight `0`

The `evaluated` field still counts all rows with `status=evaluated`, including void rows. The `correct` field is the summed backend accuracy credit, and `accuracy` is `SUM(accuracy_credit) / SUM(accuracy_weight)`.

## UI Behavior

- pagination is fixture-group based
- filters are applied to prediction rows first, then matching fixture groups are paginated
- collapsed accordion rows show grouped accuracy stats for the filtered child rows only
- expanded accordion content shows only the prediction rows that matched the current filters
- evaluated prediction rows show their richer settlement outcome: `Win`, `Loss`, or `Void`
- session user identity is intentionally hidden in v1
- the `Search` field covers fixture id, team names, and league name; there is no separate league input in the UI
- the prediction evaluations page includes a compact period selector with `All time`, `Last 7 days`, `Last 24 hours`, and `Custom range`
- the default period is `Last 7 days`
- selecting a quick period preset updates both `dateFrom` and `dateTo`
- quick period presets keep exact rolling-window timestamps when calling the API, even though the inputs display minute-level local values
- editing either `From` or `To` switches the selector to `Custom range`

## Fixture Metadata

Fixture header content is resolved at read time:

- prefer canonical `match_predictions`
- fall back to `prediction_sessions` when a canonical match prediction is not available

No extra display fields are persisted into `prediction_evaluations`.
