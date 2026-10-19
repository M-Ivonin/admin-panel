# Home Analytics retention

`/dashboard/updated-home-analytics` displays retention as collapsed accordions,
one per core action. The title uses the action's readable name, such as
“Prediction Card opened”, instead of repeating the retention metric name.

Each header shows D1, D7 and D30 separately. These are unweighted arithmetic
means of the backend cohort percentages for that action and return day in the
selected range. Zero participates in the mean; N/A does not. A day without
numeric observations remains N/A. Days and actions are never averaged together.
This is an average across cohorts, not a pooled user retention rate.

Expanding an action shows the original backend breakdown by cohort date and
return day, sorted by those dimensions. Values and units are preserved. API
responses and JSON exports remain unchanged.

## Summary KPIs and Overview links

The six summary cards live only on admin Overview, using
`lib/home-analytics-summary.ts` for headlines and seven daily chart points: Full Access purchase conversion, Free Pick
activation, Paid Top Picks activation, Collections purchase conversion, AI Chat
unlock conversion, and Pass-to-subscription conversion. Desktop Overview uses
three compact charts per row, two rows; tablet uses two columns and mobile one.
Compact cards reduce padding, title spacing and chart height while retaining
seven dates, percentage ticks, cohort counts and report links.
Home Analytics starts with the detailed Home section and has no duplicate Overview
summary or Overview section link. Home load success remains in Home quality.

Funnel summaries divide final-stage users by the first-stage cohort, independently
of previous-stage percentages. Every detailed funnel now shows that overall rate
and its numerator/denominator above the stage breakdown, explicitly identifying
stage rates as previous-stage rates. Known zero final users with a nonempty first
cohort yield 0% even if the preceding stage is empty. Unknown final counts and
empty first cohorts remain N/A. Pass conversion pools backend converted/expired
pass counts across product/country groups, not an arithmetic mean of percentages
or a claim of distinct users. Its link targets the existing Passes section.

Home Analytics defaults to the latest seven UTC dates, including today.
Overview keeps its current-day selection and uses that day plus the preceding six
UTC dates for Home Analytics headlines. Overview report links carry exact UTC
`from` and `to` timestamps, preserving the partial-day cutoff on first load and on
Refresh when the visible dates have not changed. Changing dates applies complete
UTC days. The report displays its exact cutoff; exports retain the loaded range.
Historical Overview dates should be opened through the metric/report link so the
same date and cutoff are used. Chart points are daily rates, not a seven-day
headline aggregate. Valid ranges are limited to 90 days.

## Statistical display rules

Verification latency P50, P95 and the primary value are displayed in seconds;
percentile column headers explicitly use `(s)`. Backend values and exports remain
in their original milliseconds.

An empty or unavailable funnel cohort has no full 100% baseline bar. Known stage
counts, including zero, stay visible independently of whether a previous-stage
percentage can be calculated. N/A percentages are not fabricated as zero.

The exit-without-interaction explanation describes distinct Home users with a
terminal checkpoint, matching the backend cohort rather than calling them visits.
Active Home Time discloses that up to 15 seconds of terminal activity may be lost.

Default-range verification (2026-10-19): focused range/dashboard/summary tests
passed (43 tests), as did lint (three existing unrelated warnings), production
build and typecheck. A fresh local production build at desktop 1440×1000 showed
October 13–19 on direct navigation and requested the same seven inclusive UTC
dates. Opening an explicit October 10 link preserved both dates and the exact
14:30:12.345 UTC cutoff. Browser proof used a synthetic localhost auth cookie
and an intercepted analytics response; it verifies local behavior, not PROD.
The rendered date controls matched the requested range and existing UI styling,
with no clipping or overlap in the affected area.
