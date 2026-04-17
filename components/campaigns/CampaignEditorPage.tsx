'use client';

/**
 * Renders the shared create/edit campaign builder with live backend actions.
 */

import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
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
  Delete,
  Save,
  Science,
} from '@mui/icons-material';
import {
  RETENTION_STAGE_LABELS,
  RetentionStage,
  getUser,
  type User,
} from '@/lib/api/users';
import { CampaignAudienceUserPickerDialog } from '@/components/campaigns/CampaignAudienceUserPickerDialog';
import { campaignsRepository } from '@/modules/campaigns/repository';
import type {
  CampaignDeeplinkTarget,
  CampaignDraft,
  CampaignLocale,
  CampaignScenarioTemplateSummary,
  CampaignStatus,
  UpsertCampaignDraftRequest,
} from '@/modules/campaigns/contracts';
import { createEmptyCampaignDraft, createJourneyStep } from '@/modules/campaigns/defaults';
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
  panel: '#1a1a1a',
  surface: '#232323',
  soft: '#2c2c2c',
  accent: '#c44d36',
  accentSoft: '#3a2019',
  textPrimary: '#f5f5f5',
  textSecondary: '#b0b0b0',
  stroke: '#3b3b3b',
  success: '#66bb6a',
  warning: '#f0a63a',
  danger: '#e05a5a',
};

const STEP_ORDER: CampaignEditorStep[] = [
  CampaignEditorStep.AUDIENCE,
  CampaignEditorStep.TRIGGER_JOURNEY,
  CampaignEditorStep.STEP_CONTENT,
  CampaignEditorStep.REVIEW,
];

const STEP_LABELS: Record<CampaignEditorStep, string> = {
  [CampaignEditorStep.AUDIENCE]: 'Audience',
  [CampaignEditorStep.TRIGGER_JOURNEY]: 'Trigger + Journey',
  [CampaignEditorStep.STEP_CONTENT]: 'Step Content',
  [CampaignEditorStep.REVIEW]: 'Review',
};

interface CampaignEditorPageProps {
  mode: 'create' | 'edit';
  campaignId?: string;
}

function buildUpsertPayload(draft: CampaignDraft): UpsertCampaignDraftRequest {
  return {
    name: draft.name,
    goal: draft.goal,
    channel: draft.channel,
    audience: draft.audience,
    trigger: draft.trigger,
    journey: draft.journey,
    content: draft.content,
  };
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

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        bgcolor: COLORS.surface,
        border: `1px solid ${COLORS.stroke}`,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1.5 }}
      >
        <Typography
          sx={{ color: COLORS.textPrimary, fontSize: 16, fontWeight: 700 }}
        >
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
        border: `1px solid ${selected ? COLORS.accent : COLORS.stroke}`,
      }}
    >
      {label}
    </Button>
  );
}

function ToggleChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Chip
      label={label}
      clickable
      onClick={onClick}
      sx={{
        bgcolor: selected ? COLORS.accentSoft : COLORS.soft,
        color: selected ? COLORS.textPrimary : COLORS.textSecondary,
        border: `1px solid ${selected ? COLORS.accent : COLORS.stroke}`,
      }}
    />
  );
}

function getAudienceUserLabel(user: User): string {
  return (
    user.name_app ||
    user.name_tg ||
    user.email ||
    user.telegram_username ||
    user.id
  );
}

function formatTriggerTypeLabel(trigger: CampaignDraft['trigger']['type']): string {
  if (trigger === 'state_based') {
    return 'State based';
  }

  if (trigger === 'event_based') {
    return 'Event based';
  }

  return 'Scheduled';
}

function describeScenarioTemplate(
  template: CampaignScenarioTemplateSummary,
): string {
  return [
    formatTriggerTypeLabel(template.definition.trigger.type),
    `${template.definition.journey.steps.length} step${
      template.definition.journey.steps.length === 1 ? '' : 's'
    }`,
  ].join(' · ');
}

