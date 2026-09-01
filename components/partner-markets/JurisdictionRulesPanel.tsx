'use client';

import { useCallback, useEffect, useState } from 'react';
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
  TextField,
  Typography,
} from '@mui/material';
import { Edit, PauseCircle } from '@mui/icons-material';
import {
  getMarketingJurisdictions,
  pauseMarketingJurisdiction,
  saveMarketingJurisdiction,
} from '@/lib/api/marketing-jurisdictions';
import {
  MarketingJurisdiction,
  MarketingJurisdictionFormErrors,
  MarketingJurisdictionFormValues,
  MarketingJurisdictionStatus,
} from '@/modules/marketing-jurisdictions/types';
import {
  emptyMarketingJurisdictionForm,
  normalizeMarketingJurisdictionForm,
  validateMarketingJurisdictionForm,
} from '@/modules/marketing-jurisdictions/validation';

const statuses: MarketingJurisdictionStatus[] = [
  'legal_review_required',
  'approved',
  'blocked',
];

type PermissionKey =
  | 'predictionsEmailAllowed'
  | 'productEmailAllowed'
  | 'partnerOfferEmailAllowed'
  | 'combinedPredictionOfferAllowed'
  | 'bonusAdvertisingAllowed'
  | 'matchSpecificPromotionAllowed';

const permissionLabels: Array<[PermissionKey, string]> = [
  ['predictionsEmailAllowed', 'Prediction emails'],
  ['productEmailAllowed', 'Product emails'],
  ['partnerOfferEmailAllowed', 'Partner offers'],
  ['combinedPredictionOfferAllowed', 'Combined prediction offers'],
  ['bonusAdvertisingAllowed', 'Bonus advertising'],
  ['matchSpecificPromotionAllowed', 'Match-specific promotion'],
];

export function JurisdictionRulesPanel({ createRequested, onCreateHandled }: {
  createRequested: boolean;
  onCreateHandled: () => void;
}) {
  const [items, setItems] = useState<MarketingJurisdiction[]>([]);
  const [countryCode, setCountryCode] = useState('');
  const [appliedCountryCode, setAppliedCountryCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<MarketingJurisdiction | null | undefined>(undefined);
  const [pausing, setPausing] = useState<MarketingJurisdiction | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getMarketingJurisdictions({ countryCode: appliedCountryCode }));
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setLoading(false);
    }
  }, [appliedCountryCode]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (createRequested) {
      setEditing(null);
      onCreateHandled();
    }
  }, [createRequested, onCreateHandled]);

  return <>
    <Stack spacing={3}>
      <Alert severity="info">
        Jurisdiction rules authorize communication types for one exact country or region. Approval
        does not authorize a partner or campaign by itself.
      </Alert>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert> : null}
      <Card><CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField label="Country code" value={countryCode} onChange={(event) => setCountryCode(event.target.value.toUpperCase())} size="small" inputProps={{ maxLength: 2, 'aria-label': 'Jurisdiction country code filter' }} />
          <Button variant="outlined" onClick={() => {
            if (countryCode === appliedCountryCode) void load();
            else setAppliedCountryCode(countryCode);
          }} disabled={loading}>Apply filters</Button>
        </Stack>
      </CardContent></Card>
      {loading ? <Stack alignItems="center" py={8} spacing={2} role="status"><CircularProgress /><Typography color="text.secondary">Loading jurisdiction rules…</Typography></Stack>
        : items.length === 0 ? <Card><CardContent sx={{ py: 8, textAlign: 'center' }}><Typography variant="h6">No jurisdiction rules found</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Adjust the filter or add the first reviewed country or region rule.</Typography></CardContent></Card>
          : <Stack spacing={2} aria-label="Jurisdiction rules">{items.map((item) => <JurisdictionCard key={item.id} item={item} onEdit={() => setEditing(item)} onPause={() => setPausing(item)} />)}</Stack>}
    </Stack>
    {editing !== undefined ? <JurisdictionFormDialog rule={editing} onClose={() => setEditing(undefined)} onSaved={async (saved) => {
      setEditing(undefined);
      setSuccess(`${saved.countryCode}${saved.regionCode ? `/${saved.regionCode}` : ''} jurisdiction rule saved.`);
      await load();
    }} /> : null}
    {pausing ? <PauseJurisdictionDialog rule={pausing} onClose={() => setPausing(null)} onPaused={async () => {
      setPausing(null);
      setSuccess(`${pausing.countryCode}${pausing.regionCode ? `/${pausing.regionCode}` : ''} paused immediately.`);
      await load();
    }} /> : null}
  </>;
}

