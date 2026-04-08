'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Locale } from '@/lib/i18n/config';
import { ProductCard, SectionHeading } from '@/components/public/homepage/HomepageShared';
import { showcaseSectionCopy } from '@/components/public/homepage/homepage-copy';
import { motionRevealSx } from '@/components/public/public-homepage.styles';
import { publicSitePageMaxWidth } from '@/components/public/public-site.styles';
import type { HomepageContent } from '@/modules/public/homepage-content';

const pageMaxWidth = publicSitePageMaxWidth;

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
