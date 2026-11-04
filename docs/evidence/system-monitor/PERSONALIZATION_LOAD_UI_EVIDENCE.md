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
