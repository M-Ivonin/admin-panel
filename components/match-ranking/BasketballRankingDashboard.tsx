'use client';

import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { Add, SportsBasketball } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getUsers, type PaginatedUser } from '@/lib/api/users';
import { BasketballRankingWeightsPanel } from './BasketballRankingWeightsPanel';
import {
  activateBasketballRanking,
  createBasketballRankingDraft,
  deactivateBasketballRanking,
  getBasketballRankingConfigurations,
  getBasketballRankingLeagues,
  previewBasketballRanking,
} from '@/lib/api/match-ranking';
import type {
  BasketballLeagueTier,
  BasketballRankingConfiguration,
  BasketballRankingDraft,
  BasketballRankingRules,
  BasketballRankingPreview,
  BasketballRankingPreviewGame,
} from '@/modules/match-ranking/basketball-types';

type Activation =
  | { type: 'activate'; config: BasketballRankingConfiguration }
  | { type: 'deactivate' };

type LeagueTierDraft = {
  query: string;
  version: string;
  reason: string;
  leagueTiers: Record<string, BasketballLeagueTier>;
  rules?: BasketballRankingRules;
};

function fromConfiguration(
  base?: BasketballRankingConfiguration
): LeagueTierDraft {
  return {
    query: '',
    version: '',
    reason: '',
    leagueTiers: base?.leagueTiers ?? {},
    rules: base?.rules,
  };
}

const tiers = [1, 2, 3, 4] as const;
const exclusions: Record<
  NonNullable<BasketballRankingPreviewGame['exclusionReason']>,
  string
> = {
  unrated_league: 'League has no tier',
  ineligible_status: 'Status is ineligible',
  below_threshold: 'Below Top Matches threshold',
};

