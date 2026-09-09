'use client';

import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
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
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Edit, HelpOutline, SportsSoccer } from '@mui/icons-material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
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
  getTeamProminence,
  getSportmonksTeams,
  previewMatchRanking,
  updateMatchRankingCompetition,
  updateMatchRankingOverride,
  upsertTeamProminence,
} from '@/lib/api/match-ranking';
import type {
  CompetitionClassification,
  CompetitionScope,
  MatchRankingAuditEvent,
  MatchRankingCompetition,
  MatchRankingCatalogQueue,
  MatchRankingConfiguration,
  MatchRankingOverride,
  MatchRankingOverrideAction,
  MatchFixtureOption,
  MatchRankingPreview,
  TeamProminence,
  SportmonksTeamOption,
} from '@/modules/match-ranking/types';
import {
  CountryScopeOption,
  countryScopeOptions,
  countryScopeSelection,
  expandCountryScopes,
} from '@/modules/match-ranking/country-scopes';

const tabs = [
  'Competition catalog',
  'Team prominence',
  'Fixture overrides',
  'Configurations',
  'Preview',
  'Audit',
] as const;

type HelpTopic = 'general' | (typeof tabs)[number];

const tabHelp: Record<
  (typeof tabs)[number],
  { intro: string; sections: { title: string; body: string }[] }
> = {
  'Competition catalog': {
    intro:
      'This is the list of competitions known to the ranking system. Review records here when the provider data is incomplete, ambiguous, or needs an admin decision.',
    sections: [
      {
        title: 'Review queues',
        body: 'Ready for review means the record has enough information to check. Review is not required for every ranking run, but it confirms that the values are suitable. Needs attention cannot be approved in bulk: open the competition, check the warning, and complete or correct the missing information first.',
      },
      {
        title: 'What to fill in',
        body: 'Effective category controls the competition importance used by ranking. Country, confederation, and scope describe where the competition belongs. Classification identifies senior, women, youth, reserve, or friendly competitions. Set the review state to reviewed only after checking these values, and always write a short reason for the decision.',
      },
    ],
  },
  'Team prominence': {
    intro:
      'Use team prominence when certain teams should carry more or less weight for a particular audience than their competition alone suggests.',
    sections: [
      {
        title: 'How to use it',
        body: 'Find the team by name, choose Global or the countries and regions where the rule applies, then select the prominence value. Use 0 for no extra prominence, 10 for notable teams, and 20 for the strongest prominence.',
      },
      {
        title: 'Review and reason',
        body: 'The reason explains the editorial decision. Review due is an optional reminder to revisit it later; reaching that date does not switch the rule off.',
      },
    ],
  },
  'Fixture overrides': {
    intro:
      'Fixture overrides are temporary exceptions for a specific match. Use them only when the normal ranking needs a deliberate short-term correction.',
    sections: [
      {
        title: 'Choose the action',
        body: 'Pin pushes a match ahead of ordinary matches. Exclude top removes it from Top Matches. Adjust adds or removes ranking points without making an otherwise ineligible match eligible.',
      },
      {
        title: 'Scope and timing',
        body: 'Choose Global or the user countries and regions affected. Set the UTC start and end of the exception, add a priority for Pin when needed, and record a clear reason. Remove or let the override expire when the editorial need ends.',
      },
    ],
  },
  Configurations: {
    intro:
      'Configurations are versioned sets of ranking rules and rollout settings. Creating a version does not change the live ranking.',
    sections: [
      {
        title: 'Before activation',
        body: 'Give the version and experiment clear names, define the countries and audience percentage, and enter the approved rules. Use Preview to check representative countries and dates before activation.',
      },
      {
        title: 'Activation',
        body: 'Activate only a reviewed and approved version. Activation replaces the current version for future ranking results, so include a reason that identifies the decision or approval.',
      },
    ],
  },
  Preview: {
    intro:
      'Preview is a safe, read-only view of how matches would be ordered for a chosen date, timezone, and country.',
    sections: [
      {
        title: 'How to check a result',
        body: 'Choose the local date, the matching IANA timezone, and an optional two-letter country code. Compare Top Matches and league groups, then inspect the score parts and any exclusion explanation for unexpected results.',
      },
      {
        title: 'What Preview does not do',
        body: 'Running a preview does not publish, activate, or change anything. Use it after catalog, prominence, override, or configuration changes and before activating a new configuration.',
      },
    ],
  },
  Audit: {
    intro: 'Audit is the read-only history of admin changes to match ranking.',
    sections: [
      {
        title: 'How to use it',
        body: 'Use the actor, time, reason, and before/after values to understand who changed a rule and why. Check it when investigating an unexpected ranking result or confirming an approved change.',
      },
      {
        title: 'If something looks wrong',
        body: 'Do not edit the history. Return to the tab that owns the value, make the necessary correction with a new reason, and use Preview to verify the result.',
      },
    ],
  },
};

const scopes: CompetitionScope[] = [
  'domestic',
  'continental',
  'global',
  'unknown',
];
const classifications: CompetitionClassification[] = [
  'senior',
  'women',
  'youth',
  'reserve',
  'friendly',
  'unknown',
];
const prominenceValues = [0, 10, 20] as const;

