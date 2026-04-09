'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Locale } from '@/lib/i18n/config';
import { PublicStorePickerDialog } from '@/components/public/PublicStorePickerDialog';
import {
  copySafeSx,
  homepageFinalCtaPrimaryButtonSx,
  homepageFinalCtaSecondaryButtonSx,
  homepagePalette,
  motionRevealSx,
} from '@/components/public/public-homepage.styles';
import {
  publicSitePageMaxWidth,
  publicSitePagePx,
} from '@/components/public/public-site.styles';
import type { HomepageContent } from '@/modules/public/homepage-content';

const pagePx = publicSitePagePx;
const pageMaxWidth = publicSitePageMaxWidth;

export function HomepageFinalCtaSection({
  content,
  locale,
  localize,
  iosAppStoreUrl,
  androidPlayUrl,
}: {
  content: HomepageContent;
  locale: Locale;
  localize: (path: string) => string;
  iosAppStoreUrl?: string;
  androidPlayUrl?: string;
}) {
  const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);
  void localize;
  const hasDirectStoreButtons = Boolean(
    iosAppStoreUrl && androidPlayUrl && content.finalCta.secondaryStoreCtaLabel
  );
  const primaryButtonConfig = hasDirectStoreButtons
    ? {
        component: 'a' as const,
        href: iosAppStoreUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        label: content.finalCta.primaryCtaLabel,
      }
    : {
        onClick: () => setIsStorePickerOpen(true),
        label: content.hero.openAppLabel,
      };
  const secondaryButtonConfig = hasDirectStoreButtons
    ? {
        component: 'a' as const,
        href: androidPlayUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        label: content.finalCta.secondaryStoreCtaLabel,
      }
    : null;
  const { label: primaryButtonLabel, ...primaryButtonProps } = primaryButtonConfig;
  const secondaryButtonLabel = secondaryButtonConfig?.label;
  const secondaryButtonProps = secondaryButtonConfig
    ? {
        component: secondaryButtonConfig.component,
        href: secondaryButtonConfig.href,
        target: secondaryButtonConfig.target,
        rel: secondaryButtonConfig.rel,
      }
    : null;

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
          borderColor: homepagePalette.sectionBorder,
          borderRadius: { xs: '28px 28px 0 0', md: '36px 36px 0 0' },
          overflow: 'hidden',
          background: homepagePalette.finalCtaBackground,
          pt: { xs: 6, md: 11 },
          pb: { xs: 6, md: 9 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: pageMaxWidth, mx: 'auto', px: pagePx }}>
          <Stack spacing={2.75}>
            <Typography
              sx={{
                ...copySafeSx,
                color: homepagePalette.textCta,
                fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                fontSize: { xs: '2rem', sm: '2.35rem', md: '2.625rem' },
                fontWeight: 600,
                lineHeight: 1.02,
                maxWidth: '100%',
              }}
            >
              {content.finalCta.title}
            </Typography>

            <Typography
              sx={{
                ...copySafeSx,
                color: homepagePalette.textCtaSubtle,
                fontSize: { xs: '1rem', md: '1.0625rem' },
                fontWeight: 400,
                lineHeight: 1.45,
                maxWidth: 760,
              }}
            >
              {content.finalCta.description}
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
                {...primaryButtonProps}
                variant="contained"
                sx={homepageFinalCtaPrimaryButtonSx}
              >
                {primaryButtonLabel}
              </Button>
              {secondaryButtonProps ? (
                <Button
                  {...secondaryButtonProps}
                  variant="outlined"
                  sx={homepageFinalCtaSecondaryButtonSx}
                >
                  {secondaryButtonLabel}
                </Button>
              ) : null}
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
