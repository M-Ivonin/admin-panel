import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AppEventsAnalyticsDashboard } from '@/components/app-events-analytics/AppEventsAnalyticsDashboard';
import { getAppEventsAnalytics } from '@/lib/api/app-events-analytics';

jest.mock('@/lib/api/app-events-analytics', () => ({
  getAppEventsAnalytics: jest.fn(),
}));

const analyticsResponse = {
  metadata: {
    releaseDate: '2026-07-09',
    noBackfill: true,
    noBackfillMessage:
      'Registered-user App Event analytics start at the App Events release date. Historical campaign_source_events are not backfilled in this release.',
    defaultRangeDays: 14,
    maxRangeDays: 90,
    timezone: 'UTC' as const,
  },
  range: {
    from: '2026-07-09T00:00:00.000Z',
    to: '2026-07-09T23:59:59.999Z',
  },
  summary: {
    totalEvents: 3,
    uniqueUsers: 2,
    screenOpenUniqueUsers: 1,
    businessActionEvents: 1,
  },
  countsByEvent: [
    {
      eventKey: 'matches_screen_opened',
      category: 'matches',
      count: 2,
      uniqueUsers: 1,
    },
    {
      eventKey: 'prediction_market_order_placed',
      category: 'prediction_markets',
      count: 1,
      uniqueUsers: 1,
    },
    {
      eventKey: 'unread_social_activity',
      category: 'social',
      count: 10,
      uniqueUsers: 5,
    },
  ],
  timeSeries: [
    {
      bucketStart: '2026-07-09T00:00:00.000Z',
      eventKey: 'matches_screen_opened',
      category: 'matches',
      count: 2,
      uniqueUsers: 1,
    },
    {
      bucketStart: '2026-07-09T00:00:00.000Z',
      eventKey: 'unread_social_activity',
      category: 'social',
      count: 10,
      uniqueUsers: 5,
    },
  ],
  dailyTimeSeries: [
    {
      bucketStart: '2026-07-08T00:00:00.000Z',
      count: 6,
      uniqueUsers: 3,
    },
    {
      bucketStart: '2026-07-09T00:00:00.000Z',
      count: 12,
      uniqueUsers: 7,
    },
  ],
  heatmapUtc: [
    {
      dayOfWeek: 4,
      hour: 15,
      count: 2,
      uniqueUsers: 1,
    },
  ],
  filters: {
    targetApps: ['SirBro', 'TipsterBro'],
    platforms: ['ios', 'android'],
    appVersions: ['1.1.280+282'],
    locales: ['en'],
    sourceTypes: ['user', 'generated'],
    categories: ['matches', 'prediction_markets'],
    eventKeys: ['matches_screen_opened', 'prediction_market_order_placed'],
  },
  breakdowns: {
    userEventsDistribution: [
      {
        eventKey: 'matches_screen_opened',
        category: 'matches',
        count: 24,
        uniqueUsers: 12,
        share: 0.6,
      },
      {
        eventKey: 'ai_chat_prediction_voted',
        category: 'ai_chat',
        count: 12,
        uniqueUsers: 8,
        share: 0.3,
      },
      {
        eventKey: 'prediction_market_order_placed',
        category: 'prediction_markets',
        count: 4,
        uniqueUsers: 3,
        share: 0.1,
      },
    ],
    unreadSocialActivityByChannelType: [
      {
        channelType: 'public',
        count: 6,
        uniqueUsers: 4,
        unreadCount: 19,
      },
      {
        channelType: 'private',
        count: 3,
        uniqueUsers: 2,
        unreadCount: 7,
      },
      {
        channelType: 'challenge',
        count: 1,
        uniqueUsers: 1,
        unreadCount: 2,
      },
    ],
  },
  versionHealth: [
    {
      appVersion: '1.1.281+283',
      platform: 'android',
      targetApp: 'SirBro',
      count: 4,
      uniqueUsers: 3,
      lastSeenAt: '2026-07-09T15:30:00.000Z',
      topEventKey: 'matches_screen_opened',
      topEventCount: 2,
    },
    {
      appVersion: '1.1.280+282',
      platform: 'ios',
      targetApp: 'SirBro',
      count: 2,
      uniqueUsers: 1,
      lastSeenAt: '2026-07-09T12:00:00.000Z',
      topEventKey: 'ai_chat_opened',
      topEventCount: 1,
    },
  ],
  recentEvents: [
    {
      id: 'event-1',
      eventKey: 'matches_screen_opened',
      category: 'matches',
      userId: 'user-1',
      occurredAt: '2026-07-09T15:00:00.000Z',
      targetApp: 'SirBro',
      safeProperties: {
        platform: 'ios',
        appVersion: '1.1.280+282',
        locale: 'en',
      },
    },
  ],
  nextCursor: null,
  emptyState: null,
};

describe('AppEventsAnalyticsDashboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-09T08:47:47.000Z'));
    (getAppEventsAnalytics as jest.Mock).mockReset();
    (getAppEventsAnalytics as jest.Mock).mockResolvedValue(analyticsResponse);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads the default bounded range and renders KPIs, readable counts, and heatmap', async () => {
    render(<AppEventsAnalyticsDashboard />);

    expect(await screen.findByText('Total events')).toBeInTheDocument();
    expect(screen.getByText('All target apps')).toBeInTheDocument();
    expect(screen.getByText('All platforms')).toBeInTheDocument();
    expect(screen.getByText('All versions')).toBeInTheDocument();
    expect(screen.getByText('All locales')).toBeInTheDocument();
    expect(screen.getByText('All events')).toBeInTheDocument();
    expect(screen.getByText('All categories')).toBeInTheDocument();
    expect(screen.getByText('All event keys')).toBeInTheDocument();
    expect(getAppEventsAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '2026-06-25T00:00:00.000Z',
        to: '2026-07-09T23:59:59.999Z',
      })
    );
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Matches screen opened').length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText('2 events').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1 user').length).toBeGreaterThan(0);
    expect(screen.getByText('Prediction Markets')).toBeInTheDocument();
    expect(screen.queryByText('matches_screen_opened')).not.toBeInTheDocument();
    expect(screen.queryByText('prediction_markets')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Unread Social Activity by Channel Type')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Registered-user App Event analytics start/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Recent Events')).not.toBeInTheDocument();
    expect(screen.getByText('Daily Activity Trend')).toBeInTheDocument();
    expect(screen.queryByText('Time Series')).not.toBeInTheDocument();
    expect(screen.getByLabelText('2026-07-09 12 events 7 users')).toBeInTheDocument();
    expect(screen.getByLabelText('Thu 15:00 UTC 2 events')).toBeInTheDocument();
    expect(screen.getByText('App Version Health')).toBeInTheDocument();
    expect(screen.getByText('2 versions')).toBeInTheDocument();
    expect(screen.getByText('6 events')).toBeInTheDocument();
    expect(screen.getByText('Top version')).toBeInTheDocument();
    expect(screen.getAllByText('1.1.281+283').length).toBeGreaterThan(0);
    expect(screen.getByText('1.1.280+282')).toBeInTheDocument();
    expect(screen.getByText('User Events Distribution')).toBeInTheDocument();
    expect(screen.getByText('40 user events')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Open user event distribution for Matches screen opened',
      })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open app version health breakdown',
      })
    );

    expect(
      screen.getByRole('dialog', { name: 'App Version Health breakdown' })
    ).toBeInTheDocument();
    expect(screen.getAllByText('1.1.280+282').length).toBeGreaterThan(0);
    expect(screen.getAllByText('android').length).toBeGreaterThan(0);
    expect(screen.getByText('4 events')).toBeInTheDocument();
    expect(screen.getByText('3 users')).toBeInTheDocument();
    expect(screen.getAllByText('Matches screen opened').length).toBeGreaterThan(
      0
    );
  });

  it('renders app version health in the distribution chart style', async () => {
    render(<AppEventsAnalyticsDashboard />);

    await screen.findByText('App Version Health');

    const segments = [
      screen.getByTestId('app-version-health-segment-1.1.280+282-ios-SirBro'),
      screen.getByTestId(
        'app-version-health-segment-1.1.281+283-android-SirBro'
      ),
    ];
    const labels = [
      screen.getByTestId('app-version-health-label-1.1.280+282-ios-SirBro'),
      screen.getByTestId('app-version-health-label-1.1.281+283-android-SirBro'),
    ];

    expect(segments.map((segment) => getComputedStyle(segment).flexGrow)).toEqual(
      ['1', '1']
    );
    expect(labels.map((label) => label.textContent)).toEqual([
      '1.1.280+282',
      '1.1.281+283',
    ]);
    expect(
      getComputedStyle(screen.getByTestId('app-version-health-label-rail'))
        .minHeight
    ).toBe('72px');
    expect(getComputedStyle(labels[0]).transform).toBe('rotate(-86deg)');
    expect(getComputedStyle(labels[0]).overflow).toBe('visible');
    expect(getComputedStyle(labels[0]).textOverflow).not.toBe('ellipsis');
  });

  it('opens event breakdown from the user events distribution heatmap', async () => {
    render(<AppEventsAnalyticsDashboard />);

    await screen.findByText('User Events Distribution');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open user event distribution for AI chat prediction voted',
      })
    );

    expect(
      screen.getByRole('dialog', {
        name: 'AI chat prediction voted breakdown',
      })
    ).toBeInTheDocument();
    expect(screen.getByText('12 events')).toBeInTheDocument();
    expect(screen.getByText('8 users')).toBeInTheDocument();
  });

  it('renders user event distribution segments with equal visual width', async () => {
    render(<AppEventsAnalyticsDashboard />);

    await screen.findByText('User Events Distribution');

    const segments = [
      screen.getByRole('button', {
        name: 'Open user event distribution for Matches screen opened',
      }),
      screen.getByRole('button', {
        name: 'Open user event distribution for AI chat prediction voted',
      }),
      screen.getByRole('button', {
        name: 'Open user event distribution for Prediction Market order placed',
      }),
    ];

    expect(segments.map((segment) => getComputedStyle(segment).flexGrow)).toEqual([
      '1',
      '1',
      '1',
    ]);
  });

  it('orders user event distribution segments from coldest to hottest', async () => {
    render(<AppEventsAnalyticsDashboard />);

    await screen.findByText('User Events Distribution');

    const segments = screen
      .getAllByRole('button')
      .filter((button) =>
        button
          .getAttribute('aria-label')
          ?.startsWith('Open user event distribution for ')
      );

    expect(
      segments.map((segment) => segment.getAttribute('aria-label'))
    ).toEqual([
      'Open user event distribution for Prediction Market order placed',
      'Open user event distribution for AI chat prediction voted',
      'Open user event distribution for Matches screen opened',
    ]);
  });

  it('renders vertical event labels under the user event distribution segments', async () => {
    render(<AppEventsAnalyticsDashboard />);

    await screen.findByText('User Events Distribution');

    const label = screen.getByTestId(
      'user-event-distribution-label-prediction_market_order_placed'
    );

    expect(label).toHaveTextContent('Prediction Market order placed');
    expect(getComputedStyle(label).transform).toBe('rotate(-82deg)');
    expect(getComputedStyle(label).whiteSpace).toBe('nowrap');
    expect(getComputedStyle(label).overflow).toBe('visible');
    expect(getComputedStyle(label).textOverflow).not.toBe('ellipsis');
  });

  it('reloads data immediately when filters change and manually refreshes with the same filters', async () => {
    render(<AppEventsAnalyticsDashboard />);

    await screen.findByText('Total events');
    const refreshButton = screen.getByRole('button', { name: 'Refresh' });

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Target App' }));
    fireEvent.click(await screen.findByRole('option', { name: 'TipsterBro' }));

    await waitFor(() =>
      expect(getAppEventsAnalytics).toHaveBeenLastCalledWith(
        expect.objectContaining({
          from: '2026-06-25T00:00:00.000Z',
          to: '2026-07-09T23:59:59.999Z',
          targetApp: 'TipsterBro',
        })
      )
    );

    const callsBeforeManualRefresh = (getAppEventsAnalytics as jest.Mock).mock
      .calls.length;

    await waitFor(() => expect(refreshButton).not.toBeDisabled());
    fireEvent.click(refreshButton);

    await waitFor(() =>
      expect(getAppEventsAnalytics).toHaveBeenCalledTimes(
        callsBeforeManualRefresh + 1
      )
    );
    expect(getAppEventsAnalytics).toHaveBeenLastCalledWith(
      expect.objectContaining({
        from: '2026-06-25T00:00:00.000Z',
        to: '2026-07-09T23:59:59.999Z',
        targetApp: 'TipsterBro',
      })
    );
  });

  it('always exposes the baseline app platforms and locales in filter dropdowns', async () => {
    (getAppEventsAnalytics as jest.Mock).mockResolvedValue({
      ...analyticsResponse,
      filters: {
        ...analyticsResponse.filters,
        platforms: ['android'],
        locales: ['en-US'],
      },
    });

    render(<AppEventsAnalyticsDashboard />);

    await screen.findByText('Total events');

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Platform' }));

    expect(await screen.findByRole('option', { name: 'android' })).toBeTruthy();
    fireEvent.click(screen.getByRole('option', { name: 'ios' }));

    await waitFor(() =>
      expect(getAppEventsAnalytics).toHaveBeenLastCalledWith(
        expect.objectContaining({ platform: 'ios' })
      )
    );
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Locale' }));

    expect(await screen.findByRole('option', { name: 'en-US' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'pt-BR' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'es-419' })).toBeTruthy();
  });

  it('filters analytics by event source type', async () => {
    render(<AppEventsAnalyticsDashboard />);

    await screen.findByText('Total events');
    expect(screen.getByText('All events')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Source' }));
    fireEvent.click(
      await screen.findByRole('option', { name: 'User events' })
    );

    await waitFor(() =>
      expect(getAppEventsAnalytics).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sourceType: 'user',
        })
      )
    );
  });

  it('opens a row breakdown dialog with channel-type detail for unread social activity', async () => {
    render(<AppEventsAnalyticsDashboard />);

    await screen.findByText('Total events');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open breakdown for Unread social activity',
      })
    );

    expect(
      screen.getByRole('dialog', {
        name: 'Unread social activity breakdown',
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Channel type')).toBeInTheDocument();
    expect(screen.getByText('Public channels')).toBeInTheDocument();
    expect(screen.getByText('Private channels')).toBeInTheDocument();
    expect(screen.getByText('Live Challenge channels')).toBeInTheDocument();
    expect(screen.getByText('19 unread')).toBeInTheDocument();
    expect(screen.getByText('Daily buckets')).toBeInTheDocument();
    expect(screen.getByText('2026-07-09')).toBeInTheDocument();
  });

  it('opens a row breakdown dialog for non-social events', async () => {
    render(<AppEventsAnalyticsDashboard />);

    await screen.findByText('Total events');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open breakdown for Matches screen opened',
      })
    );

    expect(
      screen.getByRole('dialog', {
        name: 'Matches screen opened breakdown',
      })
    ).toBeInTheDocument();
    expect(screen.queryByText('Channel type')).not.toBeInTheDocument();
    expect(screen.getByText('Daily buckets')).toBeInTheDocument();
    expect(screen.getByText('2026-07-09')).toBeInTheDocument();
  });

  it('renders a neutral empty state without the backend no-backfill annotation', async () => {
    (getAppEventsAnalytics as jest.Mock).mockResolvedValue({
      ...analyticsResponse,
      summary: {
        totalEvents: 0,
        uniqueUsers: 0,
        screenOpenUniqueUsers: 0,
        businessActionEvents: 0,
      },
      countsByEvent: [],
      timeSeries: [],
      dailyTimeSeries: [],
      heatmapUtc: [],
      versionHealth: [],
      recentEvents: [],
      nextCursor: null,
      emptyState: {
        kind: 'before_app_events_release',
        message:
          'Registered-user App Event analytics start at the App Events release date. Historical campaign_source_events are not backfilled in this release.',
      },
    });

    render(<AppEventsAnalyticsDashboard />);

    expect(await screen.findByText('Total events')).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Historical campaign_source_events are not backfilled/i
      )
    ).not.toBeInTheDocument();
    expect(screen.getByText('No App Event counts in this range.')).toBeTruthy();
  });
});
