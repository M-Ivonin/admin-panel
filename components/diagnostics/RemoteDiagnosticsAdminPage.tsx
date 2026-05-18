'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
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
  getDiagnosticsAudit,
  getDiagnosticsCapabilities,
  getDiagnosticsPolicies,
  getDiagnosticsTtlLimitMinutes,
  type DiagnosticsAuditEntry,
  type DiagnosticsCapabilities,
  type DiagnosticsCategory,
  type DiagnosticsMode,
  type DiagnosticsPolicy,
  type DiagnosticsTarget,
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

interface FormState {
  mode: DiagnosticsMode;
  targetType: DiagnosticsTargetType;
  deviceId: string;
  userId: string;
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
  deviceId: '',
  userId: '',
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
  policy: Pick<DiagnosticsPolicy, 'targetType' | 'targetKey'>
) {
  return `${policy.targetType}: ${policy.targetKey}`;
}

function formatTarget(
  targetType: DiagnosticsTargetType,
  target: DiagnosticsTarget
) {
  if (target.type === 'device')
    return `${targetType}: ${target.deviceId ?? 'n/a'}`;
  if (target.type === 'user') return `${targetType}: ${target.userId ?? 'n/a'}`;
  if (target.type === 'platform')
    return `${targetType}: ${target.platform ?? 'n/a'}`;
  if (target.type === 'app_version_build') {
    return `${targetType}: ${target.platform ?? '*'}:${target.appVersion ?? 'n/a'}:${target.buildNumber ?? 'n/a'}`;
  }
  return targetType;
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

function buildTarget(form: FormState): DiagnosticsTarget {
  const platform = form.platform.trim().toLowerCase();

  if (form.targetType === 'device') {
    return { type: 'device', deviceId: form.deviceId.trim() };
  }

  if (form.targetType === 'user') {
    return { type: 'user', userId: form.userId.trim() };
  }

  if (form.targetType === 'platform') {
    return { type: 'platform', platform };
  }

  if (form.targetType === 'app_version_build') {
    return {
      type: 'app_version_build',
      platform: platform || undefined,
      appVersion: form.appVersion.trim(),
      buildNumber: form.buildNumber.trim(),
    };
  }

  return { type: form.targetType };
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

  if (form.targetType === 'device' && !form.deviceId.trim()) {
    errors.push('Device ID is required.');
  }

  if (form.targetType === 'user' && !form.userId.trim()) {
    errors.push('User ID is required.');
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
  disableReasons,
  onDisableReasonChange,
  onDisable,
}: {
  title: string;
  policies: DiagnosticsPolicy[];
  canWrite: boolean;
  disableReasons: Record<string, string>;
  onDisableReasonChange: (policyId: string, reason: string) => void;
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
                    <Stack
                      spacing={1}
                      sx={{ minWidth: { xs: '100%', md: 280 } }}
                    >
                      <TextField
                        label={`Disable reason for ${policy.id}`}
                        value={disableReasons[policy.id] ?? ''}
                        onChange={(event) =>
                          onDisableReasonChange(policy.id, event.target.value)
                        }
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => onDisable(policy.id)}
                      >
                        Disable {policy.id}
                      </Button>
                    </Stack>
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
              <Box
                component="pre"
                sx={{
                  mt: 1,
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  fontSize: 12,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {JSON.stringify(
                  {
                    before: entry.beforeSnapshot,
                    after: entry.afterSnapshot,
                  },
                  null,
                  2
                )}
              </Box>
            </Box>
          ))
        )}
      </Stack>
    </Paper>
  );
}

