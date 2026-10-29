# Personalization: design for existing logic only

> Implementation amendment, 29 October 2026: the owner subsequently authorized a
> real **Settings** tab with a persisted minimum interval, default **6 hours**.
> This replaces the earlier exclusion of settings/API changes for this one feature.
> The interval replaces old daily/weekly limits only for `portrait_decision`
> personalized contacts. Product/service Campaign rules remain unchanged; consent,
> deduplication and quiet windows remain enforced. Settings uses the existing admin
> authorization and shared UI components. Original raster concepts below predate
> this fourth horizontal tab; they continue to define the other three screens.
> Implementation contract and final proof: [PERSONALIZATION.md](../../PERSONALIZATION.md)
> and [UI-EVIDENCE.md](UI-EVIDENCE.md).


29 October 2026. Approved visual baseline. The owner subsequently authorized implementation in this chat; implementation and visual evidence are recorded in [UI-EVIDENCE.md](UI-EVIDENCE.md). This revision follows the owner's latest corrections: **English throughout; existing capabilities only; no additional Personalization password; standard shared-header Back to Users.** The explicitly requested gate removal is a scoped frontend access change; existing admin authentication/authorization stays in force. It replaces the earlier broader concept. The previous overview, portrait-status directory, global decision journal, settings, new permission projections and embedded financial unlock are removed from this deliverable.

## 1. Scope and navigation

Implement the approved existing read surfaces inside one Personalization section with horizontal tab navigation. Scope is the admin frontend and task-owned local verification only. Do not create issues, change the live pilot, push/deploy, migrate data, edit shared env, take over user-owned runtimes, run product-model calls, send messages or make payments.

The sidebar has exactly **one selected Personalization menu entry**, not a group with Users/Results children. Within that section, a persistent **horizontal tab bar** contains **Users · Saved decisions · Results**. This restores the owner's requested navigation hierarchy while retaining the existing-logic-only scope. Campaigns, Email Marketing and Revenue Ledger remain independent sidebar destinations. Overview and Settings tabs remain excluded because their required read contracts are outside this scope.

The single Personalization entry opens the existing `/dashboard/users` route. The common heading and tab bar are a proposed frontend presentation shell shared by the existing Users/portrait/results routes; no new backend or landing-page data source is needed. Mark Personalization active on all of these routes. Do not leave extra Users or Results sidebar entries in the proposed navigation.

Users contains the existing account list and canonical portrait. Saved decisions is **account-scoped**: enable it on a selected account's canonical portrait; otherwise show it disabled with “Select a user in Users”. It does not promise a global journal. Use a frontend-only `view=decisions` query on the same portrait URL to identify that tab; the Users tab returns to the portrait without that query. Preserve the selected snapshot/period within the portrait host and reset all account-scoped state on account change. Results uses the existing report URL; without selected-account context its Saved decisions tab remains disabled. No account picker or background history fan-out is added.

| Surface | Existing canonical route | Proposed presentation |
| --- | --- | --- |
| Users | `/dashboard/users` | Retain existing list, search, filters and row actions in the horizontal Users tab; do not add portrait-status filters |
| User portrait | `/dashboard/users/:userId/portrait` | Organize existing facts, quality, current-at-snapshot state and history on this same page. Retain Back to Users, Time in app and Chat |
| Saved decisions | Existing section inside User portrait | Present existing per-account history in the horizontal Saved decisions tab of the same portrait host. It remains the latest 20 evaluations, not a global or complete paginated journal |
| Results | `/dashboard/user-experiments` | Place Results in the horizontal Results tab below the common Personalization header. Keep the existing experiment selector, cutoff and full report, directly available under existing admin authorization without a second password |

All visible copy is English. “Technical checks” describes an existing technical protocol; “Comparative experiments” describes protocols with supported comparison definitions. These are labels derived from existing metadata, not new tabs, filters, state or an experiment creation tool.

## 2. Existing user journeys

