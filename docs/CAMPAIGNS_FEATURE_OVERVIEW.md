# Campaigns operator contract

Reviewed against local admin-panel and backend sources: 2026-10-15.
This document preserves operator rules and product decisions. Local code review
establishes implementation behavior, not deployment or device acceptance.

## Ownership and scope

The admin panel owns campaign definition and operator workflow. The backend
owns validation, recipient eligibility, planning, delivery, attribution, rewards,
and metrics. The mobile app supplies supported display, navigation, and response
events. An accepted draft or test does not prove the complete live journey.

Campaigns support Push, In-App, and Hybrid. Hybrid channel selection happens at
execution time in the backend. Target Apps constrain compatible locales, events,
goals, and navigation; a capability available for one app is not automatically
available for another. Use the backend catalog and compatibility errors rather
than a copied list of options. Email publications have a separate authoring and
runtime contract: see [Email Marketing](./EMAIL_MARKETING_ADMIN.md).

The [backend contract](../../tipsterBro-bakend/docs/CAMPAIGNS_ADMIN_BACKEND.md)
owns runtime invariants, security, export privacy, and verification procedures.
Current API shapes, catalogs, defaults, and numeric bounds belong in code.

## Goal, action, and reward are separate decisions

- The human-readable campaign goal (`goal` in the editor, `goalText` in storage)
  describes intent; it does not measure success.
- The single optional `goalDefinition` selects a backend-supported success event
  and attribution mode. It drives success reporting, mandatory goal suppression,
  and stopping later journey steps. Navigation does not infer or change it.
- Step actions determine what happens after a tap. Selecting a navigation target,
  trigger event, or Send Guard does not confer Goal capability on that event.
- Without a tracked goal, the editor warns that success, goal suppression, and
  stop-on-goal are unavailable. This warning alone does not block save, test, or
  scheduling. CTR remains available after traced opens.
- Goal reward points are optional; zero means no reward. A positive reward is
  credited once for the eligible campaign journey through the points ledger.
  Goal and reward promises are snapshotted on deliveries; later edits must not
  change an already-sent offer.
- Global lifecycle goals and trace-required response goals have different
  attribution rules. For trace-required goals, a generic action without the
  matching recipient/delivery trace is insufficient.
- Reward validity is delivery-owned and bounded. An In-App expiry can shorten
  the claim window, not extend its global cap. Offer suppression, accepted event
  ingestion, and a fulfilled points credit are different outcomes.
- Duplicate callbacks must not generate another credit or confirmation. The app
  shows a reward celebration only from the backend confirmation; see the
  [reward confirmation contract](../../tipsterBro-bakend/docs/POINTS_REWARD_CONFIRMATION_CONTRACT.md).

## Authoring and templates

1. Configure the audience, Target Apps, goal, and optional reward.
2. Choose entry trigger and journey timing.
3. Review every step's localized content and tap behavior.
4. Save, send a targeted test, then explicitly confirm live scheduling.

Saving is explicit. Send Test and Schedule save changes first when needed.
Warnings require operator review even when they are not blocking errors.
Missing content for any selected locale blocks scheduling; warning-level
content is allowed. Unselected locales do not create missing-content blockers.
A missing first-name fallback is a warning, not proof of adequate copy.

Applying a template replaces the campaign definition, including audience,
trigger, journey, and content. Review the resulting draft before saving or
running it. The editor exposes deletion for saved templates, not shipped ones.
It also supports editing catalog templates, which is different from
creating a new template from a template-derived campaign.

Template provenance is not audience eligibility. It prevents saving a derived
campaign as a new template and prevents scheduling a second live campaign from
the same template. Audience criteria and suppressions still determine recipients.
The backend supports saved segments, but the current editor does not expose a
saved-segment picker or Save Segment action. These remain surface limitations,
not promises of scheduled work.

## Audience estimates and delivery safety

Select retention stages or explicit users, plus the intended locales and apps.
Explicit user targeting does not bypass backend reachability or live guards.
Pre-registration audiences remain distinct from ordinary registered-user stages.
The displayed audience estimate is a saved snapshot, not guaranteed delivery
reach; it does not simulate every goal or send-time check. Locale grouping uses
ES/PT families and an English default bucket for other or empty user languages,
subject to Target App compatibility.

Keep these protections distinct:

| Protection | Meaning |
| --- | --- |
| Exclude users without push opens | Requires a prior live campaign open; the current campaign is excluded from that historical-open check. |
| Re-entry cooldown | State/event journey re-entry is campaign-scoped and counts already-materialized journeys, including pending and terminal rows. It does not cancel later steps in the same journey. |
| Event send limit | Caps live sends for this campaign and user. Omitted uses the backend default (currently three); zero explicitly removes this cap. |
| Frequency cap | Minimum gap after a live send across campaigns, rather than a per-campaign re-entry rule. |
| Send Guard | One selected action since journey start can skip that step at execution time. It does not alter planning or automatically stop the journey. |
| Goal suppression | Mandatory when a tracked goal exists; checked during planning and again before send. A reached goal stops later steps. |

