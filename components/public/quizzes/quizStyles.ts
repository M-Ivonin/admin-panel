import { alpha } from '@mui/material/styles';

export const quizHeadlineFontFamily =
  'Roboto, var(--font-geist-sans), sans-serif';

export const quizSectionSx = {
  position: 'relative',
  overflow: 'hidden',
  py: { xs: 5, md: 7 },
} as const;

export const quizBackdropSx = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  backgroundImage: `
    radial-gradient(circle at 0% 12%, ${alpha('#38bdf8', 0.12)} 0%, transparent 28%),
    radial-gradient(circle at 88% 26%, ${alpha('#8b5cf6', 0.14)} 0%, transparent 20%),
    linear-gradient(90deg, ${alpha('#123a55', 0.22)} 0%, ${alpha(
      '#0a1732',
      0.04
    )} 55%, ${alpha('#1e1242', 0.12)} 100%)
  `,
} as const;

export const quizContentSx = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  maxWidth: 1440,
  mx: 'auto',
  px: { xs: 2.5, sm: 4, md: 6, lg: 10 },
} as const;

export const quizPanelSx = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 4,
  border: '1px solid',
  borderColor: alpha('#334155', 0.92),
  bgcolor: alpha('#111827', 0.56),
  boxShadow: `0 18px 48px ${alpha('#020617', 0.42)}`,
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)',
} as const;

export const quizDeeperPanelSx = {
  ...quizPanelSx,
  bgcolor: alpha('#0b1220', 0.54),
} as const;

export const quizHeroPanelSx = {
  ...quizPanelSx,
  borderRadius: { xs: 4, md: 4.5 },
  borderColor: alpha('#2f3b58', 0.92),
  background:
    'linear-gradient(180deg, rgba(18,27,49,0.56) 0%, rgba(20,23,42,0.68) 100%)',
  boxShadow: `0 26px 70px ${alpha('#000000', 0.54)}`,
} as const;

export const quizDiscoveryCardSx = {
  ...quizPanelSx,
  borderRadius: 4,
  borderColor: alpha('#6e7398', 0.4),
  background:
    'linear-gradient(180deg, rgba(20,26,46,0.54) 0%, rgba(16,23,41,0.44) 50%, rgba(12,19,33,0.38) 100%)',
  boxShadow: `0 12px 26px ${alpha('#040710', 0.36)}`,
} as const;

export const quizQuizCardSx = {
  ...quizPanelSx,
  borderRadius: 4,
  borderColor: alpha('#6e7398', 0.4),
  background:
    'linear-gradient(180deg, rgba(26,26,51,0.74) 0%, rgba(34,34,74,0.68) 100%)',
  boxShadow: `0 12px 26px ${alpha('#040710', 0.36)}`,
} as const;

export const quizChipSx = {
  borderRadius: '999px',
  border: '1px solid',
  borderColor: alpha('#475569', 0.6),
  bgcolor: alpha('#0f172a', 0.56),
  color: '#f8fafc',
  fontSize: '0.75rem',
  fontWeight: 600,
} as const;

export const quizEyebrowSx = {
  color: alpha('#cbd5e1', 0.74),
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
} as const;

export const quizHeroTitleSx = {
  fontFamily: quizHeadlineFontFamily,
  fontSize: { xs: '3rem', md: '4.125rem' },
  lineHeight: 0.94,
  fontWeight: 700,
  letterSpacing: '-0.05em',
  color: '#f8fafc',
} as const;

export const quizSectionTitleSx = {
  fontFamily: quizHeadlineFontFamily,
  fontSize: { xs: '2rem', md: '2.35rem' },
  lineHeight: 1.04,
  fontWeight: 700,
  letterSpacing: '-0.04em',
  color: '#f8fafc',
} as const;

export const quizBodyTextSx = {
  color: '#aab6ca',
  lineHeight: 1.45,
  fontSize: { xs: '1rem', md: '1.1875rem' },
} as const;

export const quizMutedTextSx = {
  color: '#94a3b8',
} as const;

export const quizRailSx = {
  borderRadius: '999px',
  bgcolor: alpha('#0b1421', 0.5),
  border: '1px solid',
  borderColor: alpha('#31435e', 0.9),
  px: { xs: 2, md: 2.5 },
  py: 1.15,
} as const;

export const quizPrimaryButtonSx = {
  borderRadius: '999px',
  px: 2.25,
  py: 1.1,
  bgcolor: '#4f46e5',
  boxShadow: 'none',
  fontFamily: quizHeadlineFontFamily,
  textTransform: 'none',
  fontWeight: 600,
  letterSpacing: 0,
  '&:hover': {
    bgcolor: '#5b54ff',
    boxShadow: 'none',
  },
} as const;

export const quizSecondaryButtonSx = {
  borderRadius: '999px',
  px: 2.25,
  py: 1.1,
  borderColor: alpha('#475569', 0.72),
  bgcolor: alpha('#0b1220', 0.42),
  color: '#f8fafc',
  fontFamily: quizHeadlineFontFamily,
  textTransform: 'none',
  fontWeight: 600,
  letterSpacing: 0,
  '&:hover': {
    borderColor: alpha('#6366f2', 0.48),
    bgcolor: alpha('#111827', 0.56),
  },
} as const;
