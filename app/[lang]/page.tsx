import Link from 'next/link';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { Locale } from '@/lib/i18n/config';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AppStoreButtons } from '@/components/AppStoreButtons';

export default async function LandingPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              <Image 
                src="/assets/brandmark.png" 
                alt="SirBro" 
                width={40} 
                height={40} 
                style={{ width: 'auto', height: 'auto', maxHeight: 40, maxWidth: 40 }}
              />
              <Image 
                src="/assets/typemark.png" 
                alt="SirBro" 
                width={120} 
                height={32}
                style={{ height: 'auto', width: 'auto', maxHeight: 32, maxWidth: 120 }}
              />
            </Box>
            <LanguageSwitcher currentLocale={lang} />
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" component="main">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: 'calc(100vh - 200px)',
            textAlign: 'center',
            py: 8
          }}
        >
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mb: 4
              }}
            >
              {t.hero.title}
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                maxWidth: 750,
                mx: 'auto',
                mb: 6
              }}
            >
              {t.hero.subtitle}
            </Typography>

            <Box sx={{ pt: 4 }}>
              <AppStoreButtons />
            </Box>
          </Box>
        </Box>
      </Container>

      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', mt: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 3, md: 4 },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 } }}>
                <Link href={`/${lang}/privacy`} style={{ textDecoration: 'none' }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      '&:hover': { color: 'text.primary' },
                      transition: 'color 0.2s'
                    }}
                  >
                    {t.footer.privacy}
                  </Typography>
                </Link>
                <Link href={`/${lang}/terms`} style={{ textDecoration: 'none' }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      '&:hover': { color: 'text.primary' },
                      transition: 'color 0.2s'
                    }}
                  >
                    {t.footer.terms}
                  </Typography>
                </Link>
                <Link href={`/${lang}/disclaimer`} style={{ textDecoration: 'none' }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      '&:hover': { color: 'text.primary' },
                      transition: 'color 0.2s'
                    }}
                  >
                    {t.footer.disclaimer}
                  </Typography>
                </Link>
                <Link href={`/${lang}/cookies`} style={{ textDecoration: 'none' }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      '&:hover': { color: 'text.primary' },
                      transition: 'color 0.2s'
                    }}
                  >
                    {t.footer.cookies}
                  </Typography>
                </Link>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                {t.footer.company}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Typography 
                  component="a" 
                  href={`mailto:${t.footer.support}`}
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { color: 'text.primary' },
                    transition: 'color 0.2s'
                  }}
                >
                  {t.footer.support}
                </Typography>
                <Typography variant="body2" color="text.secondary">·</Typography>
                <Typography 
                  component="a" 
                  href={`mailto:${t.footer.legal}`}
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { color: 'text.primary' },
                    transition: 'color 0.2s'
                  }}
                >
                  {t.footer.legal}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                {t.footer.copyright}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
