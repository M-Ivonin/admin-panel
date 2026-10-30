#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import {
  access,
  mkdir,
  readFile,
  rm,
  writeFile,
  mkdtemp,
} from 'node:fs/promises';
import { constants, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const REPO = 'M-Ivonin/admin-panel';
const RUNNER_ID = 'levantem-admin-panel-local-self-improvement';
const DEFAULT_CWD = '/Users/serhiimytakii/Projects/Levantem/admin-panel';
const CODEX_CONFIG_PATH = '.codex-orchestrator/config.json';
const POST_IMPLEMENTATION_CHECK_COMMAND = ['run', 'typecheck'];
const STALE_LOCK_MS = 12 * 60 * 60 * 1000;

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash('sha256').update(stableJson(value)).digest('hex');
}

export function fingerprintCandidate(candidate) {
  return sha256({
    title: candidate.title,
    files: candidate.files,
    problem: candidate.problem,
    solution: candidate.solution,
    benefits: candidate.benefits,
    verification: candidate.verification,
    risk: candidate.risk,
    adrConflict: candidate.adrConflict,
  });
}

export function fingerprintFinding(finding) {
  return sha256({
    summary: finding.summary,
    evidence: finding.evidence,
    proposedFix: finding.proposedFix,
    sourceIssue: finding.sourceIssue,
    sourcePr: finding.sourcePr ?? null,
    findingFingerprint: finding.findingFingerprint,
  });
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function nonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(nonEmptyString);
}

function normalizeResidualRisks(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(nonEmptyString).map((risk) => risk.trim());
}

function hasRequiredFields(item, fieldValidators) {
  return Object.entries(fieldValidators).every(([field, validator]) => validator(item[field]));
}

function createReportContract({
  itemKey,
  shapeReason,
  noValidReason,
  allowEmptyValidItems = false,
  itemLimit,
  isValidItem,
}) {
  return Object.freeze({
    validate(report) {
      if (!report || report.status !== 'completed' || !Array.isArray(report[itemKey])) {
        return { ok: false, reason: shapeReason };
      }
      const items = report[itemKey];
      const valid = items.filter(isValidItem);
      if (valid.length === 0 && (!allowEmptyValidItems || items.length > 0)) {
        return { ok: false, reason: noValidReason };
      }
      const limited = Number.isInteger(itemLimit) ? valid.slice(0, itemLimit) : valid;
      return { ok: true, [itemKey]: limited, residualRisks: normalizeResidualRisks(report.residualRisks) };
    },
  });
}

const discoveryCandidateFields = Object.freeze({
  title: nonEmptyString,
  files: nonEmptyStringArray,
  problem: nonEmptyString,
  solution: nonEmptyString,
  benefits: nonEmptyStringArray,
  verification: nonEmptyStringArray,
  risk: nonEmptyString,
  adrConflict: nonEmptyString,
});

const reviewFindingFields = Object.freeze({
  summary: nonEmptyString,
  evidence: nonEmptyString,
  proposedFix: nonEmptyString,
  sourceIssue: (value) => Number.isInteger(Number(value)),
  findingFingerprint: nonEmptyString,
});

function isValidDiscoveryCandidate(candidate) {
  if (!candidate || typeof candidate !== 'object') return false;
  if (!hasRequiredFields(candidate, discoveryCandidateFields)) return false;
  return candidate.adrConflict.trim().toLowerCase() === 'none';
}

function isValidReviewFinding(finding) {
  if (!finding || typeof finding !== 'object') return false;
  return hasRequiredFields(finding, reviewFindingFields);
}

export const reportContracts = Object.freeze({
  discovery: createReportContract({
    itemKey: 'candidates',
    shapeReason: 'Discovery report must contain status completed and candidates array.',
    noValidReason: 'Discovery report has no valid candidates.',
    isValidItem: isValidDiscoveryCandidate,
  }),
  review: createReportContract({
    itemKey: 'findings',
    shapeReason: 'Review report must contain status completed and findings array.',
    noValidReason: 'Review report has findings but none are valid.',
    allowEmptyValidItems: true,
    itemLimit: 5,
    isValidItem: isValidReviewFinding,
  }),
});