Audience and guards are rechecked before live execution because a pending row
can become stale. Send Guards run after goal checks. The editor supports one
guard per step, without OR expressions or property conditions. Tests bypass
selected live guards and must not be used to infer final audience reach.

## Entry, timing, and journey boundaries

- State-based campaigns admit matching users; continuous and single-wave modes
  have different entry intent. Review a configured delivery cutoff as part of
  the launch, since expired live work is finalized rather than left pending.
- Event-based campaigns enter from the selected backend event/producer pair.
  Hidden but still-supported legacy selections may load with a warning; this
  does not make them available for new selection. Entry events cannot be the
  same event as the selected tracked goal. A consumed source event is not
  automatically replayed because a delivery failed or was skipped.
- Recurring campaigns use a local calendar start date and a daily/weekly local
  schedule. The default occurrence count is one; increasing it repeats the
  **whole journey**, not just the first message. Legacy definitions without an
  explicit start date use their persisted runtime anchor.
- Scheduling can activate runtime immediately for state/event campaigns. A
  recurring schedule may wait for its future entry time. The overview's next
  evaluation is not a guaranteed common send instant across recipients.
- A finite recurring campaign with no reachable future first-step sends is
  rejected rather than silently accepted as a useful future campaign.

The first step anchors to the trigger; later steps anchor to the previous step.
Only the executable head is planned initially; follow-up steps advance in order.
A failed or skipped step does not by itself stop the journey. Goal attainment,
archive, superseded definitions, and other stop conditions are separate checks.

Delays, next-day-same-local-time, and send windows use the recipient timezone.
Unsupported or missing timezone input falls back to UTC. Before-window times
move to window start; after-window times move to the next local window;
overnight windows are supported. On spring-forward gaps, timing moves to the
next valid local minute; an ambiguous fall-back minute uses the earliest valid
UTC instant. If execution misses a window, the occurrence is requeued and
follow-up timing shifts rather than sending outside the window.

## Editing, pausing, resuming, and archiving

- A saved update increments the definition version. Already-planned rows are
  not rewritten; older queued definitions are skipped as `superseded`.
- Pause stops new planning and claiming pending live deliveries. It is not a
  recall of notifications already sent or work already claimed.
- Resume uses the same explicit live-planning confirmation as Schedule and the
  current persisted definition. Review changes before confirming it.
- Archive stops new work. Queued rows that reach execution are skipped, and
  archived campaigns do not pay campaign rewards. Archive is not a pause that
  can later be resumed through scheduling.

## Test sends and live acceptance

Send Test executes only the first journey step. The dialog accepts user IDs,
emails, or analytics device keys; if none resolve, the backend may fall back to
the authenticated admin. Inspect warnings and verify the actual recipient.
Choose the test Target App; Hybrid tests require an explicit Push or In-App
channel, so one test does not exercise both branches.

Tests use traced deliveries and the canonical rendering/reward path, including
trace-required response rewards. They can therefore have real notification and
points effects. They bypass selected live eligibility, cap, and Send Guard
checks, and do not prove recurrence, follow-up timing, or live suppression.
A successful API response alone does not prove that the intended app displayed,
opened, navigated, or confirmed a reward.

Before confirming a launch, review the saved definition, intended recipients,
selected-locale copy, Target App compatibility, occurrence count/cutoff, and
reward promise. Verify the intended app's test delivery and response path;
separately verify live journey behavior in an authorized environment.

## Reporting and interpretation

- Campaign opens/CTR use traced app-open events, not a generic provider open
  callback. A successful send does not set the open timestamp.
- Tracked-goal reporting uses eligible journey outcomes; CTR and goal rate are
  different measures. Neither free-text intent nor a tap proves conversion.
- Overview KPI cards cover the backend aggregate universe, independently of
  the current list filters. Row summaries and saved audience estimates are not
  substitutes for the complete audience definition or current reach.
- Per-campaign JSON exports use the selected statistics period and exclude
  user-level identities and raw deliveries. Source events suppressed before a
  delivery exists cannot be attributed to a definition version by persisted data.
- Export All uses that period across every page, including archived campaigns,
  and ignores list filters. It downloads no partial file if a request fails.

## Source owners and maintenance

Use these entry points instead of maintaining endpoint, schema, template, token,
or source-event inventories here:

- [Editor](../components/campaigns/CampaignEditorPage.tsx) and
  [action/readiness rules](../modules/campaigns/selectors.ts).
- [Overview and exports](../components/campaigns/CampaignsOverviewPage.tsx).
- [Backend authoring and lifecycle](../../tipsterBro-bakend/src/campaigns/services/campaigns-admin.service.ts).
- [Send decisions](../../tipsterBro-bakend/src/campaigns/services/campaign-delivery-decision.service.ts),
  [runtime facts](../../tipsterBro-bakend/src/campaigns/services/campaign-fact-evaluation.service.ts), and
  [local timing](../../tipsterBro-bakend/src/campaigns/services/campaign-journey-timing.service.ts).

Review this contract when editor capabilities, template policy, audience safety,
entry/timing rules, lifecycle, attribution, reward promises, or reporting scope
change. Keep unfinished implementation work in owning GitHub Issues; the known
saved-segment UI limitation above does not establish a delivery commitment.