1. **Inspect an account:** Users → existing Portrait action → same canonical page. Choose Last 7 days / Last 30 days and saved snapshot. Refresh view repeats existing read; it does not rebuild or analyze. Time in app and Chat preserve their destinations.
2. **Understand recorded behavior:** read snapshot identity/as-of/generated time, coverage and timezone basis first. View existing activity totals, daily observations, action-hour heatmap, action/screen tables, function/chat counts, correlated attempts and paid-window use. Current-at-snapshot access, pending commerce, favorites, saved picks, locale, geo and Store evidence remain distinct from the selected historical period. No missing observations become zero or conclusions about motivation.
3. **Inspect a saved decision:** open the horizontal Saved decisions tab for the selected account. Read selected kind/disposition, model or baseline source, reason, recorded channel versus proposed surface, validation fallback and stored copy. Expand existing exact evidence; compare its pinned snapshot and current-owner cutoff with the viewed portrait. Replay frozen validation uses the existing read route, never new generation or sending. No “send”, retry-execution, account selector, global search or editable candidate selector.
4. **Inspect results:** open Results tab directly under existing admin authorization → select saved experiment and reporting cutoff → refresh report. Follow existing assigned-account portrait links; inspect existing source/Delivery/transaction evidence. A product Campaign origin with null decision ID remains a product Campaign, not a missing AI decision.

## 3. Proof of existing support

Source read at admin `d2552be9` and backend `bd341874`. Other work may advance these revisions; re-check before implementation. Local source, closed issues or demonstration screenshots do not establish deployed readiness or current pilot state.

All HTTP paths below are relative to `/v1`.

| UI content/control | Existing owner/contract | Scope limit |
| --- | --- | --- |
| User search/list | `GET /user`, existing Users page | Retain only existing filters; no portrait directory or N+1 portrait-summary requests |
| Portrait, period, version, safe timeline | `GET /app-events/admin/engagement/portraits/:userId?days=7|30&snapshotId&offset` | Existing ready/not_ready/restricted response; saved immutable history; timeline pages of 50 |
| Activity and source quality | `PortraitResponse.selectedWindow`, comparison, snapshot.sourceWatermarks, freshness | Render supplied counts/statuses. No new aggregation service or unverified operational health badge |
| Product access/interests | snapshot.current, observedInterests, favorites, existing pricing evidence | Captured state, not a live admin permission check. Physical geo is not Store territory. Catalog and account quote remain different facts |
| Saved decisions | `GET .../portraits/:userId/decisions`; `PortraitDecisionHistory` | Latest 20. Existing history envelope says mode=shadow, dispatchEnabled=false; that is not evidence of actual delivery or globally enabled capability |
| Reason/versions/model | Existing PortraitShadowDecision fields already rendered by PortraitDecisionHistory | No invented reasons for rejected alternatives. The backend stores candidates, but this minimal redesign uses the existing selected decision and baseline presentation rather than extending the frontend candidate contract |
| Replay | `GET .../portraits/:userId/decisions/:decisionId/replay` | Existing frozen baseline/reference validation only |
| Results list/report | `GET .../experiments`; `GET .../experiments/:id/scorecard?cutoff=` | Existing UserExperimentScorecard, unchanged Measurement/Ledger arithmetic |
| Technical protocol | Existing persisted `technicalProtocol: single_account_ai.v1`, list/report types and current renderer | Use existing discriminator and comparison metadata; do not infer type from ID, account count or enabled flag |
| Actual Delivery evidence | Existing scorecard.traces | Display inside results only. Do not invent a new join into shadow history |
| Additional password (explicit removal) | Current results route wraps the report in RevenueLedgerAccessGate | Remove this wrapper from Personalization results only. Preserve ProtectedRoute, server JWT/admin allowlist and the separate Revenue Ledger page’s own gate. No replacement password or per-card unlock |

No new backend endpoint, persistence field, migration, model behavior, analytics calculation or user preference is required. Layout, the one-entry sidebar/horizontal-tab shell and the explicitly requested removal of the results-only extra-password wrapper are proposed frontend changes; the report already has server JWT/admin authorization.

## 4. Data and permission boundaries

Keep UserPortraitService and immutable snapshots as the portrait authority; no JSON column in users. Canonical account IDs and same-account versions remain enforced by existing backend owners. Account-only communication-preference endpoints must not be called as an administrator to impersonate the viewed user.

