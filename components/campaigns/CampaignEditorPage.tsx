'use client';

/**
 * Renders the shared create/edit campaign builder with live backend actions.
 */

import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type SyntheticEvent,
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
  FormHelperText,
  FormControlLabel,
  IconButton,
  InputLabel,
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
  Edit,
  Save,
  Science,
} from '@mui/icons-material';
import { RetentionStage, getUser, type User } from '@/lib/api/users';
import { getStoredAuthUser } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { CampaignAudienceUserPickerDialog } from '@/components/campaigns/CampaignAudienceUserPickerDialog';
import { CAMPAIGN_GOAL_REWARD_POINTS_MAX } from '@/modules/campaigns/contracts';
import { campaignsRepository } from '@/modules/campaigns/repository';
import type {
  CampaignDeeplinkTarget,
  CampaignDraft,
  CampaignGoalDefinition,
  CampaignJourneyStep,
  CampaignLocale,
  CampaignScenarioTemplateSummary,
  CampaignSendGuardAction,
  CampaignStatus,
  UpsertCampaignDraftRequest,
} from '@/modules/campaigns/contracts';
import {
  createEmptyCampaignDraft,
  createJourneyStep,
  createScheduledCampaignTrigger,
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
  MISSING_TRACKED_GOAL_WARNING,
  SEND_GUARD_ACTION_LABELS,
} from '@/modules/campaigns/selectors';
import {
  buildCampaignScheduleRule,
  CAMPAIGN_WEEKDAY_OPTIONS,
  describeCampaignScheduleRule,
  DEFAULT_CAMPAIGN_SCHEDULE,
  formatCampaignScheduleTime,
  parseCampaignScheduleRule,
  withCampaignScheduleTime,
} from '@/modules/campaigns/schedule';

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

const SEND_GUARD_ACTION_OPTIONS: Array<{
  action: CampaignSendGuardAction;
  label: string;
}> = Object.entries(SEND_GUARD_ACTION_LABELS).map(([action, label]) => ({
  action: action as CampaignSendGuardAction,
  label,
}));

interface CampaignEditorPageProps {
  mode: 'create' | 'edit';
  campaignId?: string;
}

type CampaignEditorTextField = 'title' | 'body';
type CampaignEditorTextInputElement = HTMLInputElement | HTMLTextAreaElement;

interface CampaignEditorTextSelection {
  stepKey: string;
  locale: CampaignLocale;
  start: number;
  end: number;
}

interface PendingTokenFocus {
  stepKey: string;
  locale: CampaignLocale;
  field: CampaignEditorTextField;
  cursor: number;
}

const LEGACY_TEST_RECIPIENT_PLACEHOLDER = 'spec@local.test';
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function getPreferredTestRecipients(
  currentRecipients: string,
  authorizedUserEmail: string
): string {
  if (!authorizedUserEmail) {
    return currentRecipients;
  }

  const normalizedRecipients = currentRecipients.trim();
  if (
    normalizedRecipients.length > 0 &&
    normalizedRecipients !== LEGACY_TEST_RECIPIENT_PLACEHOLDER
  ) {
    return currentRecipients;
  }

  return authorizedUserEmail;
}

function buildUpsertPayload(draft: CampaignDraft): UpsertCampaignDraftRequest {
  return {
    name: draft.name,
    goal: draft.goal,
    goalDefinition: normalizeGoalDefinition(draft.goalDefinition),
    channel: draft.channel,
    audience: draft.audience,
    trigger: draft.trigger,
    journey: draft.journey,
    content: draft.content,
  };
}

function normalizeGoalDefinition(
  goalDefinition: CampaignGoalDefinition | null
): CampaignGoalDefinition | null {
  if (!goalDefinition) {
    return null;
  }

  return {
    ...goalDefinition,
    rewardPoints: goalDefinition.rewardPoints ?? 0,
  };
}

function hasSameAudienceRules(
  left: CampaignDraft['audience'],
  right: CampaignDraft['audience']
): boolean {
  return (
    JSON.stringify(left.criteria) === JSON.stringify(right.criteria) &&
    JSON.stringify(left.suppression) === JSON.stringify(right.suppression)
  );
}

function buildTemplatePayload(
  draft: CampaignDraft,
  sourceTemplate: CampaignScenarioTemplateSummary | null
): UpsertCampaignDraftRequest {
  const payload = buildUpsertPayload(draft);

  if (payload.audience.segmentSource !== 'template_segment') {
    return payload;
  }

  if (
    sourceTemplate &&
    hasSameAudienceRules(payload.audience, sourceTemplate.definition.audience)
  ) {
    return {
      ...payload,
      audience: sourceTemplate.definition.audience,
    };
  }

  return {
    ...payload,
    audience: {
      ...payload.audience,
      segmentSource: 'manual_rules',
      sourceSegmentId: null,
    },
  };
}

