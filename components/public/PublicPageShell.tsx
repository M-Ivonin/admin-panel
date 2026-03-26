import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import type { Locale } from '@/lib/i18n/config';
import { PublicSiteFooter } from '@/components/public/PublicSiteFooter';
import { PublicSiteHeader } from '@/components/public/PublicSiteHeader';

export function PublicPageShell({
  locale,
  children,
  maxWidth = 'lg',
}: {
  locale: Locale;
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl';
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0b1020',
        color: 'text.primary',
        backgroundImage:
          'radial-gradient(circle at top, rgba(79, 70, 229, 0.16), transparent 28%), radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.08), transparent 20%)',
      }}
    >
      <PublicSiteHeader locale={locale} />
      <Container
        maxWidth={maxWidth}
        component="main"
        sx={{ px: { xs: 2, sm: 3 } }}
      >
        {children}
      </Container>
      <PublicSiteFooter locale={locale} />
    </Box>
  );
}
