import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { AdminShell } from '@/components/admin/AdminShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardPage from '@/app/(admin)/dashboard/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

const today = new Date().toISOString().slice(0, 10);
const days = Array.from({ length: 7 }, (_, i) =>
  new Date(new Date(`${today}T00:00Z`).getTime() - (6 - i) * 86400000)
    .toISOString()
    .slice(0, 10)
);
const json = (body: unknown, status = 200) =>
  ({ ok: status === 200, status, json: async () => body }) as Response;
const growth = {
  date: today,
  partial: true,
  cutoff: `${today}T14:30:00Z`,
  registrations: {
    today: 128,
    previous: 108,
    daily: days.map((date) => ({ date, value: 128 })),
  },
  subscriptions: {
    today: 18,
    previous: 16,
    daily: days.map((date) => ({ date, value: 18 })),
  },
};
const marketing = {
  campaigns: { sent: 1840, opened: 126, openRate: 126 / 1840 },
  email: { delivered: 2410, clicked: 84, clickRate: 84 / 2410 },
  deliveryFailures: 1,
};
const summary = {
  totalEntries: 10,
  missingAmountCount: 0,
  usdRevenue: { netGrossAmountUsd: '428.60', missingCurrencies: [] },
  dailyUsdRevenue: days.map((date) => ({ date, netGrossAmountUsd: '61.22' })),
};
const predictions = {
  accuracy: 68.4,
  evaluated: 38,
  pending: 12,
  v9: { accuracy: 68.4, evaluated: 38, pending: 12, roiPercent: 6.8 },
};
const monitor = () => ({
  generatedAt: new Date().toISOString(),
  workerHeartbeatAt: new Date().toISOString(),
  checks: [
    {
      checkId: 'backend.health',
      required: true,
      enabled: true,
      intervalMs: 60000,
      deadlineMs: 10000,
      status: 'pass',
      lastRun: { endedAt: new Date().toISOString() },
    },
  ],
});

const homeMetric = (
  key: string,
  rows: Array<{
    stage?: string;
    numerator: number | null;
    denominator: number | null;
    value: number | null;
  }>
) => ({
  definition: { key },
  values: rows.map(({ stage, ...row }) => ({
    ...row,
    dimensions: stage ? { stage } : {},
    unit: stage && row.denominator === null ? 'users' : 'percent',
  })),
});
const homeAnalytics = {
  range: { from: `${today}T00:00:00.000Z`, to: `${today}T23:59:59.999Z` },
  dashboards: [
    {
      id: 1,
      metrics: [
        homeMetric('home_load_success_rate', [
          { numerator: 90, denominator: 100, value: 90 },
          { numerator: 10, denominator: 10, value: 100 },
        ]),
      ],
    },
    {
      id: 2,
      metrics: [
        homeMetric('free_pick_activation_funnel', [
          {
            stage: 'home_viewed',
            numerator: 200,
            denominator: null,
            value: 200,
          },
          {
            stage: 'free_pick_prediction_card_opened',
            numerator: 30,
            denominator: 60,
            value: 50,
          },
        ]),
      ],
    },
    {
      id: 3,
      metrics: [
        homeMetric('full_access_funnel', [
          {
            stage: 'offer_impression',
            numerator: 100,
            denominator: null,
            value: 100,
          },
          {
            stage: 'verified_purchase',
            numerator: 5,
            denominator: 10,
            value: 50,
          },
        ]),
      ],
    },
    {
      id: 6,
      metrics: [
        homeMetric('top_picks_activation_funnel', [
          {
            stage: 'preview_impression',
            numerator: 80,
            denominator: null,
            value: 80,
          },
          {
            stage: 'full_analysis_opened',
            numerator: 20,
            denominator: 40,
            value: 50,
          },
        ]),
      ],
    },
  ],
};

