# Weekly Home Analytics charts

Reference: existing Overview styling and the preceding four-KPI row.
User request: add weekly charts, then explicitly keep four small graphs in one
row. Final criteria: one compact desktop row, daily UTC history for selected day
and preceding six days, existing headlines/counts/links retained, missing days as
gaps and observed zero preserved, partial selected day marked.

Runtime: final production Next.js build at 127.0.0.1:3105, real protected
`/dashboard` route, disposable synthetic local session and intercepted API
fixtures with varying daily cohort counts. No live metrics or deployed acceptance
is claimed. Browser time fixed at 2026-10-16 14:30 UTC.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Four compact graphs in one desktop row | Pass | [Desktop block](home-healthy.png), [full page](desktop-healthy.png) |
| Daily dates, original headline/counts and links | Pass | [Desktop block](home-healthy.png) |
| Partial day has light last-point outline and caption | Pass | [Desktop block](home-healthy.png) |
| Tablet two columns at 1024×900 | Pass | [Tablet](home-tablet.png) |
| Mobile single column at width 390 | Pass | [Mobile](home-mobile.png) |
| Missing observations remain N/A and empty charts | Pass | [Empty](home-empty.png) |
| Historical failure is a gap; zero is still plotted | Pass | [Gap](home-gaps.png) |
| Selected-day source failure isolated from other reports | Pass | [Error](home-partial-error.png) |

Desktop viewport 1536×1024. Section crops were inspected for all states. Mobile
section capture uses 390×1600 to include the entire block without a fixed header
overlay; regular mobile navigation is also exercised at 390×844. Browser checks
confirm four desktop cards share the same top coordinate and each is 294×268px,
with no document horizontal overflow or page errors in any recorded scenario.

Validation: 9 affected Jest suites / 49 tests passed. Final lint has zero errors
and three unchanged warnings in unrelated dashboards. Build, typecheck and
`git diff --check` pass. Spec and Standards review inspect the final compact row.
