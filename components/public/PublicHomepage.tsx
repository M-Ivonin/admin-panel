'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import { alpha } from '@mui/material/styles';
import { AppStoreButtons } from '@/components/AppStoreButtons';
import type { Locale } from '@/lib/i18n/config';
import { PUBLIC_PAGE_PATHS } from '@/modules/content/public-pages';
import {
  getHomepageContent,
  type HomepageFeaturePreview,
  type HomepageSeoEngineEntry,
} from '@/modules/public/homepage-content';
import { PUBLIC_HUB_PATHS } from '@/modules/public/scaffold-pages';
import { buildLocalizedPath } from '@/modules/seo/route-registry';

type SeoMetricKey = 'standings' | 'topGoalscorers' | 'assists';

const copySafeSx = {
  minWidth: 0,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
};

const sectionSx = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: { xs: 5, md: 6 },
  border: '1px solid',
  borderColor: alpha('#374151', 0.85),
  background:
    'linear-gradient(180deg, rgba(24, 24, 27, 0.98) 0%, rgba(16, 24, 39, 0.98) 100%)',
  boxShadow: `0 28px 72px ${alpha('#020617', 0.28)}`,
};

const mutedPanelSx = {
  position: 'relative',
  overflow: 'hidden',
  minWidth: 0,
  borderRadius: { xs: 4, md: 5 },
  border: '1px solid',
  borderColor: alpha('#4b5563', 0.72),
  background: alpha('#0f172a', 0.74),
  backdropFilter: 'blur(20px)',
};

const toneMap = {
  indigo: '#6366f2',
  success: '#22c55e',
  warning: '#fcd34d',
} as const;

function clampLines(lines: number) {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };
}

function SectionHeading({
  eyebrow,
  title,
  description,
  maxWidth = 680,
}: {
  eyebrow: string;
  title: string;
  description: string;
  maxWidth?: number;
}) {
  return (
    <Stack spacing={1.25} sx={{ mb: { xs: 2.5, md: 3.5 }, maxWidth }}>
      <Typography
        sx={{
          color: alpha('#a5b4fc', 0.98),
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}
      >
        {eyebrow}
      </Typography>
      <Typography
        sx={{
          ...copySafeSx,
          fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
          fontSize: { xs: '1.8rem', md: '2rem' },
          lineHeight: { xs: 1.18, md: 1.28 },
          fontWeight: 500,
          color: '#f9fafb',
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          ...copySafeSx,
          color: alpha('#d1d5db', 0.9),
          fontSize: '1rem',
          lineHeight: 1.7,
        }}
      >
        {description}
      </Typography>
    </Stack>
  );
}

function TopicChip({ label }: { label: string }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        borderRadius: '999px',
        color: '#eef2ff',
        bgcolor: alpha('#6366f2', 0.14),
        border: '1px solid',
        borderColor: alpha('#6366f2', 0.28),
        fontWeight: 600,
        '& .MuiChip-label': { px: 1.25 },
      }}
    />
  );
}

