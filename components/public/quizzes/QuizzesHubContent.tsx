import Link from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { QuizHubPage } from '@/modules/content/types';
import { getQuizUiCopy } from '@/modules/quizzes/localization';
import {
  quizBackdropSx,
  quizBodyTextSx,
  quizContentSx,
  quizDiscoveryCardSx,
  quizHeadlineFontFamily,
  quizHeroTitleSx,
  quizMutedTextSx,
  quizPrimaryButtonSx,
  quizQuizCardSx,
  quizRailSx,
  quizSectionSx,
} from '@/components/public/quizzes/quizStyles';

/**
 * Renders the public quiz hub using repository-backed quiz cards.
 */
export function QuizzesHubContent({ page }: { page: QuizHubPage }) {
  const copy = getQuizUiCopy(page.locale);
  const quizRail = page.quizzes.map((quiz) => quiz.title).join('  ·  ');

  return (
    <Box sx={quizSectionSx}>
      <Box sx={quizBackdropSx} />

      <Stack spacing={{ xs: 4, md: 5 }} sx={quizContentSx}>
        <Stack spacing={2.25} sx={{ maxWidth: 700, pt: { xs: 1, md: 2 } }}>
          <Typography component="h1" sx={quizHeroTitleSx}>
            {page.metaTitle}
          </Typography>
          <Typography sx={{ ...quizBodyTextSx, maxWidth: 560 }}>
            {page.intro}
          </Typography>

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
              {quizRail}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
            },
            gap: 2.5,
          }}
        >
          {page.quizzes.map((quiz, index) => (
            <Link
              key={quiz.slug}
              href={quiz.canonicalPath}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box
                sx={{
                  ...(index === 0 ? quizQuizCardSx : quizDiscoveryCardSx),
                  display: 'block',
                  minHeight: '100%',
                  px: { xs: 3, md: 3.25 },
                  py: { xs: 3, md: 3.25 },
                  transition: 'transform 240ms ease, border-color 240ms ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor:
                      index === 0
                        ? 'rgba(139, 92, 246, 0.56)'
                        : 'rgba(99, 102, 242, 0.5)',
                  },
                }}
              >
                <Stack spacing={2} sx={{ minHeight: '100%' }}>
                  <Typography
                    component="h2"
                    sx={{
                      color: '#f7f9ff',
                      fontFamily: quizHeadlineFontFamily,
                      fontSize: { xs: '1.35rem', md: '1.5rem' },
                      fontWeight: 600,
                      lineHeight: 1.2,
                      maxWidth: 320,
                    }}
                  >
                    {quiz.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: index === 0 ? '#c6d2e3' : '#cbd5e1',
                      fontFamily: quizHeadlineFontFamily,
                      fontSize: '0.875rem',
                      lineHeight: 1.62,
                      maxWidth: 360,
                    }}
                  >
                    {quiz.hubSubtitle}
                  </Typography>

                  <Typography
                    sx={{
                      ...quizMutedTextSx,
                      fontFamily: quizHeadlineFontFamily,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {quiz.hubStatLine}
                  </Typography>

                  <Box
                    sx={{
                      ...quizPrimaryButtonSx,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'flex-start',
                      mt: 'auto',
                    }}
                  >
                    <Typography sx={{ color: '#f8fbff', fontWeight: 600 }}>
                      {copy.openQuizLabel}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Link>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
