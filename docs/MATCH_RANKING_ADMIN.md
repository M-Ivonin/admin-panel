# Match Ranking Admin

## Surface and ownership

The protected `/dashboard/match-ranking` screen is the operator surface for
backend-owned match-ranking inputs. It calls `/admin/match-ranking/*`; the Admin
panel does not calculate mobile ranking locally.

The tabs expose these operations:

- review competition catalog metadata;
- upsert global or country-scoped team prominence;
- create, edit, and delete time-bounded fixture overrides;
- create and activate versioned ranking configurations;
- preview Top Matches and league groups with score-component explanations;
- inspect the ranking audit trail.

The page header includes a plain-language overview of the complete ranking
flow. A separate help control beside the tabs follows the active tab and opens
its operator guide for purpose, expected workflow, fields, and cautions. These
guides are intentionally non-technical and do not replace the detailed
operator contracts below.

## Operator contracts

- The Competition Catalog defaults to SportMonks. Use Catalog source to include
  Legacy rows. `Ready for review` means provider metadata was fetched;
  `Reviewed` means an operator accepted it.
- `Waiting for enrichment` and `Unavailable in SportMonks` remain visible as
  provider states. Manual ranking review never restores provider access.
- Team prominence is restricted to the backend-accepted values `0`, `10`, and
  `20`. The form presents only those choices.
- Team prominence selection searches the complete SportMonks team catalog by
  team name instead of requiring provider IDs. Scope is a searchable
  multi-select of ISO countries and the Europe, North America, and South
  America regions; regions expand to their member country codes and duplicate
  countries are saved only once in one transactional backend request. An empty
  selection remains global.
- Existing prominence records use the same table-style presentation as the
  competition catalog, with the SportMonks team name as the primary label and
  the provider ID retained as secondary reference data.
- Mutations require an operator reason so backend audit records retain intent.
- Fixture override timestamps are entered and sent as UTC instants, and the end
  must be later than the start.
- Fixture overrides search the synchronized match catalog by home team, away
  team, away team, league name, or fixture ID. When the local catalog has no
  match, the backend searches current and upcoming SportMonks fixtures and
  stores matching results. The selected result supplies the provider fixture
  ID. Search is delayed briefly while typing and distinguishes loading, empty,
  and retryable provider-error states.
  Country scope uses the same searchable country and region multi-select as
  team prominence and saves all expanded countries atomically.
- Compact English help controls in both dialogs explain scope behavior, review
  reminders, fixture actions, pin priority, and UTC activation windows.
- Existing fixture overrides use the same table-style presentation, with the
  home-versus-away match title as the primary label and fixture ID as secondary
  reference data.
- Preview requires a date and IANA timezone. Its default timezone is `Etc/UTC`;
  operators may replace it when checking another calendar-day boundary.
- Preview output is read-only. Configuration changes affect ranking only after
  an explicit activation request succeeds.

## Legacy competitions

Use **Catalog source** to switch between **SportMonks** (default), **Legacy**,
and **All sources**. Legacy rows carry a Legacy badge, old ID and link status.
Provider access loss is shown as **Unavailable in SportMonks**, never Legacy.

**Manage link** opens the old identity and its favorite/channel/team reference
counts. **Find SportMonks league** is prefilled with the Legacy name and searches
automatically after a short typing pause. The imported catalog is searched first;
when it has no matches, the provider is searched automatically. Name and numeric
ID searches share this field. Loading, no-match and retryable error states are
explicit; older responses cannot replace a newer query or selection.

Verify both names, countries and IDs, enter a reason and select **Confirm link**.
An existing SportMonks row is reused and keeps its ranking settings. No duplicate
provider league or copied ranking configuration is created. The Legacy row remains
an alias for old references, not an independent ranking input. Linked Legacy records
expose **Edit shared ranking** for editing the canonical record. Reassignment is deliberately rejected;
repeating the same link is safe. Legacy records cannot be bulk-approved or
edited as independent ranking inputs.
