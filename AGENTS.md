# AGENTS.md

## 1. Project Scope

This file contains app-specific instructions for `/admin-panel` (Next.js web app).
Global monorepo rules are in `/Users/serhiimytakii/Projects/Levantem/AGENTS.md`.

## 2. Stack and Conventions

- Framework: `Next.js` (App Router)
- Language: TypeScript
- UI: `@mui/material` + existing local component patterns
- Lint/format: project ESLint and Prettier config

## 3. Follow Existing Code Style (Mandatory)

- Inspect similar modules in `/admin-panel/app`, `/admin-panel/components`, and `/admin-panel/lib` before editing.
- Match existing patterns for route handlers, utility functions, and UI composition.
- Reuse current libraries and helpers before introducing new dependencies.

Explicit requirement: **Follow existing code style: Before generating code, look at similar modules in the project. See what styles, patterns, libraries are applied. Use the same in your code.**

## 4. Context7 MCP

- Use Context7 MCP only when the task genuinely requires precise, current Next.js/React/MUI/library docs or API changes that cannot be confidently answered from local code, lockfiles, tests, examples, or existing docs.
- Prefer local inspection first: read the app code, package manifest / lockfile, tests, examples, and docs before reaching for external library docs.
- Do not use Context7 MCP for routine Next.js/React/MUI coding, simple refactors, repository-specific behavior, or facts already visible in the project.
- Explicitly notify the user whenever Context7 MCP was used and what was checked.
- If Context7 MCP is unavailable:
  - State that it is unavailable.
  - Fall back to official docs/changelogs for the relevant library.
  - Continue with the safest compatible implementation and call out uncertainty.

## 5. Documentation-First Workflow

- Check `/Users/serhiimytakii/Projects/Levantem/admin-panel/docs` first for related feature docs.
- If `/admin-panel/docs` does not exist, review `/Users/serhiimytakii/Projects/Levantem/admin-panel/README.md` and create `/admin-panel/docs` when introducing non-trivial new features.
- After implementation, update existing docs or add a new doc.
- Include updated/created doc paths in the final response.

## 6. Runtime Errors Check (Mandatory End-of-Task)

- Run `npm run build`.
- Run `npm run lint` when code changes.
- Run `npm run test` when behavior covered by tests changes.
- If service is already running, check existing logs/terminal output first and do not start duplicate `next dev`/`next start` processes.
- Report verification steps and unresolved errors in the final response.