export function BasketballRankingDashboard({
  sportControl,
}: {
  sportControl: ReactNode;
}) {
  const [tab, setTab] = useState<
    'catalog' | 'configurations' | 'preview' | 'weights'
  >('catalog');
  const [catalog, setCatalog] = useState<
    Awaited<ReturnType<typeof getBasketballRankingLeagues>>
  >([]);
  const [configurations, setConfigurations] = useState<
    BasketballRankingConfiguration[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [catalogDraft, setCatalogDraft] = useState(fromConfiguration);
  const [dialogDraft, setDialogDraft] = useState(fromConfiguration);
  const [creating, setCreating] = useState(false);
  const [previewUser, setPreviewUser] = useState<PaginatedUser | null>(null);
  const [activation, setActivation] = useState<Activation | null>(null);
  const [activationReason, setActivationReason] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [timezone, setTimezone] = useState('Etc/UTC');
  const [previewVersion, setPreviewVersion] = useState('');
  const [preview, setPreview] = useState<BasketballRankingPreview | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getBasketballRankingLeagues(),
      getBasketballRankingConfigurations(),
    ])
      .then(([leagues, configurations]) => {
        if (!mounted) return;
        setCatalog(leagues);
        setConfigurations(configurations);
        setCatalogDraft(
          fromConfiguration(
            configurations.find((configuration) => configuration.active)
          )
        );
        setLoadFailed(false);
      })
      .catch((caught: unknown) => {
        if (!mounted) return;
        setLoadFailed(true);
        setError(messageOf(caught));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [reload]);

  async function perform(action: () => Promise<void>) {
    setError('');
    setSuccess('');
    setPending(true);
    try {
      await action();
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setPending(false);
    }
  }

  function persistDraft(
    draft: BasketballRankingDraft,
    next: 'configurations' | 'preview',
    onSaved?: () => void
  ) {
    void perform(async () => {
      const saved = await createBasketballRankingDraft(draft);
      setConfigurations((rows) => [saved, ...rows]);
      onSaved?.();
      setSuccess(`Draft "${saved.version}" saved.`);
      setCreating(false);
      if (next === 'preview') {
        setPreviewVersion(saved.id);
        setPreview(null);
      }
      setTab(next);
    });
  }

  function saveDraft(
    event: FormEvent,
    draft: LeagueTierDraft,
    onSaved?: () => void
  ) {
    event.preventDefault();
    if (pending || !draft.version.trim() || !draft.reason.trim()) return;
    persistDraft(
      {
        version: draft.version.trim(),
        leagueTiers: draft.leagueTiers,
        reason: draft.reason.trim(),
        ...(draft.rules ? { rules: draft.rules } : {}),
      },
      'configurations',
      onSaved
    );
  }

  function applyActivation(event: FormEvent) {
    event.preventDefault();
    if (!activation || pending || !activationReason.trim()) return;
    void perform(async () => {
      const reason = activationReason.trim();
      if (activation.type === 'activate') {
        await activateBasketballRanking(activation.config.id, reason);
        setConfigurations((rows) =>
          rows.map((row) => ({
            ...row,
            active: row.id === activation.config.id,
          }))
        );
        setCatalogDraft(fromConfiguration(activation.config));
        setSuccess(`Version "${activation.config.version}" activated.`);
      } else {
        await deactivateBasketballRanking(reason);
        setConfigurations((rows) =>
          rows.map((row) => ({ ...row, active: false }))
        );
        setCatalogDraft(fromConfiguration());
        setSuccess('Basketball ranking disabled.');
      }
      setActivation(null);
      setPreview(null);
    });
  }

  function runPreview(event: FormEvent) {
    event.preventDefault();
    if (pending || !date || !timezone.trim()) return;
    setPreview(null);
    void perform(async () => {
      const result = await previewBasketballRanking({
        date,
        timezone: timezone.trim(),
        ...(previewVersion ? { configurationId: previewVersion } : {}),
        ...(previewUser ? { userId: previewUser.id } : {}),
      });
      if (previewUser && result.previewUser?.id !== previewUser.id) {
        throw new Error(
          'The selected user’s preview is unavailable. Please try again later.'
        );
      }
      setPreview(result);
    });
  }

  const active = configurations.find((row) => row.active);

  function openDraft(base = active) {
    setDialogDraft(fromConfiguration(base));
    setError('');
    setCreating(true);
  }

  function closeDraft() {
    if (pending) return;
    setCreating(false);
    setError('');
  }

  function tierEditor(
    draft: LeagueTierDraft,
    updateDraft: Dispatch<SetStateAction<LeagueTierDraft>>
  ) {
    const search = draft.query.trim().toLowerCase();
    const visibleLeagues = catalog.filter((league) =>
      league.name.toLowerCase().includes(search)
    );
    return (
      <>
        <TextField
          label="Search leagues"
          size="small"
          value={draft.query}
          onChange={(event) => {
            const query = event.target.value;
            updateDraft((current) => ({ ...current, query }));
          }}
        />
        <TableContainer sx={{ maxHeight: 480 }}>
          <Table stickyHeader size="small" aria-label="Basketball league tiers">
            <TableHead>
              <TableRow>
                <TableCell>League</TableCell>
                <TableCell>Tier</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleLeagues.map((league) => (
                <TableRow key={league.id}>
                  <TableCell component="th" scope="row">
                    {league.name}
                  </TableCell>
                  <TableCell sx={{ width: 150 }}>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={draft.leagueTiers[league.id] ?? ''}
                      slotProps={{
                        select: {
                          native: true,
                          inputProps: {
                            'aria-label': `Tier for ${league.name}`,
                          },
                        },
                      }}
                      disabled={pending}
                      onChange={(event) => {
                        const tier = tiers.find(
                          (value) => String(value) === event.target.value
                        );
                        updateDraft((current) => {
                          const leagueTiers = { ...current.leagueTiers };
                          if (tier) leagueTiers[league.id] = tier;
                          else delete leagueTiers[league.id];
                          return { ...current, leagueTiers };
                        });
                      }}
                    >
                      <option value="">Unrated</option>
                      {tiers.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </TextField>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {visibleLeagues.length === 0 ? (
          <Typography color="text.secondary">No leagues found.</Typography>
        ) : null}
      </>
    );
  }

  function draftFields(
    draft: LeagueTierDraft,
    updateDraft: Dispatch<SetStateAction<LeagueTierDraft>>
  ) {
    return (
      <>
        <TextField
          required
          label="Version"
          size="small"
          value={draft.version}
          onChange={(event) => {
            const version = event.target.value;
            updateDraft((current) => ({ ...current, version }));
          }}
          disabled={pending}
        />
        <TextField
          required
          label="Change reason"
          size="small"
          value={draft.reason}
          onChange={(event) => {
            const reason = event.target.value;
            updateDraft((current) => ({ ...current, reason }));
          }}
          disabled={pending}
          fullWidth
        />
      </>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminPageHeader
        title="Match ranking"
        subtitle="Set basketball league tiers, activate versions, and preview the calendar order."
        icon={<SportsBasketball color="primary" />}
        actions={sportControl}
      />
      <Stack
        spacing={3}
        sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 } }}
      >
        <Tabs
          value={tab}
          onChange={(_, next: typeof tab) => {
            if (!pending) setTab(next);
          }}
          aria-label="Basketball ranking administration"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab value="catalog" label="League catalog" />
          <Tab value="configurations" label="Configurations" />
          <Tab value="preview" label="Preview" />
          <Tab value="weights" label="Weights & formula" />
        </Tabs>

        {error && !activation && !creating ? (
          <Alert severity="error">{error}</Alert>
        ) : null}
        {success ? (
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        ) : null}
        {loading ? (
          <Stack role="status" alignItems="center" py={6} spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">
              Loading basketball ranking…
            </Typography>
          </Stack>
        ) : null}
        {!loading && loadFailed ? (
          <Box>
            <Button
              onClick={() => {
                setLoading(true);
                setError('');
                setReload((value) => value + 1);
              }}
            >
              Retry
            </Button>
          </Box>
        ) : null}

        {!loading && !loadFailed && tab === 'catalog' ? (
          <Card variant="outlined">
            <CardContent
              component="form"
              onSubmit={(event) =>
                saveDraft(event, catalogDraft, () => {
                  setCatalogDraft((current) => ({
                    ...current,
                    version: '',
                    reason: '',
                  }));
                })
              }
            >
              <Stack spacing={2}>
                <Typography variant="h6">League tiers</Typography>
                {tierEditor(catalogDraft, setCatalogDraft)}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {draftFields(catalogDraft, setCatalogDraft)}
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ flexShrink: 0 }}
                    disabled={
                      pending ||
                      !catalogDraft.version.trim() ||
                      !catalogDraft.reason.trim()
                    }
                  >
                    Save draft
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {!loading && !loadFailed && tab === 'configurations' ? (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    disabled={pending}
                    onClick={() => openDraft()}
                  >
                    New configuration
                  </Button>
                </Stack>
                <Typography variant="h6">Basketball versions</Typography>
                {!active ? (
                  <Alert severity="info">
                    No active version. The app shows the chronological calendar.
                  </Alert>
                ) : null}
                {configurations.length ? (
                  <TableContainer>
                    <Table
                      size="small"
                      aria-label="Basketball ranking versions"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>Version</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {configurations.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell component="th" scope="row">
                              {row.version}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={row.active ? 'Active' : 'Inactive'}
                                color={row.active ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Stack
                                direction="row"
                                spacing={1}
                                useFlexGap
                                flexWrap="wrap"
                                justifyContent="flex-end"
                              >
                                <Button
                                  size="small"
                                  disabled={pending}
                                  onClick={() => openDraft(row)}
                                >
                                  Copy tiers
                                </Button>
                                <Button
                                  size="small"
                                  disabled={pending}
                                  onClick={() => {
                                    setActivationReason('');
                                    setError('');
                                    setActivation(
                                      row.active
                                        ? { type: 'deactivate' }
                                        : { type: 'activate', config: row }
                                    );
                                  }}
                                >
                                  {row.active ? 'Deactivate' : 'Activate'}
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">
                    No saved versions.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {!loading && !loadFailed && tab === 'weights' ? (
          <BasketballRankingWeightsPanel
            configurations={configurations}
            pending={pending}
            onSave={(draft) => persistDraft(draft, 'preview')}
          />
        ) : null}

        {!loading && !loadFailed && tab === 'preview' ? (
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent component="form" onSubmit={runPreview}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'minmax(0, 1fr)',
                      sm: 'repeat(2, minmax(0, 1fr))',
                      lg: 'minmax(0, 1.5fr) minmax(135px, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto',
                    },
                    alignItems: 'start',
                    gap: 2,
                    '& > *': { minWidth: 0 },
                  }}
                >
                  <BasketballPreviewUserField
                    user={previewUser}
                    disabled={pending}
                    onChange={(user) => {
                      setPreviewUser(user);
                      setPreview(null);
                    }}
                  />
                  <TextField
                    required
                    type="date"
                    label="Date"
                    size="small"
                    value={date}
                    disabled={pending}
                    slotProps={{ inputLabel: { shrink: true } }}
                    onChange={(event) => {
                      setDate(event.target.value);
                      setPreview(null);
                    }}
                  />
                  <TextField
                    required
                    label="Timezone"
                    size="small"
                    value={timezone}
                    disabled={pending}
                    onChange={(event) => {
                      setTimezone(event.target.value);
                      setPreview(null);
                    }}
                  />
                  <TextField
                    select
                    label="Ranking version"
                    size="small"
                    value={previewVersion}
                    disabled={pending}
                    onChange={(event) => {
                      setPreviewVersion(event.target.value);
                      setPreview(null);
                    }}
                  >
                    <MenuItem value="">
                      <em>Active version</em>
                    </MenuItem>
                    {configurations.map((row) => (
                      <MenuItem key={row.id} value={row.id}>
                        {row.version}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={pending || !date || !timezone.trim()}
                  >
                    Run preview
                  </Button>
                </Box>
              </CardContent>
            </Card>
            {pending ? (
              <Stack
                role="status"
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <CircularProgress size={20} />
                <Typography>Running preview…</Typography>
              </Stack>
            ) : null}
            {preview ? (
              <PreviewResults result={preview} timezone={timezone.trim()} />
            ) : null}
          </Stack>
        ) : null}
      </Stack>

      <Dialog open={creating} onClose={closeDraft} maxWidth="md" fullWidth>
        <Box
          component="form"
          onSubmit={(event) => saveDraft(event, dialogDraft)}
        >
          <DialogTitle>New configuration</DialogTitle>
          <DialogContent>
            <Stack spacing={2} pt={1}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              {draftFields(dialogDraft, setDialogDraft)}
              {tierEditor(dialogDraft, setDialogDraft)}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDraft} disabled={pending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                pending ||
                !dialogDraft.version.trim() ||
                !dialogDraft.reason.trim()
              }
            >
              Create configuration
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={activation !== null}
        onClose={() => {
          if (!pending) setActivation(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={applyActivation}>
          <DialogTitle>
            {activation?.type === 'activate'
              ? `Activate "${activation.config.version}"?`
              : 'Deactivate basketball ranking?'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} pt={1}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField
                autoFocus
                required
                fullWidth
                label="Change reason"
                value={activationReason}
                disabled={pending}
                onChange={(event) => setActivationReason(event.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setActivation(null);
                setError('');
              }}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={pending || !activationReason.trim()}
            >
              {activation?.type === 'deactivate'
                ? 'Confirm deactivation'
                : 'Confirm activation'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

function BasketballPreviewUserField({
  user,
  disabled,
  onChange,
}: {
  user: PaginatedUser | null;
  disabled: boolean;
  onChange: (user: PaginatedUser | null) => void;
}) {
  const [query, setQuery] = useState(user?.email ?? '');
  const [options, setOptions] = useState<PaginatedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const search = query.trim();
    setOptions([]);
    setFailed(false);
    if (user || search.length < 2) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    const timer = window.setTimeout(() => {
      void getUsers({ page: 1, limit: 25, search })
        .then(
          (response) => {
            if (active)
              setOptions(
                response.users.filter((candidate) => Boolean(candidate.email))
              );
          },
          () => {
            if (active) setFailed(true);
          }
        )
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, user]);

  return (
    <Autocomplete
      options={user ? [user] : options}
      value={user}
      inputValue={query}
      disabled={disabled}
      loading={loading}
      filterOptions={(options) => options}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      getOptionLabel={(option) => option.email ?? option.id}
      onInputChange={(_event, value, reason) => {
        if (reason === 'input') {
          setQuery(value);
          onChange(null);
        }
      }}
      onChange={(_event, selected) => {
        setQuery(selected?.email ?? '');
        onChange(selected);
      }}
      noOptionsText={
        failed
          ? 'User search failed. Edit the email to retry.'
          : query.trim().length < 2
            ? 'Type at least two email characters.'
            : 'No users found.'
      }
      renderInput={(params) => (
        <TextField {...params} size="small" label="Preview user email" />
      )}
    />
  );
}

function PreviewResults({
  result,
  timezone,
}: {
  result: BasketballRankingPreview;
  timezone: string;
}) {
  const showStage = result.groups.some((group) =>
    group.matches.some((match) => match.stageScore !== 0)
  );
  const showTiming = result.groups.some((group) =>
    group.matches.some((match) => match.timingScore !== 0)
  );
  const showInterest =
    Boolean(result.previewUser) ||
    result.groups.some((group) =>
      group.matches.some((match) => Boolean(match.interestScore))
    );
  const tableMinWidth =
    550 +
    (showStage ? 150 : 0) +
    (showTiming ? 85 : 0) +
    (showInterest ? 100 : 0);
  const startTime = new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography color="text.secondary">
            Version: {result.version ?? 'No active version'}
          </Typography>
          {result.previewUser ? (
            <Typography color="text.secondary">
              Preview for {result.previewUser.email ?? result.previewUser.id}
            </Typography>
          ) : null}
          <Typography variant="h6">Top Matches</Typography>
          {result.topMatches.length ? (
            <Box component="ol" sx={{ my: 0, pl: 3 }}>
              {result.topMatches.map((game) => (
                <Typography component="li" key={game.id}>
                  {game.homeTeam.name} vs {game.awayTeam.name} ·{' '}
                  {game.league.name}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">
              No eligible Top Matches.
            </Typography>
          )}
          <Typography variant="h6">Calendar order</Typography>
          {result.groups.length ? null : (
            <Typography color="text.secondary">
              No matches for this day.
            </Typography>
          )}
          {result.groups.map((group) => (
            <Box key={group.league.id}>
              <Typography variant="subtitle1" fontWeight={600}>
                {group.league.name}
              </Typography>
              <TableContainer>
                <Table
                  size="small"
                  aria-label={`Ranking for ${group.league.name}`}
                  sx={{ tableLayout: 'fixed', minWidth: tableMinWidth }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '29%' }}>Match</TableCell>
                      <TableCell sx={{ width: '10%' }}>Start</TableCell>
                      <TableCell align="right">League</TableCell>
                      {showStage ? <TableCell>Stage</TableCell> : null}
                      {showTiming ? (
                        <TableCell align="right">Timing</TableCell>
                      ) : null}
                      {showInterest ? (
                        <TableCell align="right">Interest</TableCell>
                      ) : null}
                      <TableCell align="right">Total</TableCell>
                      <TableCell sx={{ width: '19%' }}>
                        Top eligibility
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.matches.map(
                      ({
                        game,
                        leagueScore,
                        stageScore,
                        timingScore,
                        interestScore = 0,
                        total,
                        exclusionReason,
                      }) => (
                        <TableRow key={game.id}>
                          <TableCell component="th" scope="row">
                            {game.homeTeam.name} vs {game.awayTeam.name}
                          </TableCell>
                          <TableCell>
                            {startTime.format(new Date(game.startsAt))}
                          </TableCell>
                          <TableCell align="right">{leagueScore}</TableCell>
                          {showStage ? (
                            <TableCell>
                              {stageScore ? (
                                <>
                                  {game.stage} {signedPoints(stageScore)}
                                </>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                          ) : null}
                          {showTiming ? (
                            <TableCell align="right">
                              {signedPoints(timingScore)}
                            </TableCell>
                          ) : null}
                          {showInterest ? (
                            <TableCell align="right">
                              {signedPoints(interestScore)}
                            </TableCell>
                          ) : null}
                          <TableCell align="right">{total}</TableCell>
                          <TableCell>
                            {exclusionReason
                              ? exclusions[exclusionReason]
                              : 'Eligible'}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function signedPoints(points: number) {
  if (points === 0) return '—';
  return points > 0 ? `+${points}` : `−${Math.abs(points)}`;
}

function messageOf(caught: unknown) {
  return caught instanceof Error
    ? caught.message
    : 'Basketball ranking request failed.';
}
