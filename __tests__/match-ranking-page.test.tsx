import {
  act,
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
  getMatchFixtures,
  getSportmonksTeams,
  getCompetitionDetails,
  searchCompetitionLinkTargets,
  linkLegacyCompetition,
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
  getMatchFixtures: jest.fn(),
  getSportmonksTeams: jest.fn(),
  getCompetitionDetails: jest.fn(),
  searchCompetitionLinkTargets: jest.fn(),
  linkLegacyCompetition: jest.fn(),
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
    (getMatchFixtures as jest.Mock).mockResolvedValue([
      {
        id: 9001,
        homeTeamName: 'Arsenal',
        awayTeamName: 'Chelsea',
        leagueName: 'Premier League',
        date: '2026-09-10T18:00:00.000Z',
      },
    ]);
    (getSportmonksTeams as jest.Mock).mockResolvedValue([
      { id: 7, name: 'Arsenal', country: 'England' },
      { id: 42, name: 'Palmeiras', country: 'Brazil' },
    ]);
  });

  it('lets an operator include Legacy competitions in the catalogue', async () => {
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Catalog source' })
    );
    fireEvent.click(screen.getByRole('option', { name: 'Legacy' }));
    await waitFor(() =>
      expect(getMatchRankingCompetitions).toHaveBeenLastCalledWith(
        expect.objectContaining({ source: 'legacy' })
      )
    );
  });

  it('shows Legacy references, requires a verified selection and reason, and links an imported league', async () => {
    const legacy = {
      ...competition,
      providerLeagueId: null,
      source: 'legacy',
      legacyApiId: '999',
      country: 'World',
      canonicalCompetition: null,
      references: { favorites: 3, channels: 2, teams: 4 },
    };
    (getMatchRankingCompetitions as jest.Mock).mockResolvedValue([legacy]);
    (getCompetitionDetails as jest.Mock).mockResolvedValue(legacy);
    (searchCompetitionLinkTargets as jest.Mock).mockResolvedValue([
      { id: 501, name: 'Gold Cup', country: 'World', local: true },
    ]);
    (linkLegacyCompetition as jest.Mock).mockResolvedValue({
      ...legacy,
      canonicalCompetition: {
        id: 'canonical',
        name: 'Gold Cup',
        providerLeagueId: 501,
      },
    });
    render(<MatchRankingPage />);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Edit Copa Libertadores' })
    );
    const dialog = screen.getByRole('dialog', { name: 'Legacy league' });
    expect(
      await within(dialog).findByText(
        'Existing references: 3 favorites · 2 channels · 4 teams'
      )
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByLabelText('Effective category')
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Confirm link' })
    ).toBeDisabled();
    const search = within(dialog).getByRole('combobox', {
      name: 'Find SportMonks league',
    });
    expect(search).toHaveValue('Copa Libertadores');
    await waitFor(() =>
      expect(searchCompetitionLinkTargets).toHaveBeenCalledWith(
        'Copa Libertadores',
        false
      )
    );
    expect(
      within(dialog).queryByRole('button', { name: 'Search catalog' })
    ).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: 'Gold' } });
    await waitFor(() =>
      expect(searchCompetitionLinkTargets).toHaveBeenCalledWith('Gold', false)
    );
    fireEvent.mouseDown(search);
    fireEvent.click(
      await screen.findByRole('option', { name: 'Gold Cup · World · #501' })
    );
    expect(
      within(dialog).getByRole('button', { name: 'Confirm link' })
    ).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Verified identity' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Confirm link' })
    );
    await waitFor(() =>
      expect(linkLegacyCompetition).toHaveBeenCalledWith(
        'league-1',
        501,
        'Verified identity'
      )
    );
    expect(updateMatchRankingCompetition).not.toHaveBeenCalled();
    await screen.findByText(
      'Legacy league linked. SportMonks ranking settings preserved.'
    );
  });

  async function openLegacySearch() {
    const legacy = {
      ...competition,
      providerLeagueId: null,
      source: 'legacy',
      legacyApiId: '999',
      country: 'Brazil',
      canonicalCompetition: null,
      references: { favorites: 1, channels: 1, teams: 0 },
    };
    (getMatchRankingCompetitions as jest.Mock).mockResolvedValue([legacy]);
    (getCompetitionDetails as jest.Mock).mockResolvedValue(legacy);
    render(<MatchRankingPage />);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Edit Copa Libertadores' })
    );
    await screen.findByText(
      'Existing references: 1 favorites · 1 channels · 0 teams'
    );
    return screen.getByRole('combobox', { name: 'Find SportMonks league' });
  }

  it('automatically falls back to SportMonks and explains empty Legacy search results', async () => {
    (searchCompetitionLinkTargets as jest.Mock).mockResolvedValue([]);
    const search = await openLegacySearch();
    await screen.findByText(
      'No matching leagues found. Try a shorter name or a SportMonks ID.'
    );
    expect(searchCompetitionLinkTargets).toHaveBeenCalledWith(
      'Copa Libertadores',
      true
    );
    (searchCompetitionLinkTargets as jest.Mock).mockImplementation(
      async (_query, provider) =>
        provider
          ? [{ id: 501, name: 'Supercopa', country: 'Brazil', local: false }]
          : []
    );
    fireEvent.change(search, { target: { value: 'Sup' } });
    expect(
      await screen.findByRole('option', { name: 'Supercopa · Brazil · #501' })
    ).toBeInTheDocument();
    expect(searchCompetitionLinkTargets).toHaveBeenCalledWith('Sup', true);
  });

  it('ignores an older Legacy search response and clears selection when the operator edits the query', async () => {
    let finishOld: (value: unknown) => void = () => undefined;
    (searchCompetitionLinkTargets as jest.Mock).mockImplementation((query) =>
      query === 'Copa Libertadores'
        ? new Promise((resolve) => {
            finishOld = resolve;
          })
        : Promise.resolve([
            { id: 501, name: 'New league', country: 'Brazil', local: true },
          ])
    );
    const search = await openLegacySearch();
    await waitFor(() =>
      expect(searchCompetitionLinkTargets).toHaveBeenCalledWith(
        'Copa Libertadores',
        false
      )
    );
    fireEvent.change(search, { target: { value: 'New' } });
    fireEvent.click(
      await screen.findByRole('option', { name: 'New league · Brazil · #501' })
    );
    await act(async () => {
      finishOld([
        { id: 99, name: 'Old league', country: 'France', local: true },
      ]);
    });
    expect(screen.queryByText(/Old league/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Same competition' },
    });
    expect(screen.getByRole('button', { name: 'Confirm link' })).toBeEnabled();
    fireEvent.change(search, { target: { value: 'Other' } });
    expect(screen.getByRole('button', { name: 'Confirm link' })).toBeDisabled();
    expect(linkLegacyCompetition).not.toHaveBeenCalled();
  });

  it('shows a recoverable Legacy search error instead of an empty list', async () => {
    (searchCompetitionLinkTargets as jest.Mock).mockRejectedValue(
      new Error('Provider unavailable')
    );
    await openLegacySearch();
    await screen.findByText('Provider unavailable');
    expect(
      screen.queryByText(/^No matching leagues found/)
    ).not.toBeInTheDocument();
    (searchCompetitionLinkTargets as jest.Mock).mockResolvedValue([
      { id: 501, name: 'Copa Libertadores', country: 'Brazil', local: true },
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Retry search' }));
    await screen.findByText(
      '1 matching leagues. Select one and check its country.'
    );
    expect(screen.queryByText('Provider unavailable')).not.toBeInTheDocument();
  });

  it('opens the single shared ranking for a linked Legacy league without another link', async () => {
    const legacy = {
      ...competition,
      providerLeagueId: null,
      source: 'legacy',
      canonicalCompetition: {
        id: 'canonical',
        name: 'Copa Libertadores',
        providerLeagueId: 501,
      },
      references: { favorites: 1, channels: 1, teams: 0 },
    };
    (getMatchRankingCompetitions as jest.Mock).mockResolvedValue([legacy]);
    (getCompetitionDetails as jest.Mock).mockImplementation(async (id) =>
      id === 'canonical'
        ? { ...competition, id: 'canonical', effectiveCategory: 2 }
        : legacy
    );
    render(<MatchRankingPage />);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Edit Copa Libertadores' })
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Edit shared ranking' })
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Effective category')).toHaveTextContent('2')
    );
    expect(searchCompetitionLinkTargets).not.toHaveBeenCalled();
    expect(linkLegacyCompetition).not.toHaveBeenCalled();
  });

  it('does not report an empty catalogue when the backend request fails', async () => {
    (getMatchRankingCompetitions as jest.Mock).mockRejectedValue(
      new Error('Internal server error')
    );
    render(<MatchRankingPage />);
    await screen.findByText('Internal server error');
    expect(screen.queryByText('No competitions found')).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Catalog could not be loaded. Retry the search after the error is resolved.'
      )
    ).toBeInTheDocument();
  });

  it('shows general and tab-specific operator manuals', async () => {
    render(<MatchRankingPage />);

    await screen.findByText('Copa Libertadores');
    fireEvent.click(
      screen.getByRole('button', { name: 'About match ranking' })
    );
    expect(
      screen.getByRole('dialog', { name: 'How match ranking works' })
    ).toHaveTextContent('The two results admins are managing');
    expect(screen.getByText('How a match earns its position')).toBeVisible();
    expect(
      screen.getByText('What can keep a match out of Top Matches')
    ).toBeVisible();
    expect(screen.getByText('Recommended admin workflow')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Close help' }));

    const manuals = [
      ['Competition catalog', 'Competition catalog guide'],
      ['Team prominence', 'Team prominence guide'],
      ['Fixture overrides', 'Fixture overrides guide'],
      ['Configurations', 'Configurations guide'],
      ['Preview', 'Preview guide'],
      ['Audit', 'Audit guide'],
    ] as const;

    for (const [tabName, dialogName] of manuals) {
      await act(async () => {
        fireEvent.click(screen.getByRole('tab', { name: tabName }));
      });
      fireEvent.click(
        screen.getByRole('button', { name: `Help for ${tabName}` })
      );
      expect(screen.getByRole('dialog', { name: dialogName })).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'Close help' }));
    }
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
        source: 'sportmonks',
      })
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Copa Libertadores' })
    );
    const dialog = screen.getByRole('dialog', { name: 'Review competition' });
    expect(
      within(dialog).getByLabelText('Effective category')
    ).toHaveTextContent('Automatic — use provider category');
    expect(
      within(dialog).getByText('Provider category: 1')
    ).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('Country code'), {
      target: { value: 'Brazil' },
    });
    fireEvent.click(await screen.findByRole('option', { name: 'Brazil (BR)' }));
    fireEvent.mouseDown(within(dialog).getByLabelText('Effective category'));
    fireEvent.click(screen.getByRole('option', { name: '1' }));
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
          countryCode: 'BR',
          classification: 'senior',
          reviewState: 'reviewed',
          reason: 'Verified against provider metadata',
        })
      )
    );
  });

  it('shows the latest audit after saving a competition without reloading the page', async () => {
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(screen.getByRole('tab', { name: 'Audit' }));
    await screen.findByText('No ranking audit events');
    fireEvent.click(screen.getByRole('tab', { name: 'Competition catalog' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Copa Libertadores' })
    );
    const dialog = screen.getByRole('dialog', { name: 'Review competition' });
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Fresh competition review' },
    });
    (getMatchRankingAudit as jest.Mock).mockResolvedValue([
      {
        id: 'fresh-audit',
        targetType: 'competition',
        targetId: competition.id,
        reason: 'Fresh competition review',
        actorEmail: 'admin@example.test',
        createdAt: '2026-09-10T12:00:00Z',
        beforeValue: {},
        afterValue: {},
      },
    ]);
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save review' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Audit' }));
    expect(
      await screen.findByText('Fresh competition review')
    ).toBeInTheDocument();
  });

  it('shows audit fetch errors rather than a stale or empty history', async () => {
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    (getMatchRankingAudit as jest.Mock).mockRejectedValue(
      new Error('Audit unavailable')
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Audit' }));
    expect(await screen.findByText('Audit unavailable')).toBeInTheDocument();
    expect(
      screen.queryByText('No ranking audit events')
    ).not.toBeInTheDocument();
  });

  it('leaves automatic geography untouched when only the category changes', async () => {
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Copa Libertadores' })
    );
    const dialog = screen.getByRole('dialog', { name: 'Review competition' });
    fireEvent.mouseDown(within(dialog).getByLabelText('Effective category'));
    fireEvent.click(screen.getByRole('option', { name: '2' }));
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Category correction' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save review' })
    );
    await waitFor(() =>
      expect(updateMatchRankingCompetition).toHaveBeenCalled()
    );
    const payload = (updateMatchRankingCompetition as jest.Mock).mock
      .calls[0][1];
    expect(payload.effectiveCategory).toBe(2);
    expect(payload).not.toHaveProperty('countryCode');
    expect(payload).not.toHaveProperty('confederation');
    expect(payload).not.toHaveProperty('scope');
  });

  it('shows a preserved non-country code until the operator restores automatic geography', async () => {
    (getMatchRankingCompetitions as jest.Mock).mockResolvedValue([
      {
        ...competition,
        countryCode: 'EU',
        manualGeographyFields: ['countryCode'],
        providerGeography: { countryCode: null },
      },
    ]);
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Copa Libertadores' })
    );
    let dialog = screen.getByRole('dialog', { name: 'Review competition' });
    expect(
      within(dialog).getByText(
        'Saved country code: EU (not in the country list). Choose a country or use automatic.'
      )
    ).toBeInTheDocument();
    fireEvent.mouseDown(within(dialog).getByLabelText('Effective category'));
    fireEvent.click(screen.getByRole('option', { name: '2' }));
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Category only' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save review' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    expect(
      (updateMatchRankingCompetition as jest.Mock).mock.calls[0][1]
    ).not.toHaveProperty('countryCode');
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Copa Libertadores' })
    );
    dialog = screen.getByRole('dialog', { name: 'Review competition' });
    fireEvent.click(
      within(dialog).getByRole('button', {
        name: 'Reset Country code to automatic',
      })
    );
    expect(within(dialog).getByLabelText('Country code')).toHaveValue('');
    expect(
      within(dialog).queryByText(/Saved country code: EU/)
    ).not.toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Restore empty automatic country' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save review' })
    );
    await waitFor(() =>
      expect(updateMatchRankingCompetition).toHaveBeenCalledTimes(2)
    );
    const payload = (updateMatchRankingCompetition as jest.Mock).mock
      .calls[1][1];
    expect(payload.resetGeographyFields).toEqual(['countryCode']);
    expect(payload).not.toHaveProperty('countryCode');
  });

  it('resets manual geography without resending a manual value', async () => {
    (getMatchRankingCompetitions as jest.Mock).mockResolvedValue([
      {
        ...competition,
        confederation: 'UEFA',
        manualGeographyFields: ['confederation'],
        providerGeography: { confederation: 'CONMEBOL' },
      },
    ]);
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Copa Libertadores' })
    );
    const dialog = screen.getByRole('dialog', { name: 'Review competition' });
    fireEvent.click(
      within(dialog).getByRole('button', {
        name: 'Reset Confederation to automatic',
      })
    );
    expect(within(dialog).getByLabelText('Confederation')).toHaveTextContent(
      'CONMEBOL'
    );
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Use provider geography' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save review' })
    );
    await waitFor(() =>
      expect(updateMatchRankingCompetition).toHaveBeenCalled()
    );
    const payload = (updateMatchRankingCompetition as jest.Mock).mock
      .calls[0][1];
    expect(payload.resetGeographyFields).toEqual(['confederation']);
    expect(payload).not.toHaveProperty('confederation');
  });

  it('expands priority regions, rejects conflicting overlaps, and reopens saved countries', async () => {
    (updateMatchRankingCompetition as jest.Mock).mockImplementation(
      (_id, payload) => {
        (getMatchRankingCompetitions as jest.Mock).mockResolvedValue([
          { ...competition, ...payload },
        ]);
        return Promise.resolve({ ...competition, ...payload });
      }
    );
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Copa Libertadores' })
    );
    let dialog = screen.getByRole('dialog', { name: 'Review competition' });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Add country adjustment' })
    );
    fireEvent.change(
      within(dialog).getByLabelText('Priority countries / regions 1'),
      { target: { value: 'South America' } }
    );
    fireEvent.click(
      await screen.findByRole('option', { name: 'South America' })
    );
    fireEvent.keyDown(
      within(dialog).getByLabelText('Priority countries / regions 1'),
      { key: 'Escape' }
    );
    fireEvent.mouseDown(within(dialog).getByLabelText('Priority adjustment 1'));
    fireEvent.click(screen.getByRole('option', { name: '+10' }));
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Add country adjustment' })
    );
    fireEvent.change(
      within(dialog).getByLabelText('Priority countries / regions 2'),
      { target: { value: 'Brazil' } }
    );
    fireEvent.click(await screen.findByRole('option', { name: 'Brazil (BR)' }));
    fireEvent.keyDown(
      within(dialog).getByLabelText('Priority countries / regions 2'),
      { key: 'Escape' }
    );
    fireEvent.mouseDown(within(dialog).getByLabelText('Priority adjustment 2'));
    fireEvent.click(screen.getByRole('option', { name: '-5' }));
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Market priority' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save review' })
    );
    expect(
      await within(dialog).findByText(/Conflicting adjustments for BR/)
    ).toBeInTheDocument();
    expect(updateMatchRankingCompetition).not.toHaveBeenCalled();
    fireEvent.mouseDown(within(dialog).getByLabelText('Priority adjustment 2'));
    fireEvent.click(screen.getByRole('option', { name: '+10' }));
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save review' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    expect(
      (updateMatchRankingCompetition as jest.Mock).mock.calls[0][1]
        .countryPriorityAdjustments
    ).toEqual({
      AR: 10,
      BO: 10,
      BR: 10,
      CL: 10,
      CO: 10,
      EC: 10,
      GY: 10,
      PY: 10,
      PE: 10,
      SR: 10,
      UY: 10,
      VE: 10,
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Copa Libertadores' })
    );
    dialog = screen.getByRole('dialog', { name: 'Review competition' });
    expect(within(dialog).getByText('Brazil (BR)')).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText('Priority adjustment 1')
    ).toHaveTextContent('+10');
    expect(
      within(dialog).queryByLabelText('Priority adjustment 2')
    ).not.toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole('button', {
        name: 'Remove country adjustment 1',
      })
    );
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Restore automatic priorities' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save review' })
    );
    await waitFor(() =>
      expect(updateMatchRankingCompetition).toHaveBeenLastCalledWith(
        'league-1',
        expect.objectContaining({ countryPriorityAdjustments: {} })
      )
    );
  }, 30000);

  it('retains Svalbard and Jan Mayen when reopening and editing a shared country adjustment', async () => {
    (getMatchRankingCompetitions as jest.Mock).mockResolvedValue([
      {
        ...competition,
        countryPriorityAdjustments: { BR: 10, SJ: 10 },
      },
    ]);
    (updateMatchRankingCompetition as jest.Mock).mockImplementation(
      (_id, payload) => {
        (getMatchRankingCompetitions as jest.Mock).mockResolvedValue([
          { ...competition, ...payload },
        ]);
        return Promise.resolve({ ...competition, ...payload });
      }
    );
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Copa Libertadores' })
    );
    let dialog = screen.getByRole('dialog', { name: 'Review competition' });
    fireEvent.mouseDown(within(dialog).getByLabelText('Priority adjustment 1'));
    fireEvent.click(screen.getByRole('option', { name: '+11' }));
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Increase both country priorities' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save review' })
    );
    await waitFor(() =>
      expect(updateMatchRankingCompetition).toHaveBeenCalledWith(
        'league-1',
        expect.objectContaining({
          countryPriorityAdjustments: { BR: 11, SJ: 11 },
        })
      )
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Copa Libertadores' })
    );
    dialog = screen.getByRole('dialog', { name: 'Review competition' });
    expect(within(dialog).getByText('Brazil (BR)')).toBeInTheDocument();
    expect(
      within(dialog).getByText('Svalbard and Jan Mayen (SJ)')
    ).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText('Priority adjustment 1')
    ).toHaveTextContent('+11');
  });

  it('requires a nonempty audience and an integer adjustment within the allowed range', async () => {
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Copa Libertadores' })
    );
    const dialog = screen.getByRole('dialog', { name: 'Review competition' });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Add country adjustment' })
    );
    fireEvent.change(within(dialog).getByLabelText('Reason'), {
      target: { value: 'Market adjustment' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save review' })
    );
    expect(
      await within(dialog).findByText(
        'Select at least one country or region for each adjustment.'
      )
    ).toBeInTheDocument();
    fireEvent.change(
      within(dialog).getByLabelText('Priority countries / regions 1'),
      { target: { value: 'Brazil' } }
    );
    fireEvent.click(await screen.findByRole('option', { name: 'Brazil (BR)' }));
    fireEvent.keyDown(
      within(dialog).getByLabelText('Priority countries / regions 1'),
      { key: 'Escape' }
    );
    fireEvent.mouseDown(within(dialog).getByLabelText('Priority adjustment 1'));
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(
      Array.from({ length: 41 }, (_, index) => index - 20).map((points) =>
        points > 0 ? `+${points}` : String(points)
      )
    );
    expect(updateMatchRankingCompetition).not.toHaveBeenCalled();
  }, 15000);

  it('filters review queues and bulk-approves selected ready competitions', async () => {
    (bulkReviewMatchRankingCompetitions as jest.Mock).mockResolvedValue([]);
    render(<MatchRankingPage />);

    expect(await screen.findByText('Copa Libertadores')).toBeInTheDocument();
    expect(
      screen.getByText('Uses provider category + suggested senior')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ready for review' }));
    await waitFor(() =>
      expect(getMatchRankingCompetitions).toHaveBeenLastCalledWith({
        query: '',
        reviewState: '',
        queue: 'ready',
        source: 'sportmonks',
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

  it('explains provider data and the values that approval will save', async () => {
    render(<MatchRankingPage />);

    const row = await screen.findByRole('row', {
      name: 'Copa Libertadores competition',
    });
    expect(
      screen.getByRole('columnheader', { name: 'Provider data' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Approval result' })
    ).toBeInTheDocument();
    expect(within(row).getByText(/Category/)).toHaveTextContent('Category 1');
    expect(within(row).getByText(/Rank/)).toHaveTextContent('Rank 1 · senior');
    expect(
      within(row).getByText('Uses provider category + suggested senior')
    ).toBeInTheDocument();
    expect(
      within(row).getByRole('button', { name: 'Edit Copa Libertadores' })
    ).toBeInTheDocument();
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
    fireEvent.change(within(dialog).getByLabelText('Fixture'), {
      target: { value: 'Arsenal' },
    });
    expect(await screen.findByText(/Arsenal — Chelsea/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Arsenal — Chelsea/));
    expect(
      within(dialog).getByRole('button', {
        name: 'Fixture override action help',
      })
    ).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('Countries / regions'), {
      target: { value: 'Brazil' },
    });
    fireEvent.click(await screen.findByText('Brazil (BR)'));
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
          countryCodes: ['BR'],
          action: 'pin',
          startsAt: '2026-09-09T10:00:00.000Z',
          endsAt: '2026-09-10T10:00:00.000Z',
          reason: 'Editorial final',
        })
      )
    );
  });

  it('shows fixture search loading, empty, and retryable error states', async () => {
    (getMatchFixtures as jest.Mock)
      .mockRejectedValueOnce(new Error('SportMonks unavailable'))
      .mockResolvedValueOnce([]);
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(screen.getByRole('tab', { name: 'Fixture overrides' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add override' }));
    const dialog = screen.getByRole('dialog', { name: 'Add fixture override' });
    fireEvent.change(within(dialog).getByLabelText('Fixture'), {
      target: { value: 'FC Barcelona' },
    });
    expect(
      within(dialog).getByText('Searching the local catalog and SportMonks…')
    ).toBeInTheDocument();
    expect(
      await within(dialog).findByText(
        'Could not search matches: SportMonks unavailable'
      )
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Retry search' })
    );
    expect(
      await screen.findByText('No current or upcoming matches found.')
    ).toBeInTheDocument();
    expect(getMatchFixtures).toHaveBeenCalledTimes(2);
  });

  it('requires an audited reason before deleting an override', async () => {
    (getMatchRankingOverrides as jest.Mock).mockResolvedValue([
      {
        id: 'override-1',
        fixtureId: 9001,
        homeTeamName: 'Arsenal',
        awayTeamName: 'Chelsea',
        leagueName: 'Premier League',
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
    expect(
      screen.getByRole('columnheader', { name: 'Fixture' })
    ).toBeInTheDocument();
    expect(screen.getByText('Arsenal — Chelsea')).toBeInTheDocument();
    expect(screen.getByText('#9001 · Premier League')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const editDialog = screen.getByRole('dialog', {
      name: 'Edit fixture override',
    });
    expect(
      (
        within(editDialog).getByRole('combobox', {
          name: 'Fixture',
        }) as HTMLInputElement
      ).value
    ).toContain('Arsenal — Chelsea');
    fireEvent.click(within(editDialog).getByRole('button', { name: 'Cancel' }));
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
    fireEvent.change(within(dialog).getByLabelText('Team'), {
      target: { value: 'Palm' },
    });
    fireEvent.click(await screen.findByRole('option', { name: /Palmeiras/ }));
    fireEvent.change(within(dialog).getByLabelText('Team'), {
      target: { value: 'Chelsea' },
    });
    fireEvent.change(within(dialog).getByLabelText(/Reason/), {
      target: { value: 'National audience prominence' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save prominence' })
    );
    expect(
      await within(dialog).findByText(
        'A valid team ID and reason are required.'
      )
    ).toBeInTheDocument();
    expect(upsertTeamProminence).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText('Team'), {
      target: { value: 'Palm' },
    });
    fireEvent.click(await screen.findByRole('option', { name: /Palmeiras/ }));
    expect(
      within(dialog).getByRole('button', { name: 'Team prominence scope help' })
    ).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('Countries / regions'), {
      target: { value: 'South America' },
    });
    fireEvent.click(
      await screen.findByRole('option', { name: 'South America' })
    );
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

    await waitFor(() => {
      expect(upsertTeamProminence).toHaveBeenCalledTimes(1);
      expect(upsertTeamProminence).toHaveBeenCalledWith({
        providerTeamId: 42,
        countryCodes: [
          'AR',
          'BO',
          'BR',
          'CL',
          'CO',
          'EC',
          'GY',
          'PY',
          'PE',
          'SR',
          'UY',
          'VE',
        ],
        value: 20,
        reason: 'National audience prominence',
        reviewDueAt: null,
      });
    });
  }, 10_000);

  it('shows team prominence names in a catalog-style table', async () => {
    (getTeamProminence as jest.Mock).mockResolvedValue([
      {
        id: 'prominence-1',
        providerTeamId: 19,
        teamName: 'Arsenal',
        countryCode: null,
        value: 20,
        reason: 'Global editorial prominence',
        reviewedBy: 'admin@example.com',
        reviewedAt: '2026-09-09T09:00:00.000Z',
        reviewDueAt: null,
        createdAt: '2026-09-09T09:00:00.000Z',
        updatedAt: '2026-09-09T09:00:00.000Z',
      },
    ]);

    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(screen.getByRole('tab', { name: 'Team prominence' }));

    expect(
      screen.getByRole('columnheader', { name: 'Team' })
    ).toBeInTheDocument();
    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('#19')).toBeInTheDocument();
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

  it('filters preview countries by region and requires a country for regional previews', async () => {
    (previewMatchRanking as jest.Mock).mockResolvedValue({
      rankingVersion: 'ranking-test',
      generatedAt: '2026-09-11T12:00:00Z',
      topMatches: [],
      groups: [],
    });
    render(<MatchRankingPage />);
    await screen.findByText('Copa Libertadores');
    fireEvent.click(screen.getByRole('tab', { name: 'Preview' }));
    fireEvent.click(screen.getByRole('button', { name: 'Run preview' }));
    await waitFor(() =>
      expect(previewMatchRanking).toHaveBeenCalledWith(
        expect.objectContaining({ countryCode: null })
      )
    );
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Country region' })
    );
    fireEvent.click(screen.getByRole('option', { name: 'South America' }));
    expect(screen.getByRole('button', { name: 'Run preview' })).toBeDisabled();
    const country = screen.getByRole('combobox', { name: 'Preview country' });
    fireEvent.change(country, { target: { value: 'Germany' } });
    expect(
      screen.queryByRole('option', { name: 'Germany (DE)' })
    ).not.toBeInTheDocument();
    fireEvent.change(country, { target: { value: 'Brazil' } });
    fireEvent.click(await screen.findByRole('option', { name: 'Brazil (BR)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Run preview' }));
    await waitFor(() =>
      expect(previewMatchRanking).toHaveBeenLastCalledWith(
        expect.objectContaining({ countryCode: 'BR' })
      )
    );
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Country region' })
    );
    fireEvent.click(screen.getByRole('option', { name: 'Europe' }));
    expect(country).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Run preview' })).toBeDisabled();
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
          components: { B: 28, L: 14, R: 10, T: 12, S: 8, U: 5, E: 0 },
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
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Preview country' }),
      {
        target: { value: 'Brazil' },
      }
    );
    fireEvent.click(await screen.findByRole('option', { name: 'Brazil (BR)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Run preview' }));

    expect(
      await screen.findByText('River Plate vs Flamengo')
    ).toBeInTheDocument();
    expect(screen.getByText('B 28')).toBeInTheDocument();
    expect(screen.getByText('L 14')).toBeInTheDocument();
    expect(screen.getByText('R 10')).toBeInTheDocument();
    expect(
      screen.getByText('Country priority (R): +10 points')
    ).toBeInTheDocument();
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
