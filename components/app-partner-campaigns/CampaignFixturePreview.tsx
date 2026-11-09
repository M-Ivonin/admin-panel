'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { MarketingJurisdiction } from '@/modules/marketing-jurisdictions/types';
import type { PartnerMarketConfig } from '@/modules/partner-market-configs/types';
import {
  appPartnerLocales,
  appPartnerPlacements,
  appPartnerPlatforms,
  placementLabels,
  platformLabels,
  type AppPartnerCampaign,
} from '@/modules/app-partner-campaigns/types';
import {
  resolveFixturePreview,
  type PreviewAccess,
  type PreviewAge,
  type PreviewFixture,
} from '@/modules/app-partner-campaigns/preview';
import {
  campaignInput,
  jurisdictionFor,
  type CampaignForm,
} from '@/modules/app-partner-campaigns/form';

const previewButtonSx = {
  '&.Mui-disabled': { color: 'text.primary', borderColor: 'divider' },
};

interface Props {
  form: CampaignForm;
  editing?: AppPartnerCampaign;
  campaigns: AppPartnerCampaign[];
  markets: PartnerMarketConfig[];
  jurisdictions: MarketingJurisdiction[];
}

const accessOptions: Record<PreviewAccess, string> = {
  free: 'Free',
  short_pass: 'New-terms short pass (synthetic)',
  legacy_short_pass: 'Legacy or ambiguous short pass',
  subscription: 'Subscription or explicit ad-free',
  unresolved: 'Purchase or restore pending',
};
const ageOptions: Record<PreviewAge, string> = {
  unknown: 'No age evidence',
  refused: 'Below the tested threshold',
  self_declaration: 'Self-declared threshold',
  verified: 'Verified threshold (synthetic)',
};

