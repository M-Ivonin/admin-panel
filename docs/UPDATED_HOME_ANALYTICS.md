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

The four summary cards use the same `lib/home-analytics-summary.ts` calculation
as the admin Overview headlines and daily charts. Funnel summaries divide the
final-stage user count by the first-stage cohort count; Home load success divides
summed successes by summed settled attempts across the backend breakdowns. Both
surfaces use the same rounding (up to two decimal places). Missing cohorts remain
N/A; observed zero remains 0%. Detailed funnel stages still show previous-stage
rates and are explicitly labelled as such.

Overview report links carry exact UTC `from` and `to` timestamps. Valid linked
ranges initialize the date filters and preserve the exact `to` cutoff for the
initial API read, including a partial selected day. Direct sidebar navigation
keeps the normal default range. Invalid linked ranges fall back to that default.
Refreshing manually applies the visible dates as complete UTC-day bounds, so it
releases the linked snapshot cutoff. Export JSON retains the loaded API range.

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
