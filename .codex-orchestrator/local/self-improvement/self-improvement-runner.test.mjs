import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile, chmod } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  createRunner,
  dailyPhase,
  fingerprintCandidate,
  fingerprintFinding,
  reportContracts,
  validateDiscoveryReport,
  validateReviewReport,
} from './runner.mjs';

const legacyCodexCommand = '/Applications/Codex.app/Contents/Resources/codex';

function commandKey(command, args = []) {
  return [command, ...args].join('\0');
}

function makeExecStub(responses = {}) {
  const calls = [];
  const fn = async (command, args = [], options = {}) => {
    calls.push({ command, args, options });
    const key = commandKey(command, args);
    const response = fn.responses[key] ?? fn.responses[command] ?? { code: 0, stdout: '', stderr: '' };
    if (typeof response === 'function') {
      return response({ command, args, options, calls });
    }
    return response;
  };
  fn.calls = calls;
  fn.responses = responses;
  return fn;
}

async function makeRunner(options = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'self-improvement-test-'));
  const exec = options.exec ?? makeExecStub();
  const runner = createRunner({
    cwd: root,
    localDir: path.join(root, '.codex-orchestrator/local/self-improvement'),
    exec,
    now: options.now ?? (() => new Date('2026-05-20T09:00:00.000Z')),
    hostname: options.hostname ?? (() => 'test-host'),
    pid: options.pid ?? 12345,
    isPidAlive: options.isPidAlive ?? (() => false),
    codexCommand: Object.hasOwn(options, 'codexCommand') ? options.codexCommand : options.env ? undefined : legacyCodexCommand,
    env: options.env,
    withRemoteBaseWorktree: options.withRemoteBaseWorktree ?? (async (_target, analyze) => ({
      baseSha: 'a'.repeat(40), result: await analyze({ worktreePath: root, baseSha: 'a'.repeat(40) }),
    })),
  });
  return { root, exec, runner, cleanup: () => rm(root, { recursive: true, force: true }) };
}

async function makeFakeCodex(root) {
  const binDir = path.join(root, 'bin');
  const codexPath = path.join(binDir, 'codex');
  await mkdir(binDir, { recursive: true });
  await writeFile(codexPath, '#!/bin/sh\nexit 0\n');
  await chmod(codexPath, 0o755);
  return codexPath;
}

const validCandidate = {
  title: 'Extract runner phase summaries',
  files: ['src/runner/example.ts'],
  problem: 'Phase summaries are scattered.',
  solution: 'Move summary construction behind a small helper.',
  benefits: ['Improves locality and testability.'],
  verification: ['node --test test/example.test.ts'],
  risk: 'none',
  adrConflict: 'none',
};

const validFinding = {
  summary: 'Record smoke failure in issue comment',
  evidence: 'Issue #12 has a smoke failure summary but no follow-up comment.',
  proposedFix: 'Add the smoke result summary to the handoff comment.',
  sourceIssue: 12,
  sourcePr: 34,
  findingFingerprint: 'review-smoke-comment',
};

test('local boundary expects runner exports before implementation', () => {
  assert.equal(typeof createRunner, 'function');
});

test('daily phase helper classifies failures and renders summary details', () => {
  const failed = dailyPhase.result('discover', { status: 'failed', reason: 'Codex discovery failed' });
  const skipped = dailyPhase.result('implement', { status: 'skipped', reason: 'missing issue number' });
  const review = dailyPhase.result('review', {
    status: 'completed',
    created: [{ issueNumber: 12 }],
    reused: [{ issueNumber: 13 }],
  });

  assert.equal(dailyPhase.failed(failed), true);
  assert.equal(dailyPhase.failed(skipped), false);
  assert.equal(dailyPhase.exitCode([skipped, review]), 0);
  assert.equal(dailyPhase.exitCode([failed, review]), 1);
  assert.equal(dailyPhase.summaryLine(failed), 'discover: failed (Codex discovery failed)');
  assert.equal(dailyPhase.summaryLine(review), 'review: completed (created 1; reused 1)');
  assert.deepEqual(dailyPhase.summaryLines([failed, skipped, review]), [
    'discover: failed (Codex discovery failed)',
    'implement: skipped (missing issue number)',
    'review: completed (created 1; reused 1)',
  ]);
});

