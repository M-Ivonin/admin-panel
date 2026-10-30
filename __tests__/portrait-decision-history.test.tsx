import { act, fireEvent, render, screen } from '@testing-library/react';
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
beforeEach(() => jest.resetAllMocks());

it('shows a recorded AI explanation separately from the saved reason code', async () => {
  const explanation = 'I deferred because repeating the same offer immediately would add no useful context.';
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
    ...history,
    items: history.items.map((item) => ({...item, model: {...item.model, explanation}})),
  });
  render(<PortraitDecisionHistory userId="account-one" />);
  expect(await screen.findByText(explanation)).toBeVisible();
  expect(screen.getByText('AI explanation')).toBeVisible();
});

it('does not invent an explanation for historical AI decisions', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue(history);
  render(<PortraitDecisionHistory userId="account-one" />);
  expect(await screen.findByText('No AI explanation was recorded for this decision.')).toBeVisible();
});

it('explains server invalidation without attributing fallback silence to AI', async () => {
  (getUserPortraitDecisionHistory as jest.Mock).mockResolvedValue({
    ...history,
    items: history.items.map((item) => ({
      ...item,
      source: 'baseline',
      selection: {...item.selection, candidateId: 'no_action', reasonCode: 'model_silence'},
      selectedCandidate: {...item.selectedCandidate, kind: 'no_action', copy: null},
      validator: {accepted: false, reasons: ['news_changed']},
      model: {...item.model, explanation: 'The News item matches the recorded interests.'},
    })),
  });
  render(<PortraitDecisionHistory userId="account-one" />);
  expect(await screen.findByText('The proposed News item changed or became unavailable before the decision was saved.')).toBeVisible();
  expect(screen.queryByText('The AI selected no contact.')).not.toBeInTheDocument();
  expect(screen.getByText('AI proposal explanation')).toBeVisible();
});

it('shows what the AI selected, the saved reason and message, with no invented sending confirmation', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue(history);
  render(
    <PortraitDecisionHistory
      userId="account-one"
      viewedSnapshotId="current-snapshot"
    />
  );
  expect(await screen.findByText('Recommend a news item')).toBeVisible();
  expect(screen.getByText('Selected by AI')).toBeVisible();
  expect(
    screen.getByText(/matched the user.s recorded interests/)
  ).toBeVisible();
  expect(screen.getByText('Exact stored title')).toBeVisible();
  expect(
    screen.getByText('Exact stored body, without a sales footer.')
  ).toBeVisible();
  expect(screen.getByText('Sending status unavailable')).toBeVisible();
  const details = screen.getByText('Technical details').closest('details');
  expect(details).not.toHaveAttribute('open');
  expect(screen.getByText(/Tokens:/)).not.toBeVisible();
  expect(screen.getByText('Replay frozen validation')).not.toBeVisible();
});

it.each(['none', 'in_app', 'push', 'email'] as const)(
  'does not treat a selected %s channel as a real send',
  async (channel) => {
    jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
      ...history,
      items: history.items.map((item) => ({
        ...item,
        selection: { ...item.selection, channel },
        deliveries: [],
      })),
    });
    render(<PortraitDecisionHistory userId="account-one" />);
    expect(await screen.findByText('No sending record')).toBeVisible();
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
  [{ ...delivery, status: 'available', channel: 'in_app' }, 'Available in app'],
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
] as const)(
  'shows actual delivery evidence: %s',
  async (evidence, expected) => {
    jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
      ...history,
      items: history.items.map((item) => ({
        ...item,
        deliveries: [evidence],
      })),
    });
    render(<PortraitDecisionHistory userId="account-one" />);
    expect(await screen.findByText(expected)).toBeVisible();
  }
);

it('identifies a rule fallback and no-action decision without inventing an AI message', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
    ...history,
    items: history.items.map((item) => ({
      ...item,
      source: 'baseline',
      selection: { ...item.selection, reasonCode: 'no_opportunity' },
      selectedCandidate: {
        ...item.selectedCandidate,
        kind: 'no_action',
        disposition: 'no_action',
        copy: null,
      },
      validator: { accepted: false, reasons: ['model_timeout'] },
      model: { ...item.model, status: 'timeout' },
      deliveries: [],
    })),
  });
  render(<PortraitDecisionHistory userId="account-one" />);
  expect(await screen.findByText('Do not contact the user')).toBeVisible();
  expect(screen.getByText('Selected by rules')).toBeVisible();
  expect(
    screen.getByText(/AI did not return a usable selection/)
  ).toBeVisible();
  expect(screen.getByText('No message proposed.')).toBeVisible();
  expect(screen.queryByText('Selected by AI')).not.toBeInTheDocument();
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

it('keeps frozen validation under technical details and performs only a replay on request', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue(history);
  jest.mocked(replayUserPortraitDecision).mockResolvedValue({
    status: 'replayed',
    modelCalled: false,
    dispatchEnabled: false,
    validator: { accepted: true },
  });
  render(<PortraitDecisionHistory userId="account-one" />);
  const details = (await screen.findByText('Technical details')).closest(
    'details'
  )!;
  details.setAttribute('open', '');
  expect(
    screen.getByRole('row', { name: /Pinned snapshot historic-snapshot/ })
  ).toBeVisible();
  fireEvent.click(
    screen.getByRole('button', { name: 'Replay frozen validation' })
  );
  expect(
    await screen.findByText(/No model was called and no action was executed/)
  ).toBeVisible();
  expect(replayUserPortraitDecision).toHaveBeenCalledWith(
    'account-one',
    'decision-one'
  );
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
  expect(await screen.findByText(/No saved decisions yet/)).toBeVisible();
  expect(replayUserPortraitDecision).not.toHaveBeenCalled();
});
