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

Six summary cards share `lib/home-analytics-summary.ts` with the admin Overview
headlines and seven daily chart points: Full Access purchase conversion, Free Pick
activation, Paid Top Picks activation, Collections purchase conversion, AI Chat
unlock conversion, and Pass-to-subscription conversion. Desktop Overview uses
three compact charts per row, two rows; tablet uses two columns and mobile one.
Compact cards reduce padding, title spacing and chart height while retaining
seven dates, percentage ticks, cohort counts and report links.
Home load success remains in Home quality and is no longer an Overview chart.

Funnel summaries divide final-stage users by the first-stage cohort, independently
of previous-stage percentages. Every detailed funnel now shows that overall rate
and its numerator/denominator above the stage breakdown, explicitly identifying
stage rates as previous-stage rates. Known zero final users with a nonempty first
cohort yield 0% even if the preceding stage is empty. Unknown final counts and
empty first cohorts remain N/A. Pass conversion pools backend converted/expired
pass counts across product/country groups, not an arithmetic mean of percentages
or a claim of distinct users. Its link targets the existing Passes section.

Both pages default to the current UTC day. Overview report links carry exact UTC
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
