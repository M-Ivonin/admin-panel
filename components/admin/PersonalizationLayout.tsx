'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { usePathname, useSearchParams } from 'next/navigation';
import { AdminPageHeader } from './AdminPageHeader';

type PersonalizationTab = 'users' | 'decisions' | 'results' | 'settings';

/** One navigation shell over the existing account and outcome read surfaces. */
export function PersonalizationLayout({
  activeTab,
  userId,
  children,
}: {
  activeTab: PersonalizationTab;
  userId?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accountPath = userId
    ? `/dashboard/users/${encodeURIComponent(userId)}/portrait`
    : '/dashboard/users';
  const accountParams = new URLSearchParams(searchParams.toString());
  accountParams.delete('view');
  const usersHref =
    accountParams.size && userId
      ? `${accountPath}?${accountParams}`
      : accountPath;
  accountParams.set('view', 'decisions');
  const decisionsHref = `${accountPath}?${accountParams}`;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        minWidth: 0,
        '& .MuiPaper-root': { backgroundImage: 'none' },
        '& .MuiButton-outlined': {
          color: 'text.primary',
          borderColor: 'divider',
        },
        '& .MuiToggleButton-root': {
          textTransform: 'none',
          color: 'text.secondary',
          px: { xs: 1.25, md: 2 },
        },
        '& .MuiToggleButton-root.Mui-selected': {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': { bgcolor: 'primary.dark' },
        },
      }}
    >
      <AdminPageHeader
        title="Personalization"
        backHref="/dashboard/users"
        backLabel="Back to Users"
        showBack={pathname !== '/dashboard/users'}
        maxWidth={1440}
      />
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 } }}>
        <Tabs
          value={activeTab}
          aria-label="Personalization"
          variant="scrollable"
          scrollButtons={false}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            minHeight: 52,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: { xs: 12, md: 14 },
              minWidth: { xs: 0, md: 90 },
              minHeight: 52,
              px: { xs: 1, md: 3 },
            },
          }}
        >
          <Tab
            disableRipple
            component={Link}
            href={usersHref}
            label="Users"
            value="users"
            id="personalization-users-tab"
            aria-controls="personalization-users"
          />
          <Tab
            disableRipple
            component={userId ? Link : 'button'}
            href={userId ? decisionsHref : undefined}
            label="Saved decisions"
            value="decisions"
            disabled={!userId}
            id="personalization-decisions-tab"
            aria-controls="personalization-decisions"
          />
          <Tab
            disableRipple
            component={Link}
            href="/dashboard/user-experiments"
            label="Results"
            value="results"
            id="personalization-results-tab"
            aria-controls="personalization-results"
          />
          <Tab
            disableRipple
            component={Link}
            href="/dashboard/personalization/settings"
            label="Settings"
            value="settings"
            id="personalization-settings-tab"
            aria-controls="personalization-settings"
          />
        </Tabs>
        {!userId ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Select a user in Users to view saved decisions
          </Typography>
        ) : null}
      </Box>
      <Box
        role="tabpanel"
        id={`personalization-${activeTab}`}
        aria-labelledby={`personalization-${activeTab}-tab`}
        sx={{
          maxWidth: 1440,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: 3,
          minWidth: 0,
          '& section.MuiPaper-root': {
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            boxShadow: 'none',
          },
          '& .MuiAlert-root': { borderRadius: '8px' },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
