'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  getPersonalizationSettings,
  savePersonalizationSettings,
  type PersonalizationSettings,
} from '@/lib/api/user-engagement';

import {
  editWeight,
  parseWeight,
  reconcileWeights,
  sameWeights,
  totalWeight,
} from './message-weights';

/** Edits shared contact frequency and AI quotas with revision-protected saves. */
export function PersonalizationSettingsForm() {
  const [saved, setSaved] = useState<PersonalizationSettings | null>(null);
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['message']);
  const [disabledScenarios, setDisabledScenarios] = useState<string[]>([]);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [messageWeights, setMessageWeights] = useState<Record<
    string,
    number
  > | null>(null);
  const [weightEdit, setWeightEdit] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [hours, setHours] = useState('');
  const [aiPerUser, setAiPerUser] = useState('');
  const [aiPerDay, setAiPerDay] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const matchesSearch = (
    scenario: PersonalizationSettings['scenarios'][number]
  ) =>
    [scenario.title, scenario.when, scenario.reaction].some((text) =>
      text.toLowerCase().includes(search.trim().toLowerCase())
    );
  const read = useCallback(async () => {
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      const value = await getPersonalizationSettings();
      setSaved(value);
      setEmailEnabled(value.emailEnabled === true);
      setDisabledScenarios(value.disabledScenarioIds);
      setMessageWeights(
        reconcileWeights(
          value.scenarios
            .filter((scenario) => scenario.group === 'message')
            .map(({ id }) => id),
          value.messageWeightsBps
        )
      );
      setWeightEdit(null);
      setHours(String(value.minimumContactIntervalHours));
      setAiPerUser(String(value.aiCallsPerUser24h));
      setAiPerDay(String(value.aiCallsPerDay));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load settings.');
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    void read();
  }, [read]);
  const value = Number(hours);
  const perUser = Number(aiPerUser);
  const perDay = Number(aiPerDay);
  const aiLimitValid = (raw: string) =>
    raw.trim() !== '' &&
    Number.isInteger(Number(raw)) &&
    Number(raw) >= 1 &&
    Number(raw) <= 1000000;
  const hoursValid =
    hours.trim() !== '' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 168;
  const messageIds =
    saved?.scenarios
      .filter((scenario) => scenario.group === 'message')
      .map(({ id }) => id) ?? [];
  const weightsAvailable = saved?.messageWeightsBps !== undefined;
  const units = weightEdit ? parseWeight(weightEdit.text) : null;
  const shownWeights =
    weightEdit && units !== null
      ? editWeight(messageIds, messageWeights, weightEdit.id, units)
      : messageWeights;
  const weightsChanged =
    weightsAvailable &&
    !sameWeights(
      shownWeights,
      reconcileWeights(messageIds, saved?.messageWeightsBps)
    );
  const valid =
    hoursValid &&
    aiLimitValid(aiPerUser) &&
    aiLimitValid(aiPerDay) &&
    (!weightEdit || units !== null);
  const emailChanged =
    saved?.emailEnabled !== undefined && emailEnabled !== saved.emailEnabled;
  async function save() {
    if (!saved || !valid) return;
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await savePersonalizationSettings(value, saved.revision, {
        aiCallsPerUser24h: perUser,
        aiCallsPerDay: perDay,
        disabledScenarioIds: disabledScenarios,
        ...(emailChanged && { emailEnabled }),
        ...(weightsChanged && { messageWeightsBps: shownWeights }),
      });
      setSaved(result);
      setEmailEnabled(result.emailEnabled === true);
      setDisabledScenarios(result.disabledScenarioIds);
      setMessageWeights(
        reconcileWeights(
          result.scenarios
            .filter((scenario) => scenario.group === 'message')
            .map(({ id }) => id),
          result.messageWeightsBps
        )
      );
      setWeightEdit(null);
      setHours(String(result.minimumContactIntervalHours));
      setAiPerUser(String(result.aiCallsPerUser24h));
      setAiPerDay(String(result.aiCallsPerDay));
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save settings.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack spacing={3} sx={{ maxWidth: 760 }}>
      <Box>
        <Typography component="h1" variant="h4" fontWeight={700}>
          Settings
        </Typography>
        <Typography color="text.secondary">
          Personalization channels, scenarios, message frequency and AI usage
        </Typography>
      </Box>
      {error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" disabled={busy} onClick={() => void read()}>
              Reload
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert severity="success">Personalization settings saved.</Alert>
      ) : null}
      {busy && !saved ? (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CircularProgress size={20} />
          <Typography>Loading personalization settings…</Typography>
        </Stack>
      ) : null}
      {saved ? (
        <Paper component="section" sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography component="h2" variant="h6" fontWeight={700}>
                Channels
              </Typography>
              <FormControlLabel
                sx={{
                  m: 0,
                  mt: 1,
                  width: '100%',
                  justifyContent: 'space-between',
                }}
                labelPlacement="start"
                label="Email"
                control={
                  <Switch
                    checked={emailEnabled}
                    disabled={busy || saved.emailEnabled === undefined}
                    onChange={(_, checked) => {
                      setEmailEnabled(checked);
                      setSuccess(false);
                    }}
                  />
                }
              />
              <Typography color="text.secondary" variant="body2">
                {saved.emailEnabled === undefined
                  ? 'Email channel settings are unavailable on this backend.'
                  : 'Allow personalized AI Chat reminders by email. Changes apply after saving.'}
              </Typography>
            </Box>
            <Box>
              <Typography component="h2" variant="h6" fontWeight={700}>
                Scenarios
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Choose which activities personalization may use and which
                existing messages it may select.
              </Typography>
            </Box>
            <TextField
              label="Find a scenario"
              value={search}
              type="search"
              onChange={(event) => setSearch(event.target.value)}
              helperText={`${saved.scenarios.length} scenarios · Search by activity, condition or reaction`}
            />
            <Stack spacing={1}>
              {(
                [
                  ['behavior', 'Behavioral events'],
                  ['message', 'AI messages'],
                ] as const
              ).map(([group, label]) => {
                const all = saved.scenarios.filter(
                  (scenario) => scenario.group === group
                );
                const query = search.trim().toLowerCase();
                const visible = all.filter(matchesSearch);
                if (!visible.length) return null;
                return (
                  <Accordion
                    key={group}
                    expanded={query ? true : expandedGroups.includes(group)}
                    onChange={(_, expanded) =>
                      setExpandedGroups((current) =>
                        expanded
                          ? [...current, group]
                          : current.filter((item) => item !== group)
                      )
                    }
                    disableGutters
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      boxShadow: 'none',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={700}>
                        {label} ·{' '}
                        {query
                          ? `${visible.length} of ${all.length}`
                          : all.length}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={3}>
                        {group === 'message' && weightsAvailable && (
                          <Stack
                            spacing={1.25}
                            sx={{
                              borderBottom: 1,
                              borderColor: 'divider',
                              pb: 2,
                            }}
                          >
                            <Stack
                              direction="row"
                              useFlexGap
                              flexWrap="wrap"
                              spacing={1}
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Typography fontWeight={700}>
                                Total weight: 100%
                              </Typography>
                              <Button
                                size="small"
                                disabled={
                                  busy || (shownWeights === null && !weightEdit)
                                }
                                onClick={() => {
                                  setMessageWeights(null);
                                  setWeightEdit(null);
                                  setSuccess(false);
                                }}
                              >
                                Reset to equal weights
                              </Button>
                            </Stack>
                            <Typography color="text.secondary" variant="body2">
                              Weights apply to equally useful messages. Editing
                              one percentage redistributes the rest. Disabled
                              messages keep their weights.
                            </Typography>
                          </Stack>
                        )}
                        {visible.map((scenario) => (
                          <Box key={scenario.id}>
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              alignItems={{ xs: 'stretch', sm: 'center' }}
                              spacing={{ xs: 0.75, sm: 2 }}
                            >
                              <FormControlLabel
                                sx={{
                                  m: 0,
                                  flex: 1,
                                  minWidth: 0,
                                  justifyContent: 'space-between',
                                  gap: 2,
                                }}
                                labelPlacement="start"
                                label={scenario.title}
                                control={
                                  <Switch
                                    checked={
                                      !disabledScenarios.includes(scenario.id)
                                    }
                                    disabled={busy}
                                    onChange={(_, checked) => {
                                      setDisabledScenarios((current) =>
                                        checked
                                          ? current.filter(
                                              (id) => id !== scenario.id
                                            )
                                          : [...current, scenario.id]
                                      );
                                      setSuccess(false);
                                    }}
                                  />
                                }
                              />
                              {group === 'message' && weightsAvailable && (
                                <TextField
                                  type="number"
                                  size="small"
                                  label="Weight %"
                                  sx={{
                                    width: 100,
                                    flexShrink: 0,
                                    alignSelf: { xs: 'flex-end', sm: 'center' },
                                  }}
                                  disabled={busy}
                                  error={
                                    weightEdit?.id === scenario.id &&
                                    units === null
                                  }
                                  value={
                                    weightEdit?.id === scenario.id
                                      ? weightEdit.text
                                      : Number(
                                          (
                                            (shownWeights?.[scenario.id] ??
                                              totalWeight / messageIds.length) /
                                            100
                                          ).toFixed(2)
                                        )
                                  }
                                  onChange={(event) => {
                                    setWeightEdit({
                                      id: scenario.id,
                                      text: event.target.value,
                                    });
                                    setSuccess(false);
                                  }}
                                  onBlur={() => {
                                    if (
                                      weightEdit?.id === scenario.id &&
                                      units !== null
                                    ) {
                                      setMessageWeights(shownWeights);
                                      setWeightEdit(null);
                                    }
                                  }}
                                  slotProps={{
                                    htmlInput: {
                                      min: 0,
                                      max: 100,
                                      step: 0.01,
                                      'aria-label': `Weight for ${scenario.title}`,
                                    },
                                  }}
                                />
                              )}
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <Box component="span" fontWeight={700}>
                                When:{' '}
                              </Box>
                              {scenario.when}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              <Box component="span" fontWeight={700}>
                                React:{' '}
                              </Box>
                              {scenario.reaction}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
              {!saved.scenarios.some(matchesSearch) ? (
                <Typography color="text.secondary">
                  No matching scenarios.
                </Typography>
              ) : null}
            </Stack>
            <Alert severity="info">
              Behavioral switches control optional evidence for selecting
              existing messages; an event never requires a message. Analytics,
              verified access, pending purchases, consent and already-read news
              protections stay active. Disabled AI messages are also blocked
              before sending. Changes apply after saving.
            </Alert>
            <Box>
              <Typography component="h2" variant="h6" fontWeight={700}>
                Contact interval
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Minimum time between regular personalized messages to the same
                user, across push, email and in-app channels. Default: 6 hours.
              </Typography>
            </Box>
            <TextField
              label="Minimum interval (hours)"
              type="number"
              value={hours}
              disabled={busy}
              onChange={(event) => {
                setHours(event.target.value);
                setSuccess(false);
              }}
              error={!hoursValid}
              helperText="Whole hours from 1 to 168 (7 days)."
              slotProps={{ htmlInput: { min: 1, max: 168, step: 1 } }}
              sx={{ maxWidth: 300 }}
            />
            <Alert severity="info">
              The interval applies only to personalized AI messages. Service
              Campaigns keep their own frequency rules. Consent, duplicate
              checks and quiet windows still apply.
            </Alert>
            <Box>
              <Typography component="h2" variant="h6" fontWeight={700}>
                AI usage limits
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Limit AI decisions independently of message frequency. Defaults:
                4 calls per user over 24 hours and 200 calls per server day.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="AI calls per user (24 hours)"
                type="number"
                value={aiPerUser}
                disabled={busy}
                onChange={(event) => {
                  setAiPerUser(event.target.value);
                  setSuccess(false);
                }}
                error={!aiLimitValid(aiPerUser)}
                helperText="Rolling 24-hour window for each user."
                slotProps={{ htmlInput: { min: 1, max: 1000000, step: 1 } }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="AI calls per server day"
                type="number"
                value={aiPerDay}
                disabled={busy}
                onChange={(event) => {
                  setAiPerDay(event.target.value);
                  setSuccess(false);
                }}
                error={!aiLimitValid(aiPerDay)}
                helperText="Across all users, resets at 00:00 UTC."
                slotProps={{ htmlInput: { min: 1, max: 1000000, step: 1 } }}
                sx={{ flex: 1 }}
              />
            </Stack>
            <Typography color="text.secondary" variant="body2">
              Whole call limits from 1 to 1,000,000. Exhausted AI quotas use the
              rule baseline or no action; they do not authorize extra messages.
              Failed or timed-out attempts still count. Saved limits apply to
              new evaluations without restarting the backend.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Button
                variant="contained"
                disabled={
                  busy ||
                  !valid ||
                  (value === saved.minimumContactIntervalHours &&
                    !emailChanged &&
                    !weightsChanged &&
                    perUser === saved.aiCallsPerUser24h &&
                    perDay === saved.aiCallsPerDay &&
                    disabledScenarios.length ===
                      saved.disabledScenarioIds.length &&
                    disabledScenarios.every((id) =>
                      saved.disabledScenarioIds.includes(id)
                    ))
                }
                onClick={() => void save()}
              >
                {busy ? 'Saving…' : 'Save changes'}
              </Button>
              <Typography variant="body2" color="text.secondary">
                Saved interval: {saved.minimumContactIntervalHours} hours
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Last updated:{' '}
              {new Date(saved.updatedAt).toLocaleString('en-GB', {
                timeZone: 'UTC',
              })}{' '}
              UTC{saved.updatedBy ? ` · ${saved.updatedBy}` : ''}
            </Typography>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
