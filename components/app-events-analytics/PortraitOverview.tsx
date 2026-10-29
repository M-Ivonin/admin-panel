'use client';

import { FileText, CalendarDays, CalendarCheck, Users } from 'lucide-react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { PortraitResponse } from '@/lib/api/user-portrait';

type ReadyPortrait = Extract<PortraitResponse, { status: 'ready' }>;
const number = (value: number | null) =>
  value === null ? 'Unknown' : value.toLocaleString('en-US');
const stamp = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        timeZone: 'UTC',
        dateStyle: 'medium',
        timeStyle: 'short',
      }) + ' UTC'
    : 'Not recorded';
const surface = { p: { xs: 2, md: 2.5 }, minWidth: 0 };

/** The existing saved projection, composed without recalculating its metrics. */
export function PortraitOverview({
  data,
  historical,
}: {
  data: ReadyPortrait;
  historical: boolean;
}) {
  const { snapshot, selectedWindow: window } = data;
  const current = snapshot.current;
  return (
    <Stack spacing={2}>
      <Box
        component="section"
        sx={{
          p: { xs: 0, md: 2.5 },
          bgcolor: { xs: 'transparent', md: 'background.paper' },
          border: { xs: 0, md: '1px solid' },
          borderColor: { xs: 'transparent', md: 'divider' },
          borderRadius: '12px',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          gap={2}
          alignItems={{ md: 'flex-start' }}
        >
          <Stack
            direction="row"
            gap={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ flexShrink: 0, display: { xs: 'none', md: 'flex' } }}
          >
            <Chip
              label={historical ? 'Historical snapshot' : 'Latest snapshot'}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${window.coverage.status.charAt(0).toUpperCase()}${window.coverage.status.slice(1)} coverage`}
              size="small"
              color="default"
              variant="outlined"
            />
            {data.freshness.stale ? (
              <Chip
                label="Stale snapshot"
                size="small"
                color="warning"
                variant="outlined"
              />
            ) : null}
          </Stack>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600}>
              Facts as of {stamp(snapshot.asOf)}
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Generated {stamp(snapshot.generatedAt)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ overflowWrap: 'anywhere' }}
              >
                Snapshot reference:{' '}
                <span data-testid="snapshot-reference">{snapshot.id}</span>
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            Source timezone: {snapshot.timezone.value} ·{' '}
            {snapshot.timezone.certainty.replace(/_/g, ' ')}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {data.freshness.stale ? 'Stale snapshot · ' : ''}
          {window.coverage.importedDays} of {window.coverage.expectedDays} dates
          have saved BigQuery imports. Unknown values are not zero.
        </Typography>
        <Box component="details" sx={{ mt: 1.5 }}>
          <Typography
            component="summary"
            variant="caption"
            color="text.secondary"
            sx={{ cursor: 'pointer' }}
          >
            Snapshot details
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Generated {stamp(snapshot.generatedAt)}. Snapshot {snapshot.id}.
            Source timezone: {snapshot.timezone.value} ·{' '}
            {snapshot.timezone.certainty}.{snapshot.featureVersion} · schema{' '}
            {snapshot.schemaVersion}. Selected period: {stamp(window.from)} —{' '}
            {stamp(window.to)} (exclusive cutoff).{' '}
            {window.coverage.preliminaryDays} dates are preliminary. Action
            hours are not verified local timing or contact permission. Recorded
            actions, exported engagement and attention are different
            measurements.
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: { xs: 'flex', lg: 'grid' },
          flexDirection: 'column',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.65fr) minmax(0, 1fr)',
          },
          gap: 2,
          alignItems: { xs: 'stretch', lg: 'start' },
        }}
      >
        <Stack
          useFlexGap
          spacing={2}
          sx={{ minWidth: 0, display: { xs: 'contents', lg: 'flex' } }}
        >
          <Box
            component="section"
            sx={{
              p: { xs: 0, lg: 2.5 },
              bgcolor: { xs: 'transparent', lg: 'background.paper' },
              border: { xs: 0, lg: '1px solid' },
              borderColor: { xs: 'transparent', lg: 'divider' },
              borderRadius: '12px',
              order: { xs: 1, lg: 0 },
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ mb: 2, display: { xs: 'none', lg: 'block' } }}
            >
              Selected {data.selectedDays}-day activity
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2,minmax(0,1fr))',
                  md: 'repeat(4,minmax(0,1fr))',
                },
                gap: 1.5,
              }}
            >
              {[
                {
                  title: 'Recorded actions',
                  value: window.observedActions,
                  testId: 'observed-actions',
                  Icon: FileText,
                },
                {
                  title: 'Observed action dates',
                  Icon: CalendarDays,
                  value: window.observedActionDays,
                  testId: undefined,
                },
                {
                  title: 'Verified meaningful days',
                  Icon: CalendarCheck,
                  value: window.meaningfulActiveDays,
                  testId: undefined,
                },
                {
                  title: 'Observed sessions',
                  Icon: Users,
                  value: window.sessions,
                  testId: undefined,
                },
              ].map(({ title, value, testId, Icon }) => (
                <Box
                  key={title}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '8px',
                    p: 1.5,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ minHeight: 36 }}
                  >
                    {title}
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Typography
                      data-testid={testId}
                      variant="h5"
                      fontWeight={700}
                      sx={{ overflowWrap: 'anywhere' }}
                    >
                      {number(value)}
                    </Typography>
                    <Icon
                      size={18}
                      aria-hidden="true"
                      style={{ flexShrink: 0, color: '#a6adb8' }}
                    />
                  </Stack>
                </Box>
              ))}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 1.5, display: { xs: 'none', lg: 'block' } }}
            >
              Canonical recorded events, not attention.
            </Typography>
            <Box component="details" sx={{ mt: 1 }}>
              <Typography
                component="summary"
                variant="caption"
                color="text.secondary"
                sx={{ cursor: 'pointer' }}
              >
                Activity sources and comparison
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Canonical recorded events, not attention. Action source:{' '}
                {window.actionSource}. Counts from canonical analytics and
                Firebase mirrors are never added together. Meaningful days
                require foreground plus a qualifying product action; sessions
                require instrumented session references. Coverage may be
                partial. Comparable prior {data.selectedDays}
                -day window: {stamp(data.comparison.from)} —{' '}
                {stamp(data.comparison.to)};{' '}
                {number(data.comparison.observedActions)} recorded actions,{' '}
                {data.comparison.coverage.status} coverage. No uplift or
                lifecycle diagnosis is inferred.
              </Typography>
            </Box>
          </Box>
          <Paper
            component="section"
            sx={{ ...surface, order: { xs: 3, lg: 0 } }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Daily recorded activity
            </Typography>
            <Stack spacing={1.5}>
              {window.daily.map((day) => (
                <Stack
                  key={day.day}
                  direction="row"
                  gap={1.5}
                  alignItems="center"
                  sx={{ minWidth: 0 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ width: { xs: 100, md: 140 }, flexShrink: 0 }}
                  >
                    {new Date(`${day.day}T00:00:00Z`).toLocaleDateString(
                      'en-GB',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        timeZone: 'UTC',
                      }
                    )}
                  </Typography>
                  {day.observedActions === null ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ flex: 1 }}
                    >
                      No covered observation
                    </Typography>
                  ) : (
                    <Box
                      role="meter"
                      aria-label={`${day.day} recorded actions`}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(1, window.peakDailyActions)}
                      aria-valuenow={day.observedActions}
                      sx={{
                        flex: 1,
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'action.hover',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(day.observedActions / Math.max(1, window.peakDailyActions)) * 100}%`,
                          height: '100%',
                          bgcolor: 'primary.main',
                          borderRadius: 5,
                        }}
                      />
                    </Box>
                  )}
                  {day.observedActions !== null ? (
                    <Typography
                      variant="caption"
                      sx={{ width: 54, textAlign: 'right', flexShrink: 0 }}
                    >
                      {number(day.observedActions)}
                    </Typography>
                  ) : null}
                </Stack>
              ))}
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 2 }}
            >
              Gaps mean unknown coverage. Zero means no matching recorded action
              on an available source date.
            </Typography>
          </Paper>
        </Stack>
        <Stack
          useFlexGap
          spacing={2}
          sx={{ minWidth: 0, display: { xs: 'contents', lg: 'flex' } }}
        >
          <Paper
            component="section"
            sx={{ ...surface, order: { xs: 2, lg: 0 } }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ mb: 1, display: { xs: 'none', lg: 'block' } }}
            >
              Current state captured with this snapshot
            </Typography>
            {[
              [
                'Product access',
                current.access.authorization === 'FULL_ACCESS'
                  ? 'Full Access'
                  : current.access.authorization.replace(/_/g, ' '),
              ],
              [
                'Pending commerce',
                current.pendingCommerce
                  ? 'Pending / uncertain'
                  : 'None recorded',
              ],
              ['Saved picks', number(current.savedPicks)],
              ['Locale', snapshot.locale ?? 'Unknown'],
            ].map(([name, value], index) => (
              <Stack
                key={name}
                direction="row"
                gap={2}
                justifyContent="space-between"
                sx={{
                  py: 1.5,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: { xs: index === 0 ? 'flex' : 'none', lg: 'flex' },
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {name}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    textAlign: 'right',
                    overflowWrap: 'anywhere',
                    minWidth: 0,
                  }}
                >
                  {value}
                </Typography>
              </Stack>
            ))}
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 1.5, display: { xs: 'none', lg: 'block' } }}
            >
              Captured {stamp(current.capturedAt)}. As captured, not a live
              permission check.
            </Typography>
            <Box
              component="details"
              sx={{ display: { xs: 'block', lg: 'none' }, mt: 1 }}
            >
              <Typography
                component="summary"
                variant="caption"
                color="text.secondary"
                sx={{ cursor: 'pointer' }}
              >
                Captured with this snapshot
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Captured {stamp(current.capturedAt)}. Pending commerce:{' '}
                {current.pendingCommerce
                  ? 'Pending / uncertain'
                  : 'None recorded'}{' '}
                · Saved picks: {number(current.savedPicks)} · Locale:{' '}
                {snapshot.locale ?? 'Unknown'}. As captured, not a live
                permission check.
              </Typography>
            </Box>
          </Paper>
          <Paper
            component="section"
            sx={{ ...surface, order: { xs: 4, lg: 0 } }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
              Explicit favorites
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
              {current.favorites.length ? (
                current.favorites.map((item) => (
                  <Chip
                    key={item.id}
                    size="small"
                    label={`${item.name} · ${item.kind}`}
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No current explicit favorites.
                </Typography>
              )}
            </Stack>
          </Paper>
          <Paper
            component="section"
            sx={{ ...surface, order: { xs: 5, lg: 0 } }}
          >
            <Box component="details" sx={{ '&[open] > summary': { mb: 2 } }}>
              <Box
                component="summary"
                sx={{
                  cursor: 'pointer',
                  '&::marker': { color: 'text.secondary' },
                }}
              >
                <Typography component="span" variant="h6" fontWeight={700}>
                  Content interactions
                </Typography>
                <Stack
                  direction="row"
                  gap={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 1 }}
                >
                  {Object.entries(
                    snapshot.observedInterests.reduce<Record<string, number>>(
                      (groups, item) => {
                        const kind = contentKind(item.reference);
                        groups[kind] = (groups[kind] ?? 0) + 1;
                        return groups;
                      },
                      {}
                    )
                  ).map(([kind, count]) => (
                    <Chip
                      key={kind}
                      size="small"
                      variant="outlined"
                      label={`${kind}: ${count}`}
                    />
                  ))}
                  {!snapshot.observedInterests.length ? (
                    <Typography variant="body2" color="text.secondary">
                      No content interactions recorded
                    </Typography>
                  ) : null}
                </Stack>
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  Up to 20 most active content items · snapshot history
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Recorded events linked to each item, such as opens, clicks and
                saves. These are not unique views or explicit preferences.
                Content names are unavailable in this snapshot.
              </Typography>
              <Stack
                spacing={1.5}
                sx={{ maxHeight: 360, overflowY: 'auto', pr: 1 }}
              >
                {snapshot.observedInterests.map((item) => (
                  <Box
                    key={item.reference}
                    sx={{ borderBottom: 1, borderColor: 'divider', pb: 1.5 }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        title={item.reference}
                      >
                        {contentKind(item.reference).replace(/s$/, '')}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {item.reference.slice(
                            item.reference.indexOf(':') + 1,
                            item.reference.indexOf(':') + 9
                          )}
                        </Typography>
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                        {number(item.actions)} events
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Last interaction {stamp(item.lastAt)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

function contentKind(reference: string) {
  const key = reference.split(':')[0];
  return (
    (
      {
        predictionId: 'Predictions',
        collectionId: 'Collections',
        teamId: 'Teams',
        leagueId: 'Leagues',
      } as Record<string, string>
    )[key] ?? 'Other content'
  );
}
