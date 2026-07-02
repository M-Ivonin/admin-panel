# PRD Workflow

Turn the current parent issue, conversation context, and repository context into a Product Requirements Document. Do not interview the user by default; synthesize what is already known, and record open questions instead of inventing product or technical decisions.

Use the repository's issue tracker and triage label vocabulary from repo instructions when available. Use the project's domain glossary vocabulary throughout the PRD, and respect ADRs in the area being changed.

## Process

1. Explore the repository enough to understand the current product and codebase state.
2. Identify the major modules, interfaces, contracts, or flows likely to change.
3. Actively look for opportunities to define deep modules: small, testable interfaces that encapsulate meaningful behavior.
4. Capture unresolved product, contract, external dependency, or validation questions explicitly.
5. Write the PRD using the template below.
6. If the execution environment has issue-tracker access and the caller requested publication, publish the PRD to the configured tracker and apply the triage entry label.

## PRD Template

### Problem Statement

Describe the problem from the user's perspective. Name the pain, missing capability, or operational risk without assuming an implementation.

### Solution

Describe the desired solution from the user's perspective. Focus on outcomes and observable behavior.

### User Stories

Provide a numbered list of user stories in this format:

1. As an `<actor>`, I want `<feature>`, so that `<benefit>`.

Cover the important actors, workflows, edge cases, and operational scenarios.

### Implementation Decisions

List implementation decisions already known or confirmed. Include:

- modules, contracts, or interfaces expected to change;
- schema, DTO, API, or persistence decisions;
- state machine, background job, auth, permission, caching, or integration decisions;
- specific interactions between systems;
- rejected approaches and why they are rejected.

Do not include brittle file paths or line numbers. If a prototype produced a snippet that captures a decision more precisely than prose, include only the decision-rich part and note that it came from a prototype.

### Testing Decisions

List testing decisions. Include:

- what behavior must be proven through public interfaces;
- which modules or flows need tests;
- existing prior art in the repository;
- required smoke, browser, mobile, API, or live validation;
- cases where a deterministic test seam is missing and must be created or explicitly accepted as risk.

### Risk And Proof

Classify the initiative so downstream automation can choose the right implementation path:

- small low-risk work that should stay on the Small Task Implementer path;
- medium scoped implementation work that needs TDD and review gates;
- high-risk contracts that need issue-level or wave-level spec gates before coding.

List the proof strategy a maintainer should expect after implementation: tests, smoke checks, artifacts, review focus, and any proof that cannot be automated locally.

### Out of Scope

List adjacent behavior that should not be included in this PRD.

### Further Notes

Record open questions, migration notes, rollout notes, compatibility concerns, and follow-up ideas.

## Quality Bar

- The PRD must be durable: useful even if files move.
- The PRD must be specific enough to break into vertical implementation issues.
- The PRD must make risk and proof expectations explicit enough that small tasks are not over-orchestrated and risky work is not under-specified.
- Do not hide unresolved decisions inside implementation work.
- Do not mark work as agent-ready when the PRD still depends on unconfirmed external contracts, credentials, manual design decisions, or ambiguous acceptance criteria.