export function MatchRankingDashboard() {
  const [tab, setTab] = useState(0);
  const [helpTopic, setHelpTopic] = useState<HelpTopic | null>(null);
  const [competitions, setCompetitions] = useState<MatchRankingCompetition[]>(
    []
  );
  const [prominence, setProminence] = useState<TeamProminence[]>([]);
  const [overrides, setOverrides] = useState<MatchRankingOverride[]>([]);
  const [configurations, setConfigurations] = useState<
    MatchRankingConfiguration[]
  >([]);
  const [audit, setAudit] = useState<MatchRankingAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [reviewState, setReviewState] = useState('');
  const [catalogQueue, setCatalogQueue] =
    useState<MatchRankingCatalogQueue>('');
  const [selectedCompetitionIds, setSelectedCompetitionIds] = useState<
    string[]
  >([]);
  const [bulkReviewOpen, setBulkReviewOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] =
    useState<MatchRankingCompetition | null>(null);
  const [editingProminence, setEditingProminence] = useState<
    TeamProminence | null | undefined
  >(undefined);
  const [editingOverride, setEditingOverride] = useState<
    MatchRankingOverride | null | undefined
  >(undefined);
  const [deletingOverride, setDeletingOverride] =
    useState<MatchRankingOverride | null>(null);
  const [creatingConfiguration, setCreatingConfiguration] = useState(false);
  const [activatingConfiguration, setActivatingConfiguration] =
    useState<MatchRankingConfiguration | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        competitionRows,
        prominenceRows,
        overrideRows,
        configRows,
        auditRows,
      ] = await Promise.all([
        getMatchRankingCompetitions(),
        getTeamProminence(),
        getMatchRankingOverrides(),
        getMatchRankingConfigurations(),
        getMatchRankingAudit(),
      ]);
      setCompetitions(competitionRows);
      setProminence(prominenceRows);
      setOverrides(overrideRows);
      setConfigurations(configRows);
      setAudit(auditRows);
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function searchCatalog(queue = catalogQueue) {
    setLoading(true);
    setError(null);
    setSelectedCompetitionIds([]);
    try {
      setCompetitions(
        await getMatchRankingCompetitions({
          query: search,
          reviewState,
          queue,
        })
      );
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminPageHeader
        title="Match ranking"
        subtitle="Review ranking inputs, activate versioned rules, and inspect deterministic Top Matches previews."
        icon={<SportsSoccer color="primary" />}
        actions={
          <Button
            variant="outlined"
            startIcon={<HelpOutline />}
            onClick={() => setHelpTopic('general')}
            aria-label="About match ranking"
          >
            Help
          </Button>
        }
      />
      <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 } }}>
        <Stack spacing={3}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          ) : null}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tabs
              value={tab}
              onChange={(_, value: number) => setTab(value)}
              aria-label="Match ranking administration"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ minWidth: 0, flex: 1 }}
            >
              {tabs.map((label) => (
                <Tab key={label} label={label} />
              ))}
            </Tabs>
            <Tooltip title={`Help for ${tabs[tab]}`} arrow>
              <IconButton
                color="primary"
                onClick={() => setHelpTopic(tabs[tab])}
                aria-label={`Help for ${tabs[tab]}`}
                sx={{ flexShrink: 0 }}
              >
                <HelpOutline />
              </IconButton>
            </Tooltip>
          </Stack>

          {loading ? (
            <Stack role="status" alignItems="center" py={8} spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">
                Loading match ranking data…
              </Typography>
            </Stack>
          ) : null}

          {!loading && tab === 0 ? (
            <CatalogPanel
              items={competitions}
              search={search}
              reviewState={reviewState}
              queue={catalogQueue}
              selectedIds={selectedCompetitionIds}
              onSearchChange={setSearch}
              onReviewStateChange={setReviewState}
              onSearch={() => void searchCatalog()}
              onQueueChange={(value) => {
                setCatalogQueue(value);
                setSelectedCompetitionIds([]);
                void searchCatalog(value);
              }}
              onSelectionChange={setSelectedCompetitionIds}
              onBulkReview={() => setBulkReviewOpen(true)}
              onEdit={setEditingCompetition}
            />
          ) : null}
          {!loading && tab === 1 ? (
            <ProminencePanel items={prominence} onEdit={setEditingProminence} />
          ) : null}
          {!loading && tab === 2 ? (
            <OverridesPanel
              items={overrides}
              onEdit={setEditingOverride}
              onDelete={setDeletingOverride}
            />
          ) : null}
          {!loading && tab === 3 ? (
            <ConfigurationsPanel
              items={configurations}
              onCreate={() => setCreatingConfiguration(true)}
              onActivate={setActivatingConfiguration}
            />
          ) : null}
          {!loading && tab === 4 ? <PreviewPanel onError={setError} /> : null}
          {!loading && tab === 5 ? <AuditPanel items={audit} /> : null}
        </Stack>
      </Box>

      {editingCompetition ? (
        <CompetitionDialog
          item={editingCompetition}
          onClose={() => setEditingCompetition(null)}
          onSaved={async () => {
            setEditingCompetition(null);
            setSuccess(`${editingCompetition.name} review saved.`);
            await searchCatalog();
          }}
        />
      ) : null}
      {bulkReviewOpen ? (
        <BulkReviewDialog
          count={selectedCompetitionIds.length}
          onClose={() => setBulkReviewOpen(false)}
          onApproved={async (reason) => {
            await bulkReviewMatchRankingCompetitions(
              selectedCompetitionIds,
              reason
            );
            setBulkReviewOpen(false);
            setSelectedCompetitionIds([]);
            setSuccess('Selected competitions approved.');
            await searchCatalog();
          }}
        />
      ) : null}
      {editingProminence !== undefined ? (
        <ProminenceDialog
          item={editingProminence}
          onClose={() => setEditingProminence(undefined)}
          onSaved={async () => {
            setEditingProminence(undefined);
            setSuccess('Team prominence saved.');
            setProminence(await getTeamProminence());
          }}
        />
      ) : null}
      {editingOverride !== undefined ? (
        <OverrideDialog
          item={editingOverride}
          onClose={() => setEditingOverride(undefined)}
          onSaved={async () => {
            setEditingOverride(undefined);
            setSuccess('Fixture override saved.');
            setOverrides(await getMatchRankingOverrides());
          }}
        />
      ) : null}
      {deletingOverride ? (
        <DeleteOverrideDialog
          item={deletingOverride}
          onClose={() => setDeletingOverride(null)}
          onDeleted={async () => {
            setDeletingOverride(null);
            setSuccess(
              `Override for fixture ${deletingOverride.fixtureId} deleted.`
            );
            setOverrides(await getMatchRankingOverrides());
          }}
        />
      ) : null}
      {creatingConfiguration ? (
        <ConfigurationDialog
          onClose={() => setCreatingConfiguration(false)}
          onSaved={async () => {
            setCreatingConfiguration(false);
            setSuccess('Ranking configuration created.');
            setConfigurations(await getMatchRankingConfigurations());
          }}
        />
      ) : null}
      {activatingConfiguration ? (
        <ActivationDialog
          item={activatingConfiguration}
          onClose={() => setActivatingConfiguration(null)}
          onActivated={async () => {
            setActivatingConfiguration(null);
            setSuccess(`${activatingConfiguration.version} activated.`);
            setConfigurations(await getMatchRankingConfigurations());
          }}
        />
      ) : null}
      {helpTopic ? (
        <MatchRankingHelpDialog
          topic={helpTopic}
          onClose={() => setHelpTopic(null)}
        />
      ) : null}
    </Box>
  );
}

