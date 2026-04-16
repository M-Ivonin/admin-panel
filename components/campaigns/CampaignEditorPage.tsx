'use client';

/**
 * Renders the shared create/edit campaign builder with live backend actions.
 */

import { useEffect, useMemo, useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  Archive,
  CheckCircle,
  Save,
  Science,
  WarningAmber,
} from '@mui/icons-material';
import { getStoredAuthUser } from '@/lib/auth';
import {
  RETENTION_STAGE_LABELS,
  RetentionStage,
} from '@/lib/api/users';
import type {
  CampaignAudienceDefinition,
  CampaignDeeplinkTarget,
  CampaignDraft,
  CampaignLocale,
  CampaignStatus,
  UpsertCampaignDraftRequest,
} from '@/modules/campaigns/contracts';
import {
  campaignsRepository,
} from '@/modules/campaigns/repository';
import {
  createEmptyCampaignDraft,
  applySavedSegmentSelection,
  applyTemplateSelection,
} from '@/modules/campaigns/defaults';
import {
  CampaignEditorStep,
  campaignEditorReducer,
  createCampaignEditorState,
} from '@/modules/campaigns/reducer';
import {
  buildCampaignReviewModel,
  canArchiveCampaign,
  canContinueCampaignStep,
  canScheduleCampaign,
  canSendTestCampaign,
  getCampaignLocaleReadiness,
  getCampaignValidationSummary,
} from '@/modules/campaigns/selectors';

const COLORS = {
  canvas: '#111111',
  panel: '#222222',
  surface: '#1A1A1A',
  soft: '#2A2A2A',
  accent: '#5B4BFF',
  accentSoft: '#211C3A',
  textPrimary: '#F5F5F5',
  textSecondary: '#A3A3A3',
  textMuted: '#8B8B8F',
  stroke: '#343434',
  strokeSoft: '#2F2F2F',
  success: '#68C96B',
  warning: '#F0A63A',
  warningSoft: '#3A2B12',
  danger: '#E05A5A',
  dangerSoft: '#321818',
};

const STEP_ORDER: CampaignEditorStep[] = [
  CampaignEditorStep.AUDIENCE,
  CampaignEditorStep.TIMING,
  CampaignEditorStep.CONTENT,
  CampaignEditorStep.REVIEW,
];

const STEP_LABELS: Record<CampaignEditorStep, string> = {
  [CampaignEditorStep.AUDIENCE]: 'Audience',
  [CampaignEditorStep.TIMING]: 'Timing',
  [CampaignEditorStep.CONTENT]: 'Content',
  [CampaignEditorStep.REVIEW]: 'Review',
};

const PENDING_ACTIVE_STEP_STORAGE_KEY = 'campaign-editor-pending-step';

function buildUpsertPayload(draft: CampaignDraft): UpsertCampaignDraftRequest {
  return {
    name: draft.name,
    goal: draft.goal,
    channel: draft.channel,
    audience: draft.audience,
    timing: draft.timing,
    content: draft.content,
  };
}

function toLocalDateTimeInputValue(iso: string | null): string {
  if (!iso) {
    return '';
  }

  const date = new Date(iso);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromLocalDateTimeInputValue(value: string): string | null {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function formatStatus(status: CampaignStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusChipStyles(status: CampaignStatus) {
  if (status === 'active') {
    return { color: COLORS.success, bgcolor: `${COLORS.success}22` };
  }

  if (status === 'scheduled') {
    return { color: COLORS.accent, bgcolor: `${COLORS.accent}22` };
  }

  if (status === 'archived') {
    return { color: COLORS.danger, bgcolor: `${COLORS.danger}22` };
  }

  if (status === 'paused') {
    return { color: COLORS.warning, bgcolor: `${COLORS.warning}22` };
  }

  return { color: COLORS.textSecondary, bgcolor: COLORS.soft };
}

function formatReadinessLabel(locale: CampaignLocale, readiness: ReturnType<typeof getCampaignLocaleReadiness>[CampaignLocale]) {
  return `${locale.toUpperCase()} · ${readiness === 'ready' ? 'ready' : readiness === 'warning' ? 'needs review' : 'missing'}`;
}

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 5,
        bgcolor: COLORS.soft,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography sx={{ color: COLORS.textPrimary, fontSize: 16, fontWeight: 700 }}>
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

function StepButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="text"
      onClick={onClick}
      sx={{
        borderRadius: 999,
        px: 1.75,
        py: 1,
        color: selected ? COLORS.textPrimary : COLORS.textSecondary,
        bgcolor: selected ? COLORS.accentSoft : COLORS.soft,
        border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
      }}
    >
      {label}
    </Button>
  );
}

function RetentionStageChips({
  value,
  onToggle,
}: {
  value: RetentionStage[];
  onToggle: (stage: RetentionStage) => void;
}) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {Object.values(RetentionStage).map((stage) => {
        const selected = value.includes(stage);

        return (
          <Chip
            key={stage}
            label={RETENTION_STAGE_LABELS[stage]}
            clickable
            onClick={() => onToggle(stage)}
            sx={{
              bgcolor: selected ? COLORS.accentSoft : COLORS.surface,
              color: selected ? COLORS.textPrimary : COLORS.textSecondary,
              border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
            }}
          />
        );
      })}
    </Stack>
  );
}

function LocaleChips({
  value,
  onToggle,
}: {
  value: CampaignLocale[];
  onToggle: (locale: CampaignLocale) => void;
}) {
  return (
    <Stack direction="row" spacing={1}>
      {(['en', 'es', 'pt'] as CampaignLocale[]).map((locale) => {
        const selected = value.includes(locale);

        return (
          <Chip
            key={locale}
            label={locale.toUpperCase()}
            clickable
            onClick={() => onToggle(locale)}
            sx={{
              bgcolor: selected ? COLORS.accentSoft : COLORS.surface,
              color: selected ? COLORS.textPrimary : COLORS.textSecondary,
              border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
              width: 58,
            }}
          />
        );
      })}
    </Stack>
  );
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: 5,
        bgcolor: COLORS.panel,
        border: `1px solid ${COLORS.stroke}`,
      }}
    >
      <Typography
        sx={{
          color: COLORS.textPrimary,
          fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
          fontSize: 22,
          fontWeight: 700,
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      <Stack spacing={1.2}>{children}</Stack>
    </Paper>
  );
}

