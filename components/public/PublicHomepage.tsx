'use client';

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
import { alpha } from '@mui/material/styles';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import type { Locale } from '@/lib/i18n/config';
import { AppStoreButtons } from '@/components/AppStoreButtons';
import { PUBLIC_PAGE_PATHS } from '@/modules/content/public-pages';
import { getHomepageContent } from '@/modules/public/homepage-content';
import { PUBLIC_HUB_PATHS } from '@/modules/public/scaffold-pages';
import { buildLocalizedPath } from '@/modules/seo/route-registry';

const sectionSurfaceSx = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: { xs: 5, md: 6 },
  border: '1px solid',
  borderColor: alpha('#6370ff', 0.18),
  background: `linear-gradient(180deg, ${alpha('#151d2c', 0.96)} 0%, ${alpha('#0f1726', 0.98)} 100%)`,
  boxShadow: `0 24px 70px ${alpha('#020617', 0.34)}`,
};

const mutedCardSx = {
  position: 'relative',
  minWidth: 0,
  overflow: 'hidden',
  borderRadius: { xs: 3.5, md: 4 },
  border: '1px solid',
  borderColor: alpha('#94a3b8', 0.16),
  background: alpha('#111827', 0.64),
  backdropFilter: 'blur(16px)',
};

const copySafeSx = {
  minWidth: 0,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
};

const productExplainerCopy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  en: {
    eyebrow: 'Product explainer',
    title: 'What users get, beyond generic football content.',
    description:
      'The explainer frames three product lenses early so the homepage reads like a signal-first workflow, not a generic content feed.',
  },
  es: {
    eyebrow: 'Visión del producto',
    title:
      'Lo que obtiene el usuario más allá del contenido futbolístico genérico.',
    description:
      'Este bloque presenta tres lentes del producto desde el inicio para que la home se lea como un flujo guiado por señales, no como un feed genérico.',
  },
  pt: {
    eyebrow: 'Produto explicado',
    title: 'O que o usuário recebe além de conteúdo genérico de futebol.',
    description:
      'Este bloco apresenta três lentes do produto logo no início para que a home funcione como um fluxo guiado por sinais, e não como um feed genérico.',
  },
};

const homepageMicroCopy: Record<
  Locale,
  {
    topicsSupportTitle: string;
    topicsSupportBody: string;
    searchRoleTitle: string;
    searchRoleBody: string;
    faqTags: string[];
  }
> = {
  en: {
    topicsSupportTitle: 'Why this helps discovery',
    topicsSupportBody:
      'Topic clusters should read like durable football entry points, not just small archive chips.',
    searchRoleTitle: 'Search role',
    searchRoleBody:
      'Each topic becomes a stronger internal-linking surface for recurring football intent.',
    faqTags: ['Insights', 'Product', 'Trust', 'Topics'],
  },
  es: {
    topicsSupportTitle: 'Por qué esto ayuda al descubrimiento',
    topicsSupportBody:
      'Los clusters temáticos deben sentirse como puntos de entrada duraderos al fútbol, no como pequeñas etiquetas de archivo.',
    searchRoleTitle: 'Rol en búsqueda',
    searchRoleBody:
      'Cada tema se convierte en una superficie más fuerte de enlazado interno para intenciones recurrentes de fútbol.',
    faqTags: ['Insights', 'Producto', 'Confianza', 'Temas'],
  },
  pt: {
    topicsSupportTitle: 'Por que isso ajuda na descoberta',
    topicsSupportBody:
      'Os clusters temáticos devem funcionar como portas de entrada duráveis para o futebol, e não apenas como chips de arquivo.',
    searchRoleTitle: 'Papel na busca',
    searchRoleBody:
      'Cada tópico vira uma superfície mais forte de links internos para intenções recorrentes de futebol.',
    faqTags: ['Insights', 'Produto', 'Confiança', 'Tópicos'],
  },
};

const visualTone = {
  indigo: '#8b5cf6',
  green: '#22c55e',
  yellow: '#fcd34d',
  red: '#ef4444',
} as const;

function clampLines(lines: number) {
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    overflow: 'hidden',
  };
}

