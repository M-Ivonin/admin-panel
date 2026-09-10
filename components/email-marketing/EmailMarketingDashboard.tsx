'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
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
  FormControlLabel,
  MenuItem,
  Portal,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Email, Refresh } from '@mui/icons-material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { EmailPublicationAnalyticsPanel } from '@/components/email-marketing/EmailPublicationAnalyticsPanel';
import { downloadEmailAnalyticsJson } from '@/components/email-marketing/analytics-export';
import { RetentionStage } from '@/lib/api/users';
import type {
  CampaignAudienceDefinition,
  CampaignLocale,
} from '@/modules/campaigns/contracts';
import type {
  EmailAudienceSource,
  EmailContentByLocale,
  EmailMarketingRepository,
  EmailPublication,
  EmailPublicationAnalytics,
  EmailPublicationInput,
  EmailPublicationState,
  EmailPublicationTopic,
  LocalizedString,
  PartnerMarketProjection,
  PredictionReference,
  SendGridTemplateReference,
} from '@/modules/email-marketing/contracts';
import {
  createEmailPublicationIdempotencyKey,
  emailMarketingRepository,
} from '@/modules/email-marketing/repository';

const locales: CampaignLocale[] = ['en', 'es', 'pt'];
const topics: Array<{ value: EmailPublicationTopic; label: string }> = [
  { value: 'sirbro_predictions', label: 'SirBro prediction' },
  {
    value: 'sirbro_predictions_with_partner_offer',
    label: 'SirBro prediction + partner offer',
  },
  { value: 'sirbro_product_updates', label: 'SirBro product update' },
  { value: 'betting_partner_offers', label: 'Betting partner offer' },
];
const retentionStages = Object.values(RetentionStage);
const terminalStates = new Set<EmailPublicationState>([
  'sent',
  'completed_no_send',
  'sent_with_failures',
  'cancelled',
  'failed',
  'superseded',
]);

type EditorDraft = {
  name: string;
  topic: EmailPublicationTopic;
  sendGridTemplateId: string;
  sendGridTemplateVersion: string;
  frequencyCapHours: string;
  audience: CampaignAudienceDefinition;
  contentByLocale: EmailContentByLocale;
  predictionKey: string;
  productCtaEnabled: boolean;
  productCtaUrl: string;
  productCtaLabels: LocalizedString;
  partnerMarketConfigId: string;
  offerHeadlineByLocale: LocalizedString;
  offerBodyByLocale: LocalizedString;
  materialTermsByLocale: LocalizedString;
  offerExpiresAt: string;
};

type Confirmation = {
  action: 'pause' | 'resume' | 'cancel' | 'sendNow';
  title: string;
  confirmLabel: string;
};

type ActionNotification = {
  severity: 'success' | 'error';
  message: string;
};