export function CampaignEditorPage({
  mode,
  campaignId,
}: CampaignEditorPageProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(campaignEditorReducer, undefined, () =>
    createCampaignEditorState()
  );
  const [activeLocale, setActiveLocale] = useState<CampaignLocale>('en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [saveSegmentName, setSaveSegmentName] = useState('');
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateDescription, setSaveTemplateDescription] = useState('');
  const [testRecipients, setTestRecipients] = useState('spec@local.test');
  const [testLocale, setTestLocale] = useState<CampaignLocale>('en');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);

  const validation = useMemo(
    () => getCampaignValidationSummary(state.draft),
    [state.draft]
  );
  const readiness = useMemo(
    () => getCampaignLocaleReadiness(state.draft.content),
    [state.draft.content]
  );
  const reviewModel = useMemo(
    () => buildCampaignReviewModel(state.draft),
    [state.draft]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const catalog = await campaignsRepository.getEditorCatalog();
        if (cancelled) {
          return;
        }

        if (mode === 'edit' && campaignId) {
          const draft = await campaignsRepository.getCampaign(campaignId);
          if (cancelled) {
            return;
          }

          dispatch({
            type: 'loadDraft',
            draft,
            catalog,
            lastPersistedDraft: draft,
          });
        } else {
          dispatch({
            type: 'loadDraft',
            draft: createEmptyCampaignDraft(catalog),
            catalog,
            lastPersistedDraft: null,
          });
        }

        setIsInitialized(true);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load campaign editor'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [campaignId, mode]);

  useEffect(() => {
    let cancelled = false;
    const userIds = state.draft.audience.criteria.userIds;

    if (userIds.length === 0) {
      setSelectedUsers([]);
      return;
    }

    async function loadSelectedUsers() {
      const users = await Promise.all(
        userIds.map(async (userId) => {
          try {
            return await getUser(userId);
          } catch {
            return null;
          }
        })
      );

      if (!cancelled) {
        setSelectedUsers(users.filter((user): user is User => user !== null));
      }
    }

    void loadSelectedUsers();

    return () => {
      cancelled = true;
    };
  }, [state.draft.audience.criteria.userIds]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    let cancelled = false;

    async function estimateAudience() {
      try {
        const estimate = await campaignsRepository.estimateAudience({
          audience: state.draft.audience,
        });

        if (!cancelled) {
          dispatch({ type: 'setEstimate', estimate });
        }
      } catch {
        if (!cancelled) {
          dispatch({ type: 'setEstimate', estimate: null });
        }
      }
    }

    void estimateAudience();

    return () => {
      cancelled = true;
    };
  }, [isInitialized, state.draft.audience]);

  async function persistDraft(): Promise<CampaignDraft> {
    const payload = buildUpsertPayload(state.draft);
    const saved =
      state.draft.id === null
        ? await campaignsRepository.createCampaignDraft(payload)
        : await campaignsRepository.updateCampaignDraft(
            state.draft.id,
            payload
          );

    dispatch({
      type: 'markSaveSuccess',
      draft: saved,
      message: 'Draft saved successfully.',
    });

    if (state.draft.id === null && saved.id) {
      router.replace(`/dashboard/campaigns/${saved.id}`);
    }

    return saved;
  }

  async function ensurePersistedDraft(): Promise<CampaignDraft> {
    if (state.draft.id !== null && !state.isDirty) {
      return state.draft;
    }

    return persistDraft();
  }

  async function handleSave() {
    try {
      await persistDraft();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Failed to save draft'
      );
    }
  }

  async function handleSendTest() {
    try {
      const saved = await ensurePersistedDraft();
      const response = await campaignsRepository.sendTestCampaign(saved.id!, {
        recipients: testRecipients
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        locale: testLocale,
      });

      dispatch({
        type: 'closeDialog',
        dialog: 'sendTest',
      });
      dispatch({
        type: 'markActionSuccess',
        kind: 'test',
        message: 'Test accepted successfully.',
        warnings: response.warnings,
      });
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to send test campaign'
      );
    }
  }

  async function handleSchedule() {
    try {
      const saved = await ensurePersistedDraft();
      const response = await campaignsRepository.scheduleCampaign(saved.id!, {
        confirm: true,
      });

      dispatch({
        type: 'closeDialog',
        dialog: 'schedule',
      });
      dispatch({
        type: 'markActionSuccess',
        kind: 'schedule',
        draft: response.campaign,
        message: 'Campaign scheduled successfully.',
      });
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to schedule campaign'
      );
    }
  }

  async function handleArchive() {
    if (!state.draft.id) {
      return;
    }

    try {
      const response = await campaignsRepository.archiveCampaign(
        state.draft.id,
        {
          confirm: true,
        }
      );

      dispatch({
        type: 'closeDialog',
        dialog: 'archiveCampaign',
      });
      dispatch({
        type: 'markActionSuccess',
        kind: 'archive',
        draft: response.campaign,
        message: 'Campaign archived successfully.',
      });
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to archive campaign'
      );
    }
  }

  async function handleSaveSegment() {
    if (!saveSegmentName.trim()) {
      return;
    }

    try {
      await campaignsRepository.saveSegment({
        name: saveSegmentName.trim(),
        audience: state.draft.audience,
      });

      const catalog = await campaignsRepository.getEditorCatalog();
      dispatch({ type: 'setCatalog', catalog });
      dispatch({ type: 'closeDialog', dialog: 'saveSegment' });
      dispatch({
        type: 'markActionSuccess',
        kind: 'segment',
        message: 'Audience saved as segment.',
      });
      setSaveSegmentName('');
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to save segment'
      );
    }
  }

  async function handleSaveTemplate() {
    if (!saveTemplateName.trim()) {
      return;
    }

    try {
      await campaignsRepository.saveTemplate({
        name: saveTemplateName.trim(),
        description: saveTemplateDescription.trim() || undefined,
        definition: buildUpsertPayload(state.draft),
      });

      const catalog = await campaignsRepository.getEditorCatalog();
      dispatch({ type: 'setCatalog', catalog });
      dispatch({ type: 'closeDialog', dialog: 'saveTemplate' });
      dispatch({
        type: 'markActionSuccess',
        kind: 'template',
        message: 'Campaign saved as template.',
      });
      setSaveTemplateName('');
      setSaveTemplateDescription('');
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to save campaign template'
      );
    }
  }

  function toggleRetentionStage(stage: RetentionStage) {
    const nextStages = state.draft.audience.criteria.retentionStages.includes(
      stage
    )
      ? state.draft.audience.criteria.retentionStages.filter(
          (item) => item !== stage
        )
      : [...state.draft.audience.criteria.retentionStages, stage];

    dispatch({
      type: 'updateAudienceCriteria',
      patch: { retentionStages: nextStages },
    });
  }

  function toggleLocale(locale: CampaignLocale) {
    const nextLocales = state.draft.audience.criteria.locales.includes(locale)
      ? state.draft.audience.criteria.locales.filter((item) => item !== locale)
      : [...state.draft.audience.criteria.locales, locale];

    dispatch({
      type: 'updateAudienceCriteria',
      patch: { locales: nextLocales },
    });
  }

  function addJourneyStep() {
    const nextStep = createJourneyStep(state.draft.journey.steps.length + 1);
    const defaultDeeplink =
      state.catalog.deeplinkOptions[0]?.target ?? 'continue_onboarding';

    dispatch({
      type: 'appendJourneyStep',
      step: nextStep,
      deeplinkTarget: defaultDeeplink,
    });
  }

  function goToStep(direction: 'back' | 'next') {
    const currentIndex = STEP_ORDER.indexOf(state.activeStep);
    const nextIndex =
      direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    const nextStep = STEP_ORDER[nextIndex];

    if (!nextStep) {
      return;
    }

    dispatch({ type: 'setActiveStep', step: nextStep });
  }

  const activeStepContent =
    state.draft.content[state.activeContentStepKey]?.[activeLocale];
  const stateBasedTrigger =
    state.draft.trigger.type === 'state_based' ? state.draft.trigger : null;
  const eventBasedTrigger =
    state.draft.trigger.type === 'event_based' ? state.draft.trigger : null;
  const scheduledTrigger =
    state.draft.trigger.type === 'scheduled_recurring'
      ? state.draft.trigger
      : null;
  const canSaveTemplate = validation.errors.length === 0;

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.canvas, px: 3, py: 4 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/dashboard/campaigns')}
            sx={{ color: COLORS.textSecondary }}
          >
            Back to campaigns
          </Button>
          <Chip
            label={formatStatus(state.draft.status)}
            sx={getStatusChipStyles(state.draft.status)}
          />
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {state.lastActionResult ? (
          <Alert severity="success">
            {state.lastActionResult.message}
            {state.lastActionResult.warnings?.length
              ? ` ${state.lastActionResult.warnings.join(' ')}`
              : ''}
          </Alert>
        ) : null}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 1fr) 320px',
            },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <SectionCard
            title={mode === 'create' ? 'Create campaign' : 'Edit campaign'}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSaveTemplateName(
                      state.draft.name.trim() || 'Reusable campaign template'
                    );
                    setSaveTemplateDescription('');
                    dispatch({ type: 'openDialog', dialog: 'saveTemplate' });
                  }}
                  disabled={!canSaveTemplate}
                  sx={{
                    color: COLORS.textPrimary,
                    borderColor: COLORS.stroke,
                  }}
                >
                  Save as template
                </Button>
                <Button
                  startIcon={<Save />}
                  onClick={handleSave}
                  sx={{ color: COLORS.textPrimary }}
                >
                  Save draft
                </Button>
              </Stack>
            }
          >
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
              </Stack>

              {state.catalog.scenarioTemplates.length > 0 ? (
                <SectionCard title="Scenario templates">
                  <Stack spacing={1.5}>
                    <Typography sx={{ color: COLORS.textSecondary }}>
                      Use a ready-made scenario to prefill audience, trigger,
                      journey, and draft copy. Applying a template replaces the
                      current builder setup.
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          xl: 'repeat(2, minmax(0, 1fr))',
                        },
                        gap: 1.5,
                      }}
                    >
                      {state.catalog.scenarioTemplates.map((template) => (
                        <Paper
                          key={template.id}
                          sx={{
                            p: 1.5,
                            bgcolor: COLORS.soft,
                            border: `1px solid ${COLORS.stroke}`,
                          }}
                        >
                          <Stack spacing={1.25}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={1}
                            >
                              <Box>
                                <Typography
                                  sx={{
                                    color: COLORS.textPrimary,
                                    fontWeight: 700,
                                  }}
                                >
                                  {template.name}
                                </Typography>
                                <Typography
                                  sx={{
                                    color: COLORS.textSecondary,
                                    fontSize: 13,
                                    mt: 0.5,
                                  }}
                                >
                                  {template.description}
                                </Typography>
                              </Box>
                              <Chip
                                label={
                                  template.source === 'saved'
                                    ? 'Saved'
                                    : 'Shipped'
                                }
                                size="small"
                                sx={{
                                  bgcolor:
                                    template.source === 'saved'
                                      ? COLORS.accentSoft
                                      : COLORS.panel,
                                  color: COLORS.textSecondary,
                                  border: `1px solid ${COLORS.stroke}`,
                                }}
                              />
                            </Stack>

                            <Typography
                              sx={{
                                color: COLORS.textSecondary,
                                fontSize: 12,
                              }}
                            >
                              {describeScenarioTemplate(template)}
                            </Typography>

                            <Button
                              variant="outlined"
                              onClick={() =>
                                dispatch({
                                  type: 'applyScenarioTemplate',
                                  template,
                                })
                              }
                              sx={{
                                alignSelf: 'flex-start',
                                color: COLORS.textPrimary,
                                borderColor: COLORS.stroke,
                              }}
                            >
                              Apply template
                            </Button>
                          </Stack>
                        </Paper>
                      ))}
                    </Box>
                  </Stack>
                </SectionCard>
              ) : null}

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {STEP_ORDER.map((step) => (
                  <StepButton
                    key={step}
                    label={STEP_LABELS[step]}
                    selected={state.activeStep === step}
                    onClick={() => dispatch({ type: 'setActiveStep', step })}
                  />
                ))}
              </Stack>

              {state.activeStep === CampaignEditorStep.AUDIENCE ? (
                <Stack spacing={2}>
                  <SectionCard title="Audience source">
                    <Typography sx={{ color: COLORS.textSecondary, mb: 1 }}>
                      Build the audience with manual rules or start from a
                      saved audience segment.
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button
                          variant={
                            state.draft.audience.segmentSource ===
                            'manual_rules'
                              ? 'contained'
                              : 'outlined'
                          }
                          onClick={() =>
                            dispatch({
                              type: 'changeSegmentSource',
                              segmentSource: 'manual_rules',
                              sourceSegmentId: null,
                            })
                          }
                          sx={{
                            bgcolor:
                              state.draft.audience.segmentSource ===
                              'manual_rules'
                                ? COLORS.accent
                                : 'transparent',
                            color: COLORS.textPrimary,
                            borderColor: COLORS.stroke,
                          }}
                        >
                          Manual rules
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            dispatch({ type: 'openDialog', dialog: 'saveSegment' })
                          }
                          sx={{
                            color: COLORS.textPrimary,
                            borderColor: COLORS.stroke,
                          }}
                        >
                          Save current audience
                        </Button>
                      </Stack>

                      <Typography sx={{ color: COLORS.textPrimary }}>
                        Current source:{' '}
                        {state.draft.audience.segmentSource.replace(/_/g, ' ')}
                      </Typography>

                      {state.catalog.savedSegments.length > 0 ? (
                        <Stack spacing={1}>
                          <Typography
                            sx={{ color: COLORS.textPrimary, fontWeight: 600 }}
                          >
                            Saved audiences
                          </Typography>
                          {state.catalog.savedSegments.map((segment) => (
                            <Paper
                              key={segment.id}
                              onClick={() => {
                                if (!segment.audienceDefinition) {
                                  return;
                                }

                                dispatch({
                                  type: 'applySavedSegment',
                                  segmentId: segment.id,
                                  audience: {
                                    ...segment.audienceDefinition,
                                    segmentSource: 'saved_segment',
                                    sourceSegmentId: segment.id,
                                  },
                                });
                              }}
                              sx={{
                                p: 1.5,
                                cursor: segment.audienceDefinition
                                  ? 'pointer'
                                  : 'default',
                                bgcolor:
                                  state.draft.audience.sourceSegmentId ===
                                  segment.id
                                    ? COLORS.accentSoft
                                    : COLORS.soft,
                                border: `1px solid ${COLORS.stroke}`,
                              }}
                            >
                              <Typography
                                sx={{
                                  color: COLORS.textPrimary,
                                  fontWeight: 600,
                                }}
                              >
                                {segment.name}
                              </Typography>
                              <Typography
                                sx={{ color: COLORS.textSecondary, fontSize: 13 }}
                              >
                                {segment.description}
                              </Typography>
                            </Paper>
                          ))}
                        </Stack>
                      ) : null}

                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        sx={{ mb: 1 }}
                      >
                        <Box>
                          <Typography
                            sx={{ color: COLORS.textPrimary, fontWeight: 600 }}
                          >
                            Specific users
                          </Typography>
                          <Typography
                            sx={{ color: COLORS.textSecondary, fontSize: 13 }}
                          >
                            Start from a hand-picked list of users. You can
                            search them by name or e-mail.
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          onClick={() => setIsUserPickerOpen(true)}
                          sx={{
                            color: COLORS.textPrimary,
                            borderColor: COLORS.stroke,
                          }}
                        >
                          Add users
                        </Button>
                      </Stack>

                      {selectedUsers.length > 0 ? (
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {selectedUsers.map((user) => (
                            <Chip
                              key={user.id}
                              label={getAudienceUserLabel(user)}
                              onDelete={() =>
                                dispatch({
                                  type: 'updateAudienceCriteria',
                                  patch: {
                                    userIds:
                                      state.draft.audience.criteria.userIds.filter(
                                        (userId) => userId !== user.id
                                      ),
                                  },
                                })
                              }
                              sx={{
                                bgcolor: COLORS.soft,
                                color: COLORS.textPrimary,
                                border: `1px solid ${COLORS.stroke}`,
                              }}
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Typography
                          sx={{ color: COLORS.textSecondary, fontSize: 13 }}
                        >
                          No specific users selected yet.
                        </Typography>
                      )}
                    </Stack>
                  </SectionCard>

                  <SectionCard title="Retention stages">
                    <Typography
                      sx={{
                        color: COLORS.textSecondary,
                        mb: 1.5,
                        fontSize: 13,
                      }}
                    >
                      Choose which lifecycle stages should enter the audience.
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {Object.values(RetentionStage).map((stage) => (
                        <ToggleChip
                          key={stage}
                          label={RETENTION_STAGE_LABELS[stage]}
                          selected={state.draft.audience.criteria.retentionStages.includes(
                            stage
                          )}
                          onClick={() => toggleRetentionStage(stage)}
                        />
                      ))}
                    </Stack>
                  </SectionCard>

                  <SectionCard title="Locales">
                    <Typography
                      sx={{
                        color: COLORS.textSecondary,
                        mb: 1.5,
                        fontSize: 13,
                      }}
                    >
                      Use the language groups that should receive this campaign.
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {(['en', 'es', 'pt'] as CampaignLocale[]).map(
                        (locale) => (
                          <ToggleChip
                            key={locale}
                            label={locale.toUpperCase()}
                            selected={state.draft.audience.criteria.locales.includes(
                              locale
                            )}
                            onClick={() => toggleLocale(locale)}
                          />
                        )
                      )}
                    </Stack>
                  </SectionCard>

                  <SectionCard title="Filters">
                    <Stack spacing={2}>
                      <Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                state.draft.audience.suppression
                                  .excludeConvertedUsers
                              }
                              onChange={(event) =>
                                dispatch({
                                  type: 'updateSuppressionRules',
                                  patch: {
                                    excludeConvertedUsers: event.target.checked,
                                  },
                                })
                              }
                            />
                          }
                          label="Exclude converted users"
                        />
                        <Typography
                          sx={{ color: COLORS.textSecondary, fontSize: 13 }}
                        >
                          Skip users who already reached the campaign goal.
                        </Typography>
                      </Box>

                      <Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                state.draft.audience.suppression
                                  .excludeUsersWithoutPushOpens
                              }
                              onChange={(event) =>
                                dispatch({
                                  type: 'updateSuppressionRules',
                                  patch: {
                                    excludeUsersWithoutPushOpens:
                                      event.target.checked,
                                  },
                                })
                              }
                            />
                          }
                          label="Exclude users who never open campaign pushes"
                        />
                        <Typography
                          sx={{ color: COLORS.textSecondary, fontSize: 13 }}
                        >
                          Skip users who have never opened a push from previous
                          campaigns.
                        </Typography>
                      </Box>
                    </Stack>
                  </SectionCard>
                </Stack>
              ) : null}

              {state.activeStep === CampaignEditorStep.TRIGGER_JOURNEY ? (
                <Stack spacing={2}>
                  <SectionCard title="Trigger">
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1}>
                        {[
                          { label: 'State based', value: 'state_based' },
                          { label: 'Source event', value: 'event_based' },
                          { label: 'Scheduled', value: 'scheduled_recurring' },
                        ].map((option) => (
                          <ToggleChip
                            key={option.value}
                            label={option.label}
                            selected={state.draft.trigger.type === option.value}
                            onClick={() => {
                              if (option.value === 'state_based') {
                                dispatch({
                                  type: 'changeTrigger',
                                  trigger: {
                                    type: 'state_based',
                                    qualificationMode:
                                      'when_user_matches_audience',
                                    reentryCooldownHours: 24,
                                  },
                                });
                              } else if (option.value === 'event_based') {
                                const defaultEvent =
                                  state.catalog.sourceEvents[0];
                                dispatch({
                                  type: 'changeTrigger',
                                  trigger: {
                                    type: 'event_based',
                                    eventKey:
                                      defaultEvent?.eventKey ?? 'app_opened',
                                    producerKey:
                                      defaultEvent?.producerKey ??
                                      'crm_source_events',
                                    entryMode: 'first_eligible_event',
                                    reentryCooldownHours: 24,
                                  },
                                });
                              } else {
                                dispatch({
                                  type: 'changeTrigger',
                                  trigger: {
                                    type: 'scheduled_recurring',
                                    recurrenceRule: '',
                                    timezoneMode: 'user_local',
                                  },
                                });
                              }
                            }}
                          />
                        ))}
                      </Stack>

                      {stateBasedTrigger ? (
                        <Stack spacing={2}>
                          <TextField
                            label="Qualification"
                            value="when_user_matches_audience"
                            InputProps={{ readOnly: true }}
                          />
                          <TextField
                            label="Re-entry cooldown (hours)"
                            type="number"
                            value={stateBasedTrigger.reentryCooldownHours ?? ''}
                            onChange={(event) =>
                              dispatch({
                                type: 'changeTrigger',
                                trigger: {
                                  ...stateBasedTrigger,
                                  reentryCooldownHours:
                                    event.target.value === ''
                                      ? null
                                      : Number(event.target.value),
                                },
                              })
                            }
                          />
                        </Stack>
                      ) : null}

                      {eventBasedTrigger ? (
                        <Stack spacing={2}>
                          <FormControl fullWidth>
                            <Select
                              value={`${eventBasedTrigger.eventKey}:${eventBasedTrigger.producerKey}`}
                              onChange={(event) => {
                                const selected =
                                  state.catalog.sourceEvents.find(
                                    (option) =>
                                      `${option.eventKey}:${option.producerKey}` ===
                                      event.target.value
                                  );
                                if (!selected) {
                                  return;
                                }

                                dispatch({
                                  type: 'changeTrigger',
                                  trigger: {
                                    ...eventBasedTrigger,
                                    eventKey: selected.eventKey,
                                    producerKey: selected.producerKey,
                                    entryMode: 'first_eligible_event',
                                  },
                                });
                              }}
                            >
                              {state.catalog.sourceEvents.map((option) => (
                                <MenuItem
                                  key={`${option.eventKey}:${option.producerKey}`}
                                  value={`${option.eventKey}:${option.producerKey}`}
                                >
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <TextField
                            label="Producer key"
                            value={eventBasedTrigger.producerKey}
                            InputProps={{ readOnly: true }}
                          />
                          <TextField
                            label="Re-entry cooldown (hours)"
                            type="number"
                            value={eventBasedTrigger.reentryCooldownHours ?? ''}
                            onChange={(event) =>
                              dispatch({
                                type: 'changeTrigger',
                                trigger: {
                                  ...eventBasedTrigger,
                                  reentryCooldownHours:
                                    event.target.value === ''
                                      ? null
                                      : Number(event.target.value),
                                },
                              })
                            }
                          />
                        </Stack>
                      ) : null}

                      {scheduledTrigger ? (
                        <Stack spacing={2}>
                          <TextField
                            label="Recurrence rule (RRULE)"
                            value={scheduledTrigger.recurrenceRule}
                            onChange={(event) =>
                              dispatch({
                                type: 'changeTrigger',
                                trigger: {
                                  ...scheduledTrigger,
                                  recurrenceRule: event.target.value,
                                },
                              })
                            }
                          />
                          <TextField
                            label="Timezone mode"
                            value="user_local"
                            InputProps={{ readOnly: true }}
                          />
                        </Stack>
                      ) : null}
                    </Stack>
                  </SectionCard>

                  <SectionCard
                    title="Journey Builder"
                    action={
                      <Button
                        onClick={addJourneyStep}
                        sx={{ color: COLORS.textPrimary }}
                      >
                        + Add step
                      </Button>
                    }
                  >
                    <Stack spacing={2}>
                      {state.draft.journey.steps.map((step) => (
                        <Paper
                          key={step.stepKey}
                          sx={{
                            p: 2,
                            bgcolor: COLORS.soft,
                            border: `1px solid ${COLORS.stroke}`,
                          }}
                        >
                          <Stack spacing={1.5}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                sx={{
                                  color: COLORS.textPrimary,
                                  fontWeight: 700,
                                }}
                              >
                                Step {step.order}
                              </Typography>
                              {step.order > 1 ? (
                                <Button
                                  startIcon={<Delete />}
                                  color="error"
                                  onClick={() =>
                                    dispatch({
                                      type: 'removeJourneyStep',
                                      stepKey: step.stepKey,
                                    })
                                  }
                                >
                                  Delete step
                                </Button>
                              ) : null}
                            </Stack>

                            <Stack
                              direction={{ xs: 'column', md: 'row' }}
                              spacing={2}
                            >
                              <TextField
                                label="Anchor"
                                value={step.anchor.type}
                                InputProps={{ readOnly: true }}
                                fullWidth
                              />
                              <TextField
                                label="Delay (minutes)"
                                type="number"
                                value={step.delayMinutes ?? ''}
                                onChange={(event) =>
                                  dispatch({
                                    type: 'updateJourneyStep',
                                    stepKey: step.stepKey,
                                    patch: {
                                      delayMinutes:
                                        event.target.value === ''
                                          ? null
                                          : Number(event.target.value),
                                    },
                                  })
                                }
                                fullWidth
                              />
                            </Stack>

                            <Stack
                              direction={{ xs: 'column', md: 'row' }}
                              spacing={2}
                            >
                              <TextField
                                label="Send window start"
                                value={step.sendWindowStart}
                                onChange={(event) =>
                                  dispatch({
                                    type: 'updateJourneyStep',
                                    stepKey: step.stepKey,
                                    patch: {
                                      sendWindowStart: event.target.value,
                                    },
                                  })
                                }
                                fullWidth
                              />
                              <TextField
                                label="Send window end"
                                value={step.sendWindowEnd}
                                onChange={(event) =>
                                  dispatch({
                                    type: 'updateJourneyStep',
                                    stepKey: step.stepKey,
                                    patch: {
                                      sendWindowEnd: event.target.value,
                                    },
                                  })
                                }
                                fullWidth
                              />
                            </Stack>

                            <Stack
                              direction={{ xs: 'column', md: 'row' }}
                              spacing={2}
                            >
                              <TextField
                                label="Frequency cap (hours)"
                                type="number"
                                value={step.frequencyCapHours ?? ''}
                                onChange={(event) =>
                                  dispatch({
                                    type: 'updateJourneyStep',
                                    stepKey: step.stepKey,
                                    patch: {
                                      frequencyCapHours:
                                        event.target.value === ''
                                          ? null
                                          : Number(event.target.value),
                                    },
                                  })
                                }
                                fullWidth
                              />
                              <FormControl fullWidth>
                                <Select
                                  value={step.exitRule}
                                  onChange={(event) =>
                                    dispatch({
                                      type: 'updateJourneyStep',
                                      stepKey: step.stepKey,
                                      patch: {
                                        exitRule: event.target
                                          .value as CampaignDraft['journey']['steps'][number]['exitRule'],
                                      },
                                    })
                                  }
                                >
                                  <MenuItem value="none">none</MenuItem>
                                  <MenuItem value="stop_on_goal">
                                    stop_on_goal
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Stack>

                            <FormControlLabel
                              control={
                                <Switch
                                  checked={step.sameLocalTimeNextDay}
                                  onChange={(event) =>
                                    dispatch({
                                      type: 'updateJourneyStep',
                                      stepKey: step.stepKey,
                                      patch: {
                                        sameLocalTimeNextDay:
                                          event.target.checked,
                                      },
                                    })
                                  }
                                />
                              }
                              label="Same local time next day"
                            />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </SectionCard>
                </Stack>
              ) : null}

              {state.activeStep === CampaignEditorStep.STEP_CONTENT ? (
                <Stack spacing={2}>
                  <SectionCard title="Step selector">
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {state.draft.journey.steps.map((step) => (
                        <StepButton
                          key={step.stepKey}
                          label={`Step ${step.order}`}
                          selected={state.activeContentStepKey === step.stepKey}
                          onClick={() =>
                            dispatch({
                              type: 'setActiveContentStep',
                              stepKey: step.stepKey,
                            })
                          }
                        />
                      ))}
                    </Stack>
                  </SectionCard>

                  <SectionCard title="Locale">
                    <Stack direction="row" spacing={1}>
                      {(['en', 'es', 'pt'] as CampaignLocale[]).map(
                        (locale) => (
                          <StepButton
                            key={locale}
                            label={locale.toUpperCase()}
                            selected={activeLocale === locale}
                            onClick={() => setActiveLocale(locale)}
                          />
                        )
                      )}
                    </Stack>
                  </SectionCard>

                  <SectionCard title="Step content">
                    {activeStepContent ? (
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              dispatch({
                                type: 'openDialog',
                                dialog: 'tokenPicker',
                                tokenTarget: {
                                  stepKey: state.activeContentStepKey,
                                  locale: activeLocale,
                                  field: 'title',
                                },
                              })
                            }
                          >
                            Insert token in title
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              dispatch({
                                type: 'openDialog',
                                dialog: 'tokenPicker',
                                tokenTarget: {
                                  stepKey: state.activeContentStepKey,
                                  locale: activeLocale,
                                  field: 'body',
                                },
                              })
                            }
                          >
                            Insert token in body
                          </Button>
                        </Stack>

                        <TextField
                          label="Push title"
                          value={activeStepContent.title}
                          onChange={(event) =>
                            dispatch({
                              type: 'updateStepLocaleContent',
                              stepKey: state.activeContentStepKey,
                              locale: activeLocale,
                              patch: { title: event.target.value },
                            })
                          }
                          fullWidth
                        />
                        <TextField
                          label="Push body"
                          value={activeStepContent.body}
                          onChange={(event) =>
                            dispatch({
                              type: 'updateStepLocaleContent',
                              stepKey: state.activeContentStepKey,
                              locale: activeLocale,
                              patch: { body: event.target.value },
                            })
                          }
                          multiline
                          minRows={4}
                          fullWidth
                        />
                        <TextField
                          label="Fallback first name"
                          value={activeStepContent.fallbackFirstName}
                          onChange={(event) =>
                            dispatch({
                              type: 'updateStepLocaleContent',
                              stepKey: state.activeContentStepKey,
                              locale: activeLocale,
                              patch: { fallbackFirstName: event.target.value },
                            })
                          }
                          fullWidth
                        />
                        <FormControl fullWidth>
                          <Select
                            value={activeStepContent.deeplinkTarget}
                            onChange={(event) =>
                              dispatch({
                                type: 'changeDeeplink',
                                stepKey: state.activeContentStepKey,
                                locale: activeLocale,
                                target: event.target
                                  .value as CampaignDeeplinkTarget,
                              })
                            }
                          >
                            {state.catalog.deeplinkOptions.map((option) => (
                              <MenuItem
                                key={option.target}
                                value={option.target}
                              >
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                    ) : (
                      <Typography sx={{ color: COLORS.textSecondary }}>
                        Select a journey step to edit its localized content.
                      </Typography>
                    )}
                  </SectionCard>
                </Stack>
              ) : null}

              {state.activeStep === CampaignEditorStep.REVIEW ? (
                <Stack spacing={2}>
                  <SectionCard title="Audience">
                    <Stack spacing={1}>
                      {reviewModel.audience.map((item) => (
                        <Typography
                          key={item.label}
                          sx={{ color: COLORS.textSecondary }}
                        >
                          <Box
                            component="span"
                            sx={{ color: COLORS.textPrimary, mr: 1 }}
                          >
                            {item.label}:
                          </Box>
                          {item.value}
                        </Typography>
                      ))}
                    </Stack>
                  </SectionCard>

                  <SectionCard title="Trigger">
                    <Stack spacing={1}>
                      {reviewModel.trigger.map((item) => (
                        <Typography
                          key={item.label}
                          sx={{ color: COLORS.textSecondary }}
                        >
                          <Box
                            component="span"
                            sx={{ color: COLORS.textPrimary, mr: 1 }}
                          >
                            {item.label}:
                          </Box>
                          {item.value}
                        </Typography>
                      ))}
                    </Stack>
                  </SectionCard>

                  <SectionCard title="Journey">
                    <Stack spacing={1}>
                      {reviewModel.journey.map((item) => (
                        <Typography
                          key={item.label}
                          sx={{ color: COLORS.textSecondary }}
                        >
                          <Box
                            component="span"
                            sx={{ color: COLORS.textPrimary, mr: 1 }}
                          >
                            {item.label}:
                          </Box>
                          {item.value}
                        </Typography>
                      ))}
                    </Stack>
                  </SectionCard>

                  <SectionCard title="Step content readiness">
                    <Stack spacing={1}>
                      {reviewModel.content.map((item) => (
                        <Typography
                          key={item.label}
                          sx={{
                            color:
                              item.tone === 'warning'
                                ? COLORS.warning
                                : COLORS.textSecondary,
                          }}
                        >
                          <Box
                            component="span"
                            sx={{ color: COLORS.textPrimary, mr: 1 }}
                          >
                            {item.label}:
                          </Box>
                          {item.value}
                        </Typography>
                      ))}
                    </Stack>
                  </SectionCard>
                </Stack>
              ) : null}

              <Divider sx={{ borderColor: COLORS.stroke }} />

              <Stack direction="row" justifyContent="space-between">
                <Button
                  variant="text"
                  disabled={STEP_ORDER.indexOf(state.activeStep) === 0}
                  onClick={() => goToStep('back')}
                  sx={{ color: COLORS.textSecondary }}
                >
                  Back
                </Button>
                <Stack direction="row" spacing={1}>
                  {state.isDirty ? (
                    <Button
                      variant="outlined"
                      onClick={() =>
                        dispatch({
                          type: 'openDialog',
                          dialog: 'discardChanges',
                        })
                      }
                      sx={{
                        color: COLORS.textPrimary,
                        borderColor: COLORS.stroke,
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                  <Button
                    variant="contained"
                    disabled={
                      !canContinueCampaignStep(state.activeStep, state.draft)
                    }
                    onClick={() => goToStep('next')}
                    sx={{
                      bgcolor: COLORS.accent,
                      color: COLORS.textPrimary,
                    }}
                  >
                    Continue
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </SectionCard>

          <SectionCard title="Readiness">
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(['en', 'es', 'pt'] as CampaignLocale[]).map((locale) => (
                  <Chip
                    key={locale}
                    label={`${locale.toUpperCase()} · ${readiness[locale]}`}
                    sx={{
                      bgcolor:
                        readiness[locale] === 'ready'
                          ? `${COLORS.success}22`
                          : `${COLORS.warning}22`,
                      color:
                        readiness[locale] === 'ready'
                          ? COLORS.success
                          : COLORS.warning,
                    }}
                  />
                ))}
              </Stack>

              {validation.errors.length ? (
                <Alert severity="warning">{validation.errors[0]}</Alert>
              ) : null}

              <Typography sx={{ color: COLORS.textSecondary }}>
                Reachable audience:{' '}
                <Box component="span" sx={{ color: COLORS.textPrimary }}>
                  {state.estimate?.reachableUsers?.toLocaleString('en-US') ??
                    '...'}
                </Box>
              </Typography>

              <Typography sx={{ color: COLORS.textSecondary }}>
                Trigger: {reviewModel.trigger[0]?.value}
              </Typography>
              <Typography sx={{ color: COLORS.textSecondary }}>
                Journey steps: {state.draft.journey.steps.length}
              </Typography>

              <Divider sx={{ borderColor: COLORS.stroke }} />

              <Stack spacing={1}>
                <Button
                  startIcon={<Science />}
                  variant="outlined"
                  disabled={!canSendTestCampaign(state.draft)}
                  onClick={() =>
                    dispatch({ type: 'openDialog', dialog: 'sendTest' })
                  }
                  sx={{ color: COLORS.textPrimary, borderColor: COLORS.stroke }}
                >
                  Send Test
                </Button>
                <Button
                  variant="contained"
                  disabled={!canScheduleCampaign(state.draft)}
                  onClick={() =>
                    dispatch({ type: 'openDialog', dialog: 'schedule' })
                  }
                  sx={{ bgcolor: COLORS.accent, color: COLORS.textPrimary }}
                >
                  Schedule Campaign
                </Button>
                <Button
                  startIcon={<Archive />}
                  color="error"
                  disabled={!canArchiveCampaign(state.draft)}
                  onClick={() =>
                    dispatch({ type: 'openDialog', dialog: 'archiveCampaign' })
                  }
                >
                  Archive Campaign
                </Button>
              </Stack>
            </Stack>
          </SectionCard>
        </Box>
      </Stack>

      <Dialog
        open={state.dialogs.saveSegment}
        onClose={() => dispatch({ type: 'closeDialog', dialog: 'saveSegment' })}
      >
        <DialogTitle>Save segment</DialogTitle>
        <DialogContent>
          <TextField
            label="Segment name"
            value={saveSegmentName}
            onChange={(event) => setSaveSegmentName(event.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              dispatch({ type: 'closeDialog', dialog: 'saveSegment' })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleSaveSegment}>Save segment</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.saveTemplate}
        onClose={() =>
          dispatch({ type: 'closeDialog', dialog: 'saveTemplate' })
        }
      >
        <DialogTitle>Save as template</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 360 }}>
            <TextField
              label="Template name"
              value={saveTemplateName}
              onChange={(event) => setSaveTemplateName(event.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={saveTemplateDescription}
              onChange={(event) =>
                setSaveTemplateDescription(event.target.value)
              }
              helperText="Optional context so the team understands when to use it."
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              dispatch({ type: 'closeDialog', dialog: 'saveTemplate' })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleSaveTemplate} disabled={!saveTemplateName.trim()}>
            Save template
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.sendTest}
        onClose={() => dispatch({ type: 'closeDialog', dialog: 'sendTest' })}
      >
        <DialogTitle>Send test</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 360 }}>
            <TextField
              label="Recipients"
              helperText="Comma-separated user ids, emails, or device keys"
              value={testRecipients}
              onChange={(event) => setTestRecipients(event.target.value)}
              fullWidth
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
          <Button
            onClick={() =>
              dispatch({ type: 'closeDialog', dialog: 'sendTest' })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleSendTest}>Send test</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.schedule}
        onClose={() => dispatch({ type: 'closeDialog', dialog: 'schedule' })}
      >
        <DialogTitle>Schedule campaign</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1 }}>
            This will schedule the current trigger + journey definition for live
            delivery.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              dispatch({ type: 'closeDialog', dialog: 'schedule' })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleSchedule}>Confirm schedule</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.archiveCampaign}
        onClose={() =>
          dispatch({ type: 'closeDialog', dialog: 'archiveCampaign' })
        }
      >
        <DialogTitle>Archive campaign</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1 }}>
            This will stop new planning and archive the current draft.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              dispatch({ type: 'closeDialog', dialog: 'archiveCampaign' })
            }
          >
            Cancel
          </Button>
          <Button color="error" onClick={handleArchive}>
            Archive
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.discardChanges}
        onClose={() =>
          dispatch({ type: 'closeDialog', dialog: 'discardChanges' })
        }
      >
        <DialogTitle>Discard changes</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1 }}>
            Restore the last persisted campaign snapshot and drop local edits?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              dispatch({ type: 'closeDialog', dialog: 'discardChanges' })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={() => dispatch({ type: 'discardChanges' })}
            color="error"
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.tokenPicker}
        onClose={() => dispatch({ type: 'closeDialog', dialog: 'tokenPicker' })}
      >
        <DialogTitle>Insert token</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1, minWidth: 320 }}>
            {state.catalog.tokens.map((token) => (
              <Button
                key={token.key}
                variant="outlined"
                onClick={() => {
                  if (!state.tokenTarget) {
                    return;
                  }

                  dispatch({
                    type: 'insertToken',
                    stepKey: state.tokenTarget.stepKey,
                    locale: state.tokenTarget.locale,
                    field: state.tokenTarget.field,
                    token: token.token,
                  });
                  dispatch({ type: 'closeDialog', dialog: 'tokenPicker' });
                }}
              >
                {token.label}
              </Button>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <CampaignAudienceUserPickerDialog
        open={isUserPickerOpen}
        selectedUserIds={state.draft.audience.criteria.userIds}
        onClose={() => setIsUserPickerOpen(false)}
        onApply={(userIds) => {
          dispatch({
            type: 'updateAudienceCriteria',
            patch: {
              userIds,
            },
          });
          setIsUserPickerOpen(false);
        }}
      />
    </Box>
  );
}
