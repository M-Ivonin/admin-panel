'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { SportsBasketball } from '@mui/icons-material';
import {
  Alert,
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
  BasketballRankingPreview,
  BasketballRankingPreviewGame,
} from '@/modules/match-ranking/basketball-types';

type Activation =
  | { type: 'activate'; config: BasketballRankingConfiguration }
  | { type: 'deactivate' };

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
  const [tab, setTab] = useState<'catalog' | 'configurations' | 'preview'>(
    'catalog'
  );
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
  const [query, setQuery] = useState('');
  const [leagueTiers, setLeagueTiers] = useState<
    Record<string, BasketballLeagueTier>
  >({});
  const [version, setVersion] = useState('');
  const [draftReason, setDraftReason] = useState('');
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
        setLeagueTiers(
          configurations.find((configuration) => configuration.active)
            ?.leagueTiers ?? {}
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

  function saveDraft(event: FormEvent) {
    event.preventDefault();
    if (pending || !version.trim() || !draftReason.trim()) return;
    void perform(async () => {
      const saved = await createBasketballRankingDraft({
        version: version.trim(),
        leagueTiers,
        reason: draftReason.trim(),
      });
      setConfigurations((rows) => [saved, ...rows]);
      setVersion('');
      setDraftReason('');
      setSuccess(`Draft "${saved.version}" saved.`);
      setTab('configurations');
    });
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
        setSuccess(`Version "${activation.config.version}" activated.`);
      } else {
        await deactivateBasketballRanking(reason);
        setConfigurations((rows) =>
          rows.map((row) => ({ ...row, active: false }))
        );
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
      setPreview(
        await previewBasketballRanking({
          date,
          timezone: timezone.trim(),
          ...(previewVersion ? { configurationId: previewVersion } : {}),
        })
      );
    });
  }

  const active = configurations.find((row) => row.active);
  const visibleLeagues = catalog.filter((league) =>
    league.name.toLowerCase().includes(query.trim().toLowerCase())
  );

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
        </Tabs>

        {error && !activation ? <Alert severity="error">{error}</Alert> : null}
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
            <CardContent component="form" onSubmit={saveDraft}>
              <Stack spacing={2}>
                <Typography variant="h6">League tiers</Typography>
                <TextField
                  label="Search leagues"
                  size="small"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <TableContainer sx={{ maxHeight: 480 }}>
                  <Table
                    stickyHeader
                    size="small"
                    aria-label="Basketball league tiers"
                  >
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
                              value={leagueTiers[league.id] ?? ''}
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
                                  (value) =>
                                    String(value) === event.target.value
                                );
                                setLeagueTiers((current) => {
                                  const next = { ...current };
                                  if (tier) next[league.id] = tier;
                                  else delete next[league.id];
                                  return next;
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
                  <Typography color="text.secondary">
                    No leagues found.
                  </Typography>
                ) : null}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    required
                    label="Version"
                    size="small"
                    value={version}
                    onChange={(event) => setVersion(event.target.value)}
                    disabled={pending}
                  />
                  <TextField
                    required
                    label="Change reason"
                    size="small"
                    value={draftReason}
                    onChange={(event) => setDraftReason(event.target.value)}
                    disabled={pending}
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ flexShrink: 0 }}
                    disabled={pending || !version.trim() || !draftReason.trim()}
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
                                  onClick={() => {
                                    setLeagueTiers(row.leagueTiers);
                                    setQuery('');
                                    setTab('catalog');
                                  }}
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

        {!loading && !loadFailed && tab === 'preview' ? (
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent component="form" onSubmit={runPreview}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
                    sx={{ minWidth: 180 }}
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
                </Stack>
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
  const tableMinWidth = 550 + (showStage ? 150 : 0) + (showTiming ? 85 : 0);
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
