'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Locale } from '@/lib/i18n/config';
import { StoreBadgeLink } from '@/components/public/homepage/HomepageShared';
import {
  heroPanelChipLabel,
  heroStoryCardCopy,
  trustLinkLabels,
} from '@/components/public/homepage/homepage-copy';
import {
  copySafeSx,
  motionRevealSx,
  panelSx,
} from '@/components/public/public-homepage.styles';
import type { HomepageContent } from '@/modules/public/homepage-content';

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

            <Typography
              sx={{
                ...copySafeSx,
                maxWidth: { xs: '100%', lg: 620 },
                color: '#cbd5e1',
                fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                lineHeight: 1.6,
                ...motionRevealSx(300),
              }}
            >
              {content.hero.proof}
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
                {content.hero.trustLine ?? trustLinkLabels[locale].join('  ·  ')}
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
