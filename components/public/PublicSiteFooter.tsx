'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Locale } from '@/lib/i18n/config';
import { buildLocalizedPath } from '@/modules/seo/route-registry';
import { PUBLIC_PAGE_PATHS } from '@/modules/content/public-pages';
import { PUBLIC_HUB_PATHS } from '@/modules/public/scaffold-pages';
import { getClientConfig } from '@/lib/config';

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

type FooterLinkTarget = {
  href: string;
  external?: boolean;
};

function resolveFooterItemHref(locale: Locale, item: string): FooterLinkTarget {
  const homeHref = buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.home);
  const { iosAppStoreUrl, androidPlayUrl } = getClientConfig();

  if (['Home', 'Inicio', 'Início'].includes(item)) {
    return { href: homeHref };
  }

  if (['Download App', 'Descargar App', 'Baixar App'].includes(item)) {
    return { href: `${homeHref}#download` };
  }

  if (['Chat Preview', 'Vista del chat', 'Prévia do chat'].includes(item)) {
    return { href: `${homeHref}#chat-preview` };
  }

  if (['How It Works', 'Cómo funciona', 'Como funciona'].includes(item)) {
    return { href: `${homeHref}#how-it-works` };
  }

  if (
    [
      'Latest Insights',
      'Injury Impact',
      'Match Outlook',
      'Lineup Changes',
      'Tactical Analysis',
      'Últimos insights',
      'Impacto de lesiones',
      'Panorama del partido',
      'Cambios de alineación',
      'Análisis táctico',
      'Impacto de lesão',
      'Panorama da partida',
      'Mudanças na escalação',
      'Análise tática',
    ].includes(item)
  ) {
    return { href: buildLocalizedPath(locale, PUBLIC_HUB_PATHS.insights) };
  }

  if (['Teams', 'Equipos', 'Times'].includes(item)) {
    return { href: buildLocalizedPath(locale, PUBLIC_HUB_PATHS.teams) };
  }

  if (['Players', 'Jugadores', 'Jogadores'].includes(item)) {
    return { href: buildLocalizedPath(locale, PUBLIC_HUB_PATHS.players) };
  }

  if (['Leagues', 'Ligas'].includes(item)) {
    return { href: buildLocalizedPath(locale, PUBLIC_HUB_PATHS.leagues) };
  }

  if (['Topics', 'Temas', 'Tópicos'].includes(item)) {
    return { href: buildLocalizedPath(locale, PUBLIC_HUB_PATHS.topics) };
  }

  if (item === 'Quizzes') {
    return { href: buildLocalizedPath(locale, PUBLIC_HUB_PATHS.quizzes) };
  }

  if (['About SirBro', 'Sobre SirBro', 'Sobre o SirBro'].includes(item)) {
    return { href: buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.about) };
  }

  if (['Methodology', 'Metodología', 'Metodologia'].includes(item)) {
    return { href: buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.methodology) };
  }

  if (item === 'Editorial Policy' || item === 'Política Editorial') {
    return { href: buildLocalizedPath(locale, PUBLIC_PAGE_PATHS['editorial-policy']) };
  }

  if (['AI Transparency', 'Transparencia de IA', 'Transparência de IA'].includes(item)) {
    return { href: buildLocalizedPath(locale, PUBLIC_PAGE_PATHS['ai-transparency']) };
  }

  if (item === 'FAQ') {
    return { href: buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.faq) };
  }

  if (['Contact', 'Contacto', 'Contato'].includes(item)) {
    return { href: buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.contact) };
  }

  if (['Privacy', 'Privacidad', 'Privacidade'].includes(item)) {
    return { href: buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.privacy) };
  }

  if (['Terms', 'Términos', 'Termos'].includes(item)) {
    return { href: buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.terms) };
  }

  if (['Disclaimer', 'Descargo', 'Isenção'].includes(item)) {
    return { href: buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.disclaimer) };
  }

  if (item === 'Cookies') {
    return { href: buildLocalizedPath(locale, PUBLIC_PAGE_PATHS.cookies) };
  }

  if (item === 'App Store') {
    return { href: iosAppStoreUrl, external: true };
  }

  if (item === 'Google Play') {
    return {
      href: androidPlayUrl || `${homeHref}#download`,
      external: Boolean(androidPlayUrl),
    };
  }

  if (item === 'X / Twitter') {
    return { href: 'https://x.com/sirbro', external: true };
  }

  if (item === 'Instagram') {
    return { href: 'https://www.instagram.com/sirbro/', external: true };
  }

  if (item === 'TikTok') {
    return { href: 'https://www.tiktok.com/@sirbro', external: true };
  }

  return { href: homeHref };
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
              {section.items.map((item) => {
                const target = resolveFooterItemHref(locale, item);
                const label = (
                  <Typography
                    component="span"
                    sx={{
                      color: '#cbd5e1',
                      fontSize: '0.875rem',
                      lineHeight: 1.7,
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item}
                  </Typography>
                );

                if (target.external) {
                  return (
                    <Box
                      key={`${section.title}-${item}`}
                      component="a"
                      href={target.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'inline-flex',
                        width: 'fit-content',
                        textDecoration: 'none',
                        '&:hover span': {
                          color: '#f8fafc',
                        },
                      }}
                    >
                      {label}
                    </Box>
                  );
                }

                return (
                  <Link
                    key={`${section.title}-${item}`}
                    href={target.href}
                    style={{
                      display: 'inline-flex',
                      width: 'fit-content',
                      textDecoration: 'none',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        '&:hover span': {
                          color: '#f8fafc',
                        },
                      }}
                    >
                      {label}
                    </Box>
                  </Link>
                );
              })}
            </Stack>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
