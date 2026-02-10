import AppRouterCacheProvider from '@/components/providers/AppRouterCacheProvider';
import { MuiThemeProvider } from '@/components/providers/MuiThemeProvider';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider>
      <MuiThemeProvider>
        {children}
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}
