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

## Operator contracts

- Team prominence is restricted to the backend-accepted values `0`, `10`, and
  `20`. The form presents only those choices.
- Team prominence selection searches the complete SportMonks team catalog by
  team name instead of requiring provider IDs. Country scope uses the searchable
  ISO country list; an empty country remains global.
- Existing prominence records use the same table-style presentation as the
  competition catalog, with the SportMonks team name as the primary label and
  the provider ID retained as secondary reference data.
- Mutations require an operator reason so backend audit records retain intent.
- Fixture override timestamps are entered and sent as UTC instants, and the end
  must be later than the start.
- Fixture overrides search the synchronized match catalog by home team, away
  team, or league name; the selected result supplies the provider fixture ID.
  Country scope uses the same searchable ISO country list as team prominence.
- Existing fixture overrides use the same table-style presentation, with the
  home-versus-away match title as the primary label and fixture ID as secondary
  reference data.
- Preview requires a date and IANA timezone. Its default timezone is `Etc/UTC`;
  operators may replace it when checking another calendar-day boundary.
- Preview output is read-only. Configuration changes affect ranking only after
  an explicit activation request succeeds.
