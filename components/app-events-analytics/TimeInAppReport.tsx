'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  addEngagementExclusion,
  EngagementAccount,
  EngagementExclusion,
  EngagementReport,
  getEngagementReport,
  removeEngagementExclusion,
  syncEngagement,
} from '@/lib/api/user-engagement';

/** Formats elapsed engagement with minutes and seconds, including values over an hour. */
export function formatEngagement(ms: number | null): string {
  if (ms === null) return 'No data';
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
}

/** Shows UTC day totals, account details, and reversible shared exclusions. */
export function TimeInAppReport({ userId }: { userId?: string }) {
  const [to, setTo] = useState(() =>
    new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  );
  const [from, setFrom] = useState(() =>
    new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10)
  );
  const [includeExcluded, setIncludeExcluded] = useState(false);
  const [data, setData] = useState<EngagementReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [day, setDay] = useState(to);
  const [page, setPage] = useState(0);
  const [account, setAccount] = useState<EngagementAccount | null>(null);
  const [settings, setSettings] = useState(false);
  const [kind, setKind] = useState<EngagementExclusion['kind']>('email');
  const [value, setValue] = useState('');
  const revision = useRef(0);
  const mounted = useRef(true);
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(from) &&
    /^\d{4}-\d{2}-\d{2}$/.test(to) &&
    from <= to &&
    Date.parse(to) - Date.parse(from) < 90 * 86_400_000;

  const load = useCallback(async () => {
    const id = ++revision.current;
    setLoading(true);
    setError(null);
    setData(null);
    setAccount(null);
    setPage(0);
    if (!valid) {
      setError('Choose a valid range of up to 90 days.');
      setLoading(false);
      return;
    }
    try {
      const result = await getEngagementReport({
        from,
        to,
        includeExcluded,
        userId,
      });
      if (!mounted.current || revision.current !== id) return;
      setData(result);
      setDay((current) =>
        result.days.some((d) => d.day === current) ? current : to
      );
    } catch (e) {
      if (mounted.current && revision.current === id)
        setError(
          e instanceof Error ? e.message : 'Could not load time in app.'
        );
    } finally {
      if (mounted.current && revision.current === id) setLoading(false);
    }
  }, [from, to, includeExcluded, userId, valid]);
  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  /** Applies one explicit admin action, then reloads the projection using saved exclusions. */
  async function mutate(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      setValue('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }
  const rows = data?.users.filter((u) => u.day === day) ?? [];
  const selected = data?.days.find((d) => d.day === day);
  const stamp = data?.days
    .map((d) => d.syncedAt)
    .filter((v): v is string => !!v)
    .sort()
    .at(-1);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminPageHeader
        title="Time in app"
        subtitle="Firebase / BigQuery · identified active accounts"
      />
      <Stack spacing={3} sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 3 }}>
        <Alert severity="info">
          UTC reporting days. Firebase engagement is summed across
          installations; simultaneous device use is not deduplicated. Reading
          time may include an app left open. Known simulator hardware is always
          omitted.
        </Alert>
        <Paper sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            flexWrap="wrap"
            useFlexGap
          >
            <TextField
              label="From (UTC)"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled={busy}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="To (UTC)"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={busy}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeExcluded}
                  disabled={busy}
                  onChange={(e) => setIncludeExcluded(e.target.checked)}
                />
              }
              label="Include manual exclusions"
            />
            <Button
              variant="outlined"
              onClick={() => setSettings(true)}
              disabled={busy}
            >
              Exclusions
            </Button>
            <Button
              variant="outlined"
              onClick={() => void load()}
              disabled={busy || loading}
            >
              Refresh view
            </Button>
            <Button
              variant="contained"
              disabled={busy || loading || !valid || !data?.configured}
              onClick={() =>
                void mutate(async () => {
                  const result = await syncEngagement(from, to);
                  if (result.busy)
                    throw new Error(
                      'An import is already running. Refresh the view shortly.'
                    );
                  if (!result.importedDays)
                    throw new Error(
                      'No exported days are available in this range yet.'
                    );
                }, 'BigQuery import completed.')
              }
            >
              {busy ? 'Working…' : 'Import from BigQuery'}
            </Button>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 1 }}
          >
            Daily export · latest successful import:{' '}
            {stamp
              ? new Date(stamp).toLocaleString('en-GB', { timeZone: 'UTC' }) +
                ' UTC'
              : 'Not imported yet'}
            . Recent days can change as late events arrive.
          </Typography>
        </Paper>
        {userId && (
          <Alert
            severity="info"
            action={
              <Button
                component={Link}
                href="/dashboard/app-events-analytics?tab=time"
              >
                All users
              </Button>
            }
          >
            User detail is scoped to the selected account. Daily totals still
            cover all eligible accounts.
          </Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {notice && <Alert severity="success">{notice}</Alert>}
        {loading && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <CircularProgress aria-label="Loading engagement" />
          </Box>
        )}
        {data && (
          <>
            {!data.configured && (
              <Alert severity="warning">
                Source imports are disabled. Existing imported history remains
                available; an operator must configure the backend before
                importing.
              </Alert>
            )}
            <Paper>
              <Typography variant="h6" sx={{ p: 2 }}>
                Daily engagement
              </Typography>
              <TableContainer>
                <Table
                  size="small"
                  aria-label="Daily engagement"
                  sx={{ minWidth: 1000 }}
                >
                  <TableHead>
                    <TableRow>
                      {[
                        'Day (UTC)',
                        'Active accounts',
                        'Total time',
                        'Average / account',
                        'Anonymous time',
                        'Unknown account time',
                        'Excluded time',
                        'Data status',
                      ].map((label) => (
                        <TableCell key={label}>{label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.days.map((d) => (
                      <TableRow key={d.day} hover selected={day === d.day}>
                        <TableCell>
                          <Button
                            size="small"
                            sx={{ whiteSpace: 'nowrap' }}
                            onClick={() => {
                              setDay(d.day);
                              setPage(0);
                            }}
                          >
                            {d.day}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {d.status === 'missing' ? '—' : d.activeUsers}
                        </TableCell>
                        <TableCell>
                          {d.status === 'missing'
                            ? 'No data'
                            : formatEngagement(d.totalEngagementMs)}
                        </TableCell>
                        <TableCell>
                          {formatEngagement(d.averageEngagementMs)}
                        </TableCell>
                        <TableCell>
                          {d.status === 'missing'
                            ? '—'
                            : formatEngagement(d.anonymousEngagementMs)}
                        </TableCell>
                        <TableCell>
                          {d.status === 'missing'
                            ? '—'
                            : formatEngagement(d.unknownEngagementMs)}
                        </TableCell>
                        <TableCell>
                          {d.status === 'missing'
                            ? '—'
                            : formatEngagement(d.excludedEngagementMs)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              d.status === 'missing'
                                ? 'Not imported'
                                : d.status === 'preliminary'
                                  ? 'Preliminary'
                                  : 'Imported'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ p: 2, display: 'block' }}
              >
                Average = eligible identified accounts’ engagement ÷ eligible
                active accounts. Anonymous and unknown-account time are shown
                separately. Excluded time is{' '}
                {includeExcluded ? 'included in' : 'removed from'} the figures.
              </Typography>
            </Paper>
            <Paper>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ p: 2 }}
                justifyContent="space-between"
              >
                <Typography variant="h6">Users · {day}</Typography>
                <TextField
                  select
                  size="small"
                  label="Selected day"
                  value={day}
                  onChange={(e) => {
                    setDay(e.target.value);
                    setPage(0);
                  }}
                >
                  {data.days.map((d) => (
                    <MenuItem key={d.day} value={d.day}>
                      {d.day}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <TableContainer>
                <Table size="small" aria-label="User engagement">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Installations</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.slice(page * 20, page * 20 + 20).map((u) => (
                      <TableRow key={u.userId}>
                        <TableCell>
                          <Typography variant="body2">
                            {u.name || 'Unnamed user'}
                          </Typography>
                          <Typography variant="caption">
                            {u.email || 'No email'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {formatEngagement(u.engagementMs)}
                        </TableCell>
                        <TableCell>{u.installations.length}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => setAccount(u)}>
                            View installations
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!rows.length && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          {selected?.status === 'missing'
                            ? 'No imported data for this day.'
                            : 'No eligible active accounts for this day and selection.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={rows.length}
                page={page}
                rowsPerPage={20}
                rowsPerPageOptions={[20]}
                onPageChange={(_, p) => setPage(p)}
              />
            </Paper>
          </>
        )}
      </Stack>
      <Dialog
        open={!!account}
        onClose={() => setAccount(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Installations · {account?.name || account?.email || 'User'} ·{' '}
          {account?.day}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {account?.email && (
              <Button
                variant="outlined"
                disabled={busy}
                onClick={() =>
                  void mutate(
                    () => addEngagementExclusion('email', account.email!),
                    'Account excluded from the report.'
                  )
                }
              >
                Exclude account by email
              </Button>
            )}
            {account?.installations.map((i, index) => (
              <Paper
                variant="outlined"
                sx={{ p: 2 }}
                key={`${i.installationId}-${index}`}
              >
                <Typography>
                  {i.platform} · {i.hardware || 'Unknown hardware'} ·{' '}
                  {formatEngagement(i.engagementMs)}
                </Typography>
                <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>
                  {i.installationId}
                </Typography>
                <Box>
                  <Button
                    disabled={busy || i.installationId === '[unavailable]'}
                    onClick={() =>
                      void mutate(
                        () =>
                          addEngagementExclusion(
                            'installation',
                            i.installationId
                          ),
                        'Installation excluded from the report.'
                      )
                    }
                  >
                    Exclude installation
                  </Button>
                </Box>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccount(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={settings}
        onClose={() => !busy && setSettings(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Analytics exclusions</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {notice && <Alert severity="success">{notice}</Alert>}
            <Alert severity="info">
              Known simulator hardware is always omitted and cannot be restored.
              Email exclusions cover all installations of the matched account,
              including its legacy ID. These rules affect this time report,
              including imported history.
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                select
                label="Exclude by"
                value={kind}
                disabled={busy}
                sx={{ minWidth: { sm: 180 }, flexShrink: 0 }}
                onChange={(e) =>
                  setKind(e.target.value as EngagementExclusion['kind'])
                }
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="installation">Installation ID</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label={kind === 'email' ? 'Account email' : 'Installation ID'}
                value={value}
                disabled={busy}
                onChange={(e) => setValue(e.target.value)}
              />
              <Button
                sx={{ minWidth: { sm: 140 }, flexShrink: 0 }}
                disabled={busy || !value.trim()}
                onClick={() =>
                  void mutate(
                    () => addEngagementExclusion(kind, value),
                    'Exclusion saved.'
                  )
                }
              >
                Add exclusion
              </Button>
            </Stack>
            {data?.exclusions.map((e) => (
              <Stack
                key={e.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Typography sx={{ overflowWrap: 'anywhere' }}>
                  {e.kind}: {e.value}
                </Typography>
                <Button
                  disabled={busy}
                  onClick={() =>
                    void mutate(
                      () => removeEngagementExclusion(e.id),
                      'Exclusion removed.'
                    )
                  }
                >
                  Remove
                </Button>
              </Stack>
            ))}
            {!data?.exclusions.length && (
              <Typography color="text.secondary">
                No manual exclusions.
              </Typography>
            )}
            <Typography variant="subtitle2">
              Installations in the selected range
            </Typography>
            <Typography variant="caption">
              Includes unidentified accounts so test installations can be
              excluded without an email.
            </Typography>
            {data?.installations.map((i, index) => (
              <Paper
                key={`${i.installationId}-${index}`}
                variant="outlined"
                sx={{ p: 1.5 }}
              >
                <Typography variant="body2">
                  {i.platform} · {i.hardware || 'Unknown hardware'} ·{' '}
                  {formatEngagement(i.engagementMs)}
                </Typography>
                <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>
                  {i.installationId}
                </Typography>
                <Button
                  size="small"
                  disabled={busy || i.installationId === '[unavailable]'}
                  onClick={() =>
                    void mutate(
                      () =>
                        addEngagementExclusion(
                          'installation',
                          i.installationId
                        ),
                      'Installation excluded from the report.'
                    )
                  }
                >
                  Exclude
                </Button>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setSettings(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
