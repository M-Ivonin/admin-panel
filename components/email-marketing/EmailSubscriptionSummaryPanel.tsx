'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import type {
  EmailMarketingRepository,
  EmailSubscriptionSummary,
} from '@/modules/email-marketing/contracts';

const subscriptionTopics = [
  { key: 'predictions', label: 'SirBro predictions' },
  { key: 'productUpdates', label: 'Product updates' },
  { key: 'partnerMarketing', label: 'Partner offers' },
] as const;

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function EmailSubscriptionSummaryPanel({
  repository,
}: {
  repository: EmailMarketingRepository;
}) {
  const [summary, setSummary] = useState<EmailSubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await repository.getSubscriptionSummary());
    } catch {
      setSummary(null);
      setError('Could not load email subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [repository]);
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card variant="outlined">
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Email subscriptions
        </Typography>
        <Button
          size="small"
          startIcon={<Refresh />}
          disabled={loading}
          onClick={() => void load()}
        >
          Refresh
        </Button>
      </Box>
      {loading ? (
        <Box
          role="status"
          sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CircularProgress size={16} />
          <Typography variant="body2">Loading subscriptions…</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
          {error}
        </Alert>
      ) : summary ? (
        <TableContainer sx={{ maxHeight: 300 }}>
          <Table
            size="small"
            aria-label="Email subscriptions by country"
            sx={{ minWidth: 780 }}
          >
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2}>Country</TableCell>
                {subscriptionTopics.map(({ key, label }) => (
                  <TableCell key={key} colSpan={2} align="center">
                    {label}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                {subscriptionTopics.flatMap(({ key: topic }) => [
                  <TableCell key={`${topic}-confirmed`} align="right">
                    Confirmed
                  </TableCell>,
                  <TableCell key={`${topic}-pending`} align="right">
                    Pending confirmation
                  </TableCell>,
                ])}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { countryCode: 'total', ...summary.totals },
                ...summary.countries,
              ].map((row) => (
                <TableRow
                  key={row.countryCode ?? 'unknown'}
                  sx={
                    row.countryCode === 'total'
                      ? { '& th, & td': { fontWeight: 600 } }
                      : undefined
                  }
                >
                  <TableCell component="th" scope="row">
                    {row.countryCode === 'total'
                      ? 'All countries'
                      : row.countryCode
                        ? (countryNames.of(row.countryCode) ?? row.countryCode)
                        : 'Unknown country'}
                  </TableCell>
                  {subscriptionTopics.flatMap(({ key }) => [
                    <TableCell key={`${key}-confirmed`} align="right">
                      {row[key].confirmed.toLocaleString('en')}
                    </TableCell>,
                    <TableCell key={`${key}-pending`} align="right">
                      {row[key].pending.toLocaleString('en')}
                    </TableCell>,
                  ])}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {summary.countries.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 2, py: 1.5 }}
            >
              No subscriptions yet.
            </Typography>
          ) : null}
        </TableContainer>
      ) : null}
    </Card>
  );
}
