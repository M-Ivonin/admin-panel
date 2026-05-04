import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CampaignsOverviewPage } from '@/components/campaigns/CampaignsOverviewPage';
import { campaignsRepository } from '@/modules/campaigns/repository';
import { resetMockCampaignsRepository } from '@/test-support/campaigns/mock-repository';

jest.setTimeout(30000);

const push = jest.fn();

jest.mock('@/modules/campaigns/repository', () => {
  const { mockCampaignsRepository } = jest.requireActual(
    '@/test-support/campaigns/mock-repository'
  );

  return {
    campaignsRepository: mockCampaignsRepository,
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    replace: jest.fn(),
  }),
}));

describe('CampaignsOverviewPage', () => {
  beforeEach(() => {
    resetMockCampaignsRepository();
    push.mockReset();
  });

  it('renders the seeded rows and changes visible items through status, type, and quick-view filters', async () => {
    render(<CampaignsOverviewPage />);

    expect(await screen.findByText('onboarding_not_completed')).toBeTruthy();
    expect(screen.getByText(/4 status filter\(s\)/i)).toBeTruthy();
    expect(screen.getByText('Delivered today')).toBeTruthy();
    expect(screen.getAllByText('Delivery rate').length).toBeGreaterThan(0);
    expect(screen.getByText('Queued deliveries')).toBeTruthy();
    expect(screen.getAllByText('Delivered').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Queued').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CTR').length).toBeGreaterThan(0);
    expect(screen.getAllByText('On')).toHaveLength(4);
    expect(screen.getByText('favorite_match_kickoff')).toBeTruthy();
    expect(screen.getByText('stage_at_risk_wau')).toBeTruthy();
    expect(screen.getByText('stage_dead_user')).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /Paused/i })[0]);

    await waitFor(() => {
      expect(screen.queryByText('favorite_match_kickoff')).toBeNull();
      expect(screen.getByText('onboarding_not_completed')).toBeTruthy();
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Paused/i })[0]);
    fireEvent.click(screen.getByText('Recurring'));

    await waitFor(() => {
      expect(screen.getByText('stage_dead_user')).toBeTruthy();
      expect(screen.queryByText('favorite_match_kickoff')).toBeNull();
    });

    fireEvent.click(screen.getByText('Recurring'));
    fireEvent.click(screen.getByRole('button', { name: /Needs attention/i }));

    await waitFor(() => {
      expect(screen.getByText('onboarding_not_completed')).toBeTruthy();
      expect(screen.getByText('stage_at_risk_wau')).toBeTruthy();
      expect(screen.getByText('stage_dead_user')).toBeTruthy();
      expect(screen.queryByText('favorite_match_kickoff')).toBeNull();
    });
  });

  it('routes to the create page from the primary CTA', async () => {
    render(<CampaignsOverviewPage />);

    await screen.findByText('onboarding_not_completed');

    fireEvent.click(screen.getByRole('button', { name: 'New Campaign' }));

    expect(push).toHaveBeenCalledWith('/dashboard/campaigns/new');
  });

  it('opens editing only from the row Edit button and sends the selected stats period', async () => {
    const overviewSpy = jest.spyOn(campaignsRepository, 'getCampaignsOverview');

    try {
      render(<CampaignsOverviewPage />);

      await screen.findByText('onboarding_not_completed');

      fireEvent.click(screen.getByText('onboarding_not_completed'));
      expect(push).not.toHaveBeenCalled();

      fireEvent.click(screen.getAllByRole('button', { name: /Edit/i })[0]);
      expect(push).toHaveBeenCalledWith(
        '/dashboard/campaigns/cmp_onboarding_not_completed'
      );

      fireEvent.click(screen.getByText('24 hours'));

      await waitFor(() => {
        expect(overviewSpy).toHaveBeenLastCalledWith(
          expect.objectContaining({ statsPeriod: 'last_24_hours' })
        );
      });
    } finally {
      overviewSpy.mockRestore();
    }
  });

  it('renders tracked-goal rate details in the outcome block', async () => {
    const overviewSpy = jest
      .spyOn(campaignsRepository, 'getCampaignsOverview')
      .mockResolvedValue({
        stats: {
          activeCampaigns: 1,
          pausedCampaigns: 0,
          scheduledCampaigns: 0,
          sentToday: 0,
          deliveredRate: 0,
          avgCtr: 0,
          ctrDeltaVsPrev7d: 0,
          reachInProgress: 0,
        },
        items: [
          {
            id: 'cmp_goal_rate',
            name: 'Goal rate campaign',
            goal: 'Recover onboarding completion',
            channel: 'push',
            status: 'active',
            entryTriggerType: 'state_based',
            audience: {
              estimate: 120,
              currentEstimate: 96,
              label: 'Pre-Reg Onboarding Incomplete',
            },
            timing: {
              label: 'Next send',
              timestamp: '2026-04-17T10:00:00.000Z',
            },
            progress: {
              sentCount: 12,
              totalCount: 12,
              progressPercent: 100,
            },
            metric: {
              label: 'goal',
              value: '25.0%',
              detail: '3 reached / 12 journeys',
              reachedCount: 3,
              journeyCount: 12,
              attributionMode: 'global_state_event',
              traceGoalEventCount: 0,
              untracedGoalEventCount: 0,
              sourceEventsWithoutUserCount: 0,
            },
            owner: {
              ownerName: 'CRM bot',
              activityLabel: 'Active',
            },
            updatedAt: '2026-04-17T09:00:00.000Z',
            localeReadiness: {
              en: 'ready',
              es: 'ready',
              pt: 'ready',
            },
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

    try {
      render(<CampaignsOverviewPage />);

      expect(await screen.findByText('25.0%')).toBeTruthy();
      expect(screen.getByText('3 reached / 12 journeys')).toBeTruthy();
    } finally {
      overviewSpy.mockRestore();
    }
  });

  it('renders current audience diagnostics, runtime rows, failures, and hint labels', async () => {
    const overviewSpy = jest
      .spyOn(campaignsRepository, 'getCampaignsOverview')
      .mockResolvedValue({
        stats: {
          activeCampaigns: 1,
          pausedCampaigns: 0,
          scheduledCampaigns: 0,
          sentToday: 0,
          deliveredRate: 0,
          avgCtr: 0,
          ctrDeltaVsPrev7d: 0,
          reachInProgress: 0,
        },
        items: [
          {
            id: 'cmp_runtime_diagnostics',
            name: 'Runtime diagnostics campaign',
            goal: 'Open match center',
            channel: 'push',
            status: 'active',
            entryTriggerType: 'state_based',
            audience: {
              estimate: 100,
              currentEstimate: 41,
              label: 'At-risk WAU',
            },
            timing: {
              label: 'Next send',
              timestamp: '2026-04-17T10:00:00.000Z',
            },
            progress: {
              sentCount: 2,
              totalCount: 4,
              failedCount: 1,
              skippedCount: 0,
              inProgressCount: 1,
              openCount: 1,
              deliveredRate: 66.7,
              ctr: 50,
              progressPercent: 50,
              uniqueRecipientCount: 2,
              journeyInstanceCount: 2,
              deliveryRowCount: 4,
              failureReasons: [
                { reason: 'invalid_fcm_token', count: 1 },
                { reason: 'send_guard_matched:opened_app', count: 2 },
              ],
            },
            metric: {
              label: 'goal',
              value: '50.0%',
              detail: '1 reached / 2 journeys',
              reachedCount: 1,
              journeyCount: 2,
              attributionMode: 'trace_required_response',
              traceGoalEventCount: 1,
              untracedGoalEventCount: 3,
              sourceEventsWithoutUserCount: 2,
            },
            owner: {
              ownerName: 'CRM bot',
              activityLabel: 'Active',
            },
            updatedAt: '2026-04-17T09:00:00.000Z',
            localeReadiness: {
              en: 'ready',
            },
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

    try {
      render(<CampaignsOverviewPage />);

      expect(await screen.findByText('Runtime diagnostics campaign')).toBeTruthy();
      expect(screen.getByText('Audience now')).toBeTruthy();
      expect(screen.getByText('41 users')).toBeTruthy();
      expect(screen.queryByText('Saved estimate')).toBeNull();
      expect(screen.queryByText('100 users')).toBeNull();
      expect(screen.getAllByText('Delivery rate').length).toBeGreaterThan(0);
      expect(screen.getByText('CTR')).toBeTruthy();
      expect(screen.getByText('Users with messages')).toBeTruthy();
      expect(screen.getByText('Campaign starts')).toBeTruthy();
      expect(screen.getByText('Message attempts')).toBeTruthy();
      expect(screen.getByText('Failure / skip reasons')).toBeTruthy();
      expect(screen.getByText(/invalid fcm token: 1/)).toBeTruthy();
      expect(screen.getByText(/Send Guard matched: opened app: 2/)).toBeTruthy();
      expect(screen.getByText('Traced goal events')).toBeTruthy();
      expect(screen.getByText('Untraced matching events')).toBeTruthy();
      expect(screen.getByText('Source events without user')).toBeTruthy();
    } finally {
      overviewSpy.mockRestore();
    }
  });

  it('shows locale readiness only for selected campaign locales', async () => {
    const overviewSpy = jest
      .spyOn(campaignsRepository, 'getCampaignsOverview')
      .mockResolvedValue({
        stats: {
          activeCampaigns: 1,
          pausedCampaigns: 0,
          scheduledCampaigns: 0,
          sentToday: 0,
          deliveredRate: 0,
          avgCtr: 0,
          ctrDeltaVsPrev7d: 0,
          reachInProgress: 0,
        },
        items: [
          {
            id: 'cmp_selected_locale_only',
            name: 'Selected locale only',
            goal: 'Recover onboarding completion',
            channel: 'push',
            status: 'active',
            entryTriggerType: 'state_based',
            audience: {
              estimate: 120,
              currentEstimate: 96,
              label: 'Pre-Reg Onboarding Incomplete',
            },
            timing: {
              label: 'Next send',
              timestamp: '2026-04-17T10:00:00.000Z',
            },
            progress: {
              sentCount: 0,
              totalCount: 120,
              progressPercent: 0,
            },
            metric: {
              label: 'goal',
              value: 'Recover onboarding completion',
            },
            owner: {
              ownerName: 'CRM bot',
              activityLabel: 'Updated 2 min ago',
            },
            updatedAt: '2026-04-17T09:00:00.000Z',
            localeReadiness: {
              en: 'warning',
            },
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

    try {
      render(<CampaignsOverviewPage />);

      expect(await screen.findByText('EN · warning')).toBeTruthy();
      expect(screen.queryByText(/^ES · /)).toBeNull();
      expect(screen.queryByText(/^PT · /)).toBeNull();
    } finally {
      overviewSpy.mockRestore();
    }
  });
});