function formatStatus(status: CampaignStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatScheduleResultTimestamp(timestamp: string): string {
  const parsedDate = new Date(timestamp);
  if (Number.isNaN(parsedDate.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsedDate);
}

function formatRecurringScheduleStartDate(
  date: string | null | undefined
): string {
  if (!date) {
    return 'the selected start date';
  }

  const match = ISO_DATE_PATTERN.exec(date.trim());
  if (!match) {
    return date;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return date;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate);
}

function getScheduleSuccessWarnings(
  campaign: CampaignDraft,
  firstSendAt: string
): string[] {
  if (campaign.trigger.type !== 'scheduled_recurring') {
    return [
      `First send planned for ${formatScheduleResultTimestamp(firstSendAt)}.`,
    ];
  }

  const schedule = parseCampaignScheduleRule(campaign.trigger.recurrenceRule);
  const startDateLabel = formatRecurringScheduleStartDate(
    campaign.trigger.startDate
  );
  const timeLabel = schedule
    ? ` at ${formatCampaignScheduleTime(schedule)}`
    : '';

  return [
    `Recurring sends start on ${startDateLabel}${timeLabel} in each user's local time.`,
  ];
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
  chipColor,
  onClick,
}: {
  label: string;
  selected: boolean;
  chipColor?: string;
  onClick: () => void;
}) {
  const color = chipColor ?? COLORS.accent;

  return (
    <Chip
      label={label}
      clickable
      aria-pressed={selected}
      onClick={onClick}
      sx={{
        bgcolor: selected ? hexToRgba(color, 0.18) : COLORS.soft,
        color: selected ? COLORS.textPrimary : COLORS.textSecondary,
        border: `1px solid ${selected ? color : COLORS.stroke}`,
      }}
    />
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');

  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return `rgba(220, 80, 56, ${alpha})`;
  }

  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
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

function formatTriggerTypeLabel(
  trigger: CampaignDraft['trigger']['type']
): string {
  if (trigger === 'state_based') {
    return 'State based';
  }

  if (trigger === 'event_based') {
    return 'Event based';
  }

  return 'Scheduled';
}

function describeScenarioTemplate(
  template: CampaignScenarioTemplateSummary
): string {
  return [
    formatTriggerTypeLabel(template.definition.trigger.type),
    `${template.definition.journey.steps.length} step${
      template.definition.journey.steps.length === 1 ? '' : 's'
    }`,
  ].join(' · ');
}

function getSourceEventProducerLabel(producerKey: string): string {
  if (producerKey === 'crm_source_events') {
    return 'CRM integration events';
  }

  if (producerKey === 'channels_favorite_matches') {
    return 'Favorite matches service';
  }

  return producerKey;
}

function getSourceEventLabel(eventKey: string): string {
  switch (eventKey) {
    case 'app_opened':
      return 'Opened app';
    case 'onboarding_completed':
      return 'Completed onboarding';
    case 'match_center_opened':
      return 'Opened match center';
    case 'rewards_wallet_opened':
      return 'Opened rewards wallet';
    case 'subscription_started':
      return 'Started subscription';
    case 'subscription_renewed':
      return 'Renewed subscription';
    case 'in_app_purchase_completed':
      return 'Completed in-app purchase';
    case 'daily_streak_reminder':
      return 'Daily streak reminder';
    case 'weekly_quest_urgency':
      return 'Weekly quest urgency';
    case 'favorite_match_kickoff':
      return 'Favorite match kickoff';
    case 'weekly_stats_digest':
      return 'Weekly stats digest';
    case 'unread_social_activity':
      return 'Unread social activity';
    case 'live_challenge_starting_soon':
      return 'Live challenge starting soon';
    case 'live_challenge_results':
      return 'Live challenge results available';
    case 'stage_at_risk_wau':
      return 'Became at-risk weekly user';
    case 'stage_at_risk_mau':
      return 'Became at-risk monthly user';
    case 'stage_dead_user':
      return 'Became inactive 30+ days';
    case 'stage_reactivated':
      return 'Reactivated after 7-29 days';
    case 'stage_resurrected':
      return 'Reactivated after 30+ days';
    default:
      return eventKey;
  }
}

function getJourneyAnchorLabel(
  anchorType: 'trigger' | 'previous_step'
): string {
  return anchorType === 'trigger' ? 'Campaign entry' : 'Previous step';
}

function getDeeplinkOptionLabel(
  options: Array<{ target: CampaignDeeplinkTarget; label: string }>,
  target: CampaignDeeplinkTarget | null
): string {
  if (!target) {
    return 'No follow-up action';
  }

  const knownLabel = options.find((option) => option.target === target)?.label;
  if (knownLabel) {
    return knownLabel;
  }

  const normalizedLabel = target.replace(/_/g, ' ');
  return normalizedLabel.charAt(0).toUpperCase() + normalizedLabel.slice(1);
}

function parseRewardPoints(value: string): number {
  if (value.trim() === '') {
    return 0;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
}

export function CampaignEditorPage({
  mode,
  campaignId,
}: CampaignEditorPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const storedAuthUser = getStoredAuthUser();
  const [state, dispatch] = useReducer(campaignEditorReducer, undefined, () =>
    createCampaignEditorState()
  );
  const [activeLocale, setActiveLocale] = useState<CampaignLocale>('en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateDescription, setSaveTemplateDescription] = useState('');
  const [testRecipients, setTestRecipients] = useState(
    () => storedAuthUser?.email?.trim() ?? ''
  );
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [testLocale, setTestLocale] = useState<CampaignLocale>('en');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<CampaignScenarioTemplateSummary | null>(null);
  const [templateBeingEdited, setTemplateBeingEdited] =
    useState<CampaignScenarioTemplateSummary | null>(null);
  const contentInputRefs = useRef<
    Record<CampaignEditorTextField, CampaignEditorTextInputElement | null>
  >({
    title: null,
    body: null,
  });
  const contentSelectionRef = useRef<
    Partial<Record<CampaignEditorTextField, CampaignEditorTextSelection>>
  >({});
  const pendingTokenFocusRef = useRef<PendingTokenFocus | null>(null);
  const authorizedUserEmail =
    user?.email?.trim() ?? storedAuthUser?.email?.trim() ?? '';
  const normalizedTestRecipients = testRecipients
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const validation = useMemo(
    () => getCampaignValidationSummary(state.draft),
    [state.draft]
  );
  const readiness = useMemo(
    () =>
      getCampaignLocaleReadiness(
        state.draft.content,
        state.draft.audience.criteria.locales
      ),
    [state.draft.audience.criteria.locales, state.draft.content]
  );
  const reviewModel = useMemo(
    () => buildCampaignReviewModel(state.draft),
    [state.draft]
  );

  useEffect(() => {
    setTestRecipients((currentRecipients) =>
      getPreferredTestRecipients(currentRecipients, authorizedUserEmail)
    );
  }, [authorizedUserEmail]);

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
            draft: createEmptyCampaignDraft(),
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

  function getInputSelection(
    input: CampaignEditorTextInputElement
  ): Pick<CampaignEditorTextSelection, 'start' | 'end'> {
    const fallbackCursor = input.value.length;
    const start = input.selectionStart ?? fallbackCursor;
    const end = input.selectionEnd ?? start;

    return { start, end };
  }

  function storeContentSelection(
    field: CampaignEditorTextField,
    selection: Pick<CampaignEditorTextSelection, 'start' | 'end'>
  ) {
    contentSelectionRef.current[field] = {
      stepKey: state.activeContentStepKey,
      locale: activeLocale,
      start: selection.start,
      end: selection.end,
    };
  }

  function captureContentSelection(
    field: CampaignEditorTextField,
    input?: CampaignEditorTextInputElement | null
  ): CampaignEditorTextSelection | null {
    const resolvedInput = input ?? contentInputRefs.current[field];
    if (!resolvedInput) {
      return null;
    }

    const selection = getInputSelection(resolvedInput);
    storeContentSelection(field, selection);

    return contentSelectionRef.current[field] ?? null;
  }

  function handleContentSelection(
    field: CampaignEditorTextField,
    event: SyntheticEvent<CampaignEditorTextInputElement>
  ) {
    contentInputRefs.current[field] = event.currentTarget;
    captureContentSelection(field, event.currentTarget);
  }

  function handleStepContentChange(
    field: CampaignEditorTextField,
    event: ChangeEvent<CampaignEditorTextInputElement>
  ) {
    const value = event.target.value;

    contentInputRefs.current[field] = event.currentTarget;
    storeContentSelection(field, getInputSelection(event.currentTarget));
    dispatch({
      type: 'updateStepLocaleContent',
      stepKey: state.activeContentStepKey,
      locale: activeLocale,
      patch: field === 'title' ? { title: value } : { body: value },
    });
  }

  function openTokenPicker(field: CampaignEditorTextField) {
    captureContentSelection(field);
    dispatch({
      type: 'openDialog',
      dialog: 'tokenPicker',
      tokenTarget: {
        stepKey: state.activeContentStepKey,
        locale: activeLocale,
        field,
      },
    });
  }

  function handleInsertToken(token: string) {
    if (!state.tokenTarget) {
      return;
    }

    const storedSelection =
      contentSelectionRef.current[state.tokenTarget.field];
    const selection =
      storedSelection &&
      storedSelection.stepKey === state.tokenTarget.stepKey &&
      storedSelection.locale === state.tokenTarget.locale
        ? storedSelection
        : captureContentSelection(state.tokenTarget.field);
    const fallbackCursor =
      contentInputRefs.current[state.tokenTarget.field]?.value.length ?? 0;
    const insertionStart = selection?.start ?? fallbackCursor;
    const cursor = insertionStart + token.length;

    pendingTokenFocusRef.current = {
      ...state.tokenTarget,
      cursor,
    };
    dispatch({
      type: 'insertToken',
      stepKey: state.tokenTarget.stepKey,
      locale: state.tokenTarget.locale,
      field: state.tokenTarget.field,
      token,
      selection: selection
        ? {
            start: selection.start,
            end: selection.end,
          }
        : undefined,
    });
    dispatch({ type: 'closeDialog', dialog: 'tokenPicker' });
  }

  useEffect(() => {
    const pending = pendingTokenFocusRef.current;
    if (!pending || state.dialogs.tokenPicker) {
      return;
    }

    if (
      pending.stepKey !== state.activeContentStepKey ||
      pending.locale !== activeLocale
    ) {
      return;
    }

    const input = contentInputRefs.current[pending.field];
    if (!input) {
      return;
    }

    pendingTokenFocusRef.current = null;
    const restoreFocusTimeout = window.setTimeout(() => {
      input.focus();
      input.setSelectionRange(pending.cursor, pending.cursor);
      contentSelectionRef.current[pending.field] = {
        stepKey: pending.stepKey,
        locale: pending.locale,
        start: pending.cursor,
        end: pending.cursor,
      };
    }, 0);

    return () => {
      window.clearTimeout(restoreFocusTimeout);
    };
  }, [
    activeLocale,
    state.activeContentStepKey,
    state.dialogs.tokenPicker,
    state.draft.content,
  ]);

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

  async function persistDraft(options?: {
    message?: string | null;
    navigateOnCreate?: boolean;
  }): Promise<CampaignDraft> {
    const message =
      options?.message === undefined
        ? 'Draft saved successfully.'
        : options.message;
    const navigateOnCreate = options?.navigateOnCreate ?? true;
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
      message,
    });

    if (navigateOnCreate && state.draft.id === null && saved.id) {
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

  function handleOpenSendTestDialog() {
    setError(null);
    setTestRecipients((currentRecipients) =>
      getPreferredTestRecipients(currentRecipients, authorizedUserEmail)
    );
    dispatch({ type: 'openDialog', dialog: 'sendTest' });
  }

  async function handleOpenScheduleDialog() {
    setError(null);
    dispatch({ type: 'openDialog', dialog: 'schedule' });
  }

  async function handleSendTest() {
    if (normalizedTestRecipients.length === 0) {
      setError('Add at least one recipient before sending a test.');
      return;
    }

    try {
      setIsSendingTest(true);
      const saved = await ensurePersistedDraft();
      const response = await campaignsRepository.sendTestCampaign(saved.id!, {
        recipients: normalizedTestRecipients,
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
    } finally {
      setIsSendingTest(false);
    }
  }

  async function handleSchedule() {
    let persistedDraftId: string | null = null;

    try {
      setError(null);
      setIsScheduling(true);
      const shouldPersistBeforeScheduling =
        state.draft.id === null || state.isDirty;
      const saved = shouldPersistBeforeScheduling
        ? await persistDraft({
            message: null,
            navigateOnCreate: false,
          })
        : state.draft;
      persistedDraftId = saved.id;
      const response = await campaignsRepository.scheduleCampaign(saved.id!, {
        confirm: true,
      });

      if (state.draft.id === null && saved.id) {
        router.replace(`/dashboard/campaigns/${saved.id}`);
      }

      dispatch({
        type: 'closeDialog',
        dialog: 'schedule',
      });
      dispatch({
        type: 'markActionSuccess',
        kind: 'schedule',
        draft: response.campaign,
        message: 'Campaign scheduled successfully.',
        warnings: getScheduleSuccessWarnings(
          response.campaign,
          response.firstSendAt
        ),
      });
    } catch (actionError) {
      if (state.draft.id === null && persistedDraftId) {
        router.replace(`/dashboard/campaigns/${persistedDraftId}`);
      }

      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to schedule campaign'
      );
    } finally {
      setIsScheduling(false);
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

  async function handleSaveTemplate() {
    if (!saveTemplateName.trim()) {
      return;
    }

    try {
      const templatePayload = {
        name: saveTemplateName.trim(),
        description: saveTemplateDescription.trim() || undefined,
        definition: buildTemplatePayload(state.draft, templateBeingEdited),
      };
      const response = templateBeingEdited
        ? await campaignsRepository.updateTemplate(
            templateBeingEdited.id,
            templatePayload
          )
        : await campaignsRepository.saveTemplate(templatePayload);
      dispatch({
        type: 'setCatalog',
        catalog: {
          ...state.catalog,
          scenarioTemplates: [
            response.template,
            ...state.catalog.scenarioTemplates.filter(
              (template) => template.id !== response.template.id
            ),
          ],
        },
      });
      dispatch({ type: 'closeDialog', dialog: 'saveTemplate' });
      dispatch({
        type: 'markActionSuccess',
        kind: 'template',
        message: templateBeingEdited
          ? 'Template updated successfully.'
          : 'Campaign saved as template.',
      });
      setTemplateBeingEdited(templateBeingEdited ? response.template : null);
      setSaveTemplateName('');
      setSaveTemplateDescription('');
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : templateBeingEdited
            ? 'Failed to update campaign template'
            : 'Failed to save campaign template'
      );
    }
  }

  async function handleDeleteTemplate() {
    if (!templateToDelete) {
      return;
    }

    try {
      await campaignsRepository.deleteTemplate(templateToDelete.id);
      dispatch({
        type: 'setCatalog',
        catalog: {
          ...state.catalog,
          scenarioTemplates: state.catalog.scenarioTemplates.filter(
            (template) => template.id !== templateToDelete.id
          ),
        },
      });
      setTemplateToDelete(null);
      if (templateBeingEdited?.id === templateToDelete.id) {
        setTemplateBeingEdited(null);
      }
      dispatch({
        type: 'markActionSuccess',
        kind: 'template',
        message: 'Template deleted successfully.',
      });
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to delete campaign template'
      );
    }
  }

  function openSaveTemplateDialog() {
    setTemplateBeingEdited(null);
    setSaveTemplateName(
      state.draft.name.trim() || 'Reusable campaign template'
    );
    setSaveTemplateDescription('');
    dispatch({ type: 'openDialog', dialog: 'saveTemplate' });
  }

  function openUpdateTemplateDialog() {
    if (!templateBeingEdited) {
      return;
    }

    setSaveTemplateName(templateBeingEdited.name);
    setSaveTemplateDescription(templateBeingEdited.description);
    dispatch({ type: 'openDialog', dialog: 'saveTemplate' });
  }

  function applyTemplate(template: CampaignScenarioTemplateSummary) {
    setTemplateBeingEdited(null);
    dispatch({
      type: 'applyScenarioTemplate',
      template,
    });
  }

  function editTemplate(template: CampaignScenarioTemplateSummary) {
    setTemplateBeingEdited(template);
    setSaveTemplateName(template.name);
    setSaveTemplateDescription(template.description);
    dispatch({
      type: 'applyScenarioTemplate',
      template,
    });
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

    dispatch({
      type: 'appendJourneyStep',
      step: nextStep,
      deeplinkTarget: null,
    });
  }

  function renderStepSendGuardControls(step: CampaignJourneyStep): ReactNode {
    const guard = step.sendGuards?.[0] ?? null;
    const selectedAction = guard?.action ?? '';

    return (
      <Stack spacing={1.25}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl fullWidth>
            <InputLabel id={`campaign-send-guard-${step.stepKey}`} shrink>
              Send guard
            </InputLabel>
            <Select
              labelId={`campaign-send-guard-${step.stepKey}`}
              label="Send guard"
              value={selectedAction}
              displayEmpty
              renderValue={(selected) => {
                const action = selected as CampaignSendGuardAction | '';

                return action
                  ? (SEND_GUARD_ACTION_LABELS[action] ?? action)
                  : 'No send guard';
              }}
              onChange={(event) => {
                const action = event.target.value as
                  | CampaignSendGuardAction
                  | '';

                dispatch({
                  type: 'updateJourneyStep',
                  stepKey: step.stepKey,
                  patch: {
                    sendGuards: action ? [{ action }] : [],
                  },
                });
              }}
            >
              <MenuItem value="">No send guard</MenuItem>
              {SEND_GUARD_ACTION_OPTIONS.map((option) => (
                <MenuItem key={option.action} value={option.action}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 0.75, color: COLORS.textSecondary }}
          >
            {guard
              ? 'If this action happens after journey start and before this step is sent, the step is skipped.'
              : 'Select an action that cancels this step if the user does it before send time.'}
          </Typography>
        </Box>
      </Stack>
    );
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
  const goalRewardPoints = state.draft.goalDefinition?.rewardPoints ?? 0;
  const stateBasedTrigger =
    state.draft.trigger.type === 'state_based' ? state.draft.trigger : null;
  const eventBasedTrigger =
    state.draft.trigger.type === 'event_based' ? state.draft.trigger : null;
  const scheduledTrigger =
    state.draft.trigger.type === 'scheduled_recurring'
      ? state.draft.trigger
      : null;
  const selectedSourceEvent = eventBasedTrigger
    ? (state.catalog.sourceEvents.find(
        (option) =>
          option.eventKey === eventBasedTrigger.eventKey &&
          option.producerKey === eventBasedTrigger.producerKey
      ) ?? null)
    : null;
  const isLegacyHiddenSourceEvent = Boolean(
    eventBasedTrigger && !selectedSourceEvent
  );
  const parsedScheduledRule = scheduledTrigger
    ? parseCampaignScheduleRule(scheduledTrigger.recurrenceRule)
    : null;
  const scheduledRuleModel = parsedScheduledRule ?? DEFAULT_CAMPAIGN_SCHEDULE;
  const hasInvalidScheduledRule =
    Boolean(scheduledTrigger?.recurrenceRule.trim()) && !parsedScheduledRule;
  const scheduledDescription = scheduledTrigger
    ? describeCampaignScheduleRule(scheduledTrigger.recurrenceRule, {
        startDate: scheduledTrigger.startDate,
        maxOccurrences: scheduledTrigger.maxOccurrences,
      })
    : '';
  const templateBlockingErrors = validation.errors.filter(
    (error) => !/Step .+ is missing [A-Z]{2} content\./.test(error)
  );
  const isTemplateDerivedCampaign =
    state.draft.audience.segmentSource === 'template_segment' &&
    Boolean(state.draft.audience.sourceSegmentId);
  const canSaveTemplate =
    templateBlockingErrors.length === 0 &&
    (!isTemplateDerivedCampaign || templateBeingEdited !== null);

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
              lg: '280px minmax(0, 1fr) 320px',
            },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <SectionCard title="Scenario templates">
            <Stack spacing={1.5}>
              <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
                Apply a ready-made scenario to prefill audience, trigger,
                journey, and draft copy.
              </Typography>

              {state.catalog.scenarioTemplates.length > 0 ? (
                <Stack spacing={1.25}>
                  {state.catalog.scenarioTemplates.map((template) => (
                    <Paper
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        bgcolor: COLORS.soft,
                        border: `1px solid ${
                          templateBeingEdited?.id === template.id
                            ? COLORS.accent
                            : COLORS.stroke
                        }`,
                        transition:
                          'border-color 160ms ease, transform 160ms ease',
                        '&:hover': {
                          borderColor: COLORS.accent,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1}
                        >
                          <Typography
                            sx={{
                              color: COLORS.textPrimary,
                              fontWeight: 700,
                              lineHeight: 1.3,
                            }}
                          >
                            {template.name}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            sx={{ flexShrink: 0 }}
                          >
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
                            <IconButton
                              size="small"
                              aria-label={`Edit template ${template.name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                editTemplate(template);
                              }}
                              sx={{
                                color: COLORS.textSecondary,
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            {template.source === 'saved' ? (
                              <IconButton
                                size="small"
                                aria-label={`Delete template ${template.name}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setTemplateToDelete(template);
                                }}
                                sx={{
                                  color: COLORS.textSecondary,
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            ) : null}
                          </Stack>
                        </Stack>

                        <Typography
                          sx={{
                            color: COLORS.textSecondary,
                            fontSize: 13,
                            lineHeight: 1.45,
                          }}
                        >
                          {template.description}
                        </Typography>

                        <Typography
                          sx={{
                            color: COLORS.textSecondary,
                            fontSize: 12,
                          }}
                        >
                          {describeScenarioTemplate(template)}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
                  No templates available yet.
                </Typography>
              )}
            </Stack>
          </SectionCard>

          <SectionCard
            title={mode === 'create' ? 'Create campaign' : 'Edit campaign'}
            action={
              <Button
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ color: COLORS.textPrimary }}
              >
                Save draft
              </Button>
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
                  label="Goal description"
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

              <FormControl fullWidth>
                <InputLabel id="campaign-tracked-goal-label" shrink>
                  Tracked goal
                </InputLabel>
                <Select
                  labelId="campaign-tracked-goal-label"
                  label="Tracked goal"
                  displayEmpty
                  value={
                    state.draft.goalDefinition
                      ? `${state.draft.goalDefinition.eventKey}:${state.draft.goalDefinition.attributionMode}`
                      : ''
                  }
                  renderValue={(value) => {
                    if (!value) {
                      return 'No tracked goal';
                    }
                    const match = state.catalog.goalOptions.find(
                      (option) => option.goalKey === value
                    );
                    return match?.label ?? String(value);
                  }}
                  onChange={(event) => {
                    const goalKey = event.target.value as string;
                    if (!goalKey) {
                      dispatch({
                        type: 'changeGoalDefinition',
                        goalDefinition: null,
                      });
                      return;
                    }
                    const option = state.catalog.goalOptions.find(
                      (o) => o.goalKey === goalKey
                    );
                    if (option) {
                      dispatch({
                        type: 'changeGoalDefinition',
                        goalDefinition: {
                          eventKey: option.eventKey,
                          attributionMode: option.attributionMode,
                          rewardPoints: goalRewardPoints,
                        },
                      });
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>No tracked goal</em>
                  </MenuItem>
                  {state.catalog.goalOptions.map((option) => (
                    <MenuItem key={option.goalKey} value={option.goalKey}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Select the backend event used to measure campaign success.
                  Goal suppression and stop-on-goal logic use this definition.
                </FormHelperText>
                {state.draft.goalDefinition === null &&
                validation.warnings.includes(MISSING_TRACKED_GOAL_WARNING) ? (
                  <Alert severity="warning" sx={{ mt: 1.5 }}>
                    {MISSING_TRACKED_GOAL_WARNING}
                  </Alert>
                ) : null}
              </FormControl>

              <TextField
                label="Goal reward points"
                type="number"
                value={goalRewardPoints}
                disabled={!state.draft.goalDefinition}
                onChange={(event) => {
                  if (!state.draft.goalDefinition) {
                    return;
                  }

                  dispatch({
                    type: 'changeGoalDefinition',
                    goalDefinition: {
                      ...state.draft.goalDefinition,
                      rewardPoints: parseRewardPoints(event.target.value),
                    },
                  });
                }}
                inputProps={{
                  min: 0,
                  max: CAMPAIGN_GOAL_REWARD_POINTS_MAX,
                  step: 1,
                }}
                helperText={
                  state.draft.goalDefinition
                    ? 'Awarded once when this campaign goal is reached.'
                    : 'Select a tracked goal before configuring a reward.'
                }
                fullWidth
              />

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
                  <SectionCard title="Specific users">
                    <Stack spacing={2}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Box>
                          <Typography
                            sx={{ color: COLORS.textPrimary, fontWeight: 600 }}
                          >
                            Optional user filter
                          </Typography>
                          <Typography
                            sx={{ color: COLORS.textSecondary, fontSize: 13 }}
                          >
                            Limit the campaign to a hand-picked list of users.
                            Search by name or e-mail.
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
                      You can leave this empty if you hand-pick specific users
                      above.
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {state.catalog.retentionStageOptions.map((option) => (
                        <ToggleChip
                          key={option.stage}
                          label={option.label}
                          chipColor={option.chipColor}
                          selected={state.draft.audience.criteria.retentionStages.includes(
                            option.stage
                          )}
                          onClick={() => toggleRetentionStage(option.stage)}
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
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                          Goal suppression is always on
                        </Typography>
                        <Typography
                          sx={{ color: COLORS.textSecondary, fontSize: 13 }}
                        >
                          Users who already reached the campaign goal for the
                          current journey instance are skipped automatically at
                          planning time and again right before send.
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
                                    maxSendsPerUser:
                                      state.catalog.defaults
                                        .eventMaxSendsPerUser,
                                  },
                                });
                              } else {
                                dispatch({
                                  type: 'changeTrigger',
                                  trigger: createScheduledCampaignTrigger(),
                                });
                              }
                            }}
                          />
                        ))}
                      </Stack>

                      {stateBasedTrigger ? (
                        <Stack spacing={2}>
                          <Alert severity="info" sx={{ bgcolor: COLORS.soft }}>
                            Users enter this journey when they match the
                            selected audience. The campaign checks eligibility
                            on each planner cycle.
                          </Alert>
                          <TextField
                            label="Re-entry cooldown (hours)"
                            type="number"
                            value={stateBasedTrigger.reentryCooldownHours ?? ''}
                            helperText="Prevents the same user from starting this journey again too soon."
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
                            <InputLabel id="campaign-entry-event-label">
                              Entry event
                            </InputLabel>
                            <Select
                              labelId="campaign-entry-event-label"
                              label="Entry event"
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
                              {isLegacyHiddenSourceEvent &&
                              eventBasedTrigger ? (
                                <MenuItem
                                  value={`${eventBasedTrigger.eventKey}:${eventBasedTrigger.producerKey}`}
                                >
                                  {getSourceEventLabel(
                                    eventBasedTrigger.eventKey
                                  )}
                                </MenuItem>
                              ) : null}
                              {state.catalog.sourceEvents.map((option) => (
                                <MenuItem
                                  key={`${option.eventKey}:${option.producerKey}`}
                                  value={`${option.eventKey}:${option.producerKey}`}
                                >
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>
                              Choose the product event that should start the
                              journey.
                            </FormHelperText>
                          </FormControl>
                          {selectedSourceEvent ? (
                            <Alert
                              severity="info"
                              sx={{ bgcolor: COLORS.soft }}
                            >
                              {selectedSourceEvent.description}
                              <br />
                              Source:{' '}
                              {getSourceEventProducerLabel(
                                selectedSourceEvent.producerKey
                              )}
                            </Alert>
                          ) : null}
                          {isLegacyHiddenSourceEvent && eventBasedTrigger ? (
                            <Alert
                              severity="warning"
                              sx={{ bgcolor: COLORS.soft }}
                            >
                              This campaign uses a legacy source event that is
                              no longer offered for new campaigns.
                              <br />
                              Source:{' '}
                              {getSourceEventProducerLabel(
                                eventBasedTrigger.producerKey
                              )}
                            </Alert>
                          ) : null}
                          <Box
                            sx={{
                              display: 'grid',
                              gap: 2,
                              gridTemplateColumns: {
                                xs: '1fr',
                                md: 'repeat(2, minmax(0, 1fr))',
                              },
                            }}
                          >
                            <TextField
                              label="Re-entry cooldown (hours)"
                              type="number"
                              value={
                                eventBasedTrigger.reentryCooldownHours ?? ''
                              }
                              helperText="Prevents the same user from starting this event-based journey again too soon."
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
                            <TextField
                              label="Max sends per user"
                              type="number"
                              value={eventBasedTrigger.maxSendsPerUser ?? ''}
                              helperText="Leave empty to use the backend default."
                              inputProps={{ min: 1 }}
                              onChange={(event) =>
                                dispatch({
                                  type: 'changeTrigger',
                                  trigger: {
                                    ...eventBasedTrigger,
                                    maxSendsPerUser:
                                      event.target.value === ''
                                        ? null
                                        : Number(event.target.value),
                                  },
                                })
                              }
                            />
                          </Box>
                        </Stack>
                      ) : null}

                      {scheduledTrigger ? (
                        <Stack spacing={2}>
                          {hasInvalidScheduledRule ? (
                            <Alert severity="warning">
                              This schedule contains an invalid saved rule. The
                              builder below is showing a safe fallback until you
                              save a new schedule.
                            </Alert>
                          ) : null}
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, minmax(0, 1fr))',
                                xl: 'repeat(4, minmax(0, 1fr))',
                              },
                              gap: 2,
                              alignItems: 'start',
                            }}
                          >
                            <TextField
                              label="Start date"
                              type="date"
                              value={scheduledTrigger.startDate ?? ''}
                              onChange={(event) =>
                                dispatch({
                                  type: 'changeTrigger',
                                  trigger: {
                                    ...scheduledTrigger,
                                    startDate: event.target.value || null,
                                  },
                                })
                              }
                              InputLabelProps={{ shrink: true }}
                              helperText="Choose the local calendar day when the first occurrence can start."
                              fullWidth
                              sx={{
                                gridColumn: {
                                  xs: 'auto',
                                  sm: '1 / -1',
                                  xl: 'span 1',
                                },
                              }}
                            />
                            <TextField
                              label="Repeat every"
                              type="number"
                              value={scheduledRuleModel.interval}
                              onChange={(event) => {
                                const interval = Math.max(
                                  1,
                                  Number(event.target.value) || 1
                                );
                                dispatch({
                                  type: 'changeTrigger',
                                  trigger: {
                                    ...scheduledTrigger,
                                    recurrenceRule: buildCampaignScheduleRule({
                                      ...scheduledRuleModel,
                                      interval,
                                    }),
                                  },
                                });
                              }}
                              fullWidth
                            />
                            <FormControl fullWidth>
                              <InputLabel id="campaign-schedule-frequency-label">
                                Cadence
                              </InputLabel>
                              <Select
                                labelId="campaign-schedule-frequency-label"
                                label="Cadence"
                                value={scheduledRuleModel.frequency}
                                onChange={(event) => {
                                  const frequency = event.target
                                    .value as typeof scheduledRuleModel.frequency;
                                  dispatch({
                                    type: 'changeTrigger',
                                    trigger: {
                                      ...scheduledTrigger,
                                      recurrenceRule: buildCampaignScheduleRule(
                                        {
                                          ...scheduledRuleModel,
                                          frequency,
                                          byDays:
                                            frequency === 'WEEKLY'
                                              ? scheduledRuleModel.byDays.length
                                                ? scheduledRuleModel.byDays
                                                : ['MO']
                                              : [],
                                        }
                                      ),
                                    },
                                  });
                                }}
                              >
                                <MenuItem value="DAILY">Day(s)</MenuItem>
                                <MenuItem value="WEEKLY">Week(s)</MenuItem>
                              </Select>
                            </FormControl>
                            <TextField
                              label="Send time"
                              type="time"
                              value={formatCampaignScheduleTime(
                                scheduledRuleModel
                              )}
                              onChange={(event) =>
                                dispatch({
                                  type: 'changeTrigger',
                                  trigger: {
                                    ...scheduledTrigger,
                                    recurrenceRule: buildCampaignScheduleRule(
                                      withCampaignScheduleTime(
                                        scheduledRuleModel,
                                        event.target.value
                                      )
                                    ),
                                  },
                                })
                              }
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                            />
                            <TextField
                              label="Max occurrences"
                              type="number"
                              value={scheduledTrigger.maxOccurrences ?? ''}
                              onChange={(event) =>
                                dispatch({
                                  type: 'changeTrigger',
                                  trigger: {
                                    ...scheduledTrigger,
                                    maxOccurrences:
                                      event.target.value === ''
                                        ? 1
                                        : Math.max(
                                            1,
                                            Number(event.target.value) || 1
                                          ),
                                  },
                                })
                              }
                              inputProps={{ min: 1 }}
                              helperText="1 sends the full journey once. Higher values repeat every step on each scheduled occurrence."
                              fullWidth
                            />
                          </Box>
                          {scheduledRuleModel.frequency === 'WEEKLY' ? (
                            <Stack spacing={1}>
                              <Typography
                                sx={{
                                  color: COLORS.textSecondary,
                                  fontSize: 13,
                                }}
                              >
                                Send on
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                useFlexGap
                              >
                                {CAMPAIGN_WEEKDAY_OPTIONS.map((option) => {
                                  const selected =
                                    scheduledRuleModel.byDays.includes(
                                      option.key
                                    );

                                  return (
                                    <ToggleChip
                                      key={option.key}
                                      label={option.shortLabel}
                                      selected={selected}
                                      onClick={() => {
                                        const nextByDays = selected
                                          ? scheduledRuleModel.byDays.filter(
                                              (day) => day !== option.key
                                            )
                                          : [
                                              ...scheduledRuleModel.byDays,
                                              option.key,
                                            ];
                                        const safeByDays =
                                          nextByDays.length > 0
                                            ? nextByDays
                                            : [option.key];

                                        dispatch({
                                          type: 'changeTrigger',
                                          trigger: {
                                            ...scheduledTrigger,
                                            recurrenceRule:
                                              buildCampaignScheduleRule({
                                                ...scheduledRuleModel,
                                                byDays: safeByDays,
                                              }),
                                          },
                                        });
                                      }}
                                    />
                                  );
                                })}
                              </Stack>
                            </Stack>
                          ) : null}

                          <Alert severity="info" sx={{ bgcolor: COLORS.soft }}>
                            {parsedScheduledRule
                              ? scheduledDescription
                              : describeCampaignScheduleRule(
                                  buildCampaignScheduleRule(scheduledRuleModel),
                                  {
                                    startDate: scheduledTrigger.startDate,
                                    maxOccurrences:
                                      scheduledTrigger.maxOccurrences,
                                  }
                                )}
                          </Alert>
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
                                label="Starts from"
                                value={getJourneyAnchorLabel(step.anchor.type)}
                                InputProps={{ readOnly: true }}
                                fullWidth
                              />
                              <TextField
                                label="Wait before this step (minutes)"
                                type="number"
                                value={step.delayMinutes ?? ''}
                                disabled={step.sameLocalTimeNextDay}
                                helperText={
                                  step.sameLocalTimeNextDay
                                    ? 'This step is using the next-day same local time rule.'
                                    : 'Use 0 to send as soon as this step becomes eligible.'
                                }
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
                                label="Earliest local send time"
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
                                label="Latest local send time"
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
                              alignItems={{
                                xs: 'stretch',
                                md: 'flex-start',
                              }}
                            >
                              <TextField
                                label="Minimum gap after any campaign send (hours)"
                                type="number"
                                value={step.frequencyCapHours ?? ''}
                                helperText="If the user received another live step from this campaign inside this window, this step will be skipped."
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
                                sx={{ flex: { md: '1 1 0' } }}
                              />
                              <Box
                                sx={{
                                  flex: { md: '1 1 0' },
                                  minWidth: 0,
                                }}
                              >
                                {renderStepSendGuardControls(step)}
                              </Box>
                            </Stack>

                            <FormHelperText sx={{ mt: 0 }}>
                              Later steps stop automatically once the campaign
                              goal is reached for the current journey instance.
                            </FormHelperText>

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
                              label="Send next day at the same local time instead of using the minute delay"
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
                            onClick={() => openTokenPicker('title')}
                          >
                            Insert token in title
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => openTokenPicker('body')}
                          >
                            Insert token in body
                          </Button>
                        </Stack>

                        <TextField
                          label="Push title"
                          value={activeStepContent.title}
                          inputRef={(element) => {
                            contentInputRefs.current.title = element;
                          }}
                          inputProps={{
                            onClick: (
                              event: SyntheticEvent<CampaignEditorTextInputElement>
                            ) => handleContentSelection('title', event),
                            onKeyUp: (
                              event: SyntheticEvent<CampaignEditorTextInputElement>
                            ) => handleContentSelection('title', event),
                            onSelect: (
                              event: SyntheticEvent<CampaignEditorTextInputElement>
                            ) => handleContentSelection('title', event),
                          }}
                          onChange={(event) =>
                            handleStepContentChange('title', event)
                          }
                          fullWidth
                        />
                        <TextField
                          label="Push body"
                          value={activeStepContent.body}
                          inputRef={(element) => {
                            contentInputRefs.current.body = element;
                          }}
                          inputProps={{
                            onClick: (
                              event: SyntheticEvent<CampaignEditorTextInputElement>
                            ) => handleContentSelection('body', event),
                            onKeyUp: (
                              event: SyntheticEvent<CampaignEditorTextInputElement>
                            ) => handleContentSelection('body', event),
                            onSelect: (
                              event: SyntheticEvent<CampaignEditorTextInputElement>
                            ) => handleContentSelection('body', event),
                          }}
                          onChange={(event) =>
                            handleStepContentChange('body', event)
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
                          <InputLabel id="campaign-step-action-label" shrink>
                            Action after tap (optional)
                          </InputLabel>
                          <Select
                            labelId="campaign-step-action-label"
                            label="Action after tap (optional)"
                            displayEmpty
                            value={activeStepContent.deeplinkTarget ?? ''}
                            renderValue={(value) =>
                              getDeeplinkOptionLabel(
                                state.catalog.deeplinkOptions,
                                (value as CampaignDeeplinkTarget | '') || null
                              )
                            }
                            onChange={(event) =>
                              dispatch({
                                type: 'changeDeeplink',
                                stepKey: state.activeContentStepKey,
                                locale: activeLocale,
                                target:
                                  (event.target
                                    .value as CampaignDeeplinkTarget) || null,
                              })
                            }
                          >
                            <MenuItem value="">
                              <em>No follow-up action</em>
                            </MenuItem>
                            {state.catalog.deeplinkOptions.map((option) => (
                              <MenuItem
                                key={option.target}
                                value={option.target}
                              >
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            Optional. Choose the screen or action the push
                            notification opens when tapped. If left empty, the
                            app falls back to the default notifications flow.
                          </FormHelperText>
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
                  {state.activeStep !== CampaignEditorStep.REVIEW ? (
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
                  ) : null}
                </Stack>
              </Stack>
            </Stack>
          </SectionCard>

          <SectionCard title="Readiness">
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {state.draft.audience.criteria.locales.map((locale) => (
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

              <Typography sx={{ color: COLORS.textSecondary, fontSize: 12 }}>
                Warning states still need review, but scheduling only blocks
                when a selected locale is missing required step content or the
                recurring rule is invalid.
              </Typography>

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
                  startIcon={<Save />}
                  variant="outlined"
                  disabled={!canSaveTemplate}
                  onClick={
                    templateBeingEdited
                      ? openUpdateTemplateDialog
                      : openSaveTemplateDialog
                  }
                  sx={{ color: COLORS.textPrimary, borderColor: COLORS.stroke }}
                >
                  {templateBeingEdited ? 'Update template' : 'Save as template'}
                </Button>
                {isTemplateDerivedCampaign && !templateBeingEdited ? (
                  <Typography
                    sx={{ color: COLORS.textSecondary, fontSize: 12 }}
                  >
                    Template-based campaigns cannot be saved as a new template.
                  </Typography>
                ) : null}
                <Button
                  startIcon={<Science />}
                  variant="outlined"
                  disabled={!canSendTestCampaign(state.draft)}
                  onClick={handleOpenSendTestDialog}
                  sx={{ color: COLORS.textPrimary, borderColor: COLORS.stroke }}
                >
                  Send Test
                </Button>
                <Button
                  variant="contained"
                  disabled={!canScheduleCampaign(state.draft)}
                  onClick={handleOpenScheduleDialog}
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
        open={state.dialogs.saveTemplate}
        onClose={() =>
          dispatch({ type: 'closeDialog', dialog: 'saveTemplate' })
        }
      >
        <DialogTitle>
          {templateBeingEdited ? 'Update template' : 'Save as template'}
        </DialogTitle>
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
          <Button
            onClick={handleSaveTemplate}
            disabled={!saveTemplateName.trim()}
          >
            {templateBeingEdited ? 'Update template' : 'Save template'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
      >
        <DialogTitle>Delete template</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1 }}>
            Remove {templateToDelete?.name ?? 'this template'} from Scenario
            templates?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateToDelete(null)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteTemplate}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.sendTest}
        onClose={() => {
          if (isSendingTest) {
            return;
          }
          dispatch({ type: 'closeDialog', dialog: 'sendTest' });
        }}
      >
        <DialogTitle>Send test</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 360 }}>
            <TextField
              label="Recipients"
              helperText={
                normalizedTestRecipients.length === 0
                  ? 'Add at least one user id, email, or device key.'
                  : 'Comma-separated user ids, emails, or device keys'
              }
              error={normalizedTestRecipients.length === 0}
              value={testRecipients}
              onChange={(event) => setTestRecipients(event.target.value)}
              disabled={isSendingTest}
              fullWidth
            />
            <FormControl fullWidth>
              <Select
                value={testLocale}
                onChange={(event) =>
                  setTestLocale(event.target.value as CampaignLocale)
                }
                disabled={isSendingTest}
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
            disabled={isSendingTest}
            onClick={() =>
              dispatch({ type: 'closeDialog', dialog: 'sendTest' })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendTest}
            disabled={normalizedTestRecipients.length === 0 || isSendingTest}
          >
            {isSendingTest ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} color="inherit" />
                <span>Sending...</span>
              </Stack>
            ) : (
              'Send test'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={state.dialogs.schedule}
        onClose={() => {
          if (isScheduling) {
            return;
          }

          dispatch({ type: 'closeDialog', dialog: 'schedule' });
        }}
      >
        <DialogTitle>Schedule campaign</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1 }}>
            {state.draft.trigger.type === 'scheduled_recurring'
              ? state.draft.trigger.maxOccurrences &&
                state.draft.trigger.maxOccurrences > 1
                ? 'This will schedule the recurring campaign from the chosen start date. Each occurrence re-enters the full journey from step 1 for eligible users.'
                : 'This will schedule a one-time journey occurrence from the chosen start date for eligible users.'
              : 'This will schedule the current trigger + journey definition for live delivery.'}
          </Typography>
          {state.draft.id === null || state.isDirty ? (
            <Typography sx={{ mt: 2, color: COLORS.textSecondary }}>
              Your latest changes will be saved first, then the campaign will
              be scheduled.
            </Typography>
          ) : null}
          {error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isScheduling}
            onClick={() =>
              dispatch({ type: 'closeDialog', dialog: 'schedule' })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={isScheduling}>
            {isScheduling ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} color="inherit" />
                <span>Scheduling...</span>
              </Stack>
            ) : state.draft.id === null || state.isDirty ? (
              'Save and schedule'
            ) : (
              'Confirm schedule'
            )}
          </Button>
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
                onClick={() => handleInsertToken(token.token)}
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
