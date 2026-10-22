'use client';
import Link from 'next/link';
import { Box, Tab, Tabs } from '@mui/material';
import { AppEventsAnalyticsDashboard } from './AppEventsAnalyticsDashboard';
import { TimeInAppReport } from './TimeInAppReport';

/** Keeps event counts and Firebase time in separate tabs with independent filters. */
export function AppEventsAnalyticsView({
  tab,
  userId,
}: {
  tab?: string;
  userId?: string;
}) {
  const time = tab === 'time';
  return (
    <>
      <Box
        sx={{
          px: { xs: 2, sm: 3, lg: 4 },
          pt: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={time ? 'time' : 'events'}
          aria-label="App analytics reports"
        >
          <Tab
            value="events"
            label="App events"
            component={Link}
            href="/dashboard/app-events-analytics"
          />
          <Tab
            value="time"
            label="Time in app"
            component={Link}
            href="/dashboard/app-events-analytics?tab=time"
          />
        </Tabs>
      </Box>
      {time ? (
        <TimeInAppReport userId={userId} />
      ) : (
        <AppEventsAnalyticsDashboard />
      )}
    </>
  );
}
