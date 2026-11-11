'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Edit, Gavel, PauseCircle } from '@mui/icons-material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { JurisdictionRulesPanel } from '@/components/partner-markets/JurisdictionRulesPanel';
import {
  getPartnerMarketConfigs,
  pausePartnerMarketConfig,
  savePartnerMarketConfig,
} from '@/lib/api/partner-market-configs';
import { getMarketingJurisdictions } from '@/lib/api/marketing-jurisdictions';
import { MarketingJurisdiction } from '@/modules/marketing-jurisdictions/types';
import {
  PartnerMarketConfig,
  PartnerMarketConfigFormErrors,
  PartnerMarketConfigFormValues,
  PartnerMarketConfigStatus,
} from '@/modules/partner-market-configs/types';
import {
  emptyPartnerMarketConfigForm,
  normalizePartnerMarketConfigForm,
  validatePartnerMarketConfigForm,
} from '@/modules/partner-market-configs/validation';

import { inAppSummary } from '@/modules/partner-market-configs/in-app-summary';

const statuses: PartnerMarketConfigStatus[] = [
  'draft',
  'approved',
  'expired',
  'blocked',
];

const promotionLabels: Array<[keyof PartnerMarketConfig, string]> = [
  ['partnerOnlyAllowed', 'Partner-only'],
  ['sponsoredPredictionAllowed', 'Sponsored predictions'],
  ['bonusAdvertisingAllowed', 'Bonus advertising'],
  ['matchSpecificPromotionAllowed', 'Match-specific'],
];

export function PartnerMarketsDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [jurisdictionCreateRequested, setJurisdictionCreateRequested] =
    useState(false);
  const [items, setItems] = useState<PartnerMarketConfig[]>([]);
  const [operatorKey, setOperatorKey] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [appliedOperatorKey, setAppliedOperatorKey] = useState('');
  const [appliedCountryCode, setAppliedCountryCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<
    PartnerMarketConfig | null | undefined
  >(undefined);
  const [pausing, setPausing] = useState<PartnerMarketConfig | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(
        await getPartnerMarketConfigs({
          operatorKey: appliedOperatorKey,
          countryCode: appliedCountryCode,
        })
      );
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setLoading(false);
    }
  }, [appliedOperatorKey, appliedCountryCode]);

  useEffect(() => {
    void load();
  }, [load]);
  const handleJurisdictionCreateHandled = useCallback(
    () => setJurisdictionCreateRequested(false),
    []
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminPageHeader
        title="Partner markets"
        subtitle="Manage jurisdiction rules and approved operator-market configurations."
        icon={<Gavel color="primary" />}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              activeTab === 0
                ? setEditing(null)
                : setJurisdictionCreateRequested(true)
            }
            disabled={activeTab === 0 && loading}
          >
            {activeTab === 0 ? 'Add configuration' : 'Add jurisdiction rule'}
          </Button>
        }
      />
      <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 } }}>
        <Stack spacing={3}>
          <Tabs
            value={activeTab}
            onChange={(_, value: number) => setActiveTab(value)}
            aria-label="Partner market administration"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Partner configurations" />
            <Tab label="Jurisdiction rules" />
          </Tabs>
          {activeTab === 0 ? (
            <>
              <Alert severity="info">
                Draft configurations do not permit email sends. This registry
                records approved channels and their restrictions. The backend
                checks campaign and audience eligibility separately.
              </Alert>
              {error ? <Alert severity="error">{error}</Alert> : null}
              {success ? (
                <Alert severity="success" onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              ) : null}
              <Card>
                <CardContent>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ sm: 'center' }}
                  >
                    <TextField
                      label="Operator key"
                      value={operatorKey}
                      onChange={(event) => setOperatorKey(event.target.value)}
                      size="small"
                      inputProps={{ 'aria-label': 'Operator key filter' }}
                    />
                    <TextField
                      label="Country code"
                      value={countryCode}
                      onChange={(event) =>
                        setCountryCode(event.target.value.toUpperCase())
                      }
                      size="small"
                      inputProps={{
                        maxLength: 2,
                        'aria-label': 'Country code filter',
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (
                          operatorKey === appliedOperatorKey &&
                          countryCode === appliedCountryCode
                        ) {
                          void load();
                        } else {
                          setAppliedOperatorKey(operatorKey);
                          setAppliedCountryCode(countryCode);
                        }
                      }}
                      disabled={loading}
                    >
                      Apply filters
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {loading ? (
                <Stack alignItems="center" py={8} spacing={2} role="status">
                  <CircularProgress />
                  <Typography color="text.secondary">
                    Loading partner market configurations…
                  </Typography>
                </Stack>
              ) : items.length === 0 ? (
                <Card>
                  <CardContent sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="h6">
                      No partner market configurations found
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Adjust the filters or add the first verified
                      operator-market record.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Stack spacing={2} aria-label="Partner market configurations">
                  {items.map((item) => (
                    <PartnerMarketCard
                      key={item.id}
                      item={item}
                      onEdit={() => setEditing(item)}
                      onPause={() => setPausing(item)}
                    />
                  ))}
                </Stack>
              )}
            </>
          ) : (
            <JurisdictionRulesPanel
              createRequested={jurisdictionCreateRequested}
              onCreateHandled={handleJurisdictionCreateHandled}
            />
          )}
        </Stack>
      </Box>
      {activeTab === 0 && editing !== undefined ? (
        <PartnerMarketFormDialog
          config={editing}
          onClose={() => setEditing(undefined)}
          onSaved={async (saved) => {
            setEditing(undefined);
            setSuccess(`${saved.operatorDisplayName} configuration saved.`);
            await load();
          }}
        />
      ) : null}
      {activeTab === 0 && pausing ? (
        <PauseDialog
          config={pausing}
          onClose={() => setPausing(null)}
          onPaused={async () => {
            setPausing(null);
            setSuccess(`${pausing.operatorDisplayName} paused immediately.`);
            await load();
          }}
        />
      ) : null}
    </Box>
  );
}

