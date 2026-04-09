import Image from 'next/image';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import {
  publicLegalArticleSx,
  publicLegalBrandImageStyle,
  publicLegalLastUpdatedSx,
  publicLegalSectionSx,
  publicLegalTitleRowSx,
} from '@/components/public/public-site.styles';

type LegalDocumentTitleKey = 'privacy' | 'terms' | 'disclaimer' | 'cookies';

export function LegalDocumentPage({
  locale,
  titleKey,
  children,
}: {
  locale: Locale;
  titleKey: LegalDocumentTitleKey;
  children: React.ReactNode;
}) {
  const t = getDictionary(locale);

  return (
    <PublicPageShell locale={locale}>
      <Box sx={publicLegalSectionSx}>
        <Box component="article" sx={publicLegalArticleSx}>
          <Box sx={publicLegalTitleRowSx}>
            <Image
              src="/assets/brandmark.png"
              alt="SirBro"
              width={48}
              height={48}
              style={publicLegalBrandImageStyle}
            />
            <Typography variant="h3" component="h1" fontWeight={700}>
              {t.footer[titleKey]}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={publicLegalLastUpdatedSx}>
            {t.legal.lastUpdated}
          </Typography>

          {children}
        </Box>
      </Box>
    </PublicPageShell>
  );
}
