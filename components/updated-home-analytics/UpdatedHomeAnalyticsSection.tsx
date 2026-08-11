import { Box, Chip, Stack, Typography } from '@mui/material';
import type { UpdatedHomeDashboardBlock } from '@/lib/api/updated-home-analytics';
import {
  formatDimensions,
  formatMetricUnit,
  formatMetricValue,
  findMetricStage,
  type FunnelTemplate,
  type MetricTemplate,
  UPDATED_HOME_FUNNELS,
  UPDATED_HOME_METRICS,
} from './presentation';

const mono = '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace';

type UpdatedHomeAnalyticsSectionProps = {
  id: number;
  title: string;
  status: 'ready' | 'window';
  dashboard?: UpdatedHomeDashboardBlock;
};

export function UpdatedHomeAnalyticsSection({
  id,
  title,
  status,
  dashboard,
}: UpdatedHomeAnalyticsSectionProps) {
  const isComplete = status === 'ready';
  const funnel = UPDATED_HOME_FUNNELS[id];
  const templates = UPDATED_HOME_METRICS[id] ?? [];

  return (
    <Box
      component="section"
      id={`dashboard-${id}`}
      data-testid="updated-home-dashboard-section"
      sx={{
        scrollMarginTop: 24,
        border: '1px solid #343434',
        borderRadius: '12px',
        bgcolor: '#222222',
        p: '20px',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        sx={{ mb: '14px' }}
      >
        <Stack direction="row" alignItems="center" gap="12px" minWidth={0}>
          <Box
            sx={{
              width: 34,
              height: 34,
              flex: '0 0 34px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '8px',
              bgcolor: '#5B4BFF',
              color: '#fff',
              fontFamily: mono,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {id}
          </Box>
          <Typography sx={{ color: '#F5F5F5', fontSize: 18, fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>
        <Chip
          label={isComplete ? 'MVP ready' : 'Observation window'}
          size="small"
          sx={{
            flexShrink: 0,
            height: 28,
            bgcolor: isComplete ? '#173926' : '#3A2B12',
            color: isComplete ? '#D8FBE9' : '#F8E5BF',
            fontSize: 11,
            fontWeight: 600,
            '& .MuiChip-label': { px: '10px' },
          }}
        />
      </Stack>

      {funnel ? (
        <DesignFunnel funnel={funnel} dashboard={dashboard} />
      ) : (
        <Box sx={{ overflow: 'hidden', border: '1px solid #3A3A3A', borderRadius: '8px' }}>
          {templates.flatMap((template) => {
            const metric = dashboard?.metrics.find(
              (candidate) => candidate.definition.key === template.sourceKey
            );
            const matchingValues = (metric?.values ?? []).filter(
              (value) => !template.sourceStage || value.dimensions.stage === template.sourceStage
            );
            const values = matchingValues.length ? matchingValues : [undefined];
            return values.map((value, index) => (
              <MetricRow
                key={`${template.id}-${index}`}
                template={template}
                value={
                  value && template.valueField === 'numerator'
                    ? { ...value, value: value.numerator, unit: 'users' }
                    : value
                }
              />
            ));
          })}
        </Box>
      )}
    </Box>
  );
}

function MetricRow({
  template,
  value,
}: {
  template: MetricTemplate;
  value?: UpdatedHomeDashboardBlock['metrics'][number]['values'][number];
}) {
  const dimensions = formatDimensions(value?.dimensions);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '270px 145px minmax(0, 1fr)' },
        alignItems: { xs: 'start', md: 'center' },
        gap: { xs: 1.5, md: '18px' },
        bgcolor: '#2A2A2A',
        px: '16px',
        py: '14px',
        '&:not(:last-child)': { borderBottom: '1px solid #3A3A3A' },
      }}
    >
      <Stack gap="5px" minWidth={0}>
        <Typography sx={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}>
          {template.title}
        </Typography>
        <Typography
          sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 9, overflowWrap: 'anywhere' }}
        >
          GROUP BY&nbsp;&nbsp;{template.grouping.join(' · ')}
        </Typography>
        {dimensions ? (
          <Typography sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 9 }}>
            {dimensions}
          </Typography>
        ) : null}
      </Stack>
      <Stack gap="4px">
        <Typography
          sx={{ color: value?.value === null ? '#F0A63A' : '#6D4AFF', fontFamily: mono, fontSize: 20, fontWeight: 700 }}
        >
          {formatMetricValue(value)}
        </Typography>
        <Typography sx={{ color: '#8B8B8F', fontSize: 10 }}>
          {formatMetricUnit(value)}
        </Typography>
      </Stack>
      <Stack gap="4px" minWidth={0}>
        <DefinitionLine label="NUM" value={template.numerator} />
        <DefinitionLine label="DEN" value={template.denominator ?? 'none'} />
        <DefinitionLine label="WINDOW" value={template.window} mono />
        <DefinitionLine
          label="N/A"
          value={value?.naReason ?? template.nullTreatment}
          warning
        />
      </Stack>
    </Box>
  );
}

