import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import type { Locale } from '@/lib/i18n/config';
import { PublicSiteFooter } from '@/components/public/PublicSiteFooter';
import { PublicSiteHeader } from '@/components/public/PublicSiteHeader';
import {
  publicSiteContainedMainSx,
  publicSiteShellSx,
} from '@/components/public/public-site.styles';

export function PublicPageShell({
  locale,
  children,
  maxWidth = 'lg',
  fullBleedMain = false,
}: {
  locale: Locale;
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl';
  fullBleedMain?: boolean;
}) {
  return (
    <Box sx={publicSiteShellSx}>
      <PublicSiteHeader locale={locale} />
      {fullBleedMain ? (
        <Box component="main">{children}</Box>
      ) : (
        <Container maxWidth={maxWidth} component="main" sx={publicSiteContainedMainSx}>
          {children}
        </Container>
      )}
      <PublicSiteFooter locale={locale} />
    </Box>
  );
}
