import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { DisclaimerContent } from '@/components/legal/DisclaimerContent';
import { PublicSiteFooter } from '@/components/public/PublicSiteFooter';
import { buildContentPageMetadata } from '@/modules/seo/metadata';
import { staticPublicContentRepository } from '@/modules/content/static-public-content-repository';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const page = await staticPublicContentRepository.getPage('disclaimer', lang);

  if (!page) {
    return {};
  }

  return buildContentPageMetadata(page);
}

export default async function DisclaimerPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 2, sm: 0 } }}>
            <Link href={`/${lang}`} passHref legacyBehavior>
              <Button
                startIcon={<ArrowBackIcon />}
                color="inherit"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: 'text.primary' },
                  transition: 'color 0.2s'
                }}
              >
                {t.nav.backToHome}
              </Button>
            </Link>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" component="main" sx={{ py: 6 }}>
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
              {t.footer.disclaimer}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t.legal.lastUpdated}
          </Typography>
          
          <DisclaimerContent />
        </Box>
      </Container>

      <PublicSiteFooter locale={lang} />
    </Box>
  );
}
