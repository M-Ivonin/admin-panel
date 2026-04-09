'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import { alpha } from '@mui/material/styles';
import { getClientConfig } from '@/lib/config';
import type { Locale } from '@/lib/i18n/config';
import {
  HomepageDiscoverySection,
  HomepageFaqSection,
  HomepageFinalCtaSection,
  HomepageHeroSection,
  HomepageMethodologySection,
  HomepageShowcaseSection,
} from '@/components/public/homepage';
import { PublicSiteFooter } from '@/components/public/PublicSiteFooter';
import { PublicSiteHeader } from '@/components/public/PublicSiteHeader';
import {
  homepageContentSx,
  homepageRootSx,
} from '@/components/public/public-homepage.styles';
import { getHomepageContent } from '@/modules/public/homepage-content';
import { buildLocalizedPath } from '@/modules/seo/route-registry';

export function PublicHomepage({ locale }: { locale: Locale }) {
  const content = getHomepageContent(locale);
  const clientConfig = getClientConfig();

  const [expandedFaq, setExpandedFaq] = useState<string | false>(
    content.faq.items[0]?.question ?? false
  );

  const localize = (path: string) => buildLocalizedPath(locale, path);

  useEffect(() => {
    setExpandedFaq(content.faq.items[0]?.question ?? false);
  }, [content.faq.items, locale]);

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes sbReveal': {
            '0%': { opacity: 0, transform: 'translateY(28px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
          '@keyframes sbFloatA': {
            '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
            '50%': { transform: 'translate3d(0, -12px, 0)' },
          },
          '@keyframes sbFloatB': {
            '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(-4deg)' },
            '50%': { transform: 'translate3d(0, 10px, 0) rotate(-2deg)' },
          },
          '@keyframes sbPulse': {
            '0%, 100%': {
              boxShadow: `0 0 0 0 ${alpha('#8b5cf6', 0.18)}`,
            },
            '50%': {
              boxShadow: `0 0 0 14px ${alpha('#8b5cf6', 0)}`,
            },
          },
          '@keyframes sbBeamShift': {
            '0%, 100%': {
              opacity: 0.24,
              transform: 'translate3d(0, 0, 0) rotate(-11deg)',
            },
            '50%': {
              opacity: 0.44,
              transform: 'translate3d(10px, -18px, 0) rotate(-8deg)',
            },
          },
          '@keyframes sbHeroCardA': {
            '0%, 100%': {
              transform: 'translate3d(0, 0, 0) rotate(8deg)',
            },
            '50%': {
              transform: 'translate3d(-4px, -16px, 0) rotate(10deg)',
            },
          },
          '@keyframes sbHeroCardB': {
            '0%, 100%': {
              transform: 'translate3d(0, 0, 0)',
            },
            '50%': {
              transform: 'translate3d(0, -14px, 0)',
            },
          },
          '.sb-reveal': {
            opacity: 0,
            animation: 'sbReveal 0.72s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          },
          '.sb-float-a': {
            animation: 'sbFloatA 7s ease-in-out infinite',
          },
          '.sb-float-b': {
            animation: 'sbFloatB 8.5s ease-in-out infinite',
          },
          '.sb-pulse': {
            animation: 'sbPulse 3.6s ease-in-out infinite',
          },
          '.sb-beam': {
            animation: 'sbBeamShift 8s ease-in-out infinite',
          },
          '.sb-hero-card-a': {
            animation: 'sbHeroCardA 7s ease-in-out infinite',
          },
          '.sb-hero-card-b': {
            animation: 'sbHeroCardB 7.2s ease-in-out infinite',
          },
        }}
      />

      <Box component="main" sx={homepageRootSx}>
        <PublicSiteHeader locale={locale} />

        <Box sx={homepageContentSx}>
          <HomepageHeroSection
            content={content}
            locale={locale}
            iosAppStoreUrl={clientConfig.iosAppStoreUrl}
            androidPlayUrl={clientConfig.androidPlayUrl}
          />

          <HomepageShowcaseSection content={content} />

          <HomepageMethodologySection
            content={content}
            locale={locale}
            localize={localize}
          />

          <HomepageDiscoverySection
            content={content}
            locale={locale}
            localize={localize}
          />

          <HomepageFaqSection
            content={content}
            expandedFaq={expandedFaq}
            onExpandedFaqChange={setExpandedFaq}
          />
        </Box>

        <HomepageFinalCtaSection
          content={content}
          locale={locale}
          localize={localize}
          iosAppStoreUrl={clientConfig.iosAppStoreUrl}
          androidPlayUrl={clientConfig.androidPlayUrl}
        />

        <PublicSiteFooter locale={locale} />
      </Box>
    </>
  );
}
