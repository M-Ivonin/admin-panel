'use client';

import { useState, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Link,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
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
  type AppPartnerCampaignImages,
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

const imageLabels = {
  default: 'Default banner',
  phone: 'Phone banner override',
  tablet: 'Tablet banner override',
};
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
  const [tab, setTab] = useState(0);
  const [locale, setLocale] = useState<AppPartnerLocale>('en');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<
    keyof AppPartnerCampaignImages | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const market = markets.find((item) => item.id === form.partnerMarketConfigId);
  const rule = jurisdictionFor(market, jurisdictions);
  const copy = form.copyByLocale[locale] ?? emptyCampaignCopy;
  const busy = saving || uploading !== null;

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
      setError(messageOf(caught));
    } finally {
      setSaving(false);
    }
  }
  async function uploadImage(
    kind: keyof AppPartnerCampaignImages,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    if (
      !['image/png', 'image/jpeg'].includes(file.type) ||
      file.size === 0 ||
      file.size > 5 * 1024 * 1024
    ) {
      setError('Choose a nonempty PNG or JPEG image up to 5 MiB.');
      return;
    }
    setUploading(kind);
    try {
      const imageUrl = await uploadAppPartnerCampaignImage(file);
      if (!imageUrl) throw new Error('The image upload did not return a URL.');
      setForm((current) => ({
        ...current,
        bannerImages: {
          ...current.bannerImages,
          default: current.bannerImages?.default ?? '',
          [kind]: imageUrl,
        },
      }));
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setUploading(null);
    }
  }
  function removeImage(kind: keyof AppPartnerCampaignImages) {
    if (kind === 'default') {
      set('bannerImages', null);
    } else if (form.bannerImages) {
      const remaining = { ...form.bannerImages };
      delete remaining[kind];
      set('bannerImages', remaining);
    }
  }

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {campaign ? 'Edit app partner campaign' : 'Create app partner campaign'}
      </DialogTitle>
      <Tabs
        value={tab}
        onChange={(_, value: number) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Campaign editor"
        sx={{ px: 2 }}
      >
        {['Campaign setup', 'Localized creative', 'Fixture preview'].map(
          (label, index) => (
            <Tab
              key={label}
              id={`campaign-editor-tab-${index}`}
              aria-controls="campaign-editor-panel"
              label={label}
              disabled={busy}
            />
          )
        )}
      </Tabs>
      {error ? (
        <Alert severity="error" sx={{ mx: 3, mt: 1 }}>
          {error}
        </Alert>
      ) : null}
      <DialogContent
        role="tabpanel"
        id="campaign-editor-panel"
        aria-labelledby={`campaign-editor-tab-${tab}`}
      >
        {tab === 0 ? (
          <Stack
            spacing={2}
            component="fieldset"
            disabled={busy}
            sx={{ m: 0, p: 0, border: 0, minWidth: 0 }}
          >
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
                  set('status', event.target.value as CampaignForm['status'])
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
                    {item.regionCode ? ` / ${item.regionCode}` : ''} · In-app{' '}
                    {item.inAppEnabled ? 'on' : 'off'}
                  </MenuItem>
                ))}
            </TextField>
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
                permissions and the Matches banner link in{' '}
                <Link
                  href="/dashboard/partner-markets"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Partner Markets
                </Link>
                .
              </Alert>
            ) : null}
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
            <Typography variant="subtitle2">Schedule and audience</Typography>
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
                onChange={(event) => set('minimumSessions', event.target.value)}
                inputProps={{ min: 2, step: 1 }}
                required
              />
              <TextField
                label="Campaign age floor"
                type="number"
                value={form.minimumAge}
                onChange={(event) => set('minimumAge', event.target.value)}
                helperText="Higher approved market and platform floors still apply."
                inputProps={{ min: 18, max: 125, step: 1 }}
                required
              />
            </Box>
            <Typography variant="subtitle2">Destinations</Typography>
            <TextField
              label="Matches banner affiliate link"
              value={market?.inAppBannerAffiliateUrl ?? ''}
              InputProps={{ readOnly: true }}
              InputLabelProps={{ shrink: true }}
              helperText="Managed in the selected Partner Markets configuration."
            />
            <TextField
              label="Default prediction HTTPS link"
              value={form.predictionUrl ?? ''}
              onChange={(event) => set('predictionUrl', event.target.value)}
              inputProps={{ maxLength: 2048 }}
            />
            <Box sx={gridSx}>
              {(['compact_prediction', 'full_prediction'] as const).map(
                (placement) => (
                  <TextField
                    key={placement}
                    label={`${placementLabels[placement]} URL override`}
                    value={form.predictionOverrides[placement] ?? ''}
                    onChange={(event) =>
                      set('predictionOverrides', {
                        ...form.predictionOverrides,
                        [placement]: event.target.value,
                      })
                    }
                    inputProps={{ maxLength: 2048 }}
                  />
                )
              )}
            </Box>
            <TextField
              label="Final operator hostnames"
              value={form.finalDestinationHosts}
              onChange={(event) =>
                set('finalDestinationHosts', event.target.value)
              }
              multiline
              minRows={2}
              helperText="Enter approved landing-page hosts only. Separate hosts with commas or new lines."
            />
            {market ? (
              <Typography
                variant="caption"
                sx={{ overflowWrap: 'anywhere' }}
                color="text.secondary"
              >
                Approved hosts · {market.approvedDestinationHosts.join(', ')}
              </Typography>
            ) : null}
          </Stack>
        ) : null}
        {tab === 1 ? (
          <Stack spacing={2}>
            <Alert severity="info">
              English copy is the fallback. Warning, support and terms come from
              the approved jurisdiction policy.
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
            {campaignCopyFields.map(({ field, label, maxLength }) => (
              <TextField
                key={field}
                label={label}
                value={copy[field] ?? ''}
                onChange={(event) =>
                  set('copyByLocale', {
                    ...form.copyByLocale,
                    [locale]: { ...copy, [field]: event.target.value },
                  })
                }
                inputProps={{ maxLength }}
                multiline={field === 'affiliateDisclosure'}
                disabled={busy}
              />
            ))}
            <Typography variant="subtitle2">Banner creative</Typography>
            <Typography variant="body2" color="text.secondary">
              Upload complete static PNG or JPEG images up to 5 MiB.
            </Typography>
            {(
              Object.keys(imageLabels) as Array<keyof AppPartnerCampaignImages>
            ).map((kind) => (
              <Box key={kind}>
                <Typography variant="body2">{imageLabels[kind]}</Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  alignItems="center"
                >
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={
                      busy ||
                      (kind !== 'default' && !form.bannerImages?.default)
                    }
                  >
                    {uploading === kind
                      ? 'Uploading…'
                      : form.bannerImages?.[kind]
                        ? `Replace ${imageLabels[kind].toLowerCase()}`
                        : `Upload ${imageLabels[kind].toLowerCase()}`}
                    <input
                      type="file"
                      aria-label={`${imageLabels[kind]} image`}
                      accept="image/png,image/jpeg"
                      onChange={(event) => void uploadImage(kind, event)}
                      disabled={
                        busy ||
                        (kind !== 'default' && !form.bannerImages?.default)
                      }
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
                  {form.bannerImages?.[kind] ? (
                    <Button onClick={() => removeImage(kind)} disabled={busy}>
                      Remove {imageLabels[kind].toLowerCase()}
                    </Button>
                  ) : null}
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : null}
        {tab === 2 ? (
          <CampaignFixturePreview
            form={form}
            editing={campaign}
            campaigns={campaigns}
            markets={markets}
            jurisdictions={jurisdictions}
          />
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void submit()}
          disabled={busy}
        >
          {saving
            ? 'Saving…'
            : form.status === 'active' && campaign?.status !== 'active'
              ? 'Activate campaign'
              : 'Save campaign'}
        </Button>
      </DialogActions>
    </Dialog>
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
