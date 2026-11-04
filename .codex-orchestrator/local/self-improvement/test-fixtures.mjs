export function validConfig() {
  const label = (name) => ({ name, color: '5319E7', description: 'Test workflow label' });
  return {
    schema: 'codex-orchestrator.agent-auto', version: 2,
    github: { owner: 'M-Ivonin', repo: 'admin-panel', baseBranch: 'main', labels: {
      auto: label('agent:auto'), running: label('agent:running'),
      blocked: label('agent:blocked'), review: label('agent:review'),
    } },
    runner: { workspaceRoot: '.codex-orchestrator/workspaces-v2',
      stateDir: '.codex-orchestrator/v2/state', branchTemplate: 'codex/issue-${issueNumber}',
      pollIntervalSeconds: 60, checkExecution: 'host' },
    codex: { command: 'codex', timeoutMs: 900000, idleTimeoutMs: 300000, toolNetwork: 'deny' },
    checks: { test: 'npm test', typecheck: 'npm run typecheck' },
    proof: { artifactDir: '.codex-orchestrator/v2/proofs' },
    deny: { commands: ['/usr/bin/gh'], readPaths: ['.env'] },
  };
}
