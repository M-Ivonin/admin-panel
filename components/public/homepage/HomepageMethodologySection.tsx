'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { PUBLIC_PAGE_PATHS } from '@/modules/content/public-pages';
import type { Locale } from '@/lib/i18n/config';
import {
  credibilityPanelCopy,
  trustContactRowLabel,
} from '@/components/public/homepage/homepage-copy';
import { SectionHeading } from '@/components/public/homepage/HomepageShared';
import {
  copySafeSx,
  motionRevealSx,
  panelSx,
} from '@/components/public/public-homepage.styles';
import type { HomepageContent } from '@/modules/public/homepage-content';

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
            title={content.methodology.title}
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
              {content.methodology.requiredCopy ? (
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
              ) : null}
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
