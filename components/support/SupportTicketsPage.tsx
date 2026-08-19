'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { SupportAgent } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
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
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  SUPPORT_CATEGORIES,
  SUPPORT_PLANS,
  SUPPORT_PLATFORMS,
  SUPPORT_PRIORITIES,
  SUPPORT_STATUSES,
  searchSupportTickets,
  type SupportCategory,
  type SupportPlan,
  type SupportPlatform,
  type SupportPriority,
  type SupportStatus,
  type SupportTicketSearchResponse,
} from '@/lib/api/support';

const PAGE_LIMIT = 20;

interface Filters {
  search: string;
  category: '' | SupportCategory;
  status: '' | SupportStatus;
  priority: '' | SupportPriority;
  plan: '' | SupportPlan;
  platform: '' | SupportPlatform;
}

const EMPTY_FILTERS: Filters = {
  search: '',
  category: '',
  status: '',
  priority: '',
  plan: '',
  platform: '',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function label(value: string) {
  return value.replace(/_/g, ' ');
}

export function SupportTicketsPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<SupportTicketSearchResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(
        await searchSupportTickets({
          ...(appliedFilters.search.trim()
            ? { search: appliedFilters.search.trim() }
            : {}),
          ...(appliedFilters.category
            ? { category: appliedFilters.category }
            : {}),
          ...(appliedFilters.status ? { status: appliedFilters.status } : {}),
          ...(appliedFilters.priority
            ? { priority: appliedFilters.priority }
            : {}),
          ...(appliedFilters.plan ? { plan: appliedFilters.plan } : {}),
          ...(appliedFilters.platform
            ? { platform: appliedFilters.platform }
            : {}),
          page,
          limit: PAGE_LIMIT,
        })
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load tickets'
      );
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminPageHeader
        title="Support tickets"
        subtitle="Search and operate backend-owned support requests"
        icon={<SupportAgent color="primary" />}
      />
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <Paper component="form" onSubmit={submit} sx={{ p: 2.5, mb: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Search tickets"
              placeholder="Ticket number, user ID, or exact email"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              fullWidth
              size="small"
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
                gap: 2,
              }}
            >
              <FilterSelect
                label="Category"
                value={filters.category}
                options={SUPPORT_CATEGORIES}
                onChange={(category) =>
                  setFilters((current) => ({
                    ...current,
                    category: category as Filters['category'],
                  }))
                }
              />
              <FilterSelect
                label="Status"
                value={filters.status}
                options={SUPPORT_STATUSES}
                onChange={(status) =>
                  setFilters((current) => ({
                    ...current,
                    status: status as Filters['status'],
                  }))
                }
              />
              <FilterSelect
                label="Priority"
                value={filters.priority}
                options={SUPPORT_PRIORITIES}
                onChange={(priority) =>
                  setFilters((current) => ({
                    ...current,
                    priority: priority as Filters['priority'],
                  }))
                }
              />
              <FilterSelect
                label="Plan"
                value={filters.plan}
                options={SUPPORT_PLANS}
                onChange={(plan) =>
                  setFilters((current) => ({
                    ...current,
                    plan: plan as Filters['plan'],
                  }))
                }
              />
              <FilterSelect
                label="Platform"
                value={filters.platform}
                options={SUPPORT_PLATFORMS}
                onChange={(platform) =>
                  setFilters((current) => ({
                    ...current,
                    platform: platform as Filters['platform'],
                  }))
                }
              />
            </Box>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                type="button"
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  setAppliedFilters(EMPTY_FILTERS);
                  setPage(1);
                }}
              >
                Clear
              </Button>
              <Button type="submit" variant="contained">
                Search
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {error ? (
          <Alert
            severity="error"
            action={<Button onClick={() => void load()}>Retry</Button>}
          >
            {error}
          </Alert>
        ) : null}
        {loading ? (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : null}
        {!loading && result ? (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {result.total} ticket{result.total === 1 ? '' : 's'}
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Plan / platform</TableCell>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.items.map((ticket) => (
                    <TableRow key={ticket.id} hover>
                      <TableCell>
                        <Link href={`/support/tickets/${ticket.id}`}>
                          {ticket.number}
                        </Link>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          Created {formatDate(ticket.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {ticket.user_email ?? 'No email'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ticket.user_id}
                        </Typography>
                      </TableCell>
                      <TableCell>{label(ticket.category)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={label(ticket.status)} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={ticket.priority}
                        />
                      </TableCell>
                      <TableCell>
                        {ticket.plan} / {ticket.platform ?? 'unknown'}
                      </TableCell>
                      <TableCell>
                        {ticket.assigned_team ?? 'Unassigned'}
                      </TableCell>
                      <TableCell>{formatDate(ticket.updated_at)}</TableCell>
                    </TableRow>
                  ))}
                  {result.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        No support tickets match these filters.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>
              <Typography variant="body2">Page {result.page}</Typography>
              <Button
                disabled={!result.has_more}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}

function FilterSelect({
  label: selectLabel,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      select
      SelectProps={{ native: true }}
      size="small"
      label={selectLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">All</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {label(option)}
        </option>
      ))}
    </TextField>
  );
}
