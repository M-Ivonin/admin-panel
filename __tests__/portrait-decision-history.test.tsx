import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { PortraitDecisionHistory } from '@/components/app-events-analytics/PortraitDecisionHistory';
import {
  getUserPortraitDecisionHistory,
  exportUserPortraitDecisions,
  replayUserPortraitDecision,
  type PortraitDecisionHistory as History,
} from '@/lib/api/user-portrait';
jest.mock('@/lib/api/user-portrait', () => ({
  getUserPortraitDecisionHistory: jest.fn(),
  replayUserPortraitDecision: jest.fn(),
  exportUserPortraitDecisions: jest.fn(),
}));
const empty: History = {
  mode: 'shadow',
  dispatchEnabled: false,
  status: 'available',
  capabilities: {},
  items: [],
};
const selection = {
  candidateId: 'news:one:revision',
  reasonCode: 'relevant_news',
  templateId: 'stored_news.v1',
  locale: 'en',
  channel: 'none' as const,
  dispatchAt: '2026-10-28T10:30:00Z',
  expiresAt: '2026-10-28T10:45:00Z',
  materialVersion: 'revision',
};
const history: History = {
  ...empty,
  items: [
    {
      id: 'decision-one',
      snapshotId: 'historic-snapshot',
      triggerKey: 'source:one',
      createdAt: '2026-10-28T10:30:00Z',
      completedAt: '2026-10-28T10:30:01Z',
      status: 'completed',
      mode: 'shadow',
      dispatchEnabled: false,
      source: 'model',
      baseline: selection,
      selection,
      selectedCandidate: {
        kind: 'news',
        opportunityId: 'news:one',
        proposedChannel: 'in_app',
        disposition: 'consider',
        destination: '/feed/news:one',
        copy: {
          title: 'Exact stored title',
          body: 'Exact stored body, without a sales footer.',
        },
      },
      input: {
        snapshot: {
          id: 'historic-snapshot',
          asOf: '2026-10-28T10:29:00Z',
          schemaVersion: 1,
          featureVersion: 'observed-product-actions-v1',
        },
        evaluatedAt: '2026-10-28T10:30:00Z',
        targetApp: 'SirBro',
        versions: { policy: 'portrait-shadow.v1', model: 'gpt-6.1-terra' },
        facts: {
          selectedWindow: {
            days: 7,
            from: '2026-10-22T00:00:00Z',
            to: '2026-10-28T10:29:00Z',
          },
        },
        current: {
          capturedAt: '2026-10-28T10:30:00Z',
          access: { authorization: 'FREE' },
          pendingCommerce: false,
          activeInApp: true,
          preferences: {
            effectivePredictions: 'unknown',
            revision: 'preference-revision',
          },
        },
        exclusions: ['shadow_is_not_contact_permission'],
        capabilities: { exposure: 'disabled' },
      },
      validator: { accepted: true, reasons: [] },
      model: {
        status: 'completed',
        model: 'gpt-6.1-terra',
        responseId: 'resp_actual-reference',
        latencyMs: 100,
        inputTokens: 200,
        outputTokens: 40,
        store: false,
        retention: 'standard_abuse_monitoring_up_to_30_days',
      },
    },
  ],
};
beforeEach(() => {
  jest.resetAllMocks();
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

async function openDecision(title = 'Recommend a news item') {
  const table = await screen.findByRole('table', { name: 'Saved decisions' });
  fireEvent.click(within(table).getByRole('button', { name: title }));
  return within(screen.getByRole('region', { name: 'Decision details' }));
}

it('shows the saved reason and exact message only after choosing a decision', async () => {
  const explanation = 'The news is relevant to the recorded team interests.';
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
    ...history,
    items: [
      {
        ...history.items[0],
        model: { ...history.items[0].model, explanation },
      },
    ],
  });
  render(<PortraitDecisionHistory userId="account-one" />);
  expect(
    await screen.findByRole('table', { name: 'Saved decisions' })
  ).toBeVisible();
  expect(screen.queryByText('Exact stored title')).not.toBeInTheDocument();
  const details = await openDecision();
  expect(
    details.getByText(/matched the user.s recorded interests/)
  ).toBeVisible();
  expect(details.getByText(explanation)).toBeVisible();
  expect(details.getByText('Exact stored title')).toBeVisible();
  expect(
    details.getByText('Exact stored body, without a sales footer.')
  ).toBeVisible();
  expect(details.getByText('Sending status unavailable')).toBeVisible();
  for (const technical of [
    'Technical details',
    'Selected by AI',
    'Replay frozen validation',
    'historic-snapshot',
    'resp_actual-reference',
  ]) {
    expect(screen.queryByText(technical)).not.toBeInTheDocument();
  }
  expect(replayUserPortraitDecision).not.toHaveBeenCalled();
});