function HighlightCard({
  label,
  value,
  tone = 'indigo',
}: {
  label: string;
  value: string;
  tone?: keyof typeof toneMap;
}) {
  const color = toneMap[tone];

  return (
    <Box
      sx={{
        ...mutedPanelSx,
        p: 1.75,
        borderColor: alpha(color, 0.34),
        background: `linear-gradient(180deg, ${alpha(color, 0.16)} 0%, ${alpha(
          '#0f172a',
          0.88
        )} 100%)`,
      }}
    >
      <Typography
        sx={{
          color: alpha('#cbd5e1', 0.88),
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          ...copySafeSx,
          color: '#f9fafb',
          fontWeight: 600,
          lineHeight: 1.35,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function ProductPreviewCard({
  icon,
  title,
  description,
  accentLabel,
  accentValue,
  lines,
}: HomepageFeaturePreview & { icon: React.ReactNode }) {
  return (
    <Box sx={{ ...mutedPanelSx, p: 2.25, height: '100%' }}>
      <Stack spacing={2} sx={{ height: '100%' }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 3,
              bgcolor: alpha('#6366f2', 0.18),
              color: '#c7d2fe',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                ...copySafeSx,
                color: '#f9fafb',
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                ...copySafeSx,
                color: alpha('#d1d5db', 0.84),
                fontSize: '0.92rem',
                lineHeight: 1.6,
              }}
            >
              {description}
            </Typography>
          </Stack>
        </Stack>

        <Box
          sx={{
            ...mutedPanelSx,
            p: 2,
            borderColor: alpha('#6366f2', 0.3),
            background:
              'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          }}
        >
          <Stack spacing={1.35}>
            <Stack direction="row" justifyContent="space-between" spacing={1.5}>
              <Typography
                sx={{
                  color: alpha('#cbd5e1', 0.82),
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {accentLabel}
              </Typography>
              <Typography sx={{ color: '#a5b4fc', fontWeight: 700 }}>
                {accentValue}
              </Typography>
            </Stack>
            {lines.map((line, index) => (
              <Stack
                key={`${title}-${line}`}
                direction="row"
                justifyContent="space-between"
                spacing={1}
                sx={{
                  py: 0.8,
                  borderTop:
                    index === 0
                      ? '1px solid transparent'
                      : `1px solid ${alpha('#334155', 0.72)}`,
                }}
              >
                <Typography sx={{ color: '#f9fafb', fontWeight: 500 }}>
                  {line}
                </Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor:
                      index === 0
                        ? '#22c55e'
                        : index === 1
                          ? '#6366f2'
                          : '#fcd34d',
                    flexShrink: 0,
                  }}
                />
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function SeoEntryCard({
  entry,
  href,
}: {
  entry: HomepageSeoEngineEntry;
  href: string;
}) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        ...mutedPanelSx,
        display: 'block',
        textDecoration: 'none',
        p: 1.6,
        height: '100%',
        transition: 'transform 180ms ease, border-color 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: alpha('#6366f2', 0.4),
        },
      }}
    >
      <Stack spacing={1.1} sx={{ height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" spacing={1.5}>
          <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: alpha('#6366f2', 0.18),
                color: '#c7d2fe',
                display: 'grid',
                placeItems: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {entry.badge}
            </Box>
            <Typography
              sx={{
                ...copySafeSx,
                color: '#f9fafb',
                fontWeight: 600,
                ...clampLines(2),
              }}
            >
              {entry.name}
            </Typography>
          </Stack>
          <ArrowOutwardRoundedIcon
            sx={{ color: alpha('#cbd5e1', 0.72), flexShrink: 0 }}
          />
        </Stack>
        <Typography sx={{ color: '#a5b4fc', fontWeight: 700 }}>
          {entry.value}
        </Typography>
        <Chip
          label={entry.outlook}
          size="small"
          sx={{
            alignSelf: 'flex-start',
            borderRadius: '999px',
            color: '#eef2ff',
            bgcolor: alpha('#111827', 0.86),
            border: '1px solid',
            borderColor: alpha('#4b5563', 0.8),
          }}
        />
      </Stack>
    </Box>
  );
}

export function PublicHomepage({ locale }: { locale: Locale }) {
  const content = getHomepageContent(locale);
  const homeHref = buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.home);
  const localize = (path: string) => buildLocalizedPath(locale, path);
  const [activeLeagueIndex, setActiveLeagueIndex] = useState(0);
  const [activeMetric, setActiveMetric] = useState<SeoMetricKey>('standings');

  useEffect(() => {
    setActiveLeagueIndex(0);
    setActiveMetric('standings');
  }, [locale]);

  const activeLeague = content.discovery.seoEngine.leagues[activeLeagueIndex];
  const activeEntries = activeLeague[activeMetric];

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 4, md: 6 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          ...sectionSx,
          p: { xs: 2.5, md: 4 },
          background: `radial-gradient(circle at top left, ${alpha(
            '#6366f2',
            0.28
          )} 0%, transparent 30%), radial-gradient(circle at 86% 18%, ${alpha(
            '#22c55e',
            0.12
          )} 0%, transparent 18%), linear-gradient(180deg, #121212 0%, #111827 100%)`,
        }}
      >
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={2.25} sx={{ height: '100%', justifyContent: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                {content.hero.chips.map((chip) => (
                  <TopicChip key={chip} label={chip} />
                ))}
              </Stack>

              <Typography
                sx={{
                  ...copySafeSx,
                  maxWidth: 620,
                  fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                  fontSize: { xs: '2.35rem', sm: '3rem', md: '3.65rem' },
                  lineHeight: { xs: 1.02, md: 1.02 },
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  color: '#f9fafb',
                }}
              >
                {content.hero.title}
              </Typography>

              <Typography
                sx={{
                  ...copySafeSx,
                  maxWidth: 580,
                  color: alpha('#e5e7eb', 0.88),
                  fontSize: '1rem',
                  lineHeight: 1.78,
                }}
              >
                {content.hero.description}
              </Typography>

              <Stack spacing={1.4} sx={{ maxWidth: 600 }}>
                <Box id="download">
                  <AppStoreButtons alignment="start" />
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                  <Button
                    component={Link}
                    href={`${homeHref}#download`}
                    variant="contained"
                    size="large"
                    sx={{
                      borderRadius: '999px',
                      px: 2.5,
                      bgcolor: '#4f46e5',
                      color: '#ffffff',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#4338ca', boxShadow: 'none' },
                    }}
                  >
                    {content.hero.openAppLabel}
                  </Button>
                  <Button
                    component={Link}
                    href={localize(PUBLIC_HUB_PATHS.insights)}
                    variant="outlined"
                    size="large"
                    sx={{
                      borderRadius: '999px',
                      px: 2.5,
                      color: '#eef2ff',
                      borderColor: alpha('#9ca3af', 0.34),
                      bgcolor: alpha('#111827', 0.62),
                      '&:hover': {
                        borderColor: alpha('#d1d5db', 0.5),
                        bgcolor: alpha('#111827', 0.9),
                      },
                    }}
                  >
                    {content.finalCta.secondaryCtaLabel}
                  </Button>
                </Stack>
              </Stack>

              <Box
                sx={{
                  ...mutedPanelSx,
                  p: 2,
                  borderColor: alpha('#6366f2', 0.3),
                  background:
                    'linear-gradient(180deg, rgba(31, 41, 55, 0.88) 0%, rgba(15, 23, 42, 0.98) 100%)',
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Typography
                    sx={{
                      color: '#c7d2fe',
                      fontWeight: 700,
                      minWidth: { sm: 220 },
                    }}
                  >
                    {content.hero.proof}
                  </Typography>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      borderColor: alpha('#4b5563', 0.7),
                    }}
                  />
                  <Stack spacing={0.55}>
                    <Typography sx={{ color: '#f9fafb', fontWeight: 600 }}>
                      Proprietary Sports AI Model
                    </Typography>
                    <Typography sx={{ color: alpha('#d1d5db', 0.82), lineHeight: 1.6 }}>
                      Football insights, player form, injury impact, and match volatility stay tied to real context instead of generic takes.
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Box
              sx={{
                ...mutedPanelSx,
                p: { xs: 2, md: 2.5 },
                height: '100%',
                borderColor: alpha('#6366f2', 0.34),
                background:
                  'linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
              }}
            >
              <Grid container spacing={1.5} sx={{ height: '100%' }}>
                <Grid size={12}>
                  <Box
                    sx={{
                      ...mutedPanelSx,
                      p: 2.25,
                      borderColor: alpha('#6366f2', 0.34),
                      background:
                        'linear-gradient(180deg, rgba(37, 48, 88, 0.92) 0%, rgba(17, 24, 39, 0.96) 100%)',
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={1.5}
                        alignItems="flex-start"
                      >
                        <Stack spacing={0.45} sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              color: alpha('#cbd5e1', 0.82),
                              fontSize: '0.75rem',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {content.hero.previewTitle}
                          </Typography>
                          <Typography
                            sx={{
                              ...copySafeSx,
                              color: '#f9fafb',
                              fontWeight: 700,
                              fontSize: '1.15rem',
                            }}
                          >
                            {content.hero.previewSubtitle}
                          </Typography>
                        </Stack>
                        <TopicChip label="Live" />
                      </Stack>

                      <Grid container spacing={1.2}>
                        {content.hero.previewHighlights.map((item, index) => (
                          <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
                            <HighlightCard
                              label={item.label}
                              value={item.value}
                              tone={index === 1 ? 'warning' : index === 2 ? 'success' : 'indigo'}
                            />
                          </Grid>
                        ))}
                      </Grid>

                      <Box sx={{ ...mutedPanelSx, p: 1.8 }}>
                        <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                          <Typography sx={{ color: '#f9fafb', fontWeight: 600 }}>
                            Signal feed
                          </Typography>
                          <Typography sx={{ color: '#22c55e', fontWeight: 700 }}>
                            Injury impact
                          </Typography>
                        </Stack>
                        <Stack spacing={1.05} sx={{ mt: 1.5 }}>
                          {['Replacement profile weaker in build-up', 'Wide overload creates second-half edge', 'Momentum swings if press breaks early'].map((line, index) => (
                            <Stack
                              key={line}
                              direction="row"
                              justifyContent="space-between"
                              spacing={1}
                              sx={{
                                py: 0.95,
                                borderTop:
                                  index === 0
                                    ? '1px solid transparent'
                                    : `1px solid ${alpha('#334155', 0.72)}`,
                              }}
                            >
                              <Typography sx={{ color: alpha('#d1d5db', 0.88) }}>
                                {line}
                              </Typography>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: index === 0 ? '#6366f2' : index === 1 ? '#22c55e' : '#fcd34d',
                                  flexShrink: 0,
                                  mt: 0.8,
                                }}
                              />
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ ...mutedPanelSx, p: 2, height: '100%' }}>
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ForumRoundedIcon sx={{ color: '#c7d2fe' }} />
                        <Typography sx={{ color: '#f9fafb', fontWeight: 600 }}>
                          Chat Widget
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: alpha('#d1d5db', 0.86),
                          lineHeight: 1.65,
                        }}
                      >
                        {content.hero.chatPrompt}
                      </Typography>
                      <Box
                        sx={{
                          ...mutedPanelSx,
                          p: 1.5,
                          bgcolor: alpha('#111827', 0.92),
                        }}
                      >
                        <Typography sx={{ color: '#a5b4fc', fontWeight: 600 }}>
                          Tactical answer
                        </Typography>
                        <Typography
                          sx={{
                            ...copySafeSx,
                            color: '#f9fafb',
                            lineHeight: 1.6,
                            mt: 0.7,
                          }}
                        >
                          Arsenal gain control if the right-side overload holds. Liverpool still carries the higher transition threat if the press lands early.
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ ...mutedPanelSx, p: 2, height: '100%' }}>
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EmojiEventsRoundedIcon sx={{ color: '#fcd34d' }} />
                        <Typography sx={{ color: '#f9fafb', fontWeight: 600 }}>
                          {content.hero.fanArenaTitle}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: alpha('#d1d5db', 0.86),
                          lineHeight: 1.65,
                        }}
                      >
                        {content.hero.fanArenaCopy}
                      </Typography>
                      <Stack spacing={0.9}>
                        {[
                          ['You', '#2'],
                          ['Marco', '#1'],
                          ['Ana', '#3'],
                        ].map(([name, rank]) => (
                          <Stack
                            key={name}
                            direction="row"
                            justifyContent="space-between"
                            sx={{
                              py: 0.9,
                              borderTop: `1px solid ${alpha('#334155', 0.72)}`,
                            }}
                          >
                            <Typography sx={{ color: '#f9fafb', fontWeight: 500 }}>
                              {name}
                            </Typography>
                            <Typography sx={{ color: '#22c55e', fontWeight: 700 }}>
                              {rank}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ ...sectionSx, p: { xs: 2.5, md: 3.5 } }}>
        <SectionHeading
          eyebrow={content.showcase.eyebrow}
          title={content.showcase.title}
          description={content.showcase.description}
        />
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <ProductPreviewCard
              icon={<InsightsRoundedIcon />}
              {...content.showcase.items[0]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ProductPreviewCard
              icon={<ForumRoundedIcon />}
              {...content.showcase.items[1]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ProductPreviewCard
              icon={<EmojiEventsRoundedIcon />}
              {...content.showcase.items[2]}
            />
          </Grid>
        </Grid>
      </Box>

      <Box id="how-it-works" sx={{ ...sectionSx, p: { xs: 2.5, md: 3.5 } }}>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <SectionHeading
              eyebrow={content.methodology.eyebrow}
              title={content.methodology.title}
              description={content.methodology.description}
              maxWidth={620}
            />
            <Grid container spacing={1.35}>
              {content.methodology.steps.map((step, index) => (
                <Grid key={step.step} size={{ xs: 12, md: 4 }}>
                  <Box
                    sx={{
                      ...mutedPanelSx,
                      p: 2,
                      height: '100%',
                      borderColor:
                        index === 0
                          ? alpha('#6366f2', 0.32)
                          : index === 1
                            ? alpha('#22c55e', 0.28)
                            : alpha('#fcd34d', 0.28),
                    }}
                  >
                    <Stack spacing={1.2}>
                      <Typography sx={{ color: '#a5b4fc', fontWeight: 700 }}>
                        {step.step}
                      </Typography>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: '#f9fafb',
                          fontWeight: 600,
                          lineHeight: 1.35,
                        }}
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: alpha('#d1d5db', 0.84),
                          lineHeight: 1.65,
                          fontSize: '0.92rem',
                        }}
                      >
                        {step.description}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Box
              sx={{
                ...mutedPanelSx,
                p: { xs: 2, md: 2.25 },
                height: '100%',
                borderColor: alpha('#6366f2', 0.32),
                background:
                  'linear-gradient(180deg, rgba(31, 41, 55, 0.96) 0%, rgba(17, 24, 39, 0.98) 100%)',
              }}
            >
              <Stack spacing={2}>
                <Stack spacing={1.1}>
                  <Typography
                    sx={{
                      color: '#c7d2fe',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      fontSize: '0.75rem',
                    }}
                  >
                    Trust layer
                  </Typography>
                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: '#f9fafb',
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      lineHeight: 1.35,
                    }}
                  >
                    Proprietary Sports AI Model
                  </Typography>
                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: alpha('#d1d5db', 0.88),
                      lineHeight: 1.72,
                    }}
                  >
                    {content.methodology.requiredCopy}
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  {content.methodology.trustItems.map((item) => (
                    <Box
                      key={item.title}
                      component={Link}
                      href={localize(item.href)}
                      sx={{
                        ...mutedPanelSx,
                        display: 'block',
                        p: 1.5,
                        textDecoration: 'none',
                        transition: 'transform 180ms ease, border-color 180ms ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          borderColor: alpha('#6366f2', 0.4),
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.2} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: '#6366f2',
                            flexShrink: 0,
                            mt: 0.6,
                          }}
                        />
                        <Stack spacing={0.4} sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              ...copySafeSx,
                              color: '#f9fafb',
                              fontWeight: 600,
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            sx={{
                              ...copySafeSx,
                              color: alpha('#d1d5db', 0.82),
                              lineHeight: 1.6,
                              fontSize: '0.9rem',
                            }}
                          >
                            {item.description}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ ...sectionSx, p: { xs: 2.5, md: 3.5 } }}>
        <SectionHeading
          eyebrow={content.discovery.eyebrow}
          title={content.discovery.title}
          description={content.discovery.description}
        />

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 2.5 }}>
          {content.discovery.topicLinks.map((item) => (
            <Chip
              key={item.label}
              label={item.label}
              component={Link}
              href={localize(item.href)}
              clickable
              sx={{
                borderRadius: '999px',
                color: '#eef2ff',
                bgcolor: alpha('#111827', 0.82),
                border: '1px solid',
                borderColor: alpha('#4b5563', 0.82),
              }}
            />
          ))}
        </Stack>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={1.5} sx={{ height: '100%' }}>
              <Box
                component={Link}
                href={localize(content.discovery.featuredInsight.href)}
                sx={{
                  ...mutedPanelSx,
                  display: 'block',
                  p: 2.25,
                  textDecoration: 'none',
                  borderColor: alpha('#6366f2', 0.32),
                  background:
                    'linear-gradient(180deg, rgba(37, 48, 88, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
                }}
              >
                <Stack spacing={1.5}>
                  <TopicChip label={content.discovery.featuredInsight.eyebrow} />
                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: '#f9fafb',
                      fontWeight: 700,
                      fontSize: '1.45rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {content.discovery.featuredInsight.title}
                  </Typography>
                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: alpha('#d1d5db', 0.88),
                      lineHeight: 1.7,
                    }}
                  >
                    {content.discovery.featuredInsight.description}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InsightsRoundedIcon sx={{ color: '#c7d2fe' }} />
                    <Typography sx={{ color: '#eef2ff', fontWeight: 600 }}>
                      {content.discovery.featuredInsight.ctaLabel}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Box
                component={Link}
                href={localize(content.discovery.quiz.href)}
                sx={{
                  ...mutedPanelSx,
                  display: 'block',
                  p: 2,
                  textDecoration: 'none',
                  borderColor: alpha('#fcd34d', 0.28),
                }}
              >
                <Stack direction="row" spacing={1.35} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: alpha('#fcd34d', 0.16),
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fcd34d',
                      flexShrink: 0,
                    }}
                  >
                    <SportsSoccerRoundedIcon />
                  </Box>
                  <Stack spacing={0.7} sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: '#fcd34d', fontWeight: 700 }}>
                      {content.discovery.quiz.eyebrow}
                    </Typography>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#f9fafb',
                        fontWeight: 600,
                        lineHeight: 1.35,
                      }}
                    >
                      {content.discovery.quiz.title}
                    </Typography>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: alpha('#d1d5db', 0.84),
                        lineHeight: 1.65,
                        fontSize: '0.92rem',
                      }}
                    >
                      {content.discovery.quiz.description}
                    </Typography>
                    <Typography sx={{ color: '#eef2ff', fontWeight: 600 }}>
                      {content.discovery.quiz.ctaLabel}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <Box sx={{ ...mutedPanelSx, p: { xs: 2, md: 2.25 }, height: '100%' }}>
              <Stack spacing={2}>
                <Stack spacing={0.7}>
                  <Typography
                    sx={{
                      color: alpha('#c7d2fe', 0.96),
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    }}
                  >
                    {content.discovery.seoEngine.eyebrow}
                  </Typography>
                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: '#f9fafb',
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      lineHeight: 1.35,
                    }}
                  >
                    {content.discovery.seoEngine.title}
                  </Typography>
                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: alpha('#d1d5db', 0.84),
                      lineHeight: 1.65,
                    }}
                  >
                    {content.discovery.seoEngine.description}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.4 }}>
                  {content.discovery.seoEngine.leagues.map((league, index) => (
                    <Button
                      key={league.label}
                      onClick={() => setActiveLeagueIndex(index)}
                      sx={{
                        flexShrink: 0,
                        borderRadius: '999px',
                        px: 2,
                        py: 0.85,
                        color: index === activeLeagueIndex ? '#ffffff' : alpha('#d1d5db', 0.82),
                        bgcolor:
                          index === activeLeagueIndex
                            ? '#4f46e5'
                            : alpha('#111827', 0.72),
                        border: '1px solid',
                        borderColor:
                          index === activeLeagueIndex
                            ? alpha('#6366f2', 0.6)
                            : alpha('#4b5563', 0.74),
                        '&:hover': {
                          bgcolor:
                            index === activeLeagueIndex
                              ? '#4338ca'
                              : alpha('#111827', 0.94),
                        },
                      }}
                    >
                      {league.label}
                    </Button>
                  ))}
                </Stack>

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  {(
                    [
                      ['standings', content.discovery.seoEngine.metricLabels.standings],
                      ['topGoalscorers', content.discovery.seoEngine.metricLabels.topGoalscorers],
                      ['assists', content.discovery.seoEngine.metricLabels.assists],
                    ] as Array<[SeoMetricKey, string]>
                  ).map(([key, label]) => (
                    <Button
                      key={key}
                      onClick={() => setActiveMetric(key)}
                      startIcon={key === 'standings' ? <AutoGraphRoundedIcon /> : key === 'topGoalscorers' ? <SportsSoccerRoundedIcon /> : <EmojiEventsRoundedIcon />}
                      sx={{
                        borderRadius: '999px',
                        px: 1.8,
                        py: 0.8,
                        color: key === activeMetric ? '#ffffff' : alpha('#d1d5db', 0.84),
                        bgcolor:
                          key === activeMetric
                            ? alpha('#6366f2', 0.2)
                            : alpha('#111827', 0.68),
                        border: '1px solid',
                        borderColor:
                          key === activeMetric
                            ? alpha('#6366f2', 0.42)
                            : alpha('#4b5563', 0.74),
                        '&:hover': {
                          bgcolor:
                            key === activeMetric
                              ? alpha('#6366f2', 0.26)
                              : alpha('#111827', 0.92),
                        },
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </Stack>

                <Grid container spacing={1.2}>
                  {activeEntries.map((entry) => (
                    <Grid key={`${activeLeague.label}-${activeMetric}-${entry.name}`} size={{ xs: 12, sm: 6 }}>
                      <SeoEntryCard entry={entry} href={localize(entry.href)} />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ ...sectionSx, p: { xs: 2.5, md: 3.5 } }}>
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
          <Grid size={{ xs: 12, lg: 5 }}>
            <SectionHeading
              eyebrow={content.faq.eyebrow}
              title={content.faq.title}
              description={content.faq.description}
              maxWidth={500}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={1.1}>
              {content.faq.items.map((item) => (
                <Accordion
                  key={item.question}
                  disableGutters
                  elevation={0}
                  sx={{
                    ...mutedPanelSx,
                    borderRadius: '20px !important',
                    '&::before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#f9fafb' }} />}
                    sx={{ px: 2.25, py: 0.35 }}
                  >
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#f9fafb',
                        fontWeight: 600,
                        pr: 1.5,
                      }}
                    >
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2.25, pt: 0, pb: 2.1 }}>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: alpha('#d1d5db', 0.88),
                        lineHeight: 1.7,
                      }}
                    >
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          ...sectionSx,
          p: { xs: 2.5, md: 3.75 },
          background: `radial-gradient(circle at top right, ${alpha(
            '#6366f2',
            0.24
          )} 0%, transparent 24%), linear-gradient(180deg, #18181b 0%, #111827 100%)`,
        }}
      >
        <Grid container spacing={{ xs: 2.5, md: 3 }} alignItems="center">
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={1.15}>
              <Typography
                sx={{
                  color: alpha('#c7d2fe', 0.98),
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                {content.finalCta.eyebrow}
              </Typography>
              <Typography
                sx={{
                  ...copySafeSx,
                  fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                  fontSize: { xs: '1.85rem', md: '2.3rem' },
                  lineHeight: 1.2,
                  fontWeight: 600,
                  color: '#f9fafb',
                  maxWidth: 720,
                }}
              >
                {content.finalCta.title}
              </Typography>
              <Typography
                sx={{
                  ...copySafeSx,
                  color: alpha('#d1d5db', 0.86),
                  lineHeight: 1.72,
                  maxWidth: 640,
                }}
              >
                {content.finalCta.description}
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={1.4}>
              <AppStoreButtons alignment="start" />
              <Button
                component={Link}
                href={localize(PUBLIC_HUB_PATHS.insights)}
                variant="outlined"
                size="large"
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: '999px',
                  px: 2.5,
                  color: '#eef2ff',
                  borderColor: alpha('#9ca3af', 0.34),
                  bgcolor: alpha('#111827', 0.62),
                  '&:hover': {
                    borderColor: alpha('#d1d5db', 0.5),
                    bgcolor: alpha('#111827', 0.9),
                  },
                }}
              >
                {content.finalCta.secondaryCtaLabel}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