function response(url: string): Response {
  if (url.includes('/api/revenue-ledger-access'))
    return json({ hasAccess: true });
  if (url.includes('/updated-home-analytics/admin/dashboards')) {
    const params = new URL(url, 'http://localhost').searchParams;
    return json({
      ...homeAnalytics,
      range: { from: params.get('from'), to: params.get('to') },
    });
  }
  if (url.includes('/admin-overview/growth')) return json(growth);
  if (url.includes('/admin-overview/marketing')) return json(marketing);
  if (url.includes('/capabilities')) return json({ canRead: true });
  if (url.includes('/system-monitor/admin/overview')) return json(monitor());
  if (url.includes('/support-chat/admin/tickets')) return json({ total: 4 });
  if (url.includes('/revenue-ledger/')) return json({ summary });
  if (url.includes('/evaluations')) return json({ summary: predictions });
  if (url.includes('/onboarding-funnel/'))
    return json({
      summary: {
        sessionsStarted: 190,
        sessionsCompleted: 137,
        completionRate: 137 / 190,
        averageSecondsToCompletion: 102,
      },
    });
  if (url.includes('/app-events/'))
    return json({
      summary: { totalEvents: 1248, businessActionEvents: 612 },
      countsByEvent: [
        { eventKey: 'chat_in_ai_chat', count: 520 },
        { eventKey: 'checkout_started', count: 92 },
        { eventKey: 'matches_screen_opened', count: 636 },
      ],
    });
  return json({}, 503);
}
function show() {
  return render(
    <ProtectedRoute>
      <AdminShell>
        <DashboardPage />
      </AdminShell>
    </ProtectedRoute>
  );
}
async function settled() {
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeEnabled()
  );
}
beforeEach(() => {
  Object.assign(window.location, { hostname: 'localhost' });
  document.cookie = `accessToken=e30.${btoa(JSON.stringify({ sub: 'admin', email: 'sergii.mytakii@levantem.ai', name: 'Administrator' }))}.render-only`;
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: 'admin',
      email: 'sergii.mytakii@levantem.ai',
      name: 'Administrator',
    })
  );
  global.fetch = jest.fn(async (input) => response(String(input)));
});

it('shows all eight reports, complete navigation and each headline metric once', async () => {
  show();
  expect(
    await screen.findByRole('heading', { name: 'Overview' })
  ).toBeInTheDocument();
  await settled();
  for (const name of [
    'New registrations',
    'New paid subscriptions',
    'Revenue',
    'Prediction performance',
    'Key app events',
    'Onboarding today',
    'Campaigns & email',
    'Needs attention',
  ])
    expect(screen.getAllByRole('heading', { name })).toHaveLength(1);
  expect(screen.getAllByText('68.4%')).toHaveLength(1);
  expect(screen.getAllByText('ROI +6.8%')).toHaveLength(1);
  expect(
    within(screen.getByRole('region', { name: 'Onboarding today' })).getByText(
      '72.1%'
    )
  ).toBeInTheDocument();
  expect(
    within(screen.getByRole('region', { name: 'Campaigns & email' })).getByText(
      '84'
    )
  ).toBeInTheDocument();
  const navigation = screen.getByRole('navigation', {
    name: 'Admin navigation',
  });
  const navigationLinks = within(navigation).getAllByRole('link');
  expect(navigationLinks).toHaveLength(18);
  const appEventsLink = within(navigation).getByRole('link', { name: 'App Events' });
  const timeInAppLink = within(navigation).getByRole('link', { name: 'Time in app' });
  expect(timeInAppLink).toHaveAttribute('href', '/dashboard/time-in-app');
  expect(navigationLinks.indexOf(timeInAppLink)).toBe(
    navigationLinks.indexOf(appEventsLink) + 1
  );
  expect(
    within(navigation).getByRole('link', { name: 'Overview' })
  ).toHaveAttribute('aria-current', 'page');
});

