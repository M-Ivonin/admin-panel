'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, BugReport, OpenInNew } from '@mui/icons-material';
import {
  buildDiagnosticsLokiUrl,
  createDiagnosticsPolicy,
  disableDiagnosticsPolicy,
  getDiagnosticsBackendLogSetting,
  getDiagnosticsAudit,
  getDiagnosticsPolicies,
  getDiagnosticsTargetOptions,
  getDiagnosticsTtlLimitMinutes,
  updateDiagnosticsBackendLogSetting,
  type DiagnosticsAuditEntry,
  type DiagnosticsBackendLogMode,
  type DiagnosticsBackendLogSetting,
  type DiagnosticsCapabilities,
  type DiagnosticsCategory,
  type DiagnosticsEnvironment,
  type DiagnosticsMode,
  type DiagnosticsPolicy,
  type DiagnosticsTarget,
  type DiagnosticsTargetOptionsResponse,
  type DiagnosticsTargetType,
} from '@/lib/api/diagnostics';

const TARGET_TYPES: Array<{ value: DiagnosticsTargetType; label: string }> = [
  { value: 'device', label: 'device' },
  { value: 'user', label: 'user' },
  { value: 'internal_qa', label: 'internal_qa' },
  { value: 'app_version_build', label: 'app_version_build' },
  { value: 'platform', label: 'platform' },
  { value: 'global_sample', label: 'global_sample' },
];

const CATEGORIES: DiagnosticsCategory[] = [
  'auth',
  'network',
  'navigation',
  'payments',
  'push_deeplinks',
  'app_lifecycle',
];

const DEFAULT_LIMITS = {
  uploadIntervalSec: 60,
  maxEventsPerMinute: 30,
  maxBatchEvents: 20,
  maxPayloadKb: 64,
  breadcrumbLimit: 20,
};

const DEFAULT_TARGET_OPTIONS: DiagnosticsTargetOptionsResponse = {
  platforms: [],
  recentUsers: [],
  recentDevices: [],
  appVersionBuilds: [],
};
const DEFAULT_CAPABILITIES: DiagnosticsCapabilities = {
  canRead: true,
  canWrite: true,
  canTrace: true,
};

const ENVIRONMENTS: DiagnosticsEnvironment[] = ['local', 'dev', 'production'];
const BACKEND_LOG_MODES: Array<{
  value: DiagnosticsBackendLogMode;
  label: string;
}> = [
  { value: 'production', label: 'production' },
  { value: 'dev', label: 'dev/debug' },
  { value: 'off', label: 'off' },
];

interface FormState {
  mode: DiagnosticsMode;
  targetType: DiagnosticsTargetType;
  environment: DiagnosticsEnvironment;
  deviceIds: string[];
  userEmails: string[];
  platform: string;
  appVersion: string;
  buildNumber: string;
  ttlMinutes: string;
  sampleRate: string;
  reason: string;
}

const initialFormState: FormState = {
  mode: 'debug',
  targetType: 'user',
  environment: 'production',
  deviceIds: [],
  userEmails: [],
  platform: '',
  appVersion: '',
  buildNumber: '',
  ttlMinutes: '60',
  sampleRate: '0.5',
  reason: '',
};

function isTraceTargetType(targetType: DiagnosticsTargetType) {
  return targetType === 'device' || targetType === 'user';
}

function formatDate(value: string | null) {
  if (!value) {
    return 'n/a';
  }

  return new Date(value).toLocaleString();
}

function labelForTarget(
  policy: Pick<DiagnosticsPolicy, 'targetType' | 'target'>
) {
  return formatTarget(policy.targetType, policy.target);
}

function formatTarget(
  targetType: DiagnosticsTargetType,
  target: DiagnosticsTarget
) {
  const environmentLabel = target.environment ? ` (${target.environment})` : '';

  if (target.type === 'device') {
    const deviceLabel =
      target.deviceIds?.join(', ') ?? target.deviceId ?? 'n/a';
    return `${targetType}: ${deviceLabel}${environmentLabel}`;
  }
  if (target.type === 'user') {
    const userLabel =
      target.userEmails?.join(', ') ??
      target.userEmail ??
      target.userId ??
      'n/a';
    return `${targetType}: ${userLabel}${environmentLabel}`;
  }
  if (target.type === 'platform')
    return `${targetType}: ${target.platform ?? 'n/a'}${environmentLabel}`;
  if (target.type === 'app_version_build') {
    return `${targetType}: ${target.appVersion ?? 'n/a'}:${target.buildNumber ?? 'n/a'}${environmentLabel}`;
  }
  return `${targetType}${environmentLabel}`;
}

