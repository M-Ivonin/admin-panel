import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const REQUIRED = [
  'VERCEL_TOKEN',
  'VERCEL_ORG_ID',
  'VERCEL_PROJECT_ID',
  'UPDATED_HOME_ANALYTICS_EXPECTED_ADMIN_SHA',
  'UPDATED_HOME_ANALYTICS_DEV_API_URL',
  'UPDATED_HOME_ANALYTICS_PRODUCTION_HOSTS',
];

/** Validates local revision, credentials and non-production target. */
export function validateUpdatedHomePreview({ env, head, status }) {
  for (const key of REQUIRED) {
    if (!env[key]?.trim()) throw new Error(`${key} is required.`);
  }
  if (status.trim())
    throw new Error('Preview deployment requires a clean worktree.');
  if (head !== env.UPDATED_HOME_ANALYTICS_EXPECTED_ADMIN_SHA.trim()) {
    throw new Error(
      'HEAD does not match UPDATED_HOME_ANALYTICS_EXPECTED_ADMIN_SHA.'
    );
  }
  if (env.VERCEL_ENV === 'production' || env.VERCEL_TARGET === 'production') {
    throw new Error('Updated Home preview refuses a production Vercel target.');
  }
  const apiUrl = new URL(env.UPDATED_HOME_ANALYTICS_DEV_API_URL);
  if (apiUrl.protocol !== 'https:') throw new Error('DEV API must use HTTPS.');
  if (apiUrl.username || apiUrl.password || apiUrl.search || apiUrl.hash) {
    throw new Error('DEV API URL must not contain credentials or parameters.');
  }
  const forbidden = env.UPDATED_HOME_ANALYTICS_PRODUCTION_HOSTS.split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (forbidden.includes(apiUrl.hostname.toLowerCase())) {
    throw new Error('DEV API host is in the production host set.');
  }
  return { apiUrl: apiUrl.origin, forbidden };
}

/** Returns the fixed local CLI commands; caller arguments are never forwarded. */
export function updatedHomePreviewCommands() {
  return [
    ['pull', '--yes', '--environment=preview'],
    ['build'],
    [
      'deploy',
      '--prebuilt',
      '--yes',
      '--target=preview',
      '--meta',
      'updatedHomeAnalyticsCommit=__SHA__',
    ],
  ];
}

function runVercel(binary, args, env, capture = false) {
  const result = spawnSync(binary, args, {
    env,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`Local Vercel command failed: ${args[0]}.`);
  }
  return result.stdout?.trim() ?? '';
}

async function main() {
  if (process.argv.length !== 2) {
    throw new Error('This wrapper accepts no forwarded CLI arguments.');
  }
  const head = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const status = execFileSync('git', ['status', '--porcelain'], {
    encoding: 'utf8',
  });
  const target = validateUpdatedHomePreview({ env: process.env, head, status });
  const binary = resolve(process.cwd(), 'node_modules/.bin/vercel');
  const commands = updatedHomePreviewCommands().map((args) =>
    args.map((value) => value.replace('__SHA__', head))
  );
  const env = {
    ...process.env,
    NEXT_PUBLIC_API_URL: target.apiUrl,
    NEXT_PUBLIC_DEPLOY_COMMIT_SHA: head,
  };
  runVercel(binary, commands[0], env);
  runVercel(binary, commands[1], env);
  const output = runVercel(binary, commands[2], env, true);
  const previewUrl = output
    .split(/\s+/)
    .reverse()
    .find((value) => /^https:\/\/[^\s]+\.vercel\.app\/?$/.test(value));
  if (!previewUrl) throw new Error('Vercel did not return a preview URL.');
  const host = new URL(previewUrl).hostname.toLowerCase();
  if (target.forbidden.includes(host)) {
    throw new Error('Returned preview host is in the production host set.');
  }
  const lookup = await fetch(
    `https://api.vercel.com/v13/deployments/${encodeURIComponent(host)}?teamId=${encodeURIComponent(process.env.VERCEL_ORG_ID)}`,
    { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } }
  );
  if (!lookup.ok) throw new Error('Vercel deployment evidence lookup failed.');
  const deployment = await lookup.json();
  if (
    !deployment.id ||
    deployment.url !== host ||
    deployment.projectId !== process.env.VERCEL_PROJECT_ID ||
    deployment.target !== null ||
    deployment.readyState !== 'READY' ||
    deployment.meta?.updatedHomeAnalyticsCommit !== head
  ) {
    throw new Error(
      'Vercel deployment metadata did not prove an exact preview.'
    );
  }
  const evidencePath = resolve(
    process.cwd(),
    'docs/evidence/updated-home-analytics/preview-deployment.json'
  );
  mkdirSync(dirname(evidencePath), { recursive: true });
  writeFileSync(
    evidencePath,
    `${JSON.stringify(
      {
        deploymentId: deployment.id,
        url: deployment.url,
        projectId: deployment.projectId,
        requestedOrgId: process.env.VERCEL_ORG_ID,
        target: deployment.target,
        readyState: deployment.readyState,
        commit: deployment.meta.updatedHomeAnalyticsCommit,
        devApiUrl: target.apiUrl,
      },
      null,
      2
    )}\n`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : 'Preview failed.'}\n`
    );
    process.exitCode = 1;
  });
}
