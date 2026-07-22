import {
  updatedHomePreviewCommands,
  validateUpdatedHomePreview,
} from '@/scripts/deploy-updated-home-analytics-preview.mjs';

const env = {
  VERCEL_TOKEN: 'token',
  VERCEL_ORG_ID: 'team-1',
  VERCEL_PROJECT_ID: 'project-1',
  UPDATED_HOME_ANALYTICS_EXPECTED_ADMIN_SHA: 'abc123',
  UPDATED_HOME_ANALYTICS_DEV_API_URL: 'https://dev-api.example.com',
  UPDATED_HOME_ANALYTICS_PRODUCTION_HOSTS: 'api.example.com,admin.example.com',
};

describe('Updated Home preview deployment guard', () => {
  it('accepts only an exact clean revision and a non-production DEV API', () => {
    expect(
      validateUpdatedHomePreview({ env, head: 'abc123', status: '' })
    ).toMatchObject({ apiUrl: 'https://dev-api.example.com' });
    expect(() =>
      validateUpdatedHomePreview({ env, head: 'wrong', status: '' })
    ).toThrow('HEAD does not match');
    expect(() =>
      validateUpdatedHomePreview({ env, head: 'abc123', status: ' M file' })
    ).toThrow('clean worktree');
  });

  it('refuses production env target and forbidden hosts', () => {
    expect(() =>
      validateUpdatedHomePreview({
        env: { ...env, VERCEL_TARGET: 'production' },
        head: 'abc123',
        status: '',
      })
    ).toThrow('production Vercel target');
    expect(() =>
      validateUpdatedHomePreview({
        env: {
          ...env,
          UPDATED_HOME_ANALYTICS_DEV_API_URL: 'https://api.example.com',
        },
        head: 'abc123',
        status: '',
      })
    ).toThrow('production host set');
    expect(() =>
      validateUpdatedHomePreview({
        env: {
          ...env,
          UPDATED_HOME_ANALYTICS_DEV_API_URL:
            'https://user:secret@dev-api.example.com?token=secret',
        },
        head: 'abc123',
        status: '',
      })
    ).toThrow('must not contain credentials');
  });

  it('uses only fixed local preview commands and never --prod', () => {
    const commands = updatedHomePreviewCommands();
    expect(commands).toEqual([
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
    ]);
    expect(commands.flat()).not.toContain('--prod');
  });
});
