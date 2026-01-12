import Link from 'next/link';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export default async function CookiesPage({ params }: { params: Promise<{ lang: Locale }> }) {
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
              {t.footer.cookies}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t.legal.lastUpdated}
          </Typography>
          
          <Box sx={{ '& > *': { mb: 3 } }}>
            <Typography color="text.secondary">
              By installing, accessing, or using SirBro, you confirm that you have read, understood, and agreed to all the terms, policies, and conditions described in this document.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
              1. What Are Cookies
            </Typography>
            <Typography>
              Cookies are small text files stored on your device to help improve your experience.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
              2. How We Use Cookies
            </Typography>
            <Box component="ul" sx={{ pl: 4, '& li': { mb: 1 } }}>
              <li>Essential cookies for app functionality</li>
              <li>Analytics cookies to understand usage patterns</li>
              <li>Preference cookies to remember your settings</li>
            </Box>

            <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
              3. Managing Cookies
            </Typography>
            <Typography>
              You can control cookies through your device settings.
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 4 }}>
              © 2025 Levantem AI LTD. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Container>

      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', mt: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 }, mb: 3 }}>
              <Link href={`/${lang}/privacy`} passHref legacyBehavior>
                <Typography 
                  component="a" 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { color: 'text.primary' },
                    transition: 'color 0.2s'
                  }}
                >
                  {t.footer.privacy}
                </Typography>
              </Link>
              <Link href={`/${lang}/terms`} passHref legacyBehavior>
                <Typography 
                  component="a" 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { color: 'text.primary' },
                    transition: 'color 0.2s'
                  }}
                >
                  {t.footer.terms}
                </Typography>
              </Link>
              <Link href={`/${lang}/disclaimer`} passHref legacyBehavior>
                <Typography 
                  component="a" 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { color: 'text.primary' },
                    transition: 'color 0.2s'
                  }}
                >
                  {t.footer.disclaimer}
                </Typography>
              </Link>
              <Link href={`/${lang}/cookies`} passHref legacyBehavior>
                <Typography 
                  component="a" 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { color: 'text.primary' },
                    transition: 'color 0.2s'
                  }}
                >
                  {t.footer.cookies}
                </Typography>
              </Link>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t.footer.copyright}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
