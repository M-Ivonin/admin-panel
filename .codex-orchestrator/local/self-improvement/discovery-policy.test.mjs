import assert from 'node:assert/strict';
import test from 'node:test';
import { validConfig } from './test-fixtures.mjs';
import { validateDiscoveryReport } from './runner.mjs';

const analysis = {
  checked: ['Architecture: receipt ownership at receipt.ts:save'],
  architectureSkills: ['improve-codebase-architecture', 'codebase-design'],
  architectureEvidence: ['receipt.ts:save already hides persistence invariants; no useful deepening'],
  candidates: [],
  limitations: ['Source analysis only; no runtime checks'],
};

test('no justified candidate is valid and preserves its explanation', () => {
  const result = validateDiscoveryReport({ status: 'completed', candidates: [], analysis });
  assert.equal(result.ok, true);
  assert.deepEqual(result.candidates, []);
  assert.deepEqual(result.analysis, analysis);
});

test('missing explanation and missing architecture skill evidence fail closed', () => {
  assert.equal(validateDiscoveryReport({ status: 'completed', candidates: [] }).ok, false);
  assert.equal(validateDiscoveryReport({ status: 'completed', candidates: [],
    analysis: { ...analysis, architectureSkills: [] } }).ok, false);
});

import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRunner } from './runner.mjs';

const candidate = { category: 'bug', title: 'Preserve receipt state', files: ['receipt.ts'],
  problem: 'Refresh loses state', solution: 'Preserve state in the owner', benefits: ['Correct refresh'],
  verification: ['State survives refresh'], risk: 'none', adrConflict: 'none',
  proof: { version: 1, level: 'tests-only', reason: 'Focused state tests establish the result', authentication: 'none', steps: [] } };

function candidateReport(item = candidate) {
  return { status: 'completed', candidates: [item], analysis: { ...analysis,
    candidates: [{ title: item.title, category: item.category, decision: 'selected',
      evidence: 'receipt.ts:refresh loses state', reason: 'No architecture candidate passes; concrete bug is next priority' }] } };
}

test('category, selection and architecture priority are validated before publication', () => {
  for (const category of ['ux', 'cleanup']) {
    assert.equal(validateDiscoveryReport(candidateReport({ ...candidate, category })).ok, false);
  }
  const report = candidateReport();
  report.analysis.candidates[0].decision = 'rejected';
  assert.equal(validateDiscoveryReport(report).ok, false);
  report.analysis.candidates[0].decision = 'selected';
  report.candidates.push({ ...candidate, title: 'Architecture owner', category: 'architecture' });
  assert.equal(validateDiscoveryReport(report).ok, false);
});

for (const missing of [false, true]) {
  test(`daily no-candidate flow preserves evidence and makes no publication; missing skill=${missing}`, async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'discovery-policy-'));
    const calls = [];
    try {
      for (const skill of ['improve-codebase-architecture', 'codebase-design']) {
        const dir = path.join(cwd, 'skills', skill);
        await mkdir(dir, { recursive: true });
        if (!missing || skill !== 'codebase-design') await writeFile(path.join(dir, 'SKILL.md'), `fixture ${skill} gate`);
      }
      const localDir = path.join(cwd, '.codex-orchestrator/local/self-improvement');
      await mkdir(path.join(localDir, 'prompts'), { recursive: true });
      await writeFile(path.join(localDir, 'prompts/discovery.md'), 'Read-only discovery');
      await writeFile(path.join(cwd, '.codex-orchestrator/config.json'), JSON.stringify(validConfig()));
      const runner = createRunner({ cwd, localDir, env: { ...process.env, CODEX_HOME: cwd },
        codexCommand: process.execPath,
        withRemoteBaseWorktree: async (_root, analyze) => ({ baseSha: 'a'.repeat(40),
          result: await analyze({ worktreePath: cwd, baseSha: 'a'.repeat(40) }) }),
        exec: async (command, args, options) => {
          calls.push({ command, args });
          if (command === 'gh') {
            if (args[0] === 'repo') return { code: 0, stdout: JSON.stringify({ nameWithOwner: 'M-Ivonin/admin-panel' }) };
            if (args[0] === 'label') return { code: 0, stdout: JSON.stringify(['self-improvement','agent:auto','agent:manual'].map(name => ({name}))) };
            return { code: 0, stdout: '[]' };
          }
          assert.equal(command, process.execPath);
          assert.match(options.stdin, /fixture improve-codebase-architecture gate/);
          assert.match(options.stdin, /fixture codebase-design gate/);
          await writeFile(options.reportPath, JSON.stringify({ status: 'completed', candidates: [], analysis }));
          return { code: 0, stdout: '' };
        } });
      const result = await runner.daily();
      const discovery = result.phases.find(phase => phase.name === 'discover');
      assert.equal(result.exitCode, missing ? 1 : 0);
      assert.equal(discovery.status, missing ? 'failed' : 'none');
      if (missing) {
        assert.match(discovery.reason, /Mandatory architecture skill unavailable/);
        assert.equal(calls.some(call => call.command !== 'gh'), false);
      } else {
        assert.deepEqual(discovery.analysis, analysis);
        assert.deepEqual((await runner.loadState()).lastDiscovery.analysis, analysis);
        assert.deepEqual(JSON.parse(await readFile(path.join(localDir, 'reports/discovery.json'), 'utf8')).analysis, analysis);
        const lines = [];
        const original = console.log;
        try { console.log = line => lines.push(line); runner.printSummary(result); }
        finally { console.log = original; }
        assert.ok(lines.some(line => line.includes('discovery-analysis:') && line.includes('receipt.ts:save')));
      }
      assert.equal(calls.some(call => call.args[0] === 'issue' && call.args[1] === 'create'), false);
      assert.equal(calls.some(call => call.command.endsWith('/codex-orchestrator')), false);
    } finally { await rm(cwd, { recursive: true, force: true }); }
  });
}
