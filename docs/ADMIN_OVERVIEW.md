# Admin overview

`/dashboard` is the starting report for the admin application. The persistent
sidebar also serves the existing dashboard and support routes; on small screens
it opens from the navigation button and closes on navigation or Escape.

The overview follows the approved design: system status, then three growth/revenue
panels, two prediction/event panels, and three onboarding/marketing/attention
panels. Each headline appears inside its report, rather than being repeated in a
separate KPI row. Report arrows open the existing detailed pages.

## Reading the reports

The selected date and daily chart buckets use UTC. Headlines describe the selected
day; charts include that day and the preceding six days. The incomplete current
day is marked. Growth, revenue and event comparisons use yesterday at the same
cutoff rather than comparing a partial day to a complete day. A zero prior value
has no percentage comparison.

Registrations and initial paid purchases come from the backend overview read
model. Initial purchases are production, recorded, positive subscription starts,
not renewals, passes, sandbox transactions or manual grants. The purchase date is
the ledger recording date, matching Revenue Ledger's date filter.

The overview Revenue panel is visible only to `mykhailo@levantem.ai` and
`sergii.mytakii@levantem.ai`, using the current session identity. Other accounts
receive no revenue access-check or monetary-report requests from the overview;
registrations and subscriptions share the full top row equally. This is homepage
visibility; the detailed Revenue Ledger retains its existing access rules.

Revenue reuses Revenue Ledger's production-only USD summaries. It shows gross
after refunds before store fees; the second series is the backend estimate after
store fees. Missing amounts/rates suppress incomplete USD totals. The existing
Revenue Ledger unlock must succeed before any monetary request is made.

Prediction accuracy is the backend weighted score for fixtures in each UTC day,
not a win rate or confidence score. The canonical v9 summary is used when present.
ROI comes from that same summary. Unsettled results and failed historical reads
are chart gaps, not zero accuracy.

App Events requests only `sourceType=user` events, including screen opens and
user business actions; generated/system-state events are excluded by the canonical
backend source filter. The headline and comparison count that same user-event
population. Individual event types are sorted by descending frequency, with event
key as the tie-breaker. Every nonzero event type remains accessible in the
scrollable chart; there is no synthetic Other actions group. Event labels share
the detailed App Events report formatter. Onboarding
uses the existing started/completed-session report and its completion denominator.

Campaign open rates describe live deliveries sent on the selected date, opened
by the cutoff. Email click rates describe the delivered cohort, counting distinct,
exactly correlated product/full-analysis click deliveries. Incomplete link tracing
makes clicks/rates unavailable. Test deliveries and control rows are excluded.
The attention panel counts currently open support tickets and failed deliveries
for the selected day; the support count is current, not a historical snapshot.

## Access and unavailable data

The existing protected admin layout and backend authorization remain active.
Monitor capability is checked before reading monitor data. Expired heartbeat,
missing required checks and overdue results cannot produce an operational status.
Monitor and open support tickets always describe current conditions even when a
historical report date is selected.

Reports load independently. An unavailable report does not erase successful
reports or become a zero. Changing date or refreshing cancels prior requests;
late replies cannot overwrite the current selection. The comparison cutoff is
retained with the fetched snapshot; advancing the monitor freshness clock does
not change report windows or relabel an old snapshot as a completed day. Requests time out after
30 seconds. Refresh is manual; the freshness clock continues to invalidate old
monitor status without a fetch.

New read endpoints must be released with the backend before the new summary can
show growth and marketing data. No schema migration is required. Until then those
panels show their unavailable state.

Validation and reference captures: [UI evidence](./evidence/admin-overview/UI_EVIDENCE_REPORT.md).

## Home Analytics

Below the existing reports, Home Analytics shows four KPIs for the selected UTC
day and the same captured cutoff (today is partial). Each KPI links to its
corresponding detailed Home Analytics section:

- Full Access purchase conversion: verified-purchase users / offer-impression users.
- Free Pick activation: prediction-card-opened users / Home-viewed users.
- Paid Top Picks activation: Full-Analysis-opened users / paid-preview-impression users.
- Home load success: successful loads / settled load attempts, summed across
  the backend's disjoint variant/access-state breakdowns.

Funnel rates use first-to-last cohort counts, rather than the API's previous-step
percentages. Cohort counts are shown below each value. Missing stages/counts or
zero initial cohorts show N/A; observed zero conversions remain 0%. The existing
Home Analytics endpoint loads independently and shares overview cancellation,
request timeout, refresh and stale-response protection. No retention is shown for
a single-day overview. This does not change the detailed Home Analytics report.