function EyebrowChip({
  label,
  tone = 'indigo',
}: {
  label: string;
  tone?: keyof typeof visualTone;
}) {
  const toneColor = visualTone[tone];

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        alignSelf: 'flex-start',
        color: '#eef2ff',
        bgcolor: alpha(toneColor, 0.18),
        border: '1px solid',
        borderColor: alpha(toneColor, 0.34),
        fontWeight: 700,
        letterSpacing: 0.2,
      }}
    />
  );
}

function BarsGraphic({
  tone = 'indigo',
  compact = false,
}: {
  tone?: keyof typeof visualTone;
  compact?: boolean;
}) {
  const color = visualTone[tone];
  const heights = compact ? [18, 28, 22, 38, 52] : [26, 38, 30, 50, 66];

  return (
    <Box
      sx={{
        ...mutedCardSx,
        p: compact ? 1.75 : 2,
        minHeight: compact ? 88 : 96,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 0.9,
        background: `linear-gradient(145deg, ${alpha('#101827', 0.96)} 0%, ${alpha('#182235', 0.92)} 100%)`,
      }}
    >
      {heights.map((height, index) => (
        <Box
          key={`${tone}-${height}-${index}`}
          sx={{
            width: compact ? 8 : 10,
            height,
            borderRadius: 999,
            bgcolor: alpha(color, 0.96),
            boxShadow: `0 0 28px ${alpha(color, 0.24)}`,
          }}
        />
      ))}
    </Box>
  );
}

