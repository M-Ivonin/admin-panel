# Issue Tree Orchestration Workflow / Issue Orchestrator

Coordinate a parent issue or PRD with child implementation issues through dependency-aware waves, integration review, phase-gated handoff, and final verification.

Use orchestration only when the work is explicitly a parent/child issue tree or the caller asks for coordination, delegation, parallel agent work, or waves. Do not implement the parent issue directly when child implementation issues exist.

## Required Inputs

- Parent issue, PRD, or plan.
- Child issue references, or permission to discover linked child issues from the issue tracker.
- Repo instructions, including `AGENTS.md`, domain docs, ADRs, and issue-tracker label policy.
- Current git status and branch.

## Core Rules

1. Treat the dependency graph and active wave plan as the live orchestration ledger.
2. Do not start a child issue until blockers and preconditions are satisfied or explicitly cleared.
3. Keep one integrator responsible for merge sequencing, handoff checks, validation, and final reconciliation.
4. Use parallel workers only for disjoint write scopes.
5. Never let two workers edit the same file, generated artifact, source-of-truth rule, schema, or shared contract at the same time.
6. Do not broaden scope, add cleanup, or redesign the parent unless a blocker is proven.
7. If repo reality contradicts the issue, parent PRD, or wave plan, stop and ask for clarification.
8. Use TDD for behavior-changing child issues.
9. Honor issue-level and wave-level spec gates before coding.

## Verification Contract

A child issue is not complete until every acceptance criterion has proof.

Allowed proof includes test result, smoke result, command output, API or browser check, mobile proof, log evidence, DB inspection, or an explicit skipped-verification reason with risk. No proof means the issue remains incomplete, blocked, or explicitly deferred in the wave ledger.

## Orient

1. Read repo instructions and issue-tracker config.
2. Fetch the parent and child issues.
3. Extract acceptance criteria, blockers, out-of-scope items, rejected approaches, preconditions, and validation expectations.
4. Build a dependency graph: ready, blocked, final integration/regression.
5. Identify protected paths, likely source-of-truth owners, and files that must not be edited concurrently.
6. Extract each issue's spec gate metadata.
7. Mark unresolved external contracts, credentials, live fixtures, or human-only decisions as blocked until proven or cleared.

## Plan Waves

Create the smallest safe parallel wave first:

- start only issues with no unresolved blockers;
- prefer independent vertical slices over horizontal layer splits;
- avoid parallel writes to the same owner files unless scopes are truly disjoint;
- keep final cross-cutting regression or cleanup issues for the last wave;
- define each wave exit gate: worker reports, integration diff review, combined validation, and blocker reconciliation;
- decide whether the wave requires a spec gate.

## Spec Gates

Run a spec gate when an active issue says `Spec required: issue-level` or `Spec required: wave-level`, or when implementation would otherwise require guessing about contracts, state, ownership, external dependencies, validation, or rejected approaches.

Use an issue-level spec for one complex isolated child. Use a wave-level spec when several child issues share contracts, source-of-truth files, runtime flow, fixtures, or validation. If multiple active issues are marked issue-level but clearly share the same source-of-truth files or execution flow, coalesce them into one wave spec.

Default to a compact execution checklist. Expand to a full spec only when compact mode would leave safety, contract, ownership, or validation ambiguity.

Accepted spec gate output must identify:

- active child issues covered;
- source-of-truth contracts and ownership;
- protected paths and rejected approaches;
- exact implementation phases;
- first behavior proof or Contract Test Ledger rows when needed;
- validation gates;
- stop conditions.

Only after the spec gate is accepted should implementation workers start.

## Delegate

For each issue in the active wave, assign one worker with a narrow ownership scope. Worker instructions must include:

- parent and child issue references;
- accepted implementation spec reference when a spec gate was run;
- repo policy and relevant docs to read;
- instruction to use TDD for behavior changes;
- exact ownership boundaries;
- warning that other agents may be editing the repo;
- instruction not to revert or overwrite user or worker changes;
- protected paths, rejected approaches, and out-of-scope items;
- required preconditions and verification commands;
- stop conditions;
- required final report: changed files, proof per acceptance criterion, tests run, skipped checks, risks, blockers, and unresolved acceptance criteria.

While workers run, the integrator should do non-overlapping work: read docs, inspect ownership, map integration points, and prepare validation. Do not duplicate a worker's implementation.

## Integrate Each Wave

Treat each wave as a hard execution gate:

1. Review worker reports before touching code.
2. Review diffs and verify scope boundaries.
3. Resolve conflicts without discarding user or worker changes.
4. Remove duplicated logic, competing source-of-truth changes, and workaround-shaped code.
5. Check for architecture drift: shallow modules, one-adapter seams, duplicated rules, or tests coupled to implementation details.
6. Reconcile every active child issue as complete, blocked with evidence, or deferred.
7. Verify TDD evidence for behavior-changing issues.
8. Run the smallest meaningful combined validation for the wave.
9. Run repo architecture checks when available and applicable.
10. Verify implementation stayed inside the accepted spec, or document why a spec amendment was required.
11. Run cleanup-review and code-review when repo policy or change size requires them.
12. Fix high-confidence review findings and rerun validation.
13. Create focused commits for completed child issues, or one documented wave commit when safe separation is impossible.
14. Update the dependency graph before starting the next wave.

If a worker reports an ambiguous or risky decision, pause and ask the user a targeted question.

## Finish And Delivery

After all child issues are implemented, blocked, or deferred:

1. Run final integration or regression issues last.
2. Reconcile all child acceptance criteria, skipped checks, blockers, and out-of-scope protections.
3. Run cleanup-review before final code-review when repo policy requires it.
4. Fix grounded findings and rerun relevant checks.
5. Summarize completed issues, verification, skipped checks, and follow-up risks.
6. Comment on completed child issues with result summaries and verification.
7. Close completed child issues only after completion evidence is posted.
8. Comment on the parent with completed children, validation, out-of-scope items preserved, and residual risks.
9. Open or prepare a pull request when requested or expected by repo workflow.
10. Stop before any human-only action such as PR approval, merge, product decision, manual validation, missing access, or secrets.

## Stop Conditions

Stop immediately if:

- a required precondition cannot be satisfied exactly;
- a required file, symbol, command, issue, or dependency is missing;
- a child issue cannot be validated with available repo context;
- a required spec gate cannot produce an accepted spec;
- an external contract is not machine-confirmed;
- completing a child would touch protected or out-of-scope areas;
- two active workers need the same write target or source-of-truth owner;
- a worker introduces duplicate business rules, dispatch builders, normalization, persistence accounting, or compatibility layers;
- implementation would use a rejected approach;
- review exposes ambiguity that cannot be resolved from code, docs, or issues;
- the next wave depends on unverified, blocked, or ambiguous work.

## Completion Standard

Do not claim orchestration is complete until:

- every child issue is complete, blocked with evidence, or explicitly deferred;
- every reached wave exit gate has passed;
- every required spec gate was completed and accepted;
- integration diffs have been reviewed and remediated;
- protected paths and rejected approaches were respected;
- source-of-truth ownership remains singular;
- behavior-changing child issues used TDD or documented a no-seam testing gap;
- required validation ran, or skipped checks have concrete reasons;
- required cleanup-review and code-review gates completed;
- completed child issues have focused commits or documented wave commits;
- completed children and the parent have been updated unless delivery was explicitly skipped.
