'use client';

import {
  Box,
  ButtonBase,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { MonitorCheck, Outcome } from '@/lib/api/system-monitor';

const names: Record<string, string> = {
  'backend.health': 'Application API',
  'backend.auth': 'Account access',
  'backend.catalog': 'Subscription catalog',
  'backend.collections': 'Prediction collections',
  'aichat.functional': 'AI chat',
  'n8n.health': 'n8n availability',
  'n8n.readiness': 'n8n readiness',
};
const labels: Record<Outcome, string> = {
  pass: 'Pass',
  warn: 'Warning',
  fail: 'Fail',
  unavailable: 'Unavailable',
  interrupted: 'Interrupted',
  unknown: 'Unknown',
};

export function MonitorCheckMap({
  checks,
  now,
  sourceUnavailable,
  onSelect,
}: {
  checks: MonitorCheck[];
  now: number;
  sourceUnavailable: boolean;
  onSelect: (check: MonitorCheck) => void;
}) {
  const theme = useTheme();
  const state = (check: MonitorCheck) => {
    const stale =
      check.enabled &&
      (sourceUnavailable ||
        !check.lastRun?.endedAt ||
        now - Date.parse(check.lastRun.endedAt) >
          check.intervalMs * 2 + check.deadlineMs);
    const outcome: Outcome = !check.enabled
      ? 'unavailable'
      : sourceUnavailable ||
          (stale && !['unavailable', 'interrupted'].includes(check.status))
        ? 'unknown'
        : check.status;
    return { outcome, stale };
  };
  const color = (outcome: Outcome) =>
    outcome === 'pass'
      ? theme.palette.success.main
      : outcome === 'fail'
        ? theme.palette.error.main
        : ['warn', 'interrupted'].includes(outcome)
          ? theme.palette.warning.main
          : theme.palette.text.disabled;
  const passing = checks.filter(
    (check) => state(check).outcome === 'pass'
  ).length;
  const required = checks.filter((check) => check.required).length;
  const byId = (id: string) => checks.find((check) => check.checkId === id);
  const api = byId('backend.health');
  const auth = byId('backend.auth');
  const branches = [
    'backend.catalog',
    'backend.collections',
    'aichat.functional',
  ]
    .map(byId)
    .filter((check): check is MonitorCheck => Boolean(check));
  const backend = [api, auth, ...branches].filter(
    (check): check is MonitorCheck => Boolean(check)
  );
  const n8n = checks.filter((check) => check.checkId.startsWith('n8n.'));
  const other = checks.filter(
    (check) => !backend.includes(check) && !n8n.includes(check)
  );
  const node = (check: MonitorCheck) => {
    const { outcome, stale } = state(check);
    const label = names[check.checkId] ?? check.checkId;
    const status = check.enabled ? labels[outcome] : 'Disabled';
    const freshness = !check.enabled ? 'Disabled' : stale ? 'Stale' : 'Fresh';
    const last = check.lastRun?.endedAt
      ? new Date(check.lastRun.endedAt).toLocaleString('en-GB', {
          timeZone: 'Europe/Kyiv',
        })
      : 'Never';
    const interval =
      check.intervalMs >= 3600000
        ? `${check.intervalMs / 3600000} h`
        : `${check.intervalMs / 60000} min`;
    return (
      <Tooltip
        key={check.checkId}
        title={`Last check: ${last} · Kyiv. Every ${interval}; deadline ${check.deadlineMs / 1000}s. ${check.required ? 'Required' : 'Optional'}.`}
        arrow
      >
        <ButtonBase
          onClick={() => onSelect(check)}
          aria-label={`${label}: ${status}, ${freshness}, ${check.required ? 'Required' : 'Optional'}. View check details and history`}
          sx={{
            width: '100%',
            minWidth: 0,
            minHeight: 72,
            px: 1.5,
            py: 1,
            gap: 1.25,
            justifyContent: 'flex-start',
            textAlign: 'left',
            borderRadius: 2,
            border: '1px solid',
            borderStyle: stale ? 'dashed' : 'solid',
            borderColor: alpha(color(outcome), 0.5),
            bgcolor: alpha(color(outcome), 0.05),
            '&:hover': { bgcolor: alpha(color(outcome), 0.12) },
            '&.Mui-focusVisible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 3,
            },
          }}
        >
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              width: 10,
              height: 10,
              flexShrink: 0,
              borderRadius: '50%',
              bgcolor: color(outcome),
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ overflowWrap: 'anywhere' }}
            >
              {label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {status}
              {stale ? ' · Stale' : ''}
              {outcome === 'pass' && check.lastRun?.durationMs != null
                ? ` · ${check.lastRun.durationMs} ms`
                : ''}
            </Typography>
          </Box>
        </ButtonBase>
      </Tooltip>
    );
  };
  const connector = (split: boolean) => (
    <Box
      aria-hidden="true"
      sx={{
        display: { xs: 'none', sm: 'block' },
        color: 'text.disabled',
        alignSelf: 'stretch',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 28 240"
        preserveAspectRatio="none"
        style={{ display: 'block', minHeight: 240 }}
      >
        <path
          d={
            split
              ? 'M0 120 H14 M14 36 V204 M14 36 H28 M14 120 H28 M14 204 H28'
              : 'M0 120 H28'
          }
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {(split ? [36, 120, 204] : [120]).map((y) => (
          <path
            key={y}
            d={`M23 ${y - 4} L28 ${y} L23 ${y + 4}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </Box>
  );
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          gap={1}
        >
          <Box>
            <Typography variant="h6">
              {passing} of {checks.length} checks passing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {required === checks.length
                ? 'All checks are required'
                : `${required} required checks`}{' '}
              · Select a check for details and history
            </Typography>
          </Box>
          <Stack direction="row" gap={1.5} flexWrap="wrap" alignItems="center">
            {(['pass', 'warn', 'fail', 'unknown'] as const).map((outcome) => (
              <Stack
                key={outcome}
                direction="row"
                gap={0.75}
                alignItems="center"
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: color(outcome),
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {labels[outcome]}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '3fr 1fr' },
            gap: 3,
          }}
        >
          {backend.length > 0 && (
            <Box
              component="section"
              aria-label="Backend check dependencies"
              sx={{ minWidth: 0 }}
            >
              <Typography variant="overline" color="text.secondary">
                Backend
              </Typography>
              {api && auth && branches.length === 3 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: '1fr 28px 1fr 28px 1.25fr',
                    },
                    alignItems: 'center',
                    gap: { xs: 1.5, sm: 0 },
                    mt: 1,
                  }}
                >
                  {node(api)}
                  <Box
                    aria-hidden="true"
                    sx={{
                      display: { xs: 'block', sm: 'none' },
                      textAlign: 'center',
                      color: 'text.disabled',
                      lineHeight: 1,
                    }}
                  >
                    ↓
                  </Box>
                  {connector(false)}
                  {node(auth)}
                  <Box
                    aria-hidden="true"
                    sx={{
                      display: { xs: 'block', sm: 'none' },
                      textAlign: 'center',
                      color: 'text.disabled',
                      lineHeight: 1,
                    }}
                  >
                    ↓
                  </Box>
                  {connector(true)}
                  <Stack
                    spacing={1.5}
                    sx={{
                      borderLeft: { xs: '1px solid', sm: 0 },
                      borderColor: 'divider',
                      pl: { xs: 2, sm: 0 },
                    }}
                  >
                    {branches.map(node)}
                  </Stack>
                </Box>
              ) : (
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {backend.map(node)}
                </Stack>
              )}
            </Box>
          )}
          {n8n.length > 0 && (
            <Box
              component="section"
              aria-label="Independent n8n checks"
              sx={{
                minWidth: 0,
                borderLeft: { lg: '1px solid' },
                borderColor: 'divider',
                pl: { lg: 3 },
              }}
            >
              <Typography variant="overline" color="text.secondary">
                n8n
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {n8n.map(node)}
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5 }}
              >
                Availability and readiness are checked independently.
              </Typography>
            </Box>
          )}
        </Box>
        {other.length > 0 && <Stack spacing={1.5}>{other.map(node)}</Stack>}
        <Typography variant="caption" color="text.secondary">
          Arrows show check dependencies · Dashed outline means no fresh result
        </Typography>
      </Stack>
    </Paper>
  );
}
