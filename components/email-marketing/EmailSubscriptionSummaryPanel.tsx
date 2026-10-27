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
import { ExpandMore, Refresh } from '@mui/icons-material';
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
  const [countriesExpanded, setCountriesExpanded] = useState(false);
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
            sx={{
              minWidth: 900,
              tableLayout: 'fixed',
              '& th, & td': { py: 1.25 },
            }}
          >
            <colgroup>
              <col style={{ width: '22%' }} />
              {subscriptionTopics.flatMap(({ key }) => [
                <col key={`${key}-confirmed`} style={{ width: '13%' }} />,
                <col key={`${key}-pending`} style={{ width: '13%' }} />,
              ])}
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2}>Country</TableCell>
                {subscriptionTopics.map(({ key, label }) => (
                  <TableCell
                    key={key}
                    colSpan={2}
                    align="center"
                    sx={{
                      borderLeft: 2,
                      borderLeftColor: 'divider',
                      bgcolor: 'action.hover',
                      fontWeight: 600,
                      py: 1.5,
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                {subscriptionTopics.flatMap(({ key: topic }) => [
                  <TableCell
                    key={`${topic}-confirmed`}
                    align="center"
                    sx={{
                      borderLeft: 2,
                      borderLeftColor: 'divider',
                      color: 'text.secondary',
                      fontSize: 12,
                    }}
                  >
                    Confirmed
                  </TableCell>,
                  <TableCell
                    key={`${topic}-pending`}
                    align="center"
                    sx={{ color: 'text.secondary', fontSize: 12 }}
                  >
                    Pending confirmation
                  </TableCell>,
                ])}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { countryCode: 'total', ...summary.totals },
                ...(countriesExpanded ? summary.countries : []),
              ].map((row) => (
                <TableRow
                  key={row.countryCode ?? 'unknown'}
                  sx={
                    row.countryCode === 'total'
                      ? {
                          bgcolor: 'action.hover',
                          '& th, & td': { fontWeight: 600 },
                        }
                      : undefined
                  }
                >
                  <TableCell component="th" scope="row">
                    {row.countryCode === 'total' ? (
                      <Button
                        size="small"
                        color="inherit"
                        disabled={summary.countries.length === 0}
                        aria-expanded={countriesExpanded}
                        aria-label={
                          countriesExpanded
                            ? 'Hide country breakdown'
                            : 'Show country breakdown'
                        }
                        onClick={() =>
                          setCountriesExpanded((expanded) => !expanded)
                        }
                        startIcon={
                          <ExpandMore
                            sx={{
                              transform: countriesExpanded
                                ? 'rotate(180deg)'
                                : 'none',
                              transition: 'transform 150ms',
                            }}
                          />
                        }
                        sx={{
                          ml: -0.75,
                          whiteSpace: 'nowrap',
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        All countries
                      </Button>
                    ) : row.countryCode ? (
                      (countryNames.of(row.countryCode) ?? row.countryCode)
                    ) : (
                      'Unknown country'
                    )}
                  </TableCell>
                  {subscriptionTopics.flatMap(({ key }) => [
                    <TableCell
                      key={`${key}-confirmed`}
                      align="center"
                      sx={{
                        borderLeft: 2,
                        borderLeftColor: 'divider',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {row[key].confirmed.toLocaleString('en')}
                    </TableCell>,
                    <TableCell
                      key={`${key}-pending`}
                      align="center"
                      sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
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
      {!loading && !error && summary ? (
        <Box sx={{ px: 2, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Email consent reminders
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            All time since tracking started. Unique accounts per reminder.
            Confirmations are linked through the preference and confirmation
            tokens, including confirmations made later.
          </Typography>
          {summary.promptFunnel ? (
            <TableContainer>
              <Table
                size="small"
                aria-label="Email consent reminder funnel"
                sx={{ minWidth: 1100 }}
              >
                <TableHead>
                  <TableRow>
                    {[
                      'Reminder',
                      'Shown',
                      'Dismissed',
                      'Clicked',
                      'Browser opened',
                      'Open failed',
                      'Preferences loaded',
                      'Topics selected',
                      'Confirmation requested',
                      'Confirmed',
                      'Confirmed / shown',
                    ].map((label) => (
                      <TableCell
                        key={label}
                        align={label === 'Reminder' ? 'left' : 'center'}
                        sx={{ fontWeight: 600 }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.promptFunnel.map((row) => (
                    <TableRow key={row.attemptNumber}>
                      <TableCell component="th" scope="row">
                        {row.attemptNumber === 1
                          ? 'First · 3 minutes'
                          : row.attemptNumber === 2
                            ? 'Second · +7 days'
                            : 'Third · +30 days'}
                      </TableCell>
                      {[
                        row.viewed,
                        row.dismissed,
                        row.opened,
                        row.browserOpened,
                        row.launchFailed,
                        row.manageOpened,
                        row.selected,
                        row.confirmationRequested,
                        row.confirmed,
                      ].map((count, index) => (
                        <TableCell
                          key={index}
                          align="center"
                          sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {count.toLocaleString('en')}
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        {row.confirmationRate === null
                          ? '—'
                          : `${row.confirmationRate.toLocaleString('en', { maximumFractionDigits: 2 })}%`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Reminder tracking is not available on this backend yet.
            </Typography>
          )}
        </Box>
      ) : null}
    </Card>
  );
}
