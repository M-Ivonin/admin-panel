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
