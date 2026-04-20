'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { getUsers, type User } from '@/lib/api/users';

interface CampaignAudienceUserPickerDialogProps {
  open: boolean;
  selectedUserIds: string[];
  onClose: () => void;
  onApply: (userIds: string[]) => void;
}

function getUserDisplayName(user: User): string {
  return (
    user.name_app ||
    user.name_tg ||
    user.email ||
    user.telegram_username ||
    user.id
  );
}

function getUserSecondaryLabel(user: User): string {
  const details = [
    user.email,
    user.telegram_username ? `@${user.telegram_username}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return details || user.id;
}

export function CampaignAudienceUserPickerDialog({
  open,
  selectedUserIds,
  onClose,
  onApply,
}: CampaignAudienceUserPickerDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [pendingUserIds, setPendingUserIds] =
    useState<string[]>(selectedUserIds);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPendingUserIds(selectedUserIds);
  }, [open, selectedUserIds]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [open, searchTerm]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadUsers() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getUsers({
          page: 1,
          limit: 25,
          search: debouncedSearchTerm || undefined,
          sortBy: 'name',
          sortOrder: 'ASC',
        });

        if (cancelled) {
          return;
        }

        setUsers(response.users);
        setTotal(response.total);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load users'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearchTerm, open]);

  const selectedUserSet = useMemo(
    () => new Set(pendingUserIds),
    [pendingUserIds]
  );

  const hasMoreUsers = users.length < total;

  const toggleUser = (userId: string) => {
    setPendingUserIds((current) =>
      current.includes(userId)
        ? current.filter((value) => value !== userId)
        : [...current, userId]
    );
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    setError(null);

    try {
      const response = await getUsers({
        page: nextPage,
        limit: 25,
        search: debouncedSearchTerm || undefined,
        sortBy: 'name',
        sortOrder: 'ASC',
      });

      setUsers((current) => [
        ...current,
        ...response.users.filter(
          (user) => !current.some((existingUser) => existingUser.id === user.id)
        ),
      ]);
      setTotal(response.total);
      setPage(nextPage);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load more users'
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Select users</DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Find users"
          placeholder="Search by name or e-mail"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Start from specific users, then narrow the audience further with the
          other rules if needed.
        </Typography>

        <Box
          sx={{
            mt: 2,
            maxHeight: 420,
            overflowY: 'auto',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          {error ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : null}

          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                p: 3,
              }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading users...
              </Typography>
            </Box>
          ) : null}

          {!isLoading && !error && users.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No users found for this search.
              </Typography>
            </Box>
          ) : null}

          {!isLoading && users.length > 0 ? (
            <List disablePadding>
              {users.map((user) => {
                const isSelected = selectedUserSet.has(user.id);

                return (
                  <ListItemButton
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    dense
                  >
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText
                      primary={getUserDisplayName(user)}
                      secondary={getUserSecondaryLabel(user)}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          ) : null}
        </Box>

        {hasMoreUsers ? (
          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Button onClick={handleLoadMore} disabled={isLoadingMore}>
              {isLoadingMore ? 'Loading...' : 'Load more'}
            </Button>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onApply(pendingUserIds)}>
          Apply users
        </Button>
      </DialogActions>
    </Dialog>
  );
}