function TrendGraphic() {
  return (
    <Box
      sx={{
        ...mutedCardSx,
        p: 2,
        minHeight: 112,
        background: `linear-gradient(145deg, ${alpha('#101827', 0.96)} 0%, ${alpha('#182235', 0.92)} 100%)`,
      }}
    >
      <Stack spacing={1.5}>
        {[0, 1, 2].map((item) => (
          <Divider key={item} sx={{ borderColor: alpha('#334155', 0.52) }} />
        ))}
        <Box sx={{ position: 'relative', height: 44 }}>
          {[
            { left: '4%', top: '68%', width: 58, rotate: 14 },
            { left: '24%', top: '48%', width: 62, rotate: -12 },
            { left: '44%', top: '56%', width: 56, rotate: 14 },
            { left: '62%', top: '32%', width: 56, rotate: -10 },
            { left: '79%', top: '26%', width: 24, rotate: 10 },
          ].map((segment, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                left: segment.left,
                top: segment.top,
                width: segment.width,
                height: 3,
                borderRadius: 999,
                bgcolor: '#8b9cff',
                transform: `rotate(${segment.rotate}deg)`,
              }}
            />
          ))}
          <Box
            sx={{
              position: 'absolute',
              right: 2,
              top: 2,
              width: 9,
              height: 9,
              borderRadius: '50%',
              bgcolor: '#22c55e',
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}

function RouteRail() {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ width: '100%' }}
    >
      {(['indigo', 'green', 'yellow', 'indigo', 'indigo'] as const).map(
        (tone, index) => (
          <Box
            key={`${tone}-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flex: index === 4 ? '0 0 auto' : 1,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: visualTone[tone],
                boxShadow: `0 0 20px ${alpha(visualTone[tone], 0.22)}`,
              }}
            />
            {index < 4 ? (
              <Box
                sx={{
                  flex: 1,
                  height: 3,
                  mx: 1,
                  borderRadius: 999,
                  bgcolor: alpha('#475569', 0.76),
                }}
              />
            ) : null}
          </Box>
        )
      )}
    </Stack>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  maxWidth = 760,
}: {
  eyebrow: string;
  title: string;
  description: string;
  maxWidth?: number;
}) {
  return (
    <Stack spacing={1.5} sx={{ mb: { xs: 3.5, md: 4.5 }, minWidth: 0 }}>
      <EyebrowChip label={eyebrow} />
      <Typography
        variant="h3"
        component="h2"
        sx={{
          ...copySafeSx,
          maxWidth,
          fontSize: { xs: '1.9rem', md: '2.25rem' },
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
        }}
      >
        {title}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{
          ...copySafeSx,
          maxWidth: maxWidth + 20,
          fontSize: { xs: '0.98rem', md: '1rem' },
          lineHeight: 1.7,
        }}
      >
        {description}
      </Typography>
    </Stack>
  );
}

export function PublicHomepage({ locale }: { locale: Locale }) {
  const content = getHomepageContent(locale);
  const explainerCopy = productExplainerCopy[locale];
  const microCopy = homepageMicroCopy[locale];
  const localizedHref = (path: string) => buildLocalizedPath(locale, path);
  const homeHref = localizedHref(PUBLIC_PAGE_PATHS.home);
  const anchorHref = (anchor: string) => `${homeHref}#${anchor}`;
  const trustPreviewCards = content.trust.cards.slice(0, 3);
  const routePreview = content.howItWorks.steps
    .map((step) => step.title)
    .join(' -> ');

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
          ...sectionSurfaceSx,
          p: { xs: 2.5, md: 4 },
          background: `radial-gradient(circle at top left, ${alpha('#4f46e5', 0.3)} 0%, transparent 28%), radial-gradient(circle at 84% 78%, ${alpha('#22c55e', 0.14)} 0%, transparent 18%), linear-gradient(180deg, #121827 0%, #0f1522 100%)`,
        }}
      >
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack
              spacing={2.25}
              sx={{ height: '100%', justifyContent: 'center', minWidth: 0 }}
            >
              <EyebrowChip label={content.hero.eyebrow} />
              <Typography
                variant="h1"
                sx={{
                  ...copySafeSx,
                  maxWidth: 620,
                  fontSize: { xs: '2.2rem', sm: '2.9rem', md: '3.55rem' },
                  lineHeight: { xs: 1.06, md: 1.01 },
                  letterSpacing: '-0.05em',
                }}
              >
                {content.hero.title}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  ...copySafeSx,
                  maxWidth: 560,
                  fontSize: { xs: '0.98rem', md: '1rem' },
                  lineHeight: 1.72,
                }}
              >
                {content.hero.description}
              </Typography>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', md: 'center' }}
              >
                <Button
                  component={Link}
                  href={anchorHref('download')}
                  variant="contained"
                  size="large"
                  sx={{
                    alignSelf: { xs: 'stretch', md: 'center' },
                    borderRadius: '999px',
                    px: 3,
                    bgcolor: '#f8fafc',
                    color: '#0f172a',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#f8fafc',
                      opacity: 0.92,
                      boxShadow: 'none',
                    },
                  }}
                >
                  {content.finalCta.primaryCtaLabel}
                </Button>
                <Button
                  component={Link}
                  href={localizedHref(PUBLIC_HUB_PATHS.insights)}
                  variant="outlined"
                  size="large"
                  sx={{
                    alignSelf: { xs: 'stretch', md: 'center' },
                    borderRadius: '999px',
                    px: 3,
                    color: '#eef2ff',
                    borderColor: alpha('#94a3b8', 0.28),
                    bgcolor: alpha('#111827', 0.56),
                    '&:hover': {
                      borderColor: alpha('#cbd5e1', 0.42),
                      bgcolor: alpha('#111827', 0.84),
                    },
                  }}
                >
                  {content.insights.ctaLabel}
                </Button>
              </Stack>

              <Box id="download">
                <AppStoreButtons alignment="start" />
              </Box>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ ...mutedCardSx, p: 2.25, height: '100%' }}>
                    <Stack spacing={1.2} sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          color: '#8b9cff',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {content.trust.eyebrow}
                      </Typography>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: '#eef2ff',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          ...clampLines(2),
                        }}
                      >
                        {content.trust.title}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          ...copySafeSx,
                          fontSize: '0.82rem',
                          lineHeight: 1.65,
                          ...clampLines(3),
                        }}
                      >
                        {content.trust.cards[0]?.description}
                      </Typography>
                      <EyebrowChip
                        label={
                          content.trust.cards[2]?.title ??
                          content.trust.cards[0]?.title
                        }
                        tone="green"
                      />
                    </Stack>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ ...mutedCardSx, p: 2.25, height: '100%' }}>
                    <Stack spacing={1.2} sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          color: '#4ade80',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {content.howItWorks.eyebrow}
                      </Typography>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: '#eef2ff',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          ...clampLines(2),
                        }}
                      >
                        {routePreview}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          ...copySafeSx,
                          fontSize: '0.82rem',
                          lineHeight: 1.65,
                          ...clampLines(2),
                        }}
                      >
                        {content.howItWorks.description}
                      </Typography>
                      <RouteRail />
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Box
              sx={{
                ...mutedCardSx,
                p: { xs: 2.25, md: 2.5 },
                height: '100%',
                borderColor: alpha('#6366f2', 0.34),
                background: `linear-gradient(160deg, ${alpha('#0f1724', 0.98)} 0%, ${alpha('#151d2d', 0.96)} 100%)`,
              }}
            >
              <Stack spacing={2} sx={{ height: '100%', minWidth: 0 }}>
                <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha('#94a3b8', 0.95),
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {content.hero.supportingLabel}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      ...copySafeSx,
                      maxWidth: 430,
                      lineHeight: 1.28,
                    }}
                  >
                    {content.hero.supportingText}
                  </Typography>
                </Stack>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Box sx={{ ...mutedCardSx, p: 2, height: '100%' }}>
                      <Stack spacing={1.25}>
                        <Typography
                          variant="body2"
                          sx={{ color: '#8b9cff', fontWeight: 700 }}
                        >
                          {content.hero.stats[1]?.value}
                        </Typography>
                        <Typography
                          sx={{
                            ...copySafeSx,
                            color: '#eef2ff',
                            fontWeight: 700,
                            lineHeight: 1.3,
                            ...clampLines(2),
                          }}
                        >
                          {content.hero.stats[1]?.label}
                        </Typography>
                        <TrendGraphic />
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={1.5} sx={{ height: '100%' }}>
                      <Box sx={{ ...mutedCardSx, p: 1.75, flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: alpha('#94a3b8', 0.92), mb: 0.75 }}
                        >
                          {content.insights.featured.category}
                        </Typography>
                        <Typography
                          sx={{
                            ...copySafeSx,
                            color: '#eef2ff',
                            fontWeight: 700,
                            lineHeight: 1.35,
                            fontSize: '0.92rem',
                            ...clampLines(3),
                          }}
                        >
                          {content.insights.featured.title}
                        </Typography>
                      </Box>
                      <Box sx={{ ...mutedCardSx, p: 1.75, flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: alpha('#94a3b8', 0.92), mb: 1 }}
                        >
                          {content.topics.eyebrow}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ flexWrap: 'wrap', rowGap: 0.75 }}
                        >
                          {content.topics.items.slice(0, 3).map((item) => (
                            <Chip
                              key={item.title}
                              label={item.title}
                              size="small"
                              sx={{
                                color: '#eef2ff',
                                bgcolor: alpha('#111827', 0.84),
                                border: '1px solid',
                                borderColor: alpha('#475569', 0.72),
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ ...mutedCardSx, p: 1.75, height: '100%' }}>
                      <Stack spacing={1.25}>
                        <Typography
                          variant="body2"
                          sx={{ color: '#fcd34d', fontWeight: 700 }}
                        >
                          {content.hero.stats[0]?.value}
                        </Typography>
                        <Typography
                          sx={{
                            ...copySafeSx,
                            color: '#eef2ff',
                            fontWeight: 700,
                            lineHeight: 1.35,
                            fontSize: '0.92rem',
                            ...clampLines(3),
                          }}
                        >
                          {content.hero.stats[0]?.label}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            pt: 0.25,
                          }}
                        >
                          <Box
                            sx={{
                              width: 1,
                              alignSelf: 'stretch',
                              bgcolor: alpha('#475569', 0.7),
                            }}
                          />
                          <Stack spacing={1.25} sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: '#22c55e',
                              }}
                            />
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: '#fcd34d',
                                alignSelf: 'flex-end',
                              }}
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 7 }}>
                    <Box sx={{ ...mutedCardSx, p: 1.75, height: '100%' }}>
                      <Stack spacing={1}>
                        <Typography
                          variant="body2"
                          sx={{ color: alpha('#94a3b8', 0.92) }}
                        >
                          {content.trust.eyebrow}
                        </Typography>
                        <Typography
                          sx={{
                            ...copySafeSx,
                            color: '#eef2ff',
                            fontWeight: 700,
                            lineHeight: 1.35,
                            ...clampLines(3),
                          }}
                        >
                          {content.trust.cards[0]?.title}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{
                            ...copySafeSx,
                            fontSize: '0.82rem',
                            lineHeight: 1.65,
                            ...clampLines(3),
                          }}
                        >
                          {content.trust.cards[0]?.description}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid size={12}>
                    <Box sx={{ ...mutedCardSx, p: 1.9 }}>
                      <Stack spacing={1.25}>
                        <Typography
                          variant="body2"
                          sx={{ color: alpha('#94a3b8', 0.92) }}
                        >
                          {content.howItWorks.eyebrow}
                        </Typography>
                        <Typography
                          sx={{
                            ...copySafeSx,
                            color: '#eef2ff',
                            fontWeight: 700,
                            lineHeight: 1.35,
                            fontSize: '0.9rem',
                            ...clampLines(2),
                          }}
                        >
                          {content.howItWorks.steps
                            .map((step) => step.title)
                            .join(' • ')}
                        </Typography>
                        <RouteRail />
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ ...sectionSurfaceSx, p: { xs: 2.5, md: 3.5 } }}>
        <SectionHeading
          eyebrow={explainerCopy.eyebrow}
          title={explainerCopy.title}
          description={explainerCopy.description}
        />
        <Grid container spacing={1.5}>
          {content.hero.stats.map((item, index) => {
            const tone =
              (['indigo', 'green', 'yellow'] as const)[index] ?? 'indigo';

            return (
              <Grid key={item.value} size={{ xs: 12, md: 4 }}>
                <Box sx={{ ...mutedCardSx, p: 2, height: '100%' }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    sx={{ height: '100%' }}
                  >
                    <Box sx={{ width: { xs: 108, md: 120 }, flexShrink: 0 }}>
                      <BarsGraphic tone={tone} compact />
                    </Box>
                    <Stack
                      spacing={0.8}
                      sx={{ minWidth: 0, justifyContent: 'center' }}
                    >
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: '#eef2ff',
                          fontWeight: 700,
                        }}
                      >
                        {item.value}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          ...copySafeSx,
                          fontSize: '0.88rem',
                          lineHeight: 1.65,
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Grid container spacing={{ xs: 3, md: 4 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box
            id="how-it-works"
            sx={{
              ...sectionSurfaceSx,
              p: { xs: 2.5, md: 3.5 },
              height: '100%',
            }}
          >
            <SectionHeading
              eyebrow={content.howItWorks.eyebrow}
              title={content.howItWorks.title}
              description={content.howItWorks.description}
              maxWidth={640}
            />
            <Grid container spacing={1.5}>
              {content.howItWorks.steps.map((step) => (
                <Grid key={step.step} size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ ...mutedCardSx, p: 2.1, height: '100%' }}>
                    <Stack spacing={1.1} sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: '#8b9cff', fontWeight: 700 }}>
                        {step.step}
                      </Typography>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: '#eef2ff',
                          fontWeight: 700,
                          lineHeight: 1.35,
                        }}
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          ...copySafeSx,
                          fontSize: '0.86rem',
                          lineHeight: 1.65,
                        }}
                      >
                        {step.description}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Box
            sx={{
              ...sectionSurfaceSx,
              p: { xs: 2.5, md: 3.5 },
              height: '100%',
            }}
          >
            <SectionHeading
              eyebrow={content.trust.eyebrow}
              title={content.trust.title}
              description={content.trust.description}
              maxWidth={640}
            />
            <Grid container spacing={1.5}>
              {content.trust.cards.map((card, index) => {
                const tone =
                  (['indigo', 'green', 'yellow', 'red'] as const)[index] ??
                  'indigo';
                return (
                  <Grid key={card.title} size={{ xs: 12, sm: 6, xl: 3 }}>
                    <Box
                      component={Link}
                      href={localizedHref(card.href)}
                      sx={{
                        ...mutedCardSx,
                        display: 'block',
                        p: 2,
                        height: '100%',
                        textDecoration: 'none',
                        transition:
                          'transform 180ms ease, border-color 180ms ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          borderColor: alpha(visualTone[tone], 0.42),
                        },
                      }}
                    >
                      <Stack spacing={1} sx={{ minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: visualTone[tone],
                          }}
                        />
                        <Typography
                          sx={{
                            ...copySafeSx,
                            color: '#eef2ff',
                            fontWeight: 700,
                            lineHeight: 1.35,
                          }}
                        >
                          {card.title}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{
                            ...copySafeSx,
                            fontSize: '0.8rem',
                            lineHeight: 1.6,
                          }}
                        >
                          {card.description}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ ...sectionSurfaceSx, p: { xs: 2.5, md: 3.5 } }}>
        <SectionHeading
          eyebrow={content.insights.eyebrow}
          title={content.insights.title}
          description={content.insights.description}
        />
        <Grid container spacing={1.75}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box
              component={Link}
              href={localizedHref(content.insights.featured.href)}
              sx={{
                ...mutedCardSx,
                display: 'block',
                p: 2.25,
                height: '100%',
                textDecoration: 'none',
                borderColor: alpha('#818cf8', 0.28),
                background: `linear-gradient(180deg, ${alpha('#1b2550', 0.82)} 0%, ${alpha('#111827', 0.92)} 100%)`,
              }}
            >
              <Stack spacing={1.75} sx={{ height: '100%', minWidth: 0 }}>
                <BarsGraphic tone="indigo" />
                <Typography variant="body2" sx={{ color: '#8b9cff' }}>
                  {content.insights.featured.category}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ ...copySafeSx, color: '#eef2ff', lineHeight: 1.2 }}
                >
                  {content.insights.featured.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ ...copySafeSx, lineHeight: 1.72 }}
                >
                  {content.insights.featured.description}
                </Typography>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <Grid container spacing={1.75}>
              {content.insights.items.map((item, index) => {
                const tone =
                  (['green', 'indigo', 'yellow', 'red'] as const)[index] ??
                  'indigo';
                return (
                  <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
                    <Box
                      component={Link}
                      href={localizedHref(item.href)}
                      sx={{
                        ...mutedCardSx,
                        display: 'block',
                        p: 1.75,
                        height: '100%',
                        textDecoration: 'none',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="flex-start"
                        sx={{ height: '100%' }}
                      >
                        <Box sx={{ width: 118, flexShrink: 0 }}>
                          <BarsGraphic tone={tone} compact />
                        </Box>
                        <Stack
                          spacing={0.8}
                          sx={{ minWidth: 0, justifyContent: 'center' }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: visualTone[tone] }}
                          >
                            {item.category}
                          </Typography>
                          <Typography
                            sx={{
                              ...copySafeSx,
                              color: '#eef2ff',
                              fontWeight: 700,
                              lineHeight: 1.35,
                              ...clampLines(3),
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            color="text.secondary"
                            sx={{
                              ...copySafeSx,
                              fontSize: '0.84rem',
                              lineHeight: 1.62,
                              ...clampLines(3),
                            }}
                          >
                            {item.description}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={{ xs: 3, md: 4 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box
            sx={{
              ...sectionSurfaceSx,
              p: { xs: 2.5, md: 3.5 },
              height: '100%',
            }}
          >
            <SectionHeading
              eyebrow={content.topics.eyebrow}
              title={content.topics.title}
              description={content.topics.description}
              maxWidth={520}
            />
            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={0.9}
                sx={{ flexWrap: 'wrap', rowGap: 0.9 }}
              >
                {content.topics.items.map((item) => (
                  <Chip
                    key={item.title}
                    label={item.title}
                    component={Link}
                    href={localizedHref(item.href)}
                    clickable
                    sx={{
                      color: '#eef2ff',
                      bgcolor: alpha('#111827', 0.88),
                      border: '1px solid',
                      borderColor: alpha('#475569', 0.72),
                      '& .MuiChip-label': { px: 1.25, fontWeight: 500 },
                    }}
                  />
                ))}
              </Stack>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ ...mutedCardSx, p: 2, height: '100%' }}>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#eef2ff',
                        fontWeight: 700,
                        mb: 1,
                      }}
                    >
                      {microCopy.topicsSupportTitle}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{
                        ...copySafeSx,
                        fontSize: '0.84rem',
                        lineHeight: 1.65,
                      }}
                    >
                      {microCopy.topicsSupportBody}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ ...mutedCardSx, p: 2, height: '100%' }}>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#eef2ff',
                        fontWeight: 700,
                        mb: 1,
                      }}
                    >
                      {microCopy.searchRoleTitle}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{
                        ...copySafeSx,
                        fontSize: '0.84rem',
                        lineHeight: 1.65,
                      }}
                    >
                      {microCopy.searchRoleBody}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Box
            sx={{
              ...sectionSurfaceSx,
              p: { xs: 2.5, md: 3.5 },
              height: '100%',
            }}
          >
            <SectionHeading
              eyebrow={content.entities.eyebrow}
              title={content.entities.title}
              description={content.entities.description}
              maxWidth={600}
            />
            <Grid container spacing={1.5}>
              {content.entities.items.map((item, index) => {
                const tone =
                  (['indigo', 'green', 'yellow'] as const)[index] ?? 'indigo';
                return (
                  <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                    <Box
                      component={Link}
                      href={localizedHref(item.href)}
                      sx={{
                        ...mutedCardSx,
                        display: 'block',
                        p: 2,
                        height: '100%',
                        textDecoration: 'none',
                      }}
                    >
                      <Stack spacing={1.2} sx={{ minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              bgcolor: visualTone[tone],
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: '#eef2ff', fontWeight: 600 }}
                          >
                            {item.label}
                          </Typography>
                        </Stack>
                        <Divider sx={{ borderColor: alpha('#475569', 0.7) }} />
                        <Typography
                          sx={{
                            ...copySafeSx,
                            color: '#eef2ff',
                            fontWeight: 700,
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{
                            ...copySafeSx,
                            fontSize: '0.84rem',
                            lineHeight: 1.65,
                          }}
                        >
                          {item.description}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ flexWrap: 'wrap', rowGap: 0.75 }}
                        >
                          {[
                            item.label,
                            content.insights.eyebrow,
                            content.topics.eyebrow,
                          ]
                            .slice(0, 3)
                            .map((label) => (
                              <Chip
                                key={`${item.title}-${label}`}
                                label={label}
                                size="small"
                                sx={{
                                  color: '#eef2ff',
                                  bgcolor: alpha('#111827', 0.84),
                                  border: '1px solid',
                                  borderColor: alpha('#475569', 0.72),
                                }}
                              />
                            ))}
                        </Stack>
                      </Stack>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 3, md: 4 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box
            id="quizzes"
            sx={{
              ...sectionSurfaceSx,
              p: { xs: 2.5, md: 3.5 },
              height: '100%',
            }}
          >
            <SectionHeading
              eyebrow={content.quiz.eyebrow}
              title={content.quiz.title}
              description={content.quiz.description}
              maxWidth={520}
            />
            <Box
              component={Link}
              href={localizedHref(content.quiz.href)}
              sx={{
                ...mutedCardSx,
                display: 'block',
                textDecoration: 'none',
                p: 2,
                borderColor: alpha('#fcd34d', 0.28),
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 126, flexShrink: 0 }}>
                  <BarsGraphic tone="yellow" compact />
                </Box>
                <Stack spacing={0.7} sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: '#fcd34d' }}>
                    {content.quiz.eyebrow}
                  </Typography>
                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: '#eef2ff',
                      fontWeight: 700,
                      lineHeight: 1.35,
                    }}
                  >
                    {content.quiz.cardTitle}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{
                      ...copySafeSx,
                      fontSize: '0.84rem',
                      lineHeight: 1.62,
                    }}
                  >
                    {content.quiz.cardDescription}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Box
            sx={{
              ...sectionSurfaceSx,
              p: { xs: 2.5, md: 3.5 },
              height: '100%',
            }}
          >
            <SectionHeading
              eyebrow={content.faq.eyebrow}
              title={content.faq.title}
              description={content.faq.description}
              maxWidth={540}
            />
            <Stack spacing={1.1}>
              {content.faq.items.map((item, index) => {
                return (
                  <Accordion
                    key={item.question}
                    disableGutters
                    elevation={0}
                    sx={{
                      ...mutedCardSx,
                      borderRadius: '18px !important',
                      '&::before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreRoundedIcon sx={{ color: '#eef2ff' }} />
                      }
                      sx={{ px: 2.25, py: 0.25 }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.25}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                        sx={{ width: '100%', minWidth: 0 }}
                      >
                        <Typography
                          sx={{
                            ...copySafeSx,
                            color: '#eef2ff',
                            fontWeight: 600,
                            pr: 1,
                          }}
                        >
                          {item.question}
                        </Typography>
                        <Chip
                          label={
                            microCopy.faqTags[index] ?? content.faq.eyebrow
                          }
                          size="small"
                          sx={{
                            color: '#eef2ff',
                            bgcolor: alpha('#111827', 0.86),
                            border: '1px solid',
                            borderColor: alpha('#475569', 0.72),
                          }}
                        />
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2.25, pt: 0, pb: 2 }}>
                      <Typography
                        color="text.secondary"
                        sx={{ ...copySafeSx, lineHeight: 1.7 }}
                      >
                        {item.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ ...sectionSurfaceSx, p: { xs: 2.5, md: 3.5 } }}>
        <SectionHeading
          eyebrow={content.methodology.eyebrow}
          title={content.methodology.title}
          description={content.methodology.description}
          maxWidth={620}
        />
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {trustPreviewCards.map((card, index) => (
            <Grid key={card.title} size={{ xs: 12, md: 4 }}>
              <Box
                component={Link}
                href={localizedHref(card.href)}
                sx={{
                  ...mutedCardSx,
                  display: 'block',
                  textDecoration: 'none',
                  p: 2,
                  height: '100%',
                }}
              >
                <Stack spacing={1} sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {index === 0 ? (
                      <Box
                        sx={{
                          width: 56,
                          height: 4,
                          borderRadius: 999,
                          bgcolor: '#8b9cff',
                        }}
                      />
                    ) : index === 1 ? (
                      <Stack direction="row" spacing={0.9} alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: '#8b5cf6',
                          }}
                        />
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: '#22c55e',
                          }}
                        />
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: '#8b5cf6',
                          }}
                        />
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: '#fcd34d',
                          }}
                        />
                        <Box
                          sx={{
                            width: 32,
                            height: 3,
                            borderRadius: 999,
                            bgcolor: alpha('#64748b', 0.8),
                          }}
                        />
                      </Stack>
                    )}
                  </Box>
                  <Typography
                    sx={{ ...copySafeSx, color: '#eef2ff', fontWeight: 700 }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{
                      ...copySafeSx,
                      fontSize: '0.84rem',
                      lineHeight: 1.62,
                    }}
                  >
                    {card.description}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            component={Link}
            href={localizedHref(PUBLIC_PAGE_PATHS.about)}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: '999px',
              borderColor: alpha('#94a3b8', 0.28),
              color: '#eef2ff',
            }}
          >
            {content.methodology.primaryCtaLabel}
          </Button>
          <Button
            component={Link}
            href={localizedHref(PUBLIC_PAGE_PATHS.methodology)}
            variant="text"
            size="large"
            sx={{ color: '#dbeafe' }}
          >
            {content.methodology.secondaryCtaLabel}
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          borderRadius: { xs: 5, md: 6 },
          p: { xs: 2.5, md: 3.5 },
          border: '1px solid',
          borderColor: alpha('#818cf8', 0.36),
          background: `linear-gradient(135deg, ${alpha('#1f284b', 0.98)} 0%, ${alpha('#4f46e5', 0.96)} 58%, ${alpha('#4338ca', 0.98)} 100%)`,
          boxShadow: `0 26px 60px ${alpha('#312e81', 0.34)}`,
        }}
      >
        <Grid container spacing={{ xs: 2.5, md: 3 }} alignItems="center">
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={1.5} sx={{ minWidth: 0 }}>
              <EyebrowChip label={content.finalCta.eyebrow} />
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  ...copySafeSx,
                  color: '#ffffff',
                  fontSize: { xs: '2rem', md: '2.4rem' },
                  lineHeight: 1.08,
                  letterSpacing: '-0.04em',
                  maxWidth: 560,
                }}
              >
                {content.finalCta.title}
              </Typography>
              <Typography
                sx={{
                  ...copySafeSx,
                  maxWidth: 560,
                  color: alpha('#eef2ff', 0.9),
                  lineHeight: 1.76,
                }}
              >
                {content.finalCta.description}
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ pt: 1 }}
              >
                <Button
                  component={Link}
                  href={anchorHref('download')}
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: '#ffffff',
                    color: '#111827',
                    borderRadius: '999px',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.92),
                      boxShadow: 'none',
                    },
                  }}
                >
                  {content.finalCta.primaryCtaLabel}
                </Button>
                <Button
                  component={Link}
                  href={localizedHref(PUBLIC_HUB_PATHS.insights)}
                  variant="outlined"
                  size="large"
                  sx={{
                    borderRadius: '999px',
                    color: '#ffffff',
                    borderColor: alpha('#ffffff', 0.34),
                  }}
                >
                  {content.finalCta.secondaryCtaLabel}
                </Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ maxWidth: 228, ml: { lg: 'auto' } }}>
              <TrendGraphic />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
