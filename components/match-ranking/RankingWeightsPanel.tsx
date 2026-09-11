'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import {
  createMatchRankingConfiguration,
  getMatchRankingRuleDefaults,
} from '@/lib/api/match-ranking';
import type { MatchRankingConfiguration } from '@/modules/match-ranking/types';
import {
  mergeRankingRules,
  rankingRuleGroups,
  rankingRuleOptions,
  readRule,
  writeRule,
} from '@/modules/match-ranking/rule-fields';

export function RankingWeightsPanel({
  items,
  onSaved,
  onActivate,
}: {
  items: MatchRankingConfiguration[];
  onSaved: () => Promise<void>;
  onActivate: (item: MatchRankingConfiguration) => void;
}) {
  const [defaults, setDefaults] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(
    () => items.find((item) => item.active)?.id ?? items[0]?.id ?? ''
  );
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    void getMatchRankingRuleDefaults().then(
      (value) => {
        if (active) setDefaults(value);
      },
      (caught: unknown) => {
        if (active) setError(messageOf(caught));
      }
    );
    return () => {
      active = false;
    };
  }, [retry]);
  if (error)
    return (
      <Alert
        severity="error"
        action={
          <Button onClick={() => setRetry((value) => value + 1)}>Retry</Button>
        }
      >
        {error}
      </Alert>
    );
  if (!defaults)
    return <CircularProgress aria-label="Loading ranking weights" />;
  const base = items.find((item) => item.id === selected);
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5">Weights &amp; formula</Typography>
        <Typography color="text.secondary">
          Choose ranking values from the dropdowns. Save a new version, then
          activate it when ready.
        </Typography>
      </Box>
      {items.length ? (
        <TextField
          select
          label="Base configuration"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          {items.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.version}
              {item.active ? ' · Active' : ' · Inactive'}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <Alert severity="info">
          Showing server defaults. Create a configuration in Configurations to
          set the rollout audience before saving weights.
        </Alert>
      )}
      <WeightsEditor
        key={selected}
        defaults={defaults}
        base={base}
        onSaved={onSaved}
        onActivate={onActivate}
      />
    </Stack>
  );
}