function limitLabels(limits: {
  uploadIntervalSec: number;
  maxEventsPerMinute: number;
  maxBatchEvents: number;
  maxPayloadKb: number;
  breadcrumbLimit: number;
}) {
  return [
    `upload ${limits.uploadIntervalSec}s`,
    `${limits.maxEventsPerMinute}/min`,
    `batch ${limits.maxBatchEvents}`,
    `${limits.maxPayloadKb}KB`,
    `breadcrumbs ${limits.breadcrumbLimit}`,
  ];
}

function DetailChips({
  limits,
  categories,
}: {
  limits: {
    uploadIntervalSec: number;
    maxEventsPerMinute: number;
    maxBatchEvents: number;
    maxPayloadKb: number;
    breadcrumbLimit: number;
  };
  categories: DiagnosticsCategory[];
}) {
  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {limitLabels(limits).map((label) => (
          <Chip key={label} size="small" variant="outlined" label={label} />
        ))}
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {categories.map((category) => (
          <Chip key={category} size="small" label={category} />
        ))}
      </Stack>
    </Stack>
  );
}

function clampGlobalSampleTtl(ttlMinutes: string) {
  const ttl = Number(ttlMinutes);

  if (!Number.isFinite(ttl) || ttl <= 0 || ttl > 30) {
    return '30';
  }

  return ttlMinutes;
}

function clampGlobalSampleRate(sampleRate: string) {
  const rate = Number(sampleRate);

  if (!Number.isFinite(rate) || rate <= 0 || rate > 0.01) {
    return '0.01';
  }

  return sampleRate;
}

function normalizeChipValues(
  values: string[],
  options: { lowercase?: boolean } = {}
) {
  const normalizedValues = values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => (options.lowercase ? value.toLowerCase() : value));

  return [...new Set(normalizedValues)];
}

function normalizeTargetOptions(
  options: DiagnosticsTargetOptionsResponse
): DiagnosticsTargetOptionsResponse {
  return {
    platforms: options.platforms ?? [],
    recentUsers: options.recentUsers ?? [],
    recentDevices: options.recentDevices ?? [],
    appVersionBuilds: options.appVersionBuilds ?? [],
  };
}

function buildTarget(form: FormState): DiagnosticsTarget {
  const platform = form.platform.trim().toLowerCase();
  const environment = form.environment;

  if (form.targetType === 'device') {
    const deviceIds = normalizeChipValues(form.deviceIds);

    return {
      type: 'device',
      deviceId: deviceIds[0],
      deviceIds,
      environment,
    };
  }

  if (form.targetType === 'user') {
    const userEmails = normalizeChipValues(form.userEmails, {
      lowercase: true,
    });

    return {
      type: 'user',
      userEmail: userEmails[0],
      userEmails,
      environment,
    };
  }

  if (form.targetType === 'platform') {
    return { type: 'platform', platform, environment };
  }

  if (form.targetType === 'app_version_build') {
    return {
      type: 'app_version_build',
      appVersion: form.appVersion.trim(),
      buildNumber: form.buildNumber.trim(),
      environment,
    };
  }

  return { type: form.targetType, environment };
}

