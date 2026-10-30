'use client';

import { useCallback, useEffect, useState } from 'react';
import {
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
import {
  getPersonalizationSettings,
  savePersonalizationSettings,
  type PersonalizationSettings,
} from '@/lib/api/user-engagement';

/** Edits shared contact frequency and AI quotas with revision-protected saves. */
export function PersonalizationSettingsForm() {
  const [saved, setSaved] = useState<PersonalizationSettings | null>(null);
  const [disabledScenarios, setDisabledScenarios] = useState<string[]>([]);
  const [hours, setHours] = useState('');
  const [aiPerUser, setAiPerUser] = useState('');
  const [aiPerDay, setAiPerDay] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const read = useCallback(async () => {
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      const value = await getPersonalizationSettings();
      setSaved(value);
      setDisabledScenarios(value.disabledScenarioIds);
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
  const valid = hoursValid && aiLimitValid(aiPerUser) && aiLimitValid(aiPerDay);
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
      });
      setSaved(result);
      setDisabledScenarios(result.disabledScenarioIds);
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
          Personalization scenarios, message frequency and AI usage
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
                Scenarios
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Choose which personalized messages may be selected. Turning a
                scenario off also blocks its queued messages before sending.
                Changes apply after saving.
              </Typography>
            </Box>
            <Stack spacing={2}>
              {saved.scenarios.map((scenario) => (
                <Box key={scenario.id}>
                  <FormControlLabel
                    sx={{ m: 0, width: '100%', justifyContent: 'space-between', gap: 2 }}
                    labelPlacement="start"
                    label={scenario.title}
                    control={
                      <Switch
                        checked={!disabledScenarios.includes(scenario.id)}
                        disabled={busy}
                        onChange={(_, checked) => {
                          setDisabledScenarios((current) => checked
                            ? current.filter((id) => id !== scenario.id)
                            : [...current, scenario.id]);
                          setSuccess(false);
                        }}
                      />
                    }
                  />
                  <Typography variant="body2" color="text.secondary">
                    {scenario.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Alert severity="info">
              Enabled scenarios still require matching user activity, consent and
              delivery approval. Enabling a scenario does not start a campaign.
              Screen views and payment events continue to be recorded.
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
              Applies only to personalization. Service Campaigns keep their own
              frequency rules. Consent, duplicate checks and quiet windows still
              apply.
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
                    perUser === saved.aiCallsPerUser24h &&
                    perDay === saved.aiCallsPerDay &&
                    disabledScenarios.length === saved.disabledScenarioIds.length &&
                    disabledScenarios.every((id) => saved.disabledScenarioIds.includes(id)))
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
