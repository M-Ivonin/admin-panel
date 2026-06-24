import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CampaignsOverviewPage } from '@/components/campaigns/CampaignsOverviewPage';
import { campaignsRepository } from '@/modules/campaigns/repository';
import { resetMockCampaignsRepository } from '@/test-support/campaigns/mock-repository';
import { createInitialCampaignsOverviewResponse } from '@/test-support/campaigns/mock-data';
import type { CampaignListItem } from '@/modules/campaigns/contracts';

jest.setTimeout(30000);

const push = jest.fn();

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

function toSummaryCampaignItem(item: CampaignListItem): CampaignListItem {
  return {
    ...item,
    audience: {
      ...item.audience,
      currentEstimate: null,
    },
    progress: {
      sentCount: null,
      totalCount: null,
      failedCount: null,
      skippedCount: null,
      inProgressCount: null,
      openCount: null,
      uniqueRecipientCount: null,
      journeyInstanceCount: null,
      deliveryRowCount: null,
      failureReasons: [],
      deliveredRate: null,
      ctr: null,
      progressPercent: null,
    },
    metric: {
      label: 'goal',
      value: item.goal,
    },
  };
}

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

  it('loads 10 campaigns by default', async () => {
    const overviewSpy = jest.spyOn(campaignsRepository, 'getCampaignsOverview');

    try {
      render(<CampaignsOverviewPage />);

      await screen.findByText('onboarding_not_completed');

      expect(overviewSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          targetApps: ['SirBro', 'TipsterBro'],
        })
      );
    } finally {
      overviewSpy.mockRestore();
    }
  });

  it('resets campaign diagnostics and reloads overview metrics', async () => {
    const seeded = createInitialCampaignsOverviewResponse();
    const campaign = seeded.items[0];
    if (!campaign) {
      throw new Error('Expected seeded overview item');
    }
    const overviewSpy = jest.spyOn(campaignsRepository, 'getCampaignsOverview');
    const resetSpy = jest
      .spyOn(campaignsRepository, 'resetCampaignDiagnostics')
      .mockResolvedValue({
        campaignId: campaign.id,
        metricsResetAt: '2026-06-24T15:20:00.000Z',
      });

    try {
      render(<CampaignsOverviewPage />);

      await screen.findByText(campaign.name);
      fireEvent.click(screen.getAllByRole('button', { name: /reset/i })[0]);

      await waitFor(() => {
        expect(resetSpy).toHaveBeenCalledWith(campaign.id);
      });
      await waitFor(() => {
        expect(overviewSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
      });
    } finally {
      overviewSpy.mockRestore();
      resetSpy.mockRestore();
    }
  });

  it('renders campaign rows before KPI and row metrics hydrate', async () => {
    const seeded = createInitialCampaignsOverviewResponse();
    const fullItem = seeded.items[0];
    if (!fullItem) {
      throw new Error('Expected seeded overview item');
    }
    const summaryItem = toSummaryCampaignItem(fullItem);
    const statsDeferred = createDeferred<{
      stats: NonNullable<typeof seeded.stats>;
    }>();
    const itemMetricsDeferred = createDeferred<{
      items: typeof seeded.items;
    }>();
    const overviewSpy = jest
      .spyOn(campaignsRepository, 'getCampaignsOverview')
      .mockResolvedValue({
        ...seeded,
        stats: null,
        items: [summaryItem],
        total: 1,
        totalPages: 1,
      });
    const statsSpy = jest
      .spyOn(campaignsRepository, 'getCampaignsOverviewStats')
      .mockReturnValue(statsDeferred.promise);
    const itemMetricsSpy = jest
      .spyOn(campaignsRepository, 'getCampaignOverviewItemMetrics')
      .mockReturnValue(itemMetricsDeferred.promise);

    try {
      render(<CampaignsOverviewPage />);

      expect(await screen.findByText(fullItem.name)).toBeTruthy();
      expect(screen.queryByText('Progress unavailable')).toBeNull();
      expect(screen.getByLabelText('Loading campaign progress')).toBeTruthy();
      expect(screen.getByLabelText('Loading audience reach')).toBeTruthy();
      expect(screen.getByLabelText('Loading Delivered today')).toBeTruthy();
      expect(overviewSpy).toHaveBeenCalledWith(
        expect.objectContaining({ includeMetrics: false })
      );
      expect(statsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ statsPeriod: 'all_time' })
      );
      expect(itemMetricsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ campaignIds: [fullItem.id] })
      );

      statsDeferred.resolve({ stats: seeded.stats! });
      expect(await screen.findByText('Delivered today')).toBeTruthy();
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading Delivered today')).toBeNull();
      });

      itemMetricsDeferred.resolve({ items: [fullItem] });
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading campaign progress')).toBeNull();
        expect(screen.getAllByText('Delivered').length).toBeGreaterThan(0);
      });
    } finally {
      overviewSpy.mockRestore();
      statsSpy.mockRestore();
      itemMetricsSpy.mockRestore();
    }
  });

  it('hydrates row metrics in sequential batches instead of one request per row', async () => {
    const seeded = createInitialCampaignsOverviewResponse();
    const items = seeded.items.slice(0, 4);
    const overviewSpy = jest
      .spyOn(campaignsRepository, 'getCampaignsOverview')
      .mockResolvedValue({
        ...seeded,
        stats: null,
        items: items.map(toSummaryCampaignItem),
        total: items.length,
        totalPages: 1,
      });
    const statsSpy = jest
      .spyOn(campaignsRepository, 'getCampaignsOverviewStats')
      .mockResolvedValue({ stats: seeded.stats! });
    const itemMetricsSpy = jest
      .spyOn(campaignsRepository, 'getCampaignOverviewItemMetrics')
      .mockImplementation(async ({ campaignIds }) => ({
        items: items.filter((item) => campaignIds.includes(item.id)),
      }));

    try {
      render(<CampaignsOverviewPage />);

      await screen.findByText(items[0].name);

      await waitFor(() => {
        expect(itemMetricsSpy).toHaveBeenCalledTimes(2);
      });
      expect(itemMetricsSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          campaignIds: items.slice(0, 3).map((item) => item.id),
        })
      );
      expect(itemMetricsSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          campaignIds: items.slice(3).map((item) => item.id),
        })
      );
    } finally {
      overviewSpy.mockRestore();
      statsSpy.mockRestore();
      itemMetricsSpy.mockRestore();
    }
  });

  it('filters campaigns by target app chips', async () => {
    const overviewSpy = jest.spyOn(campaignsRepository, 'getCampaignsOverview');

    try {
      render(<CampaignsOverviewPage />);

      await screen.findByText('onboarding_not_completed');
      expect(screen.getByText(/2 app filter\(s\)/i)).toBeTruthy();

      fireEvent.click(screen.getByText('TipsterBro'));

      await waitFor(() => {
        expect(overviewSpy).toHaveBeenLastCalledWith(
          expect.objectContaining({ targetApps: ['SirBro'] })
        );
      });
    } finally {
      overviewSpy.mockRestore();
    }
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
            targetApps: ['SirBro'],
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
            targetApps: ['SirBro'],
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

      expect(
        await screen.findByText('Runtime diagnostics campaign')
      ).toBeTruthy();
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
      expect(
        screen.getByText(/Send Guard matched: opened app: 2/)
      ).toBeTruthy();
      expect(screen.getByText('Traced goal events')).toBeTruthy();
      expect(screen.getByText('Untraced matching events')).toBeTruthy();
      expect(screen.getByText('Trace coverage')).toBeTruthy();
      expect(screen.getByText('25.0%')).toBeTruthy();
      expect(screen.getByText('Source events without user')).toBeTruthy();
    } finally {
      overviewSpy.mockRestore();
    }
  });

  it('renders in-app exposure, action opens, and expired diagnostics', async () => {
    const overviewSpy = jest
      .spyOn(campaignsRepository, 'getCampaignsOverview')
      .mockResolvedValue({
        stats: {
          activeCampaigns: 1,
          pausedCampaigns: 0,
          scheduledCampaigns: 0,
          sentToday: 0,
          deliveredRate: 100,
          avgCtr: 50,
          ctrDeltaVsPrev7d: 0,
          reachInProgress: 1,
        },
        items: [
          {
            id: 'cmp_in_app',
            name: 'In-app exposure campaign',
            goal: 'Open rewards wallet',
            channel: 'in_app',
            status: 'active',
            targetApps: ['SirBro'],
            entryTriggerType: 'state_based',
            audience: {
              estimate: 4,
              currentEstimate: 4,
              label: 'Current Users',
            },
            timing: {
              label: 'Next send',
              timestamp: '2026-04-17T10:00:00.000Z',
            },
            progress: {
              sentCount: 2,
              totalCount: 4,
              failedCount: 0,
              skippedCount: 1,
              inProgressCount: 1,
              openCount: 1,
              deliveredRate: 100,
              ctr: 50,
              progressPercent: 50,
              failureReasons: [{ reason: 'in_app_expired', count: 1 }],
            },
            metric: {
              label: 'ctr',
              value: '50.0%',
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

      expect(await screen.findByText('In-app exposure campaign')).toBeTruthy();
      expect(screen.getByText('In-App')).toBeTruthy();
      expect(screen.getByText(/in app expired: 1/)).toBeTruthy();
      expect(screen.getAllByText('Delivered').length).toBeGreaterThan(0);
      expect(screen.getByText('2')).toBeTruthy();
      expect(screen.getByText('Opened')).toBeTruthy();
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
      expect(screen.getByText('CTR')).toBeTruthy();
      expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
    } finally {
      overviewSpy.mockRestore();
    }
  });

  it('renders hybrid as one aggregate channel without path breakdown', async () => {
    const overviewSpy = jest
      .spyOn(campaignsRepository, 'getCampaignsOverview')
      .mockResolvedValue({
        stats: {
          activeCampaigns: 1,
          pausedCampaigns: 0,
          scheduledCampaigns: 0,
          sentToday: 0,
          deliveredRate: 80,
          avgCtr: 50,
          ctrDeltaVsPrev7d: 0,
          reachInProgress: 1,
        },
        items: [
          {
            id: 'cmp_hybrid',
            name: 'Hybrid rewards campaign',
            goal: 'Open rewards wallet',
            channel: 'hybrid',
            status: 'active',
            targetApps: ['SirBro', 'TipsterBro'],
            entryTriggerType: 'state_based',
            audience: {
              estimate: 6,
              currentEstimate: 6,
              label: 'Current Users',
            },
            timing: {
              label: 'Next send',
              timestamp: '2026-04-17T10:00:00.000Z',
            },
            progress: {
              sentCount: 4,
              totalCount: 6,
              failedCount: 1,
              skippedCount: 0,
              inProgressCount: 1,
              openCount: 2,
              deliveredRate: 80,
              ctr: 50,
              progressPercent: 66.7,
              failureReasons: [{ reason: 'invalid_fcm_token', count: 1 }],
            },
            metric: {
              label: 'ctr',
              value: '50.0%',
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

      expect(await screen.findByText('Hybrid rewards campaign')).toBeTruthy();
      expect(screen.getByText('Hybrid')).toBeTruthy();
      expect(screen.queryByText(/Push vs In-App/i)).toBeNull();
      expect(screen.queryByText(/Push path/i)).toBeNull();
      expect(screen.queryByText(/In-App path/i)).toBeNull();
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
            targetApps: ['SirBro'],
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