function MatchRankingHelpDialog({
  topic,
  onClose,
}: {
  topic: HelpTopic;
  onClose: () => void;
}) {
  const isGeneral = topic === 'general';
  const guide = isGeneral ? null : tabHelp[topic];

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isGeneral ? 'How match ranking works' : `${topic} guide`}
      </DialogTitle>
      <DialogContent dividers>
        {isGeneral ? (
          <Stack spacing={2}>
            <Typography>
              Match ranking decides which fixtures appear first for each user.
              It combines competition importance, team prominence, match timing
              and eligibility, plus any temporary admin overrides.
            </Typography>
            <Typography>
              The result can differ by country and active configuration. This
              page lets admins maintain the inputs, test the outcome in Preview,
              and trace every change in Audit.
            </Typography>
            <Alert severity="info">
              Normal work should flow from reviewing inputs, to Preview, and
              only then to activating a configuration when a rules change is
              intended.
            </Alert>
          </Stack>
        ) : guide ? (
          <Stack spacing={2.5}>
            <Typography>{guide.intro}</Typography>
            {guide.sections.map((section) => (
              <Box key={section.title}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  {section.title}
                </Typography>
                <Typography color="text.secondary">{section.body}</Typography>
              </Box>
            ))}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close help
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CatalogPanel({
  items,
  search,
  reviewState,
  queue,
  selectedIds,
  onSearchChange,
  onReviewStateChange,
  onSearch,
  onQueueChange,
  onSelectionChange,
  onBulkReview,
  onEdit,
}: {
  items: MatchRankingCompetition[];
  search: string;
  reviewState: string;
  queue: MatchRankingCatalogQueue;
  selectedIds: string[];
  onSearchChange: (value: string) => void;
  onReviewStateChange: (value: string) => void;
  onSearch: () => void;
  onQueueChange: (value: MatchRankingCatalogQueue) => void;
  onSelectionChange: (ids: string[]) => void;
  onBulkReview: () => void;
  onEdit: (item: MatchRankingCompetition) => void;
}) {
  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ md: 'flex-start' }}
          >
            <TextField
              label="Competition search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              select
              label="Review state filter"
              value={reviewState}
              onChange={(event) => onReviewStateChange(event.target.value)}
              size="small"
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">All review states</MenuItem>
              <MenuItem value="pending_enrichment">pending_enrichment</MenuItem>
              <MenuItem value="pending_review">pending_review</MenuItem>
              <MenuItem value="reviewed">reviewed</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              onClick={onSearch}
              sx={{
                minWidth: 140,
                minHeight: 40,
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Search catalog
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
          >
            <Button
              variant={queue === 'ready' ? 'contained' : 'outlined'}
              onClick={() => onQueueChange('ready')}
            >
              Ready for review
            </Button>
            <Button
              color="warning"
              variant={queue === 'attention' ? 'contained' : 'outlined'}
              onClick={() => onQueueChange('attention')}
            >
              Needs attention
            </Button>
            <Button
              variant={queue === '' ? 'contained' : 'outlined'}
              onClick={() => onQueueChange('')}
            >
              All competitions
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="contained"
              disabled={selectedIds.length === 0}
              onClick={onBulkReview}
            >
              Approve selected ({selectedIds.length})
            </Button>
          </Stack>
        </CardContent>
      </Card>
      {items.length === 0 ? (
        <EmptyCard text="No competitions found" />
      ) : (
        <CompetitionTable
          items={items}
          selectedIds={selectedIds}
          onSelectionChange={onSelectionChange}
          onEdit={onEdit}
        />
      )}
    </Stack>
  );
}

function CompetitionTable({
  items,
  selectedIds,
  onSelectionChange,
  onEdit,
}: {
  items: MatchRankingCompetition[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit: (item: MatchRankingCompetition) => void;
}) {
  return (
    <Card variant="outlined">
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1050 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 44 }} aria-label="Select" />
              <TableCell>Competition</TableCell>
              <TableCell>Provider data</TableCell>
              <TableCell>Approval result</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last sync</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const canBulkApprove =
                item.reviewState === 'pending_review' && !item.needsAttention;
              const rankingCategory =
                item.effectiveCategory ?? item.providerCategory;
              const approvalClassification =
                item.classification === 'unknown'
                  ? item.suggestedClassification
                  : item.classification;
              const selected = selectedIds.includes(item.id);
              return (
                <TableRow
                  key={item.id}
                  selected={selected}
                  aria-label={`${item.name} competition`}
                  sx={{ '&:last-child td': { borderBottom: 0 } }}
                >
                  <TableCell padding="checkbox">
                    {canBulkApprove ? (
                      <Checkbox
                        size="small"
                        checked={selected}
                        onChange={(event) =>
                          onSelectionChange(
                            event.target.checked
                              ? [...selectedIds, item.id]
                              : selectedIds.filter((id) => id !== item.id)
                          )
                        }
                        inputProps={{ 'aria-label': `Select ${item.name}` }}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      #{item.providerLeagueId} · {item.metadataSource}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Category <strong>{item.providerCategory ?? '—'}</strong> ·{' '}
                      {item.countryCode ?? 'Global'}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {item.scope} · {item.confederation ?? 'No confederation'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Rank <strong>{rankingCategory ?? '—'}</strong> ·{' '}
                      <Box
                        component="span"
                        sx={{ textTransform: 'capitalize' }}
                      >
                        {approvalClassification}
                      </Box>
                    </Typography>
                    <Typography variant="caption" color="primary.main">
                      {approvalHint(item)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5} alignItems="flex-start">
                      <Chip
                        size="small"
                        label={reviewStateLabel(item.reviewState)}
                        color={
                          item.reviewState === 'reviewed'
                            ? 'success'
                            : 'warning'
                        }
                      />
                      {item.needsAttention ? (
                        <Typography variant="caption" color="error.main">
                          {attentionReason(item)}
                        </Typography>
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {formatDate(item.metadataLastSuccessAt)}
                    </Typography>
                    {item.metadataLastError ? (
                      <Typography
                        variant="caption"
                        color="error.main"
                        display="block"
                      >
                        Enrichment error
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => onEdit(item)}
                      aria-label={`Edit ${item.name}`}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

function approvalHint(item: MatchRankingCompetition): string {
  const parts: string[] = [];
  if (item.effectiveCategory == null && item.providerCategory != null)
    parts.push('provider category');
  if (item.classification === 'unknown')
    parts.push(`suggested ${item.suggestedClassification}`);
  if (item.reviewState === 'reviewed') return 'Reviewed values';
  if (parts.length === 0) return 'Enriched values';
  return `Uses ${parts.join(' + ')}`;
}

function BulkReviewDialog({
  count,
  onClose,
  onApproved,
}: {
  count: number;
  onClose: () => void;
  onApproved: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function approve() {
    if (!reason.trim()) return setError('Reason is required.');
    setSaving(true);
    setError(null);
    try {
      await onApproved(reason.trim());
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Approve selected competitions</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Alert severity="info">
            Provider category and the suggested classification will be accepted
            for {count} selected {count === 1 ? 'competition' : 'competitions'}.
          </Alert>
          <TextField
            label="Bulk review reason"
            required
            multiline
            minRows={2}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={() => void approve()}
        >
          Approve {count} {count === 1 ? 'competition' : 'competitions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CompetitionDialog({
  item,
  onClose,
  onSaved,
}: {
  item: MatchRankingCompetition;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [category, setCategory] = useState(
    (item.effectiveCategory ?? item.providerCategory)?.toString() ?? ''
  );
  const [countryCode, setCountryCode] = useState(item.countryCode ?? '');
  const [confederation, setConfederation] = useState(item.confederation ?? '');
  const [scope, setScope] = useState<CompetitionScope>(item.scope);
  const [classification, setClassification] =
    useState<CompetitionClassification>(item.classification);
  const [reviewState, setReviewState] = useState(item.reviewState);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!reason.trim()) return setError('Reason is required.');
    setSaving(true);
    setError(null);
    try {
      await updateMatchRankingCompetition(item.id, {
        effectiveCategory: category === '' ? null : Number(category),
        countryCode: normalizedCountry(countryCode),
        confederation: confederation.trim() || null,
        scope,
        classification,
        reviewState: reviewState.trim(),
        reason: reason.trim(),
      });
      await onSaved();
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="competition-dialog-title"
    >
      <DialogTitle id="competition-dialog-title">
        Review competition
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Typography fontWeight={600}>{item.name}</Typography>
          <Alert severity="info">
            These values are used by match ranking. Saving also records your
            reason in the audit log.
          </Alert>
          <TextField
            label="Effective category"
            type="number"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            helperText={`Provider category: ${item.providerCategory ?? 'not provided'}`}
          />
          <TextField
            label="Country code"
            value={countryCode}
            inputProps={{ maxLength: 2 }}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
          />
          <TextField
            label="Confederation"
            value={confederation}
            onChange={(e) => setConfederation(e.target.value)}
          />
          <TextField
            select
            label="Scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as CompetitionScope)}
          >
            {scopes.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Classification"
            value={classification}
            onChange={(e) =>
              setClassification(e.target.value as CompetitionClassification)
            }
          >
            {classifications.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Review state"
            value={reviewState}
            onChange={(e) => setReviewState(e.target.value)}
          >
            <MenuItem value="pending_enrichment">pending_enrichment</MenuItem>
            <MenuItem value="pending_review">pending_review</MenuItem>
            <MenuItem value="reviewed">reviewed</MenuItem>
          </TextField>
          <TextField
            label="Reason"
            required
            multiline
            minRows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            inputProps={{ 'aria-label': 'Reason' }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={() => void save()}
        >
          Save review
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ProminencePanel({
  items,
  onEdit,
}: {
  items: TeamProminence[];
  onEdit: (item: TeamProminence | null) => void;
}) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => onEdit(null)}
        >
          Add prominence
        </Button>
      </Stack>
      {items.length === 0 ? (
        <EmptyCard text="No team prominence records" />
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Prominence</TableCell>
                <TableCell>Review due</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {item.teamName || 'Unknown team'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      #{item.providerTeamId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.countryCode ?? 'Global'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell>{formatDate(item.reviewDueAt)}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell align="right">
                    <Button startIcon={<Edit />} onClick={() => onEdit(item)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}

function ProminenceDialog({
  item,
  onClose,
  onSaved,
}: {
  item: TeamProminence | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [teamId, setTeamId] = useState(item?.providerTeamId.toString() ?? '');
  const [countryScopes, setCountryScopes] = useState<CountryScopeOption[]>(() =>
    countryScopeSelection(item?.countryCode)
  );
  const [teams, setTeams] = useState<SportmonksTeamOption[]>([]);
  const [teamQuery, setTeamQuery] = useState('');
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [value, setValue] = useState(item?.value.toString() ?? '0');
  const [reason, setReason] = useState(item?.reason ?? '');
  const [due, setDue] = useState(toDateInput(item?.reviewDueAt));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const normalizedQuery = teamQuery.trim();
    if (normalizedQuery.length < 2) {
      setTeams([]);
      setTeamsLoading(false);
      return;
    }
    let active = true;
    setTeamsLoading(true);
    getSportmonksTeams(normalizedQuery)
      .then((options) => {
        if (active) setTeams(options);
      })
      .catch((caught) => {
        if (active) setError(messageOf(caught));
      })
      .finally(() => {
        if (active) setTeamsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [teamQuery]);
  const selectedTeam = useMemo(
    () =>
      teams.find((team) => team.id.toString() === teamId) ??
      (item
        ? {
            id: item.providerTeamId,
            name: item.teamName || `Team ${item.providerTeamId}`,
            country: null,
          }
        : null),
    [item, teamId, teams]
  );
  async function save() {
    if (
      !Number.isSafeInteger(Number(teamId)) ||
      Number(teamId) <= 0 ||
      !reason.trim()
    )
      return setError('A valid team ID and reason are required.');
    try {
      const countryCodes = expandCountryScopes(countryScopes);
      await upsertTeamProminence({
        ...(item ? { id: item.id } : {}),
        providerTeamId: Number(teamId),
        ...(countryCodes.length > 0 ? { countryCodes } : { countryCode: null }),
        value: Number(value),
        reason: reason.trim(),
        reviewDueAt: due ? `${due}T00:00:00.000Z` : null,
      });
      await onSaved();
    } catch (caught) {
      setError(messageOf(caught));
    }
  }
  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="prominence-dialog-title"
    >
      <DialogTitle id="prominence-dialog-title">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          {item ? 'Edit team prominence' : 'Add team prominence'}
          <Stack direction="row">
            <HelpButton
              label="Team prominence scope help"
              title="Select one or more countries or regions. Regions expand to their countries and overlapping selections are deduplicated. Leave empty for Global prominence. When Global and country-specific rules both apply, the higher prominence value wins. Prominence values are 0, 10, or 20."
            />
            <HelpButton
              label="Team prominence review help"
              title="Review due is an operational reminder only. It does not disable prominence or change ranking automatically."
            />
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Autocomplete
            options={teams}
            value={selectedTeam}
            loading={teamsLoading}
            disabled={Boolean(item)}
            autoHighlight
            getOptionLabel={(team) => formatTeamOption(team)}
            isOptionEqualToValue={(option, selected) =>
              option.id === selected.id
            }
            filterOptions={(options) => options}
            onInputChange={(_event, value, reason) => {
              if (reason === 'input') {
                setTeamId('');
                setTeams([]);
                setError(null);
                setTeamQuery(value);
              }
            }}
            onChange={(
              _event: SyntheticEvent,
              team: SportmonksTeamOption | null
            ) => setTeamId(team?.id.toString() ?? '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Team"
                helperText={
                  teamsLoading
                    ? 'Searching SportMonks…'
                    : teamQuery.trim().length < 2
                      ? 'Type at least 2 characters to search SportMonks.'
                      : undefined
                }
              />
            )}
          />
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={countryScopeOptions}
            value={countryScopes}
            autoHighlight
            groupBy={(option) =>
              option.kind === 'region' ? 'Regions' : 'Countries'
            }
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, selected) =>
              option.id === selected.id
            }
            onChange={(_event, options) => setCountryScopes(options)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Countries / regions"
                helperText="Select multiple scopes or leave blank for Global prominence."
              />
            )}
          />
          <TextField
            select
            label="Prominence value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          >
            {prominenceValues.map((prominenceValue) => (
              <MenuItem key={prominenceValue} value={prominenceValue}>
                {prominenceValue}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Review due"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Reason"
            required
            multiline
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => void save()}>
          Save prominence
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function formatTeamOption(team: SportmonksTeamOption): string {
  return `${team.name}${team.country ? ` · ${team.country}` : ''} (#${team.id})`;
}

function formatFixtureOption(fixture: MatchFixtureOption): string {
  const date = new Date(fixture.date).toLocaleString();
  return `${fixture.homeTeamName} — ${fixture.awayTeamName} · ${fixture.leagueName} · ${date} (#${fixture.id})`;
}

function HelpButton({ label, title }: { label: string; title: string }) {
  return (
    <Tooltip title={title} arrow>
      <IconButton size="small" aria-label={label}>
        <HelpOutline fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

function OverridesPanel({
  items,
  onEdit,
  onDelete,
}: {
  items: MatchRankingOverride[];
  onEdit: (item: MatchRankingOverride | null) => void;
  onDelete: (item: MatchRankingOverride) => void;
}) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => onEdit(null)}
        >
          Add override
        </Button>
      </Stack>
      {items.length === 0 ? (
        <EmptyCard text="No fixture overrides" />
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fixture</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Window</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {item.homeTeamName && item.awayTeamName
                        ? `${item.homeTeamName} — ${item.awayTeamName}`
                        : 'Unknown fixture'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      #{item.fixtureId}
                      {item.leagueName ? ` · ${item.leagueName}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.countryCode ?? 'Global'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.action}
                      color={
                        new Date(item.endsAt) <= new Date()
                          ? 'default'
                          : 'primary'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(item.startsAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      → {formatDate(item.endsAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell align="right">
                    <Button onClick={() => onEdit(item)}>Edit</Button>
                    <Button color="error" onClick={() => void onDelete(item)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}

function DeleteOverrideDialog({
  item,
  onClose,
  onDeleted,
}: {
  item: MatchRankingOverride;
  onClose: () => void;
  onDeleted: () => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!reason.trim()) return setError('Reason is required.');
    try {
      await deleteMatchRankingOverride(item.id, reason);
      await onDeleted();
    } catch (caught) {
      setError(messageOf(caught));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="delete-override-dialog-title"
    >
      <DialogTitle id="delete-override-dialog-title">
        Delete fixture {item.fixtureId} override
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Alert severity="warning">
            This stops the override from affecting future ranking snapshots.
          </Alert>
          <TextField
            label="Deletion reason"
            required
            multiline
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" onClick={() => void remove()}>
          Delete override
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function OverrideDialog({
  item,
  onClose,
  onSaved,
}: {
  item: MatchRankingOverride | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [fixtureId, setFixtureId] = useState(item?.fixtureId.toString() ?? '');
  const [countryScopes, setCountryScopes] = useState<CountryScopeOption[]>(() =>
    countryScopeSelection(item?.countryCode)
  );
  const [fixtures, setFixtures] = useState<MatchFixtureOption[]>([]);
  const [fixtureQuery, setFixtureQuery] = useState('');
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [action, setAction] = useState<MatchRankingOverrideAction>(
    item?.action ?? 'pin'
  );
  const [value, setValue] = useState(item?.value?.toString() ?? '');
  const [priority, setPriority] = useState(item?.priority?.toString() ?? '');
  const [startsAt, setStartsAt] = useState(toDateTimeInput(item?.startsAt));
  const [endsAt, setEndsAt] = useState(toDateTimeInput(item?.endsAt));
  const [reason, setReason] = useState(item?.reason ?? '');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const normalizedQuery = fixtureQuery.trim();
    if (normalizedQuery.length < 2) {
      setFixtures([]);
      setFixturesLoading(false);
      return;
    }
    let active = true;
    setFixturesLoading(true);
    getMatchFixtures(normalizedQuery)
      .then((options) => {
        if (active) setFixtures(options);
      })
      .catch((caught) => {
        if (active) setError(messageOf(caught));
      })
      .finally(() => {
        if (active) setFixturesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fixtureQuery]);
  const selectedFixture = useMemo(
    () =>
      fixtures.find((fixture) => fixture.id.toString() === fixtureId) ??
      (item
        ? {
            id: item.fixtureId,
            homeTeamName: item.homeTeamName || 'Unknown home team',
            awayTeamName: item.awayTeamName || 'Unknown away team',
            leagueName: item.leagueName || 'Unknown league',
            date: item.fixtureDate || item.startsAt,
          }
        : null),
    [fixtureId, fixtures, item]
  );
  async function save() {
    if (
      !Number.isSafeInteger(Number(fixtureId)) ||
      Number(fixtureId) <= 0 ||
      !startsAt ||
      !endsAt ||
      !reason.trim()
    )
      return setError('Fixture ID, time window, and reason are required.');
    if (Date.parse(`${endsAt}:00.000Z`) <= Date.parse(`${startsAt}:00.000Z`))
      return setError('End must be after start.');
    const input = {
      fixtureId: Number(fixtureId),
      action,
      value: value === '' ? null : Number(value),
      priority: priority === '' ? null : Number(priority),
      startsAt: `${startsAt}:00.000Z`,
      endsAt: `${endsAt}:00.000Z`,
      reason: reason.trim(),
    };
    try {
      const countryCodes = expandCountryScopes(countryScopes);
      const scopedInput = {
        ...input,
        ...(countryCodes.length > 0 ? { countryCodes } : { countryCode: null }),
      };
      if (item) await updateMatchRankingOverride(item.id, scopedInput);
      else await createMatchRankingOverride(scopedInput);
      await onSaved();
    } catch (caught) {
      setError(messageOf(caught));
    }
  }
  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="override-dialog-title"
    >
      <DialogTitle id="override-dialog-title">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          {item ? 'Edit fixture override' : 'Add fixture override'}
          <Stack direction="row">
            <HelpButton
              label="Fixture override scope help"
              title="Select one or more countries or regions. Regions expand to their countries and overlapping selections are deduplicated. Leave empty for Global. Scope uses the user's ranking country, not match location; a country-specific override takes precedence over Global."
            />
            <HelpButton
              label="Fixture override action help"
              title="Pin ranks ahead of non-pinned fixtures; lower non-negative Pin priority numbers rank first (blank becomes 0). Pin may bypass importance or classification, but not an invalid match status. Competition caps apply first, then over-cap fixtures may fill remaining empty slots. Exclude top removes the fixture from Top Matches. Adjust changes an eligible fixture by -20 to +20 points; it does not make an ineligible fixture eligible."
            />
            <HelpButton
              label="Fixture override time help"
              title="Active from Starts at (inclusive) until Ends at (exclusive), in UTC. Windows for the same fixture and country cannot overlap. Reason is required and recorded in the audit log."
            />
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Autocomplete
            options={fixtures}
            value={selectedFixture}
            loading={fixturesLoading}
            disabled={Boolean(item)}
            autoHighlight
            filterOptions={(options) => options}
            getOptionLabel={formatFixtureOption}
            isOptionEqualToValue={(option, selected) =>
              option.id === selected.id
            }
            onInputChange={(_event, value, reason) => {
              if (reason === 'input') {
                setFixtureId('');
                setFixtures([]);
                setError(null);
                setFixtureQuery(value);
              }
            }}
            onChange={(
              _event: SyntheticEvent,
              fixture: MatchFixtureOption | null
            ) => setFixtureId(fixture?.id.toString() ?? '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Fixture"
                helperText={
                  fixturesLoading
                    ? 'Searching matches…'
                    : fixtureQuery.trim().length < 2
                      ? 'Type a team or league name to find a match.'
                      : undefined
                }
              />
            )}
          />
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={countryScopeOptions}
            value={countryScopes}
            autoHighlight
            groupBy={(option) =>
              option.kind === 'region' ? 'Regions' : 'Countries'
            }
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, selected) =>
              option.id === selected.id
            }
            onChange={(_event, options) => setCountryScopes(options)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Countries / regions"
                helperText="Select multiple scopes or leave blank for Global."
              />
            )}
          />
          <TextField
            select
            label="Action"
            value={action}
            onChange={(e) =>
              setAction(e.target.value as MatchRankingOverrideAction)
            }
          >
            <MenuItem value="pin">pin</MenuItem>
            <MenuItem value="exclude_top">exclude_top</MenuItem>
            <MenuItem value="adjust">adjust</MenuItem>
          </TextField>
          {action === 'adjust' ? (
            <TextField
              label="Adjustment value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : null}
          {action === 'pin' ? (
            <TextField
              label="Pin priority"
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
          ) : null}
          <TextField
            label="Starts at"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="UTC"
          />
          <TextField
            label="Ends at"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="UTC"
          />
          <TextField
            label="Reason"
            required
            multiline
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            inputProps={{ 'aria-label': 'Reason' }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => void save()}>
          Save override
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ConfigurationsPanel({
  items,
  onCreate,
  onActivate,
}: {
  items: MatchRankingConfiguration[];
  onCreate: () => void;
  onActivate: (item: MatchRankingConfiguration) => void;
}) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="flex-end">
        <Button variant="contained" startIcon={<Add />} onClick={onCreate}>
          New configuration
        </Button>
      </Stack>
      {items.length === 0 ? (
        <EmptyCard text="No ranking configurations" />
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <CardContent>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Stack direction="row" spacing={1}>
                    <Typography variant="h6">{item.version}</Typography>
                    {item.active ? (
                      <Chip label="Active" color="success" size="small" />
                    ) : null}
                  </Stack>
                  <Typography color="text.secondary">
                    Experiment {item.experimentId} · treatment{' '}
                    {item.treatmentPercentage}% · countries{' '}
                    {item.countryAllowlist.join(', ') || 'all'}
                  </Typography>
                  <Typography variant="body2">
                    Created {formatDate(item.createdAt)} · activated{' '}
                    {formatDate(item.activatedAt)}
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      bgcolor: 'action.hover',
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    {JSON.stringify(item.rules, null, 2)}
                  </Box>
                </Box>
                {!item.active ? (
                  <Button variant="outlined" onClick={() => onActivate(item)}>
                    Activate
                  </Button>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
}

function ConfigurationDialog({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [version, setVersion] = useState('');
  const [rules, setRules] = useState('{}');
  const [countries, setCountries] = useState('');
  const [percentage, setPercentage] = useState('0');
  const [experiment, setExperiment] = useState('');
  const [salt, setSalt] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  async function save() {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rules) as Record<string, unknown>;
    } catch {
      return setError('Rules must be valid JSON.');
    }
    if (!version.trim() || !experiment.trim() || !salt.trim() || !reason.trim())
      return setError('Version, experiment, salt, and reason are required.');
    const treatmentPercentage = Number(percentage);
    if (
      !Number.isInteger(treatmentPercentage) ||
      treatmentPercentage < 0 ||
      treatmentPercentage > 100
    )
      return setError('Treatment percentage must be from 0 to 100.');
    try {
      await createMatchRankingConfiguration({
        version: version.trim(),
        rules: parsed,
        countryAllowlist: countries
          .split(',')
          .map((value) => value.trim().toUpperCase())
          .filter(Boolean),
        treatmentPercentage,
        experimentId: experiment.trim(),
        assignmentSalt: salt,
        reason: reason.trim(),
      });
      await onSaved();
    } catch (caught) {
      setError(messageOf(caught));
    }
  }
  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="configuration-dialog-title"
    >
      <DialogTitle id="configuration-dialog-title">
        New ranking configuration
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
          <TextField
            label="Rules JSON"
            multiline
            minRows={6}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
          />
          <TextField
            label="Country allowlist"
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            helperText="Comma-separated ISO country codes; blank means all countries."
          />
          <TextField
            label="Treatment percentage"
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
          />
          <TextField
            label="Experiment ID"
            value={experiment}
            onChange={(e) => setExperiment(e.target.value)}
          />
          <TextField
            label="Assignment salt"
            value={salt}
            onChange={(e) => setSalt(e.target.value)}
          />
          <TextField
            label="Reason"
            required
            multiline
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => void save()}>
          Create configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ActivationDialog({
  item,
  onClose,
  onActivated,
}: {
  item: MatchRankingConfiguration;
  onClose: () => void;
  onActivated: () => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  async function activate() {
    if (!reason.trim()) return setError('Reason is required.');
    try {
      await activateMatchRankingConfiguration(item.id, reason);
      await onActivated();
    } catch (caught) {
      setError(messageOf(caught));
    }
  }
  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="activation-dialog-title"
    >
      <DialogTitle id="activation-dialog-title">
        Activate {item.version}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Alert severity="warning">
            Activation replaces the currently active version for future ranking
            snapshots.
          </Alert>
          <TextField
            label="Activation reason"
            required
            multiline
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => void activate()}
        >
          Activate configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PreviewPanel({
  onError,
}: {
  onError: (message: string | null) => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timezone, setTimezone] = useState('Etc/UTC');
  const [country, setCountry] = useState('');
  const [preview, setPreview] = useState<MatchRankingPreview | null>(null);
  const [loading, setLoading] = useState(false);
  async function run() {
    setLoading(true);
    onError(null);
    try {
      setPreview(
        await previewMatchRanking({
          date,
          timezone: timezone.trim(),
          countryCode: normalizedCountry(country),
        })
      );
    } catch (caught) {
      onError(messageOf(caught));
    } finally {
      setLoading(false);
    }
  }
  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ md: 'flex-start' }}
          >
            <TextField
              label="Preview date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="IANA timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              helperText="For example Europe/Chisinau"
            />
            <TextField
              label="Preview country code"
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
              inputProps={{ maxLength: 2 }}
            />
            <Button
              variant="contained"
              disabled={loading || !date || !timezone.trim()}
              onClick={() => void run()}
              sx={{ minHeight: 56, whiteSpace: 'nowrap' }}
            >
              Run preview
            </Button>
          </Stack>
        </CardContent>
      </Card>
      {preview ? (
        <>
          <Alert severity="success">
            Version {preview.rankingVersion} · generated{' '}
            {formatDate(preview.generatedAt)}
          </Alert>
          <Typography variant="h6">Top Matches</Typography>
          {preview.topMatches.length === 0 ? (
            <EmptyCard text="No eligible Top Matches" />
          ) : (
            preview.topMatches.map((fixture, index) => (
              <PreviewFixtureCard
                key={fixture.fixtureId}
                fixture={fixture}
                position={index + 1}
              />
            ))
          )}
          <Typography variant="h6">League groups</Typography>
          {preview.groups.map((group) => (
            <Card key={group.competitionId}>
              <CardContent>
                <Typography fontWeight={700}>
                  {group.competitionName ??
                    `Competition ${group.competitionId}`}{' '}
                  · group score {group.groupScore}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {group.followed ? 'Followed group' : 'Not followed'} ·{' '}
                  {group.fixtures.length} fixtures
                </Typography>
                {group.fixtures.length > 0 ? (
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {group.fixtures.map((fixture, index) => (
                      <PreviewFixtureCard
                        key={fixture.fixtureId}
                        fixture={fixture}
                        position={index + 1}
                      />
                    ))}
                  </Stack>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </>
      ) : null}
    </Stack>
  );
}

function PreviewFixtureCard({
  fixture,
  position,
}: {
  fixture: MatchRankingPreview['topMatches'][number];
  position: number;
}) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {fixture.homeTeamName && fixture.awayTeamName
                ? `${fixture.homeTeamName} vs ${fixture.awayTeamName}`
                : `Fixture ${fixture.fixtureId}`}
            </Typography>
            <Chip
              label={`#${position} · score ${fixture.topScore}`}
              color={fixture.eligible ? 'success' : 'default'}
            />
          </Stack>
          <Typography color="text.secondary">
            Competition {fixture.competitionId} · kickoff{' '}
            {formatDate(fixture.kickoff)}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(fixture.components).map(([key, value]) => (
              <Chip
                key={key}
                label={`${key} ${value}`}
                size="small"
                variant="outlined"
              />
            ))}
            <Chip label={`Importance ${fixture.importance}`} size="small" />
          </Stack>
          {fixture.tieBreak ? (
            <Typography variant="body2">
              Tie-break: {fixture.tieBreak}
            </Typography>
          ) : null}
          {fixture.exclusionReason ? (
            <Alert severity="warning">{fixture.exclusionReason}</Alert>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function AuditPanel({ items }: { items: MatchRankingAuditEvent[] }) {
  return (
    <Stack spacing={2}>
      {items.length === 0 ? (
        <EmptyCard text="No ranking audit events" />
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <CardContent>
              <Stack spacing={1}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                >
                  <Typography fontWeight={700}>
                    {item.targetType} · {item.targetId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(item.createdAt)}
                  </Typography>
                </Stack>
                <Typography>{item.reason}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.actor}
                </Typography>
                <Divider />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <AuditValue label="Before" value={item.beforeValue} />
                  <AuditValue label="After" value={item.afterValue} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
}

function AuditValue({
  label,
  value,
}: {
  label: string;
  value: Record<string, unknown> | null;
}) {
  return (
    <Box flex={1} minWidth={0}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box
        component="pre"
        sx={{
          m: 0,
          mt: 0.5,
          p: 1,
          bgcolor: 'action.hover',
          borderRadius: 1,
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
        }}
      >
        {JSON.stringify(value, null, 2)}
      </Box>
    </Box>
  );
}
function EmptyCard({ text }: { text: string }) {
  return (
    <Card>
      <CardContent sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">{text}</Typography>
      </CardContent>
    </Card>
  );
}
function normalizedCountry(value: string): string | null {
  const normalized = value.trim().toUpperCase();
  return normalized || null;
}
function reviewStateLabel(value: string): string {
  if (value === 'pending_enrichment') return 'Waiting for enrichment';
  if (value === 'pending_review') return 'Ready for review';
  if (value === 'reviewed') return 'Reviewed';
  return value;
}
function attentionReason(item: MatchRankingCompetition): string {
  const missing: string[] = [];
  if (!item.metadataLastSuccessAt) missing.push('successful enrichment');
  if (item.providerCategory == null) missing.push('provider category');
  if (item.scope === 'unknown') missing.push('competition scope');
  return `Missing: ${missing.join(', ') || 'required metadata'}.`;
}
function formatDate(value?: string | null): string {
  if (!value) return 'never';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}
function toDateInput(value?: string | null): string {
  return value ? value.slice(0, 10) : '';
}
function toDateTimeInput(value?: string | null): string {
  return value ? value.slice(0, 16) : '';
}
function messageOf(caught: unknown): string {
  return caught instanceof Error ? caught.message : 'Request failed';
}
