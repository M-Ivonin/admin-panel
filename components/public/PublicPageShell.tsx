import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import type { Locale } from '@/lib/i18n/config';
import { PublicSiteFooter } from '@/components/public/PublicSiteFooter';
import { PublicSiteHeader } from '@/components/public/PublicSiteHeader';

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
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#07091d',
        color: 'text.primary',
        background:
          'linear-gradient(90deg, #0b2d45 0%, #0a1730 34%, #07091d 68%, #140c2f 100%)',
        overflowX: 'clip',
      }}
    >
      <PublicSiteHeader locale={locale} />
      {fullBleedMain ? (
        <Box component="main">{children}</Box>
      ) : (
        <Container
          maxWidth={maxWidth}
          component="main"
          sx={{ px: { xs: 2, sm: 3 } }}
        >
          {children}
        </Container>
      )}
      <PublicSiteFooter locale={locale} />
    </Box>
  );
}
