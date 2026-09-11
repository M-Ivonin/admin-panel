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
- Preview country is a searchable single-country dropdown reused from the
  shared country scopes. Country region filters it by Europe, North America,
  or South America; a region requires selecting a country because rankings
  can differ within the same region. Changing to a region that excludes the
  selected country clears that country. All regions with no country means Global.
- Preview user is an optional email autocomplete backed by the existing paginated
  user search (two characters minimum, 25 results, 300 ms delay). Stale search
  responses are ignored; failed searches can be retried by editing the query.
  Choosing an account uses its current saved ranking country and canonical
  followed teams/leagues, and seeds the timezone field from its profile. The
  saved country and its shared region are displayed immediately; countries outside
  the three region presets show Outside listed regions, and missing country shows
  Unknown with Global fallback. A completed preview refreshes these displays from
  the country actually used by the server. Date and timezone remain editable.
  Manual country and region are disabled
  while a user is selected; clearing the user restores manual country mode.
  At desktop widths (1200px and above), user, date, timezone, region, country and
  Run preview share one row; smaller screens use a responsive grid.
- User preview respects the same country rollout and experiment assignment as
  Matches. Control users see ordinary league ordering and no Top Matches;
  their scores are absent rather than zero. The response identifies the user,
  actual ranking country (unknown means Global fallback), and assignment. It
  recalculates the selected day without reading or changing the phone's existing
  ranking snapshot. It does not reproduce phone search/Following/Live filters.
- Preview uses the active configuration; it cannot preview an inactive
  configuration. Without a user, country preview still has no user follows. The selected timezone determines the calendar-day
  boundary, while displayed kickoff timestamps use the browser's local timezone.
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

## Competition geography and market priority

Country code remains the competition's own country, never its audience. Country,
confederation and scope show Automatic or Manual provenance. Editing a field
sets its manual value; **Use automatic** restores the latest synchronized value.
Saving another field leaves geography untouched. Confederation offers the six
football confederations or an empty value for unknown/not applicable.

**Priority by user country** accepts multiple countries and the same region
shortcuts as Team prominence. Regions expand to an explicitly displayed country
list; only country codes are saved. Each row has an integer adjustment from
−20 to +20. A country may have only one value: equal overlaps are deduplicated,
conflicting overlaps must be corrected, and empty audiences are rejected.
Removing all rows restores automatic priority. Reopening groups saved countries
with the same adjustment, independently of how they were originally selected.

The adjustment applies to users' ranking country in All Matches and Top Matches,
on top of the automatic geographic bonus. No configured/known country means zero
adjustment. Preview exposes the separate `R` component and the backend's final
scores. The existing review reason covers these changes in the ranking audit.

## Weights & formula

The separate **Weights & formula** tab loads current defaults from the protected
`GET /admin/match-ranking/rule-defaults` endpoint and overlays the selected
configuration, initially the active version. Numeric dropdowns cover category,
country, team, stage, timing, selection, league order and personal-interest
rules. Each field has a question-mark help button and shows its server default.
Personal interest has an explicit enable switch; its weights remain editable
while disabled.

The formula card explains importance, Top score, league order, threshold,
interest, pin/exclusion precedence, competition-cap relaxation and stable
snapshot ordering. Competition-specific country priority R stays in the
Competition catalog; team classification stays in Team prominence.

**Save draft** requires a new version and reason, validates finite numbers,
integer limits and interest windows, and creates an inactive configuration
through the existing audited API. It preserves the base audience, country
allowlist, experiment ID, salt and stage mappings. **Activate saved version**
opens the existing activation dialog. Saving alone does not apply weights.
When no configuration exists, defaults are shown; create the initial audience
configuration in Configurations first. A defaults-fetch error offers Retry;
a failed save retains the entered values.

All numeric weights are selected from dropdowns; there is no free numeric input.
Lists include preset choices plus valid stored/default values, so an existing
custom fractional weight is preserved. Top/per-competition limits offer 1–20;
interest day choices follow the current window. Reducing the history window
reduces recent/minimum days only if needed to remain within backend boundaries.
Server validation remains authoritative for configuration writes.

Configurations use compact version cards with status, audience, countries and
creation/activation dates. The Activate action remains at the top of an inactive
card. Saved rules are collapsed by default under **View saved rules**; expanded
content scrolls within a bounded area instead of stretching the card/button.
