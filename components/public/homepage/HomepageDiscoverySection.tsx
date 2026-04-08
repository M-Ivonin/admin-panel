'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Locale } from '@/lib/i18n/config';
import {
  discoverySectionCopy,
  seoSummaryCards,
} from '@/components/public/homepage/homepage-copy';
import {
  SectionHeading,
  SeoCardVisual,
} from '@/components/public/homepage/HomepageShared';
import {
  copySafeSx,
  motionRevealSx,
  panelSx,
} from '@/components/public/public-homepage.styles';
import type { HomepageContent } from '@/modules/public/homepage-content';
import { PUBLIC_HUB_PATHS } from '@/modules/public/scaffold-pages';

export function HomepageDiscoverySection({
  content,
  locale,
  localize,
}: {
  content: HomepageContent;
  locale: Locale;
  localize: (path: string) => string;
}) {
  const sectionCopy = discoverySectionCopy[locale];

  return (
    <Box
      component="section"
      sx={{
        ...motionRevealSx(260),
        py: { xs: 1, md: 0 },
      }}
    >
      <Stack spacing={3} sx={{ width: '100%' }}>
        <SectionHeading
          title={sectionCopy.title}
          description={sectionCopy.description}
          maxWidth={980}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 2.5,
            alignItems: 'stretch',
          }}
        >
          <Box
            component={Link}
            href={localize(content.discovery.featuredInsight.href)}
            sx={{
              ...panelSx,
              display: 'block',
              flex: '1 1 auto',
              borderRadius: 3.5,
              bgcolor: alpha('#111827', 0.56),
              px: { xs: 2.25, md: 3.25 },
              py: { xs: 2.25, md: 3.25 },
              textDecoration: 'none',
              transition: 'transform 240ms ease, border-color 240ms ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: alpha('#6366f2', 0.56),
              },
            }}
          >
            <Stack spacing={2}>
              <Typography
                sx={{
                  ...copySafeSx,
                  color: '#f8fafc',
                  fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                  fontSize: { xs: '1.35rem', md: '1.5rem' },
                  fontWeight: 600,
                  lineHeight: 1.24,
                  maxWidth: { xs: '100%', md: 620 },
                }}
              >
                {sectionCopy.featured.title}
              </Typography>
              <Typography
                sx={{
                  ...copySafeSx,
                  color: '#94a3b8',
                  fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              >
                {sectionCopy.featured.description}
              </Typography>
              <Box
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: '999px',
                  bgcolor: '#1e293b',
                  border: '1px solid',
                  borderColor: '#475569',
                  px: 1.25,
                  py: 1,
                }}
              >
                <Typography
                  sx={{
                    color: '#c7d2fe',
                    fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {sectionCopy.featured.tag}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            component={Link}
            href={localize(content.discovery.quiz.href)}
            sx={{
              ...panelSx,
              display: 'block',
              width: { xs: '100%', lg: 360 },
              flexShrink: 0,
              borderRadius: 3.5,
              px: { xs: 2.25, md: 3 },
              py: { xs: 2.25, md: 3 },
              background:
                'linear-gradient(180deg, rgba(26,26,51,0.74) 0%, rgba(34,34,74,0.68) 100%)',
              borderColor: '#4f4a7a',
              textDecoration: 'none',
              transition: 'transform 240ms ease, border-color 240ms ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: alpha('#8b5cf6', 0.56),
              },
            }}
          >
            <Stack spacing={2} sx={{ minHeight: '100%' }}>
              <Typography
                sx={{
                  ...copySafeSx,
                  color: '#f8fafc',
                  fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                  fontSize: { xs: '1.25rem', md: '1.375rem' },
                  fontWeight: 600,
                  lineHeight: 1.24,
                  maxWidth: { xs: '100%', md: 260 },
                }}
              >
                {sectionCopy.quiz.title}
              </Typography>
              <Typography
                sx={{
                  ...copySafeSx,
                  color: '#cbd5e1',
                  fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  maxWidth: { xs: '100%', md: 280 },
                }}
              >
                {sectionCopy.quiz.description}
              </Typography>
              <Box
                component="span"
                sx={{
                  alignSelf: 'flex-start',
                  mt: 'auto',
                  fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                  borderRadius: '999px',
                  px: 2.25,
                  py: 1.1,
                  bgcolor: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                {sectionCopy.quiz.cta}
              </Box>
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            ...panelSx,
            borderRadius: 3.5,
            px: { xs: 3, md: 3.5 },
            py: { xs: 3, md: 3.5 },
            background:
              'linear-gradient(180deg, rgba(15,23,42,0.72) 0%, rgba(19,32,52,0.64) 100%)',
          }}
        >
          <Stack spacing={2.5}>
            <Typography
              sx={{
                color: '#f8fafc',
                fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                fontSize: { xs: '1.55rem', md: '1.75rem' },
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {sectionCopy.engine.title}
            </Typography>
            <Typography
              sx={{
                ...copySafeSx,
                color: '#cbd5e1',
                fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                maxWidth: 900,
              }}
            >
              {sectionCopy.engine.description}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 2,
                pt: 1.15,
              }}
            >
              {seoSummaryCards[locale].map((item, index) => (
                <Box
                  key={item.title}
                  component={Link}
                  href={
                    index === 0
                      ? localize(PUBLIC_HUB_PATHS.teams)
                      : index === 1
                        ? localize(PUBLIC_HUB_PATHS.players)
                        : localize(PUBLIC_HUB_PATHS.leagues)
                  }
                  sx={{
                    ...panelSx,
                    display: 'block',
                    borderRadius: 2.75,
                    bgcolor: alpha('#111827', 0.56),
                    px: 2.25,
                    py: 2.25,
                    textDecoration: 'none',
                    transition: 'transform 220ms ease, border-color 220ms ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: alpha('#6366f2', 0.48),
                    },
                  }}
                >
                  <Stack spacing={1.5}>
                    <SeoCardVisual index={index} />
                    <Stack spacing={0.9}>
                      <Typography
                        sx={{
                          color: '#6b7280',
                          fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          letterSpacing: '0.01em',
                          lineHeight: 1.1,
                        }}
                      >
                        {item.eyebrow}
                      </Typography>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: '#e2e8f0',
                          fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          lineHeight: 1.22,
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: index === 2 ? '#4b5563' : '#94a3b8',
                        fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>

            <Typography
              sx={{
                ...copySafeSx,
                color: '#94a3b8',
                fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                fontSize: '0.8125rem',
                lineHeight: 1.45,
              }}
            >
              {sectionCopy.engine.note}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
