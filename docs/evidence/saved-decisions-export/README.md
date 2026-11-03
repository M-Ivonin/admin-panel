# Personalization analysis JSON

The Saved decisions download now creates a versioned analysis report instead of
serializing the complete internal decision-history response. The existing
account export endpoint and stored/replayable records are unchanged. Projection
belongs to `lib/personalization-decision-export.ts`, at the download seam.

`format: personalization-analysis`, `schemaVersion: 1`, account, export time,
status, all-retained-record scope and actual exported record count identify the
file. Every available decision is retained, including those beyond the latest
20 displayed in the UI. Table search/filter does not restrict the export.

| Information | Treatment | Purpose |
| --- | --- | --- |
| Decision ID/time/status, source, app, selected scenario/channel/window/reason | Keep | Establish what was decided and compare decisions |
| Exact suggested message, selected content relevance and selected offer terms | Keep once | Assess content/interest fit, price claims and message quality |
| Baseline selection and compact alternatives with ranking evidence | Keep compact | Compare the chosen result with available alternatives |
| Observed activity, coverage, interests, snapshot cutoff and seven-day window | Keep | Distinguish insufficient or stale evidence from real inactivity |
| Current access, activity, preferences, local-time evidence and channel readiness | Keep | Explain eligibility without execution configuration |
| Readiness sources/scenario counts, exact contact blockers, validation reasons | Keep | Explain no-contact and failed selections |
| Repeated per-article identity/no-match/fallback exclusions | Group by reason and count | Remove repeated article IDs while preserving rejection counts |
| AI model/status, explanation, skip/failure code, latency/token usage and recorded alternative | Keep | Analyze selection, fallbacks, quotas and usage |
| Policy/prompt/template/validator versions | Keep | Compare changes across revisions |
| Every actual delivery, exact rendered copy, provider/send/open/failure facts | Keep | Distinguish recommendations, attempts, delivery and reaction |
| Full candidate bodies/copy, execution proposals, full pricing payloads | Remove | Execution/replay material duplicates analysis evidence |
| Trigger/snapshot/provider trace IDs, device ID, preference hashes | Remove | Internal correlation/configuration noise |
| Raw model output, retention/store flags, repeated capability maps and dependency lists | Remove | Redundant internal wire/audit scaffolding |

Identical historical favorite/interest arrays are stored once in `interestProfiles`.
Each decision's `context.interestProfileId` selects its own saved interest facts;
changed arrays create a different entry. Its activity, time window, snapshot cutoff
and current eligibility remain on that decision. Missing interests do not become
an empty profile. Candidate ranking evidence, verified prediction/collection facts
and compact offer terms are retained for alternatives as well as the selected
content, so comparisons do not require duplicate message bodies.

Null remains null; zero remains zero; absent delivery evidence remains absent
and differs from an empty delivery list. No send/delivery/open status is inferred
from a selected channel. The AI explanation remains under `ai`, distinct from
the final `source`, selection and validation. Proposed and actual rendered
messages remain separate. Restricted responses never include decision rows.

## Measured audit

A locally downloaded 3 November 2026 account export contained 14 decisions and
3 delivery records. It occupied **299,268 bytes** as indented JSON. Its `input`
payload accounted for about 82% of the compact representation; the largest
parts were complete candidates, exclusions, current execution data and facts.

The analysis report for the same source occupies **147,708 bytes**, a **50.6%**
reduction with the same 14 decision IDs and 3 delivery records. Both use the same
two-space indentation; the reduction comes from content selection, not minifying
whitespace. No account data or private source export is committed here.

The projection affects downloaded file contents only. The browser still reads
the full existing protected export response; network payload size is unchanged.
This change requires no backend deployment, migration or data rewrite.

## Verification

- The existing download test first failed because the file still contained the
  original internal response; it now validates the versioned report and all 23
  source records, including a record outside the preview.
- Projection tests validate retained context/AI/delivery facts, omitted internal
  payloads, unmodified source data, exclusion counts, unknown vs empty evidence,
  missing vs explicit no-message copy, pending and restricted rows.
- The real-file audit also verified unchanged IDs, selections, suggested and actual
  messages, delivery records, validation, historical interests/windows, AI reasons
  and total exclusion counts. The source file remained unchanged.
- Focused result: 3 suites / 49 tests passed.
- `npm test -- --runInBand __tests__/personalization-decision-export.test.ts __tests__/portrait-decision-history.test.tsx __tests__/personalization-navigation.test.tsx`.
- `npm run lint`: zero errors/four existing unrelated warnings; `npm run typecheck`, `npm run build` and `git diff --check`: passed.
- No visible UI or layout changes; the existing subdued JSON button is retained.
