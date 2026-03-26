import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { getPublicFooterSections } from '@/modules/public/site-navigation';

export function PublicSiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const sections = getPublicFooterSections(locale);
  const footerLinks = [
    sections[0]?.items[0],
    sections[1]?.items[0],
    sections[2]?.items[0],
    sections[3]?.items[0],
    sections[0]?.items[1],
  ].filter(Boolean);

  return (
    <Box component="footer" sx={{ mt: { xs: 6, md: 8 }, pb: { xs: 4, md: 5 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            px: { xs: 2.5, md: 3.25 },
            py: { xs: 2.25, md: 2.5 },
            borderRadius: { xs: 4, md: 5 },
            border: '1px solid',
            borderColor: alpha('#334155', 0.78),
            bgcolor: alpha('#101828', 0.96),
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack spacing={0.5}>
              <Typography
                variant="body2"
                sx={{ color: '#f8fafc', fontWeight: 500 }}
              >
                SirBro public site
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: alpha('#94a3b8', 0.92) }}
              >
                {t.footer.copyright}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={{ xs: 1.5, md: 2 }}
              sx={{ flexWrap: 'wrap' }}
            >
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha('#94a3b8', 0.92),
                      '&:hover': { color: '#f8fafc' },
                    }}
                  >
                    {item.label}
                  </Typography>
                </Link>
              ))}
              <Typography
                component="a"
                href={`mailto:${t.footer.support}`}
                variant="body2"
                sx={{
                  color: alpha('#94a3b8', 0.92),
                  textDecoration: 'none',
                  '&:hover': { color: '#f8fafc' },
                }}
              >
                {t.footer.support}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
