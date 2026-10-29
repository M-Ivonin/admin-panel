'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import type { UserDevice } from '@/lib/api/users';

/** Displays an installation platform without changing unknown platform values. */
function platformLabel(platform: string): string {
  return platform === 'android'
    ? 'Android'
    : platform === 'ios'
      ? 'iOS'
      : platform;
}

/** Device timestamps are explicitly UTC because the database stores UTC timestamps. */
function lastSeenLabel(value: string | null): string {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Shows the most recently seen installation and separate details for every device. */
export function UserDeviceDetails({
  devices,
  userLabel,
}: {
  devices: UserDevice[];
  userLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const latest = devices[0];
  if (!latest)
    return (
      <Typography
        component="p"
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5 }}
      >
        No device data
      </Typography>
    );
  const version = latest.appVersion ?? 'Unknown version';
  return (
    <>
      <Stack spacing={0.25} sx={{ mt: 0.5, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" noWrap>
          <span>
            {version}
            {latest.buildNumber ? ` (${latest.buildNumber})` : ''}
          </span>
          {' · '}
          <span>{platformLabel(latest.platform)}</span>
        </Typography>
        <Tooltip
          describeChild
          title={`Last seen: ${lastSeenLabel(latest.lastSeenAt)} UTC`}
        >
          <Button
            size="small"
            sx={{
              alignSelf: 'flex-start',
              minWidth: 0,
              p: 0,
              fontSize: 11,
              lineHeight: 1.6,
            }}
            onClick={() => setOpen(true)}
          >
            Devices ({devices.length})
          </Button>
        </Tooltip>
      </Stack>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        aria-labelledby={`devices-${latest.id}`}
      >
        <DialogTitle id={`devices-${latest.id}`}>
          Devices — {userLabel}
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table
              size="small"
              aria-label="User devices"
              sx={{ minWidth: 800 }}
            >
              <TableHead>
                <TableRow>
                  {[
                    'Device',
                    'App',
                    'Platform',
                    'Version',
                    'Build',
                    'Environment',
                    'Last seen (UTC)',
                  ].map((label) => (
                    <TableCell key={label}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.deviceModel ?? 'Unknown'}</TableCell>
                    <TableCell>{device.appProfile ?? 'Unknown'}</TableCell>
                    <TableCell>{platformLabel(device.platform)}</TableCell>
                    <TableCell>{device.appVersion ?? 'Unknown'}</TableCell>
                    <TableCell>{device.buildNumber ?? 'Unknown'}</TableCell>
                    <TableCell>{device.environment ?? 'Unknown'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {lastSeenLabel(device.lastSeenAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
