# AI personalization controls — local evidence, 30 October 2026

The final owner instruction excludes Campaign events/flows and all added Campaign
checks. The catalog contains 77 AI controls: 72 optional behavioral signals and
five existing message permissions, each with When/React and its own switch.
Reference: requested behavior and existing English dark MUI Settings conventions.
No mockup or deviations were supplied.

| Criterion | Inspected evidence | Result |
| --- | --- | --- |
| Only two AI groups; When/React, switches, interval and AI quotas retained | [Actual localhost:3000](local-when-react.png) | Pass |
| Behavioral switch saved despite being hidden by search, then reloaded off | [390 px](behavior-390.png) | Pass |
| Independent AI message switch reloaded off | [360 px](message-360.png) | Pass |
| Readable wrapping, switch alignment, no clipping/overlap/horizontal overflow | Both narrow screenshots and DOM width assertions | Pass |

Actual localhost:3000/3001 apps were rebuilt and restarted with existing settings.
The actual UI returned 77 rows; no save was made there. DEV settings remain unchanged.
Save/reload proof used a production Next copy on4397, real Nest fixture API on4398
and isolated PostgreSQL on64469. Only the copied API base URL changed. A one-use
localhost fixture sign-in supplied test authentication. No model/provider calls.

Automated proof:

- Backend: 8 suites, 159/159 tests pass, no skipped tests. Command: RUN_DB_BACKED_TESTS=true,
  explicit local DB_BACKED_TEST_DATABASE_URL and ENGAGEMENT_TEST_DATABASE_URL with
  sslmode=disable; npm test -- --runInBand --runTestsByPath for personalization settings
  HTTP/migration, decision HTTP, delivery DB, current-operation DB, lifecycle candidates,
  Campaign planner and executor specs. Log: /tmp/personalization-ai-only-tests-final.log.
- Covers complete 77-row catalog, persistence/revision validation, optional evidence
  filtering without portrait mutation, consumed-News protection, queued message/signal
  blocking, older retained interests and legacy dependency metadata. Original Campaign
  independence test again deletes the personalization singleton and passes.
- Admin Settings: 6/6 tests; both app builds/typechecks and targeted backend ESLint pass.
- Earlier full admin run has two known baseline account-history navigation failures
  (765/767 pass); those paths are unchanged. Initial broader backend channel/numeric
  tests remain covered by their earlier results; final affected suites were rerun.

Campaign planner/executor/current-facts code and fixtures match HEAD exactly.
Concurrent committed prompt/relevance work is preserved. Scope changes were made on
admin main/backend dev; no push/deployment or new shared migration/state mutation.
Temporary fixture servers/database/source copies are removed after independent review;
requested local apps and user mobile runtime are preserved.

Final independent Spec and Standards review approved the AI-only change with no
blockers or material observations. After the private presenter lint cleanup,
settings HTTP/migration suites passed again (5/5).
