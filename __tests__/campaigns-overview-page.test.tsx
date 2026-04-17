import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CampaignsOverviewPage } from '@/components/campaigns/CampaignsOverviewPage';
import { campaignsRepository } from '@/modules/campaigns/repository';
import { resetMockCampaignsRepository } from '@/test-support/campaigns/mock-repository';

jest.setTimeout(15000);

const push = jest.fn();

jest.mock('@/modules/campaigns/repository', () => {
  const { mockCampaignsRepository } = jest.requireActual(
    '@/test-support/campaigns/mock-repository',
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
              label: 'New users',
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
});
