import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { PersonalizationResults } from '@/components/app-events-analytics/PersonalizationResults';
import {
  getPersonalizationResults,
  type PersonalizationResults as Results,
} from '@/lib/api/personalization-results';

jest.mock('@/lib/api/personalization-results', () => ({
  getPersonalizationResults: jest.fn(),
}));
const read = jest.mocked(getPersonalizationResults);
const report: Results = {
  mode: 'permanent',
  days: 7,
  from: '2026-10-27T11:00:00Z',
  to: '2026-11-03T11:00:00Z',
  accountLimit: 100,
  summary: {
    accounts: 2444,
    decisions: 21400,
    aiDecisions: 20,
    selectedContacts: 18,
    deliveries: 12,
    acceptedOrShown: 10,
    opened: 3,
    usefulActions: 7,
    purchases: 2,
    contactedAccounts: 9,
    openedAccounts: 2,
    usefulActionAccounts: 3,
    notSent: 2,
    purchasingAccounts: 1,
    lastDecisionAt: '2026-11-03T10:59:00Z',
  },
  accounts: [
    {
      userId: 'account-a',
      accountLabel: 'Alex',
      lastDecisionAt: '2026-11-03T10:59:00Z',
      decisions: 10,
      aiDecisions: 1,
      selectedContacts: 1,
      deliveries: 1,
      acceptedOrShown: 1,
      opened: 1,
      usefulActions: 7,
      purchases: 2,
    },
  ],
  grossPurchases: [{ currency: 'USD', amount: '10' }],
  missingPurchaseAmounts: 0,
  decisionReasons: [{ reason: 'no_eligible_action', count: 21000 }],
  deliveryStatuses: [{ status: 'sent', count: 10 }],
};
beforeEach(() => {
  jest.clearAllMocks();
  read.mockResolvedValue(report);
});

it('shows unique account outcomes and hides diagnostics and explanations until requested', async () => {
  render(<PersonalizationResults />);
  const contacted = await screen.findByRole('article', {
    name: 'Contacted accounts',
  });
  expect(within(contacted).getByText('9')).toBeVisible();
  expect(
    within(screen.getByRole('article', { name: 'Opened a message' })).getByText(
      '2'
    )
  ).toBeVisible();
  expect(
    within(
      screen.getByRole('article', { name: 'Action after contact' })
    ).getByText('3')
  ).toBeVisible();
  expect(
    within(
      screen.getByRole('article', { name: 'Purchase after contact' })
    ).getByText('1')
  ).toBeVisible();
  expect(
    within(screen.getByRole('region', { name: 'Message activity' })).getByText(
      '3'
    )
  ).toBeVisible();
  expect(screen.queryByLabelText('Experiment')).not.toBeInTheDocument();
  expect(screen.queryByText('Assigned accounts')).not.toBeInTheDocument();
  screen
    .getAllByText('Decisions')
    .forEach((el) => expect(el).not.toBeVisible());
  expect(screen.getByText('No eligible action: 21000')).not.toBeVisible();
  expect(screen.getByText(/10 USD/)).not.toBeVisible();
  fireEvent.click(
    screen.getByRole('button', { name: 'Contacted accounts information' })
  );
  expect(
    screen.getByRole('dialog', { name: 'Contacted accounts' })
  ).toHaveTextContent('Unique accounts');
  fireEvent.keyDown(
    screen.getByRole('dialog', { name: 'Contacted accounts' }),
    { key: 'Escape' }
  );
  fireEvent.click(screen.getByText('How personalization works'));
  expect(screen.getByText('No eligible action: 21000')).toBeVisible();
  fireEvent.click(screen.getByText('Accounts', { exact: true }));
  expect(await screen.findByRole('link', { name: 'Alex' })).toHaveAttribute(
    'href',
    '/dashboard/users/account-a/portrait'
  );
});

