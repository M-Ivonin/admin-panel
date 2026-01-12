'use client';

import * as React from 'react';
import { AppRouterCacheProvider as MuiAppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

export default function AppRouterCacheProvider({ children }: { children: React.ReactNode }) {
  return <MuiAppRouterCacheProvider options={{ key: 'mui' }}>{children}</MuiAppRouterCacheProvider>;
}
