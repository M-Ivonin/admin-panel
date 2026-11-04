# Independent health cards — UI proof

2026-11-04. Reference: user-supplied Background processing screenshot and approved
replacement of its combined tile with Database load and Personalization health.
Retain the existing dark MUI theme, spacing, rounded borders and status dots.
Two compact tiles share a row on desktop, stack on narrow screens, and agree with
the two separate detailed panels. No other layout redesign requested.

Runtime: isolated copy of the actual Next app, frontend localhost:3198, synthetic
HTTP API localhost:3199. Only the disposable copy's ProtectedRoute was replaced
with a pass-through and its API origin changed. No credentials, shared backend,
production access or app source auth changes. The reviewed snapshot isolates this task’s changes from a concurrent visual
redesign in the primary worktree. Screenshots show the scoped snapshot to commit. Captured through Chrome; screenshot pixels differ
from CSS viewport due to existing browser zoom.

| Criteria / state | Evidence | Result |
| --- | --- | --- |
| Separate detailed panels, scoped metrics, healthy statuses | [desktop panels](desktop-panels.png) | Pass |
| Existing compact styling; two adjacent cards | [desktop cards](desktop-cards.png) | Pass |
| Database stays Healthy while personalization warns | [mixed cards](desktop-mixed-cards.png), [panels](desktop-work-warning.png) | Pass |
| Narrow database: wrapped heading/status, two-column metrics | [database](narrow-database.png) | Pass |
| Narrow personalization: readable warning and work counters | [personalization](narrow-personalization.png) | Pass |
| Independent menu entries and scoped historical statuses | [menu](separate-menu.png), [database history](database-history.png), [personalization history](personalization-history.png), [narrow menu](narrow-menu.png) | Pass |
| Narrow cards stack, visible independent statuses and keyboard focus | [cards](narrow-cards.png) | Pass |

Desktop captures: 1802×1096 pixels. Narrow viewport override: 390×844, measured
CSS viewport 354×767; document scroll width 341px, no horizontal overflow.
All screenshots inspected. No in-scope overlap or clipping. Tooltips and floating
development controls are existing local runtime overlays.

Focused regressions also cover database overload alone, simultaneous problems,
either measurement unavailable, overdue profiles, baseline learning, disabled,
warmup, partial lower bounds, stale/offline/interrupted coverage and a source
outage retaining historical portrait totals. Shared history remains selectable.
These are controlled fixtures, not claims about live production health.