export function CampaignFixturePreview({
  form,
  editing,
  campaigns,
  markets,
  jurisdictions,
}: Props) {
  const [fixture, setFixture] = useState<Omit<PreviewFixture, 'at'>>({
    platform: 'ios',
    placement: 'matches_banner',
    locale: 'en',
    device: 'phone',
    sessions: 2,
    approvedMarket: true,
    access: 'free',
    age: 'unknown',
    evidenceAge: 18,
  });
  const set = <K extends keyof typeof fixture>(
    key: K,
    value: (typeof fixture)[K]
  ) => {
    setFixture((current) => ({ ...current, [key]: value }));
  };
  const market = markets.find((item) => item.id === form.partnerMarketConfigId);
  const rule = jurisdictionFor(market, jurisdictions);
  const platformRule = rule?.inAppPartnerPolicy?.platforms[fixture.platform];
  const at = Date.now();
  let preview = null;
  let validationError: string | null = null;
  if (market) {
    try {
      const input = campaignInput(
        { ...form, status: 'active' },
        market,
        rule,
        at
      );
      const hypothetical = {
        ...input,
        id: editing?.id ?? 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        version: editing?.version ?? '',
      };
      preview = resolveFixturePreview(
        [...campaigns.filter((item) => item.id !== editing?.id), hypothetical],
        market,
        markets,
        jurisdictions,
        { ...fixture, at: Math.max(at, Date.parse(input.startsAt)) }
      );
    } catch (caught) {
      validationError =
        caught instanceof Error ? caught.message : 'Campaign is incomplete.';
      preview = resolveFixturePreview(
        campaigns,
        market,
        markets,
        jurisdictions,
        { ...fixture, at }
      );
    }
  }
  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Synthetic audience and market. This preview considers unsaved edits as
        if activated and estimates the campaign winner using saved competitors.
        Delivery also validates destinations, trusted geography and platform
        launch controls.
        {!editing
          ? ' Save a draft to establish its campaign ID for priority ties.'
          : ''}
      </Alert>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        <TextField
          select
          label="Preview placement"
          value={fixture.placement}
          onChange={(event) =>
            set('placement', event.target.value as PreviewFixture['placement'])
          }
        >
          {appPartnerPlacements.map((value) => (
            <MenuItem key={value} value={value}>
              {placementLabels[value]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Preview platform"
          value={fixture.platform}
          onChange={(event) =>
            set('platform', event.target.value as PreviewFixture['platform'])
          }
        >
          {appPartnerPlatforms.map((value) => (
            <MenuItem key={value} value={value}>
              {platformLabels[value]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Preview device"
          value={fixture.device}
          onChange={(event) =>
            set('device', event.target.value as PreviewFixture['device'])
          }
        >
          <MenuItem value="phone">Phone</MenuItem>
          <MenuItem value="tablet">Tablet</MenuItem>
        </TextField>
        <TextField
          select
          label="Preview locale"
          value={fixture.locale}
          onChange={(event) =>
            set('locale', event.target.value as PreviewFixture['locale'])
          }
        >
          {appPartnerLocales.map((value) => (
            <MenuItem key={value} value={value}>
              {value.toUpperCase()}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Access fixture"
          value={fixture.access}
          onChange={(event) =>
            set('access', event.target.value as PreviewAccess)
          }
        >
          {Object.entries(accessOptions).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Foreground visits"
          type="number"
          value={fixture.sessions}
          onChange={(event) => set('sessions', Number(event.target.value))}
          inputProps={{ min: 1, step: 1 }}
        />
        <TextField
          select
          label="Age fixture"
          value={fixture.age}
          onChange={(event) => set('age', event.target.value as PreviewAge)}
        >
          {Object.entries(ageOptions).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Evidence threshold"
          type="number"
          value={fixture.evidenceAge}
          onChange={(event) => set('evidenceAge', Number(event.target.value))}
          inputProps={{ min: 18, max: 125, step: 1 }}
          disabled={fixture.age === 'unknown'}
        />
        <FormControlLabel
          control={
            <Switch
              checked={fixture.approvedMarket}
              onChange={(event) => set('approvedMarket', event.target.checked)}
            />
          }
          label="Matching approved market fixture"
        />
      </Box>
      {platformRule ? (
        <Typography variant="body2" color="text.secondary">
          Selected market policy · {platformLabels[fixture.platform]} ·{' '}
          {Math.max(
            18,
            Number(form.minimumAge),
            market?.minimumAge ?? 18,
            rule.minimumAge,
            platformRule.minimumAge
          )}
          + ·{' '}
          {platformRule.assurance === 'self_declaration'
            ? 'Self-declaration accepted'
            : 'Verified evidence required'}
        </Typography>
      ) : null}
      {validationError ? (
        <Alert severity="warning">
          Draft preview is incomplete. {validationError}
        </Alert>
      ) : null}
      {preview?.status === 'hidden' ? (
        <Alert severity="info">{preview.reason}</Alert>
      ) : null}
      {preview && preview.status !== 'hidden' ? (
        <Stack
          spacing={1.5}
          sx={{
            width: '100%',
            maxWidth: fixture.device === 'phone' ? 360 : 720,
            alignSelf: 'center',
          }}
        >
          <Typography variant="body2">
            Winning campaign · {preview.winner.campaign.name} · Priority{' '}
            {preview.winner.campaign.priority}
          </Typography>
          <Card variant="outlined">
            <CardContent>
              {preview.status === 'prompt' ? (
                <Stack spacing={1}>
                  <Typography variant="h6">
                    {agePrompt(fixture.locale, preview.winner.minimumAge)}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {promptActions[fixture.locale].map((label) => (
                      <Button key={label} disabled sx={previewButtonSx}>
                        {label}
                      </Button>
                    ))}
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Chip size="small" label={preview.winner.copy.adLabel} />
                    <Typography variant="subtitle2">
                      {preview.winner.market.operatorDisplayName}
                    </Typography>
                  </Stack>
                  {preview.winner.imageUrl ? (
                    // The backend returns the verified uploaded static asset URL.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview.winner.imageUrl}
                      alt={preview.winner.copy.imageAlt ?? ''}
                      style={{
                        display: 'block',
                        width: '100%',
                        maxHeight: 320,
                        objectFit: 'contain',
                      }}
                    />
                  ) : null}
                  {preview.winner.copy.headline ? (
                    <Typography variant="subtitle1">
                      {preview.winner.copy.headline}
                    </Typography>
                  ) : null}
                  <Typography variant="body2">
                    {preview.winner.copy.affiliateDisclosure}
                  </Typography>
                  <Typography variant="body2">
                    {preview.winner.minimumAge}+ · {preview.winner.warning}
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button variant="outlined" disabled sx={previewButtonSx}>
                      {policyActions[fixture.locale][0]}
                    </Button>
                    <Button variant="outlined" disabled sx={previewButtonSx}>
                      {policyActions[fixture.locale][1]}
                    </Button>
                  </Stack>
                  <Button
                    variant="contained"
                    disabled
                    sx={{
                      '&.Mui-disabled': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    {preview.winner.copy.cta}
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      ) : null}
      {!market ? (
        <Alert severity="info">
          Select an operator-market configuration to preview a fixture.
        </Alert>
      ) : null}
    </Stack>
  );
}

const promptActions = {
  en: ['Yes', 'No', 'Dismiss'],
  es: ['Sí', 'No', 'Cerrar'],
  pt: ['Sim', 'Não', 'Fechar'],
};
const policyActions = {
  en: ['Support', 'Terms'],
  es: ['Ayuda', 'Términos'],
  pt: ['Apoio', 'Termos'],
};

function agePrompt(locale: PreviewFixture['locale'], age: number): string {
  if (locale === 'es') return `¿Tienes ${age} años o más?`;
  if (locale === 'pt') return `Você tem ${age} anos ou mais?`;
  return `Are you ${age} years old or older?`;
}