it('does not show an unaccepted AI proposal as the reason for a rule decision', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
    ...history,
    items: [
      {
        ...history.items[0],
        source: 'baseline',
        validator: { accepted: false, reasons: ['news_changed'] },
        model: {
          ...history.items[0].model,
          explanation: 'This is a great match.',
        },
        selectedCandidate: {
          ...history.items[0].selectedCandidate,
          kind: 'no_action',
          copy: null,
        },
      },
    ],
  });
  render(<PortraitDecisionHistory userId="account-one" />);
  const details = await openDecision('Do not contact the user');
  expect(
    details.getByText(
      'The proposed News item changed or became unavailable before the decision was saved.'
    )
  ).toBeVisible();
  expect(screen.queryByText('This is a great match.')).not.toBeInTheDocument();
  expect(screen.queryByText('Suggested message')).not.toBeInTheDocument();
});

it.each(['none', 'in_app', 'push', 'email'] as const)(
  'does not treat a selected %s channel as a real send',
  async (channel) => {
    jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
      ...history,
      items: [
        {
          ...history.items[0],
          selection: { ...selection, channel },
          deliveries: [],
        },
      ],
    });
    render(<PortraitDecisionHistory userId="account-one" />);
    const details = await openDecision();
    expect(details.getByText('No sending record')).toBeVisible();
    expect(details.getByText(/A suggestion does not confirm/)).toBeVisible();
    expect(screen.queryByText('Sent')).not.toBeInTheDocument();
  }
);

const delivery = {
  id: 'delivery-one',
  channel: 'push',
  status: 'sent',
  sentAt: '2026-10-28T10:31:00Z',
  providerAcceptedAt: null,
  providerFinalEventAt: null,
  emailSubmissionState: null,
  openedAt: null,
  pushOpenedAt: null,
  renderedTitle: null,
  renderedBody: null,
};

it.each([
  [{ ...delivery }, 'Sent'],
  [{ ...delivery, pushOpenedAt: '2026-10-28T10:32:00Z' }, 'Opened by user'],
  [
    { ...delivery, status: 'available', channel: 'in_app', sentAt: null },
    'Available in app',
  ],
  [
    { ...delivery, status: 'shown', channel: 'in_app', sentAt: null },
    'Shown in app',
  ],
  [{ ...delivery, status: 'pending', sentAt: null }, 'Queued'],
  [{ ...delivery, status: 'failed', sentAt: null }, 'Send failed'],
  [
    {
      ...delivery,
      channel: 'email',
      emailSubmissionState: 'ambiguous',
      sentAt: null,
    },
    'Sending unconfirmed',
  ],
  [
    { ...delivery, channel: 'email', emailSubmissionState: 'bounced' },
    'Email bounced',
  ],
  [
    { ...delivery, channel: 'email', emailSubmissionState: 'delivered' },
    'Delivery confirmed',
  ],
  [
    {
      ...delivery,
      status: 'pending',
      sentAt: null,
      providerAcceptedAt: '2026-10-28T10:31:00Z',
    },
    'Accepted by provider',
  ],
] as const)(
  'preserves actual delivery evidence: %s',
  async (evidence, expected) => {
    jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
      ...history,
      items: [{ ...history.items[0], deliveries: [evidence] }],
    });
    render(<PortraitDecisionHistory userId="account-one" />);
    const details = await openDecision();
    expect(details.getByText(expected)).toBeVisible();
    expect(within(screen.getByRole('table')).getByText(expected)).toBeVisible();
  }
);

