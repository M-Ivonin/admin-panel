'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getChatUsers, ChatUserSummary } from '@/lib/api/chat';
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItemButton,
  ListItemText,
  InputAdornment,
  Chip,
  Button,
  MenuItem,
} from '@mui/material';
import { Search } from '@mui/icons-material';

interface UserSelectProps {
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
}

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Latest activity' },
  { value: 'date_asc', label: 'Oldest activity' },
  { value: 'user_asc', label: 'User A-Z' },
  { value: 'user_desc', label: 'User Z-A' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

function getUserDisplayName(user: ChatUserSummary): string {
  return (
    user.nameApp ||
    user.nameTg ||
    user.email ||
    user.telegramUsername ||
    'Unknown'
  );
}

export function UserSelect({ onUserSelect, selectedUserId }: UserSelectProps) {
  const [users, setUsers] = useState<ChatUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    const loadInitialPage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getChatUsers({
          page: 1,
          search: debouncedSearchTerm || undefined,
          limit: 50,
          sort: sortOption,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setUsers(response.users);
        setTotal(response.total);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const message =
          err instanceof Error ? err.message : 'Failed to load chat users';
        setError(message);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialPage();
  }, [debouncedSearchTerm, sortOption]);

  useEffect(() => {
    const selectedUserVisible = selectedUserId
      ? users.some((user) => user.id === selectedUserId)
      : false;

    if ((!selectedUserId || (!selectedUserVisible && debouncedSearchTerm)) && users.length > 0) {
      onUserSelect(users[0].id);
    }
  }, [debouncedSearchTerm, onUserSelect, selectedUserId, users]);

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    const requestId = requestIdRef.current;

    setIsLoadingMore(true);
    setError(null);
    try {
      const response = await getChatUsers({
        page: nextPage,
        search: debouncedSearchTerm || undefined,
        limit: 50,
        sort: sortOption,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setUsers((prevUsers) => [...prevUsers, ...response.users]);
      setTotal(response.total);
      setCurrentPage(nextPage);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const message =
        err instanceof Error ? err.message : 'Failed to load more chat users';
      setError(message);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const formatLastMessageTime = (value: string | null): string => {
    if (!value) return 'Unknown activity';
    try {
      return formatDistanceToNow(new Date(value), { addSuffix: true });
    } catch {
      return value;
    }
  };

  const hasMoreUsers = users.length < total;

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        placeholder="Search by email or name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        select
        label="Sort by"
        value={sortOption}
        onChange={(e) => {
          setSortOption(e.target.value as SortOption);
          setCurrentPage(1);
        }}
        size="small"
        fullWidth
        sx={{ mt: 1.5 }}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <Box
        sx={{
          mt: 2,
          maxHeight: { xs: 320, lg: 640 },
          overflowY: 'auto',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1.5,
        }}
      >
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Loading conversations...
            </Typography>
          </Box>
        )}

        {!isLoading && !error && users.length === 0 && (
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'No matching conversations' : 'No chat conversations yet'}
            </Typography>
          </Box>
        )}

        {!isLoading && !error && users.length > 0 && (
          <Box>
            <List disablePadding>
              {users.map((user) => {
                const isSelected = user.id === selectedUserId;

                return (
                  <ListItemButton
                    key={user.id}
                    selected={isSelected}
                    onClick={() => {
                      onUserSelect(user.id);
                    }}
                    sx={{
                      alignItems: 'flex-start',
                      borderBottom: 1,
                      borderColor: 'divider',
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <ListItemText
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={isSelected ? 700 : 600}
                            color="text.primary"
                            sx={{ flex: 1, minWidth: 0 }}
                            noWrap
                          >
                            {getUserDisplayName(user)}
                          </Typography>
                          {isSelected && (
                            <Chip
                              label="Open"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                            noWrap
                          >
                            {user.email || user.telegramUsername || 'No email'}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.25 }}
                          >
                            {formatLastMessageTime(user.lastMessageAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>

            {hasMoreUsers && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  p: 1.5,
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    void handleLoadMore();
                  }}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Loading...' : 'Load more'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
