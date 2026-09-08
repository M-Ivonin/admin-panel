import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import MatchRankingPage from '@/app/(admin)/dashboard/match-ranking/page';
import {
  activateMatchRankingConfiguration,
  bulkReviewMatchRankingCompetitions,
  createMatchRankingConfiguration,
  createMatchRankingOverride,
  deleteMatchRankingOverride,
  getMatchRankingAudit,
  getMatchRankingCompetitions,
  getMatchRankingConfigurations,
  getMatchRankingOverrides,
  getTeamProminence,
  previewMatchRanking,
  updateMatchRankingCompetition,
  upsertTeamProminence,
} from '@/lib/api/match-ranking';

jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/lib/api/match-ranking', () => ({
  activateMatchRankingConfiguration: jest.fn(),
  bulkReviewMatchRankingCompetitions: jest.fn(),
  createMatchRankingConfiguration: jest.fn(),
  createMatchRankingOverride: jest.fn(),
  deleteMatchRankingOverride: jest.fn(),
  getMatchRankingAudit: jest.fn(),
  getMatchRankingCompetitions: jest.fn(),
  getMatchRankingConfigurations: jest.fn(),
  getMatchRankingOverrides: jest.fn(),
  getTeamProminence: jest.fn(),
  previewMatchRanking: jest.fn(),
  updateMatchRankingCompetition: jest.fn(),
  updateMatchRankingOverride: jest.fn(),
  upsertTeamProminence: jest.fn(),
}));

const competition = {
  id: 'league-1',
  providerLeagueId: 501,
  name: 'Copa Libertadores',
  providerCategory: 1,
  effectiveCategory: null,
  countryCode: null,
  confederation: 'CONMEBOL',
  scope: 'continental' as const,
  classification: 'unknown' as const,
  reviewState: 'pending_review',
  metadataSource: 'provider',
  metadataFreshAt: '2026-09-08T08:00:00.000Z',
  metadataLastSuccessAt: '2026-09-08T08:00:00.000Z',
  metadataLastError: null,
  suggestedClassification: 'senior' as const,
  needsAttention: false,
};

