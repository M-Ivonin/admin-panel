import Link from 'next/link';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import type { Locale } from '@/lib/i18n/config';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getPublicHeaderNavigation } from '@/modules/public/site-navigation';

export function PublicSiteHeader({ locale }: { locale: Locale }) {
  const navigation = getPublicHeaderNavigation(locale);

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        backgroundImage: 'none',
        borderBottom: 'none',
        pt: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 2.25 },
            borderRadius: { xs: 4, md: 5 },
            border: '1px solid',
            borderColor: alpha('#334155', 0.78),
            bgcolor: alpha('#101828', 0.96),
            boxShadow: `0 18px 42px ${alpha('#020617', 0.24)}`,
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 2, md: 3 }}
            alignItems="center"
            sx={{
              minWidth: 0,
              flex: '1 1 auto',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href={`/${locale}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
              }}
            >
              <Image
                src="/assets/brandmark.png"
                alt="SirBro"
                width={34}
                height={40}
              />
              <Image
                src="/assets/typemark.png"
                alt="SirBro"
                width={120}
                height={30}
              />
            </Link>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: { xs: 0.25, md: 0.5 },
                minWidth: 0,
              }}
            >
              {navigation.primary.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    component="span"
                    color="inherit"
                    sx={{
                      px: { xs: 0.75, md: 1.25 },
                      py: 0.6,
                      minWidth: 'auto',
                      color:
                        item.href === `/${locale}`
                          ? '#f8fafc'
                          : alpha('#cbd5e1', 0.92),
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: '#f8fafc',
                        bgcolor: alpha('#ffffff', 0.04),
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              width: { xs: '100%', md: 'auto' },
              justifyContent: { xs: 'space-between', md: 'flex-end' },
            }}
          >
            <LanguageSwitcher currentLocale={locale} />
            <Link href={navigation.cta.href} style={{ textDecoration: 'none' }}>
              <Button
                component="span"
                variant="contained"
                size="medium"
                sx={{
                  minWidth: 128,
                  borderRadius: '999px',
                  px: 2.25,
                  bgcolor: '#4f46e5',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#5b54ff', boxShadow: 'none' },
                }}
              >
                {navigation.cta.label}
              </Button>
            </Link>
          </Stack>
        </Box>
      </Container>
    </AppBar>
  );
}
