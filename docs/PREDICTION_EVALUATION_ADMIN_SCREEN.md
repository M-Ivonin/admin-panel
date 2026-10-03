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

- the initial source is explicitly `published_prediction` (Public V9); clearing Source sends all three supported sources explicitly
- `published_prediction` uses `main`; legacy sources and Safe/Risky views remain selectable
- Public V9 cards and the independent market/reference-odds tables read `summary.v9`, across the full filtered scope before fixture pagination
- V9 counts distinct `prediction_id` recommendations and distinct fixtures; multiple recommendations on one fixture remain separate cards
- accuracy with zero settlement weight is absent, including when all evaluated results are void; evaluated is not the accuracy denominator
- a selected version without an evaluation remains pending with reason `awaiting_evaluation`, displayed as Awaiting processing
- V9 details include canonical market/selection/line/period, revision, exact version UUID, official reference odds, source creation/publication dates and withdrawal metadata
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

For V9, fixture time is the selected version's `kickoff_at`. Team/league metadata
comes from its `full_analysis.match`, falling back to `matches`; missing catalog or
legacy prediction/session rows do not remove a recommendation. Prediction-created
sorting and `createdAt` use source `created_at`; `publishedAt` is separate.

## V9 Selection And Response

The backend selects the last public prematch version per stable `prediction_id`,
ordered by publication, source creation and version UUID descending. Publication
requires V9/PREMADE, a nonfuture `published_at`, both retained public-output flags
and PUBLIC analysis visibility. Versions published at/after kickoff are excluded
from this scope. Currentness, withdrawal, current status and today's engine config
do not erase prior publication. Ranking precedes evaluation/status/market/odds
filters, so filtering never substitutes an older revision.

The optional `summary.v9` contains `predictionCount`, `fixtureCount`, `evaluated`,
`correct`, `accuracy`, `averageOdds`, `pending`, `notFound`, `unsupported`, `failed`,
plus `byMarket` and `byOdds` arrays with the same metrics. It is absent on legacy-only
requests and counts only V9 on mixed-source requests. `stats.v9` gives the same
metrics for filtered V9 children in one fixture group.

Market buckets use normalized market keys, including a null/unrecognized bucket.
Odds buckets expose `lowerInclusive`/`upperExclusive`: [1,1.5), [1.5,2), [2,3),
[3,infinity), and null/null for missing odds. Odds are official `reference_odds`,
never display quotes. Counts in each independent breakdown sum to predictionCount;
fixture counts must not be summed across buckets.

V9 row `id` and `sourceId` are the exact version UUID even before evaluation.
Nullable V9 metadata includes `predictionId`, `revision`, `sourceCreatedAt`,
`publishedAt`, `canonicalMarketKey`, `selectionKey`, `selectionLabel`, `line`,
`periodKey`, `withdrawnAt`. Legacy IDs retain their meaning. Reads never seed or
settle results. Omitted `sourceTypes` retains the legacy API and Flutter Home scope.
