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
  homepagePalette,
  motionRevealSx,
  panelSx,
} from '@/components/public/public-homepage.styles';
import type { HomepageContent } from '@/modules/public/homepage-content';

const leagueCardMeta: Record<
  string,
  { src: string; alt: string; logoScale?: number }
> = {
  'Premier League': {
    src: '/assets/homepage/leagues/premier-league.svg',
    alt: 'Premier League logo',
  },
  'La Liga': {
    src: '/assets/homepage/leagues/laliga.svg',
    alt: 'La Liga logo',
  },
  'Serie A': {
    src: '/assets/homepage/leagues/serie-a.svg',
    alt: 'Serie A logo',
    logoScale: 0.82,
  },
  Bundesliga: {
    src: '/assets/homepage/leagues/bundesliga.svg',
    alt: 'Bundesliga logo',
  },
  'Ligue 1': {
    src: '/assets/homepage/leagues/ligue-1.svg',
    alt: 'Ligue 1 logo',
    logoScale: 0.78,
  },
  Brasileirão: {
    src: '/assets/homepage/leagues/brasileirao.svg',
    alt: 'Brasileirão Série A logo',
    logoScale: 0.78,
  },
  'Liga MX': {
    src: '/assets/homepage/leagues/liga-mx.svg',
    alt: 'Liga MX logo',
  },
  MLS: {
    src: '/assets/homepage/leagues/mls.svg',
    alt: 'MLS logo',
  },
  'UEFA competitions': {
    src: '/assets/homepage/leagues/uefa.svg',
    alt: 'UEFA logo',
  },
  'Competiciones UEFA': {
    src: '/assets/homepage/leagues/uefa.svg',
    alt: 'UEFA logo',
  },
  'Competições UEFA': {
    src: '/assets/homepage/leagues/uefa.svg',
    alt: 'UEFA logo',
  },
  'FIFA World Cup 2026': {
    src: '/assets/homepage/leagues/fifa-world-cup-2026.svg',
    alt: 'FIFA World Cup 2026 logo',
    logoScale: 0.76,
  },
  'Mundial FIFA 2026': {
    src: '/assets/homepage/leagues/fifa-world-cup-2026.svg',
    alt: 'FIFA World Cup 2026 logo',
    logoScale: 0.76,
  },
  'Copa do Mundo FIFA 2026': {
    src: '/assets/homepage/leagues/fifa-world-cup-2026.svg',
    alt: 'FIFA World Cup 2026 logo',
    logoScale: 0.76,
  },
};

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
  void localize;
  const hasStructuredDiscovery =
    Boolean(content.discovery.features?.length) &&
    Boolean(content.discovery.useCases?.length) &&
    Boolean(content.discovery.seoEngine.leagueLabels?.length);

  if (hasStructuredDiscovery) {
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
            title={content.discovery.title}
            description={content.discovery.description}
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
              sx={{
                ...panelSx,
                flex: '1 1 auto',
                borderRadius: 3.5,
                bgcolor: alpha(homepagePalette.surface, 0.56),
                px: { xs: 2.25, md: 3.25 },
                py: { xs: 2.25, md: 3.25 },
              }}
            >
              <Stack spacing={1.4}>
                {content.discovery.features?.map((feature) => (
                  <Typography
                    key={feature}
                    sx={{
                      ...copySafeSx,
                      color: homepagePalette.textBody,
                      fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                      fontSize: '0.95rem',
                      lineHeight: 1.55,
                    }}
                  >
                    {feature}
                  </Typography>
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                ...panelSx,
                width: { xs: '100%', lg: 360 },
                flexShrink: 0,
                borderRadius: 3.5,
                px: { xs: 2.25, md: 3 },
                py: { xs: 2.25, md: 3 },
                background: homepagePalette.discoveryPanelBackground,
                borderColor: homepagePalette.accentBorder,
              }}
            >
              <Stack spacing={1.5} sx={{ minHeight: '100%' }}>
                <Typography
                  sx={{
                    ...copySafeSx,
                    color: homepagePalette.textStrong,
                    fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                    fontSize: { xs: '1.25rem', md: '1.375rem' },
                    fontWeight: 600,
                    lineHeight: 1.24,
                    maxWidth: { xs: '100%', md: 280 },
                  }}
                >
                  {content.discovery.useCasesTitle}
                </Typography>
                <Stack spacing={1.1}>
                  {content.discovery.useCases?.map((useCase) => (
                    <Typography
                      key={useCase}
                      sx={{
                        ...copySafeSx,
                        color: homepagePalette.textSoft,
                        fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {useCase}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              ...panelSx,
              borderRadius: 3.5,
              px: { xs: 3, md: 3.5 },
              py: { xs: 3, md: 3.5 },
              background: homepagePalette.discoverySeoBackground,
            }}
          >
            <Stack spacing={2.5}>
              <Typography
                sx={{
                  color: homepagePalette.textStrong,
                  fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                  fontSize: { xs: '1.55rem', md: '1.75rem' },
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {content.discovery.seoEngine.title}
              </Typography>
              <Typography
                sx={{
                  ...copySafeSx,
                  color: homepagePalette.textSoft,
                  fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  maxWidth: 900,
                }}
              >
                {content.discovery.seoEngine.description}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: 1.5,
                  pt: 0.75,
                  pb: 0.6,
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(homepagePalette.surfaceBorder, 0.72),
                    borderRadius: 999,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: alpha(homepagePalette.surfaceDeep, 0.3),
                  },
                }}
              >
                {content.discovery.seoEngine.leagueLabels?.map((league) => (
                  <Box
                    key={league}
                    // component={Link}
                    // href={localize(PUBLIC_HUB_PATHS.leagues)}
                    sx={{
                      ...panelSx,
                      display: 'block',
                      minWidth: { xs: 210, md: 240 },
                      maxWidth: { xs: 210, md: 240 },
                      borderRadius: 2.75,
                      px: 2.25,
                      py: 1.8,
                      bgcolor: alpha(homepagePalette.surface, 0.56),
                      textDecoration: 'none',
                      scrollSnapAlign: 'start',
                      transition: 'transform 220ms ease, border-color 220ms ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        borderColor: alpha(homepagePalette.accent, 0.48),
                      },
                    }}
                  >
                    <Stack spacing={1.2}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: 2.25,
                          display: 'grid',
                          placeItems: 'center',
                          background:
                            'linear-gradient(145deg, #ffffff 0%, #f7faff 100%)',
                          border: '1px solid',
                          borderColor: alpha('#ffffff', 0.78),
                          boxShadow: `0 10px 24px ${alpha(homepagePalette.shadow, 0.24)}`,
                          px: 1,
                          py: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          component="img"
                          src={leagueCardMeta[league]?.src}
                          alt={leagueCardMeta[league]?.alt ?? `${league} logo`}
                          sx={{
                            width: `${(leagueCardMeta[league]?.logoScale ?? 1) * 100}%`,
                            height: `${(leagueCardMeta[league]?.logoScale ?? 1) * 100}%`,
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: homepagePalette.textBody,
                          fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          lineHeight: 1.22,
                        }}
                      >
                        {league}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Box>

              {content.discovery.seoEngine.note ? (
                <Typography
                  sx={{
                    ...copySafeSx,
                    color: homepagePalette.textMuted,
                    fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                    fontSize: '0.8125rem',
                    lineHeight: 1.45,
                  }}
                >
                  {content.discovery.seoEngine.note}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </Box>
    );
  }

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
          title={content.discovery.title || sectionCopy.title}
          description={content.discovery.description || sectionCopy.description}
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
            // component={Link}
            // href={localize(content.discovery.featuredInsight.href)}
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
                  // component={Link}
                  // href={
                  //   index === 0
                  //     ? localize(PUBLIC_HUB_PATHS.teams)
                  //     : index === 1
                  //       ? localize(PUBLIC_HUB_PATHS.players)
                  //       : localize(PUBLIC_HUB_PATHS.leagues)
                  // }
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