it('mounts Accounts only while expanded and uses the latest refreshed report', async () => {
  render(<PersonalizationResults />);
  const title = await screen.findByText('Accounts', { exact: true });
  const disclosure = title.closest('details')!;
  const summary = title.closest('summary')!;
  const tableName = 'Permanent personalization accounts';
  expect(summary).toBeVisible();
  expect(summary).toHaveTextContent('9 contacted');
  expect(disclosure).not.toHaveAttribute('open');
  expect(screen.queryByRole('table', { hidden: true })).not.toBeInTheDocument();
  expect(
    screen.queryByText(/Showing .* evaluated accounts/)
  ).not.toBeInTheDocument();

  fireEvent.click(summary);
  const table = await screen.findByRole('table', { name: tableName });
  const row = within(table).getAllByRole('row')[1];
  expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
    'Alex',
    '3 Nov 2026, 10:59 UTC',
    '10',
    '1',
    '1',
    '7',
    '2',
  ]);
  expect(within(row).getByRole('link', { name: 'Alex' })).toHaveAttribute(
    'href',
    '/dashboard/users/account-a/portrait'
  );
  expect(screen.getByText(/Showing 1 of 2,444 evaluated accounts/)).toBeVisible();

  fireEvent.click(summary);
  await waitFor(() =>
    expect(screen.queryByRole('table', { hidden: true })).not.toBeInTheDocument()
  );
  read.mockResolvedValue({
    ...report,
    summary: { ...report.summary, contactedAccounts: 12 },
    accounts: [
      {
        ...report.accounts[0],
        userId: 'account/b',
        accountLabel: 'Blair',
        decisions: 23,
      },
      { ...report.accounts[0], userId: 'account-c', accountLabel: 'Casey' },
    ],
  });
  fireEvent.click(screen.getByRole('button', { name: 'Refresh results' }));
  await waitFor(() => expect(summary).toHaveTextContent('12 contacted'));
  expect(screen.queryByRole('table', { hidden: true })).not.toBeInTheDocument();
  expect(
    screen.queryByText(/Showing .* evaluated accounts/)
  ).not.toBeInTheDocument();

  fireEvent.click(summary);
  const refreshed = await screen.findByRole('table', { name: tableName });
  expect(within(refreshed).getAllByRole('row')).toHaveLength(3);
  expect(within(refreshed).queryByText('Alex')).not.toBeInTheDocument();
  expect(within(refreshed).getByRole('link', { name: 'Blair' })).toHaveAttribute(
    'href',
    '/dashboard/users/account%2Fb/portrait'
  );
  expect(within(refreshed).getByRole('link', { name: 'Casey' })).toHaveAttribute(
    'href',
    '/dashboard/users/account-c/portrait'
  );
  expect(within(refreshed).getByText('23')).toBeVisible();
  expect(screen.getByText(/Showing 2 of 2,444 evaluated accounts/)).toBeVisible();
});

it('keeps expanded Accounts current during polling', async () => {
  jest.useFakeTimers();
  try {
    render(<PersonalizationResults />);
    await act(async () => {});
    const summary = screen
      .getByText('Accounts', { exact: true })
      .closest('summary')!;
    fireEvent.click(summary);
    const disclosure = summary.closest('details')!;
    expect(disclosure).toHaveAttribute('open');
    // Deliver the native event explicitly while polling uses fake timers.
    fireEvent(disclosure, new Event('toggle'));
    expect(screen.getByRole('link', { name: 'Alex' })).toBeVisible();
    read.mockResolvedValue({
      ...report,
      accounts: [
        { ...report.accounts[0], accountLabel: 'Alex updated', decisions: 11 },
      ],
    });
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(screen.queryByRole('link', { name: 'Alex' })).not.toBeInTheDocument();
    const table = screen.getByRole('table', {
      name: 'Permanent personalization accounts',
    });
    expect(
      within(table).getByRole('link', { name: 'Alex updated' })
    ).toBeVisible();
    expect(within(table).getByText('11')).toBeVisible();
  } finally {
    jest.useRealTimers();
  }
});