export function RemoteDiagnosticsAdminPage() {
  const [capabilities, setCapabilities] =
    useState<DiagnosticsCapabilities | null>(null);
  const [activePolicies, setActivePolicies] = useState<DiagnosticsPolicy[]>([]);
  const [recentPolicies, setRecentPolicies] = useState<DiagnosticsPolicy[]>([]);
  const [auditEntries, setAuditEntries] = useState<DiagnosticsAuditEntry[]>([]);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [disableReasons, setDisableReasons] = useState<Record<string, string>>(
    {}
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const ttlLimit = useMemo(
    () => getDiagnosticsTtlLimitMinutes(form.mode, form.targetType),
    [form.mode, form.targetType]
  );
  const canUseTrace =
    capabilities?.canTrace && isTraceTargetType(form.targetType);

  const loadData = useCallback(
    async (currentCapabilities: DiagnosticsCapabilities | null) => {
      if (!currentCapabilities?.canRead) {
        return;
      }

      const [activeResponse, recentResponse, auditResponse] = await Promise.all(
        [
          getDiagnosticsPolicies({ activeOnly: true }),
          getDiagnosticsPolicies(),
          getDiagnosticsAudit({ limit: 100 }),
        ]
      );

      setActivePolicies(activeResponse.items);
      setRecentPolicies(recentResponse.items);
      setAuditEntries(auditResponse.items);
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    getDiagnosticsCapabilities()
      .then(async (nextCapabilities) => {
        if (!isMounted) return;
        setCapabilities(nextCapabilities);
        if (nextCapabilities.canRead) {
          await loadData(nextCapabilities);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrors([
            error instanceof Error
              ? error.message
              : 'Failed to load diagnostics access.',
          ]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

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
      await loadData(capabilities);
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : 'Failed to create policy.',
      ]);
    }
  }

  async function handleDisable(policyId: string) {
    const reason = disableReasons[policyId]?.trim();

    if (!reason) {
      setErrors([`Disable reason for ${policyId} is required.`]);
      return;
    }

    try {
      await disableDiagnosticsPolicy(policyId, { reason });
      setStatus('Policy disabled.');
      setDisableReasons((current) => ({ ...current, [policyId]: '' }));
      await loadData(capabilities);
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : 'Failed to disable policy.',
      ]);
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

  if (!capabilities?.canRead) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
        <Paper sx={{ maxWidth: 760, mx: 'auto', p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Remote Diagnostics access required
          </Typography>
          <Typography color="text.secondary">
            Backend diagnostics capabilities do not allow this account to view
            policies.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
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
              }}
            >
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
                select
                SelectProps={{ native: true }}
                label="Target type"
                value={form.targetType}
                onChange={(event) =>
                  updateTargetType(event.target.value as DiagnosticsTargetType)
                }
                disabled={!capabilities.canWrite}
              >
                {TARGET_TYPES.map((targetType) => (
                  <option key={targetType.value} value={targetType.value}>
                    {targetType.label}
                  </option>
                ))}
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
              {form.targetType === 'device' && (
                <TextField
                  label="Device ID"
                  value={form.deviceId}
                  onChange={(event) =>
                    updateForm('deviceId', event.target.value)
                  }
                  disabled={!capabilities.canWrite}
                />
              )}
              {form.targetType === 'user' && (
                <TextField
                  label="User ID"
                  value={form.userId}
                  onChange={(event) => updateForm('userId', event.target.value)}
                  disabled={!capabilities.canWrite}
                />
              )}
              {(form.targetType === 'platform' ||
                form.targetType === 'app_version_build') && (
                <TextField
                  label="Platform"
                  value={form.platform}
                  onChange={(event) =>
                    updateForm('platform', event.target.value)
                  }
                  disabled={!capabilities.canWrite}
                />
              )}
              {form.targetType === 'app_version_build' && (
                <>
                  <TextField
                    label="App version"
                    value={form.appVersion}
                    onChange={(event) =>
                      updateForm('appVersion', event.target.value)
                    }
                    disabled={!capabilities.canWrite}
                  />
                  <TextField
                    label="Build number"
                    value={form.buildNumber}
                    onChange={(event) =>
                      updateForm('buildNumber', event.target.value)
                    }
                    disabled={!capabilities.canWrite}
                  />
                </>
              )}
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
              disabled={!capabilities.canWrite}
            >
              Create policy
            </Button>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: 3,
            }}
          >
            <PolicyList
              title="Active policies"
              policies={activePolicies}
              canWrite={capabilities.canWrite}
              disableReasons={disableReasons}
              onDisableReasonChange={(policyId, reason) =>
                setDisableReasons((current) => ({
                  ...current,
                  [policyId]: reason,
                }))
              }
              onDisable={handleDisable}
            />
            <PolicyList
              title="Recent policies"
              policies={recentPolicies}
              canWrite={false}
              disableReasons={disableReasons}
              onDisableReasonChange={() => undefined}
              onDisable={() => undefined}
            />
          </Box>
          <AuditList entries={auditEntries} />
        </Stack>
      </Box>
    </Box>
  );
}
