# Codex Orchestrator Setup

Use this prompt to help a maintainer install `codex-orchestrator` in a repository.

1. Confirm the target repository path.
2. Check that the repository has a GitHub `origin` remote.
3. From the target repository root, run `codex-orchestrator setup --prepare-labels`.
4. Use `--target <path>`, `--github-owner <owner>`, and `--github-repo <repo>` only when the target or GitHub repository cannot be inferred from the current directory and `origin`.
5. Review the generated config, label report, workflow sources, and checks.
6. Use `--dry-run` only when the maintainer explicitly asks for a preview without writing files or creating labels.
7. Do not launch Codex implementation from setup.
8. Do not commit, push, or open a pull request from setup unless the maintainer explicitly asks for that follow-up.
