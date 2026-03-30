import Link from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Locale } from '@/lib/i18n/config';
import { buildLocalizedPath } from '@/modules/seo/route-registry';
import { PUBLIC_PAGE_PATHS } from '@/modules/content/public-pages';

const pagePx = { xs: 2.5, sm: 4, md: 6, lg: 10 };
const pageMaxWidth = 1440;

const footerColumns = {
  en: [
    {
      title: 'Product',
      items: ['Home', 'Download App', 'Chat Preview', 'How It Works'],
    },
    {
      title: 'Insights',
      items: [
        'Latest Insights',
        'Injury Impact',
        'Match Outlook',
        'Lineup Changes',
        'Tactical Analysis',
      ],
    },
    {
      title: 'Explore',
      items: ['Teams', 'Players', 'Leagues', 'Topics', 'Quizzes'],
    },
    {
      title: 'Trust',
      items: [
        'About SirBro',
        'Methodology',
        'Editorial Policy',
        'AI Transparency',
        'FAQ',
        'Contact',
      ],
    },
    {
      title: 'Legal',
      items: ['Privacy', 'Terms', 'Disclaimer', 'Cookies'],
    },
    {
      title: 'Social / Stores',
      items: ['App Store', 'Google Play', 'X / Twitter', 'Instagram', 'TikTok'],
    },
  ],
  es: [
    {
      title: 'Producto',
      items: ['Inicio', 'Descargar App', 'Vista del chat', 'Cómo funciona'],
    },
    {
      title: 'Insights',
      items: [
        'Últimos insights',
        'Impacto de lesiones',
        'Panorama del partido',
        'Cambios de alineación',
        'Análisis táctico',
      ],
    },
    {
      title: 'Explorar',
      items: ['Equipos', 'Jugadores', 'Ligas', 'Temas', 'Quizzes'],
    },
    {
      title: 'Confianza',
      items: [
        'Sobre SirBro',
        'Metodología',
        'Política Editorial',
        'Transparencia de IA',
        'FAQ',
        'Contacto',
      ],
    },
    {
      title: 'Legal',
      items: ['Privacidad', 'Términos', 'Descargo', 'Cookies'],
    },
    {
      title: 'Social / Tiendas',
      items: ['App Store', 'Google Play', 'X / Twitter', 'Instagram', 'TikTok'],
    },
  ],
  pt: [
    {
      title: 'Produto',
      items: ['Início', 'Baixar App', 'Prévia do chat', 'Como funciona'],
    },
    {
      title: 'Insights',
      items: [
        'Últimos insights',
        'Impacto de lesão',
        'Panorama da partida',
        'Mudanças na escalação',
        'Análise tática',
      ],
    },
    {
      title: 'Explorar',
      items: ['Times', 'Jogadores', 'Ligas', 'Tópicos', 'Quizzes'],
    },
    {
      title: 'Confiança',
      items: [
        'Sobre o SirBro',
        'Metodologia',
        'Política Editorial',
        'Transparência de IA',
        'FAQ',
        'Contato',
      ],
    },
    {
      title: 'Legal',
      items: ['Privacidade', 'Termos', 'Isenção', 'Cookies'],
    },
    {
      title: 'Social / Lojas',
      items: ['App Store', 'Google Play', 'X / Twitter', 'Instagram', 'TikTok'],
    },
  ],
} as const satisfies Record<Locale, Array<{ title: string; items: string[] }>>;

function footerColumnWidth(title: string) {
  if (title === 'Product' || title === 'Producto' || title === 'Produto') {
    return 120;
  }

  if (title === 'Insights') {
    return 140;
  }

  if (title === 'Explore' || title === 'Explorar') {
    return 120;
  }

  if (title === 'Trust' || title === 'Confianza' || title === 'Confiança') {
    return 160;
  }

  if (title === 'Legal') {
    return 120;
  }

  return 130;
}

export function PublicSiteFooter({ locale }: { locale: Locale }) {
  const homeHref = buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.home);

  return (
    <Box
      component="footer"
      sx={{
        pt: { xs: 5, md: 4.5 },
        pb: { xs: 6, md: 8 },
        borderTop: '1px solid',
        borderColor: '#1f2937',
        bgcolor: '#090d16',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: pageMaxWidth,
          mx: 'auto',
          px: pagePx,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'stretch', lg: 'flex-start' },
          justifyContent: 'space-between',
          gap: { xs: 4, lg: 7 },
        }}
      >
        <Stack
          spacing={2}
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', lg: 300 },
            flex: { xs: '1 1 auto', lg: '0 0 300px' },
          }}
        >
          <Link
            href={homeHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src="/assets/brandmark.png"
              alt="SirBro"
              sx={{ width: 32, height: 38, display: 'block' }}
            />
            <Box
              component="img"
              src="/assets/typemark.png"
              alt="SirBro"
              sx={{ width: 96, height: 24, display: 'block' }}
            />
          </Link>

          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.875rem',
              lineHeight: 1.45,
            }}
          >
            Football insights, proprietary sports AI analysis, chat and Fan
            Arena competition in one pocket-sized product.
          </Typography>
        </Stack>

        <Box
          sx={{
            flex: { xs: '1 1 0', lg: '0 0 auto' },
            display: { xs: 'grid', lg: 'flex' },
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
            },
            gap: { xs: 2.5, md: 2, lg: 2.25 },
            alignItems: 'flex-start',
          }}
        >
          {footerColumns[locale].map((section) => (
            <Stack
              key={section.title}
              spacing={0.9}
              sx={{
                width: { lg: footerColumnWidth(section.title) },
                flex: { lg: '0 0 auto' },
              }}
            >
              <Typography
                sx={{
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {section.title}
              </Typography>
              {section.items.map((item) => (
                <Typography
                  key={`${section.title}-${item}`}
                  component="span"
                  sx={{
                    color: '#cbd5e1',
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Stack>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