Do not add push/email switches or live permission panels. Existing decision evidence may show its captured effective email preference/revision, with its original meaning. Four push preferences belong only to push; Email Marketing remains the email owner. No Quiet Hours, Priority, Mute, per-day pause, Combine or digest. Verified processing objection remains the existing Support workflow: restricted snapshots/history are unavailable; no new objection or re-enable button is proposed on the portrait.

Existing server JWT/admin allowlist and admin-auth HTTP client remain. Portraits and per-user decisions keep their existing access, with no new ledger password requirement.

**No additional password for Personalization.** The owner explicitly removed the password-check screen. Show all Personalization tabs, including Results and its existing financial estimates, directly to an authorized admin. In the future implementation remove RevenueLedgerAccessGate only from the Personalization results composition; do not delete or relax ProtectedRoute, existing JWT/admin-allowlist checks, or the separate Revenue Ledger route's password gate. Do not change shared gate semantics globally. No password form, lock/unlock card, access-check loading state or password-error state belongs in these Personalization concepts. Normal admin sign-in, unauthorized denial and report loading/read errors remain. This is a documented change from the current source, not a claim that it has already shipped.

Finance remains explicitly estimated Store-adjusted revenue, not reconciled proceeds, tax/fees or payout. Keep applied commission/FX assumptions, missing data, cutoff/restatement, fixed all-assigned denominator including non-openers and zero purchasers, and cohort maturity. No automatic winner. Technical protocols remain nonrandomized checks without comparative conclusions.

## 5. Visual design and states

Use existing AdminShell, AdminPageHeader and MUI components. For the illustrated portrait, saved-decision and results views, use the existing AdminPageHeader with `title="Personalization"`, `backHref="/dashboard/users"`, `backLabel="Back to Users"`. Its small outlined ArrowBack button is the leftmost element before the title in the top Paper header; tabs sit below that header. Reuse the component's existing layout, typography, padding and divider, rather than drawing a custom back link or placing a second button inside the content. The root Users list does not need a self-referencing Back to Users action. Desktop sidebar remains 236px; existing mobile header is 55px and drawer breakpoint is 900px. Content uses #121212, cards #1a1a1a, sidebar #15181b, divider #333333, primary #5b4eff, text #f9fafb/#9ca3af and Geist-like typography. Retain 8/12px control/card radii. Use readable headings, short explanations and expandable technical evidence; do not substitute a new design system.

Concepts are cropped design views, not an instruction to delete existing portrait/report sections below the fold. Recompose existing content and preserve every existing field/control's meaning. Do not turn a sample count into a new metric.

Desktop target: 1440×1000. Narrow: 390×844, additionally 360px. Existing toolbar controls stack; metrics use one/two columns. Portrait and scorecard tables remain local horizontal scrollers when needed. The page itself must not overflow horizontally. Preserve keyboard focus, accessible labels and readable long references. The three section tabs remain horizontal on narrow screens with local tab-strip scrolling when needed; never replace them with sidebar children, a vertical list or a section dropdown. Keep an accessible active-tab indication. Account-dependent Saved decisions is disabled outside a selected portrait, including the Results view without a selected account.

| Existing state | Required presentation |
| --- | --- |
| Loading | Existing loading state, stable title; do not show previous account's data |
| Empty portrait/history/report | Use the existing distinct not-ready / no saved decisions / no saved cohorts copy. Opening does not start processing |
| Read error | Existing safe error and existing Retry/Refresh control for that surface; no new execution retry |
| Stale/partial | Show provided freshness/coverage, saved timestamp and unknowns. Do not claim all sources are live |
| Processing restricted | Existing verified-objection explanation; no derived snapshot/timeline/history or re-enable control |
| Results loading/read error | Use existing scorecard loading and safe read-error handling, with no extra password-check state |
| Unauthorized request | Preserve existing authentication/backend denial handling; no invented role-management screen |

Each generated image says “DESIGN CONCEPT • NOT A WORKING PRODUCT • SAMPLE DATA”. Values, account labels, model latency and timestamps are illustrative. Only metric/control names and meanings grounded in the table are allowed. See DESIGN.md and PROMPTS.md for final images and exact prompts.