function WeightsEditor({
  defaults,
  base,
  onSaved,
  onActivate,
}: {
  defaults: Record<string, unknown>;
  base?: MatchRankingConfiguration;
  onSaved: () => Promise<void>;
  onActivate: (item: MatchRankingConfiguration) => void;
}) {
  const [rules, setRules] = useState(() =>
    mergeRankingRules(defaults, base?.rules ?? {})
  );
  const [version, setVersion] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<MatchRankingConfiguration | null>(null);
  const [invalid, setInvalid] = useState<Record<string, string>>({});
  function change(path: string, value: unknown) {
    setRules((previous) => {
      let next = writeRule(previous, path, value);
      if (path === 'interest.windowDays') {
        const days = Number(value);
        if (Number(readRule(next, 'interest.recentDays')) > days)
          next = writeRule(next, 'interest.recentDays', days);
        if (Number(readRule(next, 'interest.minimumDays')) > days + 1)
          next = writeRule(next, 'interest.minimumDays', days + 1);
      }
      return next;
    });
    setSaved(null);
  }
  async function save() {
    if (!base || busy) return;
    setError('');
    if (!version.trim() || !reason.trim())
      return setError('Enter a new version and a change reason.');
    const errors: Record<string, string> = {};
    let parsed = { ...rules };
    for (const field of rankingRuleGroups.flatMap((group) => group.fields)) {
      const raw = readRule(rules, field.path);
      if (raw === undefined) continue;
      const value = Number(raw);
      const options = rankingRuleOptions(
        field,
        rules,
        mergeRankingRules(defaults, base?.rules ?? {}),
        defaults
      );
      if (
        raw === '' ||
        !options.includes(value) ||
        !Number.isFinite(value) ||
        (field.min !== undefined && value < field.min) ||
        (field.max !== undefined && value > field.max) ||
        (field.integer && !Number.isInteger(value))
      ) {
        errors[field.path] =
          `Enter a ${field.integer ? 'whole' : 'finite'} number${field.min !== undefined ? ` ≥ ${field.min}` : ''}${field.max !== undefined ? ` and ≤ ${field.max}` : ''}.`;
      } else parsed = writeRule(parsed, field.path, value);
    }
    const windowDays = Number(readRule(parsed, 'interest.windowDays'));
    if (Number(readRule(parsed, 'interest.recentDays')) > windowDays)
      errors['interest.recentDays'] = 'Must not exceed the interest window.';
    if (Number(readRule(parsed, 'interest.minimumDays')) > windowDays + 1)
      errors['interest.minimumDays'] = 'Must not exceed interest window + 1.';
    setInvalid(errors);
    if (Object.keys(errors).length)
      return setError('Check the highlighted weights.');
    parsed = writeRule(
      parsed,
      'interest.enabled',
      Boolean(readRule(parsed, 'interest.enabled'))
    );
    setBusy(true);
    try {
      const created = await createMatchRankingConfiguration({
        version: version.trim(),
        rules: parsed,
        reason: reason.trim(),
        countryAllowlist: base.countryAllowlist,
        treatmentPercentage: base.treatmentPercentage,
        experimentId: base.experimentId,
        assignmentSalt: base.assignmentSalt,
      });
      setSaved(created);
      try {
        await onSaved();
      } catch {
        setError(
          'Draft saved, but the configuration list could not refresh. Reload the page before making further changes.'
        );
      }
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6">How the score is calculated</Typography>
            <Typography
              sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}
            >
              Importance = B + L + T + S + R
            </Typography>
            <Typography
              sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}
            >
              Top score = B + L + T + S + R + P + U + E
            </Typography>
            <Typography variant="body2">
              B = category points. L = first matching country bonus. T =
              min(team cap, higher team value + both-elite bonus). S = stage
              points × category factor. R = the competition’s country priority
              adjustment, managed in Competition catalog.
            </Typography>
            <Typography variant="body2">
              P = min(interest cap, multiplier × H), where H is the largest
              qualifying interest weight for the competition or either team.
              Interest applies only when enabled. U is a timing adjustment for
              Today only. E is the clamped active editorial adjustment.
            </Typography>
            <Typography
              sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}
            >
              League score = B + R + max(L) + min(league cap, max(S + T × league
              team factor))
            </Typography>
            <Typography variant="body2">
              The maxima are taken across matches in the league. Followed
              leagues and teams come first; explicit follow order takes
              priority. Other leagues use descending league score, then
              competition ID.
            </Typography>
            <Typography variant="body2">
              Top Matches require the importance threshold, sustained interest
              or a pin. Explicit exclusions and ineligible statuses still win;
              pins can bypass friendly/youth/reserve classification. Pins come
              first, then pin priority and score. Existing snapshot members keep
              their order on ordinary score updates. Score ties use kickoff,
              then fixture ID. The competition cap is relaxed only when there
              are not enough alternatives.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
      <Box
        component="fieldset"
        disabled={busy}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
      >
        <Stack spacing={3}>
          {rankingRuleGroups.map((group) => (
            <Card key={group.title} variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {group.title}
                </Typography>
                {group.title === 'Personal interest · P' ? (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(readRule(rules, 'interest.enabled'))}
                        onChange={(event) =>
                          change('interest.enabled', event.target.checked)
                        }
                      />
                    }
                    label="Enable personal interest"
                  />
                ) : null}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, minmax(0, 1fr))',
                      xl: 'repeat(3, minmax(0, 1fr))',
                    },
                    gap: 2,
                  }}
                >
                  {group.fields
                    .filter(
                      (field) => readRule(rules, field.path) !== undefined
                    )
                    .map((field) => (
                      <Stack
                        key={field.path}
                        direction="row"
                        spacing={0.5}
                        alignItems="flex-start"
                      >
                        <TextField
                          fullWidth
                          label={field.label}
                          select
                          value={readRule(rules, field.path) ?? ''}
                          onChange={(event) =>
                            change(field.path, Number(event.target.value))
                          }
                          error={Boolean(invalid[field.path])}
                          helperText={
                            invalid[field.path] ??
                            `Default: ${String(readRule(defaults, field.path))}`
                          }
                          slotProps={{ select: { native: true } }}
                        >
                          {rankingRuleOptions(
                            field,
                            rules,
                            mergeRankingRules(defaults, base?.rules ?? {}),
                            defaults
                          ).map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </TextField>
                        <RuleHelp label={field.label} text={field.help} />
                      </Stack>
                    ))}
                </Box>
              </CardContent>
            </Card>
          ))}
          {base ? (
            <Alert severity="info">
              New versions keep the base configuration’s audience (
              {base.treatmentPercentage}%), country scope, experiment assignment
              and stage mappings. Saving does not activate them.
            </Alert>
          ) : null}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="New version"
              value={version}
              onChange={(event) => {
                setVersion(event.target.value);
                setSaved(null);
              }}
            />
            <TextField
              fullWidth
              label="Change reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setSaved(null);
              }}
            />
          </Stack>
        </Stack>
      </Box>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {saved ? (
        <Alert
          severity="success"
          action={
            <Button onClick={() => onActivate(saved)}>
              Activate saved version
            </Button>
          }
        >
          Draft {saved.version} saved. Ranking is unchanged until activation.
        </Alert>
      ) : null}
      <Box>
        <Button
          variant="contained"
          disabled={!base || busy || Boolean(saved)}
          onClick={() => void save()}
        >
          {busy ? 'Saving…' : 'Save draft'}
        </Button>
      </Box>
    </Stack>
  );
}
function RuleHelp({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip
      title={text}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      arrow
    >
      <IconButton
        aria-label={`Help: ${label}`}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        sx={{ mt: 0.5 }}
      >
        <HelpOutline fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
function messageOf(caught: unknown) {
  return caught instanceof Error ? caught.message : 'Request failed';
}
