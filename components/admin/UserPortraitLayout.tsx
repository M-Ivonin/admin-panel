'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Breadcrumbs,
  Button,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { getUser, type User } from '@/lib/api/users';
import { AdminPageHeader } from './AdminPageHeader';
import { personalizationSurfaceSx } from './PersonalizationLayout';

/** Account identity and account-local navigation, separate from the Users directory. */
export function UserPortraitLayout({
  userId,
  activeTab,
  children,
}: {
  userId: string;
  activeTab: 'portrait' | 'decisions';
  children: ReactNode;
}) {
  const params = new URLSearchParams(useSearchParams().toString());
  params.delete('view');
  const accountPath = `/dashboard/users/${encodeURIComponent(userId)}/portrait`;
  const portraitHref = params.size ? `${accountPath}?${params}` : accountPath;
  params.set('view', 'decisions');
  const decisionsHref = `${accountPath}?${params}`;
  const [identity, setIdentity] = useState<User | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let current = true;
    setIdentity(null);
    setError(false);
    void getUser(userId)
      .then((user) => {
        if (current) setIdentity(user);
      })
      .catch(() => {
        if (current) setError(true);
      });
    return () => {
      current = false;
    };
  }, [userId, revision]);
  const user = identity?.id === userId ? identity : null;
  const name =
    user?.name_app ||
    user?.name_tg ||
    user?.telegram_username ||
    `User ${userId.slice(0, 8)}`;
  return (
    <Box sx={personalizationSurfaceSx}>
      <AdminPageHeader
        title="User portrait"
        backHref="/dashboard/users"
        backLabel="Back to Users"
        maxWidth={1440}
      />
      <Box
        sx={{
          maxWidth: 1440,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: 3,
          minWidth: 0,
        }}
      >
        <Breadcrumbs
          aria-label="User context"
          sx={{ mb: 2, '& .MuiBreadcrumbs-li': { minWidth: 0 } }}
        >
          <Typography variant="body2" color="text.secondary">
            Personalization
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Users
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflowWrap: 'anywhere' }}
          >
            {name}
          </Typography>
        </Breadcrumbs>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 2 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h1"
              variant="h4"
              fontWeight={700}
              sx={{ fontSize: { xs: 28, md: 32 }, overflowWrap: 'anywhere' }}
            >
              {name}
            </Typography>
            {user?.email ? (
              <Typography
                color="text.secondary"
                sx={{ mt: 0.5, overflowWrap: 'anywhere' }}
              >
                {user.email}
              </Typography>
            ) : null}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, overflowWrap: 'anywhere' }}
            >
              User ID: {userId}
            </Typography>
            {error ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  User details could not be loaded.
                </Typography>
                <Button
                  size="small"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  Retry user details
                </Button>
              </Stack>
            ) : null}
          </Box>
          <Stack
            direction="row"
            gap={1}
            sx={{ alignSelf: 'flex-start', flexShrink: 0 }}
          >
            <Button
              variant="outlined"
              component={Link}
              href={`/dashboard/time-in-app?userId=${encodeURIComponent(userId)}`}
            >
              Time in app
            </Button>
            <Button
              variant="outlined"
              component={Link}
              href={`/dashboard/bot-chat?userId=${encodeURIComponent(userId)}`}
            >
              Chat
            </Button>
          </Stack>
        </Stack>
        <Tabs
          value={activeTab}
          aria-label="User portrait"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              px: { xs: 2, md: 3 },
              minHeight: 52,
            },
          }}
        >
          <Tab
            disableRipple
            component={Link}
            href={portraitHref}
            label="Portrait"
            value="portrait"
            id="user-portrait-tab"
            aria-controls="user-portrait-panel"
          />
          <Tab
            disableRipple
            component={Link}
            href={decisionsHref}
            label="Saved decisions"
            value="decisions"
            id="user-decisions-tab"
            aria-controls="user-decisions-panel"
          />
        </Tabs>
        <Box
          role="tabpanel"
          id={`user-${activeTab}-panel`}
          aria-labelledby={`user-${activeTab}-tab`}
          sx={{
            minWidth: 0,
            '& section.MuiPaper-root': {
              border: 1,
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: 'none',
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
