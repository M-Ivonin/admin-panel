'use client';

import Link from 'next/link';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { alpha } from '@mui/material/styles';
import { PUBLIC_PAGE_PATHS } from '@/modules/content/public-pages';
import type { Locale } from '@/lib/i18n/config';
import type { HomepageContent } from '@/modules/public/homepage-content';
import { PUBLIC_HUB_PATHS } from '@/modules/public/scaffold-pages';
import {
  copySafeSx,
  motionRevealSx,
  panelSx,
} from '@/components/public/public-homepage.styles';
import {
  publicSitePageMaxWidth,
  publicSitePagePx,
} from '@/components/public/public-site.styles';
import {
  credibilityPanelCopy,
  discoverySectionCopy,
  faqSectionTitle,
  finalCtaCopy,
  heroPanelChipLabel,
  heroStoryCardCopy,
  methodologySectionTitle,
  seoSummaryCards,
  showcaseSectionCopy,
  trustContactRowLabel,
  trustLinkLabels,
} from '@/components/public/homepage/homepage-copy';
import {
  ProductCard,
  SectionHeading,
  SeoCardVisual,
  StoreBadgeLink,
} from '@/components/public/homepage/HomepageShared';

const pagePx = publicSitePagePx;
const pageMaxWidth = publicSitePageMaxWidth;