it('shows only user events in descending frequency, including screen opens and every event below the first five', async () => {
  global.fetch = jest.fn(async (input) => {
    const url = new URL(String(input), 'http://localhost');
    if (url.pathname.includes('/app-events/')) {
      const userOnly = url.searchParams.get('sourceType') === 'user';
      return json({
        summary: {
          totalEvents: userOnly ? 622 : 1522,
          businessActionEvents: userOnly ? 22 : 922,
        },
        countsByEvent: [
          { eventKey: 'checkout_started', count: 2 },
          { eventKey: 'chat_in_ai_chat', count: 7 },
          { eventKey: 'matches_screen_opened', count: 500 },
          { eventKey: 'for_you_feed_opened', count: 100 },
          { eventKey: 'voted_for_prediction', count: 3 },
          { eventKey: 'subscription_paywall_opened', count: 10 },
          { eventKey: 'channel_poll_voted', count: 0 },
          ...(!userOnly
            ? [{ eventKey: 'weekly_stats_digest', count: 900 }]
            : []),
        ],
      });
    }
    return response(String(input));
  });
  show();
  await settled();
  const events = screen.getByRole('region', { name: 'Key app events' });
  expect(within(events).getByText('622')).toBeInTheDocument();
  const list = within(events).getByRole('list', {
    name: 'User events by frequency',
  });
  expect(
    within(list)
      .getAllByRole('listitem')
      .map((row) => row.textContent)
  ).toEqual([
    'Matches screen opened500',
    'For You feed opened100',
    'Subscription paywall opened10',
    'AI chat message sent7',
    'AI prediction vote confirmed3',
    'Checkout started2',
  ]);
  expect(
    within(events).queryByText('Weekly stats digest')
  ).not.toBeInTheDocument();
  expect(within(events).queryByText('Other actions')).not.toBeInTheDocument();
  const requests = (global.fetch as jest.Mock).mock.calls
    .map(([input]) => new URL(String(input), 'http://localhost'))
    .filter((url) => url.pathname.includes('/app-events/'));
  expect(requests).toHaveLength(2);
  expect(requests.map((url) => url.searchParams.get('sourceType'))).toEqual([
    'user',
    'user',
  ]);
});

it('keeps healthy reports visible when growth fails, without fabricating a zero', async () => {
  global.fetch = jest.fn(async (input) =>
    String(input).includes('/admin-overview/growth')
      ? json({}, 503)
      : response(String(input))
  );
  show();
  await settled();
  const registrations = screen.getByRole('region', {
    name: 'New registrations',
  });
  expect(registrations).toHaveTextContent('Data unavailable');
  expect(within(registrations).queryByText('0')).not.toBeInTheDocument();
  expect(
    screen.getByRole('region', { name: 'Key app events' })
  ).toHaveTextContent('1,248');
});

it.each([
  'dmytro.vybornov@levantem.ai',
  'tetiana.datko@levantem.ai',
  'other@test.invalid',
])(
  'hides Revenue for %s and never requests financial data even when the ledger is unlocked',
  async (email) => {
    // A stale stored identity must not override the current token's account.
    document.cookie = `accessToken=e30.${btoa(JSON.stringify({ sub: 'another-admin', email, name: 'Another admin' }))}.render-only`;
    show();
    await settled();
    expect(
      screen.queryByRole('region', { name: 'Revenue' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'New registrations' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'New paid subscriptions' })
    ).toBeInTheDocument();
    const requests = jest
      .mocked(global.fetch)
      .mock.calls.map(([input]) => String(input));
    expect(requests.some((url) => url.includes('revenue-ledger'))).toBe(false);
  }
);

it.each(['sergii.mytakii@levantem.ai', 'mykhailo@levantem.ai'])(
  'shows Revenue for the approved account %s',
  async (email) => {
    document.cookie = `accessToken=e30.${btoa(JSON.stringify({ sub: 'approved-admin', email, name: 'Approved admin' }))}.render-only`;
    show();
    await settled();
    expect(screen.getByRole('region', { name: 'Revenue' })).toHaveTextContent(
      '$428.60'
    );
  }
);

