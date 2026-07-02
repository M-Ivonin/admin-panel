# Scoped Implementation Workflow / Spec Implementer

Implement one scoped issue or approved implementation spec. Follow the issue, repo policy, and runner completion contract exactly. Do not redesign the work unless repo reality proves a blocker.

## Core Rules

1. Keep scope narrow. Do not broaden the issue, add unrelated cleanup, or invent adjacent features.
2. Treat protected paths, rejected approaches, out-of-scope items, and repo instructions as hard constraints.
3. Confirm required services, env vars, fixtures, commands, and repo state before editing.
4. Stop if exact execution would require guessing about contracts, state, ownership, credentials, or validation.
5. Prefer existing local patterns and deep module boundaries over new abstractions.
6. Do not add pass-through modules, one-adapter seams, or test-only helpers unless they improve real locality or leverage.
7. Add comments only where they clarify non-obvious behavior.

## Task Sizing

Before editing, classify the issue:

- `Small / low risk`: clear behavior, narrow ownership, no schema/persistence/auth/background/shared-contract change, and a targeted validation path exists. Use the Small Task Implementer path (`$small-task-implementer`): compact contract, smallest edit, targeted proof, explicit escalation if hidden risk appears.
- `Medium`: behavior-changing runtime work that touches shared flow, multiple files, or meaningful tests, but does not require a parent issue tree. Use this scoped implementation workflow with TDD and the configured review gates.
- `High risk`: schemas, persistence, queues, retries, idempotency, auth, permissions, billing, caching, external contracts, multi-service work, or broad source-of-truth changes. Use the scoped/spec path only if the issue already provides deterministic contracts; otherwise return `needs-promotion` with evidence.

Do not run a heavy plan/spec process for a genuinely small task. Do not force a small task path when the change reveals hidden shared-contract or validation risk.

## TDD And Behavior Proof

For runtime behavior changes, use strict TDD red-to-green:

1. Choose one observable behavior.
2. Write one focused behavior test first.
3. Prove the test fails before implementation.
4. Implement the smallest correct change.
5. Prove the test passes after implementation.
6. Repeat vertically for the next behavior.
7. Refactor only while green.

Report the failing/red and passing/green evidence in validation. Do not batch many imagined tests before implementing. If no correct test seam exists, report why the available seams would give false confidence and provide the strongest alternate proof.

## Execution Flow

1. Read the issue, comments, repo instructions, and relevant docs.
2. Identify acceptance criteria, blockers, out-of-scope items, validation expectations, and likely source-of-truth owners.
3. Inspect current git status and avoid reverting user changes.
4. Implement the smallest complete solution.
5. Keep validation proportional to risk and blast radius.
6. Preserve runner-owned publication boundaries: do not push, open PRs, merge, publish, deploy, or mutate GitHub labels/comments.
7. Produce the structured completion report required by the runner.

## Review Gates

Run cleanup-review before code-review for medium or large runtime changes, or when repo policy requires it. Fix high-confidence cleanup findings and rerun relevant validation.

Run code-review before completion when the issue or repo policy requires it, or when the change touches shared behavior, APIs, persistence, auth, permissions, caching, concurrency, background jobs, navigation, middleware, or multiple runtime files. Fix grounded findings or report blockers with evidence.

For compact low-risk changes, focused validation plus a clear completion report is enough unless repo policy says otherwise.

## Review Handoff

For completed work, include `reviewHandoff` in the runner JSON report:

- `flowUsed`: `small-task-implementer`, `scoped-implementation`, `spec-implementer`, `issue-tree-child`, or `other`;
- `riskLevel`: `low`, `medium`, or `high`;
- `implementedContract`: what behavior or invariant changed;
- `proofByAcceptanceCriteria`: acceptance criteria mapped to test/smoke/artifact evidence;
- `reviewFocus`: the exact files, states, contracts, or edge cases a human should inspect;
- `humanReviewChecklist`: the shortest useful manual review path.

## Acceptance Proof

Prepare runner-owned acceptance proof artifacts when configured. For visual work,
screenshots must be tied back to the acceptance criteria; for non-visual work,
use smoke outputs, logs, or other observable artifacts. Let the runner execute
configured proof commands when the prompt says so, and keep proof script repair
inside proof-owned paths.

For web UI work, prepare a proof-owned browser proof scenario when the runner
uses `visual-proof auto` or `visual-proof browser`. Use explicit base URLs,
ordered actions/assertions, named screenshot and DOM checkpoints, and criteria
refs. Do not run or claim the final runner-owned proof command yourself.

For Android mobile app UI work, use device-backed proof instead of Playwright:

1. Run `adb devices -l`.
2. Prefer a connected non-emulator device serial and set `export ANDROID_SERIAL=<serial>`.
3. If no device exists, run `emulator -list-avds`, start an AVD in a separate shell with `emulator -avd <avd-name>`, and wait with `adb wait-for-device`.
4. After selecting the adb target, use Test Android Apps skills when available.
5. For native Android projects, use the project Gradle wrapper (`./gradlew`) with a writable `GRADLE_USER_HOME`, build the relevant debug APK, then install and launch it through adb on the selected target.
6. For Flutter Android projects only, start Flutter rebuild/install with the detected Flutter SDK and writable `PUB_CACHE` and `GRADLE_USER_HOME` directories. If rebuild/install fails because the SDK cache is read-only, retry only when `CODEX_ORCHESTRATOR_FLUTTER_ROOT` points to a preconfigured writable Flutter SDK: set `FLUTTER_ROOT` to that path, prepend `$FLUTTER_ROOT/bin` to `PATH`, run `flutter precache --android`, then rebuild/install again. If no writable Flutter SDK is configured, report the concrete SDK cache permission error.
7. Do not use Playwright as the primary proof path for Android mobile app verification.
8. If Test Android Apps cannot be enabled, or no usable Android device or emulator is available, report a warning/skipped check with the concrete plugin or adb/emulator reason and proceed only if repo policy allows it.

For native iOS app UI work, use simulator- or device-backed proof instead of Playwright:

1. Run `xcrun simctl list devices available`.
2. Choose an available simulator when no physical device is provided.
3. Build with `xcodebuild` using a writable `-derivedDataPath`.
4. Install and launch with `xcrun simctl install` and `xcrun simctl launch`.
5. Do not use Android or Flutter proof steps for native iOS projects unless the repository is explicitly a Flutter project targeting iOS.
6. If no usable iOS simulator/device or Xcode tooling is available, report a warning/skipped check with the concrete xcodebuild/simctl reason and proceed only if repo policy allows it.

## Stop Conditions

Stop and report a blocker if:

- a required file, symbol, command, dependency, or interface differs from the issue/spec;
- a required precondition cannot be satisfied;
- validation cannot prove the intended behavior with available repo context;
- completing the work requires touching protected paths or using rejected approaches;
- the change would require unapproved migration, compatibility logic, external access, or product decisions;
- review exposes ambiguity that cannot be resolved from code, docs, or the issue;
- the runner completion contract cannot be satisfied safely.

## Completion Standard

Do not mark the issue complete until:

- every acceptance criterion is implemented, blocked with evidence, or explicitly out of scope;
- validation commands and behavior proof have run, or skipped checks have concrete reasons;
- applicable cleanup-review and code-review gates have run;
- protected paths stayed untouched and rejected approaches were avoided;
- changed files, validation, review handoff, skipped checks, residual risks, and blockers are reported;
- the structured completion report is written exactly where the runner requested it.
