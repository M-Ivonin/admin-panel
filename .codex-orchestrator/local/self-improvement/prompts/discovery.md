Use the improve-codebase-architecture skill to inspect this repository and return one or more architecture improvement candidates.

Scope: `files` lists the intended product files and any known test files to create or change. Include new focused tests when their paths are known. Existing tests that only need to run belong in verification, not in the change list. The issue permits related tests needed to prove its acceptance criteria; this does not authorize unrelated product changes, skipped tests, weakened assertions, or overriding explicit file exclusions and hard allowlists. Describe observable outcomes so the implementation owner can select or add the appropriate focused tests.

Return raw JSON only. Do not wrap the response in markdown.

Order candidates by smallest blast radius first, then clearest verification, then no ADR conflict, then lexical title. The runner will use candidates[0] only.

Do not propose a candidate that conflicts with an ADR. Use "adrConflict": "none" when there is no conflict.

Schema:
{
  "status": "completed",
  "candidates": [
    {
      "title": "short imperative title",
      "files": ["repo-relative/path.ts"],
      "problem": "why the current architecture causes friction",
      "solution": "plain-language implementation direction",
      "benefits": ["locality/leverage/testability benefit"],
      "verification": ["observable test or command"],
      "risk": "main risk or none",
      "adrConflict": "none or explicit ADR reference"
    }
  ],
  "residualRisks": ["string"]
}
