'use client';

import AppRouterCacheProvider from '@/components/providers/AppRouterCacheProvider';
import { MuiThemeProvider } from '@/components/providers/MuiThemeProvider';

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <MuiThemeProvider>{children}</MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}