it('respects revenue and monitor access gates before requesting protected data', async () => {
  global.fetch = jest.fn(async (input) => {
    const url = String(input);
    if (url.includes('/api/revenue-ledger-access'))
      return json({ hasAccess: false });
    if (url.includes('/capabilities')) return json({ canRead: false });
    return response(url);
  });
  show();
  await settled();
  expect(screen.getByRole('region', { name: 'Revenue' })).toHaveTextContent(
    'Unlock Revenue Ledger'
  );
  expect(
    screen.getByRole('region', { name: 'System health' })
  ).toHaveTextContent('do not have access');
  const calls = jest
    .mocked(global.fetch)
    .mock.calls.map(([input]) => String(input));
  expect(
    calls.some((url) => url.includes('/revenue-ledger/admin/entries'))
  ).toBe(false);
  expect(
    calls.some((url) => url.includes('/system-monitor/admin/overview'))
  ).toBe(false);
});

it('shows unknown system health for an expired heartbeat instead of green status', async () => {
  global.fetch = jest.fn(async (input) =>
    String(input).includes('/system-monitor/admin/overview')
      ? json({
          ...monitor(),
          workerHeartbeatAt: new Date(Date.now() - 3600000).toISOString(),
        })
      : response(String(input))
  );
  show();
  await settled();
  expect(
    screen.getByRole('region', { name: 'System health' })
  ).toHaveTextContent('Current system health is unknown');
  expect(
    screen.queryByText('All monitored systems operational')
  ).not.toBeInTheDocument();
});

it.each([
  [189999, 'All monitored systems operational'],
  [190000, 'All monitored systems operational'],
  [190001, 'Current system health is unknown'],
])(
  'preserves overview freshness at a result age of %i ms',
  async (age, text) => {
    const now = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now);
    const snapshot = monitor();
    snapshot.checks[0].intervalMs = 120000;
    snapshot.checks[0].lastRun.endedAt = new Date(now - age).toISOString();
    global.fetch = jest.fn(async (input) =>
      String(input).includes('/system-monitor/admin/overview')
        ? json(snapshot)
        : response(String(input))
    );
    try {
      show();
      await settled();
      expect(
        screen.getByRole('region', { name: 'System health' })
      ).toHaveTextContent(text);
    } finally {
      clock.mockRestore();
    }
  }
);

it('does not present unevaluated accuracy and zero-denominator rates as 0%', async () => {
  global.fetch = jest.fn(async (input) => {
    const url = String(input);
    if (url.includes('/evaluations'))
      return json({
        summary: {
          ...predictions,
          v9: { accuracy: null, evaluated: 0, pending: 12, roiPercent: null },
        },
      });
    if (url.includes('/admin-overview/marketing'))
      return json({
        ...marketing,
        campaigns: { sent: 0, opened: 0, openRate: null },
        email: { delivered: 4, clicked: null, clickRate: null },
      });
    return response(url);
  });
  show();
  await settled();
  const predictionReport = screen.getByRole('region', {
    name: 'Prediction performance',
  });
  expect(predictionReport).toHaveTextContent('No evaluated data');
  expect(predictionReport).not.toHaveTextContent('0.0%');
  expect(
    screen.getByRole('region', { name: 'Campaigns & email' })
  ).toHaveTextContent('— click rate');
});

it('ignores a late response for the old date after changing the report date', async () => {
  let finish: (value: Response) => void = () => {};
  global.fetch = jest.fn(async (input) => {
    const url = String(input);
    if (url.includes(`/admin-overview/growth?date=${today}`))
      return new Promise<Response>((resolve) => {
        finish = resolve;
      });
    if (url.includes('/admin-overview/growth'))
      return json({
        ...growth,
        partial: false,
        registrations: { ...growth.registrations, today: 77 },
      });
    return response(url);
  });
  show();
  const input = await screen.findByLabelText('Report date (UTC)');
  fireEvent.change(input, { target: { value: days[5] } });
  await settled();
  expect(
    screen.getByRole('region', { name: 'New registrations' })
  ).toHaveTextContent('77');
  await act(async () => finish(json(growth)));
  expect(
    within(
      screen.getByRole('region', { name: 'New registrations' })
    ).queryByText('128')
  ).not.toBeInTheDocument();
});