/**
 * Shared create/edit campaigns editor page.
 */
export function CampaignEditorPage({
  mode,
  campaignId,
}: {
  mode: 'create' | 'edit';
  campaignId?: string;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    campaignEditorReducer,
    createCampaignEditorState(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segmentName, setSegmentName] = useState('');
  const [testRecipients, setTestRecipients] = useState('');
  const [testLocale, setTestLocale] = useState<CampaignLocale>('en');
  const [activeLocale, setActiveLocale] = useState<CampaignLocale>('en');
  const [librarySearch, setLibrarySearch] = useState('');
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string | null>(null);

  const editorTitle = state.draft.name.trim() || 'New Campaign';

  useEffect(() => {
    const authUser = getStoredAuthUser();

    if (!authUser?.email) {
      return;
    }

    setCurrentAdminEmail(authUser.email);
    setTestRecipients((currentValue) =>
      currentValue.trim().length > 0 ? currentValue : authUser.email,
    );
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadEditor() {
      setIsLoading(true);
      setError(null);

      try {
        const catalog = await campaignsRepository.getEditorCatalog();

        if (!isActive) {
          return;
        }

        if (mode === 'create') {
          dispatch({
            type: 'loadDraft',
            draft: createEmptyCampaignDraft(catalog),
            catalog,
            lastPersistedDraft: null,
          });
        } else if (campaignId) {
          const draft = await campaignsRepository.getCampaign(campaignId);
          const pendingStep =
            typeof window !== 'undefined'
              ? window.sessionStorage.getItem(PENDING_ACTIVE_STEP_STORAGE_KEY)
              : null;
          const restoredStep =
            pendingStep &&
            Object.values(CampaignEditorStep).includes(
              pendingStep as CampaignEditorStep,
            )
              ? (pendingStep as CampaignEditorStep)
              : undefined;

          if (typeof window !== 'undefined' && pendingStep) {
            window.sessionStorage.removeItem(PENDING_ACTIVE_STEP_STORAGE_KEY);
          }

          if (!isActive) {
            return;
          }

          dispatch({
            type: 'loadDraft',
            draft,
            catalog,
            activeStep: restoredStep,
            lastPersistedDraft: draft,
          });
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load campaign editor.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadEditor();

    return () => {
      isActive = false;
    };
  }, [campaignId, mode]);

  useEffect(() => {
    let isActive = true;

    async function refreshEstimate(audience: CampaignAudienceDefinition) {
      const estimate = await campaignsRepository.estimateAudience({ audience });
      if (isActive) {
        dispatch({ type: 'setEstimate', estimate });
      }
    }

    void refreshEstimate(state.draft.audience);

    return () => {
      isActive = false;
    };
  }, [state.draft.audience]);

  const validationSummary = useMemo(
    () => getCampaignValidationSummary(state.draft),
    [state.draft],
  );
  const readiness = validationSummary.readiness;
  const reviewModel = useMemo(() => buildCampaignReviewModel(state.draft), [state.draft]);
  const canContinue = canContinueCampaignStep(state.activeStep, state.draft);
  const canSendTest = canSendTestCampaign(state.draft);
  const canSchedule = canScheduleCampaign(state.draft);
  const canArchive = canArchiveCampaign(state.draft);

  const filteredSavedSegments = useMemo(() => {
    const normalized = librarySearch.trim().toLowerCase();
    return state.catalog.savedSegments.filter((segment) =>
      normalized.length === 0 ||
      segment.name.toLowerCase().includes(normalized) ||
      segment.description.toLowerCase().includes(normalized),
    );
  }, [librarySearch, state.catalog.savedSegments]);

  const filteredTemplates = useMemo(() => {
    const normalized = librarySearch.trim().toLowerCase();
    return state.catalog.templates.filter((template) =>
      normalized.length === 0 ||
      template.name.toLowerCase().includes(normalized) ||
      template.description.toLowerCase().includes(normalized),
    );
  }, [librarySearch, state.catalog.templates]);

  async function persistDraftIfNeeded(): Promise<CampaignDraft> {
    const payload = buildUpsertPayload(state.draft);

    if (state.draft.id === null) {
      const createdDraft = await campaignsRepository.createCampaignDraft(payload);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          PENDING_ACTIVE_STEP_STORAGE_KEY,
          state.activeStep,
        );
      }
      dispatch({
        type: 'markSaveSuccess',
        draft: createdDraft,
        message: 'Draft created.',
      });
      router.replace(`/dashboard/campaigns/${createdDraft.id}`);
      return createdDraft;
    }

    if (state.isDirty) {
      const updatedDraft = await campaignsRepository.updateCampaignDraft(
        state.draft.id,
        payload,
      );
      dispatch({
        type: 'markSaveSuccess',
        draft: updatedDraft,
        message: 'Draft saved.',
      });
      return updatedDraft;
    }

    return state.draft;
  }

  async function handleSaveDraft() {
    setIsSaving(true);
    setError(null);

    try {
      await persistDraftIfNeeded();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Failed to save draft.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendTest() {
    setIsSaving(true);
    setError(null);

    try {
      const persistedDraft = await persistDraftIfNeeded();
      const parsedRecipients = testRecipients
        .split(/[\n,]+/)
        .map((value) => value.trim())
        .filter(Boolean);
      const response = await campaignsRepository.sendTestCampaign(
        persistedDraft.id as string,
        {
          recipients:
            parsedRecipients.length > 0
              ? parsedRecipients
              : currentAdminEmail
                ? [currentAdminEmail]
                : [],
          locale: testLocale,
        },
      );

      dispatch({
        type: 'markActionSuccess',
        draft: persistedDraft,
        kind: 'test',
        message: 'Test accepted successfully.',
        warnings: response.warnings,
      });
      dispatch({ type: 'closeDialog', dialog: 'sendTest' });
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to send a test notification.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleScheduleCampaign() {
    setIsSaving(true);
    setError(null);

    try {
      const persistedDraft = await persistDraftIfNeeded();
      const response = await campaignsRepository.scheduleCampaign(
        persistedDraft.id as string,
        { confirm: true },
      );

      dispatch({
        type: 'markActionSuccess',
        draft: response.campaign,
        kind: 'schedule',
        message: 'Campaign scheduled.',
      });
      dispatch({ type: 'closeDialog', dialog: 'schedule' });
      router.replace(`/dashboard/campaigns/${response.campaign.id}`);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to schedule the campaign.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchiveCampaign() {
    if (!state.draft.id) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await campaignsRepository.archiveCampaign(state.draft.id, {
        confirm: true,
      });

      dispatch({
        type: 'markActionSuccess',
        draft: response.campaign,
        kind: 'archive',
        message: 'Campaign archived.',
      });
      dispatch({ type: 'closeDialog', dialog: 'archiveCampaign' });
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to archive the campaign.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveSegment() {
    if (!segmentName.trim()) {
      setError('Segment name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await campaignsRepository.saveSegment({
        name: segmentName.trim(),
        audience: state.draft.audience,
      });
      const catalog = await campaignsRepository.getEditorCatalog();
      dispatch({ type: 'setCatalog', catalog });
      dispatch({
        type: 'markActionSuccess',
        kind: 'segment',
        message: 'Segment saved to the lifecycle library.',
      });
      dispatch({ type: 'closeDialog', dialog: 'saveSegment' });
      setSegmentName('');
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to save the segment.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  function goToNextStep() {
    const currentIndex = STEP_ORDER.indexOf(state.activeStep);
    const nextStep = STEP_ORDER[currentIndex + 1];

    if (nextStep && canContinue) {
      dispatch({ type: 'setActiveStep', step: nextStep });
    }
  }

  function goToPreviousStep() {
    const currentIndex = STEP_ORDER.indexOf(state.activeStep);
    const previousStep = STEP_ORDER[currentIndex - 1];

    if (previousStep) {
      dispatch({ type: 'setActiveStep', step: previousStep });
    }
  }

  function applySavedSegment(segmentId: string) {
    const segment = state.catalog.savedSegments.find((item) => item.id === segmentId);

    if (!segment) {
      return;
    }

    dispatch({
      type: 'applySavedSegment',
      segmentId,
      audience: applySavedSegmentSelection(state.draft.audience, segment),
    });
  }

  function applyTemplate(templateId: string) {
    const template = state.catalog.templates.find((item) => item.id === templateId);

    if (!template) {
      return;
    }

    const { audience, contentPatch } = applyTemplateSelection(
      state.draft,
      template,
    );

    dispatch({
      type: 'applyTemplateSegment',
      templateId,
      audience,
      contentPatch,
    });
  }

  const actionLabel =
    state.activeStep === CampaignEditorStep.AUDIENCE
      ? 'Continue to Timing'
      : state.activeStep === CampaignEditorStep.TIMING
        ? 'Continue to Content'
        : state.activeStep === CampaignEditorStep.CONTENT
          ? 'Continue to Review'
          : 'Schedule Campaign';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.canvas }}>
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: 3, py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Box>
            <Typography
              sx={{
                color: COLORS.textMuted,
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 12,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                mb: 1,
              }}
            >
              CRM orchestration / campaigns
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography
                sx={{
                  color: COLORS.textPrimary,
                  fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                  fontSize: 42,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {editorTitle}
              </Typography>
              <Chip
                label={formatStatus(state.draft.status)}
                size="small"
                sx={getStatusChipStyles(state.draft.status)}
              />
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.25}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/dashboard/campaigns')}
              sx={{
                borderColor: COLORS.stroke,
                color: COLORS.textPrimary,
                borderRadius: 999,
              }}
            >
              Back to List
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveDraft}
              disabled={isSaving || isLoading}
              sx={{
                borderRadius: 999,
                bgcolor: COLORS.accent,
                '&:hover': { bgcolor: '#6E60FF' },
              }}
            >
              Save Draft
            </Button>
          </Stack>
        </Stack>

        {isLoading && <LinearProgress sx={{ mb: 2, bgcolor: COLORS.soft }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {state.lastActionResult && (
          <Alert
            severity={state.lastActionResult.warnings?.length ? 'warning' : 'success'}
            sx={{ mb: 2 }}
          >
            {state.lastActionResult.message}
            {state.lastActionResult.warnings?.length
              ? ` ${state.lastActionResult.warnings.join(' ')}`
              : ''}
          </Alert>
        )}
        {validationSummary.errors.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {validationSummary.errors.join(' ')}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              xl: '252px minmax(0, 1fr) 320px',
            },
            gap: 3,
          }}
        >
          <SummaryCard title="Lifecycle library">
            <Typography sx={{ color: COLORS.textSecondary, fontSize: 13, lineHeight: 1.45 }}>
              Use high-signal segments, goals, and templates to move faster.
            </Typography>

            <TextField
              label="Search library"
              placeholder="Search segments, goals, or templates"
              size="small"
              fullWidth
              value={librarySearch}
              onChange={(event) => setLibrarySearch(event.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: COLORS.soft,
                },
              }}
            />

            <Box>
              <Typography
                sx={{
                  color: COLORS.textMuted,
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: 1,
                }}
              >
                Saved segments
              </Typography>
              <Stack spacing={1}>
                {filteredSavedSegments.map((segment) => {
                  const selected =
                    state.draft.audience.sourceSegmentId === segment.id &&
                    state.draft.audience.segmentSource === 'saved_segment';

                  return (
                    <Paper
                      key={segment.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => applySavedSegment(segment.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          applySavedSegment(segment.id);
                        }
                      }}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 4,
                        bgcolor: selected ? COLORS.accentSoft : COLORS.soft,
                        border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
                        cursor: 'pointer',
                      }}
                    >
                      <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 600, mb: 0.45 }}>
                        {segment.name}
                      </Typography>
                      <Typography sx={{ color: selected ? '#B9B1FF' : COLORS.textMuted, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}>
                        {segment.description}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>

            <Box>
              <Typography
                sx={{
                  color: COLORS.textMuted,
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: 1,
                }}
              >
                Templates
              </Typography>
              <Stack spacing={1}>
                {filteredTemplates.map((template) => {
                  const selected =
                    state.draft.audience.sourceSegmentId === template.id &&
                    state.draft.audience.segmentSource === 'template_segment';

                  return (
                    <Paper
                      key={template.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => applyTemplate(template.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          applyTemplate(template.id);
                        }
                      }}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 4,
                        bgcolor: selected ? COLORS.accentSoft : COLORS.soft,
                        border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
                        cursor: 'pointer',
                      }}
                    >
                      <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 600, mb: 0.45 }}>
                        {template.name}
                      </Typography>
                      <Typography sx={{ color: selected ? '#B9B1FF' : COLORS.textMuted, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}>
                        {template.description}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          </SummaryCard>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 6,
              bgcolor: COLORS.panel,
              border: `1px solid ${COLORS.stroke}`,
            }}
          >
            <Stack spacing={2.25}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography
                  sx={{
                    color: COLORS.textPrimary,
                    fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  Create campaign
                </Typography>
                <Typography
                  sx={{
                    color: COLORS.textMuted,
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Step {STEP_ORDER.indexOf(state.activeStep) + 1} of 4 · {STEP_LABELS[state.activeStep]}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {STEP_ORDER.map((step) => (
                  <StepButton
                    key={step}
                    label={STEP_LABELS[step]}
                    selected={state.activeStep === step}
                    onClick={() => dispatch({ type: 'setActiveStep', step })}
                  />
                ))}
              </Stack>

              {state.activeStep === CampaignEditorStep.AUDIENCE && (
                <Stack spacing={2}>
                  <SectionCard title="Basics">
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                        gap: 1.5,
                      }}
                    >
                      <TextField
                        label="Campaign name"
                        value={state.draft.name}
                        onChange={(event) =>
                          dispatch({
                            type: 'updateBasics',
                            patch: { name: event.target.value },
                          })
                        }
                        fullWidth
                      />
                      <TextField
                        label="Goal"
                        value={state.draft.goal}
                        onChange={(event) =>
                          dispatch({
                            type: 'updateBasics',
                            patch: { goal: event.target.value },
                          })
                        }
                        fullWidth
                      />
                    </Box>
                  </SectionCard>

                  <SectionCard
                    title="Audience"
                    action={
                      <Button
                        variant="text"
                        onClick={() => dispatch({ type: 'openDialog', dialog: 'saveSegment' })}
                        sx={{ color: COLORS.accent }}
                      >
                        Save segment
                      </Button>
                    }
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {[
                          { value: 'saved_segment', label: 'Saved segment' },
                          { value: 'manual_rules', label: 'Manual rules' },
                          { value: 'template_segment', label: 'Template segment' },
                        ].map((option) => {
                          const selected =
                            state.draft.audience.segmentSource === option.value;
                          return (
                            <Chip
                              key={option.value}
                              label={option.label}
                              clickable
                              onClick={() =>
                                dispatch({
                                  type: 'changeSegmentSource',
                                  segmentSource: option.value as CampaignDraft['audience']['segmentSource'],
                                  sourceSegmentId:
                                    option.value === 'manual_rules'
                                      ? null
                                      : state.draft.audience.sourceSegmentId,
                                })
                              }
                              sx={{
                                bgcolor: selected ? COLORS.accentSoft : COLORS.surface,
                                color: selected ? COLORS.textPrimary : COLORS.textSecondary,
                                border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
                              }}
                            />
                          );
                        })}
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {[
                          { value: 'state_based', label: 'State based' },
                          { value: 'event_based', label: 'Event based' },
                          { value: 'scheduled_recurring', label: 'Scheduled recurring' },
                        ].map((option) => {
                          const selected = state.draft.audience.trigger.type === option.value;
                          return (
                            <Chip
                              key={option.value}
                              label={option.label}
                              clickable
                              onClick={() => {
                                if (option.value === 'state_based') {
                                  dispatch({ type: 'changeTrigger', trigger: { type: 'state_based' } });
                                  return;
                                }

                                if (option.value === 'event_based') {
                                  dispatch({
                                    type: 'changeTrigger',
                                    trigger: {
                                      type: 'event_based',
                                      eventKey:
                                        state.catalog.eventTriggers[0]?.key ?? 'opened_app',
                                    },
                                  });
                                  return;
                                }

                                dispatch({
                                  type: 'changeTrigger',
                                  trigger: {
                                    type: 'scheduled_recurring',
                                    recurrenceRule: '',
                                  },
                                });
                              }}
                              sx={{
                                bgcolor: selected ? COLORS.accentSoft : COLORS.surface,
                                color: selected ? COLORS.textPrimary : COLORS.textSecondary,
                                border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
                              }}
                            />
                          );
                        })}
                      </Stack>

                      {state.draft.audience.trigger.type === 'event_based' && (
                        <FormControl fullWidth>
                          <Select
                            value={state.draft.audience.trigger.eventKey}
                            onChange={(event) =>
                              dispatch({
                                type: 'changeTrigger',
                                trigger: {
                                  type: 'event_based',
                                  eventKey: event.target.value,
                                },
                              })
                            }
                          >
                            {state.catalog.eventTriggers.map((trigger) => (
                              <MenuItem key={trigger.key} value={trigger.key}>
                                {trigger.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      <Typography sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>
                        Retention stages
                      </Typography>
                      <RetentionStageChips
                        value={state.draft.audience.criteria.retentionStages}
                        onToggle={(stage) => {
                          const nextStages = state.draft.audience.criteria.retentionStages.includes(stage)
                            ? state.draft.audience.criteria.retentionStages.filter((value) => value !== stage)
                            : [...state.draft.audience.criteria.retentionStages, stage];

                          dispatch({
                            type: 'updateAudienceCriteria',
                            patch: { retentionStages: nextStages },
                          });
                        }}
                      />

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1.5,
                        }}
                      >
                        <TextField
                          label="Partner ID (optional)"
                          value={state.draft.audience.criteria.partnerId ?? ''}
                          onChange={(event) =>
                            dispatch({
                              type: 'updateAudienceCriteria',
                              patch: {
                                partnerId: event.target.value.trim() || null,
                              },
                            })
                          }
                          fullWidth
                        />
                        <Box>
                          <Typography sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 600, mb: 1 }}>
                            Locales
                          </Typography>
                          <LocaleChips
                            value={state.draft.audience.criteria.locales}
                            onToggle={(locale) => {
                              const nextLocales = state.draft.audience.criteria.locales.includes(locale)
                                ? state.draft.audience.criteria.locales.filter((value) => value !== locale)
                                : [...state.draft.audience.criteria.locales, locale];

                              dispatch({
                                type: 'updateAudienceCriteria',
                                patch: { locales: nextLocales },
                              });
                            }}
                          />
                        </Box>
                      </Box>

                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={state.draft.audience.criteria.requiresPushOptIn}
                              onChange={(event) =>
                                dispatch({
                                  type: 'updateAudienceCriteria',
                                  patch: { requiresPushOptIn: event.target.checked },
                                })
                              }
                            />
                          }
                          label="Requires push opt-in"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={state.draft.audience.suppression.excludeConvertedUsers}
                              onChange={(event) =>
                                dispatch({
                                  type: 'updateSuppressionRules',
                                  patch: { excludeConvertedUsers: event.target.checked },
                                })
                              }
                            />
                          }
                          label="Exclude converted users"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={state.draft.audience.suppression.excludeRecentRecipients}
                              onChange={(event) =>
                                dispatch({
                                  type: 'updateSuppressionRules',
                                  patch: { excludeRecentRecipients: event.target.checked },
                                })
                              }
                            />
                          }
                          label="Exclude recent recipients"
                        />
                      </Stack>
                    </Stack>
                  </SectionCard>
                </Stack>
              )}

              {state.activeStep === CampaignEditorStep.TIMING && (
                <Stack spacing={2}>
                  <SectionCard title="Basics">
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                        gap: 1.5,
                      }}
                    >
                      <TextField label="Campaign name" value={state.draft.name} disabled fullWidth />
                      <TextField label="Goal" value={state.draft.goal} disabled fullWidth />
                    </Box>
                  </SectionCard>

                  <SectionCard title="Timing setup">
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {[
                          { value: 'immediately', label: 'Immediately' },
                          { value: 'after_delay', label: 'After delay' },
                          { value: 'specific_datetime', label: 'Specific date & time' },
                        ].map((option) => {
                          const selected = state.draft.timing.sendMode === option.value;
                          return (
                            <Chip
                              key={option.value}
                              label={option.label}
                              clickable
                              onClick={() =>
                                dispatch({
                                  type: 'updateTiming',
                                  patch: {
                                    sendMode: option.value as CampaignDraft['timing']['sendMode'],
                                  },
                                })
                              }
                              sx={{
                                bgcolor: selected ? COLORS.accentSoft : COLORS.surface,
                                color: selected ? COLORS.textPrimary : COLORS.textSecondary,
                                border: `1px solid ${selected ? COLORS.accent : COLORS.strokeSoft}`,
                              }}
                            />
                          );
                        })}
                      </Stack>

                      {state.draft.timing.sendMode === 'after_delay' && (
                        <TextField
                          label="Delay (minutes)"
                          type="number"
                          value={state.draft.timing.delayMinutes ?? 0}
                          onChange={(event) =>
                            dispatch({
                              type: 'updateTiming',
                              patch: { delayMinutes: Number(event.target.value) || 0 },
                            })
                          }
                          fullWidth
                        />
                      )}

                      {state.draft.timing.sendMode === 'specific_datetime' && (
                        <TextField
                          label="Specific date & time"
                          type="datetime-local"
                          value={toLocalDateTimeInputValue(state.draft.timing.scheduledAt)}
                          onChange={(event) =>
                            dispatch({
                              type: 'updateTiming',
                              patch: {
                                scheduledAt: fromLocalDateTimeInputValue(event.target.value),
                              },
                            })
                          }
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      )}

                      {state.draft.audience.trigger.type === 'scheduled_recurring' && (
                        <TextField
                          label="RRULE"
                          value={state.draft.audience.trigger.recurrenceRule}
                          onChange={(event) =>
                            dispatch({
                              type: 'changeTrigger',
                              trigger: {
                                type: 'scheduled_recurring',
                                recurrenceRule: event.target.value,
                              },
                            })
                          }
                          multiline
                          minRows={2}
                          fullWidth
                        />
                      )}

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1.5,
                        }}
                      >
                        <TextField
                          label="Quiet hours start"
                          type="time"
                          value={state.draft.timing.sendWindowStart}
                          onChange={(event) =>
                            dispatch({
                              type: 'updateTiming',
                              patch: { sendWindowStart: event.target.value },
                            })
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Quiet hours end"
                          type="time"
                          value={state.draft.timing.sendWindowEnd}
                          onChange={(event) =>
                            dispatch({
                              type: 'updateTiming',
                              patch: { sendWindowEnd: event.target.value },
                            })
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Frequency cap (hours)"
                          type="number"
                          value={state.draft.timing.frequencyCapHours ?? ''}
                          onChange={(event) =>
                            dispatch({
                              type: 'updateTiming',
                              patch: {
                                frequencyCapHours:
                                  event.target.value === ''
                                    ? null
                                    : Number(event.target.value),
                              },
                            })
                          }
                        />
                        <TextField
                          label="Timezone mode"
                          value="User local"
                          disabled
                        />
                      </Box>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={state.draft.timing.stopOnGoalReached}
                            onChange={(event) =>
                              dispatch({
                                type: 'updateTiming',
                                patch: { stopOnGoalReached: event.target.checked },
                              })
                            }
                          />
                        }
                        label="Stop on goal reached"
                      />
                    </Stack>
                  </SectionCard>
                </Stack>
              )}

              {state.activeStep === CampaignEditorStep.CONTENT && (
                <Stack spacing={2}>
                  <SectionCard title="Basics">
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                        gap: 1.5,
                      }}
                    >
                      <TextField label="Campaign name" value={state.draft.name} disabled fullWidth />
                      <TextField label="Goal" value={state.draft.goal} disabled fullWidth />
                    </Box>
                  </SectionCard>

                  <SectionCard
                    title="Localized content"
                    action={
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="text"
                          onClick={() =>
                            dispatch({ type: 'openDialog', dialog: 'templateLibrary' })
                          }
                          sx={{ color: COLORS.accent }}
                        >
                          Template library
                        </Button>
                        <Button
                          variant="text"
                          onClick={() =>
                            dispatch({
                              type: 'openDialog',
                              dialog: 'tokenPicker',
                              tokenTarget: { locale: activeLocale, field: 'title' },
                            })
                          }
                          sx={{ color: COLORS.accent }}
                        >
                          Insert token
                        </Button>
                      </Stack>
                    }
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1}>
                        {(['en', 'es', 'pt'] as CampaignLocale[]).map((locale) => (
                          <Chip
                            key={locale}
                            label={formatReadinessLabel(locale, readiness[locale])}
                            clickable
                            onClick={() => setActiveLocale(locale)}
                            sx={{
                              bgcolor:
                                activeLocale === locale ? COLORS.accentSoft : COLORS.surface,
                              color:
                                activeLocale === locale
                                  ? COLORS.textPrimary
                                  : readiness[locale] === 'ready'
                                    ? COLORS.success
                                    : readiness[locale] === 'warning'
                                      ? COLORS.warning
                                      : COLORS.danger,
                              border: `1px solid ${
                                activeLocale === locale ? COLORS.accent : COLORS.strokeSoft
                              }`,
                            }}
                          />
                        ))}
                      </Stack>

                      <TextField
                        label="Push title"
                        value={state.draft.content[activeLocale].title}
                        onChange={(event) =>
                          dispatch({
                            type: 'updateLocaleContent',
                            locale: activeLocale,
                            patch: { title: event.target.value },
                          })
                        }
                        fullWidth
                      />
                      <TextField
                        label="Push body"
                        value={state.draft.content[activeLocale].body}
                        onChange={(event) =>
                          dispatch({
                            type: 'updateLocaleContent',
                            locale: activeLocale,
                            patch: { body: event.target.value },
                          })
                        }
                        fullWidth
                        multiline
                        minRows={3}
                      />
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1.5,
                        }}
                      >
                        <TextField
                          label="Fallback first name"
                          value={state.draft.content[activeLocale].fallbackFirstName}
                          onChange={(event) =>
                            dispatch({
                              type: 'updateLocaleContent',
                              locale: activeLocale,
                              patch: { fallbackFirstName: event.target.value },
                            })
                          }
                          fullWidth
                        />
                        <FormControl fullWidth>
                          <Select
                            value={state.draft.content[activeLocale].deeplinkTarget}
                            onChange={(event) =>
                              dispatch({
                                type: 'changeDeeplink',
                                locale: activeLocale,
                                target: event.target.value as CampaignDeeplinkTarget,
                              })
                            }
                          >
                            {state.catalog.deeplinkOptions.map((option) => (
                              <MenuItem key={option.target} value={option.target}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {validationSummary.warnings.length > 0 && (
                        <Alert severity="warning">
                          {validationSummary.warnings.join(' ')}
                        </Alert>
                      )}
                    </Stack>
                  </SectionCard>
                </Stack>
              )}

              {state.activeStep === CampaignEditorStep.REVIEW && (
                <Stack spacing={2}>
                  <SectionCard title="Campaign summary">
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                        gap: 1.5,
                      }}
                    >
                      {reviewModel.basics.map((item) => (
                        <Box key={item.label}>
                          <Typography sx={{ color: COLORS.textMuted, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', mb: 0.45 }}>
                            {item.label}
                          </Typography>
                          <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 600 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </SectionCard>

                  <SectionCard title="Launch checklist">
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                        gap: 1.5,
                      }}
                    >
                      {[...reviewModel.audience, ...reviewModel.timing].map((item) => (
                        <Box key={`${item.label}-${item.value}`}>
                          <Typography sx={{ color: COLORS.textMuted, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', mb: 0.45 }}>
                            {item.label}
                          </Typography>
                          <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 600 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </SectionCard>

                  {validationSummary.warnings.length > 0 && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.75,
                        borderRadius: 4,
                        bgcolor: COLORS.warningSoft,
                        border: '1px solid #5B4522',
                      }}
                    >
                      <Typography sx={{ color: '#F7D9A2', fontSize: 13, fontWeight: 700, mb: 0.5 }}>
                        Action required before launch
                      </Typography>
                      <Typography sx={{ color: '#F5E6C8', fontSize: 12, lineHeight: 1.45 }}>
                        {validationSummary.warnings.join(' ')}
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              )}

              <Divider sx={{ borderColor: COLORS.strokeSoft }} />

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Stack direction="row" spacing={1.25} flexWrap="wrap">
                  {state.activeStep !== CampaignEditorStep.AUDIENCE && (
                    <Button
                      variant="outlined"
                      onClick={goToPreviousStep}
                      sx={{
                        borderColor: COLORS.stroke,
                        color: COLORS.textPrimary,
                        borderRadius: 999,
                      }}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    variant="text"
                    onClick={() => {
                      if (state.isDirty) {
                        dispatch({ type: 'openDialog', dialog: 'discardChanges' });
                      } else {
                        router.push('/dashboard/campaigns');
                      }
                    }}
                    sx={{ color: COLORS.textSecondary }}
                  >
                    {state.activeStep === CampaignEditorStep.REVIEW ? 'Discard Changes' : 'Cancel'}
                  </Button>

                  {state.activeStep === CampaignEditorStep.REVIEW && (
                    <Button
                      variant="outlined"
                      startIcon={<Science />}
                      onClick={() => dispatch({ type: 'openDialog', dialog: 'sendTest' })}
                      disabled={!canSendTest || isSaving}
                      sx={{
                        borderColor: COLORS.stroke,
                        color: COLORS.textPrimary,
                        borderRadius: 999,
                      }}
                    >
                      Send Test
                    </Button>
                  )}

                  {state.activeStep === CampaignEditorStep.REVIEW && canArchive && (
                    <Button
                      variant="outlined"
                      startIcon={<Archive />}
                      onClick={() =>
                        dispatch({ type: 'openDialog', dialog: 'archiveCampaign' })
                      }
                      sx={{
                        borderColor: `${COLORS.danger}66`,
                        color: COLORS.danger,
                        borderRadius: 999,
                      }}
                    >
                      Archive Campaign
                    </Button>
                  )}
                </Stack>

                {state.activeStep === CampaignEditorStep.REVIEW ? (
                  <Button
                    variant="contained"
                    onClick={() => dispatch({ type: 'openDialog', dialog: 'schedule' })}
                    disabled={!canSchedule || isSaving}
                    sx={{
                      borderRadius: 999,
                      bgcolor: COLORS.accent,
                      '&:hover': { bgcolor: '#6E60FF' },
                    }}
                  >
                    Schedule Campaign
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={goToNextStep}
                    disabled={!canContinue}
                    sx={{
                      borderRadius: 999,
                      bgcolor: COLORS.accent,
                      '&:hover': { bgcolor: '#6E60FF' },
                    }}
                  >
                    {actionLabel}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>

          <Stack spacing={2}>
            {state.activeStep === CampaignEditorStep.AUDIENCE && (
              <>
                <SummaryCard title="Audience preview">
                  <Box>
                    <Typography sx={{ color: COLORS.textMuted, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', mb: 0.45 }}>
                      Reach estimate
                    </Typography>
                    <Typography sx={{ color: COLORS.textPrimary, fontSize: 20, fontWeight: 700 }}>
                      {state.estimate?.reachableUsers.toLocaleString('en-US') ?? '0'}
                    </Typography>
                    <Typography sx={{ color: COLORS.textSecondary, fontSize: 12, mt: 0.5 }}>
                      Live audience estimate returned by the campaigns backend.
                    </Typography>
                  </Box>
                  {state.estimate?.warnings.map((warning) => (
                    <Alert key={warning} severity="warning">
                      {warning}
                    </Alert>
                  ))}
                </SummaryCard>

                <SummaryCard title="Rule builder notes">
                  <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 700 }}>
                    Match the Pencil builder
                  </Typography>
                  <Typography sx={{ color: COLORS.textSecondary, fontSize: 12, lineHeight: 1.45 }}>
                    Library selections now tag the live source on the campaign, and the audience rules below stay fully editable before save or launch.
                  </Typography>
                </SummaryCard>
              </>
            )}

            {state.activeStep === CampaignEditorStep.TIMING && (
              <>
                <SummaryCard title="Schedule preview">
                  <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 700 }}>
                    {state.draft.timing.sendMode === 'specific_datetime'
                      ? toLocalDateTimeInputValue(state.draft.timing.scheduledAt) || 'Pick a launch time'
                      : state.draft.timing.sendMode === 'after_delay'
                        ? `${state.draft.timing.delayMinutes ?? 0} minute delay`
                        : 'Immediate send'}
                  </Typography>
                  <Typography sx={{ color: COLORS.textSecondary, fontSize: 12 }}>
                    {state.draft.timing.sendWindowStart} - {state.draft.timing.sendWindowEnd} · user local timezone
                  </Typography>
                </SummaryCard>

                <SummaryCard title="Guardrails">
                  <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 700 }}>
                    Frequency cap
                  </Typography>
                  <Typography sx={{ color: COLORS.textSecondary, fontSize: 12 }}>
                    {state.draft.timing.frequencyCapHours === null
                      ? 'Missing while recent-recipient suppression is enabled.'
                      : `${state.draft.timing.frequencyCapHours} hours between sends`}
                  </Typography>
                  <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 700, mt: 1 }}>
                    Automation
                  </Typography>
                  <Typography sx={{ color: COLORS.textSecondary, fontSize: 12 }}>
                    {state.draft.timing.stopOnGoalReached
                      ? 'Campaign stops as soon as the goal is achieved.'
                      : 'Campaign continues after goal completion.'}
                  </Typography>
                </SummaryCard>
              </>
            )}

            {state.activeStep === CampaignEditorStep.CONTENT && (
              <>
                <SummaryCard title="Live preview">
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      bgcolor: COLORS.surface,
                    }}
                  >
                    <Typography sx={{ color: COLORS.textMuted, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', mb: 0.75 }}>
                      Push notification · {activeLocale.toUpperCase()}
                    </Typography>
                    <Typography sx={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: 700, mb: 0.75 }}>
                      {state.draft.content[activeLocale].title || 'No title yet'}
                    </Typography>
                    <Typography sx={{ color: COLORS.textSecondary, fontSize: 12, lineHeight: 1.45 }}>
                      {state.draft.content[activeLocale].body || 'No body copy yet'}
                    </Typography>
                  </Paper>
                </SummaryCard>

                <SummaryCard title="Content helpers">
                  {state.catalog.tokens.map((token) => (
                    <Box key={token.key}>
                      <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 700 }}>
                        {token.label}
                      </Typography>
                      <Typography sx={{ color: COLORS.textSecondary, fontSize: 12, lineHeight: 1.45 }}>
                        {token.description}
                      </Typography>
                    </Box>
                  ))}
                </SummaryCard>
              </>
            )}

            {state.activeStep === CampaignEditorStep.REVIEW && (
              <>
                <SummaryCard title="Launch plan">
                  {reviewModel.launchPlan.map((item) => (
                    <Typography key={item} sx={{ color: COLORS.textSecondary, fontSize: 12, lineHeight: 1.45 }}>
                      {item}
                    </Typography>
                  ))}
                </SummaryCard>

                <SummaryCard title="Pre-flight checks">
                  {reviewModel.preflightChecks.map((check) => (
                    <Paper
                      key={check.label}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 3.5,
                        bgcolor: check.status === 'ready' ? COLORS.soft : COLORS.accentSoft,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                        {check.status === 'ready' ? (
                          <CheckCircle sx={{ color: COLORS.success, fontSize: 18 }} />
                        ) : (
                          <WarningAmber sx={{ color: COLORS.warning, fontSize: 18 }} />
                        )}
                        <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 700 }}>
                          {check.label}
                        </Typography>
                      </Stack>
                      <Typography sx={{ color: COLORS.textSecondary, fontSize: 12, lineHeight: 1.45 }}>
                        {check.detail}
                      </Typography>
                    </Paper>
                  ))}
                </SummaryCard>

                <SummaryCard title="Locale health">
                  {(Object.keys(readiness) as CampaignLocale[]).map((locale) => (
                    <Paper
                      key={locale}
                      elevation={0}
                      sx={{
                        p: 1.25,
                        borderRadius: 3.5,
                        bgcolor:
                          readiness[locale] === 'ready' ? COLORS.soft : COLORS.accentSoft,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography sx={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 700 }}>
                          {formatReadinessLabel(locale, readiness[locale])}
                        </Typography>
                        <Typography sx={{ color: COLORS.textSecondary, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}>
                          {readiness[locale] === 'ready' ? '2 variants' : 'fallback missing'}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </SummaryCard>
              </>
            )}
          </Stack>
        </Box>
      </Box>

      <Dialog
        open={state.dialogs.saveSegment}
        onClose={() => dispatch({ type: 'closeDialog', dialog: 'saveSegment' })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Save current segment</DialogTitle>
        <DialogContent>
          <TextField
            label="Segment name"
            fullWidth
            autoFocus
            margin="dense"
            value={segmentName}
            onChange={(event) => setSegmentName(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch({ type: 'closeDialog', dialog: 'saveSegment' })}>
            Cancel
          </Button>
          <Button onClick={handleSaveSegment} variant="contained" disabled={isSaving}>
            Save segment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.templateLibrary}
        onClose={() => dispatch({ type: 'closeDialog', dialog: 'templateLibrary' })}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Template library</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25}>
            {state.catalog.templates.map((template) => (
              <Paper
                key={template.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 3.5,
                  bgcolor: COLORS.soft,
                  border: `1px solid ${COLORS.strokeSoft}`,
                }}
              >
                <Typography sx={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: 700, mb: 0.35 }}>
                  {template.name}
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 12, mb: 1 }}>
                  {template.description}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    applyTemplate(template.id);
                    dispatch({ type: 'closeDialog', dialog: 'templateLibrary' });
                  }}
                >
                  Apply template
                </Button>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={state.dialogs.tokenPicker}
        onClose={() => dispatch({ type: 'closeDialog', dialog: 'tokenPicker' })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Insert token</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25}>
            <FormControl fullWidth>
              <Select
                value={state.tokenTarget?.field ?? 'title'}
                onChange={(event) =>
                  dispatch({
                    type: 'openDialog',
                    dialog: 'tokenPicker',
                    tokenTarget: {
                      locale: state.tokenTarget?.locale ?? activeLocale,
                      field: event.target.value as 'title' | 'body',
                    },
                  })
                }
              >
                <MenuItem value="title">Insert into title</MenuItem>
                <MenuItem value="body">Insert into body</MenuItem>
              </Select>
            </FormControl>
            {state.catalog.tokens.map((token) => (
              <Paper
                key={token.key}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 3.5,
                  bgcolor: COLORS.soft,
                  border: `1px solid ${COLORS.strokeSoft}`,
                }}
              >
                <Typography sx={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: 700, mb: 0.35 }}>
                  {token.token}
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 12, mb: 1 }}>
                  {token.description}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    dispatch({
                      type: 'insertToken',
                      locale: state.tokenTarget?.locale ?? activeLocale,
                      field: state.tokenTarget?.field ?? 'title',
                      token: token.token,
                    });
                    dispatch({ type: 'closeDialog', dialog: 'tokenPicker' });
                  }}
                >
                  Insert
                </Button>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={state.dialogs.sendTest}
        onClose={() => dispatch({ type: 'closeDialog', dialog: 'sendTest' })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Send test push</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <TextField
              label="Recipients"
              placeholder={
                currentAdminEmail
                  ? `Defaults to ${currentAdminEmail}`
                  : 'Leave blank to use the authenticated admin user'
              }
              fullWidth
              multiline
              minRows={2}
              value={testRecipients}
              onChange={(event) => setTestRecipients(event.target.value)}
            />
            <FormControl fullWidth>
              <Select
                value={testLocale}
                onChange={(event) =>
                  setTestLocale(event.target.value as CampaignLocale)
                }
              >
                {(['en', 'es', 'pt'] as CampaignLocale[]).map((locale) => (
                  <MenuItem key={locale} value={locale}>
                    {locale.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch({ type: 'closeDialog', dialog: 'sendTest' })}>
            Cancel
          </Button>
          <Button onClick={handleSendTest} variant="contained" disabled={isSaving}>
            Send test
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.schedule}
        onClose={() => dispatch({ type: 'closeDialog', dialog: 'schedule' })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Schedule campaign</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.5 }}>
            This action schedules the current campaign using the timing rules in the builder and keeps you on the edit route.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch({ type: 'closeDialog', dialog: 'schedule' })}>
            Cancel
          </Button>
          <Button onClick={handleScheduleCampaign} variant="contained" disabled={isSaving || !canSchedule}>
            Confirm schedule
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.discardChanges}
        onClose={() => dispatch({ type: 'closeDialog', dialog: 'discardChanges' })}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Discard changes?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.5 }}>
            This resets the builder back to the last persisted draft snapshot.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch({ type: 'closeDialog', dialog: 'discardChanges' })}>
            Keep editing
          </Button>
          <Button
            color="error"
            onClick={() =>
              dispatch({
                type: 'discardChanges',
                fallbackDraft:
                  mode === 'create' && state.lastPersistedDraft === null
                    ? createEmptyCampaignDraft(state.catalog)
                    : undefined,
              })
            }
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.archiveCampaign}
        onClose={() => dispatch({ type: 'closeDialog', dialog: 'archiveCampaign' })}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Archive campaign?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.5 }}>
            Archiving disables further scheduling actions but keeps the draft available for review.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch({ type: 'closeDialog', dialog: 'archiveCampaign' })}>
            Cancel
          </Button>
          <Button color="error" onClick={handleArchiveCampaign} disabled={isSaving}>
            Archive
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CampaignEditorPage;
