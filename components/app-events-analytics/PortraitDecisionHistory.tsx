'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import {
  getUserPortraitDecisionHistory,
  replayUserPortraitDecision,
  type PortraitDecisionHistory as History,
  type PortraitDecisionReplay,
  type PortraitShadowDecision,
} from '@/lib/api/user-portrait';

const label = (text: string) => text.replace(/_/g, ' ');
const stamp = (text: string | null) =>
  text
    ? new Date(text).toLocaleString('en-GB', {
        timeZone: 'UTC',
        dateStyle: 'medium',
        timeStyle: 'short',
      }) + ' UTC'
    : 'Pending';

/** Presents saved decisions separately from the selected portrait; reads and replay never run a model. */
export function PortraitDecisionHistory({
  userId,
  viewedSnapshotId,
}: {
  userId: string;
  viewedSnapshotId: string;
}) {
  const [history, setHistory] = useState<History | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [replay, setReplay] = useState<PortraitDecisionReplay | null>(null);
  const epoch = useRef(0);
  useEffect(() => {
    const current = ++epoch.current;
    setHistory(null);
    setError(null);
    setReplay(null);
    setBusy(null);
    setLoading(true);
    void getUserPortraitDecisionHistory(userId)
      .then((value) => {
        if (current === epoch.current) setHistory(value);
      })
      .catch((e: unknown) => {
        if (current === epoch.current)
          setError(
            e instanceof Error ? e.message : 'Could not load decisions.'
          );
      })
      .finally(() => {
        if (current === epoch.current) setLoading(false);
      });
    return () => {
      if (current === epoch.current) epoch.current = current + 1;
    };
  }, [userId, revision]);

  const runReplay = async (id: string) => {
    const current = epoch.current;
    setBusy(id);
    setError(null);
    setReplay(null);
    try {
      const value = await replayUserPortraitDecision(userId, id);
      if (current === epoch.current) setReplay(value);
    } catch (e) {
      if (current === epoch.current)
        setError(e instanceof Error ? e.message : 'Could not replay evidence.');
    } finally {
      if (current === epoch.current) setBusy(null);
    }
  };
  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Reading saved decisions and replaying frozen validation do not call a
        model or execute an action.
      </Alert>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ overflowWrap: 'anywhere' }}
      >
        Portrait currently viewed: {viewedSnapshotId}. Each historic decision
        below keeps its own snapshot, seven-day window and current-owner cutoff.
      </Typography>
      <Button
        variant="outlined"
        disabled={loading || Boolean(busy)}
        onClick={() => setRevision((v) => v + 1)}
        sx={{ alignSelf: 'flex-start' }}
      >
        Refresh saved decisions
      </Button>
      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center" role="status">
          <CircularProgress size={18} />
          <Typography>Loading saved decisions…</Typography>
        </Stack>
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {history?.status === 'restricted' ? (
        <Alert severity="warning">
          Decision evidence is unavailable following the verified processing
          objection.
        </Alert>
      ) : null}
      {history?.status === 'available' && !history.items.length ? (
        <Typography color="text.secondary">
          No saved shadow decisions yet. Opening this view does not start
          analysis.
        </Typography>
      ) : null}
      {history?.items.map((item) => (
        <Decision
          key={item.id}
          item={item}
          busy={busy !== null}
          onReplay={() => void runReplay(item.id)}
        />
      ))}
      {replay ? (
        <Alert
          severity={
            replay.status === 'replayed' && replay.validator?.accepted
              ? 'success'
              : 'warning'
          }
        >
          {replay.status === 'replayed'
            ? 'Frozen baseline and reference validation replayed. No model was called and no action was executed.'
            : 'The saved policy version is unavailable for replay; historic evidence is unchanged.'}
        </Alert>
      ) : null}
    </Stack>
  );
}

