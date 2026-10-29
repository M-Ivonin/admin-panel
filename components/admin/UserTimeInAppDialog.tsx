'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEngagementReport } from '@/components/app-events-analytics/useEngagementReport';
import { formatEngagement } from '@/components/app-events-analytics/TimeInAppReport';

/** Read-only imported engagement for one account, opened over the Users directory. */
export function UserTimeInAppDialog({
  user,
  onClose,
}: {
  user: { id: string; name: string; email: string | null };
  onClose: () => void;
}) {
  const [from, setFrom] = useState(() =>
    new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10)
  );
  const [to, setTo] = useState(() =>
    new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  );
  const { data, loading, error, refresh } = useEngagementReport({
    from,
    to,
    includeExcluded: false,
    userId: user.id,
  });
  // Report day totals and installation lists are global; use only this account's rows.
  const accounts =
    data?.users.filter((account) => account.userId === user.id) ?? [];

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="user-time-in-app-title"
      slotProps={{
        paper: {
          sx: {
            border: 1,
            borderColor: 'divider',
            borderRadius: '12px',
            backgroundImage: 'none',
            m: { xs: 1, sm: 4 },
            width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
          },
        },
      }}
    >
      <DialogTitle id="user-time-in-app-title">
        Time in app · {user.name}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {user.email && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ overflowWrap: 'anywhere' }}
            >
              {user.email}
            </Typography>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              label="From (UTC)"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              label="To (UTC)"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button
              variant="outlined"
              disabled={loading}
              onClick={() => void refresh()}
            >
              Refresh view
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Imported Firebase engagement · UTC days. Time across devices is
            summed. Simulator hardware and manual exclusions are omitted.
          </Typography>
          {loading && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CircularProgress aria-label="Loading user time in app" />
            </Box>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {data && (
            <>
              {!data.configured && (
                <Alert severity="warning">
                  Source imports are disabled. Showing available imported
                  history.
                </Alert>
              )}
              <TableContainer>
                <Table
                  size="small"
                  aria-label="Selected user time in app"
                  sx={{ minWidth: 620, tableLayout: 'fixed' }}
                >
                  <colgroup>
                    {[128, 180, 80, 232].map((width, index) => (
                      <col key={index} style={{ width }} />
                    ))}
                  </colgroup>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day (UTC)</TableCell>
                      <TableCell>Time in app</TableCell>
                      <TableCell>Devices</TableCell>
                      <TableCell>Data status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.days.map((day) => {
                      const account = accounts.find(
                        (entry) => entry.day === day.day
                      );
                      return (
                        <TableRow key={day.day}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {day.day}
                          </TableCell>
                          <TableCell>
                            {day.status === 'missing'
                              ? 'No imported data'
                              : account
                                ? formatEngagement(account.engagementMs)
                                : 'No included activity recorded'}
                          </TableCell>
                          <TableCell>
                            {day.status === 'missing'
                              ? '—'
                              : (account?.installations.length ?? 0)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {day.status === 'missing'
                                ? 'Not imported'
                                : day.status === 'preliminary'
                                  ? 'Preliminary'
                                  : 'Imported'}
                            </Typography>
                            {day.syncedAt && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(day.syncedAt).toLocaleString(
                                  'en-GB',
                                  { timeZone: 'UTC' }
                                )}{' '}
                                UTC
                              </Typography>
                            )}
                            {!!account?.installations.length && (
                              <Box component="details" sx={{ mt: 0.5 }}>
                                <Typography
                                  component="summary"
                                  variant="caption"
                                  sx={{ cursor: 'pointer' }}
                                >
                                  Device details
                                </Typography>
                                {account.installations.map((device, index) => (
                                  <Typography
                                    key={`${device.installationId}-${index}`}
                                    variant="caption"
                                    component="p"
                                    sx={{ overflowWrap: 'anywhere', mt: 0.5 }}
                                  >
                                    {device.platform} ·{' '}
                                    {device.hardware || 'Unknown hardware'} ·{' '}
                                    {formatEngagement(device.engagementMs)}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!data.days.length && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          No imported data for this period.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