## 6. Implementation sequence and acceptance

The owner authorized this implementation after approving the design. This is not a new ticket packet; no change to Parent #488 or its children is proposed.

1. **Reconfirm source mapping.** Check current owners, UI controls and responses against §3 after the concurrent pilot work. Remove any concept detail not backed by current data; do not fill a gap with a new API. Exit: each field/control maps to an existing source or presentation-only layout.
2. **Apply presentation changes in admin-panel only.** Replace the separate sidebar destinations with one Personalization entry, add the shared horizontal Users/Saved decisions/Results tab bar and recompose existing portrait/history/scorecard components. Reuse AdminPageHeader for the unified top back button; remove only the results-specific extra-password wrapper. Keep canonical route paths, backend request parameters, existing data controls and standard admin authorization. The frontend-only view query selects account-scoped history; Results is directly visible to authorized admins. Preserve the separate Revenue Ledger route and its own gate. Exit: no backend, schema, env or runtime change; no new cross-account list or preference mutation.
3. **Verify behavior and rendered UI.** Run relevant existing portrait/history/scorecard/access tests, admin lint/typecheck/build and applicable architectural gates from ADMIN_PANEL_ARCHITECTURE_CORE. Use fresh `$ui-evidence-proof` for desktop/narrow and the state matrix. Exit: all existing content/links/actions preserved; no invented dashboard/filters/settings, no model/send/enrollment effect from reads; Personalization has no additional password or unlock screen, standard JWT/admin denial still works, and the separate Revenue Ledger route retains its gate. The unified Back to Users appears exactly once, in the shared header before the title on each illustrated detail/report view. Verify tab selection/deep links, disabled history without an account, account-switch cleanup and preservation of selected snapshot/period. If implementation becomes substantial, use required independent Spec/Standards review before completion.

Proof must use known isolated fixtures or separately authorized read access; no production DB mutations or new live AI/send calls. Current source tests include `__tests__/use-user-portrait.test.tsx`, `portrait-decision-history.test.tsx`, `portrait-storefront-evidence.test.tsx` plus existing measurement/access tests. Respect active runtime ownership; do not restart another chat's app/IDE to capture UI. Concept images are not runtime proof.

## 7. Evidence references

Admin: `components/admin/AdminShell.tsx`, `AdminShell.module.css`, `lib/theme/mui-theme.ts`; `components/app-events-analytics/{UserPortrait,PortraitDecisionHistory,UserExperimentScorecard}.tsx`; `lib/api/{user-portrait,user-portrait-measurement}.ts`; `modules/revenue-ledger/RevenueLedgerAccessGate.tsx`; `lib/revenue-ledger-access.ts`; `app/api/revenue-ledger-access/route.ts`; existing portrait/results route files; `docs/ADMIN_PANEL_ARCHITECTURE_CORE.md` and repository AGENTS/execution-routing.

Backend: `src/user-engagement/{user-engagement.controller,user-portrait-decisions.service,user-portrait-decisions.repository,user-portrait-measurement.controller,user-portrait-measurement}.ts`; `src/user/user.controller.ts`; `docs/USER_PORTRAIT*.md` and repository AGENTS/execution-routing.

Read context: [Parent #488](https://github.com/M-Ivonin/tipsterBro-backend/issues/488), [#491](https://github.com/M-Ivonin/tipsterBro-backend/issues/491), [#492](https://github.com/M-Ivonin/tipsterBro-backend/issues/492), [#494](https://github.com/M-Ivonin/tipsterBro-backend/issues/494), [#495](https://github.com/M-Ivonin/tipsterBro-backend/issues/495). Existing source screenshots: `~/.codex/artifacts/user-portraits-488-2026-10-28/t09-pilot/web-known-desktop.png` and `~/.codex/artifacts/user-portraits-488-2026-10-29/prod-single-account-ai/scorecard-desktop.png`. Their fixture/technical evidence is not proof of a live experiment. No source personal-data packets or secrets are included in this deliverable.