describe('MatchRankingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getMatchRankingCompetitions as jest.Mock).mockResolvedValue([competition]);
    (getTeamProminence as jest.Mock).mockResolvedValue([]);
    (getMatchRankingOverrides as jest.Mock).mockResolvedValue([]);
    (getMatchRankingConfigurations as jest.Mock).mockResolvedValue([]);
    (getMatchRankingAudit as jest.Mock).mockResolvedValue([]);
  });

  it('searches and reviews competition metadata', async () => {
    (updateMatchRankingCompetition as jest.Mock).mockResolvedValue({
      ...competition,
      effectiveCategory: 1,
      classification: 'senior',
      reviewState: 'reviewed',
    });
    render(<MatchRankingPage />);

    expect(await screen.findByText('Copa Libertadores')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Competition search'), {
      target: { value: 'Libertadores' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search catalog' }));
    await waitFor(() =>
      expect(getMatchRankingCompetitions).toHaveBeenLastCalledWith({
        query: 'Libertadores',
        reviewState: '',
        queue: '',
      })
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Review Copa Libertadores' })
    );
    const dialog = screen.getByRole('dialog', { name: 'Review competition' });
    fireEvent.change(within(dialog).getByLabelText('Effective category'), {
      target: { value: '1' },
    });
    fireEvent.mouseDown(within(dialog).getByLabelText('Classification'));
    fireEvent.click(screen.getByRole('option', { name: 'senior' }));
    fireEvent.mouseDown(within(dialog).getByLabelText('Review state'));
    fireEvent.click(screen.getByRole('option', { name: 'reviewed' }));
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Verified against provider metadata' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save review' })
    );

    await waitFor(() =>
      expect(updateMatchRankingCompetition).toHaveBeenCalledWith(
        'league-1',
        expect.objectContaining({
          effectiveCategory: 1,
          classification: 'senior',
          reviewState: 'reviewed',
          reason: 'Verified against provider metadata',
        })
      )
    );
  });

  it('filters review queues and bulk-approves selected ready competitions', async () => {
    (bulkReviewMatchRankingCompetitions as jest.Mock).mockResolvedValue([]);
    render(<MatchRankingPage />);

    expect(await screen.findByText('Copa Libertadores')).toBeInTheDocument();
    expect(screen.getByText('Suggested: senior')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ready for review' }));
    await waitFor(() =>
      expect(getMatchRankingCompetitions).toHaveBeenLastCalledWith({
        query: '',
        reviewState: '',
        queue: 'ready',
      })
    );

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Copa Libertadores' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Approve selected (1)' })
    );
    const dialog = screen.getByRole('dialog', {
      name: 'Approve selected competitions',
    });
    fireEvent.change(within(dialog).getByLabelText(/Bulk review reason/), {
      target: { value: 'Provider metadata verified' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Approve 1 competition' })
    );

    await waitFor(() =>
      expect(bulkReviewMatchRankingCompetitions).toHaveBeenCalledWith(
        ['league-1'],
        'Provider metadata verified'
      )
    );
  });

  it('creates expiring overrides and validates their time window', async () => {
    (createMatchRankingOverride as jest.Mock).mockResolvedValue({
      id: 'override-1',
    });
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(screen.getByRole('tab', { name: 'Fixture overrides' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add override' }));
    const dialog = screen.getByRole('dialog', { name: 'Add fixture override' });
    fireEvent.change(within(dialog).getByLabelText('Fixture ID'), {
      target: { value: '9001' },
    });
    fireEvent.change(within(dialog).getByLabelText('Starts at'), {
      target: { value: '2026-09-09T10:00' },
    });
    fireEvent.change(within(dialog).getByLabelText('Ends at'), {
      target: { value: '2026-09-08T10:00' },
    });
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Editorial final' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save override' })
    );
    expect(
      await within(dialog).findByText('End must be after start.')
    ).toBeInTheDocument();
    expect(createMatchRankingOverride).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText('Ends at'), {
      target: { value: '2026-09-10T10:00' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save override' })
    );
    await waitFor(() =>
      expect(createMatchRankingOverride).toHaveBeenCalledWith(
        expect.objectContaining({
          fixtureId: 9001,
          action: 'pin',
          startsAt: '2026-09-09T10:00:00.000Z',
          endsAt: '2026-09-10T10:00:00.000Z',
          reason: 'Editorial final',
        })
      )
    );
  });

  it('requires an audited reason before deleting an override', async () => {
    (getMatchRankingOverrides as jest.Mock).mockResolvedValue([
      {
        id: 'override-1',
        fixtureId: 9001,
        countryCode: null,
        action: 'pin',
        value: null,
        priority: 1,
        startsAt: '2026-09-08T10:00:00.000Z',
        endsAt: '2026-09-10T10:00:00.000Z',
        reason: 'Editorial final',
        createdBy: 'admin@example.com',
        createdAt: '2026-09-08T09:00:00.000Z',
        updatedAt: '2026-09-08T09:00:00.000Z',
      },
    ]);
    (deleteMatchRankingOverride as jest.Mock).mockResolvedValue(undefined);
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(screen.getByRole('tab', { name: 'Fixture overrides' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog', {
      name: 'Delete fixture 9001 override',
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Delete override' })
    );
    expect(
      await within(dialog).findByText('Reason is required.')
    ).toBeInTheDocument();
    expect(deleteMatchRankingOverride).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText(/Deletion reason/), {
      target: { value: 'No longer needed' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Delete override' })
    );
    await waitFor(() =>
      expect(deleteMatchRankingOverride).toHaveBeenCalledWith(
        'override-1',
        'No longer needed'
      )
    );
  });

  it('edits country-scoped team prominence', async () => {
    (upsertTeamProminence as jest.Mock).mockResolvedValue({
      id: 'prominence-1',
    });
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(screen.getByRole('tab', { name: 'Team prominence' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add prominence' }));
    const dialog = screen.getByRole('dialog', { name: 'Add team prominence' });
    fireEvent.change(within(dialog).getByLabelText('Provider team ID'), {
      target: { value: '42' },
    });
    fireEvent.change(within(dialog).getByLabelText('Country code'), {
      target: { value: 'br' },
    });
    fireEvent.mouseDown(within(dialog).getByLabelText('Prominence value'));
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['0', '10', '20']);
    fireEvent.click(screen.getByRole('option', { name: '20' }));
    fireEvent.change(within(dialog).getByLabelText(/Reason/), {
      target: { value: 'National audience prominence' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save prominence' })
    );

    await waitFor(() =>
      expect(upsertTeamProminence).toHaveBeenCalledWith({
        providerTeamId: 42,
        countryCode: 'BR',
        value: 20,
        reason: 'National audience prominence',
        reviewDueAt: null,
      })
    );
  });

  it('creates and activates versioned ranking configurations', async () => {
    (getMatchRankingConfigurations as jest.Mock).mockResolvedValue([
      {
        id: 'config-1',
        version: 'ranking-2026-09',
        rules: { threshold: 65 },
        countryAllowlist: ['BR'],
        treatmentPercentage: 25,
        experimentId: 'top-matches-1',
        assignmentSalt: 'stable-salt',
        active: false,
        activatedAt: null,
        activatedBy: null,
        createdAt: '2026-09-08T09:00:00.000Z',
        updatedAt: '2026-09-08T09:00:00.000Z',
      },
    ]);
    (createMatchRankingConfiguration as jest.Mock).mockResolvedValue({
      id: 'config-2',
    });
    (activateMatchRankingConfiguration as jest.Mock).mockResolvedValue({
      id: 'config-1',
    });
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(screen.getByRole('tab', { name: 'Configurations' }));
    fireEvent.click(screen.getByRole('button', { name: 'Activate' }));
    let dialog = screen.getByRole('dialog', {
      name: 'Activate ranking-2026-09',
    });
    fireEvent.change(within(dialog).getByLabelText(/Activation reason/), {
      target: { value: 'Product sign-off' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Activate configuration' })
    );
    await waitFor(() =>
      expect(activateMatchRankingConfiguration).toHaveBeenCalledWith(
        'config-1',
        'Product sign-off'
      )
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'New configuration' })
    );
    dialog = screen.getByRole('dialog', { name: 'New ranking configuration' });
    fireEvent.change(within(dialog).getByLabelText('Version'), {
      target: { value: 'ranking-2026-10' },
    });
    fireEvent.change(within(dialog).getByLabelText('Country allowlist'), {
      target: { value: 'br, mx' },
    });
    fireEvent.change(within(dialog).getByLabelText('Treatment percentage'), {
      target: { value: '40' },
    });
    fireEvent.change(within(dialog).getByLabelText('Experiment ID'), {
      target: { value: 'top-matches-2' },
    });
    fireEvent.change(within(dialog).getByLabelText('Assignment salt'), {
      target: { value: 'new-stable-salt' },
    });
    fireEvent.change(within(dialog).getByLabelText(/Reason/), {
      target: { value: 'Expanded rollout' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Create configuration' })
    );
    await waitFor(() =>
      expect(createMatchRankingConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 'ranking-2026-10',
          rules: {},
          countryAllowlist: ['BR', 'MX'],
          treatmentPercentage: 40,
          experimentId: 'top-matches-2',
          reason: 'Expanded rollout',
        })
      )
    );
  });

  it('runs deterministic preview and displays component breakdown and audit', async () => {
    (previewMatchRanking as jest.Mock).mockResolvedValue({
      rankingVersion: 'ranking-2026-09',
      generatedAt: '2026-09-08T12:00:00.000Z',
      topMatches: [
        {
          fixtureId: 9001,
          competitionId: 501,
          homeTeamName: 'River Plate',
          awayTeamName: 'Flamengo',
          kickoff: '2026-09-08T20:00:00.000Z',
          components: { B: 28, L: 14, T: 12, S: 8, U: 5, E: 0 },
          importance: 67,
          topScore: 67,
          eligible: true,
          tieBreak: 'kickoff,fixtureId',
          exclusionReason: null,
        },
      ],
      groups: [
        {
          competitionId: 501,
          competitionName: 'Copa Libertadores',
          groupScore: 42,
          followed: false,
          fixtures: [],
        },
      ],
    });
    (getMatchRankingAudit as jest.Mock).mockResolvedValue([
      {
        id: 'audit-1',
        targetType: 'configuration',
        targetId: 'config-1',
        actor: 'admin@example.com',
        reason: 'Product sign-off',
        beforeValue: { active: false },
        afterValue: { active: true },
        createdAt: '2026-09-08T12:05:00.000Z',
      },
    ]);
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(screen.getByRole('tab', { name: 'Preview' }));
    fireEvent.change(screen.getByLabelText('Preview date'), {
      target: { value: '2026-09-08' },
    });
    expect(screen.getByLabelText('IANA timezone')).toHaveValue('Etc/UTC');
    fireEvent.change(screen.getByLabelText('Preview country code'), {
      target: { value: 'br' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run preview' }));

    expect(
      await screen.findByText('River Plate vs Flamengo')
    ).toBeInTheDocument();
    expect(screen.getByText('B 28')).toBeInTheDocument();
    expect(screen.getByText('L 14')).toBeInTheDocument();
    expect(screen.getByText('T 12')).toBeInTheDocument();
    expect(screen.getByText('S 8')).toBeInTheDocument();
    expect(screen.getByText('U 5')).toBeInTheDocument();
    expect(screen.getByText('E 0')).toBeInTheDocument();
    expect(
      screen.getByText(/Tie-break: kickoff,fixtureId/)
    ).toBeInTheDocument();
    expect(
      screen.getByText('Copa Libertadores · group score 42')
    ).toBeInTheDocument();
    expect(previewMatchRanking).toHaveBeenCalledWith({
      date: '2026-09-08',
      timezone: 'Etc/UTC',
      countryCode: 'BR',
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Audit' }));
    expect(await screen.findByText('Product sign-off')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });
});
