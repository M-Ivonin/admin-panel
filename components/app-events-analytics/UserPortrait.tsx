'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import type {
  PortraitActivity,
  PortraitTimelineFact,
  PortraitWindow,
} from '@/lib/api/user-portrait';
import { useUserPortrait } from './useUserPortrait';
import { PortraitDecisionHistory } from './PortraitDecisionHistory';

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
const label = (value: string) => value.replace(/_/g, ' ');

/** Renders the server's versioned features; selection never recomputes a behavioral metric. */
export function UserPortrait({ userId }: { userId: string }) {
  const [days, setDays] = useState<7 | 30>(7),
    [snapshotId, setSnapshotId] = useState<string>(),
    [offset, setOffset] = useState(0);
  const { data, loading, error, refresh } = useUserPortrait(
    userId,
    days,
    snapshotId,
    offset
  );
  const ready = data?.status === 'ready' ? data : null;
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminPageHeader
        title="User portrait"
        subtitle="Recorded behavior · shared factual snapshot"
        backHref="/dashboard/users"
        backLabel="Users"
      />
      <Stack
        spacing={3}
        sx={{
          maxWidth: 1440,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: 3,
          minWidth: 0,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            gap={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            flexWrap="wrap"
            useFlexGap
          >
            <ToggleButtonGroup
              size="small"
              exclusive
              value={days}
              aria-label="Portrait period"
              onChange={(_, value: 7 | 30 | null) => {
                if (value) {
                  setDays(value);
                  setOffset(0);
                }
              }}
            >
              <ToggleButton value={7}>Last 7 days</ToggleButton>
              <ToggleButton value={30}>Last 30 days</ToggleButton>
            </ToggleButtonGroup>
            <TextField
              select
              size="small"
              label="Snapshot"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ displayEmpty: true }}
              value={snapshotId ?? ''}
              onChange={(e) => {
                setSnapshotId(e.target.value || undefined);
                setOffset(0);
              }}
              sx={{ minWidth: { xs: 0, sm: 260 } }}
            >
              <MenuItem value="">Latest saved snapshot</MenuItem>
              {snapshotId &&
              !ready?.history.some((item) => item.id === snapshotId) ? (
                <MenuItem value={snapshotId}>Selected saved snapshot</MenuItem>
              ) : null}
              {ready?.history.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {stamp(item.asOf)}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              disabled={loading}
              onClick={() => void refresh()}
            >
              Refresh view
            </Button>
            <Button
              component={Link}
              href={`/dashboard/time-in-app?userId=${encodeURIComponent(userId)}`}
            >
              Time in app
            </Button>
            <Button
              component={Link}
              href={`/dashboard/bot-chat?userId=${encodeURIComponent(userId)}`}
            >
              Chat
            </Button>
          </Stack>
        </Paper>
        {loading ? (
          <Box role="status" sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={28} />
            <Typography sx={{ mt: 2 }}>Loading saved portrait…</Typography>
          </Box>
        ) : null}
        {error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void refresh()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}
        {data?.status === 'not_ready' ? (
          <Alert severity="info">
            No saved portrait is available yet. Scheduled reconciliation builds
            snapshots; opening this page does not start an import or analysis.
          </Alert>
        ) : null}
        {data?.status === 'restricted' ? (
          <Alert severity="warning">
            Portrait processing is restricted following a verified support
            request. Derived snapshots and timeline are unavailable.
          </Alert>
        ) : null}
        {ready ? (
          <>
            <Paper sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                alignItems="center"
              >
                <Chip
                  label={snapshotId ? 'Historical snapshot' : 'Latest snapshot'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={ready.selectedWindow.coverage.status + ' coverage'}
                  size="small"
                  color="warning"
                />
                {ready.freshness.stale ? (
                  <Chip label="Stale snapshot" size="small" color="warning" />
                ) : null}
              </Stack>
              <Typography sx={{ mt: 1.5 }} fontWeight={700}>
                Facts as of {stamp(ready.snapshot.asOf)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generated {stamp(ready.snapshot.generatedAt)} ·{' '}
                {ready.snapshot.featureVersion} · schema{' '}
                {ready.snapshot.schemaVersion}
              </Typography>
              <Typography
                variant="caption"
                component="div"
                sx={{ mt: 1, overflowWrap: 'anywhere' }}
              >
                Snapshot reference:{' '}
                <span data-testid="snapshot-reference">
                  {ready.snapshot.id}
                </span>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected period: {stamp(ready.selectedWindow.from)} —{' '}
                {stamp(ready.selectedWindow.to)} (exclusive cutoff).
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Action hours use {ready.snapshot.timezone.value} (
                {label(ready.snapshot.timezone.certainty)}). This is not
                verified local timing or contact permission.
              </Typography>
            </Paper>
            <Alert severity="info">
              {ready.selectedWindow.coverage.importedDays} of{' '}
              {ready.selectedWindow.coverage.expectedDays} dates have saved
              BigQuery imports; {ready.selectedWindow.coverage.preliminaryDays}{' '}
              are preliminary. Unknown values are not zero. Recorded actions,
              exported engagement and attention are different measurements.
            </Alert>
            <Section
              title={`Selected ${days}-day activity`}
              subtitle={`Action source: ${ready.selectedWindow.actionSource}. Counts from canonical analytics and Firebase mirrors are never added together.`}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' },
                  gap: 2,
                }}
              >
                <Metric
                  title="Recorded actions"
                  value={number(ready.selectedWindow.observedActions)}
                  testId="observed-actions"
                />
                <Metric
                  title="Observed action dates"
                  value={number(ready.selectedWindow.observedActionDays)}
                />
                <Metric
                  title="Verified meaningful days"
                  value={number(ready.selectedWindow.meaningfulActiveDays)}
                  detail="Foreground plus qualifying product action; partial coverage."
                />
                <Metric
                  title="Observed sessions"
                  value={number(ready.selectedWindow.sessions)}
                  detail="Only instrumented session references; partial coverage."
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Comparable prior {days}-day window:{' '}
                {stamp(ready.comparison.from)} — {stamp(ready.comparison.to)};{' '}
                {number(ready.comparison.observedActions)} recorded actions,{' '}
                {ready.comparison.coverage.status} coverage. No uplift or
                lifecycle diagnosis is inferred.
              </Typography>
            </Section>
            <Section
              title="Daily recorded activity"
              subtitle="Gaps mean unknown coverage. Zero means no matching recorded action on an available source date."
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2,minmax(0,1fr))',
                  },
                  gap: 1.25,
                }}
              >
                {ready.selectedWindow.daily.map((day) => (
                  <Stack
                    key={day.day}
                    direction="row"
                    gap={1.5}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ width: 78, flexShrink: 0 }}
                    >
                      {day.day}
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
                        component="meter"
                        min={0}
                        max={ready.selectedWindow.peakDailyActions}
                        value={day.observedActions}
                        aria-label={`${day.day} recorded actions`}
                        sx={{ width: '100%', height: 16, flex: 1 }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{ width: 58, textAlign: 'right' }}
                    >
                      {number(day.observedActions)}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            </Section>
            <Section
              title="Weekday × hour of actions"
              subtitle={`${ready.snapshot.timezone.value} at this snapshot. This is not habitual entry time; unknown cells remain grey.`}
            >
              <Heatmap value={ready.selectedWindow} />
            </Section>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                gap: 3,
                minWidth: 0,
              }}
            >
              <Section title="Frequent instrumented actions">
                <ActivityTable rows={ready.selectedWindow.actions} />
              </Section>
              <Section
                title="Instrumented screens"
                subtitle={`Screen source: ${ready.selectedWindow.screenSource}. No claim of complete screen or button coverage.`}
              >
                <ActivityTable rows={ready.selectedWindow.screens} />
              </Section>
            </Box>
            <Section
              title="Product functions and checkout"
              subtitle="Canonical recorded events in the selected period; attempts are not payments."
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' },
                  gap: 2,
                }}
              >
                {Object.entries(ready.selectedWindow.functions).map(
                  ([key, value]) => (
                    <Metric
                      key={key}
                      title={functionLabels[key] ?? label(key)}
                      value={number(value)}
                    />
                  )
                )}
              </Box>
            </Section>
            <Section
              title="Chat activity"
              subtitle="Request statuses use request creation time; completion timestamps and failed public/private send attempts are not recorded. No conversation content is included."
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3,1fr)' },
                  gap: 2,
                }}
              >
                {Object.entries(ready.selectedWindow.chats).map(
                  ([key, value]) => (
                    <Metric
                      key={key}
                      title={chatLabels[key] ?? key}
                      value={number(value)}
                    />
                  )
                )}
              </Box>
            </Section>
            <Section
              title="Related checkout attempts"
              subtitle="Only the same recorded attempt ID joins events. Unrelated paywalls and purchases are not stitched into a funnel."
            >
              {ready.selectedWindow.attempts.length ? (
                <Stack spacing={2}>
                  {ready.selectedWindow.attempts.map((attempt) => (
                    <Box
                      key={attempt.attemptId}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        p: 1.5,
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        Attempt {attempt.attemptId}
                      </Typography>
                      {attempt.events.map((event, i) => (
                        <Typography
                          key={i}
                          variant="body2"
                          color="text.secondary"
                        >
                          {label(event.name)} · {stamp(event.at)}
                        </Typography>
                      ))}
                      <Typography variant="caption">
                        Verified ledger references:{' '}
                        {attempt.ledgerIds.length
                          ? attempt.ledgerIds.join(', ')
                          : 'Not linked'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No correlated attempts recorded in this window. Missing flow
                  history remains unknown.
                </Typography>
              )}
            </Section>
            <Section
              title="Recorded use within verified paid windows"
              subtitle="A qualifying instrumented action must report paid access and occur within the server-started entitlement window. An unobserved action is not proof of non-use."
            >
              {ready.selectedWindow.paidUse.length ? (
                <Stack spacing={1.5}>
                  {ready.selectedWindow.paidUse.map((use, i) => (
                    <Box key={`${use.entitlementId}-${i}`}>
                      <Typography fontWeight={600}>
                        {label(use.productKey)}
                      </Typography>
                      <Typography variant="body2">
                        {stamp(use.startsAt)} — {stamp(use.expiresAt)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        First recorded useful paid action:{' '}
                        {use.firstRecordedUseAt
                          ? stamp(use.firstRecordedUseAt)
                          : 'Not observed in available coverage'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No verified paid window recorded in this period.
                </Typography>
              )}
            </Section>
            <Section
              title="Current state captured with this snapshot"
              subtitle={`Captured ${stamp(ready.snapshot.current.capturedAt)}. This state is separate from the selected historical activity period.`}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' },
                  gap: 2,
                }}
              >
                <Metric
                  title="Authoritative access"
                  value={label(ready.snapshot.current.access.authorization)}
                  detail={label(ready.snapshot.current.access.accessSource)}
                />
                <Metric
                  title="Pending commerce"
                  value={
                    ready.snapshot.current.pendingCommerce
                      ? 'Pending / uncertain'
                      : 'None recorded'
                  }
                />
                <Metric
                  title="Current saved picks"
                  value={number(ready.snapshot.current.savedPicks)}
                />
                <Metric
                  title="Locale / geo"
                  value={ready.snapshot.locale ?? 'Unknown'}
                  detail={
                    ready.snapshot.geo.country
                      ? `${ready.snapshot.geo.country} · ${ready.snapshot.geo.source ?? 'source unknown'}; not Store territory`
                      : 'Geo unknown; storefront not established'
                  }
                />
              </Box>
              {ready.snapshot.current.access.primaryEntitlement ? (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Current entitlement:{' '}
                  {label(
                    ready.snapshot.current.access.primaryEntitlement.productKey
                  )}{' '}
                  · paid through{' '}
                  {stamp(
                    ready.snapshot.current.access.primaryEntitlement.expiresAt
                  )}{' '}
                  · renewal{' '}
                  {ready.snapshot.current.access.primaryEntitlement.autoRenewing
                    ? 'on'
                    : 'off'}
                  . Access is determined by the commerce owner.
                </Typography>
              ) : null}
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                Explicit favorites
              </Typography>
              <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                {ready.snapshot.current.favorites.length ? (
                  ready.snapshot.current.favorites.map((item) => (
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
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                Observed platforms and builds
              </Typography>
              {ready.snapshot.platforms.length ? (
                <Stack spacing={0.5}>
                  {ready.snapshot.platforms.map((platform, i) => (
                    <Typography key={i} variant="body2">
                      {platform.platform} · version{' '}
                      {platform.version ?? 'unknown'} · build{' '}
                      {platform.build ?? 'unknown'} · {platform.source} ·{' '}
                      {platform.observations} records · last{' '}
                      {stamp(platform.lastAt)}
                    </Typography>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Platform/build coverage not recorded.
                </Typography>
              )}
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                Observed content use
              </Typography>
              {ready.snapshot.observedInterests.length ? (
                <Stack spacing={1}>
                  {ready.snapshot.observedInterests.map((item) => (
                    <Box key={item.reference}>
                      <Typography variant="body2">
                        {label(item.reference.split(':')[0])}:{' '}
                        {number(item.actions)} recorded actions · last{' '}
                        {stamp(item.lastAt)}
                      </Typography>
                      <Box component="details">
                        <Typography component="summary" variant="caption">
                          Evidence reference
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ overflowWrap: 'anywhere' }}
                        >
                          {item.reference}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No supported content-interest references. Explicit choices are
                  not inferred from geo or inactivity.
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Return progress: first recorded action{' '}
                {stamp(ready.snapshot.returnProgress.firstObservedAt)}, latest{' '}
                {stamp(ready.snapshot.returnProgress.lastObservedAt)}. Observed
                dates are retained independently of lifecycle labels; missing
                activity does not establish dissatisfaction.
              </Typography>
            </Section>
            <Section
              title="Safe event, contact and commerce timeline"
              subtitle={`${ready.timeline.total} retained source facts in the selected window. Delivery rows are not all direct contacts or proof of an impression. Ledger amounts are historical verified transactions, not eligible Store quotes.`}
            >
              <Stack spacing={1.5}>
                {ready.timeline.items.length ? (
                  ready.timeline.items.map((event, i) => (
                    <TimelineRow
                      key={`${event.source}-${event.key}-${i}`}
                      event={event}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No timeline facts recorded in this window.
                  </Typography>
                )}
              </Stack>
              <Stack
                direction="row"
                gap={2}
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Button
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - 50))}
                >
                  Previous events
                </Button>
                <Typography variant="caption">
                  Offset {ready.timeline.offset} · page size 50
                </Typography>
                <Button
                  disabled={ready.timeline.nextOffset === null}
                  onClick={() => {
                    if (ready.timeline.nextOffset !== null)
                      setOffset(ready.timeline.nextOffset);
                  }}
                >
                  Next events
                </Button>
              </Stack>
            </Section>
            <Section title="Decisions and no-action history">
              <PortraitDecisionHistory
                userId={userId}
                viewedSnapshotId={ready.snapshot.id}
              />
            </Section>
            <Section
              title="Source quality and cutoffs"
              subtitle="These watermarks belong to the exact snapshot above. Missing receipt/ingestion times are not replaced by occurrence time."
            >
              <TableContainer>
                <Table size="small" sx={{ minWidth: 680 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell>Records</TableCell>
                      <TableCell>Latest occurrence</TableCell>
                      <TableCell>Latest receipt / import</TableCell>
                      <TableCell>Coverage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ready.snapshot.sourceWatermarks.map((source) => (
                      <TableRow key={source.source}>
                        <TableCell>{label(source.source)}</TableCell>
                        <TableCell>{source.records}</TableCell>
                        <TableCell>{stamp(source.occurredAt)}</TableCell>
                        <TableCell>{stamp(source.receivedAt)}</TableCell>
                        <TableCell>{source.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {ready.selectedWindow.coverage.notes.map((note) => (
                  <Typography key={note} variant="body2" color="text.secondary">
                    {note}
                  </Typography>
                ))}
                <Typography variant="body2" color="text.secondary">
                  {ready.freshness.fallback} Freshness target:{' '}
                  {ready.freshness.targetSeconds} seconds; measured age:{' '}
                  {ready.freshness.ageSeconds} seconds. A daily export cannot
                  guarantee a live session.
                </Typography>
              </Stack>
            </Section>
          </>
        ) : null}
      </Stack>
    </Box>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Paper component="section" sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: subtitle ? 0.75 : 2 }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      ) : null}
      {children}
    </Paper>
  );
}
function Metric({
  title,
  value,
  detail,
  testId,
}: {
  title: string;
  value: string;
  detail?: string;
  testId?: string;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Typography
        data-testid={testId}
        variant="h5"
        fontWeight={700}
        sx={{ overflowWrap: 'anywhere' }}
      >
        {value}
      </Typography>
      {detail ? (
        <Typography variant="caption" color="text.secondary" component="div">
          {detail}
        </Typography>
      ) : null}
    </Box>
  );
}
/** Keeps action and screen labels readable inside a locally scrolling table. */
function ActivityTable({ rows }: { rows: PortraitActivity[] }) {
  return rows.length ? (
    <Box>
      {rows.length > 20 ? (
        <Typography variant="caption">
          Top 20 of {rows.length} instrumented categories
        </Typography>
      ) : null}
      <TableContainer>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 140 }}>Name</TableCell>
              <TableCell>Count</TableCell>
              <TableCell>Dates / sessions</TableCell>
              <TableCell>Last</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(0, 20).map((row) => (
              <TableRow key={row.name}>
                <TableCell>{label(row.name)}</TableCell>
                <TableCell>{row.count}</TableCell>
                <TableCell>
                  {row.observedDays} / {number(row.sessions)}
                </TableCell>
                <TableCell>{stamp(row.lastAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  ) : (
    <Typography color="text.secondary">
      No instrumented observations available.
    </Typography>
  );
}
function Heatmap({ value }: { value: PortraitWindow }) {
  const opacity = [0, 0.2, 0.4, 0.65, 1];
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '42px repeat(24,minmax(18px,1fr))',
          gap: 0.5,
          minWidth: 560,
        }}
      >
        <Box />
        {Array.from({ length: 24 }, (_, hour) => (
          <Typography key={hour} variant="caption" align="center">
            {hour}
          </Typography>
        ))}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
          (day, weekday) => (
            <Box key={day} sx={{ display: 'contents' }}>
              <Typography variant="caption" alignSelf="center">
                {day}
              </Typography>
              {value.heatmap
                .filter((cell) => cell.weekday === weekday)
                .map((cell) => (
                  <Box
                    key={cell.hour}
                    role="img"
                    aria-label={`${day} ${cell.hour}:00: ${cell.count === null ? 'unknown' : `${cell.count} recorded actions`}`}
                    title={`${day} ${cell.hour}:00 · ${number(cell.count)}`}
                    sx={{
                      height: 24,
                      borderRadius: 0.5,
                      bgcolor:
                        cell.intensity === null
                          ? 'action.disabledBackground'
                          : 'primary.main',
                      opacity:
                        cell.intensity === null ? 1 : opacity[cell.intensity],
                      border: 1,
                      borderColor: 'divider',
                    }}
                  />
                ))}
            </Box>
          )
        )}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: 'block' }}
      >
        Grey: no covered observation · Color: recorded action intensity ·
        horizontal scroll on small screens
      </Typography>
    </Box>
  );
}
function TimelineRow({ event }: { event: PortraitTimelineFact }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 1.5 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={0.75}
        justifyContent="space-between"
      >
        <Typography variant="body2" fontWeight={600}>
          {label(event.name)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {stamp(event.at)} · {label(event.source)}
        </Typography>
      </Stack>
      {event.refs.grossAmount ? (
        <Typography variant="body2">
          Verified transaction gross: {event.refs.currency}{' '}
          {event.refs.grossAmount}
        </Typography>
      ) : null}
      <Box component="details">
        <Typography
          component="summary"
          variant="caption"
          sx={{ cursor: 'pointer', color: 'primary.main' }}
        >
          Source evidence
        </Typography>
        <Typography
          variant="caption"
          component="div"
          sx={{ overflowWrap: 'anywhere' }}
        >
          Source reference: {event.key}
        </Typography>
        <Typography variant="caption" component="div">
          Receipt: {stamp(event.ingestedAt)}
        </Typography>
        {Object.entries(event.refs).map(([key, value]) => (
          <Typography
            key={key}
            variant="caption"
            component="div"
            sx={{ overflowWrap: 'anywhere' }}
          >
            {label(key)}: {value}
          </Typography>
        ))}
        <Typography variant="caption">
          {[event.platform, event.version, event.build]
            .filter(Boolean)
            .join(' · ') || 'Build/platform context not recorded'}
        </Typography>
      </Box>
    </Box>
  );
}
const functionLabels: Record<string, string> = {
  analysis: 'Analysis opens',
  collections: 'Collection views',
  savedActions: 'Save actions',
  paywall: 'Paywall views',
  checkoutStarted: 'Checkout starts',
  checkoutCancelled: 'Checkout cancellations',
  checkoutFailed: 'Checkout failures',
  verifiedPayments: 'Verified payment records',
};
const chatLabels: Record<string, string> = {
  aiAttempts: 'AI request attempts',
  aiCompleted: 'AI completed requests',
  aiFailed: 'AI failed requests',
  aiCleared: 'AI cleared requests',
  privateMessages: 'Private user messages',
  publicMessages: 'Public user messages',
};