function JurisdictionCard({ item, onEdit, onPause }: { item: MarketingJurisdiction; onEdit: () => void; onPause: () => void }) {
  const allowed = permissionLabels.filter(([key]) => item[key] === true).map(([, label]) => label);
  return <Card><CardContent><Stack spacing={2}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
      <Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Typography variant="h6">{item.countryCode}{item.regionCode ? ` / ${item.regionCode}` : ''}</Typography>
          <Chip label={item.status.replace(/_/g, ' ')} color={statusColor(item.status)} size="small" />
        </Stack>
        <Typography color="text.secondary">{item.countryCode}{item.regionCode ? `/${item.regionCode}` : ''} · Version {item.rulesVersion}</Typography>
      </Box>
      <Stack direction="row" spacing={1}>
        <Button startIcon={<Edit />} onClick={onEdit}>Edit</Button>
        <Button color="error" variant="outlined" startIcon={<PauseCircle />} onClick={onPause} disabled={item.status === 'paused'}>Pause</Button>
      </Stack>
    </Stack>
    {item.statusReason ? <Alert severity="warning">{item.statusReason}</Alert> : null}
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{allowed.length ? allowed.map((label) => <Chip key={label} label={label} size="small" />) : <Chip label="No communication types allowed" size="small" />}</Stack>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
      <Detail label="Minimum age" value={String(item.minimumAge)} />
      <Detail label="Legal review" value={`${formatDate(item.legalReviewedAt)} → ${formatDate(item.legalReviewExpiresAt)}`} />
      <Detail label="Effective period" value={`${formatDate(item.effectiveFrom)} → ${item.effectiveUntil ? formatDate(item.effectiveUntil) : 'No end date'}`} />
      <Detail label="Required warning" value={item.requiredWarningText} />
    </Box>
  </Stack></CardContent></Card>;
}

function JurisdictionFormDialog({ rule, onClose, onSaved }: { rule: MarketingJurisdiction | null; onClose: () => void; onSaved: (saved: MarketingJurisdiction) => Promise<void> }) {
  const [values, setValues] = useState<MarketingJurisdictionFormValues>(() => rule ? toForm(rule) : { ...emptyMarketingJurisdictionForm });
  const [errors, setErrors] = useState<MarketingJurisdictionFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof MarketingJurisdictionFormValues>(key: K, value: MarketingJurisdictionFormValues[K]) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    const nextErrors = validateMarketingJurisdictionForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true); setSubmitError(null);
    try { await onSaved(await saveMarketingJurisdiction(normalizeMarketingJurisdictionForm(values))); }
    catch (caught) { setSubmitError(messageOf(caught)); }
    finally { setSaving(false); }
  };
  return <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
    <DialogTitle>{rule ? 'Edit jurisdiction rule' : 'Add jurisdiction rule'}</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ mt: 1 }}>
      <Alert severity="info">Start with legal review required. Only an effective approved rule can permit communication in this location.</Alert>
      {submitError ? <Alert severity="error">{submitError}</Alert> : null}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormText label="Country code" field="countryCode" values={values} errors={errors} set={set} disabled={Boolean(rule)} />
        <FormText label="Region code (optional)" field="regionCode" values={values} errors={errors} set={set} disabled={Boolean(rule)} />
        <TextField select fullWidth label="Status" value={values.status} onChange={(event) => set('status', event.target.value as MarketingJurisdictionStatus)}>
          {rule?.status === 'paused' ? <MenuItem value="paused" disabled>paused (use dedicated pause action)</MenuItem> : null}
          {statuses.map((status) => <MenuItem key={status} value={status}>{status.replace(/_/g, ' ')}</MenuItem>)}
        </TextField>
        <FormText label="Minimum age" field="minimumAge" values={values} errors={errors} set={set} type="number" />
      </Stack>
      <Typography variant="subtitle2">Allowed communication types</Typography>
      {permissionLabels.map(([key, label]) => <FormControlLabel key={key} control={<Switch checked={values[key]} onChange={(event) => set(key, event.target.checked)} />} label={label} />)}
      <FormText label="Required warning text" field="requiredWarningText" values={values} errors={errors} set={set} multiline />
      <FormText label="Warning layout rules (JSON)" field="warningLayoutRules" values={values} errors={errors} set={set} multiline helper="Use {} when no special layout rule applies." />
      <FormText label="Responsible gambling URL" field="responsibleGamblingUrl" values={values} errors={errors} set={set} />
      <FormText label="Regulator source URL" field="regulatorSourceUrl" values={values} errors={errors} set={set} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormText label="Legal reviewed at" field="legalReviewedAt" values={values} errors={errors} set={set} type="datetime-local" shrink />
        <FormText label="Legal review expires at" field="legalReviewExpiresAt" values={values} errors={errors} set={set} type="datetime-local" shrink />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormText label="Effective from" field="effectiveFrom" values={values} errors={errors} set={set} type="datetime-local" shrink />
        <FormText label="Effective until (optional)" field="effectiveUntil" values={values} errors={errors} set={set} type="datetime-local" shrink />
      </Stack>
      <FormText label="Rules version" field="rulesVersion" values={values} errors={errors} set={set} />
    </Stack></DialogContent>
    <DialogActions><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="contained" onClick={() => void submit()} disabled={saving}>{saving ? 'Saving…' : 'Save rule'}</Button></DialogActions>
  </Dialog>;
}

