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
- `publicationStatus`: `all` (UI default), `published`, or `unpublished`; independent of predictionScope
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

- the source is always `published_prediction` (V9 source versions); the initial prediction scope is All predictions
- Source and Slot selectors are replaced by All predictions / Top Picks / Other predictions
- Generated V9 summary and the independent market/reference-odds tables read `summary.v9`, across the full filtered scope before fixture pagination
- V9 counts distinct `prediction_id` recommendations and distinct fixtures; multiple recommendations on one fixture remain separate prediction rows
- accuracy with zero settlement weight is absent, including when all evaluated results are void; evaluated is not the accuracy denominator
- a selected version without an evaluation remains pending with reason `awaiting_evaluation`, displayed as Awaiting processing
- V9 details include canonical market/selection/line/period, revision, exact version UUID, official reference odds, source creation/publication dates and withdrawal metadata
- pagination is fixture-group based
- filters are applied to prediction rows first, then matching fixture groups are paginated
- the fixture table shows one row per match with grouped metrics for the filtered child rows only
- the match button expands inline prediction and source-version tables containing only rows that matched the current filters
- summary, fixture metrics and prediction details use tables instead of metric or prediction cards
- fixture rows and expanded tables show generated V9 metrics and exact prediction versions
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

With `predictionScope` or `publicationStatus` supplied (as this page always does), the backend selects
all generated V9 source predictions, including unpublished/internal/shadow and
on-demand records. Each stable prediction ID counts once, using its latest
version created strictly before kickoff (created_at, revision and version ID
descending). Publication, currentness, withdrawal and visibility do not gate
canonical ranking. Ranking precedes publication, value/EV and evaluation/status/market/odds filters.

Calls without either filter retain the historical public pre-match selection
for compatibility; mobile/public recommendation admission is unchanged.

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

The screen shows generated V9 predictions directly from `predictions.predictions`, including unpublished and internal records. Deprecated Source and Slot controls, Safe/Risky statistics and slot/source columns were removed.

- All predictions: no value or EV restriction, including false/null value and zero/negative/null EV.
- Top Picks: `is_value = true OR conservative_ev > 0`.
- Other predictions: neither criterion holds, including missing values.

Scope is evaluated on the latest generated version created before kickoff per prediction ID, before pagination, fixture grouping and statistics. It does not require a future kickoff or current admission. Each scope change resets pagination; Reset filters restores All predictions. Period, market, odds and status filters continue to intersect the selected scope. With Publication set to All, All predictions includes unpublished and on-demand records; older revisions and versions created at/after kickoff are not counted separately. Rows expose source `isValue` and `conservativeEv` so the assessment can be checked directly. Unseeded evaluations remain visible as Awaiting processing until the existing evaluation scheduler seeds and settles them.

## Publication filter

Publication is independent of the All predictions / Top Picks / Other predictions assessment. The default is All, preserving the existing administrative scope. Published selects the canonical generated version only when it is a historical public PREMADE publication before kickoff: published_at is not in the future, both public-output flags are true, and full_analysis.visibility is PUBLIC. Unpublished is the complete complement, including missing publication facts, INTERNAL, INTERNAL_SHADOW and on-demand assessments.

Select the latest generated version before kickoff first, then intersect publication and assessment filters. An older published revision must not replace a newer unpublished version. This filter evaluates the selected version, not whether any older version of the recommendation was ever published. Calls without both filters keep historical-public selection for compatibility. Publication filtering applies to V9 rows; legacy sources retain their existing behavior.

Summary, market/odds breakdowns, fixture grouping and pagination use the same filtered scope. The summary identifies a selected publication filter, changing it resets pagination and expanded fixtures, and Reset filters restores both selectors to All.

## Financial evaluation and generation flow

The Generation selector sends `flowType=all|ON_DEMAND|PREMADE`, independently of
assessment and publication. All is the default and reset value; changing it
resets fixture pagination and expansion. Unknown flow is labelled Unknown and
is included only by All. The backend selects the canonical version before flow
and other filters; UI never replaces it with an older matching revision.

`summary.v9`, fixture `stats.v9`, `byMarket` and `byOdds` add `settledPicks`,
`totalStaked`, `totalReturn`, `netProfit`, and nullable `roiPercent`. Summary covers
the entire filtered selection before pagination. The screen formats units and
ROI to two decimals, with explicit positive/negative signs and green/red color;
null ROI displays an em dash. These values are computed by the backend, never
from rounded child-row values or averaged percentages.

Expanded rows show original-version Odds, Generation, Settlement (Win, Half win,
Push, Half loss, Loss, Void), Profit units, Stake units, Return units and ROI
exclusion reason. Missing financial values display an em dash. A fixed stake of
one unit applies to every eligible settled pick, including half outcomes and
push. Void, invalid/missing odds, technical states and unverifiable historical
settlements are excluded with a reason; unpublished status alone does not
exclude a recommendation. Existing outcome/accuracy columns remain independent.

Download JSON calls admin-only `GET /match-predictions/admin/evaluations/export`
with exactly the current selection and sorting filters, omitting page and limit.
It uses the same authenticated HTTP client as the list. Loading disables repeat
downloads; an export failure is shown separately from list errors. The downloaded
JSON is the complete backend snapshot, preserving numeric precision and excluded
rows. It includes `schemaVersion:1`, UTC `calculatedAt`, normalized `filters`,
`staking:{stakeUnits:1,oddsSource:'prediction_version.reference_odds'}`, summary,
and flat version-aware rows. The UI does not walk pages or reconstruct totals.
The backend rejects an oversized export explicitly rather than truncating it.

All summary, breakdown, fixture and detail tables retain horizontal scrolling
on narrow screens. UI runtime visual proof is required separately from Jest,
typecheck and build evidence.