export function HomepageHeroSection({
  content,
  locale,
  iosAppStoreUrl,
  androidPlayUrl,
}: {
  content: HomepageContent;
  locale: Locale;
  iosAppStoreUrl?: string;
  androidPlayUrl?: string;
}) {
  return (
    <Box
      component="section"
      sx={{
        ...motionRevealSx(120),
        position: 'relative',
        minHeight: { xs: 'auto', lg: 760 },
        borderRadius: 0,
        py: { xs: 1, md: 0 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <Box
          className="sb-float-a"
          sx={{
            position: 'absolute',
            top: { xs: 80, md: 40 },
            right: { xs: -40, md: 40 },
            width: { xs: 260, md: 420 },
            height: { xs: 260, md: 420 },
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(99,102,242,0.36) 0%, rgba(99,102,242,0) 72%)',
            filter: 'blur(10px)',
          }}
        />
        <Box
          className="sb-float-b"
          sx={{
            position: 'absolute',
            top: { xs: 180, md: 250 },
            right: { xs: 0, md: 120 },
            width: { xs: 180, md: 240 },
            height: { xs: 180, md: 240 },
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0) 72%)',
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 3.5, lg: 4.5 },
          width: '100%',
          alignItems: { xs: 'center', lg: 'flex-start' },
          justifyContent: { lg: 'space-between' },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: { lg: 620 }, position: 'relative', zIndex: 1 }}>
          <Stack spacing={{ xs: 2.25, md: 2.75 }} sx={{ pt: { xs: 0, md: 2, lg: 3 } }}>
            <Typography
              sx={{
                ...copySafeSx,
                maxWidth: { xs: '100%', lg: 620 },
                fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                fontSize: { xs: '2.15rem', sm: '3rem', lg: '4.5rem' },
                fontWeight: 700,
                lineHeight: { xs: 1.02, lg: 0.96 },
                letterSpacing: { xs: '-0.04em', lg: '-0.05em' },
                color: '#f8fafc',
                ...motionRevealSx(180),
              }}
            >
              {content.hero.title}
            </Typography>

            <Typography
              sx={{
                ...copySafeSx,
                maxWidth: { xs: '100%', lg: 560 },
                color: '#94a3b8',
                fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1875rem' },
                lineHeight: { xs: 1.55, md: 1.45 },
                ...motionRevealSx(260),
              }}
            >
              {content.hero.description}
            </Typography>

            <Stack
              id="download"
              direction="row"
              spacing={1.5}
              sx={{
                flexWrap: 'nowrap',
                alignItems: 'center',
                ...motionRevealSx(320),
              }}
            >
              <StoreBadgeLink
                href={iosAppStoreUrl}
                src="/assets/appstore-badge.svg"
                alt="App Store"
                width={124}
                pulse
              />
              <StoreBadgeLink
                href={androidPlayUrl}
                src="/assets/playstore-badge.svg"
                alt="Google Play"
                width={124}
              />
            </Stack>

            <Box
              sx={{
                ...panelSx,
                width: '100%',
                maxWidth: { xs: '100%', lg: 560 },
                borderRadius: { xs: 3, sm: '999px' },
                bgcolor: alpha('#0b1220', 0.58),
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1.25, sm: 1.35 },
                ...motionRevealSx(380),
              }}
            >
              <Typography
                sx={{
                  ...copySafeSx,
                  color: '#cbd5e1',
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {trustLinkLabels[locale].join('  ·  ')}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: { xs: 360, sm: 460, lg: 540 },
            ml: { lg: 'auto' },
            minHeight: { xs: 452, sm: 500, lg: 592 },
            ...motionRevealSx(260),
          }}
        >
          <Box
            className="sb-beam"
            sx={{
              position: 'absolute',
              top: { xs: 10, lg: 38 },
              left: { xs: 8, sm: 20, lg: -20 },
              width: { xs: 180, sm: 220, lg: 250 },
              height: { xs: 340, sm: 420, lg: 560 },
              borderRadius: '999px',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(165,180,252,0.4) 52%, rgba(255,255,255,0) 100%)',
              opacity: { xs: 0.22, lg: 0.36 },
              pointerEvents: 'none',
              filter: 'blur(0px)',
            }}
          />

          <Box
            sx={{
              ...panelSx,
              position: 'relative',
              borderRadius: { xs: 3.5, md: 4.5 },
              width: '100%',
              minHeight: { xs: 452, sm: 500, lg: 592 },
              background:
                'linear-gradient(180deg, rgba(15,23,42,0.56) 0%, rgba(17,24,39,0.68) 100%)',
              borderColor: alpha('#475569', 0.72),
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                display: 'block',
                left: { xs: -42, lg: -26 },
                bottom: { xs: 44, lg: 32 },
                width: { xs: 180, lg: 202 },
                height: { xs: 330, lg: 372 },
                borderRadius: '999px',
                bgcolor: alpha('#0b1220', 0.42),
                filter: 'blur(2px)',
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                display: 'block',
                left: { xs: 16, lg: 62 },
                bottom: { xs: 10, lg: -12 },
                width: { xs: 132, lg: 148 },
                height: { xs: 224, lg: 236 },
                borderRadius: '999px',
                bgcolor: alpha('#111827', 0.38),
                pointerEvents: 'none',
              }}
            />

            <Chip
              label={heroPanelChipLabel[locale]}
              sx={{
                position: 'absolute',
                top: { xs: 18, sm: 26 },
                left: { xs: 18, sm: 28 },
                zIndex: 2,
                maxWidth: { xs: 170, sm: 220 },
                color: '#cbd5e1',
                bgcolor: '#0b1220',
                border: '1px solid',
                borderColor: alpha('#334155', 0.96),
                '& .MuiChip-label': {
                  px: { xs: 1, sm: 1.5 },
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                  fontWeight: 600,
                  fontSize: { xs: '0.625rem', sm: '0.75rem' },
                },
              }}
            />

            <Box
              sx={{
                ...panelSx,
                position: 'absolute',
                top: { xs: 84, sm: 84, lg: 78 },
                left: { xs: '50%', lg: 142 },
                transform: { xs: 'translateX(-50%)', lg: 'none' },
                width: { xs: 212, sm: 250, lg: 262 },
                height: { xs: 320, sm: 474, lg: 494 },
                borderRadius: 3.5,
                bgcolor: alpha('#0d1017', 0.44),
                overflow: 'hidden',
                borderColor: alpha('#475569', 0.36),
              }}
            >
              <Box
                component="img"
                src="/assets/homepage/hero-app-shot.jpg"
                alt="SirBro app screenshot"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Box>

            <Box
              className="sb-hero-card-a"
              sx={{
                ...panelSx,
                display: 'block',
                position: 'absolute',
                top: { xs: 188, sm: 170, lg: 176 },
                right: { xs: 10, lg: 14 },
                width: { xs: 126, sm: 152, lg: 158 },
                borderRadius: 2.25,
                bgcolor: alpha('#ecfdf3', 0.72),
                color: '#111827',
                px: { xs: 1.15, sm: 1.75 },
                py: { xs: 1, sm: 1.5 },
                willChange: 'transform',
                boxShadow: `0 12px 28px ${alpha('#0f172a', 0.24)}`,
              }}
            >
              <Typography
                sx={{
                  ...copySafeSx,
                  color: '#1d4ed8',
                  fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                Momentum swing
                <br />
                63% pressure after 55&apos;
              </Typography>
            </Box>

            <Box
              className="sb-float-b"
              sx={{
                ...panelSx,
                position: 'absolute',
                left: { xs: 12, lg: 22 },
                bottom: { xs: 28, sm: 96, lg: 106 },
                width: { xs: 172, sm: 208, lg: 220 },
                borderRadius: 2.5,
                px: { xs: 1.25, sm: 1.75 },
                py: { xs: 1.15, sm: 1.5 },
                background:
                  'linear-gradient(180deg, rgba(109,40,217,0.76) 0%, rgba(76,29,149,0.72) 52%, rgba(36,18,74,0.68) 100%)',
                transform: { xs: 'rotate(-4deg)', lg: 'rotate(-7deg)' },
                boxShadow: `0 14px 28px ${alpha('#4c1d95', 0.34)}`,
              }}
            >
              <Stack spacing={0.75}>
                <Typography
                  sx={{
                    ...copySafeSx,
                    color: '#ffffff',
                    fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {content.hero.chatPrompt}
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Box
            className="sb-hero-card-b"
            sx={{
              ...panelSx,
              display: 'block',
              position: 'absolute',
              top: { xs: 18, sm: 34, lg: 32 },
              right: { xs: 10, lg: 22 },
              width: { xs: 142, sm: 208, lg: 212 },
              borderRadius: 2.5,
              background:
                'linear-gradient(180deg, rgba(58,36,97,0.72) 0%, rgba(38,25,61,0.68) 100%)',
              borderColor: alpha('#8b5cf6', 0.56),
              px: { xs: 1.15, sm: 1.75 },
              py: { xs: 1, sm: 1.5 },
              zIndex: 2,
              willChange: 'transform',
              boxShadow: `0 12px 28px ${alpha('#4c1d95', 0.28)}`,
            }}
          >
            <Typography
              sx={{
                ...copySafeSx,
                color: '#e2e8f0',
                fontSize: { xs: '0.72rem', sm: '0.9375rem' },
                fontWeight: 600,
                lineHeight: 1.35,
              }}
            >
              {heroStoryCardCopy[locale]}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function HomepageShowcaseSection({
  content,
  locale,
}: {
  content: HomepageContent;
  locale: Locale;
}) {
  const sectionCopy = showcaseSectionCopy[locale];

  return (
    <Box
      id="chat-preview"
      component="section"
      sx={{
        ...motionRevealSx(180),
        py: { xs: 1, md: 0 },
      }}
    >
      <Stack spacing={3}>
        <SectionHeading
          title={sectionCopy.title}
          description={sectionCopy.description}
          maxWidth={pageMaxWidth}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2.5,
          }}
        >
          <ProductCard
            item={content.showcase.items[0]}
            imageSrc="/assets/homepage/showcase-feed.jpg"
            accentColor="#334155"
          />
          <ProductCard
            item={content.showcase.items[1]}
            imageSrc="/assets/homepage/showcase-chat.jpg"
            accentColor="#6366f2"
          />
          <ProductCard
            item={content.showcase.items[2]}
            imageSrc="/assets/homepage/showcase-timeline.jpg"
            accentColor="#2e5a53"
          />
        </Box>
      </Stack>
    </Box>
  );
}

export function HomepageMethodologySection({
  content,
  locale,
  localize,
}: {
  content: HomepageContent;
  locale: Locale;
  localize: (path: string) => string;
}) {
  const panelCopy = credibilityPanelCopy[locale];

  return (
    <Box
      id="how-it-works"
      component="section"
      sx={{
        ...motionRevealSx(220),
        py: { xs: 1, md: 0 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 3, lg: 5 },
          alignItems: 'stretch',
        }}
      >
        <Stack spacing={2.5} sx={{ width: '100%', maxWidth: { lg: 640 } }}>
          <SectionHeading
            title={methodologySectionTitle[locale]}
            description={content.methodology.description}
          />

          {content.methodology.steps.map((step) => (
            <Box
              key={step.step}
              sx={{
                ...panelSx,
                borderRadius: 3,
                bgcolor: alpha('#111827', 0.56),
                px: { xs: 2, md: 2.5 },
                py: { xs: 2, md: 2.25 },
                transition: 'transform 220ms ease, border-color 220ms ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: alpha('#6366f2', 0.5),
                },
              }}
            >
              <Stack spacing={1.2}>
                <Typography
                  sx={{
                    color: '#a5b4fc',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                >
                  {step.step}
                </Typography>
                <Typography
                  sx={{
                    ...copySafeSx,
                    color: '#f1f5f9',
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    fontWeight: 600,
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  sx={{
                    ...copySafeSx,
                    color: '#94a3b8',
                    fontSize: '0.9375rem',
                    lineHeight: 1.55,
                  }}
                >
                  {step.description}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>

        <Box
          sx={{
            ...panelSx,
            borderRadius: 3.5,
            bgcolor: alpha('#0f172a', 0.56),
            px: { xs: 2.5, md: 3.5 },
            py: { xs: 2.5, md: 3.5 },
            flex: { xs: '0 0 auto', lg: '1 1 0' },
          }}
        >
          <Stack spacing={2.5}>
            <Stack spacing={1.1}>
              <Typography
                sx={{
                  color: '#f8fafc',
                  fontSize: { xs: '1.45rem', md: '1.75rem' },
                  fontWeight: 600,
                  lineHeight: 1.18,
                }}
              >
                {panelCopy.title}
              </Typography>
              <Typography
                sx={{
                  ...copySafeSx,
                  color: '#94a3b8',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                {panelCopy.description}
              </Typography>
              <Typography
                sx={{
                  ...copySafeSx,
                  color: '#d1d5db',
                  fontSize: '0.9375rem',
                  lineHeight: 1.65,
                }}
              >
                {content.methodology.requiredCopy}
              </Typography>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              {content.methodology.trustItems.map((item) => (
                <Box
                  key={item.title}
                  component={Link}
                  href={localize(item.href)}
                  sx={{
                    ...panelSx,
                    display: 'block',
                    borderRadius: 2.5,
                    bgcolor: alpha('#0b1220', 0.54),
                    px: 2,
                    py: 1.9,
                    textDecoration: 'none',
                    transition: 'transform 220ms ease, border-color 220ms ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: alpha('#6366f2', 0.5),
                    },
                  }}
                >
                  <Stack spacing={0.75}>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>

            <Box
              component={Link}
              href={localize(PUBLIC_PAGE_PATHS.contact)}
              sx={{
                ...panelSx,
                display: 'block',
                borderRadius: 2.25,
                bgcolor: alpha('#111827', 0.56),
                px: 2,
                py: 1.75,
                color: '#e2e8f0',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              {trustContactRowLabel[locale]}
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

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

export function HomepageFaqSection({
  content,
  locale,
  expandedFaq,
  onExpandedFaqChange,
}: {
  content: HomepageContent;
  locale: Locale;
  expandedFaq: string | false;
  onExpandedFaqChange: (value: string | false) => void;
}) {
  return (
    <Box
      component="section"
      sx={{
        ...motionRevealSx(320),
        py: { xs: 1, md: 0 },
      }}
    >
      <Stack spacing={2.5}>
        <SectionHeading
          title={faqSectionTitle[locale]}
          description={content.faq.description}
          maxWidth={pageMaxWidth}
        />

        <Stack spacing={1.5}>
          {content.faq.items.map((item) => (
            <Accordion
              key={item.question}
              expanded={expandedFaq === item.question}
              onChange={(_, isExpanded) =>
                onExpandedFaqChange(isExpanded ? item.question : false)
              }
              disableGutters
              elevation={0}
              sx={{
                ...panelSx,
                borderRadius: { xs: '20px !important', md: '24px !important' },
                bgcolor: alpha('#111827', 0.56),
                '&::before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#a5b4fc', fontSize: 28 }} />}
                sx={{
                  px: { xs: 2, md: 2.75 },
                  py: { xs: 0.5, md: 0.75 },
                  '& .MuiAccordionSummary-content': { my: { xs: 1, md: 1.25 } },
                }}
              >
                <Typography
                  sx={{
                    ...copySafeSx,
                    color: '#e2e8f0',
                    fontSize: { xs: '0.9rem', md: '0.9375rem' },
                    fontWeight: 600,
                  }}
                >
                  {item.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{ px: { xs: 2, md: 2.75 }, pb: { xs: 2, md: 2.5 }, pt: 0 }}
              >
                <Typography
                  sx={{
                    ...copySafeSx,
                    color: '#94a3b8',
                    fontSize: { xs: '0.85rem', md: '0.875rem' },
                    lineHeight: 1.6,
                  }}
                >
                  {item.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export function HomepageFinalCtaSection({
  content,
  locale,
  localize,
}: {
  content: HomepageContent;
  locale: Locale;
  localize: (path: string) => string;
}) {
  const sectionCopy = finalCtaCopy[locale];

  return (
    <Box
      component="section"
      sx={{
        ...motionRevealSx(380),
        mt: { xs: 1, md: 2 },
        pt: { xs: 7, md: 9 },
        width: '100vw',
        ml: 'calc(50% - 50vw)',
        mr: 'calc(50% - 50vw)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          minHeight: { md: 325 },
          borderTop: '1px solid',
          borderColor: '#334155',
          borderRadius: { xs: '28px 28px 0 0', md: '36px 36px 0 0' },
          overflow: 'hidden',
          background:
            'linear-gradient(90deg, #0a1228 0%, #11162a 52%, #2b2760 82%, #3a2f73 100%)',
          pt: { xs: 6, md: 11 },
          pb: { xs: 6, md: 9 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: pageMaxWidth, mx: 'auto', px: pagePx }}>
          <Stack spacing={2.75}>
            <Typography
              sx={{
                ...copySafeSx,
                color: '#f9fafb',
                fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                fontSize: { xs: '2rem', sm: '2.35rem', md: '2.625rem' },
                fontWeight: 600,
                lineHeight: 1.02,
                maxWidth: '100%',
              }}
            >
              {sectionCopy.title}
            </Typography>

            <Typography
              sx={{
                ...copySafeSx,
                color: '#ddd6fe',
                fontSize: { xs: '1rem', md: '1.0625rem' },
                fontWeight: 400,
                lineHeight: 1.45,
                maxWidth: 760,
              }}
            >
              {sectionCopy.description}
            </Typography>

            <Stack
              direction="row"
              spacing={1.75}
              sx={{
                flexWrap: 'nowrap',
                alignItems: 'stretch',
              }}
            >
              <Button
                component="a"
                href="#download"
                variant="contained"
                sx={{
                  flex: '1 1 0',
                  minWidth: 0,
                  borderRadius: '999px',
                  px: { xs: 1.5, sm: 2.25 },
                  py: 1.75,
                  bgcolor: '#4f46e5',
                  color: '#ffffff',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 600,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 10px 28px rgba(139, 92, 246, 0.33)',
                  '&:hover': {
                    bgcolor: '#4f46e5',
                    boxShadow: '0 10px 28px rgba(139, 92, 246, 0.33)',
                  },
                }}
              >
                {content.finalCta.primaryCtaLabel}
              </Button>
              <Button
                component={Link}
                href={localize(PUBLIC_HUB_PATHS.insights)}
                variant="outlined"
                sx={{
                  flex: '1 1 0',
                  minWidth: 0,
                  borderRadius: '999px',
                  px: { xs: 1.5, sm: 2.25 },
                  py: 1.75,
                  color: '#f9fafb',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 600,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  borderColor: '#8b5cf6',
                  bgcolor: '#221735',
                  '&:hover': {
                    borderColor: '#8b5cf6',
                    bgcolor: '#221735',
                  },
                }}
              >
                {content.finalCta.secondaryCtaLabel}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
