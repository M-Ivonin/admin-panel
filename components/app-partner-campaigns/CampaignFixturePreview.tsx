'use client';

import { useState } from 'react';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  type CampaignPreview,
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
const stadiumArtwork = 'url(/assets/partner_matchday_stadium.png)';
const finePrintSx = { color: '#c2c2c2', fontSize: 12, lineHeight: '18px' };
const headlineSx = { fontWeight: 700, whiteSpace: 'pre-line' };

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
            maxWidth: fixture.device === 'phone' ? 420 : 720,
            alignSelf: 'center',
          }}
        >
          <Typography variant="body2">
            Sample campaign · {preview.winner.campaign.name} · Priority{' '}
            {preview.winner.campaign.priority}
          </Typography>
          {preview.status === 'prompt' ? (
            <Card variant="outlined">
              <CardContent>
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
              </CardContent>
            </Card>
          ) : (
            <CampaignCreativePreview
              winner={preview.winner}
              isBanner={fixture.placement === 'matches_banner'}
            />
          )}
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

function CampaignCreativePreview({
  winner,
  isBanner,
}: {
  winner: Extract<CampaignPreview, { winner: unknown }>['winner'];
  isBanner: boolean;
}) {
  const { copy, imageUrl, market, minimumAge, warning } = winner;
  const age = `${minimumAge}+`;
  const warningWithAge = new RegExp(`(?:^|[^0-9])${minimumAge}\\+`).test(warning)
    ? warning
    : `${age} · ${warning}`;
  const action = (
    <Button
      variant="contained"
      disabled
      endIcon={<NorthEastIcon />}
      sx={{
        minWidth: 0,
        minHeight: 48,
        px: { xs: 1, sm: 1.5 },
        py: 0.75,
        borderRadius: '12px',
        justifyContent: 'space-between',
        textAlign: 'left',
        textTransform: 'none',
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '20px',
        '&.Mui-disabled': { bgcolor: '#d4ff50', color: '#111811' },
        '& .MuiButton-endIcon': { ml: 0.5, mr: 0 },
        '& .MuiButton-endIcon > svg': { fontSize: 16 },
      }}
    >
      <Box component="span" sx={{ overflowWrap: 'anywhere' }}>
        {copy.cta}
      </Box>
    </Button>
  );

  return (
    <Box
      sx={{
        bgcolor: '#0d1716',
        color: 'common.white',
        border: '1px solid #3a4d3e',
        borderRadius: isBanner ? '20px' : '12px',
        overflow: 'hidden',
        overflowWrap: 'anywhere',
        containerType: 'inline-size',
      }}
    >
      {isBanner ? (
        <>
          <Stack
            spacing={1.5}
            useFlexGap
            sx={{
              minHeight: 194,
              p: 2,
              position: 'relative',
              isolation: 'isolate',
              backgroundImage: stadiumArtwork,
              backgroundSize: 'cover',
              backgroundPosition: 'right center',
            }}
          >
            {imageUrl ? (
              <Box
                component="img"
                key={imageUrl}
                src={imageUrl}
                alt={copy.imageAlt ?? ''}
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
                  objectPosition: 'right center',
                }}
              />
            ) : null}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={1}
            >
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, letterSpacing: 1 }}
              >
                {market.operatorDisplayName}
              </Typography>
              <Typography
                sx={{
                  ...finePrintSx,
                  bgcolor: '#0d1716',
                  borderRadius: '8px',
                  px: 1.5,
                  py: 0.5,
                }}
              >
                {copy.adLabel}
              </Typography>
            </Stack>
            {copy.headline ? (
              <Typography
                sx={{
                  ...headlineSx,
                  maxWidth: '62%',
                  fontSize: 30,
                  lineHeight: '32px',
                  '@container (max-width: 320px)': {
                    maxWidth: '100%',
                    fontSize: 20,
                    lineHeight: '24px',
                  },
                }}
              >
                {copy.headline}
              </Typography>
            ) : null}
          </Stack>
          <Stack spacing={1} sx={{ p: 2 }}>
            {action}
            <Typography sx={finePrintSx}>
              {warningWithAge} · {copy.affiliateDisclosure}
            </Typography>
          </Stack>
        </>
      ) : (
        <Stack
          spacing={1}
          sx={{
            p: 1.5,
            backgroundImage: `linear-gradient(#0d1716bf, #0d1716bf), ${stadiumArtwork}`,
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
              gap: 1,
            }}
          >
            <Typography noWrap sx={finePrintSx}>
              {copy.adLabel} · {copy.affiliateDisclosure}
            </Typography>
            <Typography
              noWrap
              sx={{
                fontSize: 13,
                lineHeight: '18px',
                fontWeight: 600,
                textAlign: 'right',
              }}
            >
              {market.operatorDisplayName}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 6fr) minmax(0, 5fr)',
              alignItems: 'center',
              gap: 1,
              '@container (max-width: 320px)': {
                gridTemplateColumns: 'minmax(0, 1fr)',
                '& > :last-child': { gridColumn: 1 },
              },
            }}
          >
            {copy.headline ? (
              <Typography
                sx={{
                  ...headlineSx,
                  fontSize: 18,
                  lineHeight: '22px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {copy.headline}
              </Typography>
            ) : null}
            <Box sx={{ gridColumn: 2, display: 'grid' }}>{action}</Box>
          </Box>
          <Typography noWrap sx={{ ...finePrintSx, lineHeight: '16px' }}>
            {warningWithAge}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

const promptActions = {
  en: ['Yes', 'No', 'Dismiss'],
  es: ['Sí', 'No', 'Cerrar'],
  pt: ['Sim', 'Não', 'Fechar'],
};
function agePrompt(locale: PreviewFixture['locale'], age: number): string {
  if (locale === 'es') return `¿Tienes ${age} años o más?`;
  if (locale === 'pt') return `Você tem ${age} anos ou mais?`;
  return `Are you ${age} years old or older?`;
}
