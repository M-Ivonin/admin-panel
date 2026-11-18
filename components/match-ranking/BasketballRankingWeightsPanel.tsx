'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { getBasketballRankingRuleDefaults } from '@/lib/api/match-ranking';
import type {
  BasketballRankingConfiguration,
  BasketballRankingDraft,
  BasketballRankingRules,
} from '@/modules/match-ranking/basketball-types';

type NumberField = Exclude<keyof BasketballRankingRules, 'interestEnabled'>;
type Field = [
  key: NumberField,
  label: string,
  min: number,
  max: number,
  step?: 'any',
];

const leagueFields: Field[] = [
  ['tier1', 'Tier 1 points', 0, 100],
  ['tier2', 'Tier 2 points', 0, 100],
  ['tier3', 'Tier 3 points', 0, 100],
  ['tier4', 'Tier 4 points', 0, 100],
];
const stageFields: Field[] = [
  ['final', 'Final bonus', 0, 100],
  ['semifinal', 'Semifinal bonus', 0, 100],
  ['quarterfinal', 'Quarterfinal bonus', 0, 100],
  ['playoff', 'Playoff bonus', 0, 100],
];
const timingFields: Field[] = [
  ['live', 'Live match points', -100, 100],
  ['upcoming', 'Upcoming match points', -100, 100],
  ['completed', 'Completed match points', -100, 100],
  ['upcomingMinutes', 'Upcoming window (minutes)', 0, 1440],
];
const topFields: Field[] = [
  ['topThreshold', 'Top Matches threshold', 0, 200],
  ['topLimit', 'Top Matches limit', 1, 10],
  ['leagueCap', 'Top Matches per league before backfill', 1, 10],
];

