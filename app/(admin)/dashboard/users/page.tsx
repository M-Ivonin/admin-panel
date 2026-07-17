'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  ChangeEvent,
} from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  InputAdornment,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Refresh, Search, Chat } from '@mui/icons-material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  getUsers,
  User,
  PaginatedUser,
  RetentionStage,
  PaginatedUsersResponse,
  RetentionCounts,
  UserLatestAppProfile,
} from '@/lib/api/users';
import { getCampaignEditorCatalog } from '@/lib/api/campaigns';
import type { CampaignRetentionStageOption } from '@/modules/campaigns/contracts';

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPlanColor(
  plan: string | undefined
): 'default' | 'secondary' | 'warning' {
  const colors: Record<string, 'default' | 'secondary' | 'warning'> = {
    free: 'default',
    playmaker: 'secondary',
    probro: 'warning',
  };
  return colors[plan || 'free'] || 'default';
}

function normalizePlanIdentifier(value: string | null | undefined): string {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(/[\s.-]+/g, '_') ?? ''
  );
}

function resolveSirBroPlanTier(plan: string | null | undefined) {
  const normalizedPlan = normalizePlanIdentifier(plan);

  if (
    normalizedPlan.includes('sirbro_playmaker') ||
    normalizedPlan.includes('playmaker') ||
    normalizedPlan.includes('play_maker')
  ) {
    return 'playmaker';
  }

  if (
    normalizedPlan.includes('sirbro_probro') ||
    normalizedPlan.includes('probro') ||
    normalizedPlan.includes('pro_bro')
  ) {
    return 'probro';
  }

  return null;
}

function resolveTipsterBroPlanTier(plan: string | null | undefined) {
  const normalizedPlan = normalizePlanIdentifier(plan);

  if (
    normalizedPlan.includes('tipsterbro_weekly') ||
    normalizedPlan.includes('tipsterbro_monthly') ||
    normalizedPlan.includes('weekly_pass') ||
    normalizedPlan.includes('weekly_plan') ||
    normalizedPlan.includes('monthly_plus')
  ) {
    return 'playmaker';
  }

  if (
    normalizedPlan.includes('tipsterbro_annual') ||
    normalizedPlan.includes('annual_bro')
  ) {
    return 'probro';
  }

  return null;
}

function getEffectivePlanLabel(user: User): string {
  const subscription = user.subscription;

  if (!subscription) {
    return 'free';
  }

  if (subscription.subscriptionStatus?.toLowerCase() !== 'active') {
    return 'free';
  }

  if (user.latestAppProfile === 'SirBro') {
    return resolveSirBroPlanTier(subscription.activePlan) ?? 'free';
  }

  if (user.latestAppProfile === 'TipsterBro') {
    return resolveTipsterBroPlanTier(subscription.activePlan) ?? 'free';
  }

  return subscription.activePlan || 'free';
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');

  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return `rgba(107, 114, 128, ${alpha})`;
  }

  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getRetentionChipSx(
  option: CampaignRetentionStageOption | null,
  selected = false
) {
  const color = option?.chipColor ?? '#6b7280';

  return {
    borderColor: color,
    color,
    bgcolor: selected ? hexToRgba(color, 0.14) : 'transparent',
    '& .MuiChip-label': {
      fontWeight: selected ? 700 : 500,
    },
  };
}

