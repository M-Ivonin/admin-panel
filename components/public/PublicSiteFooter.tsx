import Link from 'next/link';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { getDeepLinkConfig } from '@/modules/config/runtime';
import { getPublicFooterSections } from '@/modules/public/site-navigation';

const extraSectionTitle: Record<Locale, string> = {
  en: 'Stores / Social',
  es: 'Tiendas / Social',
  pt: 'Lojas / Social',
};

export function PublicSiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const sections = getPublicFooterSections(locale);
  const deepLinkConfig = getDeepLinkConfig();
  const extraLinks = [
    { label: 'App Store', href: deepLinkConfig.iosAppStoreUrl },
    deepLinkConfig.androidPlayUrl
      ? { label: 'Google Play', href: deepLinkConfig.androidPlayUrl }
      : null,
    { label: t.footer.support, href: `mailto:${t.footer.support}` },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <Box component="footer" sx={{ mt: { xs: 6, md: 8 }, pb: { xs: 4, md: 5 } }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            borderRadius: { xs: 4, md: 5 },
            border: '1px solid',
            borderColor: alpha('#334155', 0.86),
            bgcolor: alpha('#101828', 0.96),
            px: { xs: 2.5, md: 3.25 },
            py: { xs: 2.75, md: 3 },
          }}
        >
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={1.35}>
                <Link
                  href={`/${locale}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    textDecoration: 'none',
                  }}
                >
                  <Image
                    src="/assets/brandmark.png"
                    alt="SirBro"
                    width={30}
                    height={36}
                  />
                  <Image
                    src="/assets/typemark.png"
                    alt="SirBro"
                    width={108}
                    height={27}
                  />
                </Link>
                <Typography
                  sx={{
                    color: alpha('#cbd5e1', 0.84),
                    lineHeight: 1.7,
                    maxWidth: 340,
                  }}
                >
                  SirBro brings football insights, match volatility, player form, and tactical context into one mobile-first product surface.
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: alpha('#94a3b8', 0.92) }}
                >
                  {t.footer.copyright}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 8 }}>
              <Grid container spacing={{ xs: 2.5, md: 2 }}>
                {sections.map((section) => (
                  <Grid key={section.title} size={{ xs: 6, md: 4, xl: 2 }}>
                    <Stack spacing={1.05}>
                      <Typography
                        sx={{
                          color: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.92rem',
                        }}
                      >
                        {section.title}
                      </Typography>
                      {section.items.map((item) => (
                        <Link
                          key={`${section.title}-${item.label}-${item.href}`}
                          href={item.href}
                          style={{ textDecoration: 'none' }}
                        >
                          <Typography
                            sx={{
                              color: alpha('#94a3b8', 0.92),
                              lineHeight: 1.6,
                              '&:hover': { color: '#f8fafc' },
                            }}
                          >
                            {item.label}
                          </Typography>
                        </Link>
                      ))}
                    </Stack>
                  </Grid>
                ))}

                <Grid size={{ xs: 6, md: 4, xl: 2 }}>
                  <Stack spacing={1.05}>
                    <Typography
                      sx={{
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.92rem',
                      }}
                    >
                      {extraSectionTitle[locale]}
                    </Typography>
                    {extraLinks.map((item) => (
                      <Typography
                        key={`${item.label}-${item.href}`}
                        component="a"
                        href={item.href}
                        target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                        rel={item.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                        sx={{
                          color: alpha('#94a3b8', 0.92),
                          textDecoration: 'none',
                          lineHeight: 1.6,
                          '&:hover': { color: '#f8fafc' },
                        }}
                      >
                        {item.label}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
