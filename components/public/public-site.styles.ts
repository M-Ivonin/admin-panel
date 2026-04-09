import type { CSSProperties } from 'react';
import { alpha } from '@mui/material/styles';

export const publicSitePagePx = { xs: 2.5, sm: 4, md: 6, lg: 10 } as const;
export const publicSiteSectionGapY = { xs: 4.5, md: 7 } as const;
export const publicSitePageMaxWidth = 1440;

export const publicSiteBackground =
  'linear-gradient(90deg, #0b2d45 0%, #0a1730 34%, #07091d 68%, #140c2f 100%)';

export const publicSiteShellSx = {
  minHeight: '100vh',
  bgcolor: '#07091d',
  color: 'text.primary',
  background: publicSiteBackground,
  overflowX: 'clip',
} as const;

export const publicSiteContainedMainSx = {
  px: { xs: 2, sm: 3 },
} as const;

export const publicSiteChromePanelSx = {
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: alpha('#334155', 0.92),
  boxShadow: `0 18px 48px ${alpha('#020617', 0.42)}`,
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)',
} as const;

export const publicSiteHeaderRootSx = {
  position: 'sticky',
  top: 0,
  zIndex: 30,
  borderBottom: '1px solid',
  borderColor: alpha('#20293a', 0.38),
  bgcolor: alpha('#090d16', 0.4),
  backdropFilter: 'blur(18px)',
} as const;

export const publicSiteHeaderInnerSx = {
  width: '100%',
  maxWidth: publicSitePageMaxWidth,
  mx: 'auto',
  px: publicSitePagePx,
  py: { xs: 1.5, md: 2.5 },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: { xs: 1.5, md: 3 },
} as const;

export const publicSiteFooterRootSx = {
  pt: { xs: 5, md: 4.5 },
  pb: { xs: 6, md: 8 },
  borderTop: '1px solid',
  borderColor: '#1f2937',
  bgcolor: '#090d16',
} as const;

export const publicSiteFooterInnerSx = {
  width: '100%',
  maxWidth: publicSitePageMaxWidth,
  mx: 'auto',
  px: publicSitePagePx,
  display: 'flex',
  flexDirection: { xs: 'column', lg: 'row' },
  alignItems: { xs: 'stretch', lg: 'flex-start' },
  justifyContent: 'space-between',
  gap: { xs: 4, lg: 7 },
} as const;

export const publicSiteHeaderBrandmarkSx = {
  width: { xs: 28, md: 32 },
  height: { xs: 34, md: 38 },
  display: 'block',
} as const;

export const publicSiteHeaderTypemarkSx = {
  width: { xs: 82, md: 96 },
  height: { xs: 20, md: 24 },
  display: 'block',
} as const;

export const publicSiteFooterBrandmarkSx = {
  width: 32,
  height: 38,
  display: 'block',
} as const;

export const publicSiteFooterTypemarkSx = {
  width: 96,
  height: 24,
  display: 'block',
} as const;

export const publicLegalSectionSx = {
  py: 6,
} as const;

export const publicLegalArticleSx = {
  maxWidth: 900,
  mx: 'auto',
} as const;

export const publicLegalTitleRowSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  mb: 4,
} as const;

export const publicLegalLastUpdatedSx = {
  mb: 4,
} as const;

export const publicLegalBrandImageStyle: CSSProperties = {
  width: 48,
  height: 48,
};