it('keeps comparison cutoffs tied to the fetched snapshot as the monitor clock advances', async () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-16T14:30:00Z'));
  try {
    show();
    await settled();
    const revenue = screen.getByRole('region', { name: 'Revenue' });
    expect(revenue).toHaveTextContent('at 14:30 UTC');
    const calls = jest.mocked(global.fetch).mock.calls.length;
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(revenue).toHaveTextContent('at 14:30 UTC');
    expect(revenue).not.toHaveTextContent('14:31');
    act(() => {
      jest.setSystemTime(new Date('2026-10-17T00:00:05Z'));
      jest.advanceTimersByTime(30_000);
    });
    expect(revenue).toHaveTextContent('Oct 16 · USD');
    expect(revenue).toHaveTextContent('at 14:30 UTC');
    expect(jest.mocked(global.fetch).mock.calls).toHaveLength(calls);
  } finally {
    jest.useRealTimers();
  }
});

it('adds six Home Analytics metrics after existing widgets using whole-funnel cohorts and the selected UTC range', async () => {
  show();
  await settled();
  const report = screen.getByRole('region', { name: 'Home Analytics' });
  for (const [title, value] of [
    ['Full Access purchase conversion', '5%'],
    ['Free Pick activation', '15%'],
    ['Paid Top Picks activation', '25%'],
    ['Collections purchase conversion', 'N/A'],
    ['AI Chat unlock conversion', 'N/A'],
    ['Pass-to-subscription conversion', 'N/A'],
  ]) {
    const metric = within(report).getByRole('article', { name: title });
    expect(metric).toHaveTextContent(value);
    expect(within(metric).getByRole('link')).toHaveAttribute(
      'href',
      expect.stringContaining('/dashboard/updated-home-analytics?from=')
    );
  }
  expect(
    screen
      .getByRole('region', { name: 'Needs attention' })
      .compareDocumentPosition(report) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Report date (UTC)'), {
    target: { value: days[5] },
  });
  await settled();
  const calls = jest
    .mocked(global.fetch)
    .mock.calls.map(([input]) => new URL(String(input), 'http://localhost'))
    .filter((url) => url.pathname.includes('/updated-home-analytics/'));
  expect(calls).toHaveLength(16);
  expect(calls[15].searchParams.get('from')).toBe(`${days[5]}T00:00:00.000Z`);
  expect(calls[15].searchParams.get('to')).toBe(`${days[5]}T23:59:59.999Z`);
});

it('preserves zero conversion and missing cohorts without inventing retention or averages', async () => {
  global.fetch = jest.fn(async (input) =>
    String(input).includes('/updated-home-analytics/')
      ? json({
          range: homeAnalytics.range,
          dashboards: [
            {
              id: 2,
              metrics: [
                homeMetric('free_pick_activation_funnel', [
                  {
                    stage: 'home_viewed',
                    numerator: 100,
                    denominator: null,
                    value: 100,
                  },
                  {
                    stage: 'free_pick_prediction_card_opened',
                    numerator: 0,
                    denominator: 0,
                    value: null,
                  },
                ]),
              ],
            },
            {
              id: 3,
              metrics: [
                homeMetric('full_access_funnel', [
                  {
                    stage: 'offer_impression',
                    numerator: 0,
                    denominator: null,
                    value: 0,
                  },
                  {
                    stage: 'verified_purchase',
                    numerator: 0,
                    denominator: 0,
                    value: null,
                  },
                ]),
              ],
            },
          ],
        })
      : response(String(input))
  );
  show();
  await settled();
  const report = screen.getByRole('region', { name: 'Home Analytics' });
  expect(
    within(report).getByRole('article', { name: 'Free Pick activation' })
  ).toHaveTextContent('0%');
  for (const name of [
    'Full Access purchase conversion',
    'Paid Top Picks activation',
    'Collections purchase conversion',
    'AI Chat unlock conversion',
    'Pass-to-subscription conversion',
  ])
    expect(within(report).getByRole('article', { name })).toHaveTextContent(
      'N/A'
    );
});

