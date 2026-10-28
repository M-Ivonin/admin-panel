# Portrait decision view — 28 October 2026

Scope: the saved shadow-decision section of the Users portrait for backend #492,
under Parent #488 v6. No independent design was supplied; the comparison uses
the existing MUI portrait typography, dark theme, section and alert conventions.

The production admin runtime displayed the actual protected HTTP decision
`03584db8-f66b-4ebf-8cd0-e7bd545d0066` for the isolated real-source profile. It
showed the accepted model deferral, its pinned snapshot, seven-day window,
current-owner cutoff, controlled reason, locale/template/policy/model/validator
versions, provider usage and disabled exposure separately from the currently
viewed portrait. Expanding exact evidence and replaying frozen validation kept
the same record and returned the visible read-only success message.

| View/state | Artifact | Result |
| --- | --- | --- |
| 1,440×1,000 saved decision and expanded exact evidence | `ui/desktop-decision.png` | Pass: readable section, chips, reference and version wrapping |
| 1,440×1,000 replay success | `ui/desktop-replay.png` | Pass: explicit no-model/no-action confirmation |
| 390×844 decision summary | `ui/narrow-390-decision.png` | Pass: responsive layout, no clipped chips/text |
| 390×844 exact evidence/replay control | `ui/narrow-390-evidence.png` | Pass: long references wrap; document width375px within390px viewport |

The four images were freshly captured from the running app and visually
inspected. They are retained under
`/Users/serhiimytakii/.codex/artifacts/user-portraits-488-2026-10-28/t06-shadow/`.
Empty/error/read-recovery and late foreign-account-response states are covered
by `__tests__/portrait-decision-history.test.tsx`; the existing portrait hook
suite also passes. This record does not claim additional screenshots of those
states.

Validation: focused Jest **2 suites/5 tests**; typecheck; production webpack build;
full lint **0 errors/4 existing warnings**. Backend SQL/protected history,
one bounded real OpenAI call, failure injection and provider-free integrated
replay are documented in the backend repository's
`docs/evaluation/2026-10-28-shadow-decisions-492.md`.

Authentication used the existing token-redirect login with an isolated fixture
JWT. Users/catalog navigation scaffolding is test-only; portrait/history/replay
use the actual guarded backend controllers. No production authentication bypass
was introduced. No user message, dispatch, purchase, access grant or additional
provider generation occurred through this UI.