function DesignFunnel({
  funnel,
  dashboard,
}: {
  funnel: FunnelTemplate;
  dashboard?: UpdatedHomeDashboardBlock;
}) {
  return (
    <Box sx={{ border: '1px solid #343434', borderRadius: '12px', bgcolor: '#222222', p: '20px' }}>
      <Stack direction="row" justifyContent="space-between" gap={2} sx={{ mb: '18px' }}>
        <Typography sx={{ color: '#F5F5F5', fontSize: 17, fontWeight: 700 }}>
          {funnel.title}
        </Typography>
        <Typography sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 11 }}>
          {funnel.meta}
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            md: `repeat(${funnel.steps.length}, minmax(0, 1fr))`,
          },
          gap: 1,
        }}
      >
        {funnel.steps.map((step) => {
          const value = findMetricStage(dashboard, funnel.sourceKey, funnel.sourceStages?.[step]);
          return (
          <Box key={step} sx={{ minWidth: 0, px: 0.5 }}>
            <Typography sx={{ color: '#F5F5F5', fontFamily: mono, fontSize: 18, fontWeight: 700 }}>
              {formatFunnelCount(value)}
            </Typography>
            <Typography sx={{ color: '#A3A3A3', fontSize: 11, minHeight: 22 }}>
              {step}
            </Typography>
            <Box sx={{ height: 3, my: 0.75, borderRadius: 999, bgcolor: '#3A3A3A' }} />
            <Typography sx={{ color: '#8B8B8F', fontFamily: mono, fontSize: 10 }}>
              {formatFunnelRate(value)}
            </Typography>
          </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function formatFunnelCount(value?: UpdatedHomeDashboardBlock['metrics'][number]['values'][number]) {
  return value?.numerator === null || value?.numerator === undefined
    ? 'N/A'
    : value.numerator.toLocaleString('en-US');
}

function formatFunnelRate(value?: UpdatedHomeDashboardBlock['metrics'][number]['values'][number]) {
  if (!value) return 'awaiting API';
  if (value.denominator === null && value.numerator !== null) return '100%';
  return value.value === null ? 'N/A' : `${value.value}%`;
}

function DefinitionLine({
  label,
  value,
  mono: useMono = false,
  warning = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  warning?: boolean;
}) {
  return (
    <Typography
      component="div"
      sx={{
        color: warning ? '#F0A63A' : useMono ? '#8B8B8F' : '#A3A3A3',
        fontFamily: useMono ? mono : 'inherit',
        fontSize: useMono || warning ? 9 : 10,
        overflowWrap: 'anywhere',
      }}
    >
      <Box component="span" sx={{ fontWeight: 700, mr: 0.75 }}>
        {label}
      </Box>
      {value}
    </Typography>
  );
}