it('isolates a failed Home Analytics report while other overview reports remain visible', async () => {
  global.fetch = jest.fn(async (input) =>
    String(input).includes('/updated-home-analytics/')
      ? json({}, 503)
      : response(String(input))
  );
  show();
  await settled();
  expect(
    screen.getByRole('region', { name: 'Home Analytics' })
  ).toHaveTextContent('Data unavailable');
  expect(
    screen.getByRole('region', { name: 'New registrations' })
  ).toHaveTextContent('128');
  expect(
    screen.getByRole('region', { name: 'Key app events' })
  ).toHaveTextContent('1,248');
});

it('shows seven daily Home Analytics points with gaps, real zeros and a partial current day', async () => {
  jest.useFakeTimers().setSystemTime(new Date(`${today}T14:30:00.000Z`));
  try {
    global.fetch = jest.fn(async (input) => {
      const url = new URL(String(input), 'http://localhost');
      if (!url.pathname.includes('/updated-home-analytics/'))
        return response(String(input));
      const day = url.searchParams.get('from')!.slice(0, 10);
      const index = days.indexOf(day);
      if (index === 2) return json({}, 503);
      return json({
        range: {
          from: url.searchParams.get('from'),
          to: url.searchParams.get('to'),
        },
        dashboards: [
          {
            id: 3,
            metrics: [
              homeMetric('full_access_funnel', [
                {
                  stage: 'offer_impression',
                  numerator: 100,
                  denominator: null,
                  value: 100,
                },
                {
                  stage: 'verified_purchase',
                  numerator:
                    url.searchParams.get('to') === `${today}T14:30:00.000Z` &&
                    index === 0
                      ? 5
                      : [1, 2, 3, 4, 0, 6, 5][index],
                  denominator: 10,
                  value: 50,
                },
              ]),
            ],
          },
        ],
      });
    });
    show();
    await settled();
    const report = screen.getByRole('region', { name: 'Home Analytics' });
    const metric = within(report).getByRole('article', {
      name: 'Full Access purchase conversion',
    });
    expect(metric).toHaveTextContent('5%');
    const chart = within(metric).getByRole('img');
    expect(chart).toHaveAccessibleName(
      `Daily Full Access purchase conversion: ${days.map((day, i) => `${day}: ${['1%', '2%', 'unavailable', '4%', '0%', '6%', '5%'][i]}`).join(', ')}`
    );
    expect(report).toHaveTextContent('Today is partial');
    expect(report).toHaveTextContent('Some days are unavailable');
    expect(within(report).getAllByRole('img')).toHaveLength(5);
    const calls = jest
      .mocked(global.fetch)
      .mock.calls.map(([input]) => new URL(String(input), 'http://localhost'))
      .filter((url) => url.pathname.includes('/updated-home-analytics/'));
    expect(calls).toHaveLength(8);
    expect(calls.slice(1).map((url) => url.searchParams.get('from'))).toEqual(
      days.map((day) => `${day}T00:00:00.000Z`)
    );
    expect(calls[0].searchParams.get('from')).toBe(`${days[0]}T00:00:00.000Z`);
    expect(calls[0].searchParams.get('to')).toBe(`${today}T14:30:00.000Z`);
    expect(calls[1].searchParams.get('to')).toBe(`${days[0]}T23:59:59.999Z`);
    expect(calls[7].searchParams.get('to')).toBe(`${today}T14:30:00.000Z`);
  } finally {
    jest.useRealTimers();
  }
});
