# Separate store catalogs — 2026-10-13

Reference: approved dependency map and request to split Google Play and App Store
with English labels, preserving the existing admin theme and interactions.

| Criterion | Result | Artifact |
| --- | --- | --- |
| Separate Google Play/App Store nodes; four auth-dependent branches; unchanged native theme | Pass | [Desktop, 1440×1000](check-map/store-catalogs-desktop.jpg) |
| Both English names readable; vertical branches; no document overflow (390px width and scrollWidth) | Pass | [Narrow, 390×844](check-map/store-catalogs-narrow.jpg) |
| App Store click selects backend.catalog.app_store and opens its exact preview run | Pass | [Details](check-map/store-catalogs-details.jpg) |

Proof used the existing side-owned isolated production Next build on localhost:3132
and synthetic responses/authentication on localhost:3133. No production calls or
credential changes. Screenshots were inspected; layout, labels and interactions
match the approved change. The source copy includes the current dashboard changes;
subsequent map formatting only changed whitespace.

Observable runtime proof: monitor test first failed because App Store had no
independent result; now Google Play can pass while App Store returns 503, and
App Store can recover while Google Play fails for the wrong product store.
History and Slack outbox names remain specific to each store. All 72 monitor
checks, 27 backend HTTP tests and 20 admin dashboard tests passed. Monitor/admin
typechecks, backend build, isolated production Next build, and targeted admin
ESLint passed.

Existing backend.catalog is retained as Google Play to preserve production
history. Older Google Play manifests load with the new App Store check disabled;
its required status remains unavailable until the installed manifest is updated.
The committed production manifest enables both, each on a five-minute schedule,
with the same 15-second deadline and auth/health dependencies. No extra AI request.
Rollout order: backend history allowlist, monitor code/installed manifest, admin.
Independent Spec/Standards review remains pending: side-conversation instructions
prohibit subagents. No staging, commit, push, or production deployment in this turn.