function validateForm(form: FormState) {
  const errors: string[] = [];
  const ttl = Number(form.ttlMinutes);
  const sampleRate = Number(form.sampleRate);
  const ttlLimit = getDiagnosticsTtlLimitMinutes(form.mode, form.targetType);

  if (!form.reason.trim()) {
    errors.push('Reason is required.');
  }

  if (form.mode === 'trace' && !isTraceTargetType(form.targetType)) {
    errors.push('Trace policies can only target a device or user.');
  }

  if (!ENVIRONMENTS.includes(form.environment)) {
    errors.push('Environment is required.');
  }

  if (!Number.isFinite(ttl) || ttl <= 0) {
    errors.push('TTL must be greater than 0 minutes.');
  } else if (ttlLimit !== null && ttl > ttlLimit) {
    errors.push(`TTL must be ${ttlLimit} minutes or less for this policy.`);
  }

  if (form.targetType === 'global_sample' && form.sampleRate.trim() === '') {
    errors.push('Sample rate is required for global sample policies.');
  } else if (
    !Number.isFinite(sampleRate) ||
    sampleRate <= 0 ||
    sampleRate > 1
  ) {
    errors.push('Sample rate must be between 0 and 1.');
  } else if (form.targetType === 'global_sample' && sampleRate > 0.01) {
    errors.push('Global sample rate must be 0.01 or lower.');
  }

  if (
    form.targetType === 'device' &&
    normalizeChipValues(form.deviceIds).length === 0
  ) {
    errors.push('Device ID is required.');
  }

  if (
    form.targetType === 'user' &&
    normalizeChipValues(form.userEmails, { lowercase: true }).length === 0
  ) {
    errors.push('User email is required.');
  }

  if (form.targetType === 'platform' && !form.platform.trim()) {
    errors.push('Platform is required.');
  }

  if (form.targetType === 'app_version_build') {
    if (!form.appVersion.trim()) errors.push('App version is required.');
    if (!form.buildNumber.trim()) errors.push('Build number is required.');
  }

  return errors;
}

function PolicyList({
  title,
  policies,
  canWrite,
  onDisable,
}: {
  title: string;
  policies: DiagnosticsPolicy[];
  canWrite: boolean;
  onDisable: (policyId: string) => void;
}) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      <Stack spacing={2}>
        {policies.length === 0 ? (
          <Typography color="text.secondary">No policies found</Typography>
        ) : (
          policies.map((policy) => {
            const lokiUrl = buildDiagnosticsLokiUrl(policy);

            return (
              <Box
                key={policy.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography fontWeight={700}>{policy.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {policy.mode} on {labelForTarget(policy)}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mt: 1 }}
                    >
                      <Chip
                        size="small"
                        label={policy.enabled ? 'Active' : 'Inactive'}
                        color={policy.enabled ? 'success' : 'default'}
                      />
                      <Chip
                        size="small"
                        label={`sample ${policy.sampleRate}`}
                      />
                      <Chip
                        size="small"
                        label={`expires ${formatDate(policy.expiresAt)}`}
                      />
                    </Stack>
                    <DetailChips
                      limits={policy}
                      categories={policy.categories}
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {policy.reason}
                    </Typography>
                    {policy.disabledReason && (
                      <Typography variant="body2" color="text.secondary">
                        {policy.disabledReason}
                      </Typography>
                    )}
                    {lokiUrl && (
                      <Button
                        href={lokiUrl}
                        target="_blank"
                        rel="noreferrer"
                        size="small"
                        endIcon={<OpenInNew />}
                        sx={{ mt: 1 }}
                      >
                        Open in Grafana
                      </Button>
                    )}
                  </Box>
                  {canWrite && policy.enabled && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => onDisable(policy.id)}
                      sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' } }}
                    >
                      Disable {policy.id}
                    </Button>
                  )}
                </Stack>
              </Box>
            );
          })
        )}
      </Stack>
    </Paper>
  );
}

