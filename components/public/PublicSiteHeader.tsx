'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Locale } from '@/lib/i18n/config';
import { getPublicHeaderNavigation } from '@/modules/public/site-navigation';

const pagePx = { xs: 2.5, sm: 4, md: 6, lg: 10 };
const pageMaxWidth = 1440;

const headerPanelSx = {
  border: '1px solid',
  borderColor: alpha('#334155', 0.42),
  boxShadow: `0 18px 48px ${alpha('#020617', 0.22)}`,
  backdropFilter: 'blur(18px)',
};

function LandingLocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const languages = [
    { code: 'en' as const, label: 'EN' },
    { code: 'es' as const, label: 'ES' },
    { code: 'pt' as const, label: 'PT' },
  ];

  return (
    <Box
      sx={{
        ...headerPanelSx,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        borderRadius: '999px',
        px: 1.75,
        py: 1.1,
        bgcolor: alpha('#0f172a', 0.56),
      }}
    >
      {languages.map((lang, index) => (
        <Box
          key={lang.code}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Button
            onClick={() => {
              const segments = pathname.split('/');
              segments[1] = lang.code;
              router.push(segments.join('/'));
            }}
            sx={{
              minWidth: 'auto',
              p: 0,
              borderRadius: 0,
              color: currentLocale === lang.code ? '#f8fafc' : '#cbd5e1',
              fontSize: '0.75rem',
              fontWeight: currentLocale === lang.code ? 700 : 600,
              lineHeight: 1,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#ffffff',
              },
            }}
          >
            {lang.label}
          </Button>
          {index < languages.length - 1 ? (
            <Typography
              sx={{ color: alpha('#64748b', 0.95), fontSize: '0.75rem' }}
            >
              |
            </Typography>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}

export function PublicSiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const navigation = getPublicHeaderNavigation(locale);
  const aboutMenuRef = useRef<HTMLDivElement | null>(null);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);

  useEffect(() => {
    setIsAboutMenuOpen(false);
  }, [locale, pathname]);

  useEffect(() => {
    if (!isAboutMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!aboutMenuRef.current?.contains(event.target as Node)) {
        setIsAboutMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAboutMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAboutMenuOpen]);

  const homeHref = navigation.primary[0]?.href ?? `/${locale}`;
  const isAboutRoute = navigation.aboutMenu.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const isItemActive = (href: string) => {
    if (href === homeHref) {
      return pathname === href;
    }

    if (href === navigation.primary[navigation.primary.length - 1]?.href) {
      return isAboutRoute;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        borderBottom: '1px solid',
        borderColor: alpha('#20293a', 0.38),
        bgcolor: alpha('#090d16', 0.4),
        backdropFilter: 'blur(18px)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: pageMaxWidth,
          mx: 'auto',
          px: pagePx,
          py: { xs: 1.5, md: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1.5, md: 3 },
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 1.75, md: 4.5 }}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Link
            href={homeHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src="/assets/brandmark.png"
              alt="SirBro"
              sx={{
                width: { xs: 28, md: 32 },
                height: { xs: 34, md: 38 },
                display: 'block',
              }}
            />
            <Box
              component="img"
              src="/assets/typemark.png"
              alt="SirBro"
              sx={{
                width: { xs: 82, md: 96 },
                height: { xs: 20, md: 24 },
                display: 'block',
              }}
            />
          </Link>

          <Stack
            direction="row"
            spacing={3.5}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {navigation.primary.map((item, index) => {
              const isAboutItem = index === navigation.primary.length - 1;
              const isActive = isItemActive(item.href);

              if (isAboutItem) {
                return (
                  <Box
                    key={item.href}
                    ref={aboutMenuRef}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Button
                      onClick={() => setIsAboutMenuOpen((current) => !current)}
                      aria-expanded={isAboutMenuOpen}
                      aria-haspopup="menu"
                      sx={{
                        minWidth: 'auto',
                        p: 0,
                        color: isActive ? '#f8fafc' : '#94a3b8',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        textTransform: 'none',
                        transition: 'color 180ms ease',
                        '&:hover': {
                          bgcolor: 'transparent',
                          color: '#ffffff',
                        },
                      }}
                    >
                      {item.label}
                    </Button>

                    {isAboutMenuOpen ? (
                      <Box
                        sx={{
                          ...headerPanelSx,
                          position: 'absolute',
                          top: 'calc(100% + 16px)',
                          left: -18,
                          width: 224,
                          borderRadius: 2.5,
                          bgcolor: alpha('#0f172a', 0.72),
                          px: 2.25,
                          py: 1.75,
                          zIndex: 40,
                        }}
                      >
                        <Stack
                          spacing={0.8}
                          role="menu"
                          aria-label={item.label}
                        >
                          {navigation.aboutMenu.map((menuItem) => (
                            <Typography
                              key={menuItem.href}
                              component={Link}
                              href={menuItem.href}
                              onClick={() => setIsAboutMenuOpen(false)}
                              sx={{
                                color: '#e2e8f0',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                lineHeight: 1.75,
                                textDecoration: 'none',
                                '&:hover': { color: '#ffffff' },
                              }}
                            >
                              {menuItem.label}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    ) : null}
                  </Box>
                );
              }

              return (
                <Typography
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{
                    color: isActive ? '#f8fafc' : '#94a3b8',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    transition: 'color 180ms ease',
                    '&:hover': { color: '#ffffff' },
                  }}
                >
                  {item.label}
                </Typography>
              );
            })}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.75} alignItems="center">
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <LandingLocaleSwitcher currentLocale={locale} />
          </Box>
          <Button
            component={Link}
            href={navigation.cta.href}
            sx={{
              minWidth: 'auto',
              borderRadius: '999px',
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1.05, sm: 1.35 },
              bgcolor: '#4f46e5',
              color: '#ffffff',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              fontWeight: 600,
              boxShadow: 'none',
              textDecoration: 'none',
              '&:hover': {
                bgcolor: '#5b54ff',
                boxShadow: 'none',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {navigation.cta.label}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