function PartnerMarketCard({
  item,
  onEdit,
  onPause,
}: {
  item: PartnerMarketConfig;
  onEdit: () => void;
  onPause: () => void;
}) {
  const allowed = promotionLabels
    .filter(([key]) => item[key] === true)
    .map(([, label]) => label);
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                alignItems="center"
              >
                <Typography variant="h6">{item.operatorDisplayName}</Typography>
                <Chip
                  label={item.status}
                  color={statusColor(item.status)}
                  size="small"
                />
                {item.killSwitchEnabled ? (
                  <Chip label="Kill switch on" color="error" size="small" />
                ) : null}
                <Chip
                  label={
                    item.emailEnabled === false
                      ? 'Email disabled'
                      : 'Email enabled'
                  }
                  size="small"
                />
                <Chip
                  label={
                    item.inAppEnabled === true
                      ? 'In-app enabled'
                      : 'In-app disabled'
                  }
                  size="small"
                />
              </Stack>
              <Typography color="text.secondary">
                {item.operatorKey} · {item.countryCode}
                {item.regionCode ? ` / ${item.regionCode}` : ''} · Version{' '}
                {item.configVersion}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<Edit />} onClick={onEdit}>
                Edit
              </Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<PauseCircle />}
                onClick={onPause}
                disabled={item.status === 'paused'}
              >
                Pause
              </Button>
            </Stack>
          </Stack>
          {item.status === 'draft' ? (
            <Alert severity="warning">
              Draft — this record does not permit sends.
            </Alert>
          ) : null}
          {item.killSwitchEnabled && item.killSwitchReason ? (
            <Alert severity="error">{item.killSwitchReason}</Alert>
          ) : null}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Detail
              label="Legal review"
              value={`${formatDate(item.legalReviewedAt)} → ${formatDate(item.legalReviewExpiresAt)}`}
            />
            <Detail
              label="Effective period"
              value={`${formatDate(item.effectiveFrom)} → ${item.effectiveUntil ? formatDate(item.effectiveUntil) : 'No end date'}`}
            />
            <Detail
              label="Allowed promotion"
              value={allowed.length ? allowed.join(', ') : 'None'}
            />
            <Detail
              label="Approved destination hosts"
              value={item.approvedDestinationHosts.join(', ')}
            />
            <Detail
              label="In-app banner affiliate link"
              value={item.inAppBannerAffiliateUrl ?? 'Not configured'}
            />
            <Detail
              label="Affiliate conversion types"
              value={item.affiliateConversionTypes.join(', ')}
            />
            <Detail
              label="Operator logo"
              value={item.operatorLogoUrl ?? 'Missing'}
            />
            <Detail
              label="Affiliate disclosure (EN)"
              value={item.affiliateDisclosureByLocale?.en ?? 'Missing'}
            />
            <Detail
              label="Affiliate disclosure (ES)"
              value={item.affiliateDisclosureByLocale?.es ?? 'Missing'}
            />
            <Detail
              label="Affiliate disclosure (PT)"
              value={item.affiliateDisclosureByLocale?.pt ?? 'Missing'}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Box>
  );
}

