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
const previewPartnerActionSx = {
  '&.Mui-disabled': { bgcolor: '#d4ff50', color: '#111811' },
};
const stadiumBackground = {
  bgcolor: '#0d1716',
  backgroundImage:
    'linear-gradient(#0d1716c7, #0d1716c7), url(/assets/partner_matchday_stadium.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'right center',
  borderRadius: 1.5,
  color: 'common.white',
};
const stadiumTitles = {
  en: {
    banner: 'YOUR MATCH.\nYOUR CALL.',
    footer: 'Your match.\nYour move.',
    subtitle: 'Make it your matchday.',
  },
  es: {
    banner: 'TU PARTIDO.\nTU DECISIÓN.',
    footer: 'Tu partido.\nTu jugada.',
    subtitle: 'Vive tu día de partido.',
  },
  pt: {
    banner: 'SEU JOGO.\nSUA DECISÃO.',
    footer: 'Seu jogo.\nSua jogada.',
    subtitle: 'Viva o dia de jogo.',
  },
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
        if activated and shows a sample campaign. Live delivery rotates
        eligible campaigns by priority and checks destinations, trusted
        geography and platform controls.
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
            Sample campaign · {preview.winner.campaign.name} · Priority{' '}
            {preview.winner.campaign.priority}
          </Typography>
          <Card variant="outlined">
            <CardContent
              sx={
                fixture.placement === 'matches_banner'
                  ? undefined
                  : { px: { xs: 0.5, sm: 2 } }
              }
            >
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
              ) : fixture.placement !== 'matches_banner' ? (
                <Stack
                  sx={{
                    ...stadiumBackground,
                    p: '8px 12px',
                    overflowWrap: 'anywhere',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Typography
                      noWrap
                      sx={{ fontSize: 12, lineHeight: '18px' }}
                    >
                      {preview.winner.copy.adLabel} ·{' '}
                      {preview.winner.copy.affiliateDisclosure}
                    </Typography>
                    <Typography
                      noWrap
                      sx={{ fontSize: 13, lineHeight: '18px', fontWeight: 600 }}
                    >
                      {preview.winner.market.operatorDisplayName}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '6fr 5fr',
                      gap: 1,
                      alignItems: 'center',
                      minHeight: 48,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 16,
                        lineHeight: '18px',
                        fontWeight: 700,
                        whiteSpace: 'pre-line',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {preview.winner.copy.headline ??
                        stadiumTitles[fixture.locale].footer}
                    </Typography>
                    <Button
                      variant="contained"
                      disabled
                      endIcon={<span aria-hidden>↗</span>}
                      sx={{
                        ...previewPartnerActionSx,
                        minWidth: 0,
                        minHeight: 40,
                        px: 1,
                        fontSize: 13,
                        textTransform: 'none',
                        justifyContent: 'space-between',
                        borderRadius: 2,
                        lineHeight: 1.2,
                        '& .MuiButton-endIcon': {
                          '@media (max-width: 400px)': { display: 'none' },
                        },
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {preview.winner.copy.cta}
                      </Box>
                    </Button>
                  </Box>
                  <Stack direction="row" sx={{ whiteSpace: 'pre' }}>
                    <Typography sx={{ fontSize: 12, lineHeight: '16px' }}>
                      {preview.winner.minimumAge}+ ·{' '}
                    </Typography>
                    <Typography
                      noWrap
                      sx={{ fontSize: 12, lineHeight: '16px', minWidth: 0 }}
                    >
                      {preview.winner.warning}
                    </Typography>
                    <Typography
                      noWrap
                      sx={{ fontSize: 12, lineHeight: '16px', minWidth: 0 }}
                    >
                      {' · '}
                      {new URL(preview.winner.supportUrl).hostname.replace(
                        /^www\./,
                        ''
                      )}
                    </Typography>
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={1}>
                  <Stack
                    spacing={1}
                    useFlexGap
                    sx={{
                      ...stadiumBackground,
                      minHeight: 194,
                      p: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      isolation: 'isolate',
                    }}
                  >
                    {preview.winner.imageUrl ? (
                      <Box
                        component="img"
                        key={preview.winner.imageUrl}
                        src={preview.winner.imageUrl}
                        alt={preview.winner.copy.imageAlt ?? ''}
                        onError={(event) => {
                          event.currentTarget.hidden = true;
                        }}
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          zIndex: -1,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'brightness(60%)',
                        }}
                      />
                    ) : null}
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip size="small" label={preview.winner.copy.adLabel} />
                      <Typography variant="subtitle2">
                        {preview.winner.market.operatorDisplayName}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="subtitle1"
                      sx={{ whiteSpace: 'pre-line' }}
                    >
                      {preview.winner.copy.headline ??
                        stadiumTitles[fixture.locale].banner}
                    </Typography>
                    <Typography variant="body2">
                      {stadiumTitles[fixture.locale].subtitle}
                    </Typography>
                  </Stack>
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
                    sx={previewPartnerActionSx}
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
