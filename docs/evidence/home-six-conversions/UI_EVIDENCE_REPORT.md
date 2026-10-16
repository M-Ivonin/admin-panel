# Compact six-chart Home Analytics overview

Reference: user's request for six Conversion/Activation charts in two rows,
removing Home Load Success, followed by a request to reduce card height. Existing
Overview colors, typography, links and seven-day chart conventions retained.

Chrome inspection of the deployed old interface found same-range summary values
matching, but the selected-day overall funnel rate differed from the final
previous-stage rate (Full Access 0% overall versus final-stage N/A). Direct Home
Analytics navigation also defaulted to 15 calendar dates, while Overview showed
one day. The repair displays overall first-to-last conversion inside each funnel,
labels previous-stage rates, defaults Home Analytics to today UTC and preserves
linked cutoffs through unchanged-date Refresh.

Runtime proof uses the final production Next.js build at 127.0.0.1:3105 in Chrome,
with disposable synthetic local authentication. A localhost adapter invokes the
real backend service and SQL in an isolated PostgreSQL test database. Existing DB
fixtures were moved uniformly by 192 days (event/receipt timestamps, date-valued
properties, user first-seen and settlement times) to place their initial cohorts
in the Overview's supported October window. No production database was changed;
responses are calculated for each requested range, not replayed snapshots.
Unrelated Overview APIs intentionally return 503 in this narrow local harness.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Six charts, 3 columns by 2 rows on desktop | Pass | [Desktop](desktop.png), [section](desktop-cards.png) |
| Cards reduced from 268px to 204px (about 24%) | Pass | [Desktop](desktop-cards.png) |
| All seven dates, readable ticks and cohort count retained | Pass | [Desktop](desktop-cards.png) |
| Tablet 1024×900: two columns | Pass | [Tablet](tablet.png) |
| Mobile 390×844: one column, no document overflow | Pass | [Top](mobile-top.png), [bottom](mobile-bottom.png) |
| Six same-range values match both pages | Pass | [Detail summary](detail-summary.png), [DOM comparison](cutoff-check.json) |
| Overall rate identified inside detailed funnel | Pass | [Full Access](funnel-overall.png) |
| Linked partial cutoff retained after Refresh | Pass | [Before/after](cutoff-check.json) |
| Empty observations and daily gaps remain unavailable, observed zero remains zero | Pass | [Desktop](desktop-cards.png), focused regression tests |

Final screenshots were visually inspected. Desktop viewport is 1511×690. Cards
have no clipping or overlapping dates/ticks after the compact-axis adjustment.
The detail components were unchanged by the final Overview-only CSS adjustment.
Local Chrome proof is not a claim that this revision is deployed to production.

Validation: 11 focused Jest suites / 56 tests pass. Lint has zero errors and three
unchanged unrelated warnings. Final production build and typecheck pass. Tests
cover all six rates with nontrivial denominators, pooled pass rates, same-range
links, current-day defaults, cutoff preservation and overall-versus-step rates.