it.each([
  [
    'no_channel',
    'Suitable content was available, but no approved contact channel was ready.',
  ],
  [
    'scenario_disabled',
    'Suitable content was available, but this message type was disabled in settings.',
  ],
  ['policy_exclusion', 'Contact rules excluded the available suggestions.'],
  ['no_content', 'No suitable content was available.'],
] as const)(
  'explains %s without exposing diagnostic counts',
  async (primary, explanation) => {
    const item = {
      ...history.items[0],
      input: {
        ...history.items[0].input,
        diagnostics: {
          version: 1 as const,
          primary,
          scenarios: {
            'stored_news.v1': {
              checked: true,
              supplied: 5,
              relevant: 1,
              consumed: 0,
              channelEligible: 0,
              policyEligible: 0,
            },
          },
        },
      },
    };
    jest
      .mocked(getUserPortraitDecisionHistory)
      .mockResolvedValue({ ...history, items: [item] });
    render(<PortraitDecisionHistory userId="account" />);
    expect((await openDecision()).getByText(explanation)).toBeVisible();
    expect(
      screen.queryByText(/supplied|FCM|Tokens:|Local time:/)
    ).not.toBeInTheDocument();
  }
);

it('shows a readable send failure without exposing database codes', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
    ...history,
    items: [
      {
        ...history.items[0],
        deliveries: [
          {
            ...delivery,
            status: 'failed',
            sentAt: null,
            failureReason: 'account_policy_unavailable:before_submit:db_57014',
          },
        ],
      },
    ],
  });
  render(<PortraitDecisionHistory userId="account" />);
  expect(
    (await openDecision()).getByText('The sending rules could not be checked.')
  ).toBeVisible();
  expect(screen.queryByText(/57014/)).not.toBeInTheDocument();
});

it('filters outcomes without treating unknown sending status as no sending record', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
    ...history,
    items: [
      history.items[0],
      {
        ...history.items[0],
        id: 'no-record',
        deliveries: [],
        selectedCandidate: {
          ...history.items[0].selectedCandidate,
          kind: 'no_action',
        },
      },
      { ...history.items[0], id: 'sent', deliveries: [delivery] },
    ],
  });
  render(<PortraitDecisionHistory userId="account" />);
  await screen.findByRole('table');
  fireEvent.mouseDown(
    screen.getByRole('combobox', { name: 'Filter sending outcomes' })
  );
  fireEvent.click(screen.getByRole('option', { name: 'No sending record' }));
  expect(
    screen.queryByText('Sending status unavailable')
  ).not.toBeInTheDocument();
  expect(screen.queryByText('Sent')).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Do not contact the user' })
  ).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search history' }), {
    target: { value: 'not found' },
  });
  expect(screen.getByText('No decisions match these filters.')).toBeVisible();
});

it('marks pending choices as provisional', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
    ...history,
    items: [{ ...history.items[0], status: 'pending' }],
  });
  render(<PortraitDecisionHistory userId="account" />);
  expect(
    (await openDecision()).getByText(/This decision is provisional/)
  ).toBeVisible();
});

it('shows read failure and recovers with a read-only refresh', async () => {
  jest
    .mocked(getUserPortraitDecisionHistory)
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValueOnce(empty);
  render(<PortraitDecisionHistory userId="account" />);
  expect(await screen.findByText('Offline')).toBeVisible();
  fireEvent.click(
    screen.getByRole('button', { name: 'Refresh saved decisions' })
  );
  expect(await screen.findByText('No saved decisions yet.')).toBeVisible();
  expect(replayUserPortraitDecision).not.toHaveBeenCalled();
});

it('does not expose decisions returned in a restricted response', async () => {
  jest
    .mocked(getUserPortraitDecisionHistory)
    .mockResolvedValue({ ...history, status: 'restricted' });
  render(<PortraitDecisionHistory userId="account" />);
  expect(
    await screen.findByText(/account’s privacy preferences/)
  ).toBeVisible();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Download all decisions (JSON)' })
  ).toBeDisabled();
});