export function EmailMarketingDashboard({
  repository = emailMarketingRepository,
}: {
  repository?: EmailMarketingRepository;
}) {
  const [detailTab, setDetailTab] = useState('Overview');
  const [editing, setEditing] = useState(false);
  const [items, setItems] = useState<EmailPublication[]>([]);
  const [selected, setSelected] = useState<EmailPublication | null>(null);
  const [analytics, setAnalytics] = useState<EmailPublicationAnalytics | null>(
    null
  );
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [acknowledgementNote, setAcknowledgementNote] = useState('');
  const [draft, setDraft] = useState<EditorDraft | null>(null);
  const [editorDirty, setEditorDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionNotification, setActionNotification] =
    useState<ActionNotification | null>(null);
  const [estimate, setEstimate] = useState<{
    reachableUsers: number;
    warnings: string[];
  } | null>(null);
  const [predictions, setPredictions] = useState<PredictionReference[]>([]);
  const [partners, setPartners] = useState<PartnerMarketProjection[]>([]);
  const [audienceSources, setAudienceSources] = useState<EmailAudienceSource[]>(
    []
  );
  const [sendGridTemplates, setSendGridTemplates] = useState<
    SendGridTemplateReference[]
  >([]);
  const [sendGridCatalogUnavailable, setSendGridCatalogUnavailable] =
    useState(false);
  const [previewLocale, setPreviewLocale] = useState<CampaignLocale>('en');
  const [preview, setPreview] = useState<Awaited<
    ReturnType<EmailMarketingRepository['preview']>
  > | null>(null);
  const [scheduleLocal, setScheduleLocal] = useState('');
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const createKey = useRef(createEmailPublicationIdempotencyKey());
  const groupedItems = groupPublications(items);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await repository.list());
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  async function openPublication(item: EmailPublication) {
    setBusy(true);
    setError(null);
    setAnalytics(null);
    setAnalyticsError(null);
    setPreview(null);
    try {
      const [
        detail,
        analyticsResult,
        predictionItems,
        partnerItems,
        sourceItems,
        templateItems,
      ] = await Promise.all([
        repository.get(item.id),
        repository.getAnalytics(item.id).then(
          (value) => ({ value, error: null }),
          (caught) => ({ value: null, error: messageOf(caught) })
        ),
        repository.listPredictionReferences().catch(() => []),
        repository.listPartnerMarketConfigs().catch(() => []),
        repository.listAudienceSources().catch(() => []),
        repository.listSendGridTemplates().catch(() => {
          setSendGridCatalogUnavailable(true);
          return [];
        }),
      ]);
      setDetailTab('Overview');
      setEditing(false);
      setSelected(detail);
      setAnalytics(analyticsResult.value);
      setAnalyticsError(analyticsResult.error);
      setAcknowledgementNote('');
      setDraft(fromPublication(detail));
      setEditorDirty(false);
      setPredictions(predictionItems);
      setPartners(partnerItems);
      setAudienceSources(sourceItems);
      setSendGridTemplates(templateItems);
      if (templateItems.length) setSendGridCatalogUnavailable(false);
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  }

  async function startCreate() {
    setSelected(null);
    setAnalytics(null);
    setAnalyticsError(null);
    setDraft(emptyDraft());
    setEditorDirty(false);
    setPreview(null);
    setEstimate(null);
    createKey.current = createEmailPublicationIdempotencyKey();
    try {
      const [predictionItems, partnerItems, sourceItems, templateItems] =
        await Promise.all([
          repository.listPredictionReferences().catch(() => []),
          repository.listPartnerMarketConfigs().catch(() => []),
          repository.listAudienceSources().catch(() => []),
          repository.listSendGridTemplates().catch(() => {
            setSendGridCatalogUnavailable(true);
            return [];
          }),
        ]);
      setPredictions(predictionItems);
      setPartners(partnerItems);
      setAudienceSources(sourceItems);
      setSendGridTemplates(templateItems);
      if (templateItems.length) setSendGridCatalogUnavailable(false);
    } catch (caught) {
      setError(messageOf(caught));
    }
  }

  function closeEditor() {
    if (busy) return;
    setDraft(null);
    setSelected(null);
    setAnalytics(null);
    setAnalyticsError(null);
    setPreview(null);
    setEstimate(null);
    setEditorDirty(false);
    setError(null);
  }

  async function saveDraft() {
    if (!draft) return;
    setBusy(true);
    setError(null);
    setActionNotification(null);
    try {
      const input = toInput(draft, partners, sendGridTemplates);
      const saved = selected
        ? await repository.edit(selected.id, {
            ...input,
            expectedDefinitionVersion: selected.definitionVersion,
          })
        : await repository.create(input, createKey.current);
      await loadList();
      const detail = await repository.get(saved.id);
      setSelected(detail);
      setAnalytics(null);
      setAnalyticsError(null);
      const nextAnalytics = await repository
        .getAnalytics(detail.id)
        .catch((caught) => {
          setAnalyticsError(messageOf(caught));
          return null;
        });
      setAnalytics(nextAnalytics);
      setDraft(fromPublication(detail));
      setDetailTab('Content & audience');
      setEditorDirty(false);
      setPreview(null);
      if (!selected) createKey.current = createEmailPublicationIdempotencyKey();
      setActionNotification({
        severity: 'success',
        message: 'Publication draft saved successfully.',
      });
    } catch (caught) {
      const message = messageOf(caught);
      setActionNotification({ severity: 'error', message });
    } finally {
      setBusy(false);
    }
  }

  async function estimateAudience() {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      setEstimate(await repository.estimateAudience(draft.audience));
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  }

  async function refreshDetail() {
    if (!selected) return;
    setBusy(true);
    try {
      const detail = await repository.get(selected.id);
      const publicationAnalytics = await repository.getAnalytics(selected.id);
      setSelected(detail);
      setAnalytics(publicationAnalytics);
      setDraft(fromPublication(detail));
      setEditorDirty(false);
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  }

  async function acknowledgeIncident() {
    if (!selected || !acknowledgementNote.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await repository.acknowledgeIncident(selected.id, acknowledgementNote);
      const [detail, analyticsResult] = await Promise.all([
        repository.get(selected.id),
        repository.getAnalytics(selected.id).then(
          (value) => ({ value, error: null }),
          (caught) => ({ value: null, error: messageOf(caught) })
        ),
      ]);
      setSelected(detail);
      setAnalytics(analyticsResult.value);
      setAnalyticsError(analyticsResult.error);
      setAcknowledgementNote('');
      await loadList();
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  }

  async function exportAnalytics() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const exported = await repository.getAnalyticsExport(selected.id);
      downloadEmailAnalyticsJson(selected.id, exported);
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  }

  async function runCommand(action: Confirmation['action']) {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      if (action === 'pause') await repository.pause(selected.id);
      if (action === 'resume') await repository.resume(selected.id);
      if (action === 'sendNow') await repository.sendNow(selected.id);
      if (action === 'cancel') {
        if (!cancelReason.trim())
          throw new Error('A cancellation reason is required.');
        await repository.cancel(selected.id, cancelReason);
      }
      const detail = await repository.get(selected.id);
      setSelected(detail);
      setDraft(fromPublication(detail));
      setEditorDirty(false);
      await loadList();
      setConfirmation(null);
      setCancelReason('');
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setActionNotification(null);
    try {
      const result = await repository.approve(selected.id);
      if (result.state !== 'approved') {
        throw new Error(
          `Backend returned unexpected publication state: ${result.state}`
        );
      }
      const detail = await repository.get(selected.id);
      if (detail.state !== 'approved') {
        throw new Error(
          `Backend did not confirm approval; current state is ${detail.state}.`
        );
      }
      setSelected(detail);
      setDraft(fromPublication(detail));
      setEditorDirty(false);
      await loadList();
      setActionNotification({
        severity: 'success',
        message: 'Publication approved successfully.',
      });
    } catch (caught) {
      const message = messageOf(caught);
      setActionNotification({ severity: 'error', message });
    } finally {
      setBusy(false);
    }
  }

  async function schedule() {
    if (!selected) return;
    if (!scheduleLocal || !timezone.trim()) {
      setError('Schedule requires date, time, and an explicit IANA timezone.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await repository.schedule(selected.id, {
        scheduledAtUtc: zonedLocalDateTimeToUtc(scheduleLocal, timezone.trim()),
        timezone: timezone.trim(),
      });
      await refreshDetail();
      await loadList();
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminPageHeader
        title="Email Marketing"
        subtitle="Manual SirBro email publications with backend-authoritative approval and delivery outcomes."
        icon={<Email color="primary" />}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => void startCreate()}
          >
            Create publication
          </Button>
        }
      />
      <Box sx={{ maxWidth: 1440, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 } }}>
        <Stack spacing={3}>
          <Alert severity="info">
            SirBro is fixed by the backend. Email eligibility, legal
            projections, lifecycle state, and counters are never inferred in
            this page.
          </Alert>
          {error ? (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : null}
          {loading ? (
            <Stack role="status" alignItems="center" py={6}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>
                Loading email publications…
              </Typography>
            </Stack>
          ) : items.length === 0 ? (
            <Card>
              <CardContent sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="h6">
                  No email publications found
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Card} variant="outlined">
              <Table
                size="small"
                aria-label="Email publications"
                sx={{ minWidth: 1100 }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Publication</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    {publicationCounters.map(([label]) => (
                      <TableCell key={label} align="right">
                        {label}
                      </TableCell>
                    ))}
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedItems.map(({ latest, versions }) => (
                    <PublicationRow
                      key={latest.campaignId}
                      item={latest}
                      versionCount={versions.length}
                      onOpen={() => void openPublication(latest)}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </Box>
      {draft ? (
        <Dialog
          open
          fullWidth
          maxWidth="xl"
          aria-labelledby=""
          aria-label={selected ? 'Publication details' : 'Create publication'}
          onClose={closeEditor}
          PaperProps={{
            'aria-label': selected
              ? 'Publication details'
              : 'Create publication',
            sx: {
              height: 'calc(100dvh - 32px)',
              maxHeight: 'calc(100dvh - 32px)',
              '& .MuiButton-outlinedPrimary, & .MuiButton-textPrimary': {
                color: '#BDA6FF',
              },
              '& .MuiTab-root.Mui-selected': { color: '#C7B7FF' },
            },
          }}
        >
          <DialogTitle id="publication-details-title">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Box>
                <Typography component="span" variant="h6">
                  {selected
                    ? selected.definition?.name || 'Untitled publication'
                    : 'Create publication'}
                </Typography>
                {selected ? (
                  <Typography variant="body2" color="text.secondary">
                    Campaign: {selected.campaignName || 'Name unavailable'} ·{' '}
                    {topicLabel(selected.topic)}
                  </Typography>
                ) : null}
              </Box>
              {selected ? (
                <Chip label={publicationStateLabel(selected.state)} />
              ) : null}
            </Stack>
            {selected ? (
              <Tabs
                value={detailTab}
                onChange={(_, value: string) => setDetailTab(value)}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="Publication sections"
              >
                {['Overview', 'Analytics', 'Content & audience', 'History'].map(
                  (label) => (
                    <Tab key={label} label={label} value={label} />
                  )
                )}
              </Tabs>
            ) : null}
          </DialogTitle>
          <DialogContent dividers>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}
            <Editor
              key={selected?.id ?? 'new'}
              detailTab={detailTab}
              editing={editing}
              onEdit={() => setEditing(true)}
              draft={draft}
              setDraft={(next) => {
                setDraft(next);
                setEditorDirty(true);
              }}
              selected={selected}
              analytics={analytics}
              analyticsError={analyticsError}
              acknowledgementNote={acknowledgementNote}
              setAcknowledgementNote={setAcknowledgementNote}
              onAcknowledge={() => void acknowledgeIncident()}
              onExportAnalytics={() => void exportAnalytics()}
              editorDirty={editorDirty}
              predictions={predictions}
              partners={partners}
              audienceSources={audienceSources}
              sendGridTemplates={sendGridTemplates}
              sendGridCatalogUnavailable={sendGridCatalogUnavailable}
              versions={
                selected
                  ? items
                      .filter((item) => item.campaignId === selected.campaignId)
                      .sort(
                        (left, right) =>
                          right.definitionVersion - left.definitionVersion
                      )
                  : []
              }
              onVersionChange={(item) => void openPublication(item)}
              estimate={estimate}
              busy={busy}
              previewLocale={previewLocale}
              setPreviewLocale={setPreviewLocale}
              onSave={() => void saveDraft()}
              onEstimate={() => void estimateAudience()}
              onPreview={async () => {
                if (!selected) return;
                setBusy(true);
                setError(null);
                setActionNotification(null);
                try {
                  setPreview(
                    await repository.preview(selected.id, previewLocale)
                  );
                } catch (caught) {
                  setActionNotification({
                    severity: 'error',
                    message: messageOf(caught),
                  });
                } finally {
                  setBusy(false);
                }
              }}
              onApprove={() => void approve()}
              onRefresh={() => void refreshDetail()}
              scheduleLocal={scheduleLocal}
              setScheduleLocal={setScheduleLocal}
              timezone={timezone}
              setTimezone={setTimezone}
              onSchedule={() => void schedule()}
              onConfirm={(value) => {
                setError(null);
                setConfirmation(value);
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditor} disabled={busy}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
      {preview ? (
        <EmailPreviewDialog
          preview={preview}
          onClose={() => setPreview(null)}
        />
      ) : null}
      {confirmation ? (
        <Dialog open onClose={busy ? undefined : () => setConfirmation(null)}>
          <DialogTitle>{confirmation.title}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <Typography>
                Confirm this action for the selected publication version.
              </Typography>
              {confirmation.action === 'cancel' ? (
                <TextField
                  label="Cancellation reason"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  multiline
                  minRows={2}
                />
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={busy} onClick={() => setConfirmation(null)}>
              Back
            </Button>
            <Button
              variant="contained"
              color={confirmation.action === 'cancel' ? 'error' : 'primary'}
              disabled={busy}
              onClick={() => void runCommand(confirmation.action)}
            >
              {confirmation.confirmLabel}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
      <Portal>
        <Snackbar
          open={actionNotification !== null}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          onClose={() => setActionNotification(null)}
        >
          {actionNotification ? (
            <Alert
              severity={actionNotification.severity}
              variant="filled"
              onClose={() => setActionNotification(null)}
              sx={{ width: '100%' }}
            >
              {actionNotification.message}
            </Alert>
          ) : undefined}
        </Snackbar>
      </Portal>
    </Box>
  );
}

const publicationCounters = [
  ['Provider accepted', 'accepted'],
  ['Delivered', 'delivered'],
  ['Bounced', 'bounced'],
  ['Dropped', 'dropped'],
  ['Skipped', 'skipped'],
  ['Failed', 'failed'],
  ['Ambiguous', 'ambiguous'],
  ['Pending', 'pending'],
] as const;

function PublicationRow({
  item,
  versionCount,
  onOpen,
}: {
  item: EmailPublication;
  versionCount: number;
  onOpen: () => void;
}) {
  return (
    <TableRow
      hover
      onClick={onOpen}
      sx={{ cursor: 'pointer', '& > th, & > td': { py: 1.5 } }}
    >
      <TableCell
        component="th"
        scope="row"
        sx={{ minWidth: 220, maxWidth: 320, overflowWrap: 'anywhere' }}
      >
        <Typography variant="body2" fontWeight={600}>
          {item.definition?.name || 'Untitled publication'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          version {item.definitionVersion} · {versionCount}{' '}
          {versionCount === 1 ? 'version' : 'versions'} · cap{' '}
          {typeof item.definition?.frequencyCapHours === 'number'
            ? `${item.definition.frequencyCapHours}h`
            : 'N/A'}
        </Typography>
        {item.schedule ? (
          <Typography variant="caption" color="text.secondary" display="block">
            Scheduled: {item.schedule.scheduledAtUtc} · {item.schedule.timezone}
          </Typography>
        ) : null}
      </TableCell>
      <TableCell sx={{ minWidth: 150, maxWidth: 200 }}>
        {topicLabel(item.topic)}
      </TableCell>
      <TableCell>
        <Chip label={publicationStateLabel(item.state)} size="small" />
      </TableCell>
      {publicationCounters.map(([, key]) => (
        <TableCell
          key={key}
          align="right"
          sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {item.counters[key]}
        </TableCell>
      ))}
      <TableCell align="right">
        <Button
          size="small"
          aria-label={`Open publication ${item.definition?.name || 'Untitled publication'}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          Details
        </Button>
      </TableCell>
    </TableRow>
  );
}

function publicationStateLabel(state: EmailPublicationState): string {
  return state === 'sent' ? 'Provider accepted' : state;
}

type EditorProps = {
  detailTab: string;
  editing: boolean;
  onEdit: () => void;
  draft: EditorDraft;
  setDraft: (draft: EditorDraft) => void;
  selected: EmailPublication | null;
  analytics: EmailPublicationAnalytics | null;
  analyticsError: string | null;
  acknowledgementNote: string;
  setAcknowledgementNote: (value: string) => void;
  onAcknowledge: () => void;
  onExportAnalytics: () => void;
  editorDirty: boolean;
  predictions: PredictionReference[];
  partners: PartnerMarketProjection[];
  estimate: { reachableUsers: number; warnings: string[] } | null;
  audienceSources: EmailAudienceSource[];
  sendGridTemplates: SendGridTemplateReference[];
  sendGridCatalogUnavailable: boolean;
  versions: EmailPublication[];
  onVersionChange: (publication: EmailPublication) => void;
  busy: boolean;
  previewLocale: CampaignLocale;
  setPreviewLocale: (locale: CampaignLocale) => void;
  onSave: () => void;
  onEstimate: () => void;
  onPreview: () => void;
  onApprove: () => void;
  onRefresh: () => void;
  scheduleLocal: string;
  setScheduleLocal: (value: string) => void;
  timezone: string;
  setTimezone: (value: string) => void;
  onSchedule: () => void;
  onConfirm: (confirmation: Confirmation) => void;
};

function Editor(props: EditorProps) {
  const {
    draft,
    setDraft,
    selected,
    editorDirty,
    predictions,
    partners,
    audienceSources,
    sendGridTemplates,
    sendGridCatalogUnavailable,
    versions,
    estimate,
    busy,
  } = props;
  const incompleteDefinition = Boolean(
    selected && !hasEditableDefinition(selected)
  );
  const historical = Boolean(
    selected && versions[0] && versions[0].id !== selected.id
  );
  const updateDraft: (next: EditorDraft) => void = historical
    ? () => undefined
    : setDraft;
  const selectedPartner = partners.find(
    (item) => item.id === draft.partnerMarketConfigId
  );
  const compatibleTemplates = sendGridTemplates.filter((item) =>
    item.compatibleTopics.includes(draft.topic)
  );
  const selectedTemplate = compatibleTemplates.find(
    (item) => item.id === draft.sendGridTemplateId
  );
  const templateOptions =
    selectedTemplate || !draft.sendGridTemplateId
      ? compatibleTemplates
      : [
          {
            id: draft.sendGridTemplateId,
            name: `Saved incompatible template (${draft.sendGridTemplateId})`,
            compatibleTopics: [],
            versions: [],
          },
          ...compatibleTemplates,
        ];
  const activeVersions =
    selectedTemplate?.versions.filter((version) => version.active) ?? [];
  const selectedVersion = selectedTemplate?.versions.find(
    (version) => version.id === draft.sendGridTemplateVersion
  );
  const versionOptions =
    selectedVersion && !selectedVersion.active
      ? [selectedVersion, ...activeVersions]
      : activeVersions.length
        ? activeVersions
        : draft.sendGridTemplateVersion
          ? [
              {
                id: draft.sendGridTemplateVersion,
                name: `Saved version (${draft.sendGridTemplateVersion})`,
                active: false,
                updatedAt: '',
              },
            ]
          : [];
  const set = <K extends keyof EditorDraft>(key: K, value: EditorDraft[K]) =>
    updateDraft({ ...draft, [key]: value });
  const setManualAudience = (audience: CampaignAudienceDefinition) =>
    set('audience', {
      ...audience,
      segmentSource: 'manual_rules',
      sourceSegmentId: null,
    });
  const setTopic = (topic: EmailPublicationTopic) =>
    updateDraft({
      ...draft,
      topic,
      sendGridTemplateId: '',
      sendGridTemplateVersion: '',
      predictionKey: '',
      productCtaEnabled: false,
      productCtaUrl: '',
      productCtaLabels: blankLocalized(),
      partnerMarketConfigId: '',
      offerHeadlineByLocale: blankLocalized(),
      offerBodyByLocale: blankLocalized(),
      materialTermsByLocale: blankLocalized(),
      offerExpiresAt: '',
    });
  const contentVisible = !selected || props.detailTab === 'Content & audience';
  const overview = props.detailTab === 'Overview';
  const canSend = selected?.state === 'approved' && !editorDirty;
  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h5">
                {selected
                  ? `Version ${selected.definitionVersion}`
                  : 'New publication'}
              </Typography>
              {selected ? (
                <Typography color="text.secondary">
                  Updated {new Date(selected.updatedAt).toLocaleString()}
                </Typography>
              ) : null}
              {selected?.schedule ? (
                <Typography variant="body2" color="text.secondary">
                  Scheduled: {selected.schedule.scheduledAtUtc} ·{' '}
                  {selected.schedule.timezone}
                </Typography>
              ) : null}
            </Box>
            {selected ? (
              <Button
                startIcon={<Refresh />}
                disabled={busy || editorDirty}
                onClick={props.onRefresh}
              >
                Refresh detail
              </Button>
            ) : null}
          </Stack>
          {selected && versions.length > 1 ? (
            <TextField
              select
              label="Publication version"
              value={selected.id}
              onChange={(event) => {
                const version = versions.find(
                  (item) => item.id === event.target.value
                );
                if (version) props.onVersionChange(version);
              }}
              disabled={busy || editorDirty}
            >
              {versions.map((version) => (
                <MenuItem key={version.id} value={version.id}>
                  Version {version.definitionVersion} ·{' '}
                  {publicationStateLabel(version.state)}
                </MenuItem>
              ))}
            </TextField>
          ) : null}
          {historical ? (
            <Alert severity="info">
              Historical versions are read-only. Select the latest version to
              edit or run lifecycle commands.
            </Alert>
          ) : null}
          {selected && overview && !historical && !incompleteDefinition ? (
            <LifecycleActions
              selected={selected}
              canSend={canSend}
              scheduleLocal={props.scheduleLocal}
              setScheduleLocal={props.setScheduleLocal}
              timezone={props.timezone}
              setTimezone={props.setTimezone}
              onSchedule={props.onSchedule}
              onConfirm={props.onConfirm}
            />
          ) : null}
          {selected && (overview || props.detailTab === 'Analytics') ? (
            <EmailPublicationAnalyticsPanel
              view={overview ? 'overview' : 'analytics'}
              publication={selected}
              analytics={props.analytics}
              error={props.analyticsError}
              loading={busy}
              acknowledgementNote={props.acknowledgementNote}
              onAcknowledgementNoteChange={props.setAcknowledgementNote}
              onAcknowledge={props.onAcknowledge}
              onExport={props.onExportAnalytics}
            />
          ) : null}
          {selected && props.detailTab === 'History' ? (
            <Stack spacing={2}>
              <Typography variant="h6">Version history</Typography>
              {versions.map((version) => (
                <Button
                  key={version.id}
                  variant="outlined"
                  disabled={busy || editorDirty || version.id === selected.id}
                  onClick={() => props.onVersionChange(version)}
                >
                  Version {version.definitionVersion} ·{' '}
                  {publicationStateLabel(version.state)} ·{' '}
                  {new Date(version.createdAt).toLocaleString()}
                </Button>
              ))}
              <Typography>
                Created: {new Date(selected.createdAt).toLocaleString()}
              </Typography>
              {selected.approvedAt ? (
                <Typography>
                  Approved: {new Date(selected.approvedAt).toLocaleString()}
                </Typography>
              ) : null}
              {selected.terminalAt ? (
                <Typography>
                  Finished: {new Date(selected.terminalAt).toLocaleString()}
                </Typography>
              ) : null}
              {selected.terminalReason ? (
                <Typography>Reason: {selected.terminalReason}</Typography>
              ) : null}
              {selected.lateIncident?.acknowledgedAt ? (
                <Typography>
                  Incident acknowledged:{' '}
                  {new Date(
                    selected.lateIncident.acknowledgedAt
                  ).toLocaleString()}{' '}
                  · {selected.lateIncident.acknowledgementNote}
                </Typography>
              ) : null}
              <Box component="details">
                <Typography component="summary">Technical details</Typography>
                <Typography>Campaign ID: {selected.campaignId}</Typography>
                <Button
                  onClick={() =>
                    void navigator.clipboard.writeText(selected.campaignId)
                  }
                >
                  Copy campaign ID
                </Button>
                <Typography>Publication ID: {selected.id}</Typography>
              </Box>
            </Stack>
          ) : null}

          {selected &&
          contentVisible &&
          !props.editing &&
          !incompleteDefinition ? (
            <Stack spacing={2}>
              <Typography variant="h6">Saved content and audience</Typography>
              <Typography>
                Template: {selectedTemplate?.name || 'Saved template'} ·{' '}
                {selectedVersion?.name || 'Saved version'}
              </Typography>
              <Typography>
                Languages:{' '}
                {selected.definition.audience.criteria.locales
                  .join(', ')
                  .toUpperCase()}{' '}
                · Minimum interval: {selected.definition.frequencyCapHours}{' '}
                hours
              </Typography>
              <Typography>
                Audience:{' '}
                {selected.definition.audience.criteria.retentionStages.join(
                  ', '
                ) || 'No retention-stage filter'}{' '}
                · {selected.definition.audience.criteria.userIds.length} exact
                user IDs
              </Typography>
              <Tabs
                value={props.previewLocale}
                onChange={(_, locale: CampaignLocale) =>
                  props.setPreviewLocale(locale)
                }
                aria-label="Saved content language"
              >
                {locales.map((locale) => (
                  <Tab
                    key={locale}
                    value={locale}
                    label={locale.toUpperCase()}
                  />
                ))}
              </Tabs>
              <Typography variant="h6">
                {
                  selected.definition.contentByLocale[props.previewLocale]
                    .subject
                }
              </Typography>
              <Typography color="text.secondary">
                {
                  selected.definition.contentByLocale[props.previewLocale]
                    .preheader
                }
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                {
                  selected.definition.contentByLocale[props.previewLocale]
                    .textBody
                }
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  disabled={busy || editorDirty}
                  onClick={props.onPreview}
                >
                  Load preview
                </Button>
                {!historical ? (
                  <Button variant="contained" onClick={props.onEdit}>
                    {selected.state === 'draft'
                      ? 'Edit draft'
                      : 'Create new version'}
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          ) : null}
          {incompleteDefinition ? (
            <>
              <Alert severity="warning">
                The saved publication definition is incomplete. Analytics remain
                available, but editing, preview, and delivery commands are
                unavailable until the saved definition is recovered.
              </Alert>
              {contentVisible ? (
                <Typography variant="h6">Saved content</Typography>
              ) : null}
              {contentVisible ? (
                <Tabs
                  value={props.previewLocale}
                  onChange={(_, locale: CampaignLocale) =>
                    props.setPreviewLocale(locale)
                  }
                  aria-label="Saved content language"
                >
                  {locales.map((locale) => (
                    <Tab
                      key={locale}
                      value={locale}
                      label={locale.toUpperCase()}
                    />
                  ))}
                </Tabs>
              ) : null}
              {(contentVisible ? [props.previewLocale] : []).map((locale) => {
                const content = selected?.definition?.contentByLocale?.[locale];
                return (
                  <Box key={locale}>
                    <Typography variant="subtitle1">
                      {locale.toUpperCase()}
                    </Typography>
                    <Typography>
                      {content?.subject || 'Subject unavailable'}
                    </Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                      {content?.textBody || 'Text content unavailable'}
                    </Typography>
                  </Box>
                );
              })}
            </>
          ) : contentVisible && (!selected || props.editing) ? (
            <>
              <Divider />
              <TextField
                label="Publication name"
                value={draft.name}
                onChange={(event) => set('name', event.target.value)}
                required
              />
              <TextField
                select
                label="Publication type"
                value={draft.topic}
                onChange={(event) =>
                  setTopic(event.target.value as EmailPublicationTopic)
                }
              >
                {topics.map((topic) => (
                  <MenuItem key={topic.value} value={topic.value}>
                    {topic.label}
                  </MenuItem>
                ))}
              </TextField>
              {sendGridCatalogUnavailable ? (
                <Alert severity="warning">
                  The SendGrid template list is temporarily unavailable. Saved
                  publications remain viewable, but a new publication cannot be
                  created until the catalog is available.
                </Alert>
              ) : null}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  select
                  label="SendGrid template"
                  value={draft.sendGridTemplateId}
                  onChange={(event) => {
                    const template = compatibleTemplates.find(
                      (item) => item.id === event.target.value
                    );
                    updateDraft({
                      ...draft,
                      sendGridTemplateId: event.target.value,
                      sendGridTemplateVersion:
                        template?.versions.find((version) => version.active)
                          ?.id ?? '',
                    });
                  }}
                  required
                  helperText={
                    compatibleTemplates.length
                      ? 'Only templates compatible with this publication type are shown.'
                      : 'No compatible SendGrid templates are available.'
                  }
                >
                  {templateOptions.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  select
                  label="SendGrid template version"
                  value={draft.sendGridTemplateVersion}
                  onChange={(event) =>
                    set('sendGridTemplateVersion', event.target.value)
                  }
                  required
                  disabled={!draft.sendGridTemplateId}
                >
                  {versionOptions.map((version) => (
                    <MenuItem
                      key={version.id}
                      value={version.id}
                      disabled={!version.active}
                    >
                      {version.name}
                      {version.active ? ' · active' : ' · saved inactive'}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Typography variant="subtitle1">Audience</Typography>
              <TextField
                select
                label="Audience source"
                value={draft.audience.segmentSource}
                onChange={(event) =>
                  set('audience', {
                    ...draft.audience,
                    segmentSource: event.target
                      .value as CampaignAudienceDefinition['segmentSource'],
                    sourceSegmentId: null,
                  })
                }
              >
                <MenuItem value="manual_rules">Manual rules</MenuItem>
                <MenuItem value="template_segment">Template segment</MenuItem>
              </TextField>
              {draft.audience.segmentSource === 'template_segment' ? (
                <TextField
                  select
                  label="Template audience"
                  value={draft.audience.sourceSegmentId ?? ''}
                  onChange={(event) => {
                    const source = audienceSources.find(
                      (item) =>
                        item.id === event.target.value &&
                        item.source === draft.audience.segmentSource
                    );
                    if (source)
                      set('audience', cloneAudience(source.audience, source));
                  }}
                  required
                >
                  <MenuItem value="" disabled>
                    Select an audience
                  </MenuItem>
                  {audienceSources
                    .filter(
                      (source) => source.source === draft.audience.segmentSource
                    )
                    .map((source) => (
                      <MenuItem
                        key={`${source.source}:${source.id}`}
                        value={source.id}
                      >
                        {source.name}
                      </MenuItem>
                    ))}
                </TextField>
              ) : null}
              <Box>
                <Typography variant="subtitle2">Retention stages</Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap>
                  {retentionStages.map((stage) => (
                    <FormControlLabel
                      key={stage}
                      control={
                        <Checkbox
                          checked={draft.audience.criteria.retentionStages.includes(
                            stage
                          )}
                          onChange={(event) =>
                            setManualAudience({
                              ...draft.audience,
                              criteria: {
                                ...draft.audience.criteria,
                                retentionStages: toggle(
                                  draft.audience.criteria.retentionStages,
                                  stage,
                                  event.target.checked
                                ),
                              },
                            })
                          }
                        />
                      }
                      label={stage}
                    />
                  ))}
                </Stack>
              </Box>
              <TextField
                label="Exact user IDs (comma-separated)"
                value={draft.audience.criteria.userIds.join(', ')}
                onChange={(event) =>
                  setManualAudience({
                    ...draft.audience,
                    criteria: {
                      ...draft.audience.criteria,
                      userIds: splitValues(event.target.value),
                    },
                  })
                }
              />
              <Box>
                <Typography variant="subtitle2">Recipient locales</Typography>
                {locales.map((locale) => (
                  <FormControlLabel
                    key={locale}
                    control={
                      <Checkbox
                        checked={draft.audience.criteria.locales.includes(
                          locale
                        )}
                        onChange={(event) =>
                          setManualAudience({
                            ...draft.audience,
                            criteria: {
                              ...draft.audience.criteria,
                              locales: toggle(
                                draft.audience.criteria.locales,
                                locale,
                                event.target.checked
                              ),
                            },
                          })
                        }
                      />
                    }
                    label={locale}
                  />
                ))}
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      draft.audience.suppression.excludeUsersWithoutPushOpens
                    }
                    onChange={(event) =>
                      setManualAudience({
                        ...draft.audience,
                        suppression: {
                          excludeUsersWithoutPushOpens: event.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Narrow to users with push opens (explicit audience criterion only)"
              />
              <TextField
                label="Frequency cap hours"
                type="number"
                value={draft.frequencyCapHours}
                onChange={(event) =>
                  set('frequencyCapHours', event.target.value)
                }
                inputProps={{ min: 1, max: 8760 }}
                required
              />
              <Button
                variant="outlined"
                onClick={props.onEstimate}
                disabled={busy}
              >
                Estimate audience
              </Button>
              {estimate ? (
                <Alert severity="info">
                  Backend estimate:{' '}
                  {estimate.reachableUsers.toLocaleString('en-US')} reachable
                  users.
                  {estimate.warnings.map((warning) => ` ${warning}`)}
                </Alert>
              ) : null}
              <LocalizedContentEditor draft={draft} setDraft={updateDraft} />
              {draft.topic === 'sirbro_predictions' ||
              draft.topic === 'sirbro_predictions_with_partner_offer' ? (
                <Stack spacing={2}>
                  <Alert severity="info">
                    Only future predictions with Complete Full Analysis are
                    selectable. Approval freezes the prediction and its Full
                    Analysis CTA before any sponsored module.
                  </Alert>
                  <TextField
                    select
                    label="Eligible prediction and version"
                    value={draft.predictionKey}
                    onChange={(event) =>
                      set('predictionKey', event.target.value)
                    }
                    required
                  >
                    {predictions.map((prediction) => (
                      <MenuItem
                        key={`${prediction.id}:${prediction.analysisVersion}`}
                        value={`${prediction.id}:${prediction.analysisVersion}`}
                      >
                        {prediction.teamsNames ?? prediction.id}
                        {prediction.fixtureTime
                          ? ` · ${formatPredictionKickoff(prediction.fixtureTime)}`
                          : ''}{' '}
                        · analysis v{prediction.analysisVersion}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              ) : null}
              {draft.topic === 'sirbro_product_updates' ? (
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={draft.productCtaEnabled}
                        onChange={(event) =>
                          set('productCtaEnabled', event.target.checked)
                        }
                      />
                    }
                    label="Include optional first-party CTA"
                  />
                  {draft.productCtaEnabled ? (
                    <>
                      <TextField
                        label="CTA HTTPS URL"
                        value={draft.productCtaUrl}
                        onChange={(event) =>
                          set('productCtaUrl', event.target.value)
                        }
                      />
                      {locales.map((locale) => (
                        <TextField
                          key={locale}
                          label={`${locale} CTA label`}
                          value={draft.productCtaLabels[locale]}
                          onChange={(event) =>
                            set('productCtaLabels', {
                              ...draft.productCtaLabels,
                              [locale]: event.target.value,
                            })
                          }
                        />
                      ))}
                    </>
                  ) : null}
                </Stack>
              ) : null}
              {draft.topic === 'betting_partner_offers' ||
              draft.topic === 'sirbro_predictions_with_partner_offer' ? (
                <Stack spacing={2}>
                  <TextField
                    select
                    label="Partner market configuration"
                    value={draft.partnerMarketConfigId}
                    onChange={(event) =>
                      set('partnerMarketConfigId', event.target.value)
                    }
                    required
                  >
                    {partners.map((partner) => (
                      <MenuItem key={partner.id} value={partner.id}>
                        {partner.operatorDisplayName} · {partner.countryCode}
                        {partner.regionCode ? `/${partner.regionCode}` : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                  {selectedPartner ? (
                    <PartnerProjection partner={selectedPartner} />
                  ) : (
                    <Alert severity="warning">
                      Only current approved configurations are selectable.
                      Missing legal/display data remains fail-closed at backend
                      approval.
                    </Alert>
                  )}
                  <LocalizedSimpleFields
                    label="Offer headline"
                    value={draft.offerHeadlineByLocale}
                    onChange={(value) => set('offerHeadlineByLocale', value)}
                  />
                  <LocalizedSimpleFields
                    label="Offer body"
                    value={draft.offerBodyByLocale}
                    onChange={(value) => set('offerBodyByLocale', value)}
                    multiline
                  />
                  <LocalizedSimpleFields
                    label="Material terms"
                    value={draft.materialTermsByLocale}
                    onChange={(value) => set('materialTermsByLocale', value)}
                    multiline
                  />
                  <TextField
                    label="Offer expires at"
                    type="datetime-local"
                    InputLabelProps={{ shrink: true }}
                    value={draft.offerExpiresAt}
                    onChange={(event) =>
                      set('offerExpiresAt', event.target.value)
                    }
                    required
                  />
                </Stack>
              ) : null}
              {editorDirty && selected ? (
                <Alert severity="warning">
                  Unsaved changes invalidate approval controls. Save the
                  successor draft before previewing, approving, sending, or
                  scheduling.
                </Alert>
              ) : null}
              {!historical ? (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={props.onSave}
                    disabled={busy}
                  >
                    {selected ? 'Save new version' : 'Save draft'}
                  </Button>
                  {selected?.state === 'draft' && !editorDirty ? (
                    <Button
                      variant="outlined"
                      onClick={props.onApprove}
                      disabled={busy}
                    >
                      Approve
                    </Button>
                  ) : null}
                </Stack>
              ) : null}
              {selected ? (
                <>
                  <Divider />
                  <Typography variant="h6">Canonical preview</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      select
                      label="Preview locale"
                      value={props.previewLocale}
                      onChange={(event) =>
                        props.setPreviewLocale(
                          event.target.value as CampaignLocale
                        )
                      }
                    >
                      {locales.map((locale) => (
                        <MenuItem key={locale} value={locale}>
                          {locale}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button
                      variant="outlined"
                      onClick={props.onPreview}
                      disabled={editorDirty}
                    >
                      Load preview
                    </Button>
                  </Stack>
                </>
              ) : null}
            </>
          ) : null}
          {selected?.terminalReason ? (
            <Alert severity="warning">
              Terminal reason: {selected.terminalReason}
            </Alert>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function EmailPreviewDialog({
  preview,
  onClose,
}: {
  preview: Awaited<ReturnType<EmailMarketingRepository['preview']>>;
  onClose: () => void;
}) {
  return (
    <Dialog
      open
      fullWidth
      maxWidth="lg"
      aria-labelledby="email-preview-title"
      onClose={onClose}
      PaperProps={{ sx: { height: 'calc(100vh - 48px)', overflow: 'hidden' } }}
    >
      <DialogTitle id="email-preview-title">Email preview</DialogTitle>
      <DialogContent
        dividers
        sx={{ p: 0, display: 'flex', overflow: 'hidden' }}
      >
        <Box
          component="iframe"
          title="Canonical email preview"
          sandbox=""
          srcDoc={preview.html}
          sx={{
            width: '100%',
            height: '100%',
            flex: 1,
            bgcolor: 'common.white',
            border: 0,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close preview</Button>
      </DialogActions>
    </Dialog>
  );
}

function LocalizedContentEditor({
  draft,
  setDraft,
}: {
  draft: EditorDraft;
  setDraft: (draft: EditorDraft) => void;
}) {
  const [contentLocale, setContentLocale] = useState<CampaignLocale>('en');
  const update = (
    locale: CampaignLocale,
    field: keyof EmailContentByLocale[CampaignLocale],
    value: string
  ) =>
    setDraft({
      ...draft,
      contentByLocale: {
        ...draft.contentByLocale,
        [locale]: { ...draft.contentByLocale[locale], [field]: value },
      },
    });
  return (
    <Box>
      <Typography variant="h6">Localized content</Typography>
      <Tabs
        value={contentLocale}
        onChange={(_, locale: CampaignLocale) => setContentLocale(locale)}
        aria-label="Edit content language"
      >
        {locales.map((locale) => (
          <Tab key={locale} value={locale} label={locale.toUpperCase()} />
        ))}
      </Tabs>
      <Stack spacing={3} sx={{ mt: 2 }}>
        {[contentLocale].map((locale) => {
          const content = draft.contentByLocale[locale];
          return (
            <Card variant="outlined" key={locale}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle1">
                    {locale.toUpperCase()}{' '}
                    <Chip
                      size="small"
                      label={isComplete(content) ? 'complete' : 'incomplete'}
                      color={isComplete(content) ? 'success' : 'warning'}
                    />
                  </Typography>
                  <TextField
                    label={`${locale} subject`}
                    value={content.subject}
                    onChange={(event) =>
                      update(locale, 'subject', event.target.value)
                    }
                    required
                  />
                  <TextField
                    label={`${locale} preheader`}
                    value={content.preheader}
                    onChange={(event) =>
                      update(locale, 'preheader', event.target.value)
                    }
                    required
                  />
                  <TextField
                    label={`${locale} HTML body`}
                    value={content.htmlBody}
                    onChange={(event) =>
                      update(locale, 'htmlBody', event.target.value)
                    }
                    multiline
                    minRows={5}
                    required
                  />
                  <TextField
                    label={`${locale} text body`}
                    value={content.textBody}
                    onChange={(event) =>
                      update(locale, 'textBody', event.target.value)
                    }
                    multiline
                    minRows={4}
                    required
                  />
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}

function LocalizedSimpleFields({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  multiline?: boolean;
}) {
  return (
    <Stack spacing={1}>
      {locales.map((locale) => (
        <TextField
          key={locale}
          label={`${locale} ${label.toLowerCase()}`}
          value={value[locale]}
          onChange={(event) =>
            onChange({ ...value, [locale]: event.target.value })
          }
          multiline={multiline}
          minRows={multiline ? 2 : undefined}
          required
        />
      ))}
    </Stack>
  );
}

function PartnerProjection({ partner }: { partner: PartnerMarketProjection }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1">
          Backend legal/display projection (read-only)
        </Typography>
        <Stack spacing={0.5}>
          <Typography>
            {partner.operatorDisplayName} · {partner.minimumAge}+
          </Typography>
          <Typography variant="body2">
            Logo:{' '}
            {partner.operatorLogoUrl ?? 'Missing — approval will fail closed'}
          </Typography>
          {locales.map((locale) => (
            <Typography variant="body2" key={locale}>
              {locale.toUpperCase()} disclosure:{' '}
              {partner.affiliateDisclosureByLocale?.[locale] ??
                'Missing — approval will fail closed'}
            </Typography>
          ))}
          <Typography variant="body2">
            Warning: {partner.requiredWarningText}
          </Typography>
          <Typography variant="body2">
            Responsible gambling: {partner.responsibleGamblingUrl}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function LifecycleActions({
  selected,
  canSend,
  scheduleLocal,
  setScheduleLocal,
  timezone,
  setTimezone,
  onSchedule,
  onConfirm,
}: {
  selected: EmailPublication;
  canSend: boolean;
  scheduleLocal: string;
  setScheduleLocal: (value: string) => void;
  timezone: string;
  setTimezone: (value: string) => void;
  onSchedule: () => void;
  onConfirm: (value: Confirmation) => void;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      flexWrap="wrap"
      useFlexGap
      aria-label="Publication actions"
    >
      {!canSend && selected.state === 'draft' ? (
        <Alert severity="info">
          Send now and schedule become available only after backend approval.
        </Alert>
      ) : null}
      {canSend ? (
        <Stack spacing={2}>
          <Button
            variant="contained"
            onClick={() =>
              onConfirm({
                action: 'sendNow',
                title: 'Send publication now?',
                confirmLabel: 'Confirm send now',
              })
            }
          >
            Send now
          </Button>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Schedule date and time"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={scheduleLocal}
              onChange={(event) => setScheduleLocal(event.target.value)}
            />
            <TextField
              label="IANA timezone"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
            />
            <Button variant="outlined" onClick={onSchedule}>
              Schedule
            </Button>
          </Stack>
        </Stack>
      ) : null}
      {selected.state === 'scheduled' || selected.state === 'sending' ? (
        <Button
          variant="outlined"
          onClick={() =>
            onConfirm({
              action: 'pause',
              title: 'Pause publication?',
              confirmLabel: 'Confirm pause',
            })
          }
        >
          Pause
        </Button>
      ) : null}
      {selected.state === 'paused' ? (
        <Button
          variant="outlined"
          onClick={() =>
            onConfirm({
              action: 'resume',
              title: 'Resume publication?',
              confirmLabel: 'Confirm resume',
            })
          }
        >
          Resume
        </Button>
      ) : null}
      {!terminalStates.has(selected.state) ? (
        <Button
          color="error"
          variant="outlined"
          onClick={() =>
            onConfirm({
              action: 'cancel',
              title: 'Cancel publication?',
              confirmLabel: 'Confirm cancel',
            })
          }
        >
          Cancel
        </Button>
      ) : null}
    </Stack>
  );
}

function emptyDraft(): EditorDraft {
  return {
    name: '',
    topic: 'sirbro_product_updates',
    sendGridTemplateId: '',
    sendGridTemplateVersion: '',
    frequencyCapHours: '24',
    audience: {
      segmentSource: 'manual_rules',
      sourceSegmentId: null,
      criteria: {
        retentionStages: [RetentionStage.NEW],
        userIds: [],
        locales: [...locales],
      },
      suppression: { excludeUsersWithoutPushOpens: false },
    },
    contentByLocale: blankContent(),
    predictionKey: '',
    productCtaEnabled: false,
    productCtaUrl: '',
    productCtaLabels: blankLocalized(),
    partnerMarketConfigId: '',
    offerHeadlineByLocale: blankLocalized(),
    offerBodyByLocale: blankLocalized(),
    materialTermsByLocale: blankLocalized(),
    offerExpiresAt: '',
  };
}

function hasEditableDefinition(publication: EmailPublication): boolean {
  const definition = publication.definition;
  const audience = definition?.audience;
  return Boolean(
    typeof definition?.name === 'string' &&
      Number.isFinite(definition?.frequencyCapHours) &&
      audience?.segmentSource &&
      Array.isArray(audience.criteria?.retentionStages) &&
      Array.isArray(audience.criteria?.userIds) &&
      Array.isArray(audience.criteria?.locales) &&
      typeof audience.suppression?.excludeUsersWithoutPushOpens === 'boolean' &&
      locales.every((locale) => {
        const content = definition?.contentByLocale?.[locale];
        return (
          content &&
          ['subject', 'preheader', 'htmlBody', 'textBody'].every(
            (field) =>
              typeof content[field as keyof typeof content] === 'string'
          )
        );
      })
  );
}

function fromPublication(publication: EmailPublication): EditorDraft {
  const base = emptyDraft();
  // Incomplete saved records are displayed read-only; never infer their audience.
  if (!hasEditableDefinition(publication)) return base;
  const typeData = publication.typeData;
  const predictionId =
    typeof typeData.predictionId === 'string' ? typeData.predictionId : '';
  const analysisVersion =
    typeof typeData.analysisVersion === 'number' ? typeData.analysisVersion : 0;
  const cta = record(typeData.cta);
  return {
    ...base,
    name: publication.definition.name,
    topic: publication.topic,
    sendGridTemplateId: publication.definition.sendGridTemplateId ?? '',
    sendGridTemplateVersion:
      publication.definition.sendGridTemplateVersion ?? '',
    frequencyCapHours: String(publication.definition.frequencyCapHours),
    audience: publication.definition.audience,
    contentByLocale: publication.definition.contentByLocale,
    predictionKey: predictionId ? `${predictionId}:${analysisVersion}` : '',
    productCtaEnabled: Boolean(cta),
    productCtaUrl: typeof cta?.url === 'string' ? cta.url : '',
    productCtaLabels: localized(record(cta?.labelByLocale)),
    partnerMarketConfigId: stringValue(typeData.partnerMarketConfigId),
    offerHeadlineByLocale: localized(record(typeData.offerHeadlineByLocale)),
    offerBodyByLocale: localized(record(typeData.offerBodyByLocale)),
    materialTermsByLocale: localized(record(typeData.materialTermsByLocale)),
    offerExpiresAt: toLocalDateTime(stringValue(typeData.offerExpiresAt)),
  };
}

function toInput(
  draft: EditorDraft,
  partners: PartnerMarketProjection[],
  templates: SendGridTemplateReference[]
): EmailPublicationInput {
  if (!draft.name.trim()) throw new Error('Publication name is required.');
  if (!draft.sendGridTemplateId.trim() || !draft.sendGridTemplateVersion.trim())
    throw new Error('SendGrid template ID and version are required.');
  const template = templates.find(
    (item) =>
      item.id === draft.sendGridTemplateId &&
      item.compatibleTopics.includes(draft.topic)
  );
  if (
    !template?.versions.some(
      (version) =>
        version.id === draft.sendGridTemplateVersion && version.active
    )
  )
    throw new Error(
      'Select the active version of a current SendGrid template.'
    );
  if (
    !Number.isInteger(Number(draft.frequencyCapHours)) ||
    Number(draft.frequencyCapHours) < 1
  )
    throw new Error('Frequency cap must be a positive whole number.');
  if (
    draft.topic === 'betting_partner_offers' &&
    Number(draft.frequencyCapHours) < 24
  )
    throw new Error('Partner-only frequency cap must be at least 24 hours.');
  if (
    (draft.audience.criteria.retentionStages.length === 0 &&
      draft.audience.criteria.userIds.length === 0) ||
    draft.audience.criteria.locales.length === 0
  )
    throw new Error(
      'Audience requires at least one retention stage or exact user ID, and one locale.'
    );
  if (
    draft.audience.segmentSource !== 'manual_rules' &&
    !draft.audience.sourceSegmentId?.trim()
  )
    throw new Error('Source segment ID is required.');
  if (locales.some((locale) => !isComplete(draft.contentByLocale[locale])))
    throw new Error(
      'All en/es/pt subject, preheader, HTML body, and text body fields are required.'
    );
  const input: EmailPublicationInput = {
    name: draft.name.trim(),
    topic: draft.topic,
    sendGridTemplateId: draft.sendGridTemplateId.trim(),
    sendGridTemplateVersion: draft.sendGridTemplateVersion.trim(),
    audience: draft.audience,
    frequencyCapHours: Number(draft.frequencyCapHours),
    contentByLocale: draft.contentByLocale,
  };
  if (draft.topic === 'sirbro_predictions') {
    const [predictionId, version] = draft.predictionKey.split(':');
    if (!predictionId || !Number.isInteger(Number(version)))
      throw new Error('Select an exact prediction and analysis version.');
    input.prediction = { predictionId, analysisVersion: Number(version) };
  }
  if (draft.topic === 'sirbro_product_updates') {
    input.productUpdate = draft.productCtaEnabled
      ? {
          cta: {
            url: draft.productCtaUrl.trim(),
            labelByLocale: trimLocalized(draft.productCtaLabels),
          },
        }
      : {};
    if (
      draft.productCtaEnabled &&
      (!draft.productCtaUrl.trim() ||
        locales.some(
          (locale) => !input.productUpdate?.cta?.labelByLocale[locale]
        ))
    )
      throw new Error(
        'CTA URL and exact en/es/pt labels are required when CTA is enabled.'
      );
  }
  if (draft.topic === 'betting_partner_offers') {
    const partner = partners.find(
      (item) => item.id === draft.partnerMarketConfigId
    );
    if (!partner)
      throw new Error('Select an approved partner market configuration.');
    if (
      !draft.offerExpiresAt ||
      [
        draft.offerHeadlineByLocale,
        draft.offerBodyByLocale,
        draft.materialTermsByLocale,
      ].some((value) => locales.some((locale) => !value[locale].trim()))
    )
      throw new Error(
        'Complete partner offer copy, material terms, and expiry are required.'
      );
    input.partnerOffer = {
      partnerMarketConfigId: partner.id,
      offerHeadlineByLocale: trimLocalized(draft.offerHeadlineByLocale),
      offerBodyByLocale: trimLocalized(draft.offerBodyByLocale),
      materialTermsByLocale: trimLocalized(draft.materialTermsByLocale),
      offerExpiresAt: new Date(draft.offerExpiresAt).toISOString(),
      countryCode: partner.countryCode,
      regionCode: partner.regionCode ?? undefined,
    };
  }
  if (draft.topic === 'sirbro_predictions_with_partner_offer') {
    const [predictionId, version] = draft.predictionKey.split(':');
    if (!predictionId || !Number.isInteger(Number(version)))
      throw new Error('Select an exact prediction and analysis version.');
    const partner = partners.find(
      (item) => item.id === draft.partnerMarketConfigId
    );
    if (!partner)
      throw new Error('Select an approved partner market configuration.');
    if (
      !draft.offerExpiresAt ||
      [
        draft.offerHeadlineByLocale,
        draft.offerBodyByLocale,
        draft.materialTermsByLocale,
      ].some((value) => locales.some((locale) => !value[locale].trim()))
    )
      throw new Error(
        'Complete partner offer copy, material terms, and expiry are required.'
      );
    input.sponsoredPrediction = {
      predictionId,
      analysisVersion: Number(version),
      partnerMarketConfigId: partner.id,
      offerHeadlineByLocale: trimLocalized(draft.offerHeadlineByLocale),
      offerBodyByLocale: trimLocalized(draft.offerBodyByLocale),
      materialTermsByLocale: trimLocalized(draft.materialTermsByLocale),
      offerExpiresAt: new Date(draft.offerExpiresAt).toISOString(),
      countryCode: partner.countryCode,
      regionCode: partner.regionCode ?? undefined,
    };
  }
  return input;
}

function blankLocalized(): LocalizedString {
  return { en: '', es: '', pt: '' };
}

function formatPredictionKickoff(value: string): string {
  const kickoff = new Date(value);
  if (Number.isNaN(kickoff.getTime())) return value;
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const day = String(kickoff.getUTCDate()).padStart(2, '0');
  const hour = String(kickoff.getUTCHours()).padStart(2, '0');
  const minute = String(kickoff.getUTCMinutes()).padStart(2, '0');
  return `${day} ${months[kickoff.getUTCMonth()]} ${kickoff.getUTCFullYear()}, ${hour}:${minute} UTC`;
}
function blankContent(): EmailContentByLocale {
  return {
    en: { subject: '', preheader: '', htmlBody: '', textBody: '' },
    es: { subject: '', preheader: '', htmlBody: '', textBody: '' },
    pt: { subject: '', preheader: '', htmlBody: '', textBody: '' },
  };
}
function isComplete(value: EmailContentByLocale[CampaignLocale]): boolean {
  return [value.subject, value.preheader, value.htmlBody, value.textBody].every(
    (item) => item.trim()
  );
}
function toggle<T>(items: T[], value: T, checked: boolean): T[] {
  return checked
    ? Array.from(new Set([...items, value]))
    : items.filter((item) => item !== value);
}
function splitValues(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
function topicLabel(topic: EmailPublicationTopic): string {
  return topics.find((item) => item.value === topic)?.label ?? topic;
}
function messageOf(value: unknown): string {
  return value instanceof Error
    ? value.message
    : 'Something went wrong. Please try again.';
}
function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
function localized(value: Record<string, unknown> | null): LocalizedString {
  return {
    en: stringValue(value?.en),
    es: stringValue(value?.es),
    pt: stringValue(value?.pt),
  };
}
function trimLocalized(value: LocalizedString): LocalizedString {
  return { en: value.en.trim(), es: value.es.trim(), pt: value.pt.trim() };
}
function cloneAudience(
  audience: CampaignAudienceDefinition,
  source: EmailAudienceSource
): CampaignAudienceDefinition {
  return {
    ...audience,
    segmentSource: source.source,
    sourceSegmentId: source.id,
    criteria: {
      ...audience.criteria,
      retentionStages: [...audience.criteria.retentionStages],
      userIds: [...audience.criteria.userIds],
      locales: [...audience.criteria.locales],
    },
    suppression: { ...audience.suppression },
  };
}
function toLocalDateTime(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function groupPublications(
  items: EmailPublication[]
): Array<{ latest: EmailPublication; versions: EmailPublication[] }> {
  const byCampaign = new Map<string, EmailPublication[]>();
  for (const item of items)
    byCampaign.set(item.campaignId, [
      ...(byCampaign.get(item.campaignId) ?? []),
      item,
    ]);
  return Array.from(byCampaign.values())
    .map((versions) => {
      const sorted = [...versions].sort(
        (left, right) => right.definitionVersion - left.definitionVersion
      );
      return { latest: sorted[0], versions: sorted };
    })
    .sort((left, right) =>
      right.latest.updatedAt.localeCompare(left.latest.updatedAt)
    );
}

export function zonedLocalDateTimeToUtc(
  value: string,
  timezone: string
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error('Schedule requires a valid date and time.');
  const requested = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  };
  const desired = Date.UTC(
    requested.year,
    requested.month - 1,
    requested.day,
    requested.hour,
    requested.minute
  );
  let candidate = desired;
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    for (let iteration = 0; iteration < 2; iteration += 1) {
      const parts = Object.fromEntries(
        formatter
          .formatToParts(new Date(candidate))
          .map((part) => [part.type, part.value])
      );
      const represented = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute)
      );
      candidate += desired - represented;
    }
  } catch {
    throw new Error('Enter a valid IANA timezone, for example Europe/Paris.');
  }
  const roundTrip = Object.fromEntries(
    formatter
      .formatToParts(new Date(candidate))
      .map((part) => [part.type, Number(part.value)])
  );
  if (
    roundTrip.year !== requested.year ||
    roundTrip.month !== requested.month ||
    roundTrip.day !== requested.day ||
    roundTrip.hour !== requested.hour ||
    roundTrip.minute !== requested.minute
  ) {
    throw new Error(
      'The selected local time does not exist in the requested timezone.'
    );
  }
  return new Date(candidate).toISOString();
}