export function validateDiscoveryReport(report) {
  return reportContracts.discovery.validate(report);
}

export function validateReviewReport(report) {
  return reportContracts.review.validate(report);
}

async function defaultExec(command, args = [], options = {}) {
  return await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    const timeout = options.timeout
      ? setTimeout(() => {
        child.kill('SIGTERM');
        stderr += `\nTimed out after ${options.timeout} ms`;
      }, options.timeout)
      : null;
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => {
      if (timeout) clearTimeout(timeout);
      resolve({ code: 127, stdout, stderr: `${stderr}${error.message}` });
    });
    child.on('close', (code) => {
      if (timeout) clearTimeout(timeout);
      resolve({ code: code ?? 1, stdout, stderr });
    });
    if (options.stdin) child.stdin.end(options.stdin);
    else child.stdin.end();
  });
}

function parseJson(stdout, fallback) {
  const text = stdout && stdout.trim().length > 0 ? stdout : fallback;
  return JSON.parse(text || 'null');
}

async function canExecute(filePath) {
  try {
    await access(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function resolveExecutable(command, { cwd, env }) {
  if (!nonEmptyString(command)) return null;
  const trimmed = command.trim();
  if (path.isAbsolute(trimmed) || trimmed.includes(path.sep)) {
    const candidate = path.isAbsolute(trimmed) ? trimmed : path.resolve(cwd, trimmed);
    return await canExecute(candidate) ? candidate : null;
  }
  for (const entry of String(env.PATH ?? '').split(path.delimiter).filter(Boolean)) {
    const candidate = path.join(entry, trimmed);
    if (await canExecute(candidate)) return candidate;
  }
  return null;
}

function issueNumberFromUrl(value) {
  const match = String(value).match(/\/issues\/(\d+)/);
  return match ? Number(match[1]) : undefined;
}

function markerValue(marker) {
  const index = String(marker).indexOf(':');
  return index === -1 ? String(marker) : String(marker).slice(index + 1);
}

function labelsOf(issue) {
  return (issue.labels ?? []).map((label) => typeof label === 'string' ? label : label.name).filter(Boolean);
}

function isReviewEligible(issue) {
  const labels = labelsOf(issue);
  if (!labels.includes('self-improvement')) return false;
  if (labels.includes('agent:running') || labels.includes('agent:blocked')) return false;
  if (labels.includes('agent:review')) return true;
  if (issue.state === 'CLOSED' && Array.isArray(issue.closedByPullRequestsReferences) && issue.closedByPullRequestsReferences.length > 0) return true;
  if (Array.isArray(issue.closedByPullRequestsReferences) && issue.closedByPullRequestsReferences.length > 0) return true;
  return false;
}

function isSelfImprovementCodeIssue(issue) {
  const labels = labelsOf(issue);
  return labels.includes('self-improvement') && labels.includes('agent:auto');
}

function hasBlockingWorkflowState(issue) {
  const labels = labelsOf(issue);
  return labels.includes('agent:running') || labels.includes('agent:blocked');
}

function isBlockedWorkflowState(issue) {
  return labelsOf(issue).includes('agent:blocked');
}

function renderDiscoveryIssue(candidate, fingerprint, date, baseSha) {
  return `## Self-improvement candidate

Problem:
${candidate.problem}

Solution:
${candidate.solution}

Initial implementation focus:
${candidate.files.map((file) => `- ${file}`).join('\n')}

Benefits:
${candidate.benefits.map((benefit) => `- ${benefit}`).join('\n')}

Verification:
${candidate.verification.map((item) => `- ${item}`).join('\n')}

Risk:
${candidate.risk}

ADR conflict:
${candidate.adrConflict}

Acceptance criteria:
- Implement the proposed architecture improvement with the smallest safe blast radius.
- Run the listed verification or document the blocker.
- Related test files may be created or minimally updated only to prove the listed acceptance criteria. Changes to unrelated production files are outside scope.
- Explicit file exclusions and hard allowlists remain binding. Do not skip tests, weaken assertions, or change unrelated behavior.

## Levantem admin-panel metadata
- owner: local self-improvement runner
- candidate files: ${candidate.files.join(', ')}
- source-date: ${date}

self-improvement-runner-id:${RUNNER_ID}
source-candidate-fingerprint:${fingerprint}
source-date:${date}
source-base-sha:${baseSha}
`;
}

function renderFollowUpIssue(finding, fingerprint) {
  return `## Review finding

Summary:
${finding.summary}

Evidence:
${finding.evidence}

Proposed fix:
${finding.proposedFix}

self-improvement-runner-id:${RUNNER_ID}
source-issue:${finding.sourceIssue}
source-pr:${finding.sourcePr ?? 'none'}
finding-fingerprint:${fingerprint}
`;
}

function summarizeOutput(result) {
  return `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim().slice(0, 2000);
}

function createDailyPhaseResult(name, result = {}) {
  return { name, ...result };
}

function isDailyPhaseFailure(phase) {
  return phase?.status === 'failed' || phase?.status === 'blocked';
}

function dailyPhaseExitCode(phases) {
  return phases.some(isDailyPhaseFailure) ? 1 : 0;
}

function renderDailyPhaseSummaryLine(phase) {
  const details = [
    phase.issueNumber ? `issue #${phase.issueNumber}` : '',
    phase.created?.length ? `created ${phase.created.length}` : '',
    phase.reused?.length ? `reused ${phase.reused.length}` : '',
    phase.reason ? phase.reason : '',
  ].filter(Boolean).join('; ');
  return `${phase.name}: ${phase.status}${details ? ` (${details})` : ''}`;
}

function renderDailyPhaseSummaryLines(phases) {
  return phases.map(renderDailyPhaseSummaryLine);
}

export const dailyPhase = Object.freeze({
  result: createDailyPhaseResult,
  failed: isDailyPhaseFailure,
  exitCode: dailyPhaseExitCode,
  summaryLine: renderDailyPhaseSummaryLine,
  summaryLines: renderDailyPhaseSummaryLines,
});

export function createRunner(options = {}) {
  const cwd = options.cwd ?? DEFAULT_CWD;
  const localDir = options.localDir ?? path.join(cwd, '.codex-orchestrator/local/self-improvement');
  const exec = options.exec ?? defaultExec;
  const env = options.env ?? process.env;
  const now = options.now ?? (() => new Date());
  const hostname = options.hostname ?? (() => os.hostname());
  const pid = options.pid ?? process.pid;
  const isPidAlive = options.isPidAlive ?? ((targetPid) => {
    try {
      process.kill(targetPid, 0);
      return true;
    } catch {
      return false;
    }
  });
  const explicitCodexCommand = options.codexCommand;
  const analyzeRemoteBase = options.withRemoteBaseWorktree ?? (async (targetRoot, analyze) => {
    const { withRemoteBaseWorktree } = await import('codex-orchestrator');
    return withRemoteBaseWorktree(targetRoot, analyze);
  });

  const paths = {
    cwd,
    localDir,
    state: path.join(localDir, 'state.json'),
    lock: path.join(localDir, 'lock'),
    prompts: path.join(localDir, 'prompts'),
    reports: path.join(localDir, 'reports'),
    config: path.join(cwd, CODEX_CONFIG_PATH),
  };

  async function ensureDirs() {
    await mkdir(paths.localDir, { recursive: true });
    await mkdir(paths.prompts, { recursive: true });
    await mkdir(paths.reports, { recursive: true });
  }

  async function loadState() {
    try {
      return JSON.parse(await readFile(paths.state, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') return {};
      throw error;
    }
  }

  async function saveState(state) {
    await ensureDirs();
    await writeFile(paths.state, `${JSON.stringify(state, null, 2)}\n`);
  }

  async function loadConfiguredCodexCommand() {
    try {
      const config = JSON.parse(await readFile(paths.config, 'utf8'));
      return nonEmptyString(config?.codex?.command) ? config.codex.command : null;
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  async function resolveCodexCommand() {
    if (nonEmptyString(explicitCodexCommand)) return explicitCodexCommand.trim();
    const configured = await loadConfiguredCodexCommand();
    const configuredCommand = await resolveExecutable(configured, { cwd, env });
    if (configuredCommand) return configuredCommand;
    const pathCommand = await resolveExecutable('codex', { cwd, env });
    if (pathCommand) return pathCommand;
    throw new Error(
      configured
        ? `codex command unavailable: configured '${configured}' is not executable and no 'codex' binary was found on PATH`
        : "codex command unavailable: no configured command or 'codex' binary was found on PATH",
    );
  }

  async function acquireLock() {
    await ensureDirs();
    try {
      await mkdir(paths.lock);
      await writeFile(path.join(paths.lock, 'lock.json'), JSON.stringify({
        pid,
        hostname: hostname(),
        timestamp: now().toISOString(),
      }, null, 2));
      return { ok: true };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let lock = null;
      try {
        lock = JSON.parse(await readFile(path.join(paths.lock, 'lock.json'), 'utf8'));
      } catch {
        throw new Error('active lock exists and cannot be inspected');
      }
      const age = now().getTime() - new Date(lock.timestamp).getTime();
      const sameHost = lock.hostname === hostname();
      const deadPid = !isPidAlive(Number(lock.pid));
      if (sameHost && deadPid && age > STALE_LOCK_MS) {
        await rm(paths.lock, { recursive: true, force: true });
        return acquireLock();
      }
      throw new Error('active lock exists');
    }
  }

  async function releaseLock() {
    await rm(paths.lock, { recursive: true, force: true });
  }

  async function preflight() {
    try {
      await resolveCodexCommand();
    } catch (error) {
      return { ok: false, reason: error.message };
    }

    const repo = await exec('gh', ['repo', 'view', REPO, '--json', 'nameWithOwner'], { cwd });
    if (repo.code !== 0) return { ok: false, reason: `repo identity check failed: ${summarizeOutput(repo)}` };
    let repoJson;
    try {
      repoJson = parseJson(repo.stdout);
    } catch {
      return { ok: false, reason: 'repo identity check returned invalid JSON' };
    }
    if (repoJson?.nameWithOwner !== REPO) return { ok: false, reason: `repo identity mismatch: ${repoJson?.nameWithOwner ?? 'unknown'}` };

    const auth = await exec('gh', ['auth', 'status'], { cwd });
    if (auth.code !== 0) return { ok: false, reason: `gh auth status failed: ${summarizeOutput(auth)}` };

    const labels = await exec('gh', ['label', 'list', '--repo', REPO, '--limit', '1000', '--json', 'name'], { cwd });
    if (labels.code !== 0) return { ok: false, reason: `gh label list failed: ${summarizeOutput(labels)}` };
    let labelNames;
    try {
      labelNames = parseJson(labels.stdout).map((label) => label.name);
    } catch {
      return { ok: false, reason: 'label list returned invalid JSON' };
    }
    for (const required of ['agent:auto', 'agent:manual']) {
      if (!labelNames.includes(required)) return { ok: false, reason: `required label missing: ${required}` };
    }
    if (!labelNames.includes('self-improvement')) {
      const created = await exec('gh', [
        'label',
        'create',
        'self-improvement',
        '--repo',
        REPO,
        '--color',
        '5319E7',
        '--description',
        'Local Levantem admin-panel self-improvement loop',
      ], { cwd });
      if (created.code !== 0) return { ok: false, reason: `self-improvement label create failed: ${summarizeOutput(created)}` };
    }
    return { ok: true };
  }

  async function runCodexJson({ phase, promptPath, contextText = '', reportPath, workingDirectory = cwd }) {
    await ensureDirs();
    const resolvedReportPath = reportPath ?? path.join(paths.reports, `${phase}-${Date.now()}.json`);
    const prompt = existsSync(promptPath) ? await readFile(promptPath, 'utf8') : '';
    const stdin = `${prompt.trim()}\n\n${contextText.trim()}\n`;
    let codexCommand;
    try {
      codexCommand = await resolveCodexCommand();
    } catch (error) {
      return { ok: false, reason: `Codex ${phase} failed preflight: ${error.message}` };
    }
    const args = [
      'exec',
      '--cd',
      workingDirectory,
      '--sandbox',
      'workspace-write',
      '--add-dir',
      localDir,
      '-c',
      'sandbox_workspace_write.network_access=true',
      '--output-last-message',
      resolvedReportPath,
      '-',
    ];
    const result = await exec(codexCommand, args, {
      cwd: workingDirectory,
      env,
      stdin,
      timeout: 1800000,
      reportPath: resolvedReportPath,
    });
    if (result.code !== 0) return { ok: false, reason: `Codex ${phase} exited ${result.code}: ${summarizeOutput(result)}` };
    let reportText;
    try {
      reportText = await readFile(resolvedReportPath, 'utf8');
    } catch {
      return { ok: false, reason: `Codex ${phase} report missing` };
    }
    try {
      return { ok: true, report: JSON.parse(reportText) };
    } catch {
      return { ok: false, reason: `Codex ${phase} invalid JSON` };
    }
  }

  async function searchIssueByMarker(marker) {
    const result = await exec('gh', [
      'issue',
      'list',
      '--repo',
      REPO,
      '--state',
      'all',
      '--limit',
      '100',
      '--search',
      `${marker} in:body`,
      '--json',
      'number,title,state,url,labels,body',
    ], { cwd });
    if (result.code !== 0) throw new Error(`marker search failed: ${summarizeOutput(result)}`);
    const issues = parseJson(result.stdout);
    return Array.isArray(issues) && issues.length > 0 ? issues[0] : null;
  }

  async function listSelfImprovementIssues({ state = 'open', search } = {}) {
    const result = await exec('gh', [
      'issue',
      'list',
      '--repo',
      REPO,
      '--state',
      state,
      '--limit',
      '100',
      '--search',
      search,
      '--json',
      'number,title,state,url,labels',
    ], { cwd });
    if (result.code !== 0) throw new Error(`self-improvement issue list failed: ${summarizeOutput(result)}`);
    const issues = parseJson(result.stdout);
    return Array.isArray(issues) ? issues.slice(0, 100) : [];
  }

  async function selectDailyIssue() {
    const activeIssues = await listSelfImprovementIssues({
      state: 'open',
      search: `self-improvement-runner-id:${RUNNER_ID} in:body`,
    });
    const active = activeIssues.find(isSelfImprovementCodeIssue);
    if (active) {
      return { status: 'existing', issueNumber: active.number, issue: active };
    }

    const date = now().toISOString().slice(0, 10);
    const todaysIssues = await listSelfImprovementIssues({
      state: 'all',
      search: `self-improvement-runner-id:${RUNNER_ID} source-date:${date} in:body`,
    });
    const todays = todaysIssues.find(isSelfImprovementCodeIssue);
    if (todays) {
      return {
        status: 'daily-limit',
        issueNumber: todays.number,
        issue: todays,
        reason: `self-improvement issue already created today: #${todays.number}`,
      };
    }

    return { status: 'none' };
  }

  async function publishSelfImprovementIssue({
    marker,
    title,
    body,
    agentLabel,
    sourceBaseSha,
  }) {
    const existing = await searchIssueByMarker(marker);
    const fingerprint = markerValue(marker);
    if (existing) {
      if (sourceBaseSha) {
        const markers = existing.body?.match(/^source-base-sha:.*$/gmu) ?? [];
        if (markers.length !== 1 || markers[0] !== `source-base-sha:${sourceBaseSha}`) {
          return { status: 'failed', reason: `existing issue #${existing.number} does not match the analyzed base; revalidate its provenance before reuse`, fingerprint };
        }
      }
      return { status: 'reused', issueNumber: existing.number, url: existing.url, fingerprint };
    }

    const tmp = await mkdtemp(path.join(os.tmpdir(), 'self-improvement-issue-'));
    const bodyPath = path.join(tmp, 'body.md');
    await writeFile(bodyPath, body);
    const created = await exec('gh', [
      'issue',
      'create',
      '--repo',
      REPO,
      '--title',
      title,
      '--body-file',
      bodyPath,
      '--label',
      agentLabel,
      '--label',
      'self-improvement',
    ], { cwd });
    if (created.code !== 0) return { status: 'failed', reason: `issue create failed: ${summarizeOutput(created)}`, fingerprint };
    const url = created.stdout.trim();
    return { status: 'created', issueNumber: issueNumberFromUrl(url), url, fingerprint };
  }

  async function discover({ preflight: runPreflight = true } = {}) {
    if (runPreflight) {
      const check = await preflight();
      if (!check.ok) return { status: 'failed', reason: check.reason };
    }
    let snapshot;
    try {
      snapshot = await analyzeRemoteBase(cwd, ({ worktreePath, baseSha }) => runCodexJson({
        phase: 'discover',
        promptPath: path.join(paths.prompts, 'discovery.md'),
        contextText: `Find one local self-improvement candidate for the Levantem admin-panel repository. Analyze only this checkout at remote base ${baseSha}; do not modify repository files.`,
        reportPath: path.join(paths.reports, 'discovery.json'),
        workingDirectory: worktreePath,
      }));
    } catch (error) {
      return { status: 'failed', reason: error.message };
    }
    const codex = snapshot.result;
    if (!codex.ok) return { status: 'failed', reason: codex.reason };
    const validation = validateDiscoveryReport(codex.report);
    if (!validation.ok) return { status: 'skipped', reason: validation.reason };
    const candidate = validation.candidates[0];
    const fingerprint = fingerprintCandidate(candidate);
    const publication = await publishSelfImprovementIssue({
      marker: `source-candidate-fingerprint:${fingerprint}`,
      title: `Self-improvement: ${candidate.title}`,
      body: renderDiscoveryIssue(candidate, fingerprint, now().toISOString().slice(0, 10), snapshot.baseSha),
      agentLabel: 'agent:auto',
      sourceBaseSha: snapshot.baseSha,
    });
    if (publication.status === 'failed') return { status: 'failed', reason: publication.reason };
    const state = await loadState();
    await saveState({
      ...state,
      lastDiscovery: {
        status: publication.status,
        issueNumber: publication.issueNumber,
        fingerprint,
        baseSha: snapshot.baseSha,
        at: now().toISOString(),
      },
    });
    return publication;
  }

  async function implement({ issue } = {}) {
    if (!Number.isInteger(Number(issue))) return { status: 'skipped', reason: 'missing issue number' };
    const build = await exec('npm', ['run', 'build', '--silent'], { cwd });
    if (build.code !== 0) return { status: 'failed', exitCode: build.code, reason: `build failed: ${summarizeOutput(build)}` };
    const orchestratorCommand = path.join(cwd, 'node_modules/.bin/codex-orchestrator');
    const result = await exec(orchestratorCommand, ['run', '--target', cwd, '--issue', String(issue)], { cwd });
    const summary = summarizeOutput(result);
    if (result.code === 0 && /blocked scoped execution|outcome:\s*blocked|status:\s*blocked/iu.test(summary)) {
      return { status: 'blocked', exitCode: 0, reason: summary, issueNumber: Number(issue) };
    }
    if (result.code === 0) return { status: 'passed', exitCode: 0, summary, issueNumber: Number(issue) };
    return { status: 'failed', exitCode: result.code, reason: summarizeOutput(result), issueNumber: Number(issue) };
  }

  async function runPostImplementationCheck({ implementation } = {}) {
    if (!implementation || implementation.status !== 'passed' || implementation.exitCode !== 0) {
      return { status: 'skipped', reason: implementation?.reason ? `implementation failed: ${implementation.reason}` : 'implementation not started or not successful' };
    }
    const result = await exec('npm', POST_IMPLEMENTATION_CHECK_COMMAND, { cwd });
    const check = { status: result.code === 0 ? 'passed' : 'failed', exitCode: result.code, summary: summarizeOutput(result) };
    const state = await loadState();
    await saveState({ ...state, lastPostImplementationCheck: { ...check, at: now().toISOString() } });
    return check;
  }

  async function listReviewSources() {
    const result = await exec('gh', [
      'issue',
      'list',
      '--repo',
      REPO,
      '--state',
      'all',
      '--limit',
      '100',
      '--search',
      `self-improvement-runner-id:${RUNNER_ID} in:body`,
      '--json',
      'number,title,state,url,labels',
    ], { cwd });
    if (result.code !== 0) throw new Error(`review source list failed: ${summarizeOutput(result)}`);
    return parseJson(result.stdout).slice(0, 100);
  }

  async function viewIssue(number) {
    const result = await exec('gh', [
      'issue',
      'view',
      String(number),
      '--repo',
      REPO,
      '--json',
      'number,title,body,state,url,labels,comments,closedByPullRequestsReferences',
    ], { cwd });
    if (result.code !== 0) throw new Error(`issue view failed for ${number}: ${summarizeOutput(result)}`);
    return parseJson(result.stdout);
  }

  async function review({ preflight: runPreflight = true } = {}) {
    if (runPreflight) {
      const check = await preflight();
      if (!check.ok) return { status: 'failed', reason: check.reason, created: [], reused: [] };
    }
    const sourceSummaries = await listReviewSources();
    const eligible = [];
    for (const summary of sourceSummaries) {
      if (eligible.length >= 5) break;
      if (labelsOf(summary).includes('agent:running') || labelsOf(summary).includes('agent:blocked')) continue;
      const issue = await viewIssue(summary.number);
      if (isReviewEligible(issue)) eligible.push(issue);
    }
    const created = [];
    const reused = [];
    for (const issue of eligible) {
      const codex = await runCodexJson({
        phase: 'review',
        promptPath: path.join(paths.prompts, 'review.md'),
        contextText: JSON.stringify({ sourceIssue: issue }, null, 2),
        reportPath: path.join(paths.reports, `review-${issue.number}.json`),
      });
      if (!codex.ok) continue;
      const validation = validateReviewReport(codex.report);
      if (!validation.ok) continue;
      for (const finding of validation.findings.slice(0, 5)) {
        const fingerprint = fingerprintFinding(finding);
        const publication = await publishSelfImprovementIssue({
          marker: `finding-fingerprint:${fingerprint}`,
          title: `Self-improvement follow-up: ${finding.summary}`,
          body: renderFollowUpIssue(finding, fingerprint),
          agentLabel: 'agent:manual',
        });
        if (publication.status === 'created') created.push(publication);
        if (publication.status === 'reused') reused.push(publication);
      }
    }
    const state = await loadState();
    await saveState({ ...state, lastReview: { created, reused, at: now().toISOString() } });
    return { status: 'completed', created, reused, reviewedSources: eligible.map((issue) => issue.number) };
  }

  async function daily() {
    const phases = [];
    let lockAcquired = false;
    const addPhase = (name, result) => {
      const phase = dailyPhase.result(name, result);
      phases.push(phase);
      return phase;
    };
    try {
      await acquireLock();
      lockAcquired = true;
      const check = await preflight();
      addPhase('preflight', { status: check.ok ? 'passed' : 'failed', reason: check.reason });
      if (!check.ok) return { exitCode: dailyPhase.exitCode(phases), phases };

      const selection = await selectDailyIssue();
      if (selection.status !== 'none') addPhase('select', selection);

      let issueNumber = selection.issueNumber;
      if (selection.status === 'none') {
        const discovery = await discover({ preflight: false });
        addPhase('discover', discovery);
        issueNumber = discovery.issueNumber;
      }

      let implementation = { status: 'skipped', reason: 'discovery did not produce an issue number' };
      if (selection.status === 'daily-limit' && selection.issue?.state !== 'OPEN') {
        implementation = { status: 'skipped', reason: selection.reason, issueNumber };
      } else if (selection.issue && isBlockedWorkflowState(selection.issue)) {
        implementation = { status: 'blocked', reason: `existing issue has blocking workflow state: ${labelsOf(selection.issue).join(', ')}`, issueNumber };
      } else if (selection.issue && hasBlockingWorkflowState(selection.issue)) {
        implementation = { status: 'skipped', reason: `existing issue has blocking workflow state: ${labelsOf(selection.issue).join(', ')}`, issueNumber };
      } else if (issueNumber) {
        implementation = await implement({ issue: issueNumber });
      }
      addPhase('implement', implementation);

      const postImplementationCheck = await runPostImplementationCheck({ implementation });
      addPhase('post-implementation-check', postImplementationCheck);

      addPhase('review-backlog', { status: 'skipped', reason: 'daily run only creates or implements one self-improvement code issue' });
      return { exitCode: dailyPhase.exitCode(phases), phases };
    } catch (error) {
      addPhase('runner', { status: 'failed', reason: error.message });
      return { exitCode: dailyPhase.exitCode(phases), phases };
    } finally {
      if (lockAcquired) await releaseLock();
    }
  }

  function printSummary(result) {
    for (const line of dailyPhase.summaryLines(result.phases)) console.log(line);
  }

  return {
    paths,
    env,
    preflight,
    acquireLock,
    releaseLock,
    loadState,
    saveState,
    runCodexJson,
    resolveCodexCommand,
    searchIssueByMarker,
    listSelfImprovementIssues,
    selectDailyIssue,
    publishSelfImprovementIssue,
    discover,
    implement,
    runPostImplementationCheck,
    review,
    daily,
    printSummary,
  };
}

async function main() {
  const runner = createRunner();
  const [command, ...args] = process.argv.slice(2);
  if (!command || !['daily', 'discover', 'implement', 'review'].includes(command)) {
    console.error('Usage: node runner.mjs <daily|discover|implement --issue <number>|review>');
    process.exit(2);
  }
  if (command === 'daily') {
    const result = await runner.daily();
    runner.printSummary(result);
    process.exit(result.exitCode);
  }
  if (command === 'discover') {
    const result = await runner.discover();
    console.log(`discover: ${result.status}${result.issueNumber ? ` issue #${result.issueNumber}` : ''}${result.reason ? ` (${result.reason})` : ''}`);
    process.exit(result.status === 'failed' ? 1 : 0);
  }
  if (command === 'implement') {
    const issue = args[args.indexOf('--issue') + 1];
    const result = await runner.implement({ issue: Number(issue) });
    console.log(`implement: ${result.status}${result.issueNumber ? ` issue #${result.issueNumber}` : ''}${result.reason ? ` (${result.reason})` : ''}`);
    process.exit(result.status === 'failed' ? 1 : 0);
  }
  if (command === 'review') {
    const result = await runner.review();
    console.log(`review: ${result.status} created=${result.created.length} reused=${result.reused.length}${result.reason ? ` (${result.reason})` : ''}`);
    process.exit(result.status === 'failed' ? 1 : 0);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
