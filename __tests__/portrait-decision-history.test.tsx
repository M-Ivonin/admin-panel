import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { PortraitDecisionHistory } from '@/components/app-events-analytics/PortraitDecisionHistory';
import {
  getUserPortraitDecisionHistory,
  replayUserPortraitDecision,
  type PortraitDecisionHistory as History,
} from '@/lib/api/user-portrait';
jest.mock('@/lib/api/user-portrait', () => ({
  getUserPortraitDecisionHistory: jest.fn(),
  replayUserPortraitDecision: jest.fn(),
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
it('shows the saved model choice with its own snapshot/window and replays only frozen validation', async () => {
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue(history);
  jest.mocked(replayUserPortraitDecision).mockResolvedValue({
    status: 'replayed',
    modelCalled: false,
    dispatchEnabled: false,
    validator: { accepted: true },
  });
  render(
    <PortraitDecisionHistory
      userId="account-one"
      viewedSnapshotId="current-snapshot"
    />
  );
  expect(await screen.findByText('Exact stored title')).toBeInTheDocument();
  expect(
    screen.getByText('Exact stored body, without a sales footer.')
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Portrait currently viewed: current-snapshot/)
  ).toBeInTheDocument();
  fireEvent.click(screen.getByText('Exact decision evidence'));
  expect(
    screen.getByRole('row', { name: /Pinned snapshot historic-snapshot/ })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('row', { name: /Decision window 7 days/ })
  ).toBeInTheDocument();
  expect(screen.getByText(/Recorded channel: none/)).toBeInTheDocument();
  expect(
    screen.getByRole('row', { name: /existing email preference evidence/i })
  ).toHaveTextContent('unknown');
  fireEvent.click(
    screen.getByRole('button', { name: 'Replay frozen validation' })
  );
  expect(
    await screen.findByText(/No model was called and no action was executed/)
  ).toBeInTheDocument();
  expect(replayUserPortraitDecision).toHaveBeenCalledWith(
    'account-one',
    'decision-one'
  );
});
it.each([
  ['none', 'none'],
  ['in_app', 'in app'],
  ['push', 'push'],
  ['email', 'email'],
] as const)(
  'shows the saved %s channel without inferring exposure status',
  async (channel, recordedLabel) => {
    jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
      ...history,
      items: history.items.map((item) => ({
        ...item,
        selection: { ...item.selection, channel },
      })),
    });
    render(
      <PortraitDecisionHistory
        userId="account-one"
        viewedSnapshotId="current-snapshot"
      />
    );
    expect(
      await screen.findByText(
        `Recorded channel: ${recordedLabel} · Proposed surface: in app.`
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Reading saved decisions and replaying frozen validation do not call a model or execute an action.'
    );
    expect(
      screen.queryByText(/exposure disabled|push and email remain disabled/i)
    ).not.toBeInTheDocument();
    expect(replayUserPortraitDecision).not.toHaveBeenCalled();
  }
);
it('discards a late foreign account history and displays honest empty evidence', async () => {
  let resolve!: (value: History) => void;
  jest
    .mocked(getUserPortraitDecisionHistory)
    .mockReturnValueOnce(
      new Promise<History>((yes) => {
        resolve = yes;
      })
    )
    .mockResolvedValueOnce(empty);
  const { rerender } = render(
    <PortraitDecisionHistory userId="old" viewedSnapshotId="old-snapshot" />
  );
  rerender(
    <PortraitDecisionHistory userId="new" viewedSnapshotId="new-snapshot" />
  );
  expect(
    await screen.findByText(/No saved shadow decisions yet/)
  ).toBeInTheDocument();
  await act(async () => resolve(history));
  expect(screen.queryByText('Exact stored title')).not.toBeInTheDocument();
  expect(
    screen.getByText(/Portrait currently viewed: new-snapshot/)
  ).toBeInTheDocument();
});
it('shows read failure and recovers using a read-only refresh', async () => {
  jest
    .mocked(getUserPortraitDecisionHistory)
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValueOnce(empty);
  render(
    <PortraitDecisionHistory userId="account" viewedSnapshotId="snapshot" />
  );
  expect(await screen.findByText('Offline')).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: 'Refresh saved decisions' })
  );
  await waitFor(() =>
    expect(
      screen.getByText(/No saved shadow decisions yet/)
    ).toBeInTheDocument()
  );
  expect(replayUserPortraitDecision).not.toHaveBeenCalled();
});
