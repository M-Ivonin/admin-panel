'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Save } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormGroup,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  campaignEditorColors as colors,
  SectionCard,
  StepButton,
} from '@/components/campaigns/CampaignEditorLayout';
import {
  saveAppPartnerCampaign,
  uploadAppPartnerCampaignImage,
} from '@/lib/api/app-partner-campaigns';
import type { MarketingJurisdiction } from '@/modules/marketing-jurisdictions/types';
import type { PartnerMarketConfig } from '@/modules/partner-market-configs/types';
import {
  appPartnerLocales,
  appPartnerPlacements,
  appPartnerPlatforms,
  placementLabels,
  platformLabels,
  type AppPartnerCampaign,
  type AppPartnerLocale,
} from '@/modules/app-partner-campaigns/types';
import {
  campaignCopyFields,
  campaignForm,
  campaignInput,
  emptyCampaignCopy,
  jurisdictionFor,
  type CampaignForm,
} from '@/modules/app-partner-campaigns/form';
import { CampaignFixturePreview } from './CampaignFixturePreview';

interface Props {
  campaign?: AppPartnerCampaign;
  campaigns: AppPartnerCampaign[];
  markets: PartnerMarketConfig[];
  jurisdictions: MarketingJurisdiction[];
  onClose: () => void;
  onSaved: (campaign: AppPartnerCampaign) => Promise<void>;
}

const steps = ['Campaign setup', 'Localized creative', 'Fixture preview'];

const gridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
  gap: 2,
};