it('shows the four daily counts for the selected UTC date', async () => {
  read.mockResolvedValue({
    ...report,
    dailyActivity: [
      {
        date: '2026-11-01',
        contactedAccounts: 5,
        messagesCreated: 12,
        openedAccounts: 2,
        openedMessages: 4,
      },
      {
        date: '2026-11-02',
        contactedAccounts: 3,
        messagesCreated: 7,
        openedAccounts: 1,
        openedMessages: 2,
      },
      {
        date: '2026-11-03',
        contactedAccounts: 0,
        messagesCreated: 0,
        openedAccounts: 0,
        openedMessages: 0,
      },
    ],
  });
  render(<PersonalizationResults />);
  const chart = within(
    await screen.findByRole('region', { name: 'Daily activity' })
  );
  expect(chart.getByText('Nov 2 selected')).toBeVisible();
  fireEvent.click(chart.getByRole('button', { name: 'Nov 1' }));
  expect(chart.getByText('Nov 1 selected')).toBeVisible();
  expect(chart.getByText('Contacted accounts').parentElement).toHaveTextContent(
    '5'
  );
  expect(chart.getByText('Messages created').parentElement).toHaveTextContent(
    '12'
  );
  expect(
    chart.getByText('Accounts that opened').parentElement
  ).toHaveTextContent('2');
  expect(chart.getByText('Opened messages').parentElement).toHaveTextContent(
    '4'
  );
  expect(chart.getByText('Nov 3 in progress')).toBeVisible();
});

it('loads the chosen period and refreshes from current sources', async () => {
  render(<PersonalizationResults />);
  await screen.findByRole('article', { name: 'Contacted accounts' });
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Period' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Last 24 hours' }));
  await waitFor(() =>
    expect(read).toHaveBeenLastCalledWith(1, expect.any(AbortSignal))
  );
  await screen.findByRole('article', { name: 'Contacted accounts' });
  read.mockResolvedValue({
    ...report,
    summary: { ...report.summary, contactedAccounts: 25 },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Refresh results' }));
  expect(await screen.findByText('25')).toBeInTheDocument();
});

it('refreshes every minute and releases the timer and pending request on unmount', async () => {
  jest.useFakeTimers();
  try {
    const view = render(<PersonalizationResults />);
    await act(async () => {});
    expect(read).toHaveBeenCalledTimes(1);
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(read).toHaveBeenCalledTimes(2);
    const signal = read.mock.calls[1][1]!;
    view.unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(read).toHaveBeenCalledTimes(2);
  } finally {
    jest.useRealTimers();
  }
});

it('does not poll when the document is hidden', async () => {
  jest.useFakeTimers();
  const visibility = jest.spyOn(document, 'visibilityState', 'get');
  try {
    const view = render(<PersonalizationResults />);
    await act(async () => {});
    visibility.mockReturnValue('hidden');
    await act(async () => {
      jest.advanceTimersByTime(120000);
    });
    expect(read).toHaveBeenCalledTimes(1);
    visibility.mockReturnValue('visible');
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(read).toHaveBeenCalledTimes(2);
    view.unmount();
  } finally {
    visibility.mockRestore();
    jest.useRealTimers();
  }
});

it('keeps last successful results with an explicit stale warning when refresh fails', async () => {
  render(<PersonalizationResults />);
  await screen.findByRole('article', { name: 'Contacted accounts' });
  read.mockRejectedValue(new Error('Service unavailable'));
  fireEvent.click(screen.getByRole('button', { name: 'Refresh results' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'last successful update'
  );
  expect(
    screen.getByRole('article', { name: 'Contacted accounts' })
  ).toHaveTextContent('9');
});

it('shows an honest empty state and missing financial data', async () => {
  read.mockResolvedValue({
    ...report,
    summary: { ...report.summary, accounts: 0 },
    accounts: [],
    missingPurchaseAmounts: 2,
  });
  render(<PersonalizationResults />);
  expect(
    await screen.findByText(
      'No permanent personalization decisions recorded in this period.'
    )
  ).toBeInTheDocument();
  expect(screen.getByText(/Totals are incomplete/)).not.toBeVisible();
  fireEvent.click(screen.getByText('Metric definitions'));
  expect(screen.getByText(/Totals are incomplete/)).toBeVisible();
});
