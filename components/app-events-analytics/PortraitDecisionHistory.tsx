'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import {
  getUserPortraitDecisionHistory,
  exportUserPortraitDecisions,
  type PortraitDecisionDelivery,
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
  viewedSnapshotId?: string | null;
}) {
  const [history, setHistory] = useState<History | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [replay, setReplay] = useState<PortraitDecisionReplay | null>(null);
  const epoch = useRef(0);
  useEffect(() => {
    const current = ++epoch.current;
    setHistory(null);
    setError(null);
    setReplay(null);
    setBusy(null);
    setExporting(false);
    setExportNote(null);
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

  const downloadAll = async () => {
    const current = epoch.current;
    setExporting(true);
    setExportNote(null);
    setError(null);
    try {
      const data = await exportUserPortraitDecisions(userId);
      if (current !== epoch.current) return;
      if (data.status !== 'available' || data.userId !== userId)
        throw new Error('Export is unavailable for this account.');
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      );
      const link = document.createElement('a');
      try {
        link.href = url;
        link.download = `user-decisions-${encodeURIComponent(userId)}-${data.exportedAt.slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
      } finally {
        link.remove();
        URL.revokeObjectURL(url);
      }
      setExportNote(`Downloaded ${data.total} saved decisions.`);
    } catch (e) {
      if (current === epoch.current)
        setError(
          e instanceof Error ? e.message : 'Could not export saved decisions.'
        );
    } finally {
      if (current === epoch.current) setExporting(false);
    }
  };

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
      <Typography variant="body2" color="text.secondary">
        Saved recommendations, proposed messages and actual sending records.
        Opening this history does not call AI or send anything.
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={2}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="body2" fontWeight={600}>
          Latest 20 saved decisions · JSON includes all retained decisions for
          this user
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            disabled={loading || exporting || history?.status !== 'available'}
            onClick={() => void downloadAll()}
          >
            {exporting ? 'Preparing JSON…' : 'Download all decisions (JSON)'}
          </Button>
          <Button
            variant="outlined"
            disabled={loading || Boolean(busy) || exporting}
            onClick={() => setRevision((v) => v + 1)}
          >
            Refresh saved decisions
          </Button>
        </Stack>
      </Stack>
      {viewedSnapshotId ? (
        <Box component="details">
          <Typography
            component="summary"
            variant="caption"
            color="text.secondary"
            sx={{ cursor: 'pointer' }}
          >
            Viewed portrait context
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflowWrap: 'anywhere' }}
          >
            Portrait currently viewed: {viewedSnapshotId}. Each historic
            decision below keeps its own snapshot, seven-day window and
            current-owner cutoff.
          </Typography>
        </Box>
      ) : null}
      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center" role="status">
          <CircularProgress size={18} />
          <Typography>Loading saved decisions…</Typography>
        </Stack>
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {exportNote ? (
        <Typography role="status" variant="body2" color="text.secondary">
          {exportNote}
        </Typography>
      ) : null}
      {history?.status === 'restricted' ? (
        <Alert severity="warning">
          Decision evidence is unavailable following the verified processing
          objection.
        </Alert>
      ) : null}
      {history?.status === 'available' && !history.items.length ? (
        <Typography color="text.secondary">
          No saved decisions yet. Opening this view does not start analysis.
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
        borderRadius: '12px',
        bgcolor: 'background.paper',
        p: { xs: 2, md: 2.5 },
        minWidth: 0,
      }}
    >
      <Stack
        direction="row"
        gap={1}
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        useFlexGap
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {decisionTitle(item)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {stamp(item.createdAt)}
          </Typography>
        </Box>
        <Chip
          size="small"
          variant="outlined"
          color={
            item.status === 'completed' && item.source === 'model'
              ? 'primary'
              : 'default'
          }
          label={
            item.status === 'pending'
              ? 'Evaluation in progress'
              : item.source === 'model'
                ? 'Selected by AI'
                : 'Selected by rules'
          }
        />
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(0, 1fr) minmax(0, 1fr)',
          },
          gap: 2,
          mt: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Why this decision
          </Typography>
          <Typography variant="body2">
            {reasonText(item.selection.reasonCode)}
          </Typography>
          {item.source === 'baseline' && item.status === 'completed' ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {item.model.status === 'not_requested'
                ? 'AI was not called; the saved choice follows rules.'
                : 'AI did not return a usable selection; the saved choice follows rules.'}
            </Typography>
          ) : null}
          {item.status === 'pending' ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Evaluation is not complete; this is a provisional choice.
            </Typography>
          ) : null}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Proposed channel: {channelName(candidate.proposedChannel)}.
          </Typography>
        </Box>
        <Box
          sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2, minWidth: 0 }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Was it sent?
          </Typography>
          {item.deliveries === undefined ? (
            <>
              <Chip
                size="small"
                label="Sending status unavailable"
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This history response does not include delivery records. A
                proposed channel is not proof of sending.
              </Typography>
            </>
          ) : item.deliveries.length ? (
            <Stack spacing={1.5}>
              {item.deliveries.map((delivery) => {
                const result = deliveryDescription(delivery);
                return (
                  <Box key={delivery.id}>
                    <Chip
                      size="small"
                      label={result.title}
                      color={result.color}
                      variant="outlined"
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.75 }}
                    >
                      {channelName(delivery.channel)} · {result.detail}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <>
              <Chip size="small" label="No sending record" variant="outlined" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No live delivery is linked to this decision. The recommendation
                alone does not confirm contact.
              </Typography>
            </>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          mt: 2,
          p: 2,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          minWidth: 0,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Proposed message
        </Typography>
        {candidate.copy ? (
          <>
            <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
              {candidate.copy.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                maxHeight: 240,
                overflowY: 'auto',
              }}
            >
              {candidate.copy.body}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No message proposed.
          </Typography>
        )}
      </Box>
      <Box
        component="details"
        sx={{
          mt: 2,
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: '8px',
          '& summary': { cursor: 'pointer' },
        }}
      >
        <Typography component="summary" variant="body2" color="primary.main">
          Technical details
        </Typography>
        <Typography variant="body2" sx={{ mt: 1.5 }}>
          Model: {item.model.model} · {label(item.model.status)} ·{' '}
          {item.model.latencyMs} ms.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tokens: {item.model.inputTokens ?? 'unknown'} input /{' '}
          {item.model.outputTokens ?? 'unknown'} output.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Saved reason code: {item.selection.reasonCode}. Validation:{' '}
          {item.validator.accepted
            ? 'accepted'
            : item.validator.reasons.map(label).join(', ')}
          .
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Recorded channel: {label(item.selection.channel)} · disposition:{' '}
          {label(candidate.disposition)}. Evaluation mode: {item.mode}; the read
          API does not execute actions.
        </Typography>
        {item.deliveries?.length ? (
          <Box
            component="pre"
            sx={{ fontSize: 12, overflowX: 'auto', maxHeight: 240, mt: 1.5 }}
          >
            {JSON.stringify(item.deliveries, null, 2)}
          </Box>
        ) : null}
        <TableContainer sx={{ mt: 1 }}>
          <Table
            size="small"
            aria-label="Saved decision evidence"
            sx={{
              tableLayout: 'fixed',
              '& td': {
                overflowWrap: 'anywhere',
                verticalAlign: 'top',
                fontSize: 12,
                py: 1,
              },
            }}
          >
            <TableBody>
              {[
                ['Decision', `${item.id} · trigger: ${item.triggerKey}`],
                [
                  'Pinned snapshot',
                  `${item.snapshotId} · facts as of ${stamp(item.input.snapshot.asOf)} · ${item.input.snapshot.featureVersion} · schema ${item.input.snapshot.schemaVersion}`,
                ],
                [
                  'Decision window',
                  `${window.days} days, ${stamp(window.from)} — ${stamp(window.to)} (exclusive)`,
                ],
                [
                  'Current owner checks',
                  `${stamp(item.input.current.capturedAt)} · access ${item.input.current.access.authorization} · pending checkout ${String(item.input.current.pendingCommerce)} · app-active evidence ${item.input.current.activeInApp === null ? 'unknown' : String(item.input.current.activeInApp)}`,
                ],
                [
                  'Existing email preference evidence',
                  `${item.input.current.preferences.effectivePredictions}; revision ${item.input.current.preferences.revision}. This does not enable a new channel.`,
                ],
                [
                  'Opportunity',
                  `${candidate.opportunityId} · material ${item.selection.materialVersion} · template ${item.selection.templateId} · locale ${item.selection.locale}`,
                ],
                [
                  'Evaluation window',
                  `${stamp(item.selection.dispatchAt)} — ${stamp(item.selection.expiresAt)}. This is decision validity, not a new News expiry.`,
                ],
                ['Destination reference', candidate.destination ?? 'none'],
                [
                  'Versions',
                  Object.entries(item.input.versions)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(' · '),
                ],
                [
                  'Provider response',
                  `${item.model.responseId ?? 'none'} · store=false · ${label(item.model.retention)}`,
                ],
                [
                  'Rule comparison',
                  `${item.baseline.candidateId} · ${label(item.baseline.reasonCode)}. Same candidate/template/window contract as the model.`,
                ],
                [
                  'Exclusions',
                  item.input.exclusions.map(label).join(' · ') ||
                    'none recorded',
                ],
              ].map(([name, value]) => (
                <TableRow key={name}>
                  <TableCell
                    sx={{
                      width: { xs: '38%', md: '30%' },
                      color: 'text.secondary',
                    }}
                  >
                    {name}
                  </TableCell>
                  <TableCell>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          variant="outlined"
          size="small"
          disabled={busy || item.status === 'pending'}
          onClick={onReplay}
          sx={{ mt: 1 }}
        >
          Replay frozen validation
        </Button>
      </Box>
    </Box>
  );
}

function decisionTitle(item: PortraitShadowDecision) {
  const candidate = item.selectedCandidate;
  if (candidate.disposition === 'defer' || candidate.kind === 'defer')
    return 'Wait before contacting the user';
  if (candidate.disposition === 'no_action' || candidate.kind === 'no_action')
    return 'Do not contact the user';
  return (
    (
      {
        news: 'Recommend a news item',
        owned_access: 'Recommend using existing access',
        commercial: 'Recommend an access offer',
      } as Record<string, string>
    )[candidate.kind] ?? 'Recommend a message'
  );
}
function reasonText(code: string) {
  return (
    (
      {
        relevant_news: "A news item matched the user's recorded interests.",
        owned_value: 'The user already has access to this content or feature.',
        premium_intent:
          'Recorded product activity indicates interest in premium content.',
        policy_exclusion:
          'Contact was excluded by the applicable communication rules.',
        no_opportunity: 'No eligible recommendation was available at the time.',
        stale_snapshot:
          'The saved portrait was too old for a new recommendation.',
        sparse_history:
          'There was not enough recorded activity for a recommendation.',
        pending_checkout: 'A checkout was still in progress.',
        already_consumed: 'The relevant content had already been consumed.',
        model_silence: 'The AI selected no contact.',
      } as Record<string, string>
    )[code] ??
    'No plain-language explanation is available for this saved reason. The original code is in Technical details.'
  );
}
function channelName(channel: string) {
  return (
    (
      {
        in_app: 'In-app message',
        push: 'Push notification',
        email: 'Email',
        none: 'No channel',
      } as Record<string, string>
    )[channel] ?? label(channel)
  );
}
function deliveryDescription(d: PortraitDecisionDelivery): {
  title: string;
  detail: string;
  color: 'default' | 'success' | 'warning' | 'error';
} {
  if (d.openedAt || d.pushOpenedAt)
    return {
      title: 'Opened by user',
      detail: `Opening recorded ${stamp(d.openedAt ?? d.pushOpenedAt)}.`,
      color: 'success',
    };
  if (
    d.emailSubmissionState === 'bounced' ||
    d.emailSubmissionState === 'dropped'
  )
    return {
      title:
        d.emailSubmissionState === 'bounced'
          ? 'Email bounced'
          : 'Email dropped',
      detail: 'The provider reported that delivery did not complete.',
      color: 'error',
    };
  if (d.emailSubmissionState === 'delivered')
    return {
      title: 'Delivery confirmed',
      detail: `Provider confirmation ${stamp(d.providerFinalEventAt)}; reading is not confirmed.`,
      color: 'success',
    };
  if (d.emailSubmissionState === 'ambiguous')
    return {
      title: 'Sending unconfirmed',
      detail: 'The send attempt has an uncertain outcome.',
      color: 'warning',
    };
  if (d.status === 'shown' || d.status === 'dismissed')
    return {
      title: d.status === 'shown' ? 'Shown in app' : 'Dismissed in app',
      detail:
        'The app recorded this display outcome; it does not prove the message was read.',
      color: 'success',
    };
  if (d.status === 'failed' || d.emailSubmissionState === 'permanent_failure')
    return {
      title: 'Send failed',
      detail: 'The delivery record reports a failed attempt.',
      color: 'error',
    };
  if (d.status === 'skipped')
    return {
      title: 'Not sent — skipped',
      detail: 'The delivery was skipped by the sending rules.',
      color: 'default',
    };
  if (d.status === 'available')
    return {
      title: 'Available in app',
      detail: 'Ready for display; showing it to the user is not yet confirmed.',
      color: 'default',
    };
  if (d.sentAt || d.status === 'sent')
    return {
      title: 'Sent',
      detail: `${d.sentAt ? `Sent ${stamp(d.sentAt)}. ` : ''}Recipient receipt and viewing are not confirmed.`,
      color: 'success',
    };
  if (d.providerAcceptedAt || d.emailSubmissionState === 'accepted')
    return {
      title: 'Accepted by provider',
      detail: `${d.providerAcceptedAt ? stamp(d.providerAcceptedAt) + '. ' : ''}Recipient delivery is not confirmed.`,
      color: 'default',
    };
  if (d.status === 'pending')
    return {
      title: 'Queued',
      detail: 'Waiting for the delivery worker.',
      color: 'default',
    };
  return {
    title: 'Sending unconfirmed',
    detail:
      'A delivery attempt exists, but there is no confirmed sending outcome.',
    color: 'warning',
  };
}
