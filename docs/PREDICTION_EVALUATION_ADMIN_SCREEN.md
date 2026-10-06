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
- `sourceTypes` (the screen always sends `published_prediction`)
- `predictionScope`: `all` (default), `top_picks`, or `other`
- `slotKeys` (legacy API callers only)
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

- the source is always `published_prediction` (Public V9); the initial prediction scope is All predictions
- Source and Slot selectors are replaced by All predictions / Top Picks / Other predictions
- Public V9 summary and the independent market/reference-odds tables read `summary.v9`, across the full filtered scope before fixture pagination
- V9 counts distinct `prediction_id` recommendations and distinct fixtures; multiple recommendations on one fixture remain separate prediction rows
- accuracy with zero settlement weight is absent, including when all evaluated results are void; evaluated is not the accuracy denominator
- a selected version without an evaluation remains pending with reason `awaiting_evaluation`, displayed as Awaiting processing
- V9 details include canonical market/selection/line/period, revision, exact version UUID, official reference odds, source creation/publication dates and withdrawal metadata
- pagination is fixture-group based
- filters are applied to prediction rows first, then matching fixture groups are paginated
- the fixture table shows one row per match with grouped metrics for the filtered child rows only
- the match button expands inline prediction and public-version tables containing only rows that matched the current filters
- summary, fixture metrics and prediction details use tables instead of metric or prediction cards
- fixture rows and expanded tables show public V9 metrics and exact prediction versions
- wide tables scroll horizontally within their own containers on small screens
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


## Prediction selection

The screen shows historical public V9 predictions only. Deprecated Source and Slot controls, Safe/Risky statistics and slot/source columns were removed.

- All predictions: no value or EV restriction, including false/null value and zero/negative/null EV.
- Top Picks: `is_value = true OR conservative_ev > 0`.
- Other predictions: neither criterion holds, including missing values.

Scope is evaluated on the latest public version before kickoff per prediction ID, before pagination, fixture grouping and statistics. It does not require a future kickoff or current admission. Each scope change resets pagination; Reset filters restores All predictions. Period, market, odds and status filters continue to intersect the selected scope. All predictions means all historical public V9 predictions in those filters, not unpublished/on-demand records or older revisions.
