# Lightweight monitor UI evidence

2026-11-04. Reference: existing System Monitor MUI theme/layout and approved split
between whole-database SQL counters and personalization health. No supplied mockup.

Runtime: isolated copy of the actual Next application, ports 3148/3149; controlled
HTTP fixture, existing synthetic local UI session. No production auth bypass.
Desktop uses the existing browser viewport; narrow override 390×844 (browser zoom
produces a 354 CSS-pixel viewport). Document width 341px, no horizontal overflow.

- [Desktop](light-monitor/desktop.png): PASS — separate headings, four aligned
  metrics per section, readable scope and units, existing theme/sidebar preserved.
- [Work warning](light-monitor/work-errors.png): PASS — refresh errors and source
  fallbacks shown independently from complete database measurements.
- [Narrow](light-monitor/narrow.png) and [lower card](light-monitor/narrow-work.png):
  PASS — two-column metrics, wrapping labels, no clipping/overlap/overflow.
- [Partial interval](light-monitor/partial.png): PASS — partial/unavailable states preserve last-known timing, avoid healthy-zero SQL
  rates and distinguish unknown measurements from overload; focused DOM tests also
  cover legacy scope exclusion and warmup.

Local fixtures are illustrative; production health is verified separately after
ordered backend/worker/admin rollout.

Repair proof: [stalled reconciliation](light-monitor/job-stale.png) now shows
Reconciliation overdue, never Current. Completed-run count is visible in the
interval sentence on desktop and narrow layout.
