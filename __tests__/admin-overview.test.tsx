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

function response(url: string): Response {
  if (url.includes('/api/revenue-ledger-access'))
    return json({ hasAccess: true });
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
  document.cookie = `accessToken=e30.${btoa(JSON.stringify({ sub: 'admin', email: 'admin@test.invalid', name: 'Administrator' }))}.render-only`;
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: 'admin',
      email: 'admin@test.invalid',
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
  expect(within(navigation).getAllByRole('link')).toHaveLength(17);
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
