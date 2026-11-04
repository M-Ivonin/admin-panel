# Personalization database load

Reference: requested clear load/freshness monitoring on the existing page; existing English MUI admin conventions. No supplied mockup.

The protected `/dashboard/system-monitor` route, real dashboard, theme and sidebar ran from a task-owned source copy on localhost:3148. Only the copy's API origin pointed to a controlled synthetic fixture on3149; synthetic JWT/client state never authenticated to a real backend. Production source and auth were unchanged. The new panel matches the final workspace component.

Criteria: clear SQL execution seconds per minute, query/page/write rates, overdue counts, baseline progress, trend and history selection; no HTTP duration presented as database load; stale/unavailable data cannot appear healthy; desktop and390px layout without clipping. Screenshots were visually inspected.

- [Desktop](personalization-load/desktop.png): four aligned metrics and trend, existing spacing/theme.
- [Narrow390×844](personalization-load/narrow.png): two-column values, wrapped labels, no horizontal clipping.
- [High load](personalization-load/high-load.png): explicit problem and three-check Slack confirmation.
- [Warmup](personalization-load/warmup.png): no inferred SQL rate before comparable counters.
- [Completed baseline](personalization-load/idle-baseline.png): baseline readiness remains visible even for zero SQL activity.
- [Stale](personalization-load/stale.png): last-known values explicitly marked unverified.

Local fixtures prove UI states, not live monitoring delivery. Production API/source and Slack acceptance are verified during release separately. The load panel fetches up to100 recent samples, independently of the selected check's HTTP availability chart.


## Statement-counter stability follow-up — 4 November2026

The same real local route/theme/sidebar was checked using a new task-owned source
copy on3148 and controlled fixture on3149. Only the copy's API origin changed;
its synthetic UI session has no production access. Complete and partial states
were inspected at the default desktop size and a viewport override requesting
390px (effective CSS viewport354px at existing browser zoom). No horizontal overflow.

The panel distinguishes measurement errors from high SQL load, marks partial
values as lower bounds, shows interval/last complete time, and excludes partial
history from the trend. Existing dark MUI spacing and typography are preserved.
Screenshots: `/Users/serhiimytakii/.codex/visualizations/2026/11/04/01a19bd6-3993-7d93-99fc-9930e4f58a7b/load-stability/`.
Desktop and narrow top/values/footer were visually inspected after the final
component change; screenshot proof is local controlled data, not live provider proof.
