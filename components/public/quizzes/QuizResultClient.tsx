'use client';

import { useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { QuizResultPage } from '@/modules/content/types';
import {
  buildQuizShareText,
  getQuizUiCopy,
} from '@/modules/quizzes/localization';
import type { QuizScoreMap } from '@/modules/quizzes/types';
import { TernaryPlot } from '@/components/public/quizzes/TernaryPlot';
import {
  quizBackdropSx,
  quizChipSx,
  quizContentSx,
  quizDiscoveryCardSx,
  quizEyebrowSx,
  quizHeadlineFontFamily,
  quizHeroPanelSx,
  quizHeroTitleSx,
  quizPrimaryButtonSx,
  quizQuizCardSx,
  quizRailSx,
  quizSecondaryButtonSx,
  quizSectionSx,
} from '@/components/public/quizzes/quizStyles';

interface QuizResultClientProps {
  page: QuizResultPage;
  scores: QuizScoreMap;
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1).replace(/\.0$/, '')}%`;
}

/**
 * Renders the public quiz result route.
 */
export function QuizResultClient({ page, scores }: QuizResultClientProps) {
  const copy = getQuizUiCopy(page.locale);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  async function handleShare() {
    const shareTitle = `${page.result.name} — ${page.quizTitle}`;
    const shareText = buildQuizShareText(
      page.locale,
      page.result.name,
      page.quizTitle
    );
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareFeedback(copy.sharedSuccessfullyLabel);
        return;
      } catch {
        // Fall through to clipboard copy.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback(copy.linkCopiedLabel);
    } catch {
      setShareFeedback(copy.shareUnavailableLabel);
    }
  }

  return (
    <Box sx={quizSectionSx}>
      <Box sx={quizBackdropSx} />

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={{ xs: 3, md: 4 }}
        sx={quizContentSx}
      >
        <Stack spacing={3.25} sx={{ flex: '1 1 0%', maxWidth: 700 }}>
          <Typography sx={quizEyebrowSx}>{page.resultHeading}</Typography>

          <Stack spacing={2}>
            <Typography component="h1" sx={quizHeroTitleSx}>
              {page.result.name}
            </Typography>

            <Typography
              sx={{
                color: '#aab6ca',
                fontFamily: quizHeadlineFontFamily,
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.55,
                maxWidth: 540,
              }}
            >
              {page.result.description}
            </Typography>
          </Stack>

          <Box sx={{ ...quizRailSx, maxWidth: 'fit-content' }}>
            <Typography
              sx={{
                color: '#b8c4d8',
                fontFamily: quizHeadlineFontFamily,
                fontSize: '0.8125rem',
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {page.axes
                .map(
                  (axis) =>
                    `${axis.label} ${formatPercentage(scores[axis.key] ?? 0)}`
                )
                .join('  ·  ')}
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="outlined"
              onClick={handleShare}
              sx={quizSecondaryButtonSx}
            >
              {page.shareButtonLabel}
            </Button>
            <Button
              component={Link}
              href={`/${page.locale}/quizzes/${page.quizSlug}`}
              variant="contained"
              sx={quizPrimaryButtonSx}
            >
              {page.retakeButtonLabel}
            </Button>
          </Stack>

          <Box
            component="a"
            href={page.shareCallToActionUrl}
            target="_blank"
            rel="noreferrer noopener"
            sx={{
              ...quizDiscoveryCardSx,
              display: 'block',
              maxWidth: 420,
              px: 3,
              py: 2.5,
              textDecoration: 'none',
              transition: 'transform 240ms ease, border-color 240ms ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: 'rgba(99, 102, 242, 0.5)',
              },
            }}
          >
            <Stack spacing={0.75}>
              <Typography sx={quizEyebrowSx}>
                {copy.continueWithSirBroLabel}
              </Typography>
              <Typography
                sx={{
                  color: '#f7f9ff',
                  fontFamily: quizHeadlineFontFamily,
                  fontSize: { xs: '1.15rem', md: '1.3rem' },
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {page.shareCallToActionLabel}
              </Typography>
              <Typography
                sx={{
                  color: '#cbd5e1',
                  fontFamily: quizHeadlineFontFamily,
                  fontSize: '0.875rem',
                  lineHeight: 1.55,
                }}
              >
                {copy.openDownloadPageLabel}
              </Typography>
            </Stack>
          </Box>

          {shareFeedback ? (
            <Typography
              sx={{
                color: '#94a3b8',
                fontFamily: quizHeadlineFontFamily,
                fontSize: '0.8125rem',
              }}
            >
              {shareFeedback}
            </Typography>
          ) : null}
        </Stack>

        <Box
          sx={{
            ...quizHeroPanelSx,
            flex: '0 1 520px',
            px: { xs: 2.5, md: 3 },
            py: { xs: 2.5, md: 3 },
          }}
        >
          <Stack spacing={2.25}>
            <Chip label={page.shareCardLabel} size="small" sx={quizChipSx} />

            <Typography
              sx={{
                color: '#f8fafc',
                fontFamily: quizHeadlineFontFamily,
                fontSize: { xs: '1.35rem', md: '1.55rem' },
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {copy.scoreProfileLabel}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <TernaryPlot
                axes={page.axes}
                centerLabel={page.plotCenterLabel}
                scores={scores}
              />
            </Box>

            <Stack spacing={1.25}>
              {page.axes.map((axis, index) => (
                <Box
                  key={axis.key}
                  sx={{
                    ...(index === 0 ? quizQuizCardSx : quizDiscoveryCardSx),
                    px: 2.25,
                    py: 1.9,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="baseline">
                    <Typography
                      sx={{
                        color: '#f7f9ff',
                        fontFamily: quizHeadlineFontFamily,
                        fontSize: { xs: '1.55rem', md: '1.75rem' },
                        fontWeight: 600,
                        lineHeight: 1,
                      }}
                    >
                      {formatPercentage(scores[axis.key] ?? 0)}
                    </Typography>
                    <Typography sx={quizEyebrowSx}>{axis.label}</Typography>
                  </Stack>
                  <Typography
                    sx={{
                      mt: 0.65,
                      color: index === 0 ? '#c6d2e3' : '#cbd5e1',
                      fontFamily: quizHeadlineFontFamily,
                      fontSize: '0.8125rem',
                      lineHeight: 1.58,
                    }}
                  >
                    {axis.hint}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
