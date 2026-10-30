# Personalization scenario switches — 30 October 2026

Target: the requested scenario on/off settings, using the existing English MUI
Personalization Settings conventions. No supplied mockup or approved deviations.
Preserve sidebar/tabs, dark Paper, typography, frequency and AI quota controls;
show all five titles, eligibility descriptions and labelled switches before them.

A separate production Next build (`next build --webpack`) ran on task-owned
127.0.0.1:4397. A fresh headless Chrome profile used the existing real Nest
`createPortraitFixture` on 4398 and isolated PostgreSQL container on 64469.
The synthetic admin cookie is accepted only by the fixture JWT/auth owner;
normal production authorization is separately covered by the HTTP tests.
The browser intercepted only the configured localhost:3001 settings URL and
forwarded it to the real fixture API. Other external requests were blocked.
No existing application runtime, shared data, model call or provider was used.

| Criterion | Result / fresh evidence |
| --- | --- |
| Five scenarios, shared UI conventions and preserved existing fields | Pass — [1440×1050 desktop](settings-desktop.png) |
| Labels/descriptions wrap, controls remain aligned, no horizontal overflow | Pass — [390×844](settings-390.png), [360×844 all off](settings-all-off-360.png) |
| Explicit save; real PATCH/SQL readback; reload persists; all-off | Pass — [request receipt](receipt.json), narrow screenshots |
| Real concurrent revision rejection; visible error and Reload recovery | Pass — [360×844 conflict](settings-conflict-360.png), receipt |
| No browser page errors | Pass — browser assertions |

All captures were inspected against the request and existing Settings conventions:
readable labels, distinct switch states, no clipping/overlap/overflow in the changed
content, preserved navigation, frequency and AI controls. No visual deviations.

Validation:

- Admin focused settings suite: 5/5 pass. Typecheck and lint pass (four existing
  unrelated hook warnings). Isolated production build passes.
- Full admin suite: 93/94 suites, 764/766 tests pass. The two navigation failures
  expect `No saved shadow decisions yet` in portrait account history. Both also
  reproduce after restoring all changed product files to `22e040c` in the isolated
  copy; this task does not change portrait/history or its tests.
- Backend settings/decision/delivery integration: 43/43 pass against isolated SQL.
  Scenario/AI migration tests: 2/2 pass. Portrait/candidate tests: 16/16 pass.
  Build/typecheck and targeted ESLint pass.
- No push or production deploy/migration. Required release order remains migration
  1793368800000, updated backend, then updated admin.

## Existing local applications — owner-requested verification

The owner separately authorized restarting the existing applications and applying
migration 1793368800000 to shared DEV after we established that the locally running
backend uses DEV Supabase. Only that migration was applied, transactionally with
its TypeORM history row; prior settings and audit fields were preserved.

The actual existing app origins, localhost:3000 / localhost:3001, were tested through
the normal browser UI and authenticated API, with no interception or fixtures.
All five switches were turned off, saved, read back from PostgreSQL and reloaded.
All five were then restored enabled, saved and reloaded. Contact interval 6 hours,
AI quotas 4/user/24h and 200/server/day remained unchanged. Final disabled list is
empty; revision advances naturally to 3 for the two explicit saves.

- [All-off after reload](local-all-off.png)
- [Final restored local screen](local-restored.png)
- [Local API/SQL verification receipt](local-receipt.json)

Both local applications remain running with their prior startup configuration;
the user-owned Android session is untouched. No model/send action was triggered
by this settings check. Fresh local screenshots were inspected: shared navigation,
all five labelled controls and saved final state match the requested behavior.

Independent read-only Spec and Standards review both approved the complete result
with no blockers. Broader email/numeric-price/current-operation tests added 69
passing cases. The extra checkout-origin suite has eight setup failures dropping
commerce_purchase_operations because another FK still depends on it; this is
outside scenario selection/settings. The same eight setup failures reproduce
on the unchanged backend baseline e2f9d1d9 in a separate source copy.

