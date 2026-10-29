# Compact user portrait — 29 October 2026

User authority: the four supplied screenshots and request to make import coverage neutral, collapse content/access/timeline, clarify event counts, and investigate missing instrumented screens. Existing MUI surfaces, type scale and spacing are retained; no new domain metric or API contract.

## Changes and diagnosis

- BigQuery import coverage is secondary text with a neutral coverage chip. Unknown and zero remain distinct; actual stale-snapshot warnings remain.
- Content interactions starts collapsed with counts by content kind among the saved top 20 references. Expanded rows distinguish recorded events from unique views/preferences, use readable content kinds, and omit per-row Evidence reference disclosures. The list scrolls within 360px. Content names are absent from the saved API, so short IDs remain secondary identifiers (full IDs are available on hover).
- Access and app details starts collapsed with access, plan and platforms. The complete captured Store/access context stays inside; platform history scrolls within 320px and omits repeated “build unknown” text.
- Activity timeline starts collapsed with total source events, selected period and product actions. Expanded rows scroll within 520px; the existing server pagination stays available, displays a readable event range, and remains expanded across page changes.
- Instrumented screens preserves named-screen observations when present. If missing, it explains the gap and separately displays existing server aggregates for six explicit opening/view events; other interactions are excluded. These counts are explicitly not complete screen visits.

Read-only production diagnosis for the exact snapshot in the supplied screenshot (`e4cd75eb-ce40-4a9f-aa30-936ce5db4774`): the most frequent canonical event categories have zero `screen_name` values; this account has zero saved `user_portrait_source_events` rows. `home_viewed` properties include `screen_view_id` but no `screen_name`. The backend requires a nonempty screen name for its screen aggregate. The mobile generic screen logger sends screen views to Firebase; this canonical activity stream does not supply their names. No database or backend mutation was performed. Recovering historical missing screen names/imports is outside this UI fix.

## Visual proof

Real local Next.js route and current production components, with a GET-only local fixture API made from that saved snapshot. Account identity and source/content IDs were replaced with QA values; the real counts, source gaps and list lengths were retained. A synthetic local-only JWT cookie exercises the existing admin shell; this does not test live authentication or API transport. The existing port 4397 runtime was preserved. No production UI deployment is claimed.

Compared directly with the four user screenshots: neutral coverage, compact initial state, clear counters, bounded expanded lists and readable mobile layout all pass. Desktop actual CSS viewport 1867×927; mobile 390×844 (Chrome zoom accounted for through viewport override). No document-width overflow; tables scroll within their cards. Native details toggles work by mouse and Enter. Timeline Next events changed the visible range from 1–50 to 51–100 while remaining open.

| Criterion | Desktop | Mobile | Result |
|---|---|---|---|
| Neutral import coverage | [overview](overview-desktop.png) | same responsive text | Pass |
| Content initially collapsed | [collapsed](content-collapsed-desktop.png) | [collapsed](content-collapsed-mobile.png) | Pass |
| Content expanded and bounded | [expanded](content-expanded-desktop.png) | [expanded](content-expanded-mobile.png) | Pass |
| Missing screens explained; recorded opens available | [screens](screens-desktop.png) | [screens](screens-mobile.png) | Pass |
| Access/timeline initially collapsed with summaries | [collapsed](details-collapsed-desktop.png) | [collapsed](details-collapsed-mobile.png) | Pass |
| Access expanded | [access](access-expanded-desktop.png) | [access](access-expanded-mobile.png) | Pass |
| Timeline expanded, bounded and paginated | [timeline](timeline-expanded-desktop.png) | [timeline](timeline-expanded-mobile.png) | Pass |

## Validation

- `npm test -- --runInBand __tests__/portrait-screens.test.tsx __tests__/portrait-storefront-evidence.test.tsx __tests__/use-user-portrait.test.tsx`: 3 suites, 8 tests pass. Covers named screens, absent telemetry, exclusion of clicks from opening events, Store context and read lifecycle.
- `npm run typecheck`: pass.
- `npm run lint`: 0 errors, 4 existing hook warnings in unrelated dashboard/hooks.
- Production webpack build: pass in a task-owned source copy via `node node_modules/next/dist/bin/next build <task-build-copy> --webpack`, preserving the existing runtime's `.next` output. The copy was removed after success. The subsequent content-row change only moves its short ID to a secondary caption; targeted lint/typecheck and fresh desktop/mobile screenshots cover it.

Independent final Spec and Standards reviews both approved without blockers. Task-owned fixture API, dev server, source/build copies and local snapshot were removed after proof; temporary browser viewport was reset and the QA tab closed. Reviewer runtimes were archived and verified not loaded.
