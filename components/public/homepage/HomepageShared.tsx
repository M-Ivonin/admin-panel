'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import {
  homepageProductCardDescriptionSx,
  homepageProductCardMediaFrameSx,
  homepageProductCardMediaSx,
  homepageProductCardRootSx,
  homepageProductCardTitleSx,
  homepageSectionHeadingDescriptionSx,
  homepageSectionHeadingStackSx,
  homepageSectionHeadingTitleSx,
  homepageStoreBadgeImageSx,
  homepageStoreBadgeLinkSx,
} from '@/components/public/public-homepage.styles';
import type { HomepageFeaturePreview } from '@/modules/public/homepage-content';

export function SeoCardVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background:
            'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, rgba(15,23,42,0.5) 100%)',
          border: '1px solid',
          borderColor: alpha('#f8e7b0', 0.28),
          boxShadow: `0 10px 24px ${alpha('#020617', 0.24)}`,
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src="/assets/homepage/seo-cards/real-madrid-logo.png"
          alt="Real Madrid crest"
          sx={{
            width: 42,
            height: 42,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Box>
    );
  }

  if (index === 1) {
    return (
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 32% 28%, rgba(95,75,57,0.35) 0%, rgba(19,23,34,0.96) 100%)',
          border: '1px solid',
          borderColor: alpha('#64748b', 0.4),
          boxShadow: `0 10px 24px ${alpha('#020617', 0.26)}`,
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src="/assets/homepage/seo-cards/mbappe.jpg"
          alt="Kylian Mbappe"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: 2.25,
        display: 'grid',
        placeItems: 'center',
        background:
          'linear-gradient(180deg, rgba(95,111,255,0.22) 0%, rgba(36,50,101,0.32) 100%)',
        border: '1px solid',
        borderColor: alpha('#7c8cff', 0.34),
        boxShadow: `0 10px 24px ${alpha('#020617', 0.24)}`,
      }}
    >
      <Box
        component="img"
        src="/assets/homepage/seo-cards/premier-league.svg"
        alt="Premier League logo"
        sx={{
          width: 34,
          height: 34,
          objectFit: 'contain',
          display: 'block',
          filter: 'brightness(1.15)',
        }}
      />
    </Box>
  );
}

export function StoreBadgeLink({
  href,
  src,
  alt,
  width,
  pulse = false,
}: {
  href?: string;
  src: string;
  alt: string;
  width: number;
  pulse?: boolean;
}) {
  if (!href) {
    return null;
  }

  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={pulse ? 'sb-pulse' : undefined}
      sx={homepageStoreBadgeLinkSx}
    >
      <Box component="img" src={src} alt={alt} sx={homepageStoreBadgeImageSx(width)} />
    </Box>
  );
}

export function SectionHeading({
  title,
  description,
  maxWidth = 760,
}: {
  title: string;
  description?: string;
  maxWidth?: number;
}) {
  return (
    <Stack spacing={1.25} sx={homepageSectionHeadingStackSx(maxWidth)}>
      <Typography sx={homepageSectionHeadingTitleSx}>{title}</Typography>
      {description ? (
        <Typography sx={homepageSectionHeadingDescriptionSx}>{description}</Typography>
      ) : null}
    </Stack>
  );
}

export function ProductCard({
  item,
  imageSrc,
  accentColor,
}: {
  item: HomepageFeaturePreview;
  imageSrc: string;
  accentColor: string;
}) {
  return (
    <Box sx={homepageProductCardRootSx(accentColor)}>
      <Stack spacing={{ xs: 2, md: 2.25 }}>
        <Box sx={homepageProductCardMediaFrameSx}>
          <Box component="img" src={imageSrc} alt={item.title} sx={homepageProductCardMediaSx} />
        </Box>

        <Stack spacing={1}>
          <Typography sx={homepageProductCardTitleSx}>{item.title}</Typography>
          <Typography sx={homepageProductCardDescriptionSx}>{item.description}</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
