# Home Analytics summary consistency

User requested Chrome inspection and repair of differing preview/detail values.
Live Chrome on sirbro.com showed two independently verified causes:

- Overview links omitted the selected period; detail opened its default
  2026-10-02–2026-10-16 range.
- Detail summary used final-step percentages under whole-funnel titles. Its
  Full Access funnel had 186 offer users, 8 purchase starts and 4 verified users,
  while its summary showed 50% (4/8), rather than 2.15% (4/186).

The fix shares the existing Overview whole-funnel/weighted-load calculation and
formatting with the detail summary. Detailed funnel step rates retain their
previous-stage meaning. Links carry exact UTC from/to, including the snapshot
cutoff, and detail initializes that range before its first request.

## Chrome local validation

Final Next.js production build at 127.0.0.1:3105, controlled through the user's
Chrome browser via CUA. A disposable local session was used. A localhost-only API
replayed the genuine Export JSON response downloaded through the production UI;
all other local reports deliberately returned 503. No production auth was copied
or altered. Raw exported analytics are kept outside the repository.

This replay verifies equality and navigation, not daily/live data correctness:
the same exported aggregate snapshot was returned for each local request, with
request bounds echoed in the response. Therefore flat local weekly lines are
expected and do not claim to be live daily rates.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Preview formula and four compact charts retained | Pass | [Chrome Overview](chrome-overview-replay.png) |
| Detail values equal 2.15%, 21.35%, 33.33%, 100% | Pass | [Chrome detail](chrome-detail-replay.png) |
| General report link preserves date and exact cutoff | Pass | Chrome URL and filters; cross-surface regression test |
| Zero/N/A, historical gaps and chart contract preserved | Pass | affected Jest suites |

Screenshots were inspected after capture: readable titles/values, four cards in
one row, existing theme, no clipping in affected content. Visible unrelated error
panels in Overview are intentional local replay behavior.

Validation: 10 affected Jest suites / 50 tests passed; lint zero errors with
three existing warnings, build, typecheck and diff check passed. Independent Spec
and Standards review is required before commit. Deployed validation is recorded
separately when available.

## Deployed acceptance — 2026-10-16

Vercel reported success for code commit `23ebc68e`. The authenticated user Chrome
session on `sirbro.com` was reloaded and Overview selected 2026-10-10. Its four
headlines were 9.09%, 10.71%, 0%, 100%, with counts 2/22 users, 3/28 users, 0/2
users and 99/99 attempts. Its last chart points matched those headlines.
Clicking the general Home Analytics report arrow carried
`from=2026-10-10T00:00:00.000Z&to=2026-10-10T23:59:59.999Z`; both detail date filters
were October 10 and its four summary values matched exactly.

- [Deployed Overview](chrome-overview-live-after.png)
- [Deployed detail](chrome-detail-live-after.png)
- [Original detail before repair](chrome-before-live.png)

## Additional read-only statistics audit

Requested while the deployment was running. Inspected all 13 dashboards and
32 metric types in the real October 2–16 export (1,572 rows), frontend formatting
and grouping, backend formula SQL, and the dashboard manifest. Numeric percentage
rows with defined positive denominators matched numerator/denominator within
backend two-decimal rounding; none fell outside 0–100. This checks returned
arithmetic and presentation, not completeness of raw event instrumentation.

Confirmed additional defects, left unchanged by this audit:

1. **Controlled load failure rate loses observed zero.** The real export has
   848/848 successful settled attempts but failure rate N/A. Contract says N/A
   only when no settled attempts exist. The SQL groups only failed attempts;
   when there are none it returns no row, and metricRowsOrNa manufactures N/A.
   Sources: backend updated-home-dashboard.query.ts:765–774 and
   updated-home-analytics-dashboard.service.ts:245–259. Also reproduced live on
   October 16. [Chrome evidence](chrome-audit-failure-rate.png).
2. **Latency dimensions have inconsistent time units.** Expanded verification
   latency displays p50=15492.683 without a unit beside value=15.493s and unit
   seconds. Backend p50/p95 are milliseconds; generic dimension rendering leaves
   them raw while formatMetricValue converts only the main value. Sources:
   backend query:1240–1248, frontend UpdatedHomeAnalyticsSection.tsx dimension
   renderer and presentation.ts formatMetricValue.
   [Chrome evidence](chrome-audit-latency.png).
3. **Empty funnels display a full 100% baseline.** Live October 16 Top Picks has
   0 baseline users but the first bar is full and labelled 100% cohort baseline.
   UpdatedHomeFunnel.tsx:102–111 assigns it unconditionally. Also, when a stage
   has known zero numerator but undefined prior-stage percentage, the count is
   displayed as N/A because it is gated by percentage availability (:134–136).
   [Chrome evidence](chrome-audit-empty-funnel.png).
4. **Home exits description uses the wrong observation unit.** The UI says
   share of Home visits, but SQL and manifest use distinct users with terminal
   checkpoints, grouped by access state/variant. One user may have multiple
   visits, so the description is not the implemented statistic. Sources:
   presentation.ts home_exit_without_interaction_rate and backend query:850–859.
5. **Active Home Time omits a required data-loss disclosure.** The manifest's
   nullTreatment explicitly requires disclosure of up to 15 seconds terminal
   loss; the rendered description and grouped mean have no such note. This is
   a presentation/contract gap, not evidence that the returned mean arithmetic
   is wrong.

Interpretation caution: Home accordion percentages and Retention headers are
explicitly unweighted averages across breakdowns/cohorts. Their arithmetic is
correct for that label, but they are not overall distinct-user rates. Do not
replace them with sums of user counts: users can overlap across access states
and composition cohorts. Home load attempts, in contrast, are deduplicated and
partitioned by breakdown, so their weighted summary is valid.