type FormTextProps = {
  label: string;
  field: keyof MarketingJurisdictionFormValues;
  values: MarketingJurisdictionFormValues;
  errors: MarketingJurisdictionFormErrors;
  set: <K extends keyof MarketingJurisdictionFormValues>(key: K, value: MarketingJurisdictionFormValues[K]) => void;
  disabled?: boolean;
  multiline?: boolean;
  helper?: string;
  type?: string;
  shrink?: boolean;
};

function FormText({ label, field, values, errors, set, disabled, multiline, helper, type, shrink }: FormTextProps) {
  return <TextField fullWidth label={label} value={String(values[field] ?? '')} onChange={(event) => set(field, event.target.value)} error={Boolean(errors[field])} helperText={errors[field] ?? helper} disabled={disabled} multiline={multiline} minRows={multiline ? 2 : undefined} type={type} InputLabelProps={shrink ? { shrink: true } : undefined} />;
}

function PauseJurisdictionDialog({ rule, onClose, onPaused }: { rule: MarketingJurisdiction; onClose: () => void; onPaused: () => Promise<void> }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const pause = async () => {
    if (!reason.trim()) { setError('A pause reason is required.'); return; }
    if (reason.trim().length > 500) { setError('Use no more than 500 characters.'); return; }
    setSaving(true); setError(null);
    try { await pauseMarketingJurisdiction(rule.id, reason); await onPaused(); }
    catch (caught) { setError(messageOf(caught)); }
    finally { setSaving(false); }
  };
  const label = `${rule.countryCode}${rule.regionCode ? `/${rule.regionCode}` : ''}`;
  return <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>Pause {label}?</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ mt: 1 }}><Alert severity="warning">This immediately stops the jurisdiction rule from authorizing communications.</Alert>{error ? <Alert severity="error">{error}</Alert> : null}<TextField autoFocus label="Required reason" value={reason} onChange={(event) => setReason(event.target.value)} multiline minRows={3} inputProps={{ maxLength: 500 }} /></Stack></DialogContent>
    <DialogActions><Button onClick={onClose} disabled={saving}>Cancel</Button><Button color="error" variant="contained" onClick={() => void pause()} disabled={saving}>{saving ? 'Pausing…' : 'Confirm pause'}</Button></DialogActions>
  </Dialog>;
}

function toForm(rule: MarketingJurisdiction): MarketingJurisdictionFormValues {
  return {
    ...rule,
    regionCode: rule.regionCode ?? '',
    minimumAge: String(rule.minimumAge),
    warningLayoutRules: JSON.stringify(rule.warningLayoutRules, null, 2),
    legalReviewedAt: toLocalDateTime(rule.legalReviewedAt),
    legalReviewExpiresAt: toLocalDateTime(rule.legalReviewExpiresAt),
    effectiveFrom: toLocalDateTime(rule.effectiveFrom),
    effectiveUntil: rule.effectiveUntil ? toLocalDateTime(rule.effectiveUntil) : '',
  };
}

function Detail({ label, value }: { label: string; value: string }) { return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="body2">{value}</Typography></Box>; }
function toLocalDateTime(value: string): string { const date = new Date(value); const offset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }
function formatDate(value: string): string { return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
function messageOf(value: unknown): string { return value instanceof Error ? value.message : 'Something went wrong. Please try again.'; }
function statusColor(status: MarketingJurisdictionStatus): 'default' | 'success' | 'warning' | 'error' { if (status === 'approved') return 'success'; if (status === 'legal_review_required') return 'warning'; if (status === 'paused' || status === 'blocked') return 'error'; return 'default'; }
