import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { TimeInAppReport } from '@/components/app-events-analytics/TimeInAppReport';
import {
  getEngagementReport,
  addEngagementExclusion,
} from '@/lib/api/user-engagement';
import type { EngagementReport } from '@/lib/api/user-engagement';
jest.mock('@/lib/api/user-engagement', () => ({
  getEngagementReport: jest.fn(),
  addEngagementExclusion: jest.fn(),
  removeEngagementExclusion: jest.fn(),
  syncEngagement: jest.fn(),
}));
jest.mock('@/components/admin/AdminPageHeader', () => ({
  AdminPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
const day = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const report: EngagementReport = {
  timezone: 'UTC',
  metric: 'Firebase',
  overlapPolicy: 'Summed across installations',
  configured: true,
  range: { from: day, to: day, includeExcluded: false },
  days: [
    {
      day,
      status: 'preliminary',
      syncedAt: '2026-10-22T10:00:00Z',
      activeUsers: 3,
      totalEngagementMs: 1800000,
      averageEngagementMs: 600000,
      anonymousEngagementMs: 1000,
      unknownEngagementMs: 2000,
      excludedEngagementMs: 3000,
    },
  ],
  users: [
    {
      day,
      userId: 'one',
      name: 'Account One',
      email: 'one@example.com',
      active: true,
      engagementMs: 600000,
      installations: [
        {
          installationId: 'phone-one',
          platform: 'IOS',
          hardware: 'iPhone18,3',
          simulator: false,
          engagementMs: 600000,
        },
      ],
    },
  ],
  exclusions: [],
  installations: [
    {
      installationId: 'unknown-test',
      platform: 'IOS',
      hardware: 'iPhone18,3',
      simulator: false,
      engagementMs: 120000,
    },
  ],
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getEngagementReport).mockResolvedValue(report);
  jest.mocked(addEngagementExclusion).mockResolvedValue([]);
});
it('shows daily averages and opens user installation details', async () => {
  render(<TimeInAppReport />);
  expect(
    await within(
      await screen.findByRole('table', { name: 'Daily engagement' })
    ).findByText('10m 00s')
  ).toBeInTheDocument();
  expect(screen.getByText('Account One')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'View installations' }));
  expect(screen.getByText('phone-one')).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: 'Exclude account by email' })
  );
  await waitFor(() =>
    expect(addEngagementExclusion).toHaveBeenCalledWith(
      'email',
      'one@example.com'
    )
  );
});
it('offers unidentified installations in exclusions and refreshes when manual exclusions are included', async () => {
  render(<TimeInAppReport />);
  await screen.findByText('Account One');
  fireEvent.click(screen.getByLabelText('Include manual exclusions'));
  await waitFor(() =>
    expect(getEngagementReport).toHaveBeenLastCalledWith(
      expect.objectContaining({ includeExcluded: true })
    )
  );
  await screen.findByText('Account One');
  fireEvent.click(screen.getByRole('button', { name: 'Exclusions' }));
  expect(screen.getByText('unknown-test')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^Exclude$/ }));
  await waitFor(() =>
    expect(addEngagementExclusion).toHaveBeenCalledWith(
      'installation',
      'unknown-test'
    )
  );
});
it('shows read failures without rendering stale totals', async () => {
  jest
    .mocked(getEngagementReport)
    .mockRejectedValue(new Error('Access denied'));
  render(<TimeInAppReport />);
  expect(await screen.findByText('Access denied')).toBeInTheDocument();
  expect(screen.queryByText('Account One')).not.toBeInTheDocument();
});
