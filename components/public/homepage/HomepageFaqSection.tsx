'use client';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { alpha } from '@mui/material/styles';
import type { Locale } from '@/lib/i18n/config';
import { faqSectionTitle } from '@/components/public/homepage/homepage-copy';
import { SectionHeading } from '@/components/public/homepage/HomepageShared';
import {
  copySafeSx,
  motionRevealSx,
  panelSx,
} from '@/components/public/public-homepage.styles';
import { publicSitePageMaxWidth } from '@/components/public/public-site.styles';
import type { HomepageContent } from '@/modules/public/homepage-content';

const pageMaxWidth = publicSitePageMaxWidth;

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
