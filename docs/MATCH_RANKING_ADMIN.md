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
- Mutations require an operator reason so backend audit records retain intent.
- Fixture override timestamps are entered and sent as UTC instants, and the end
  must be later than the start.
- Preview requires a date and IANA timezone. Its default timezone is `Etc/UTC`;
  operators may replace it when checking another calendar-day boundary.
- Preview output is read-only. Configuration changes affect ranking only after
  an explicit activation request succeeds.