function formatJurisdictionLocation(location: {
  countryCode: string;
  regionCode: string | null;
}): string {
  return `${location.countryCode} · ${location.regionCode ?? 'Country-wide'}`;
}

function formatJurisdictionOption(item: MarketingJurisdiction): string {
  return `${formatJurisdictionLocation(item)} · ${item.status}`;
}

function PartnerMarketFormDialog({
  config,
  onClose,
  onSaved,
}: {
  config: PartnerMarketConfig | null;
  onClose: () => void;
  onSaved: (saved: PartnerMarketConfig) => Promise<void>;
}) {
  const [values, setValues] = useState<PartnerMarketConfigFormValues>(() =>
    config ? toForm(config) : { ...emptyPartnerMarketConfigForm }
  );
  const fields = useRef<HTMLDivElement>(null);
  const focusErrors = useRef(false);
  const [errors, setErrors] = useState<PartnerMarketConfigFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [jurisdictions, setJurisdictions] = useState<MarketingJurisdiction[]>(
    []
  );
  const [jurisdictionsLoading, setJurisdictionsLoading] = useState(true);
  const [jurisdictionsError, setJurisdictionsError] = useState<string | null>(
    null
  );
  const [jurisdictionId, setJurisdictionId] = useState('');
  const [ageOverride, setAgeOverride] = useState<string | null>(null);
  const jurisdiction = jurisdictions.find((rule) =>
    config
      ? rule.countryCode === config.countryCode &&
        rule.regionCode === config.regionCode
      : rule.id === jurisdictionId
  );
  const marketAge = Math.max(18, jurisdiction?.minimumAge ?? 18);
  const displayedAge =
    ageOverride ??
    (config && config.minimumAge > marketAge ? String(config.minimumAge) : '');
  const inApp = jurisdiction
    ? inAppSummary(values, jurisdiction, Date.now())
    : null;

  useEffect(() => {
    let active = true;
    setJurisdictionsLoading(true);
    setJurisdictionsError(null);
    void getMarketingJurisdictions()
      .then((loaded) => {
        if (active) setJurisdictions(loaded);
      })
      .catch((caught) => {
        if (active) setJurisdictionsError(messageOf(caught));
      })
      .finally(() => {
        if (active) setJurisdictionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!focusErrors.current) return;
    focusErrors.current = false;
    const invalidFields = fields.current?.querySelectorAll<HTMLElement>(
      '[aria-invalid="true"]:not([disabled]):not([aria-hidden="true"])'
    );
    invalidFields?.forEach((field) => {
      const section = field.closest('details');
      if (section) section.open = true;
    });
    invalidFields?.[0]?.focus();
  }, [errors]);

  const set = <K extends keyof PartnerMarketConfigFormValues>(
    key: K,
    value: PartnerMarketConfigFormValues[K]
  ) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    if (!jurisdiction || jurisdictionsLoading || jurisdictionsError) return;
    setSubmitError(null);
    const inheritedValues = {
      ...values,
      minimumAge:
        displayedAge ||
        String(ageOverride === null ? (config?.minimumAge ?? 18) : 18),
      requiredWarningText: jurisdiction.requiredWarningText,
      responsibleGamblingUrl: jurisdiction.responsibleGamblingUrl,
    };
    const nextErrors = validatePartnerMarketConfigForm(inheritedValues);
    if (
      displayedAge &&
      (!/^\d+$/.test(displayedAge) ||
        nextErrors.minimumAge ||
        Number(displayedAge) <= marketAge)
    ) {
      nextErrors.minimumAge = `Enter a whole number above ${marketAge}, up to 125.`;
    }
    const hasErrors = Object.keys(nextErrors).length > 0;
    focusErrors.current = hasErrors;
    setErrors(nextErrors);
    if (hasErrors) return;
    setSaving(true);
    try {
      const input = normalizePartnerMarketConfigForm(inheritedValues);
      if (config) {
        input.expectedUpdatedAt = config.updatedAt;
        for (const field of [
          'legalReviewedAt',
          'legalReviewExpiresAt',
          'effectiveFrom',
          'effectiveUntil',
        ] as const) {
          const previous = config[field];
          if (previous && values[field] === toLocalDateTime(previous)) {
            input[field] = previous;
          }
        }
      }
      await onSaved(await savePartnerMarketConfig(input));
    } catch (caught) {
      const message = messageOf(caught);
      if (message.startsWith('configVersion must change ')) {
        focusErrors.current = true;
        setErrors({ configVersion: message });
      } else {
        setSubmitError(message);
      }
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {config ? 'Edit partner market' : 'Add partner market'}
      </DialogTitle>
      {submitError ? (
        <Alert severity="error" sx={{ mx: 3 }}>
          {submitError}
        </Alert>
      ) : null}
      <DialogContent>
        <Stack ref={fields} spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            Draft configurations cannot run campaigns. Approved configurations
            still require backend eligibility checks.
          </Alert>
          <FormText
            label="Operator key"
            field="operatorKey"
            values={values}
            errors={errors}
            set={set}
            disabled={Boolean(config)}
          />
          <FormText
            label="Operator legal name"
            field="operatorLegalName"
            values={values}
            errors={errors}
            set={set}
          />
          <FormText
            label="Operator display name"
            field="operatorDisplayName"
            values={values}
            errors={errors}
            set={set}
          />
          {jurisdictionsError ? (
            <Alert severity="error">
              Could not load jurisdiction rules: {jurisdictionsError}
            </Alert>
          ) : null}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {config ? (
              <TextField
                fullWidth
                label="Jurisdiction rule"
                value={formatJurisdictionLocation(config)}
                disabled
                helperText="Location cannot be changed. Create a new configuration for another jurisdiction rule."
              />
            ) : (
              <TextField
                select
                fullWidth
                required
                label="Jurisdiction rule"
                value={jurisdictionId}
                disabled={jurisdictionsLoading || Boolean(jurisdictionsError)}
                error={Boolean(errors.countryCode || errors.regionCode)}
                helperText={
                  errors.countryCode ??
                  errors.regionCode ??
                  (jurisdictionsLoading
                    ? 'Loading jurisdiction rules…'
                    : jurisdictions.length === 0
                      ? 'Create a jurisdiction rule before adding a partner configuration.'
                      : 'Country and region are taken from the selected rule.')
                }
                onChange={(event) => {
                  const selected = jurisdictions.find(
                    (item) => item.id === event.target.value
                  );
                  setJurisdictionId(event.target.value);
                  setAgeOverride(null);
                  if (!selected) return;
                  set('countryCode', selected.countryCode);
                  set('regionCode', selected.regionCode ?? '');
                  setErrors((current) => ({
                    ...current,
                    countryCode: undefined,
                    regionCode: undefined,
                  }));
                }}
              >
                {jurisdictions.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {formatJurisdictionOption(item)}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              select
              fullWidth
              label="Status"
              value={values.status}
              onChange={(e) =>
                set('status', e.target.value as PartnerMarketConfigStatus)
              }
            >
              {config?.status === 'paused' ? (
                <MenuItem value="paused" disabled>
                  paused (use dedicated pause action)
                </MenuItem>
              ) : null}
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          {config &&
            !jurisdiction &&
            !jurisdictionsLoading &&
            !jurisdictionsError && (
              <Alert severity="warning">
                No jurisdiction rule exists for this location. Add the matching
                rule before saving.
              </Alert>
            )}
          <Stack>
            <Typography variant="subtitle2">Advertising channels</Typography>
            <Typography variant="body2" color="text.secondary">
              Pause and the kill switch apply to both channels.
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={values.emailEnabled}
                  onChange={(e) => set('emailEnabled', e.target.checked)}
                />
              }
              label="Email"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={values.inAppEnabled}
                  onChange={(e) => set('inAppEnabled', e.target.checked)}
                />
              }
              label="In-app"
            />
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              <FormText
                label="In-app banner affiliate link"
                field="inAppBannerAffiliateUrl"
                values={values}
                errors={errors}
                set={set}
                helper="HTTPS affiliate link to the operator homepage for all app banners. Leave blank to disable app banner destinations."
              />
              <FormText
                label="Final operator hostnames"
                field="inAppFinalDestinationHosts"
                values={values}
                errors={errors}
                set={set}
                multiline
                helper="Enter the operator homepage hostnames reached after redirects, separated by commas or new lines. Include them in Approved destination hosts too."
              />
            </Stack>
            <Stack spacing={0.5} sx={{ pl: 1, overflowWrap: 'anywhere' }}>
              <Typography variant="body2">
                Jurisdiction platforms:{' '}
                {inApp ? inApp.platforms.join(', ') || 'None' : '—'}
              </Typography>
              {(
                inApp?.messages ?? [
                  jurisdictionsLoading
                    ? 'Loading jurisdiction rules…'
                    : jurisdictionsError
                      ? 'Jurisdiction rules could not be loaded.'
                      : 'A matching jurisdiction rule is required.',
                ]
              ).map((message) => (
                <Typography
                  key={message}
                  variant="body2"
                  color="text.secondary"
                >
                  {message}
                </Typography>
              ))}
              {inApp?.platforms.length ? (
                <Typography variant="caption" color="text.secondary">
                  Campaign and app rollout checks also apply.
                </Typography>
              ) : null}
            </Stack>
          </Stack>
          <Stack>
            <Typography variant="subtitle2">Allowed promotion types</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={values.partnerOnlyAllowed}
                  onChange={(e) => set('partnerOnlyAllowed', e.target.checked)}
                />
              }
              label="Partner-only promotion"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={values.sponsoredPredictionAllowed}
                  onChange={(e) =>
                    set('sponsoredPredictionAllowed', e.target.checked)
                  }
                />
              }
              label="Sponsored predictions"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={values.bonusAdvertisingAllowed}
                  onChange={(e) =>
                    set('bonusAdvertisingAllowed', e.target.checked)
                  }
                />
              }
              label="Bonus advertising"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={values.matchSpecificPromotionAllowed}
                  onChange={(e) =>
                    set('matchSpecificPromotionAllowed', e.target.checked)
                  }
                />
              }
              label="Match-specific promotion"
            />
          </Stack>
          {values.emailEnabled && (
            <>
              <FormText
                label="Full operator terms URL"
                field="operatorTermsUrl"
                values={values}
                errors={errors}
                set={set}
              />
              <FormText
                label="Exact operator destination URL"
                field="operatorDestinationUrl"
                values={values}
                errors={errors}
                set={set}
                helper="Used by the email offer flow after the visitor confirms leaving SirBro."
              />
            </>
          )}
          <FormControlLabel
            control={
              <Switch
                checked={values.killSwitchEnabled}
                onChange={(e) => set('killSwitchEnabled', e.target.checked)}
              />
            }
            label="Kill switch enabled"
          />
          {values.killSwitchEnabled ? (
            <FormText
              label="Kill switch reason"
              field="killSwitchReason"
              values={values}
              errors={errors}
              set={set}
              multiline
            />
          ) : null}
          <PartnerMarketDetails
            title="Licence and restrictions"
            initiallyOpen={!config}
          >
            <FormText
              label="Licence reference"
              field="licenceReference"
              values={values}
              errors={errors}
              set={set}
            />
            <FormText
              label="Evidence URL"
              field="evidenceUrl"
              values={values}
              errors={errors}
              set={set}
            />
            {jurisdiction && (
              <Stack
                spacing={1}
                tabIndex={-1}
                aria-invalid={Boolean(
                  errors.requiredWarningText || errors.responsibleGamblingUrl
                )}
              >
                <Typography variant="subtitle2">
                  Inherited from Jurisdiction Rules
                </Typography>
                <Detail
                  label="Jurisdiction warning"
                  value={jurisdiction.requiredWarningText}
                />
                <Detail
                  label="Responsible gambling URL"
                  value={jurisdiction.responsibleGamblingUrl}
                />
                {(errors.requiredWarningText ||
                  errors.responsibleGamblingUrl) && (
                  <Alert severity="error">
                    Complete the warning and responsible gambling URL in
                    Jurisdiction Rules before saving.
                  </Alert>
                )}
              </Stack>
            )}
            <TextField
              label="Higher partner minimum age"
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              value={displayedAge}
              disabled={!jurisdiction || marketAge >= 125}
              error={Boolean(errors.minimumAge)}
              helperText={
                errors.minimumAge ??
                (jurisdiction
                  ? `Base minimum: ${marketAge}+. Leave blank to use it.`
                  : 'Select a jurisdiction rule to see the market minimum.')
              }
              onChange={(event) => setAgeOverride(event.target.value)}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormText
                label="Legal reviewed at"
                field="legalReviewedAt"
                values={values}
                errors={errors}
                set={set}
                type="datetime-local"
                shrink
              />
              <FormText
                label="Legal review expires at"
                field="legalReviewExpiresAt"
                values={values}
                errors={errors}
                set={set}
                type="datetime-local"
                shrink
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormText
                label="Effective from"
                field="effectiveFrom"
                values={values}
                errors={errors}
                set={set}
                type="datetime-local"
                shrink
              />
              <FormText
                label="Effective until (optional)"
                field="effectiveUntil"
                values={values}
                errors={errors}
                set={set}
                type="datetime-local"
                shrink
              />
            </Stack>
          </PartnerMarketDetails>
          <PartnerMarketDetails
            title="Advanced settings"
            initiallyOpen={!config}
          >
            <FormText
              label="Operator logo URL"
              field="operatorLogoUrl"
              values={values}
              errors={errors}
              set={set}
            />
            {values.emailEnabled && (
              <>
                <Typography variant="subtitle2">
                  Localized affiliate disclosure
                </Typography>
                {(['en', 'es', 'pt'] as const).map((locale) => (
                  <TextField
                    key={locale}
                    fullWidth
                    multiline
                    minRows={2}
                    label={`Affiliate disclosure (${locale.toUpperCase()})`}
                    value={values.affiliateDisclosureByLocale[locale]}
                    onChange={(event) =>
                      set('affiliateDisclosureByLocale', {
                        ...values.affiliateDisclosureByLocale,
                        [locale]: event.target.value,
                      })
                    }
                    error={Boolean(
                      errors.affiliateDisclosureByLocale &&
                        !values.affiliateDisclosureByLocale[locale].trim()
                    )}
                    helperText={
                      !values.affiliateDisclosureByLocale[locale].trim()
                        ? errors.affiliateDisclosureByLocale
                        : undefined
                    }
                  />
                ))}
              </>
            )}
            <FormText
              label="Approved destination hosts"
              field="approvedDestinationHosts"
              values={values}
              errors={errors}
              set={set}
              multiline
              helper="One hostname per line or comma-separated. No scheme, port, or path."
            />
            <FormText
              label="Affiliate conversion types"
              field="affiliateConversionTypes"
              values={values}
              errors={errors}
              set={set}
              multiline
              helper="Core types are always preserved: registration, ftd, deposit, commission, reversal. Add approved extras one per line or comma-separated."
            />
            <FormText
              label="Config version"
              field="configVersion"
              values={values}
              errors={errors}
              set={set}
            />
          </PartnerMarketDetails>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void submit()}
          disabled={saving || jurisdictionsLoading || !jurisdiction}
        >
          {saving ? 'Saving…' : 'Save configuration'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PartnerMarketDetails({
  title,
  initiallyOpen,
  children,
}: {
  title: string;
  initiallyOpen: boolean;
  children: ReactNode;
}) {
  return (
    <Box
      component="details"
      open={initiallyOpen || undefined}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
    >
      <Typography
        component="summary"
        variant="subtitle2"
        sx={{ p: 2, cursor: 'pointer' }}
      >
        {title}
      </Typography>
      <Stack spacing={2} sx={{ px: 2, pb: 2 }}>
        {children}
      </Stack>
    </Box>
  );
}

type FormTextProps = {
  label: string;
  field: keyof PartnerMarketConfigFormValues;
  values: PartnerMarketConfigFormValues;
  errors: PartnerMarketConfigFormErrors;
  set: <K extends keyof PartnerMarketConfigFormValues>(
    key: K,
    value: PartnerMarketConfigFormValues[K]
  ) => void;
  disabled?: boolean;
  multiline?: boolean;
  helper?: string;
  type?: string;
  shrink?: boolean;
};

function FormText({
  label,
  field,
  values,
  errors,
  set,
  disabled,
  multiline,
  helper,
  type,
  shrink,
}: FormTextProps) {
  return (
    <TextField
      fullWidth
      label={label}
      value={String(values[field] ?? '')}
      onChange={(e) => set(field, e.target.value)}
      error={Boolean(errors[field])}
      helperText={errors[field] ?? helper}
      disabled={disabled}
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
      type={type}
      InputLabelProps={shrink ? { shrink: true } : undefined}
    />
  );
}

function PauseDialog({
  config,
  onClose,
  onPaused,
}: {
  config: PartnerMarketConfig;
  onClose: () => void;
  onPaused: () => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const pause = async () => {
    if (!reason.trim()) {
      setError('A pause reason is required.');
      return;
    }
    if (reason.trim().length > 500) {
      setError('Use no more than 500 characters.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await pausePartnerMarketConfig(config.id, reason);
      await onPaused();
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Pause {config.operatorDisplayName}?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="warning">
            This immediately pauses the market configuration and enables its
            kill switch.
          </Alert>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            autoFocus
            label="Required reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={3}
            inputProps={{ maxLength: 500 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => void pause()}
          disabled={saving}
        >
          {saving ? 'Pausing…' : 'Confirm pause'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function toForm(config: PartnerMarketConfig): PartnerMarketConfigFormValues {
  return {
    ...config,
    operatorLogoUrl: config.operatorLogoUrl ?? '',
    affiliateDisclosureByLocale: config.affiliateDisclosureByLocale ?? {
      en: '',
      es: '',
      pt: '',
    },
    operatorTermsUrl: config.operatorTermsUrl ?? '',
    operatorDestinationUrl: config.operatorDestinationUrl ?? '',
    emailEnabled: config.emailEnabled ?? true,
    inAppEnabled: config.inAppEnabled ?? false,
    inAppBannerAffiliateUrl: config.inAppBannerAffiliateUrl ?? '',
    inAppFinalDestinationHosts: config.inAppFinalDestinationHosts?.join('\n') ?? '',
    regionCode: config.regionCode ?? '',
    minimumAge: String(config.minimumAge),
    approvedDestinationHosts: config.approvedDestinationHosts.join('\n'),
    affiliateConversionTypes: config.affiliateConversionTypes.join('\n'),
    legalReviewedAt: toLocalDateTime(config.legalReviewedAt),
    legalReviewExpiresAt: toLocalDateTime(config.legalReviewExpiresAt),
    effectiveFrom: toLocalDateTime(config.effectiveFrom),
    effectiveUntil: config.effectiveUntil
      ? toLocalDateTime(config.effectiveUntil)
      : '',
    killSwitchReason: config.killSwitchReason ?? '',
  };
}

function toLocalDateTime(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
function messageOf(value: unknown): string {
  return value instanceof Error
    ? value.message
    : 'Something went wrong. Please try again.';
}
function statusColor(
  status: PartnerMarketConfigStatus
): 'default' | 'success' | 'warning' | 'error' {
  if (status === 'approved') return 'success';
  if (status === 'draft') return 'warning';
  if (status === 'paused' || status === 'blocked') return 'error';
  return 'default';
}