export function CampaignEditor({
  campaign,
  campaigns,
  markets,
  jurisdictions,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState(() => campaignForm(campaign));
  const [step, setStep] = useState(0);
  const editor = useRef<HTMLElement>(null);
  const stepNavigation = useRef<HTMLDivElement>(null);
  const uploadAlert = useRef<HTMLDivElement>(null);

  useEffect(() => {
    editor.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, []);
  const [locale, setLocale] = useState<AppPartnerLocale>('en');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<{
    source: 'save' | 'upload';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (error?.source === 'upload') uploadAlert.current?.focus();
  }, [error]);
  const market = markets.find((item) => item.id === form.partnerMarketConfigId);
  const rule = jurisdictionFor(market, jurisdictions);
  const copy = form.copyByLocale[locale] ?? emptyCampaignCopy;
  const busy = saving || uploading;
  const title = campaign
    ? 'Edit app partner campaign'
    : 'Create app partner campaign';
  const status =
    form.status === 'draft'
      ? 'Draft'
      : form.status === 'active'
        ? 'Active'
        : 'Paused';
  const statusColor =
    form.status === 'draft'
      ? colors.textSecondary
      : form.status === 'active'
        ? colors.success
        : colors.warning;
  const saveLabel = saving
    ? 'Saving…'
    : form.status === 'active' && campaign?.status !== 'active'
      ? 'Activate campaign'
      : campaign
        ? 'Save changes'
        : 'Save draft';

  function moveStep(nextStep: number) {
    setStep(nextStep);
    stepNavigation.current?.focus();
  }

  const set = <K extends keyof CampaignForm>(
    key: K,
    value: CampaignForm[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  async function submit() {
    setError(null);
    try {
      const input = campaignInput(form, market, rule);
      setSaving(true);
      const saved = await saveAppPartnerCampaign(input, campaign);
      await onSaved(saved);
    } catch (caught) {
      setError({ source: 'save', message: messageOf(caught) });
    } finally {
      setSaving(false);
    }
  }
  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    if (
      !['image/png', 'image/jpeg'].includes(file.type) ||
      file.size === 0 ||
      file.size > 5 * 1024 * 1024
    ) {
      setError({
        source: 'upload',
        message: 'Choose a nonempty PNG or JPEG image up to 5 MiB.',
      });
      return;
    }
    setUploading(true);
    try {
      const imageUrl = await uploadAppPartnerCampaignImage(file);
      if (!imageUrl) throw new Error('The image upload did not return a URL.');
      setForm((current) => ({
        ...current,
        bannerImages: { default: imageUrl },
      }));
    } catch (caught) {
      setError({ source: 'upload', message: messageOf(caught) });
    } finally {
      setUploading(false);
    }
  }
  return (
    <Box
      component="section"
      aria-label={title}
      ref={editor}
      tabIndex={-1}
      sx={{ minHeight: '100vh', bgcolor: colors.canvas }}
    >
      <AdminPageHeader
        title={title}
        subtitle={
          <Typography component="span" variant="inherit" display="block" noWrap>
            {form.name.trim() || 'Partner campaign builder'}
          </Typography>
        }
        backLabel="Back to campaigns"
        onBack={onClose}
        backDisabled={busy}
        titleAddon={
          <Chip
            label={status}
            sx={{ color: statusColor, bgcolor: colors.soft }}
          />
        }
        maxWidth={1440}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(0, 1fr) 320px',
          },
          alignItems: 'start',
          gap: 2,
          maxWidth: 1440,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 4 },
        }}
      >
        <SectionCard
          title="Campaign details"
          action={
            <Button
              startIcon={<Save />}
              onClick={() => void submit()}
              disabled={busy}
              sx={{ color: colors.textPrimary }}
            >
              {saveLabel}
            </Button>
          }
        >
          <Stack spacing={2.5}>
            {error?.source === 'save' ? (
              <Alert severity="error">{error.message}</Alert>
            ) : null}
            <Stack
              ref={stepNavigation}
              tabIndex={-1}
              role="group"
              aria-label="Campaign editor steps"
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              {steps.map((label, index) => (
                <StepButton
                  key={label}
                  label={label}
                  selected={step === index}
                  disabled={busy}
                  onClick={() => setStep(index)}
                />
              ))}
            </Stack>

            {step === 0 ? (
              <Stack
                spacing={2}
                component="fieldset"
                aria-label="Campaign setup"
                disabled={busy}
                sx={{ m: 0, p: 0, border: 0, minWidth: 0 }}
              >
                <SectionCard title="Basics">
                  <Stack spacing={2}>
                    <Box sx={gridSx}>
                      <TextField
                        label="Campaign name"
                        value={form.name}
                        onChange={(event) => set('name', event.target.value)}
                        inputProps={{ maxLength: 160 }}
                        required
                      />
                      <TextField
                        select
                        label="Status"
                        value={form.status}
                        onChange={(event) =>
                          set(
                            'status',
                            event.target.value as CampaignForm['status']
                          )
                        }
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        {campaign?.status === 'paused' ? (
                          <MenuItem value="paused">Paused</MenuItem>
                        ) : null}
                      </TextField>
                    </Box>
                    <TextField
                      select
                      label="Operator-market configuration"
                      value={form.partnerMarketConfigId}
                      onChange={(event) =>
                        set('partnerMarketConfigId', event.target.value)
                      }
                      required
                    >
                      {markets
                        .filter(
                          (item) =>
                            item.status === 'approved' ||
                            item.id === form.partnerMarketConfigId
                        )
                        .map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.operatorDisplayName} · {item.countryCode}
                            {item.regionCode ? ` / ${item.regionCode}` : ''} ·
                            In-app {item.inAppEnabled ? 'on' : 'off'}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Stack>
                </SectionCard>
                <SectionCard title="Delivery">
                  <Box sx={gridSx}>
                    <FormGroup aria-label="Enabled platforms">
                      <Typography variant="subtitle2">Platforms</Typography>
                      {appPartnerPlatforms.map((platform) => (
                        <FormControlLabel
                          key={platform}
                          label={platformLabels[platform]}
                          control={
                            <Checkbox
                              checked={form.platforms.includes(platform)}
                              onChange={(event) =>
                                set(
                                  'platforms',
                                  toggle(
                                    form.platforms,
                                    platform,
                                    event.target.checked
                                  )
                                )
                              }
                            />
                          }
                        />
                      ))}
                      {rule?.inAppPartnerPolicy?.expiresAt ? (
                        <Typography variant="caption" color="text.secondary">
                          App policy expires{' '}
                          {new Date(rule.inAppPartnerPolicy.expiresAt)
                            .toISOString()
                            .slice(0, 10)}{' '}
                          UTC.
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No approved app policy loaded.
                        </Typography>
                      )}
                    </FormGroup>
                    <FormGroup aria-label="Enabled placements">
                      <Typography variant="subtitle2">Placements</Typography>
                      {appPartnerPlacements.map((placement) => (
                        <FormControlLabel
                          key={placement}
                          label={placementLabels[placement]}
                          control={
                            <Checkbox
                              checked={form.placements.includes(placement)}
                              onChange={(event) =>
                                set(
                                  'placements',
                                  toggle(
                                    form.placements,
                                    placement,
                                    event.target.checked
                                  )
                                )
                              }
                            />
                          }
                        />
                      ))}
                    </FormGroup>
                  </Box>
                </SectionCard>
                <SectionCard title="Schedule and audience">
                  <Box sx={gridSx}>
                    <TextField
                      label="Starts at"
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(event) => set('startsAt', event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 'any' }}
                      required
                    />
                    <TextField
                      label="Ends at"
                      type="datetime-local"
                      value={form.endsAt}
                      onChange={(event) => set('endsAt', event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 'any' }}
                      required
                    />
                    <TextField
                      label="UTC offset"
                      value={form.utcOffset}
                      onChange={(event) => set('utcOffset', event.target.value)}
                      helperText="Applies to both times. Use +00:00 to enter UTC."
                      required
                    />
                    <TextField
                      label="Priority"
                      type="number"
                      value={form.priority}
                      onChange={(event) => set('priority', event.target.value)}
                      helperText="Higher values win. Equal values use campaign ID order."
                      inputProps={{ step: 1 }}
                    />
                    <TextField
                      label="Minimum sessions"
                      type="number"
                      value={form.minimumSessions}
                      onChange={(event) =>
                        set('minimumSessions', event.target.value)
                      }
                      inputProps={{ min: 2, step: 1 }}
                      required
                    />
                    <TextField
                      label="Campaign age floor"
                      type="number"
                      value={form.minimumAge}
                      onChange={(event) =>
                        set('minimumAge', event.target.value)
                      }
                      helperText="Higher approved market and platform floors still apply."
                      inputProps={{ min: 18, max: 125, step: 1 }}
                      required
                    />
                  </Box>
                </SectionCard>
                <SectionCard title="Destinations">
                  <Stack spacing={2}>
                    <TextField
                      label="Operator homepage affiliate link"
                      value={market?.inAppBannerAffiliateUrl ?? ''}
                      InputProps={{ readOnly: true }}
                      InputLabelProps={{ shrink: true }}
                      helperText="All placements use this link from the selected Partner Markets configuration."
                    />
                    <TextField
                      label="Final operator hostnames"
                      value={form.finalDestinationHosts}
                      onChange={(event) =>
                        set('finalDestinationHosts', event.target.value)
                      }
                      multiline
                      minRows={2}
                      helperText="Enter approved operator homepage hosts. Separate hosts with commas or new lines."
                    />
                    {market ? (
                      <Typography
                        variant="caption"
                        sx={{ overflowWrap: 'anywhere' }}
                        color="text.secondary"
                      >
                        Approved hosts ·{' '}
                        {market.approvedDestinationHosts.join(', ')}
                      </Typography>
                    ) : null}
                  </Stack>
                </SectionCard>
              </Stack>
            ) : null}
            {step === 1 ? (
              <Stack spacing={2}>
                <SectionCard title="Localized copy">
                  <Stack spacing={2}>
                    <Alert severity="info">
                      English copy is the fallback. Warning, support and terms
                      come from the approved jurisdiction policy.
                    </Alert>
                    <TextField
                      select
                      label="Creative locale"
                      value={locale}
                      onChange={(event) =>
                        setLocale(event.target.value as AppPartnerLocale)
                      }
                      disabled={busy}
                    >
                      {appPartnerLocales.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value.toUpperCase()}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Box sx={gridSx}>
                      {campaignCopyFields.map(({ field, label, maxLength }) => (
                        <TextField
                          key={field}
                          label={label}
                          value={copy[field] ?? ''}
                          onChange={(event) =>
                            set('copyByLocale', {
                              ...form.copyByLocale,
                              [locale]: {
                                ...copy,
                                [field]: event.target.value,
                              },
                            })
                          }
                          inputProps={{ maxLength }}
                          sx={{
                            gridColumn:
                              field === 'affiliateDisclosure'
                                ? '1 / -1'
                                : undefined,
                          }}
                          minRows={
                            field === 'affiliateDisclosure' ? 2 : undefined
                          }
                          multiline={field === 'affiliateDisclosure'}
                          disabled={busy}
                        />
                      ))}
                    </Box>
                  </Stack>
                </SectionCard>
                <SectionCard title="Banner creative">
                  <Stack spacing={1.5}>
                    {error?.source === 'upload' ? (
                      <Alert severity="error" tabIndex={-1} ref={uploadAlert}>
                        {error.message}
                      </Alert>
                    ) : null}
                    <Typography variant="body2" color="text.secondary">
                      The stadium is the default Matches background. An optional
                      PNG or JPEG up to 5 MiB replaces only the background on
                      every device.
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Button
                        component="label"
                        variant="outlined"
                        disabled={busy}
                        sx={{
                          color: colors.textPrimary,
                          borderColor: colors.stroke,
                        }}
                      >
                        {uploading
                          ? 'Uploading…'
                          : form.bannerImages?.default
                            ? 'Replace custom background'
                            : 'Upload custom background'}
                        <input
                          type="file"
                          aria-label="Custom banner background image"
                          accept="image/png,image/jpeg"
                          onChange={(event) => void uploadImage(event)}
                          disabled={busy}
                          style={{
                            width: 1,
                            height: 1,
                            padding: 0,
                            overflow: 'hidden',
                            position: 'absolute',
                            clipPath: 'inset(50%)',
                          }}
                        />
                      </Button>
                      {form.bannerImages?.default ? (
                        <Button
                          onClick={() => set('bannerImages', null)}
                          disabled={busy}
                          sx={{ color: colors.textSecondary }}
                        >
                          Restore built-in stadium artwork
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                </SectionCard>
              </Stack>
            ) : null}
            {step === 2 ? (
              <SectionCard title="Fixture preview">
                <CampaignFixturePreview
                  form={form}
                  editing={campaign}
                  campaigns={campaigns}
                  markets={markets}
                  jurisdictions={jurisdictions}
                />
              </SectionCard>
            ) : null}

            <Divider sx={{ borderColor: colors.stroke }} />
            <Stack direction="row" justifyContent="space-between">
              <Button
                disabled={busy || step === 0}
                onClick={() => moveStep(step - 1)}
                sx={{ color: colors.textSecondary }}
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  variant="contained"
                  disabled={busy}
                  onClick={() => moveStep(step + 1)}
                  sx={{ bgcolor: colors.accent, color: colors.textPrimary }}
                >
                  Continue
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </SectionCard>

        <SectionCard title="Operator market">
          {market ? (
            <Alert
              severity={
                market.inAppEnabled &&
                !market.killSwitchEnabled &&
                market.status === 'approved'
                  ? 'info'
                  : 'warning'
              }
            >
              Market status {market.status}. In-app{' '}
              {market.inAppEnabled ? 'enabled' : 'disabled'}.
              {market.killSwitchEnabled ? ' Kill switch on.' : ''} Edit
              permissions and the operator homepage affiliate link in{' '}
              <Link
                href="/dashboard/partner-markets"
                target="_blank"
                rel="noopener noreferrer"
              >
                Partner Markets
              </Link>
              .
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select an operator market in Campaign setup to see its approval
              and in-app status.
            </Typography>
          )}
        </SectionCard>
      </Box>
    </Box>
  );
}

function toggle<T extends string>(list: T[], value: T, checked: boolean): T[] {
  return checked ? [...list, value] : list.filter((item) => item !== value);
}

function messageOf(value: unknown): string {
  return value instanceof Error
    ? value.message
    : 'The campaign command failed.';
}
