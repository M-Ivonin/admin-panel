'use client';

import { useState, useEffect, useRef } from 'react';
import { getUsers, getUser, User } from '@/lib/api/users';
import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItemButton,
  ListItemText,
  InputAdornment,
  ClickAwayListener,
} from '@mui/material';
import { Search } from '@mui/icons-material';

interface UserSelectProps {
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
}

function getUserDisplayName(user: User): string {
  return user.name_app || user.name_tg || user.email || user.telegram_username || 'Unknown';
}

export function UserSelect({ onUserSelect, selectedUserId }: UserSelectProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load selected user details
  useEffect(() => {
    if (selectedUserId && !selectedUser) {
      getUser(selectedUserId)
        .then(setSelectedUser)
        .catch(() => setSelectedUser(null));
    }
  }, [selectedUserId, selectedUser]);

  // Search users with debounce
  useEffect(() => {
    if (!isOpen) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getUsers({
          search: searchTerm || undefined,
          limit: 50,
        });
        setUsers(response.users);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load users';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, isOpen]);

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Box
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            width: '100%',
            px: 2,
            py: 1.5,
            textAlign: 'left',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          {selectedUser ? (
            <Box>
              <Typography variant="body2" fontWeight="medium" color="text.primary">
                {getUserDisplayName(selectedUser)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedUser.email || '-'}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a user...
            </Typography>
          )}
        </Box>

        {isOpen && (
          <Paper
            sx={{
              position: 'absolute',
              zIndex: 10,
              width: '100%',
              mt: 0.5,
              boxShadow: 3,
            }}
          >
            <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                autoFocus
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
            </Box>

            <Box sx={{ maxHeight: 256, overflowY: 'auto' }}>
              {error && (
                <Box sx={{ p: 2 }}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              )}

              {isLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Loading users...
                  </Typography>
                </Box>
              )}

              {!isLoading && !error && users.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? 'No matching users' : 'Start typing to search users'}
                  </Typography>
                </Box>
              )}

              {!isLoading && !error && (
                <List disablePadding>
                  {users.map((user) => (
                    <ListItemButton
                      key={user.id}
                      onClick={() => {
                        onUserSelect(user.id);
                        setSelectedUser(user);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      sx={{ borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}
                    >
                      <ListItemText
                        primary={getUserDisplayName(user)}
                        secondary={user.email || '-'}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
