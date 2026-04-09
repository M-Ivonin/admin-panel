import { alpha } from '@mui/material/styles';
import {
  publicSiteBackground,
  publicSiteChromePanelSx,
  publicSitePageMaxWidth,
  publicSitePagePx,
  publicSiteSectionGapY,
} from '@/components/public/public-site.styles';

export const homepagePalette = {
  surface: '#111827',
  surfaceAlt: '#0b1220',
  surfaceDeep: '#0f172a',
  shadow: '#020617',
  surfaceBorder: '#475569',
  sectionBorder: '#334155',
  textStrong: '#f8fafc',
  textPrimary: '#f1f5f9',
  textBody: '#e2e8f0',
  textMuted: '#94a3b8',
  textSoft: '#cbd5e1',
  textInverse: '#ffffff',
  textCta: '#f9fafb',
  textCtaSubtle: '#ddd6fe',
  accent: '#6366f2',
  accentSolid: '#4f46e5',
  accentSoft: '#8b5cf6',
  accentTint: '#a5b4fc',
  accentBorder: '#4f4a7a',
  accentSurface: '#221735',
  discoveryPanelBackground:
    'linear-gradient(180deg, rgba(26,26,51,0.74) 0%, rgba(34,34,74,0.68) 100%)',
  discoverySeoBackground:
    'linear-gradient(180deg, rgba(15,23,42,0.72) 0%, rgba(19,32,52,0.64) 100%)',
  finalCtaBackground:
    'linear-gradient(90deg, #0a1228 0%, #11162a 52%, #2b2760 82%, #3a2f73 100%)',
} as const;

export const copySafeSx = {
  minWidth: 0,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
} as const;

export const motionRevealSx = (delay = 0) => ({
  opacity: 0,
  animation: 'sbReveal 0.72s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  animationDelay: `${delay}ms`,
});

export const panelSx = publicSiteChromePanelSx;

export const homepageRootSx = {
  minHeight: '100vh',
  background: publicSiteBackground,
  color: homepagePalette.textStrong,
  overflowX: 'clip',
} as const;

export const homepageContentSx = {
  position: 'relative',
  width: '100%',
  maxWidth: publicSitePageMaxWidth,
  mx: 'auto',
  px: publicSitePagePx,
  py: { xs: 5, md: 7 },
  display: 'flex',
  flexDirection: 'column',
  gap: publicSiteSectionGapY,
} as const;

export const homepageStoreBadgeLinkSx = {
  display: 'inline-flex',
  width: 'auto',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 3,
  transition: 'transform 220ms ease, filter 220ms ease',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.02)',
    filter: 'brightness(1.06)',
  },
} as const;

export const homepageStoreBadgeImageSx = (width: number) => ({
  width: { xs: width - 8, sm: width },
  height: 'auto',
  display: 'block',
});

export const homepageSectionHeadingStackSx = (maxWidth = 760) => ({
  maxWidth,
});

export const homepageSectionHeadingTitleSx = {
  ...copySafeSx,
  color: homepagePalette.textStrong,
  fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
  fontSize: { xs: '1.8rem', sm: '2rem', md: '2.35rem' },
  fontWeight: 600,
  lineHeight: { xs: 1.08, md: 1.12 },
} as const;

export const homepageSectionHeadingDescriptionSx = {
  ...copySafeSx,
  color: homepagePalette.textMuted,
  fontSize: { xs: '0.95rem', md: '1rem' },
  lineHeight: { xs: 1.55, md: 1.58 },
} as const;

export const homepageProductCardRootSx = (accentColor: string) => ({
  ...panelSx,
  borderRadius: { xs: 3, md: 3.5 },
  bgcolor: alpha(homepagePalette.surface, 0.58),
  p: { xs: 2, sm: 2.5, md: 2.75 },
  flex: { xs: '0 0 auto', md: '1 1 0' },
  minWidth: { xs: '100%', md: 0 },
  transition: 'transform 260ms ease, border-color 260ms ease, box-shadow 260ms ease',
  '&:hover': {
    transform: 'translateY(-6px)',
    borderColor: alpha(accentColor, 0.54),
    boxShadow: `0 26px 56px ${alpha(accentColor, 0.16)}`,
  },
});

export const homepageProductCardMediaFrameSx = {
  ...panelSx,
  borderRadius: { xs: 2.5, md: 3 },
  height: { xs: 220, sm: 260, md: 300 },
  bgcolor: alpha(homepagePalette.surfaceAlt, 0.42),
} as const;

export const homepageProductCardMediaSx = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
} as const;

export const homepageProductCardTitleSx = {
  ...copySafeSx,
  color: homepagePalette.textPrimary,
  fontSize: { xs: '1.25rem', md: '1.375rem' },
  fontWeight: 600,
} as const;

export const homepageProductCardDescriptionSx = {
  ...copySafeSx,
  color: homepagePalette.textMuted,
  fontSize: { xs: '0.875rem', md: '0.9rem' },
  lineHeight: 1.55,
} as const;

export const homepageFinalCtaPrimaryButtonSx = {
  flex: '1 1 0',
  minWidth: 0,
  borderRadius: '999px',
  px: { xs: 1.5, sm: 2.25 },
  py: 1.75,
  bgcolor: homepagePalette.accentSolid,
  color: homepagePalette.textInverse,
  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
  fontWeight: 600,
  lineHeight: 1,
  whiteSpace: 'nowrap',
  boxShadow: `0 10px 28px ${alpha(homepagePalette.accentSoft, 0.33)}`,
  '&:hover': {
    bgcolor: homepagePalette.accentSolid,
    boxShadow: `0 10px 28px ${alpha(homepagePalette.accentSoft, 0.33)}`,
  },
} as const;

export const homepageFinalCtaSecondaryButtonSx = {
  flex: '1 1 0',
  minWidth: 0,
  borderRadius: '999px',
  px: { xs: 1.5, sm: 2.25 },
  py: 1.75,
  color: homepagePalette.textCta,
  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
  fontWeight: 600,
  lineHeight: 1,
  whiteSpace: 'nowrap',
  borderColor: homepagePalette.accentSoft,
  bgcolor: homepagePalette.accentSurface,
  '&:hover': {
    borderColor: homepagePalette.accentSoft,
    bgcolor: homepagePalette.accentSurface,
  },
} as const;
