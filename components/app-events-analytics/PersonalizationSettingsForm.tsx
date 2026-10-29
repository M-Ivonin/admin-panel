'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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

/** Shows the persisted frequency and saves only an explicit operator change. */
export function PersonalizationSettingsForm() {
  const [saved, setSaved] = useState<PersonalizationSettings | null>(null);
  const [hours, setHours] = useState('');
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
      setHours(String(value.minimumContactIntervalHours));
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
  const valid =
    hours.trim() !== '' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 168;
  async function save() {
    if (!saved || !valid) return;
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await savePersonalizationSettings(value, saved.revision);
      setSaved(result);
      setHours(String(result.minimumContactIntervalHours));
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
          Personalized message frequency
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
        <Alert severity="success">
          Settings saved. New personalized contacts use this interval.
        </Alert>
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
              error={!valid}
              helperText="Whole hours from 1 to 168 (7 days)."
              slotProps={{ htmlInput: { min: 1, max: 168, step: 1 } }}
              sx={{ maxWidth: 300 }}
            />
            <Alert severity="info">
              Applies only to personalization. Service Campaigns keep their own
              frequency rules. Consent, duplicate checks and quiet windows still
              apply.
            </Alert>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Button
                variant="contained"
                disabled={
                  busy || !valid || value === saved.minimumContactIntervalHours
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
