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
import { TermsContent } from '@/components/legal/TermsContent';

export default async function TermsPage({ params }: { params: { lang: Locale } }) {
  const t = getDictionary(params.lang);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 2, sm: 0 } }}>
            <Button
              component={Link}
              href={`/${params.lang}`}
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
              {t.footer.terms}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t.legal.lastUpdated}
          </Typography>
          
          <TermsContent />
        </Box>
      </Container>

      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', mt: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 }, mb: 3 }}>
              <Link href={`/${params.lang}/privacy`} passHref legacyBehavior>
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
              <Link href={`/${params.lang}/terms`} passHref legacyBehavior>
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
              <Link href={`/${params.lang}/disclaimer`} passHref legacyBehavior>
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
              <Link href={`/${params.lang}/cookies`} passHref legacyBehavior>
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