function AuditList({ entries }: { entries: DiagnosticsAuditEntry[] }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" color="text.primary" gutterBottom>
        Backend audit
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Chronological log of who created or disabled diagnostics access, when,
        for which target, and why.
      </Typography>
      <Stack spacing={1.5}>
        {entries.length === 0 ? (
          <Typography color="text.secondary">No audit entries found</Typography>
        ) : (
          entries.map((entry) => (
            <Box
              key={entry.id}
              sx={{ borderBottom: 1, borderColor: 'divider', pb: 1.5 }}
            >
              <Typography fontWeight={700}>
                {entry.action} {entry.policyId ?? 'policy'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {entry.actorEmail ?? 'unknown actor'} -{' '}
                {formatDate(entry.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {entry.mode} on {formatTarget(entry.targetType, entry.target)} -
                TTL {Math.round(entry.ttlSeconds / 60)}m - sample{' '}
                {entry.sampling.sampleRate}
              </Typography>
              <DetailChips
                limits={entry.limits}
                categories={entry.categories}
              />
              <Typography variant="body2">{entry.reason}</Typography>
            </Box>
          ))
        )}
      </Stack>
    </Paper>
  );
}

export function RemoteDiagnosticsAdminPage() {
  const [capabilities, setCapabilities] =
    useState<DiagnosticsCapabilities>(DEFAULT_CAPABILITIES);
  const [activePolicies, setActivePolicies] = useState<DiagnosticsPolicy[]>([]);
  const [auditEntries, setAuditEntries] = useState<DiagnosticsAuditEntry[]>([]);
  const [targetOptions, setTargetOptions] =
    useState<DiagnosticsTargetOptionsResponse>(DEFAULT_TARGET_OPTIONS);
  const [backendLogSetting, setBackendLogSetting] =
    useState<DiagnosticsBackendLogSetting>({
      mode: 'production',
      updatedByEmail: null,
      updatedAt: null,
    });
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const ttlLimit = useMemo(
    () => getDiagnosticsTtlLimitMinutes(form.mode, form.targetType),
    [form.mode, form.targetType]
  );
  const canUseTrace =
    capabilities?.canTrace && isTraceTargetType(form.targetType);
  const appVersions = useMemo(
    () => [
      ...new Set(
        targetOptions.appVersionBuilds.map((option) => option.appVersion)
      ),
    ],
    [targetOptions.appVersionBuilds]
  );
  const buildNumbers = useMemo(() => {
    const matchingBuilds = targetOptions.appVersionBuilds
      .filter((option) => option.appVersion === form.appVersion)
      .map((option) => option.buildNumber);

    return [...new Set(matchingBuilds)];
  }, [form.appVersion, targetOptions.appVersionBuilds]);

  const loadData = useCallback(async () => {
    const [activeResponse, auditResponse, optionsResponse, backendLogResponse] =
      await Promise.all([
        getDiagnosticsPolicies({ activeOnly: true }),
        getDiagnosticsAudit({ limit: 5 }),
        getDiagnosticsTargetOptions(),
        getDiagnosticsBackendLogSetting(),
      ]);

    setActivePolicies(activeResponse.items);
    setAuditEntries(auditResponse.items);
    setTargetOptions(normalizeTargetOptions(optionsResponse));
    setBackendLogSetting(backendLogResponse);
  }, []);

  useEffect(() => {
    if (
      form.targetType !== 'app_version_build' ||
      form.buildNumber === '' ||
      buildNumbers.includes(form.buildNumber)
    ) {
      return;
    }

    updateForm('buildNumber', '');
  }, [buildNumbers, form.buildNumber, form.targetType]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialState() {
      try {
        if (isMounted) {
          setCapabilities(DEFAULT_CAPABILITIES);
        }
      } catch {
        // Diagnostics is available to every dashboard admin. If the
        // capabilities endpoint is stale or unavailable, keep full page access.
      }

      try {
        await loadData();
      } catch (error) {
        if (isMounted) {
          setErrors([
            error instanceof Error
              ? error.message
              : 'Failed to load diagnostics access.',
          ]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialState();

    return () => {
      isMounted = false;
    };
  }, [loadData]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTargetType(targetType: DiagnosticsTargetType) {
    setForm((current) => ({
      ...current,
      mode:
        current.mode === 'trace' && !isTraceTargetType(targetType)
          ? 'debug'
          : current.mode,
      targetType,
      platform: targetType === 'platform' ? current.platform : '',
      appVersion: targetType === 'app_version_build' ? current.appVersion : '',
      buildNumber:
        targetType === 'app_version_build' ? current.buildNumber : '',
      ttlMinutes:
        targetType === 'global_sample'
          ? clampGlobalSampleTtl(current.ttlMinutes)
          : current.ttlMinutes,
      sampleRate:
        targetType === 'global_sample'
          ? clampGlobalSampleRate(current.sampleRate)
          : current.sampleRate,
    }));
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setStatus(null);
    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      return;
    }

    const ttlMinutes = Number(form.ttlMinutes);
    const expiresAt = new Date(
      Date.now() + ttlMinutes * 60 * 1000
    ).toISOString();

    setIsMutating(true);
    try {
      await createDiagnosticsPolicy({
        mode: form.mode,
        target: buildTarget(form),
        expiresAt,
        sampleRate: Number(form.sampleRate),
        ...DEFAULT_LIMITS,
        categories: CATEGORIES,
        reason: form.reason.trim(),
      });
      setStatus('Policy created.');
      setForm(initialFormState);
      await loadData();
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : 'Failed to create policy.',
      ]);
    } finally {
      setIsMutating(false);
    }
  }

  async function handleDisable(policyId: string) {
    setStatus(null);
    setErrors([]);
    setIsMutating(true);
    try {
      await disableDiagnosticsPolicy(policyId, {
        reason: 'Disabled from admin panel',
      });
      setStatus('Policy disabled.');
      await loadData();
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : 'Failed to disable policy.',
      ]);
    } finally {
      setIsMutating(false);
    }
  }

  async function handleBackendLogModeChange(mode: DiagnosticsBackendLogMode) {
    setStatus(null);
    setErrors([]);
    setIsMutating(true);
    try {
      const updated = await updateDiagnosticsBackendLogSetting({ mode });
      setBackendLogSetting(updated);
      setStatus('Backend log setting updated.');
    } catch (error) {
      setErrors([
        error instanceof Error
          ? error.message
          : 'Failed to update backend log setting.',
      ]);
    } finally {
      setIsMutating(false);
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Backdrop
        open={isMutating}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          color: 'common.white',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress
            color="inherit"
            aria-label="Applying policy changes"
          />
          <Typography fontWeight={700}>Applying policy changes...</Typography>
        </Stack>
      </Backdrop>
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            maxWidth: 1280,
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 4 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Link href="/dashboard">
            <Button variant="outlined" size="small" startIcon={<ArrowBack />}>
              Back
            </Button>
          </Link>
          <BugReport color="error" />
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Remote Diagnostics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Temporary mobile diagnostics policies and backend audit
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <TextField
            select
            SelectProps={{ native: true }}
            label="Backend logs"
            size="small"
            value={backendLogSetting.mode}
            onChange={(event) =>
              handleBackendLogModeChange(
                event.target.value as DiagnosticsBackendLogMode
              )
            }
            disabled={!capabilities.canWrite || isMutating}
            sx={{ minWidth: 180 }}
          >
            {BACKEND_LOG_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </TextField>
        </Box>
      </Paper>

      <Box
        sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}
      >
        <Stack spacing={3}>
          {errors.map((error) => (
            <Alert key={error} severity="error">
              {error}
            </Alert>
          ))}
          {status && <Alert severity="success">{status}</Alert>}

          <Paper component="form" onSubmit={handleCreate} sx={{ p: 3 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Create policy
            </Typography>
            {!capabilities.canWrite && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Write access required to create or disable diagnostics policies.
              </Alert>
            )}
            {form.targetType === 'global_sample' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Global sample policies affect random users. Keep the sample rate
                at 0.01 or lower.
              </Alert>
            )}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2,
                alignItems: 'start',
              }}
            >
              <Stack spacing={2}>
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Mode"
                  value={form.mode}
                  onChange={(event) =>
                    updateForm('mode', event.target.value as DiagnosticsMode)
                  }
                  disabled={!capabilities.canWrite}
                >
                  {(['errors', 'info', 'debug'] as DiagnosticsMode[]).map(
                    (mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    )
                  )}
                  {canUseTrace && <option value="trace">trace</option>}
                </TextField>
                <TextField
                  label="Expires in minutes"
                  type="number"
                  value={form.ttlMinutes}
                  onChange={(event) =>
                    updateForm('ttlMinutes', event.target.value)
                  }
                  helperText={
                    ttlLimit
                      ? `Max ${ttlLimit} minutes`
                      : 'Backend validates future expiry'
                  }
                  disabled={!capabilities.canWrite}
                />
              </Stack>

              <Stack spacing={2} data-testid="diagnostics-target-column">
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Target type"
                  value={form.targetType}
                  onChange={(event) =>
                    updateTargetType(
                      event.target.value as DiagnosticsTargetType
                    )
                  }
                  disabled={!capabilities.canWrite}
                >
                  {TARGET_TYPES.map((targetType) => (
                    <option key={targetType.value} value={targetType.value}>
                      {targetType.label}
                    </option>
                  ))}
                </TextField>
                {form.targetType === 'device' && (
                  <Autocomplete
                    multiple
                    freeSolo
                    openOnFocus
                    selectOnFocus
                    handleHomeEndKeys
                    forcePopupIcon
                    noOptionsText="No recent devices found"
                    options={targetOptions.recentDevices}
                    value={form.deviceIds}
                    onChange={(_, values) =>
                      updateForm('deviceIds', normalizeChipValues(values))
                    }
                    disabled={!capabilities.canWrite}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Device IDs"
                        placeholder="Select or enter device ID"
                      />
                    )}
                  />
                )}
                {form.targetType === 'user' && (
                  <Autocomplete
                    multiple
                    freeSolo
                    openOnFocus
                    selectOnFocus
                    handleHomeEndKeys
                    forcePopupIcon
                    noOptionsText="No recent users found"
                    options={targetOptions.recentUsers}
                    value={form.userEmails}
                    onChange={(_, values) =>
                      updateForm(
                        'userEmails',
                        normalizeChipValues(values, { lowercase: true })
                      )
                    }
                    disabled={!capabilities.canWrite}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="User emails"
                        placeholder="Select or enter email"
                      />
                    )}
                  />
                )}
                {form.targetType === 'platform' && (
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    label="Platform"
                    value={form.platform}
                    onChange={(event) =>
                      updateForm('platform', event.target.value)
                    }
                    helperText={
                      targetOptions.platforms.length === 0
                        ? 'No platforms found from analytics devices'
                        : undefined
                    }
                    disabled={!capabilities.canWrite}
                  >
                    <option value="">Select platform</option>
                    {targetOptions.platforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </TextField>
                )}
                {form.targetType === 'app_version_build' && (
                  <>
                    <TextField
                      select
                      SelectProps={{ native: true }}
                      label="App version"
                      value={form.appVersion}
                      onChange={(event) =>
                        updateForm('appVersion', event.target.value)
                      }
                      helperText={
                        appVersions.length === 0
                          ? 'No versions found from analytics devices'
                          : undefined
                      }
                      disabled={!capabilities.canWrite}
                    >
                      <option value="">Select app version</option>
                      {appVersions.map((appVersion) => (
                        <option key={appVersion} value={appVersion}>
                          {appVersion}
                        </option>
                      ))}
                    </TextField>
                    <TextField
                      select
                      SelectProps={{ native: true }}
                      label="Build number"
                      value={form.buildNumber}
                      onChange={(event) =>
                        updateForm('buildNumber', event.target.value)
                      }
                      helperText={
                        form.appVersion && buildNumbers.length === 0
                          ? 'No builds found for this version'
                          : undefined
                      }
                      disabled={!capabilities.canWrite || !form.appVersion}
                    >
                      <option value="">Select build number</option>
                      {buildNumbers.map((buildNumber) => (
                        <option key={buildNumber} value={buildNumber}>
                          {buildNumber}
                        </option>
                      ))}
                    </TextField>
                  </>
                )}
              </Stack>

              <Stack spacing={2}>
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Environment"
                  value={form.environment}
                  onChange={(event) =>
                    updateForm(
                      'environment',
                      event.target.value as DiagnosticsEnvironment
                    )
                  }
                  disabled={!capabilities.canWrite}
                >
                  {ENVIRONMENTS.map((environment) => (
                    <option key={environment} value={environment}>
                      {environment}
                    </option>
                  ))}
                </TextField>
                <TextField
                  label="Sample rate"
                  type="number"
                  value={form.sampleRate}
                  onChange={(event) =>
                    updateForm('sampleRate', event.target.value)
                  }
                  inputProps={{ step: '0.000001', min: '0.000001', max: '1' }}
                  disabled={!capabilities.canWrite}
                />
              </Stack>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload limits and enabled categories
              </Typography>
              <DetailChips limits={DEFAULT_LIMITS} categories={CATEGORIES} />
            </Box>
            <TextField
              label="Reason"
              value={form.reason}
              onChange={(event) => updateForm('reason', event.target.value)}
              multiline
              minRows={2}
              fullWidth
              sx={{ mt: 2 }}
              disabled={!capabilities.canWrite}
            />
            <Divider sx={{ my: 2 }} />
            <Button
              type="submit"
              variant="contained"
              disabled={!capabilities.canWrite || isMutating}
            >
              Create policy
            </Button>
          </Paper>

          <PolicyList
            title="Active policies"
            policies={activePolicies}
            canWrite={capabilities.canWrite}
            onDisable={handleDisable}
          />
          <AuditList entries={auditEntries} />
        </Stack>
      </Box>
    </Box>
  );
}