/** Shows controlled references/reasons and exact cutoffs, never treating unsupported model prose as a diagnosis. */
function Decision({
  item,
  busy,
  onReplay,
}: {
  item: PortraitShadowDecision;
  busy: boolean;
  onReplay: () => void;
}) {
  const candidate = item.selectedCandidate,
    window = item.input.facts.selectedWindow;
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: { xs: 1.5, md: 2 },
        minWidth: 0,
      }}
    >
      <Stack
        direction="row"
        gap={1}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
      >
        <Typography fontWeight={700}>{label(candidate.kind)}</Typography>
        <Chip
          size="small"
          label={
            item.source === 'model'
              ? 'Validated model selection'
              : 'Rule baseline'
          }
          variant="outlined"
        />
        <Chip
          size="small"
          label={
            item.status === 'pending'
              ? 'Pending evaluation'
              : label(candidate.disposition)
          }
        />
      </Stack>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Reason: {label(item.selection.reasonCode)} · {stamp(item.createdAt)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Recorded channel: {label(item.selection.channel)} · Proposed surface:{' '}
        {label(candidate.proposedChannel)}.
      </Typography>
      {!item.validator.accepted ? (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Model/material validation used the safe baseline:{' '}
          {item.validator.reasons.map(label).join(', ')}.
        </Alert>
      ) : null}
      {candidate.copy ? (
        <Box sx={{ mt: 2 }}>
          <Typography fontWeight={600}>{candidate.copy.title}</Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
          >
            {candidate.copy.body}
          </Typography>
        </Box>
      ) : null}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Model: {item.model.model} · {label(item.model.status)} ·{' '}
        {item.model.latencyMs} ms. Tokens: {item.model.inputTokens ?? 'unknown'}{' '}
        input / {item.model.outputTokens ?? 'unknown'} output.
      </Typography>
      <Box
        component="details"
        sx={{ mt: 2, '& summary': { cursor: 'pointer' } }}
      >
        <Typography component="summary" variant="body2" color="primary.main">
          Exact decision evidence
        </Typography>
        <Stack spacing={1} sx={{ mt: 1, overflowWrap: 'anywhere' }}>
          <Typography variant="caption">
            Decision: {item.id} · trigger: {item.triggerKey}
          </Typography>
          <Typography variant="caption">
            Pinned snapshot: {item.snapshotId} · facts as of{' '}
            {stamp(item.input.snapshot.asOf)} ·{' '}
            {item.input.snapshot.featureVersion} · schema{' '}
            {item.input.snapshot.schemaVersion}
          </Typography>
          <Typography variant="caption">
            Decision window: {window.days} days, {stamp(window.from)} —{' '}
            {stamp(window.to)} (exclusive).
          </Typography>
          <Typography variant="caption">
            Current owner checks: {stamp(item.input.current.capturedAt)} ·
            access {item.input.current.access.authorization} · pending checkout{' '}
            {String(item.input.current.pendingCommerce)} · app-active evidence{' '}
            {item.input.current.activeInApp === null
              ? 'unknown'
              : String(item.input.current.activeInApp)}
            .
          </Typography>
          <Typography variant="caption">
            Existing email preference evidence:{' '}
            {item.input.current.preferences.effectivePredictions}; revision{' '}
            {item.input.current.preferences.revision}. This does not enable a
            new channel.
          </Typography>
          <Typography variant="caption">
            Opportunity: {candidate.opportunityId} · material{' '}
            {item.selection.materialVersion} · template{' '}
            {item.selection.templateId} · locale {item.selection.locale}
          </Typography>
          <Typography variant="caption">
            Evaluation window: {stamp(item.selection.dispatchAt)} —{' '}
            {stamp(item.selection.expiresAt)}. This is decision validity, not a
            new News expiry.
          </Typography>
          <Typography variant="caption">
            Destination reference: {candidate.destination ?? 'none'}
          </Typography>
          <Typography variant="caption">
            Versions:{' '}
            {Object.entries(item.input.versions)
              .map(([key, value]) => `${key}: ${value}`)
              .join(' · ')}
          </Typography>
          <Typography variant="caption">
            Provider response: {item.model.responseId ?? 'none'} · store=false ·{' '}
            {label(item.model.retention)}
          </Typography>
          <Divider />
          <Typography variant="caption">
            Rule comparison: {item.baseline.candidateId} ·{' '}
            {label(item.baseline.reasonCode)}. Same candidate/template/window
            contract as the model.
          </Typography>
          <Typography variant="caption">
            Exclusions:{' '}
            {item.input.exclusions.map(label).join(' · ') || 'none recorded'}
          </Typography>
        </Stack>
      </Box>
      <Button
        size="small"
        disabled={busy || item.status === 'pending'}
        onClick={onReplay}
        sx={{ mt: 1 }}
      >
        Replay frozen validation
      </Button>
    </Box>
  );
}
