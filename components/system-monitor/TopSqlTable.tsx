import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { PersonalizationLoad } from '@/lib/api/system-monitor';

const kyivTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Kyiv',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});
const amount = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });

function temporaryWrites(bytes: number | null) {
  if (bytes === null) return '—';
  if (bytes >= 1024 ** 2) return `${amount.format(bytes / 1024 ** 2)} MiB`;
  if (bytes >= 1024) return `${amount.format(bytes / 1024)} KiB`;
  return `${amount.format(bytes)} B`;
}

export function TopSqlTable({
  load,
  loading,
  unavailable,
}: {
  load?: PersonalizationLoad;
  loading: boolean;
  unavailable: boolean;
}) {
  const interval = unavailable ? undefined : load?.topSql;
  return (
    <Stack spacing={0.75} sx={{ mt: 1.5, minWidth: 0 }}>
      <Typography variant="body2" fontWeight={600}>
        Top SQL for interval
      </Typography>
      <Typography variant="caption" color="text.secondary" aria-live="polite">
        {interval
          ? `${kyivTime.format(new Date(interval.from))} – ${kyivTime.format(new Date(interval.to))} (Kyiv)${load?.measurement === 'partial' ? ' · Partial data' : ''}`
          : unavailable
            ? 'SQL history unavailable'
            : loading
              ? 'Loading SQL history…'
              : 'No SQL breakdown for this interval'}
      </Typography>
      {interval &&
        (interval.entries.length > 0 ? (
          <TableContainer sx={{ maxWidth: '100%' }}>
            <Table
              size="small"
              aria-label="Top SQL for interval"
              sx={{
                tableLayout: 'fixed',
                '& td, & th': {
                  px: { xs: 0.625, sm: 1 },
                  py: 0.65,
                  overflowWrap: 'anywhere',
                  fontSize: 11,
                },
                '& tr:last-child td, & tr:last-child th': { borderBottom: 0 },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '46%' }}>Query ID / role</TableCell>
                  <TableCell align="right" sx={{ width: '19%' }}>
                    Total time
                  </TableCell>
                  <TableCell align="right" sx={{ width: '15%' }}>
                    Calls
                  </TableCell>
                  <TableCell align="right">Temp written</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {interval.entries.map((entry) => (
                  <TableRow
                    key={`${entry.queryId}:${entry.roleId}:${entry.topLevel}`}
                  >
                    <TableCell component="th" scope="row">
                      <Box
                        component="span"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: 10,
                          letterSpacing: 0,
                        }}
                      >
                        {entry.queryId}
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Role {entry.roleId}
                        {entry.topLevel ? '' : ' · Nested'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {entry.sqlMs < 1000
                        ? `${amount.format(entry.sqlMs)} ms`
                        : `${amount.format(entry.sqlMs / 1000)} s`}
                    </TableCell>
                    <TableCell align="right">
                      {amount.format(entry.calls)}
                    </TableCell>
                    <TableCell align="right">
                      {temporaryWrites(entry.tempBytesWritten)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="caption" color="text.secondary">
            No recorded SQL activity
          </Typography>
        ))}
    </Stack>
  );
}
