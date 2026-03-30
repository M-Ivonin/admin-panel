'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { QuizPage } from '@/modules/content/types';
import { getQuizDefinition } from '@/modules/quizzes/definitions';
import {
  buildQuizSummaryLine,
  getQuizUiCopy,
} from '@/modules/quizzes/localization';
import {
  calculateQuizScores,
  encodeResultPayload,
  resolveQuizResult,
} from '@/modules/quizzes/session';
import {
  quizBackdropSx,
  quizBodyTextSx,
  quizChipSx,
  quizContentSx,
  quizDeeperPanelSx,
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

type QuizStage = 'landing' | 'quiz';

/**
 * Builds the transient answer state for a quiz detail flow.
 */
function buildInitialAnswers(questionCount: number): number[] {
  return Array(questionCount).fill(50);
}

/**
 * Renders the public quiz landing and questionnaire flow.
 */
export function QuizDetailClient({ page }: { page: QuizPage }) {
  const router = useRouter();
  const copy = getQuizUiCopy(page.locale);
  const [stage, setStage] = useState<QuizStage>('landing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(() =>
    buildInitialAnswers(page.questions.length)
  );

  function handleStartQuiz() {
    setStage('quiz');
  }

  function handleSliderChange(_: Event, value: number | number[]) {
    const nextValue = Array.isArray(value) ? value[0] : value;
    setAnswers((currentAnswers) => {
      const updatedAnswers = [...currentAnswers];
      updatedAnswers[currentQuestionIndex] = nextValue;
      return updatedAnswers;
    });
  }

  function handleBack() {
    setCurrentQuestionIndex((index) => Math.max(0, index - 1));
  }

  function handleNext() {
    if (currentQuestionIndex < page.questions.length - 1) {
      setCurrentQuestionIndex((index) => index + 1);
      return;
    }

    const definition = getQuizDefinition(page.slug);
    if (!definition) {
      return;
    }

    const scores = calculateQuizScores(definition, answers);
    const result = resolveQuizResult(definition, scores);
    if (!result) {
      return;
    }

    const payload = encodeResultPayload(definition, scores);
    router.push(`${page.canonicalPath}/result/${result.slug}?s=${payload}`);
  }

  if (stage === 'landing') {
    return (
      <QuizLanding
        copy={copy}
        onStart={handleStartQuiz}
        page={page}
        summaryLine={buildQuizSummaryLine(
          page.locale,
          page.questions.length,
          page.results.length
        )}
      />
    );
  }

  return (
    <QuizQuestions
      answers={answers}
      copy={copy}
      currentQuestionIndex={currentQuestionIndex}
      onBack={handleBack}
      onNext={handleNext}
      onSliderChange={handleSliderChange}
      page={page}
    />
  );
}

function QuizLanding({
  page,
  onStart,
  summaryLine,
  copy,
}: {
  page: QuizPage;
  onStart: () => void;
  summaryLine: string;
  copy: ReturnType<typeof getQuizUiCopy>;
}) {
  const previewResults = page.results.slice(0, 3);

  return (
    <Box sx={quizSectionSx}>
      <Box sx={quizBackdropSx} />

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={{ xs: 3, md: 4 }}
        sx={quizContentSx}
      >
        <Stack spacing={3.25} sx={{ flex: '1 1 0%', maxWidth: 700 }}>
          <Typography sx={quizEyebrowSx}>{page.eyebrow}</Typography>

          <Stack spacing={2}>
            <Typography component="h1" sx={quizHeroTitleSx}>
              <Box component="span" sx={{ display: 'block' }}>
                {page.heroTitlePrimary}
              </Box>
              <Box component="span" sx={{ display: 'block' }}>
                {page.heroTitleAccent}
              </Box>
            </Typography>

            <Typography sx={{ ...quizBodyTextSx, maxWidth: 520 }}>
              {page.landingDescription}{' '}
              <Box component="span" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                {page.landingEmphasis}
              </Box>
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          >
            <Button
              variant="contained"
              onClick={onStart}
              sx={quizPrimaryButtonSx}
            >
              {page.startButtonLabel}
            </Button>
            <Typography
              sx={{ ...quizBodyTextSx, fontSize: '0.95rem', maxWidth: 320 }}
            >
              {summaryLine}
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
              {page.landingStats
                .map((stat) => `${stat.value} ${stat.label}`)
                .join('  ·  ')}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            ...quizHeroPanelSx,
            flex: '0 1 500px',
            px: { xs: 2.5, md: 3 },
            py: { xs: 2.5, md: 3 },
          }}
        >
          <Stack spacing={2.25}>
            <Chip label={page.liveBadgeLabel} size="small" sx={quizChipSx} />

            <Typography
              sx={{
                color: '#f8fafc',
                fontFamily: quizHeadlineFontFamily,
                fontSize: { xs: '1.35rem', md: '1.55rem' },
                fontWeight: 600,
                lineHeight: 1.2,
                maxWidth: 340,
              }}
            >
              {copy.potentialOutcomesTitle}
            </Typography>

            <Typography
              sx={{
                color: '#c6d2e3',
                fontFamily: quizHeadlineFontFamily,
                fontSize: '0.875rem',
                lineHeight: 1.62,
                maxWidth: 360,
              }}
            >
              {copy.potentialOutcomesDescription}
            </Typography>

            <Stack spacing={1.25}>
              {previewResults.map((result, index) => (
                <Box
                  key={result.key}
                  sx={{
                    ...(index === 0 ? quizQuizCardSx : quizDiscoveryCardSx),
                    px: 2.25,
                    py: 1.9,
                  }}
                >
                  <Typography
                    sx={{
                      color: '#f7f9ff',
                      fontFamily: quizHeadlineFontFamily,
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {result.name}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.65,
                      color: index === 0 ? '#c6d2e3' : '#cbd5e1',
                      fontFamily: quizHeadlineFontFamily,
                      fontSize: '0.8125rem',
                      lineHeight: 1.58,
                    }}
                  >
                    {result.description}
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

function QuizQuestions({
  page,
  copy,
  answers,
  currentQuestionIndex,
  onSliderChange,
  onBack,
  onNext,
}: {
  page: QuizPage;
  copy: ReturnType<typeof getQuizUiCopy>;
  answers: number[];
  currentQuestionIndex: number;
  onSliderChange: (_: Event, value: number | number[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const progress = ((currentQuestionIndex + 1) / page.questions.length) * 100;
  const question = page.questions[currentQuestionIndex];

  return (
    <Box sx={quizSectionSx}>
      <Box sx={quizBackdropSx} />

      <Stack spacing={3} sx={{ ...quizContentSx, maxWidth: 820, mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography sx={quizEyebrowSx}>SirBro</Typography>
            <Box
              sx={{ width: 1, height: 18, bgcolor: 'rgba(148,163,184,0.35)' }}
            />
            <Typography
              sx={{
                color: '#cbd5e1',
                fontFamily: quizHeadlineFontFamily,
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {page.questionnaireLabel}
            </Typography>
          </Stack>

          <Box
            sx={{
              ...quizRailSx,
              px: 1.75,
              py: 0.7,
            }}
          >
            <Typography
              sx={{
                color: '#c7d2fe',
                fontFamily: quizHeadlineFontFamily,
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              {currentQuestionIndex + 1}/{page.questions.length}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            position: 'relative',
            height: 6,
            borderRadius: 999,
            bgcolor: 'rgba(148,163,184,0.12)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              width: `${progress}%`,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%)',
            }}
          />
        </Box>

        <Box
          sx={{
            ...quizDeeperPanelSx,
            px: { xs: 3, md: 4 },
            py: { xs: 3, md: 4 },
          }}
        >
          <Stack spacing={4}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  bgcolor: '#4f46e5',
                  color: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                {String(currentQuestionIndex + 1).padStart(2, '0')}
              </Box>
              <Box
                sx={{ flex: 1, height: 1, bgcolor: 'rgba(148,163,184,0.28)' }}
              />
            </Stack>

            <Typography
              component="h2"
              sx={{
                color: '#f8fafc',
                fontFamily: quizHeadlineFontFamily,
                fontSize: { xs: 24, md: 30 },
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1.2,
              }}
            >
              {question.text}
            </Typography>

            <Stack spacing={3}>
              <Slider
                value={answers[currentQuestionIndex]}
                onChange={onSliderChange}
                min={0}
                max={100}
                step={1}
                sx={{
                  color: '#4f46e5',
                  '& .MuiSlider-thumb': {
                    width: 18,
                    height: 18,
                    bgcolor: '#f8fafc',
                    border: '2px solid #4f46e5',
                    boxShadow: '0 0 0 5px rgba(79, 70, 229, 0.16)',
                  },
                  '& .MuiSlider-track': {
                    border: 'none',
                    background:
                      'linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%)',
                  },
                  '& .MuiSlider-rail': {
                    opacity: 1,
                    bgcolor: 'rgba(148,163,184,0.18)',
                  },
                }}
              />

              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      color: 'rgba(148,163,184,0.95)',
                      fontSize: 10,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                    }}
                  >
                    ←
                  </Typography>
                  <Typography
                    sx={{
                      color: '#cbd5e1',
                      fontFamily: quizHeadlineFontFamily,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {question.labelLeft}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    bgcolor: 'rgba(15,23,42,0.56)',
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: '#c7d2fe' }}>
                    {answers[currentQuestionIndex]}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'right' }}>
                  <Typography
                    sx={{
                      color: 'rgba(148,163,184,0.95)',
                      fontSize: 10,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                    }}
                  >
                    →
                  </Typography>
                  <Typography
                    sx={{
                      color: '#cbd5e1',
                      fontFamily: quizHeadlineFontFamily,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {question.labelRight}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {currentQuestionIndex > 0 ? (
            <Button
              variant="outlined"
              onClick={onBack}
              sx={quizSecondaryButtonSx}
            >
              {copy.backButtonLabel}
            </Button>
          ) : null}
          <Button variant="contained" onClick={onNext} sx={quizPrimaryButtonSx}>
            {currentQuestionIndex === page.questions.length - 1
              ? page.finishButtonLabel
              : page.nextButtonLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