it('exports the full account history from the export route, including decisions outside the preview', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue(history);
  const allItems = Array.from({ length: 23 }, (_, i) => ({
    ...history.items[0],
    id: `decision-${i}`,
    deliveries: [],
  }));
  const exported = {
    ...history,
    userId: 'account-one',
    exportedAt: '2026-10-29T19:00:00Z',
    scope: 'all_retained_decisions' as const,
    total: 23,
    items: allItems,
  };
  jest.mocked(exportUserPortraitDecisions).mockResolvedValue(exported);
  let blob: Blob | undefined;
  URL.createObjectURL = jest.fn((value: Blob) => {
    blob = value;
    return 'blob:export';
  });
  URL.revokeObjectURL = jest.fn();
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});
  render(<PortraitDecisionHistory userId="account-one" />);
  fireEvent.click(
    await screen.findByRole('button', { name: 'Download all decisions (JSON)' })
  );
  expect(
    await screen.findByText('Downloaded 23 saved decisions.')
  ).toBeVisible();
  expect(exportUserPortraitDecisions).toHaveBeenCalledWith('account-one');
  const content = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob!);
  });
  expect(JSON.parse(content)).toEqual(exported);
  expect(click).toHaveBeenCalledTimes(1);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:export');
  click.mockRestore();
});

it('does not download a restricted export or claim success on an export error', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue(history);
  jest.mocked(exportUserPortraitDecisions).mockResolvedValue({
    ...empty,
    status: 'restricted',
    userId: 'account-one',
    exportedAt: '',
    scope: 'all_retained_decisions',
    total: 0,
  });
  const create = jest.spyOn(URL, 'createObjectURL');
  render(<PortraitDecisionHistory userId="account-one" />);
  fireEvent.click(
    await screen.findByRole('button', { name: 'Download all decisions (JSON)' })
  );
  expect(
    await screen.findByText(/Export is unavailable for this account/)
  ).toBeVisible();
  expect(create).not.toHaveBeenCalled();
});

it('discards late history and export responses after switching accounts', async () => {
  let resolve!: (value: History) => void;
  let finishExport!: (
    value: Awaited<ReturnType<typeof exportUserPortraitDecisions>>
  ) => void;
  jest
    .mocked(getUserPortraitDecisionHistory)
    .mockResolvedValueOnce(history)
    .mockReturnValueOnce(
      new Promise<History>((yes) => {
        resolve = yes;
      })
    );
  jest.mocked(exportUserPortraitDecisions).mockReturnValueOnce(
    new Promise((yes) => {
      finishExport = yes;
    })
  );
  const { rerender } = render(<PortraitDecisionHistory userId="old" />);
  fireEvent.click(
    await screen.findByRole('button', { name: 'Download all decisions (JSON)' })
  );
  rerender(<PortraitDecisionHistory userId="new" />);
  const create = jest.spyOn(URL, 'createObjectURL');
  await act(async () =>
    finishExport({
      ...history,
      userId: 'old',
      exportedAt: '',
      scope: 'all_retained_decisions',
      total: 1,
    })
  );
  expect(create).not.toHaveBeenCalled();
  await act(async () => resolve(empty));
  expect(await screen.findByText(/No saved decisions yet/)).toBeVisible();
  expect(screen.queryByText('Exact stored title')).not.toBeInTheDocument();
});

it('selects a table row, searches saved messages and closes the details panel', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
    ...history,
    items: [
      history.items[0],
      {
        ...history.items[0],
        id: 'decision-two',
        selectedCandidate: {
          ...history.items[0].selectedCandidate,
          kind: 'no_action',
          disposition: 'no_action',
          copy: null,
        },
        selection: { ...selection, reasonCode: 'no_opportunity' },
        deliveries: [],
      },
    ],
  });
  render(<PortraitDecisionHistory userId="account-one" />);
  const table = await screen.findByRole('table', { name: 'Saved decisions' });
  fireEvent.click(
    within(table).getByRole('button', { name: 'Do not contact the user' })
  );
  expect(
    within(screen.getByRole('region', { name: 'Decision details' })).getByText(
      'No eligible recommendation was available at the time.'
    )
  ).toBeVisible();
  expect(screen.queryByText('Exact stored title')).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: 'Close decision details' })
  );
  expect(
    screen.queryByRole('region', { name: 'Decision details' })
  ).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search history' }), {
    target: { value: 'Exact stored body' },
  });
  expect(
    within(table).queryByRole('button', { name: 'Do not contact the user' })
  ).not.toBeInTheDocument();
  fireEvent.click(
    within(table).getByRole('button', { name: 'Recommend a news item' })
  );
  expect(
    screen.getByText('Exact stored body, without a sales footer.')
  ).toBeVisible();
  expect(
    screen.getByRole('button', { name: 'Download all decisions (JSON)' })
  ).toBeVisible();
  expect(screen.queryByText('Technical details')).not.toBeInTheDocument();
});
