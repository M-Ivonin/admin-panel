'use client';

import { Alert, Box, Stack, Typography } from '@mui/material';
import type { UpdatedHomeMetricValue } from '@/lib/api/updated-home-analytics';
import {
  ANALYTICS_ROLE_TOKENS,
  displayLabel,
  hasValidStageOrdinals,
  stageRole,
} from './presentation';

const mono = '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace';

type UpdatedHomeFunnelProps = {
  title: string;
  meta: string;
  values: UpdatedHomeMetricValue[];
  phaseLabel?: string;
  handoffLabel?: string;
};

export function UpdatedHomeFunnel({
  title,
  meta,
  values,
  phaseLabel,
  handoffLabel,
}: UpdatedHomeFunnelProps) {
  const ordinalsValid = hasValidStageOrdinals(values);

  return (
    <Box
      data-testid="updated-home-funnel"
      sx={{
        minWidth: 0,
        border: '1px solid #343434',
        borderRadius: '12px',
        bgcolor: '#222222',
        p: { xs: '14px', sm: '20px' },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={0.75}
        sx={{ mb: '18px' }}
      >
        <Stack gap="3px">
          {phaseLabel ? (
            <Typography
              sx={{
                color: '#B9A8FF',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              {phaseLabel.toUpperCase()}
            </Typography>
          ) : null}
          <Typography sx={{ color: '#F5F5F5', fontSize: 17, fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>
        <Typography sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 11 }}>
          {meta}
        </Typography>
      </Stack>

      {!ordinalsValid && values.length > 0 ? (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          Backend stage order is invalid. Values are shown in response order and
          are not reassigned.
        </Alert>
      ) : null}

      {values.length === 0 ? (
        <Alert severity="warning">
          This funnel was not returned by the backend.
        </Alert>
      ) : (
        <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${values.length}, minmax(150px, 1fr))`,
              alignItems: 'end',
              gap: '8px',
              minWidth: values.length > 4 ? values.length * 150 : 0,
            }}
          >
            {values.map((value, index) => {
              const stage =
                typeof value.dimensions.stage === 'string'
                  ? value.dimensions.stage
                  : 'unknown_stage';
              const baseline = index === 0;
              const role = stageRole(stage, value);
              const token = ANALYTICS_ROLE_TOKENS[role];
              const available = value.value !== null;
              const trackWidth = baseline
                ? 100
                : available
                  ? Math.max(0, Math.min(100, value.value ?? 0))
                  : 0;
              const rate = baseline
                ? '100% cohort baseline'
                : available
                  ? formatFunnelRate(value.value!, value.unit)
                  : 'N/A';

              return (
                <Stack
                  key={`${String(value.dimensions.stageOrdinal)}-${stage}`}
                  data-testid="updated-home-funnel-stage"
                  data-stage={stage}
                  data-stage-ordinal={String(
                    value.dimensions.stageOrdinal ?? ''
                  )}
                  data-presentation-role={role}
                  gap="7px"
                  minWidth={0}
                >
                  <Typography
                    sx={{
                      color: available ? '#F5F5F5' : '#F0A63A',
                      fontFamily: mono,
                      fontSize: 18,
                      fontWeight: 700,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {available && value.numerator !== null
                      ? `${value.numerator} ${baseline ? formatFunnelUnit(value.unit) : 'users'}`
                      : 'N/A'}
                  </Typography>
                  <Typography
                    sx={{ color: '#A3A3A3', fontSize: 11, minHeight: 32 }}
                  >
                    {displayLabel(stage)}
                  </Typography>
                  <Box
                    aria-label={`${displayLabel(stage)} ${rate}`}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      bgcolor: '#414141',
                      overflow: 'visible',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${trackWidth}%`,
                        height: '100%',
                        minWidth: trackWidth > 0 ? 3 : 0,
                        borderRadius: 4,
                        bgcolor: token.color,
                        boxShadow: token.outline
                          ? `0 0 0 1px ${token.outline}`
                          : 'none',
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 10 }}
                  >
                    {rate}
                  </Typography>
                  <Typography
                    sx={{
                      color: available ? '#B8B8BA' : '#F0A63A',
                      fontSize: 9,
                    }}
                  >
                    {available
                      ? token.cue
                      : `N/A · ${stripNaPrefix(value.naReason ?? token.cue)}`}
                  </Typography>
                </Stack>
              );
            })}
          </Box>
        </Box>
      )}

      {handoffLabel ? (
        <Typography
          sx={{ color: '#B9A8FF', fontSize: 10, fontWeight: 600, mt: 1.5 }}
        >
          {handoffLabel}
        </Typography>
      ) : null}
    </Box>
  );
}

function stripNaPrefix(reason: string): string {
  return reason.replace(/^N\/A:\s*/i, '');
}

function formatFunnelRate(value: number, unit: string): string {
  return unit === 'percent'
    ? `${value}%`
    : `${value} ${formatFunnelUnit(unit)}`;
}

function formatFunnelUnit(unit: string): string {
  return unit.replace(/_/g, ' ');
}
