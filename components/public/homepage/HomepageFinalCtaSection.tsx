'use client';

import { useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Locale } from '@/lib/i18n/config';
import { PublicStorePickerDialog } from '@/components/public/PublicStorePickerDialog';
import { finalCtaCopy } from '@/components/public/homepage/homepage-copy';
import {
  copySafeSx,
  motionRevealSx,
} from '@/components/public/public-homepage.styles';
import {
  publicSitePageMaxWidth,
  publicSitePagePx,
} from '@/components/public/public-site.styles';
import type { HomepageContent } from '@/modules/public/homepage-content';
import { PUBLIC_HUB_PATHS } from '@/modules/public/scaffold-pages';

const pagePx = publicSitePagePx;
const pageMaxWidth = publicSitePageMaxWidth;

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
  const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);

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
                onClick={() => setIsStorePickerOpen(true)}
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

      <PublicStorePickerDialog
        locale={locale}
        open={isStorePickerOpen}
        onClose={() => setIsStorePickerOpen(false)}
      />
    </Box>
  );
}