test('preflight fails before mutation when repo identity is wrong', async () => {
  const exec = makeExecStub({
    [commandKey('gh', ['repo', 'view', 'M-Ivonin/admin-panel', '--json', 'nameWithOwner'])]: {
      code: 0,
      stdout: JSON.stringify({ nameWithOwner: 'Someone/else' }),
    },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.preflight();
    assert.equal(result.ok, false);
    assert.match(result.reason, /repo identity/i);
    assert.equal(exec.calls.some((call) => call.args.includes('issue') && call.args.includes('create')), false);
  } finally {
    await cleanup();
  }
});

test('preflight verifies auth, required labels, and creates self-improvement label when missing', async () => {
  const exec = makeExecStub({
    [commandKey('gh', ['repo', 'view', 'M-Ivonin/admin-panel', '--json', 'nameWithOwner'])]: {
      code: 0,
      stdout: JSON.stringify({ nameWithOwner: 'M-Ivonin/admin-panel' }),
    },
    [commandKey('gh', ['auth', 'status'])]: { code: 0, stdout: 'ok' },
    [commandKey('gh', ['label', 'list', '--repo', 'M-Ivonin/admin-panel', '--limit', '1000', '--json', 'name'])]: {
      code: 0,
      stdout: JSON.stringify([{ name: 'agent:auto' }, { name: 'agent:manual' }]),
    },
    [commandKey('gh', ['label', 'create', 'self-improvement', '--repo', 'M-Ivonin/admin-panel', '--color', '5319E7', '--description', 'Local Levantem admin-panel self-improvement loop'])]: {
      code: 0,
      stdout: '',
    },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.preflight();
    assert.equal(result.ok, true);
    assert.equal(exec.calls.some((call) => call.args[0] === 'label' && call.args[1] === 'create'), true);
  } finally {
    await cleanup();
  }
});

test('preflight fails when agent labels are missing', async () => {
  const exec = makeExecStub({
    [commandKey('gh', ['repo', 'view', 'M-Ivonin/admin-panel', '--json', 'nameWithOwner'])]: {
      code: 0,
      stdout: JSON.stringify({ nameWithOwner: 'M-Ivonin/admin-panel' }),
    },
    [commandKey('gh', ['auth', 'status'])]: { code: 0, stdout: 'ok' },
    [commandKey('gh', ['label', 'list', '--repo', 'M-Ivonin/admin-panel', '--limit', '1000', '--json', 'name'])]: {
      code: 0,
      stdout: JSON.stringify([{ name: 'agent:auto' }, { name: 'self-improvement' }]),
    },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.preflight();
    assert.equal(result.ok, false);
    assert.match(result.reason, /agent:manual/);
  } finally {
    await cleanup();
  }
});

test('preflight fails before GitHub mutation when Codex CLI cannot be resolved', async () => {
  const exec = makeExecStub();
  const { runner, cleanup } = await makeRunner({ exec, env: { PATH: '' } });
  try {
    const result = await runner.preflight();
    assert.equal(result.ok, false);
    assert.match(result.reason, /codex command/i);
    assert.equal(exec.calls.length, 0);
  } finally {
    await cleanup();
  }
});

test('lock acquisition is exclusive and stale recovery requires same-host dead pid older than 12 hours', async () => {
  const { runner, cleanup } = await makeRunner({
    now: () => new Date('2026-05-20T20:30:00.000Z'),
    hostname: () => 'test-host',
    isPidAlive: (pid) => pid === 999,
  });
  try {
    await runner.acquireLock();
    await assert.rejects(() => runner.acquireLock(), /active lock/);
    await runner.releaseLock();

    await mkdir(path.join(runner.paths.localDir, 'lock'), { recursive: true });
    await writeFile(
      path.join(runner.paths.localDir, 'lock/lock.json'),
      JSON.stringify({ pid: 888, hostname: 'test-host', timestamp: '2026-05-20T07:00:00.000Z' }),
    );
    await runner.acquireLock();
    await runner.releaseLock();

    await mkdir(path.join(runner.paths.localDir, 'lock'), { recursive: true });
    await writeFile(
      path.join(runner.paths.localDir, 'lock/lock.json'),
      JSON.stringify({ pid: 888, hostname: 'other-host', timestamp: '2026-05-20T07:00:00.000Z' }),
    );
    await assert.rejects(() => runner.acquireLock(), /active lock/);
  } finally {
    await cleanup();
  }
});

test('candidate and finding fingerprints are stable sha256 values', () => {
  const first = fingerprintCandidate(validCandidate);
  const second = fingerprintCandidate({ ...validCandidate, benefits: [...validCandidate.benefits] });
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first, second);
  assert.match(fingerprintFinding(validFinding), /^[a-f0-9]{64}$/);
});

test('report contracts centralize item limits and residual risk normalization', () => {
  const discovery = reportContracts.discovery.validate({
    status: 'completed',
    candidates: [validCandidate],
    residualRisks: ['  keep this  ', '', 42, 'and this'],
  });
  assert.equal(discovery.ok, true);
  assert.deepEqual(discovery.residualRisks, ['keep this', 'and this']);

  const findings = Array.from({ length: 6 }, (_, index) => ({
    ...validFinding,
    findingFingerprint: `finding-${index}`,
  }));
  const review = reportContracts.review.validate({
    status: 'completed',
    findings,
    residualRisks: 'not-an-array',
  });
  assert.equal(review.ok, true);
  assert.equal(review.findings.length, 5);
  assert.deepEqual(review.residualRisks, []);
});

test('codex JSON invocation uses exact command shape and rejects invalid JSON before mutation', async () => {
  const exec = makeExecStub();
  const testEnv = { PATH: '' };
  const { root, runner, cleanup } = await makeRunner({ exec, env: testEnv });
  const codexPath = await makeFakeCodex(root);
  testEnv.PATH = path.dirname(codexPath);
  exec.responses = {
    [codexPath]: async ({ options }) => {
      await writeFile(options.reportPath, 'not json');
      return { code: 0, stdout: '', stderr: '' };
    },
  };
  try {
    const result = await runner.runCodexJson({
      phase: 'discover',
      promptPath: path.join(runner.paths.localDir, 'prompts/discovery.md'),
      contextText: 'context',
      reportPath: path.join(runner.paths.localDir, 'reports/discovery.json'),
    });
    assert.equal(result.ok, false);
    assert.match(result.reason, /invalid json/i);
    const call = exec.calls[0];
    assert.equal(call.command, codexPath);
    assert.deepEqual(call.args.slice(0, 12), [
      'exec',
      '--cd',
      runner.paths.cwd,
      '--sandbox',
      'workspace-write',
      '--add-dir',
      runner.paths.localDir,
      '-c',
      'sandbox_workspace_write.network_access=true',
      '--output-last-message',
      path.join(runner.paths.localDir, 'reports/discovery.json'),
      '-',
    ]);
    assert.equal(call.options.timeout, 1800000);
    assert.equal(exec.calls.some((c) => c.args.includes('issue') && c.args.includes('create')), false);
  } finally {
    await cleanup();
  }
});

test('codex JSON invocation fails on nonzero exit without parsing mutation output', async () => {
  const exec = makeExecStub();
  const testEnv = { PATH: '' };
  const { root, runner, cleanup } = await makeRunner({ exec, env: testEnv });
  const codexPath = await makeFakeCodex(root);
  testEnv.PATH = path.dirname(codexPath);
  exec.responses = {
    [codexPath]: { code: 2, stdout: '', stderr: 'failed' },
  };
  try {
    const result = await runner.runCodexJson({
      phase: 'review',
      promptPath: path.join(runner.paths.localDir, 'prompts/review.md'),
      contextText: 'context',
      reportPath: path.join(runner.paths.localDir, 'reports/review.json'),
    });
    assert.equal(result.ok, false);
    assert.match(result.reason, /exited 2/);
  } finally {
    await cleanup();
  }
});

test('discovery creates exactly one agent:auto self-improvement issue for the first valid candidate', async () => {
  const exec = makeExecStub({
    '/Applications/Codex.app/Contents/Resources/codex': async ({ options }) => {
      assert.match(options.stdin, /Levantem admin-panel repository/);
      await writeFile(options.reportPath, JSON.stringify({
        status: 'completed',
        candidates: [validCandidate, { ...validCandidate, title: 'Second candidate' }],
        residualRisks: [],
      }));
      return { code: 0, stdout: '', stderr: '' };
    },
    gh: ({ args }) => {
      if (args[0] === 'issue' && args[1] === 'list') return { code: 0, stdout: '[]' };
      if (args[0] === 'issue' && args[1] === 'create') return { code: 0, stdout: 'https://github.com/M-Ivonin/admin-panel/issues/77' };
      return { code: 0, stdout: '' };
    },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.discover({ preflight: false });
    assert.equal(result.status, 'created');
    assert.equal(result.issueNumber, 77);
    const createCalls = exec.calls.filter((call) => call.args[0] === 'issue' && call.args[1] === 'create');
    assert.equal(createCalls.length, 1);
    assert.deepEqual(createCalls[0].args.filter((arg) => arg === '--label' || arg === 'agent:auto' || arg === 'self-improvement'), [
      '--label',
      'agent:auto',
      '--label',
      'self-improvement',
    ]);
    const bodyPath = createCalls[0].args.at(createCalls[0].args.indexOf('--body-file') + 1);
    const body = await readFile(bodyPath, 'utf8');
    assert.match(body, /self-improvement-runner-id:levantem-admin-panel-local-self-improvement/);
    assert.match(body, /source-candidate-fingerprint:/);
    assert.match(body, /## Levantem admin-panel metadata/);
    assert.match(body, /Related test files may be created or minimally updated only to prove the listed acceptance criteria/);
    assert.match(body, /Changes to unrelated production files are outside scope/);
  } finally {
    await cleanup();
  }
});

test('publication helper owns marker reuse, body files, labels, and result shape', async () => {
  const createdExec = makeExecStub({
    gh: ({ args }) => {
      if (args[0] === 'issue' && args[1] === 'list') return { code: 0, stdout: '[]' };
      if (args[0] === 'issue' && args[1] === 'create') return { code: 0, stdout: 'https://github.com/M-Ivonin/admin-panel/issues/91' };
      throw new Error(`unexpected gh call ${args.join(' ')}`);
    },
  });
  const createdRunner = await makeRunner({ exec: createdExec });
  try {
    const marker = 'finding-fingerprint:publication-helper';
    const result = await createdRunner.runner.publishSelfImprovementIssue({
      marker,
      title: 'Self-improvement follow-up: Helper test',
      body: `Body\n\n${marker}\n`,
      agentLabel: 'agent:manual',
    });
    assert.deepEqual(result, {
      status: 'created',
      issueNumber: 91,
      url: 'https://github.com/M-Ivonin/admin-panel/issues/91',
      fingerprint: 'publication-helper',
    });
    const createCall = createdExec.calls.find((call) => call.args[0] === 'issue' && call.args[1] === 'create');
    const bodyPath = createCall.args.at(createCall.args.indexOf('--body-file') + 1);
    assert.equal(await readFile(bodyPath, 'utf8'), `Body\n\n${marker}\n`);
    assert.deepEqual(createCall.args.filter((arg) => arg === '--label' || arg === 'agent:manual' || arg === 'self-improvement'), [
      '--label',
      'agent:manual',
      '--label',
      'self-improvement',
    ]);
  } finally {
    await createdRunner.cleanup();
  }

  const reusedExec = makeExecStub({
    gh: ({ args }) => {
      if (args[0] === 'issue' && args[1] === 'list') {
        return { code: 0, stdout: JSON.stringify([{ number: 92, url: 'https://example.test/92' }]) };
      }
      throw new Error(`unexpected gh call ${args.join(' ')}`);
    },
  });
  const reusedRunner = await makeRunner({ exec: reusedExec });
  try {
    const result = await reusedRunner.runner.publishSelfImprovementIssue({
      marker: 'source-candidate-fingerprint:reused-helper',
      title: 'Self-improvement: Reused helper',
      body: 'body',
      agentLabel: 'agent:auto',
    });
    assert.deepEqual(result, {
      status: 'reused',
      issueNumber: 92,
      url: 'https://example.test/92',
      fingerprint: 'reused-helper',
    });
    assert.equal(reusedExec.calls.some((call) => call.args[0] === 'issue' && call.args[1] === 'create'), false);
  } finally {
    await reusedRunner.cleanup();
  }
});

test('discovery reuses existing marker match and does not create a duplicate issue', async () => {
  const exec = makeExecStub({
    '/Applications/Codex.app/Contents/Resources/codex': async ({ options }) => {
      await writeFile(options.reportPath, JSON.stringify({ status: 'completed', candidates: [validCandidate], residualRisks: [] }));
      return { code: 0, stdout: '', stderr: '' };
    },
    gh: ({ args }) => {
      if (args[0] === 'issue' && args[1] === 'list') {
        return { code: 0, stdout: JSON.stringify([{ number: 44, title: 'Self-improvement: Existing', state: 'OPEN', url: 'https://example.test/44', labels: [], body: `source-base-sha:${'a'.repeat(40)}\n` }]) };
      }
      throw new Error(`unexpected gh call ${args.join(' ')}`);
    },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.discover({ preflight: false });
    assert.equal(result.status, 'reused');
    assert.equal(result.issueNumber, 44);
    assert.equal(exec.calls.some((call) => call.args[0] === 'issue' && call.args[1] === 'create'), false);
  } finally {
    await cleanup();
  }
});

for (const body of ['', `source-base-sha:${'b'.repeat(40)}\n`]) {
  test(`discovery rejects a reused issue with ${body ? 'a different' : 'no'} analyzed base`, async () => {
    const exec = makeExecStub({
      [legacyCodexCommand]: async ({ options }) => {
        await writeFile(options.reportPath, JSON.stringify({ status: 'completed', candidates: [validCandidate] }));
        return { code: 0, stdout: '', stderr: '' };
      },
      gh: ({ args }) => {
        if (args[1] === 'list') return { code: 0, stdout: JSON.stringify([{ number: 44, body }]) };
        throw new Error('unexpected issue mutation');
      },
    });
    const { runner, cleanup } = await makeRunner({ exec });
    try {
      const result = await runner.discover({ preflight: false });
      assert.equal(result.status, 'failed');
      assert.match(result.reason, /existing issue #44.*analyzed base/);
      assert.deepEqual(await runner.loadState(), {});
    } finally { await cleanup(); }
  });
}

test('discovery delegates baseline selection to the package and records that commit in the issue', async () => {
  const worktreePath = '/tmp/package-owned-discovery/worktree';
  const baseSha = 'b'.repeat(40);
  let targetRoot;
  let issueBody;
  const exec = makeExecStub({
    [legacyCodexCommand]: async ({ args, options }) => {
      assert.equal(args[args.indexOf('--cd') + 1], worktreePath);
      assert.equal(options.cwd, worktreePath);
      await writeFile(options.reportPath, JSON.stringify({ status: 'completed', candidates: [validCandidate] }));
      return { code: 0, stdout: '', stderr: '' };
    },
    gh: async ({ args }) => {
      if (args[1] === 'list') return { code: 0, stdout: '[]' };
      if (args[1] === 'create') {
        issueBody = await readFile(args[args.indexOf('--body-file') + 1], 'utf8');
        return { code: 0, stdout: 'https://github.com/M-Ivonin/admin-panel/issues/77' };
      }
      throw new Error('unexpected GitHub call');
    },
  });
  const { runner, cleanup } = await makeRunner({ exec, withRemoteBaseWorktree: async (target, analyze) => {
    targetRoot = target;
    return { baseSha, result: await analyze({ worktreePath, baseSha }) };
  } });
  try {
    assert.equal((await runner.discover({ preflight: false })).status, 'created');
    assert.equal(targetRoot, runner.paths.cwd);
    assert.match(issueBody, new RegExp(`source-base-sha:${baseSha}`));
    assert.equal((await runner.loadState()).lastDiscovery.baseSha, baseSha);
    assert.equal(exec.calls.some((call) => call.command === 'git'), false);
  } finally { await cleanup(); }
});

test('discovery publishes nothing when the package rejects a changed or unavailable base', async () => {
  const { runner, exec, cleanup } = await makeRunner({ withRemoteBaseWorktree: async () => {
    throw new Error('Remote base changed during discovery');
  } });
  try {
    const result = await runner.discover({ preflight: false });
    assert.equal(result.status, 'failed');
    assert.match(result.reason, /Remote base changed/);
    assert.equal(exec.calls.length, 0);
    assert.deepEqual(await runner.loadState(), {});
  } finally { await cleanup(); }
});

test('invalid discovery report creates no issue', () => {
  const result = validateDiscoveryReport({ status: 'completed', candidates: [{ ...validCandidate, verification: [] }] });
  assert.equal(result.ok, false);
});

test('implement command builds then runs targeted issue through installed orchestrator binary and never calls daemon', async () => {
  const exec = makeExecStub({
    [commandKey('npm', ['run', 'build', '--silent'])]: { code: 0, stdout: 'built' },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.implement({ issue: 123 });
    assert.equal(result.status, 'passed');
    assert.deepEqual(exec.calls.map((call) => [call.command, call.args]), [
      ['npm', ['run', 'build', '--silent']],
      [path.join(runner.paths.cwd, 'node_modules/.bin/codex-orchestrator'), ['run', '--target', runner.paths.cwd, '--issue', '123']],
    ]);
    assert.equal(exec.calls.some((call) => call.args.includes('daemon')), false);
  } finally {
    await cleanup();
  }
});

test('implement treats blocked handoff output as blocked even when the CLI exits zero', async () => {
  const exec = makeExecStub({
    npm: { code: 0, stdout: 'built' },
    codexOrchestrator: { code: 0, stdout: '' },
  });
  exec.calls.length = 0;
  const originalExec = exec;
  const dispatchingExec = async (command, args = [], options = {}) => {
    originalExec.calls.push({ command, args, options });
    if (command === 'npm') return { code: 0, stdout: 'built', stderr: '' };
    if (command.endsWith('node_modules/.bin/codex-orchestrator')) {
      return {
        code: 0,
        stdout: 'codex-orchestrator blocked scoped execution for #123\n- outcome: blocked\n',
        stderr: '',
      };
    }
    return { code: 0, stdout: '', stderr: '' };
  };
  dispatchingExec.calls = originalExec.calls;
  const { runner, cleanup } = await makeRunner({ exec: dispatchingExec });
  try {
    const result = await runner.implement({ issue: 123 });
    assert.equal(result.status, 'blocked');
    assert.equal(result.issueNumber, 123);
    assert.match(result.reason, /blocked scoped execution/);
  } finally {
    await cleanup();
  }
});

test('daily implements one code issue and never runs review backlog follow-up publication', async () => {
  const exec = makeExecStub({
    gh: ({ args }) => {
      if (args[0] === 'repo') return { code: 0, stdout: JSON.stringify({ nameWithOwner: 'M-Ivonin/admin-panel' }) };
      if (args[0] === 'auth') return { code: 0, stdout: '' };
      if (args[0] === 'label' && args[1] === 'list') return { code: 0, stdout: JSON.stringify([{ name: 'agent:auto' }, { name: 'agent:manual' }, { name: 'self-improvement' }]) };
      if (args[0] === 'issue' && args[1] === 'list' && args.includes('self-improvement-runner-id:levantem-admin-panel-local-self-improvement in:body')) return { code: 0, stdout: '[]' };
      if (args[0] === 'issue' && args[1] === 'list' && args.includes('self-improvement-runner-id:levantem-admin-panel-local-self-improvement source-date:2026-05-20 in:body')) return { code: 0, stdout: '[]' };
      if (args[0] === 'issue' && args[1] === 'list' && args.some((arg) => String(arg).startsWith('source-candidate-fingerprint:'))) return { code: 0, stdout: JSON.stringify([{ number: 222, title: 'existing', body: `source-base-sha:${'a'.repeat(40)}\n` }]) };
      if (args[0] === 'issue' && args[1] === 'list') return { code: 0, stdout: '[]' };
      return { code: 0, stdout: '' };
    },
    '/Applications/Codex.app/Contents/Resources/codex': async ({ options }) => {
      await writeFile(options.reportPath, JSON.stringify({ status: 'completed', candidates: [validCandidate], residualRisks: [] }));
      return { code: 0, stdout: '', stderr: '' };
    },
    [commandKey('npm', ['run', 'build', '--silent'])]: { code: 0, stdout: '' },
    [commandKey('npm', ['run', 'typecheck'])]: { code: 0, stdout: 'typecheck ok' },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.daily();
    assert.equal(result.phases.find((phase) => phase.name === 'post-implementation-check').status, 'passed');
    assert.equal(result.phases.find((phase) => phase.name === 'review-backlog').status, 'skipped');
    assert.equal(exec.calls.some((call) => call.command === 'npm' && call.args.join(' ') === 'run typecheck'), true);
    assert.equal(exec.calls.some((call) => call.args[0] === 'issue' && call.args[1] === 'view'), false);
    const smokeIndex = exec.calls.findIndex((call) => call.command === 'npm' && call.args.join(' ') === 'run typecheck');
    const implIndex = exec.calls.findIndex((call) => call.command.endsWith('node_modules/.bin/codex-orchestrator') && call.args.includes('--issue'));
    assert.ok(smokeIndex > implIndex);
  } finally {
    await cleanup();
  }

  const failingCalls = [];
  const dispatchingFailingExec = async (command, args = [], options = {}) => {
    failingCalls.push({ command, args, options });
    if (command === 'gh') {
      if (args[0] === 'repo') return { code: 0, stdout: JSON.stringify({ nameWithOwner: 'M-Ivonin/admin-panel' }) };
      if (args[0] === 'auth') return { code: 0, stdout: '' };
      if (args[0] === 'label' && args[1] === 'list') return { code: 0, stdout: JSON.stringify([{ name: 'agent:auto' }, { name: 'agent:manual' }, { name: 'self-improvement' }]) };
      if (args[0] === 'issue' && args[1] === 'list' && args.includes('self-improvement-runner-id:levantem-admin-panel-local-self-improvement in:body')) return { code: 0, stdout: '[]' };
      if (args[0] === 'issue' && args[1] === 'list' && args.includes('self-improvement-runner-id:levantem-admin-panel-local-self-improvement source-date:2026-05-20 in:body')) return { code: 0, stdout: '[]' };
      if (args[0] === 'issue' && args[1] === 'list' && args.some((arg) => String(arg).startsWith('source-candidate-fingerprint:'))) return { code: 0, stdout: JSON.stringify([{ number: 223, title: 'existing' }]) };
      if (args[0] === 'issue' && args[1] === 'list') return { code: 0, stdout: '[]' };
      return { code: 0, stdout: '' };
    }
    if (command === '/Applications/Codex.app/Contents/Resources/codex') {
      await writeFile(options.reportPath, JSON.stringify({ status: 'completed', candidates: [validCandidate], residualRisks: [] }));
      return { code: 0, stdout: '', stderr: '' };
    }
    if (command === 'npm' && args.join(' ') === 'run build --silent') return { code: 0, stdout: '', stderr: '' };
    if (command.endsWith('node_modules/.bin/codex-orchestrator')) return { code: 1, stdout: '', stderr: 'failed' };
    return { code: 0, stdout: '', stderr: '' };
  };
  dispatchingFailingExec.calls = failingCalls;
  const second = await makeRunner({ exec: dispatchingFailingExec });
  try {
    const result = await second.runner.daily();
    assert.equal(result.phases.find((phase) => phase.name === 'post-implementation-check').status, 'skipped');
    assert.equal(result.phases.find((phase) => phase.name === 'review-backlog').status, 'skipped');
    assert.equal(failingCalls.some((call) => call.command === 'npm' && call.args.join(' ') === 'run typecheck'), false);
    assert.equal(failingCalls.some((call) => call.args[0] === 'issue' && call.args[1] === 'view'), false);
  } finally {
    await second.cleanup();
  }
});

test('daily reuses an open auto self-improvement issue instead of discovering another one', async () => {
  const exec = makeExecStub({
    gh: ({ args }) => {
      if (args[0] === 'repo') return { code: 0, stdout: JSON.stringify({ nameWithOwner: 'M-Ivonin/admin-panel' }) };
      if (args[0] === 'auth') return { code: 0, stdout: '' };
      if (args[0] === 'label' && args[1] === 'list') return { code: 0, stdout: JSON.stringify([{ name: 'agent:auto' }, { name: 'agent:manual' }, { name: 'self-improvement' }]) };
      if (args[0] === 'issue' && args[1] === 'list' && args.includes('self-improvement-runner-id:levantem-admin-panel-local-self-improvement in:body')) {
        return { code: 0, stdout: JSON.stringify([
          { number: 310, title: 'active', state: 'OPEN', labels: [{ name: 'agent:auto' }, { name: 'self-improvement' }] },
        ]) };
      }
      throw new Error(`unexpected gh call ${args.join(' ')}`);
    },
    [commandKey('npm', ['run', 'build', '--silent'])]: { code: 0, stdout: '' },
    [commandKey('npm', ['run', 'typecheck'])]: { code: 0, stdout: 'typecheck ok' },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.daily();
    assert.equal(result.phases.find((phase) => phase.name === 'select').issueNumber, 310);
    assert.equal(result.phases.find((phase) => phase.name === 'discover'), undefined);
    assert.equal(exec.calls.some((call) => call.command === '/Applications/Codex.app/Contents/Resources/codex'), false);
    assert.equal(exec.calls.some((call) => call.args[0] === 'issue' && call.args[1] === 'create'), false);
  } finally {
    await cleanup();
  }
});

test('daily enforces one created self-improvement issue per day', async () => {
  const exec = makeExecStub({
    gh: ({ args }) => {
      if (args[0] === 'repo') return { code: 0, stdout: JSON.stringify({ nameWithOwner: 'M-Ivonin/admin-panel' }) };
      if (args[0] === 'auth') return { code: 0, stdout: '' };
      if (args[0] === 'label' && args[1] === 'list') return { code: 0, stdout: JSON.stringify([{ name: 'agent:auto' }, { name: 'agent:manual' }, { name: 'self-improvement' }]) };
      if (args[0] === 'issue' && args[1] === 'list' && args.includes('self-improvement-runner-id:levantem-admin-panel-local-self-improvement in:body')) return { code: 0, stdout: '[]' };
      if (args[0] === 'issue' && args[1] === 'list' && args.includes('self-improvement-runner-id:levantem-admin-panel-local-self-improvement source-date:2026-05-20 in:body')) {
        return { code: 0, stdout: JSON.stringify([
          { number: 311, title: 'today', state: 'CLOSED', labels: [{ name: 'agent:auto' }, { name: 'self-improvement' }] },
        ]) };
      }
      throw new Error(`unexpected gh call ${args.join(' ')}`);
    },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.daily();
    assert.equal(result.exitCode, 0);
    assert.equal(result.phases.find((phase) => phase.name === 'select').status, 'daily-limit');
    assert.equal(result.phases.find((phase) => phase.name === 'discover'), undefined);
    assert.equal(exec.calls.some((call) => call.command === '/Applications/Codex.app/Contents/Resources/codex'), false);
    assert.equal(exec.calls.some((call) => call.args[0] === 'issue' && call.args[1] === 'create'), false);
  } finally {
    await cleanup();
  }
});

test('daily reports an existing blocked self-improvement issue as blocked instead of creating another one', async () => {
  const exec = makeExecStub({
    gh: ({ args }) => {
      if (args[0] === 'repo') return { code: 0, stdout: JSON.stringify({ nameWithOwner: 'M-Ivonin/admin-panel' }) };
      if (args[0] === 'auth') return { code: 0, stdout: '' };
      if (args[0] === 'label' && args[1] === 'list') return { code: 0, stdout: JSON.stringify([{ name: 'agent:auto' }, { name: 'agent:manual' }, { name: 'self-improvement' }]) };
      if (args[0] === 'issue' && args[1] === 'list' && args.includes('self-improvement-runner-id:levantem-admin-panel-local-self-improvement in:body')) {
        return { code: 0, stdout: JSON.stringify([
          { number: 312, title: 'blocked', state: 'OPEN', labels: [{ name: 'agent:auto' }, { name: 'agent:blocked' }, { name: 'self-improvement' }] },
        ]) };
      }
      throw new Error(`unexpected gh call ${args.join(' ')}`);
    },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.daily();
    assert.equal(result.exitCode, 1);
    assert.equal(result.phases.find((phase) => phase.name === 'select').issueNumber, 312);
    assert.equal(result.phases.find((phase) => phase.name === 'implement').status, 'blocked');
    assert.equal(result.phases.find((phase) => phase.name === 'discover'), undefined);
    assert.equal(exec.calls.some((call) => call.args[0] === 'issue' && call.args[1] === 'create'), false);
  } finally {
    await cleanup();
  }
});

test('review creates or reuses only agent:manual self-improvement follow-ups', async () => {
  const exec = makeExecStub({
    gh: ({ args }) => {
      if (args[0] === 'issue' && args[1] === 'list' && args.includes('self-improvement-runner-id:levantem-admin-panel-local-self-improvement in:body')) {
        return { code: 0, stdout: JSON.stringify([{ number: 12, title: 'source', labels: [{ name: 'agent:review' }, { name: 'self-improvement' }] }]) };
      }
      if (args[0] === 'issue' && args[1] === 'view') {
        return { code: 0, stdout: JSON.stringify({
          number: 12,
          title: 'source',
          body: 'self-improvement-runner-id:levantem-admin-panel-local-self-improvement',
          state: 'OPEN',
          url: 'https://example.test/12',
          labels: [{ name: 'agent:review' }, { name: 'self-improvement' }],
          comments: [],
          closedByPullRequestsReferences: [],
        }) };
      }
      if (args[0] === 'issue' && args[1] === 'list' && args.some((arg) => String(arg).startsWith('finding-fingerprint:'))) return { code: 0, stdout: '[]' };
      if (args[0] === 'issue' && args[1] === 'create') return { code: 0, stdout: 'https://github.com/M-Ivonin/admin-panel/issues/88' };
      return { code: 0, stdout: '' };
    },
    '/Applications/Codex.app/Contents/Resources/codex': async ({ options }) => {
      await writeFile(options.reportPath, JSON.stringify({ status: 'completed', findings: [validFinding], residualRisks: [] }));
      return { code: 0, stdout: '', stderr: '' };
    },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.review({ preflight: false });
    assert.equal(result.status, 'completed');
    assert.equal(result.created.length, 1);
    assert.deepEqual(result.created[0], {
      status: 'created',
      issueNumber: 88,
      url: 'https://github.com/M-Ivonin/admin-panel/issues/88',
      fingerprint: fingerprintFinding(validFinding),
    });
    const createCall = exec.calls.find((call) => call.args[0] === 'issue' && call.args[1] === 'create');
    assert.ok(createCall);
    assert.equal(createCall.args.includes('agent:auto'), false);
    assert.deepEqual(createCall.args.filter((arg) => arg === '--label' || arg === 'agent:manual' || arg === 'self-improvement'), [
      '--label',
      'agent:manual',
      '--label',
      'self-improvement',
    ]);
  } finally {
    await cleanup();
  }
});

test('review skips running and blocked sources and reuses duplicate finding fingerprints', async () => {
  assert.equal(validateReviewReport({ status: 'completed', findings: [{ ...validFinding, proposedFix: '' }] }).ok, false);
  const exec = makeExecStub({
    gh: ({ args }) => {
      if (args[0] === 'issue' && args[1] === 'list' && args.includes('self-improvement-runner-id:levantem-admin-panel-local-self-improvement in:body')) {
        return { code: 0, stdout: JSON.stringify([
          { number: 13, title: 'running', labels: [{ name: 'agent:running' }, { name: 'self-improvement' }] },
          { number: 14, title: 'blocked', labels: [{ name: 'agent:blocked' }, { name: 'self-improvement' }] },
          { number: 15, title: 'review', labels: [{ name: 'agent:review' }, { name: 'self-improvement' }] },
        ]) };
      }
      if (args[0] === 'issue' && args[1] === 'view') {
        return { code: 0, stdout: JSON.stringify({
          number: Number(args[2]),
          title: 'source',
          body: 'self-improvement-runner-id:levantem-admin-panel-local-self-improvement',
          state: 'OPEN',
          url: `https://example.test/${args[2]}`,
          labels: [{ name: 'agent:review' }, { name: 'self-improvement' }],
          comments: [],
          closedByPullRequestsReferences: [],
        }) };
      }
      if (args[0] === 'issue' && args[1] === 'list' && args.some((arg) => String(arg).startsWith('finding-fingerprint:'))) {
        return { code: 0, stdout: JSON.stringify([{ number: 90, title: 'existing', url: 'https://example.test/90' }]) };
      }
      throw new Error(`unexpected gh call ${args.join(' ')}`);
    },
    '/Applications/Codex.app/Contents/Resources/codex': async ({ options }) => {
      await writeFile(options.reportPath, JSON.stringify({ status: 'completed', findings: [validFinding], residualRisks: [] }));
      return { code: 0, stdout: '', stderr: '' };
    },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.review({ preflight: false });
    assert.equal(result.reused.length, 1);
    assert.deepEqual(result.reused[0], {
      status: 'reused',
      issueNumber: 90,
      url: 'https://example.test/90',
      fingerprint: fingerprintFinding(validFinding),
    });
    assert.equal(exec.calls.filter((call) => call.args[0] === 'issue' && call.args[1] === 'view').length, 1);
    assert.equal(exec.calls.some((call) => call.args[0] === 'issue' && call.args[1] === 'create'), false);
  } finally {
    await cleanup();
  }
});

test('shared preflight failure stops daily mutation phases', async () => {
  const exec = makeExecStub({
    [commandKey('gh', ['repo', 'view', 'M-Ivonin/admin-panel', '--json', 'nameWithOwner'])]: {
      code: 1,
      stderr: 'no repo',
    },
  });
  const { runner, cleanup } = await makeRunner({ exec });
  try {
    const result = await runner.daily();
    assert.equal(result.exitCode, 1);
    assert.deepEqual(result.phases.map((phase) => phase.name), ['preflight']);
    assert.equal(exec.calls.some((call) => call.args[0] === 'issue'), false);
  } finally {
    await cleanup();
  }
});

test('daily does not remove an active lock it failed to acquire', async () => {
  const { runner, cleanup } = await makeRunner({
    now: () => new Date('2026-05-20T20:30:00.000Z'),
    hostname: () => 'test-host',
    isPidAlive: () => true,
  });
  try {
    await mkdir(path.join(runner.paths.localDir, 'lock'), { recursive: true });
    await writeFile(
      path.join(runner.paths.localDir, 'lock/lock.json'),
      JSON.stringify({ pid: 999, hostname: 'test-host', timestamp: '2026-05-20T20:00:00.000Z' }),
    );
    const result = await runner.daily();
    assert.equal(result.exitCode, 1);
    assert.equal(existsSync(path.join(runner.paths.localDir, 'lock/lock.json')), true);
  } finally {
    await cleanup();
  }
});

test('state load/save preserves audit data', async () => {
  const { runner, cleanup } = await makeRunner();
  try {
    await runner.saveState({ created: [1] });
    assert.deepEqual(await runner.loadState(), { created: [1] });
    assert.equal(existsSync(path.join(runner.paths.localDir, 'state.json')), true);
  } finally {
    await cleanup();
  }
});