export function BasketballRankingWeightsPanel({
  configurations,
  pending,
  onSave,
}: {
  configurations: BasketballRankingConfiguration[];
  pending: boolean;
  onSave: (draft: BasketballRankingDraft) => void;
}) {
  const [baseId, setBaseId] = useState(
    () => configurations.find((configuration) => configuration.active)?.id ?? ''
  );
  const [defaults, setDefaults] = useState<BasketballRankingRules | null>(null);
  const [defaultError, setDefaultError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [edits, setEdits] = useState<Partial<Record<NumberField, string>>>({});
  const [interest, setInterest] = useState<boolean>();
  const [version, setVersion] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    let current = true;
    void getBasketballRankingRuleDefaults().then(
      (rules) => {
        if (current) setDefaults(rules);
      },
      (error: unknown) => {
        if (current)
          setDefaultError(
            error instanceof Error
              ? error.message
              : 'Unable to load basketball weights.'
          );
      }
    );
    return () => {
      current = false;
    };
  }, [attempt]);

  if (!defaults) {
    return defaultError ? (
      <Alert
        severity="error"
        action={
          <Button
            onClick={() => {
              setDefaultError('');
              setAttempt((value) => value + 1);
            }}
          >
            Retry
          </Button>
        }
      >
        {defaultError}
      </Alert>
    ) : (
      <CircularProgress aria-label="Loading basketball weights" />
    );
  }

  const base = configurations.find(
    (configuration) => configuration.id === baseId
  );
  const baseRules = { ...defaults, ...base?.rules };
  const rawValue = (key: NumberField) => edits[key] ?? String(baseRules[key]);
  const interestEnabled = interest ?? baseRules.interestEnabled;
  const windowDays = Number(rawValue('interestWindowDays'));
  function fieldsValue(key: NumberField) {
    const value = rawValue(key);
    if (!Number.isInteger(windowDays) || windowDays < 1 || windowDays > 30) {
      return value;
    }
    if (key === 'interestRecentDays' && Number(value) > windowDays) {
      return String(windowDays);
    }
    if (key === 'interestMinimumDays' && Number(value) > windowDays + 1) {
      return String(windowDays + 1);
    }
    return value;
  }
  const interestFields: Field[] = [
    ['interestWindowDays', 'History window (days)', 1, 30],
    ['interestRecentDays', 'Recent period (days)', 0, windowDays],
    ['interestRecentWeight', 'Recent opening weight', 0, 10, 'any'],
    ['interestOlderWeight', 'Older opening weight', 0, 10, 'any'],
    ['interestTeamFactor', 'Team interest factor', 0, 1, 'any'],
    ['interestMinimumGames', 'Minimum distinct games', 1, 100],
    ['interestMinimumDays', 'Minimum days with activity', 1, windowDays + 1],
    ['interestMultiplier', 'Interest multiplier', 0, 100, 'any'],
    ['interestCap', 'Maximum interest points', 0, 100, 'any'],
  ];

  function fields(items: Field[]) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {items.map(([key, label, min, max, step = 1]) => (
          <TextField
            key={key}
            required
            label={label}
            type="number"
            size="small"
            disabled={pending}
            value={fieldsValue(key)}
            slotProps={{ htmlInput: { min, max, step } }}
            onChange={(event) => {
              const value = event.target.value;
              setEdits((previous) => ({ ...previous, [key]: value }));
            }}
          />
        ))}
      </Box>
    );
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !version.trim() || !reason.trim()) return;
    const rules = {
      ...baseRules,
      interestEnabled,
      interestRecentDays: Number(fieldsValue('interestRecentDays')),
      interestMinimumDays: Number(fieldsValue('interestMinimumDays')),
    };
    for (const key of Object.keys(edits) as NumberField[]) {
      rules[key] = Number(fieldsValue(key));
    }
    onSave({
      version: version.trim(),
      reason: reason.trim(),
      leagueTiers: base?.leagueTiers ?? {},
      rules,
    });
  }

  return (
    <Stack component="form" spacing={2} onSubmit={save}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <TextField
              select
              label="Base configuration"
              size="small"
              value={baseId}
              disabled={pending}
              onChange={(event) => {
                setBaseId(event.target.value);
                setEdits({});
                setInterest(undefined);
              }}
            >
              <MenuItem value="">Default weights</MenuItem>
              {configurations.map((configuration) => (
                <MenuItem key={configuration.id} value={configuration.id}>
                  {configuration.version}
                  {configuration.active ? ' (active)' : ''}
                </MenuItem>
              ))}
            </TextField>
            <Typography color="text.secondary">
              Start with an existing version to carry over its league tiers.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Top Matches formula</Typography>
            <Typography color="text.secondary">
              League and stage points determine the threshold. Timing affects
              the order. An eligible personal interest can qualify a game below
              the threshold and add points.
            </Typography>
            <Typography fontWeight={600}>League tiers</Typography>
            {fields(leagueFields)}
            <Typography fontWeight={600}>Stage</Typography>
            {fields(stageFields)}
            <Typography fontWeight={600}>Timing</Typography>
            {fields(timingFields)}
            <Typography fontWeight={600}>Selection</Typography>
            {fields(topFields)}
          </Stack>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Personalization</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={interestEnabled}
                  disabled={pending}
                  onChange={(_event, checked) => setInterest(checked)}
                />
              }
              label="Enable personalization"
            />
            <Typography color="text.secondary">
              The switch controls whether these weights apply to team and
              league interest from basketball match openings. Select a user in
              Preview to see the effect on Top Matches.
            </Typography>
            {fields(interestFields)}
          </Stack>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              required
              label="Version"
              size="small"
              value={version}
              disabled={pending}
              slotProps={{ htmlInput: { maxLength: 80 } }}
              onChange={(event) => setVersion(event.target.value)}
            />
            <TextField
              required
              label="Change reason"
              size="small"
              fullWidth
              value={reason}
              disabled={pending}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              onChange={(event) => setReason(event.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ flexShrink: 0 }}
              disabled={pending || !version.trim() || !reason.trim()}
            >
              Save draft
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
