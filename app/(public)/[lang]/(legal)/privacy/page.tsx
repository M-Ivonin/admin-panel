import Image from 'next/image';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { PrivacyContent } from '@/components/legal/PrivacyContent';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { buildContentPageMetadata } from '@/modules/seo/metadata';
import { staticPublicContentRepository } from '@/modules/content/static-public-content-repository';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const page = await staticPublicContentRepository.getPage('privacy', lang);

  if (!page) {
    return {};
  }

  return buildContentPageMetadata(page);
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);

  return (
    <PublicPageShell locale={lang}>
      <Box sx={{ py: 6 }}>
        <Box component="article" sx={{ maxWidth: 900, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Image 
              src="/assets/brandmark.png" 
              alt="SirBro" 
              width={48} 
              height={48}
              style={{ height: 48, width: 48 }}
            />
            <Typography variant="h3" component="h1" fontWeight={700}>
              {t.footer.privacy}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t.legal.lastUpdated}
          </Typography>
          
          <PrivacyContent locale={lang} />
        </Box>
      </Box>
    </PublicPageShell>
  );
}