function getAppProfileChip(appProfile: UserLatestAppProfile | undefined): {
  label: string;
  color: 'default' | 'primary' | 'secondary';
  variant: 'filled' | 'outlined';
  sx?: Record<string, unknown>;
} {
  if (appProfile === 'SirBro') {
    return {
      label: 'SirBro',
      color: 'primary',
      variant: 'outlined',
    };
  }

  if (appProfile === 'TipsterBro') {
    return {
      label: 'TipsterBro',
      color: 'secondary',
      variant: 'outlined',
    };
  }

  return {
    label: 'Unknown',
    color: 'default',
    variant: 'outlined',
    sx: {
      color: 'text.disabled',
      borderColor: 'divider',
      bgcolor: 'action.hover',
    },
  };
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function UsersPage() {
  // Data state
  const [users, setUsers] = useState<PaginatedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [retentionCounts, setRetentionCounts] =
    useState<RetentionCounts | null>(null);
  const [retentionStageOptions, setRetentionStageOptions] = useState<
    CampaignRetentionStageOption[]
  >([]);

  // Filter state
  const [page, setPage] = useState(0); // MUI TablePagination uses 0-based index
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRetentionStage, setSelectedRetentionStage] =
    useState<RetentionStage | null>(null);
  const [partnerFilter, setPartnerFilter] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0); // Reset to first page on search
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: PaginatedUsersResponse = await getUsers({
        page: page + 1, // API uses 1-based index
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        retentionStage: selectedRetentionStage || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortBy ? sortOrder : undefined,
        partnerId: partnerFilter.trim() || undefined,
      });
      setUsers(response.users || []);
      setTotal(response.total || 0);
      setRetentionCounts(response.retentionCounts || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    debouncedSearch,
    selectedRetentionStage,
    sortBy,
    sortOrder,
    partnerFilter,
  ]);

  const fetchRetentionStageOptions = useCallback(async () => {
    try {
      const catalog = await getCampaignEditorCatalog();
      setRetentionStageOptions(catalog.retentionStageOptions || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch retention stages'
      );
    }
  }, []);

  const retentionStageLabels = useMemo(
    () =>
      Object.fromEntries(
        retentionStageOptions.map((option) => [option.stage, option.label])
      ) as Partial<Record<RetentionStage, string>>,
    [retentionStageOptions]
  );

  const getRetentionStageLabel = useCallback(
    (stage: RetentionStage) => retentionStageLabels[stage] || stage,
    [retentionStageLabels]
  );

  const getRetentionStageOption = useCallback(
    (stage: RetentionStage) =>
      retentionStageOptions.find((option) => option.stage === stage) ?? null,
    [retentionStageOptions]
  );

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle order if same column
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // New column, start with DESC
      setSortBy(column);
      setSortOrder('DESC');
    }
    setPage(0);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRetentionStageOptions();
  }, [fetchRetentionStageOptions]);

  const handleRetentionStageClick = (stage: RetentionStage) => {
    if (selectedRetentionStage === stage) {
      setSelectedRetentionStage(null);
    } else {
      setSelectedRetentionStage(stage);
    }
    setPage(0); // Reset to first page on filter change
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getUserDisplayName = (user: User) => {
    return (
      user.name_app ||
      user.name_tg ||
      user.email ||
      user.telegram_username ||
      'Unknown'
    );
  };

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AdminPageHeader title="Users" subtitle={`${total} total`} />

        {/* Main content */}
        <Box
          sx={{
            maxWidth: 1280,
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 4 },
            py: 4,
          }}
        >
          {/* Retention Stage Filter Chips */}
          {retentionCounts && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label={`All (${total})`}
                  onClick={() => {
                    setSelectedRetentionStage(null);
                    setPage(0);
                  }}
                  color={
                    selectedRetentionStage === null ? 'primary' : 'default'
                  }
                  variant={
                    selectedRetentionStage === null ? 'filled' : 'outlined'
                  }
                />
                {retentionStageOptions.map((option) => {
                  const count = retentionCounts[option.stage] || 0;
                  const isSelected = selectedRetentionStage === option.stage;
                  return (
                    <Chip
                      key={option.stage}
                      label={`${option.label} (${count})`}
                      onClick={() => handleRetentionStageClick(option.stage)}
                      sx={getRetentionChipSx(option, isSelected)}
                      variant={isSelected ? 'filled' : 'outlined'}
                    />
                  );
                })}
              </Box>
            </Paper>
          )}

          {/* Search and actions */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <TextField
                size="small"
                placeholder="Search by name, email, username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { xs: '100%', sm: 384 } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                size="small"
                placeholder="Filter by partner ID..."
                value={partnerFilter}
                onChange={(e) => {
                  setPartnerFilter(e.target.value);
                  setPage(0);
                }}
                sx={{ width: { xs: '100%', sm: 220 } }}
              />
              <IconButton
                onClick={fetchUsers}
                disabled={isLoading}
                color="primary"
              >
                <Refresh
                  sx={{
                    animation: isLoading ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              </IconButton>
            </Box>
          </Paper>

          {/* Error state */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading state */}
          {isLoading && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading users...
              </Typography>
            </Paper>
          )}

          {/* Users table */}
          {!isLoading && !error && (
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'name'}
                          direction={
                            sortBy === 'name'
                              ? sortOrder === 'ASC'
                                ? 'asc'
                                : 'desc'
                              : 'desc'
                          }
                          onClick={() => handleSort('name')}
                        >
                          User
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'retentionStage'}
                          direction={
                            sortBy === 'retentionStage'
                              ? sortOrder === 'ASC'
                                ? 'asc'
                                : 'desc'
                              : 'desc'
                          }
                          onClick={() => handleSort('retentionStage')}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>App</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'activePlan'}
                          direction={
                            sortBy === 'activePlan'
                              ? sortOrder === 'ASC'
                                ? 'asc'
                                : 'desc'
                              : 'desc'
                          }
                          onClick={() => handleSort('activePlan')}
                        >
                          Plan
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'level'}
                          direction={
                            sortBy === 'level'
                              ? sortOrder === 'ASC'
                                ? 'asc'
                                : 'desc'
                              : 'desc'
                          }
                          onClick={() => handleSort('level')}
                        >
                          Level
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'totalXp'}
                          direction={
                            sortBy === 'totalXp'
                              ? sortOrder === 'ASC'
                                ? 'asc'
                                : 'desc'
                              : 'desc'
                          }
                          onClick={() => handleSort('totalXp')}
                        >
                          XP / Points
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'registered_at'}
                          direction={
                            sortBy === 'registered_at'
                              ? sortOrder === 'ASC'
                                ? 'asc'
                                : 'desc'
                              : 'desc'
                          }
                          onClick={() => handleSort('registered_at')}
                        >
                          Registered At
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'last_active_at'}
                          direction={
                            sortBy === 'last_active_at'
                              ? sortOrder === 'ASC'
                                ? 'asc'
                                : 'desc'
                              : 'desc'
                          }
                          onClick={() => handleSort('last_active_at')}
                        >
                          Last Active
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'language'}
                          direction={
                            sortBy === 'language'
                              ? sortOrder === 'ASC'
                                ? 'asc'
                                : 'desc'
                              : 'desc'
                          }
                          onClick={() => handleSort('language')}
                        >
                          Language
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Partner</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {getUserDisplayName(user)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {user.email || '-'}
                            </Typography>
                            {user.telegram_username && (
                              <Typography variant="caption" color="primary">
                                @{user.telegram_username}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              user.retentionStage
                                ? getRetentionStageLabel(user.retentionStage)
                                : 'Unknown'
                            }
                            size="small"
                            variant="outlined"
                            sx={getRetentionChipSx(
                              user.retentionStage
                                ? getRetentionStageOption(user.retentionStage)
                                : null
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const appProfileChip = getAppProfileChip(
                              user.latestAppProfile
                            );

                            return (
                              <Chip
                                label={appProfileChip.label}
                                size="small"
                                color={appProfileChip.color}
                                variant={appProfileChip.variant}
                                sx={appProfileChip.sx}
                              />
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const effectivePlan = getEffectivePlanLabel(user);

                            return (
                              <Chip
                                label={effectivePlan}
                                size="small"
                                color={getPlanColor(effectivePlan)}
                              />
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              Lvl {user.level}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {user.levelName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {user.totalXp.toLocaleString()} XP
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {user.totalPoints.toLocaleString()} pts
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(user.registered_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(user.last_active_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {user.language}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {user.partnerId ? (
                            <Chip
                              label={user.partnerId}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              onClick={() => {
                                setPartnerFilter(user.partnerId!);
                                setPage(0);
                              }}
                              title="Click to filter by this partner"
                            />
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link href={`/dashboard/bot-chat?userId=${user.id}`}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Chat />}
                            >
                              Chat
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            {debouncedSearch || selectedRetentionStage
                              ? 'No users found matching your filters'
                              : 'No users found'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={PAGE_SIZE_OPTIONS}
              />
            </Paper>
          )}
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
