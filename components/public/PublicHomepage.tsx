'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import GlobalStyles from '@mui/material/GlobalStyles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { alpha } from '@mui/material/styles';
import { getClientConfig } from '@/lib/config';
import type { Locale } from '@/lib/i18n/config';
import { PUBLIC_PAGE_PATHS } from '@/modules/content/public-pages';
import {
  getHomepageContent,
  type HomepageFeaturePreview,
} from '@/modules/public/homepage-content';
import { PUBLIC_HUB_PATHS } from '@/modules/public/scaffold-pages';
import { buildLocalizedPath } from '@/modules/seo/route-registry';

const pagePx = { xs: 3, sm: 4, md: 6, lg: 10 };
const sectionGapY = { xs: 5, md: 7 };
const pageMaxWidth = 1440;

const headerLabels = {
  en: {
    home: 'Home',
    insights: 'Insights',
    explore: 'Explore',
    quizzes: 'Quizzes',
    about: 'About',
    download: 'Download App',
  },
  es: {
    home: 'Inicio',
    insights: 'Insights',
    explore: 'Explorar',
    quizzes: 'Quizzes',
    about: 'Sobre',
    download: 'Descargar App',
  },
  pt: {
    home: 'Início',
    insights: 'Insights',
    explore: 'Explorar',
    quizzes: 'Quizzes',
    about: 'Sobre',
    download: 'Baixar App',
  },
} as const;

const trustLinkLabels = {
  en: ['About SirBro', 'Methodology', 'Editorial Policy', 'AI Transparency', 'FAQ', 'Contact'],
  es: ['Sobre SirBro', 'Metodología', 'Política Editorial', 'Transparencia de IA', 'FAQ', 'Contacto'],
  pt: ['Sobre o SirBro', 'Metodologia', 'Política Editorial', 'Transparência de IA', 'FAQ', 'Contato'],
} as const;

const heroStoryCardCopy = {
  en: 'Live match updates, summarized in seconds.',
  es: 'Actualizaciones del partido en vivo, resumidas en segundos.',
  pt: 'Atualizações da partida ao vivo, resumidas em segundos.',
} as const;

const heroPanelChipLabel = {
  en: 'Proprietary Sports AI Model',
  es: 'Modelo deportivo propietario',
  pt: 'Modelo esportivo proprietário',
} as const;

const trustContactRowLabel = {
  en: 'Contact  ·  Business, support and media inquiries',
  es: 'Contacto  ·  Negocios, soporte y consultas de medios',
  pt: 'Contato  ·  Negócios, suporte e contatos de mídia',
} as const;

const footerColumns = {
  en: [
    {
      title: 'Product',
      items: ['Home', 'Download App', 'Chat Preview', 'How It Works'],
    },
    {
      title: 'Insights',
      items: ['Latest Insights', 'Injury Impact', 'Match Outlook', 'Lineup Changes', 'Tactical Analysis'],
    },
    {
      title: 'Explore',
      items: ['Teams', 'Players', 'Leagues', 'Topics', 'Quizzes'],
    },
    {
      title: 'Trust',
      items: ['About SirBro', 'Methodology', 'Editorial Policy', 'AI Transparency', 'FAQ', 'Contact'],
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
      items: ['Últimos insights', 'Impacto de lesiones', 'Panorama del partido', 'Cambios de alineación', 'Análisis táctico'],
    },
    {
      title: 'Explorar',
      items: ['Equipos', 'Jugadores', 'Ligas', 'Temas', 'Quizzes'],
    },
    {
      title: 'Confianza',
      items: ['Sobre SirBro', 'Metodología', 'Política Editorial', 'Transparencia de IA', 'FAQ', 'Contacto'],
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
      items: ['Últimos insights', 'Impacto de lesão', 'Panorama da partida', 'Mudanças na escalação', 'Análise tática'],
    },
    {
      title: 'Explorar',
      items: ['Times', 'Jogadores', 'Ligas', 'Tópicos', 'Quizzes'],
    },
    {
      title: 'Confiança',
      items: ['Sobre o SirBro', 'Metodologia', 'Política Editorial', 'Transparência de IA', 'FAQ', 'Contato'],
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
} as const;

const seoSummaryCards = {
  en: [
    {
      eyebrow: 'Team page',
      title: 'Real Madrid',
      description:
        'Latest form, likely edges and the next big talking points around the club.',
    },
    {
      eyebrow: 'Player page',
      title: 'Kylian Mbappe',
      description:
        'Form, role and matchup context around one of the players shaping the game.',
    },
    {
      eyebrow: 'League page',
      title: 'Premier League',
      description:
        'Standings, top scorers and the storylines setting the pace this week.',
    },
  ],
  es: [
    {
      eyebrow: 'Página de equipo',
      title: 'Real Madrid',
      description:
        'Forma reciente, ventajas probables y los siguientes temas fuertes alrededor del club.',
    },
    {
      eyebrow: 'Página de jugador',
      title: 'Kylian Mbappe',
      description:
        'Forma, rol y contexto del duelo alrededor de uno de los jugadores que marcan el partido.',
    },
    {
      eyebrow: 'Página de liga',
      title: 'Premier League',
      description:
        'Clasificación, goleadores y las historias que marcan el ritmo esta semana.',
    },
  ],
  pt: [
    {
      eyebrow: 'Página de time',
      title: 'Real Madrid',
      description:
        'Forma recente, vantagens prováveis e os próximos grandes assuntos ao redor do clube.',
    },
    {
      eyebrow: 'Página de jogador',
      title: 'Kylian Mbappe',
      description:
        'Forma, papel e contexto de duelo em torno de um dos jogadores que mais moldam o jogo.',
    },
    {
      eyebrow: 'Página de liga',
      title: 'Premier League',
      description:
        'Tabela, artilheiros e as histórias que estão ditando o ritmo nesta semana.',
    },
  ],
} as const;

const discoverySectionCopy = {
  en: {
    title: 'Discover more from SirBro',
    description:
      'Explore featured insight, try a football quiz and jump into pages for teams, players and leagues without losing the fast app-first feel.',
    featured: {
      title: 'Why Real Madrid look more dangerous when Bellingham starts higher between the lines.',
      description: 'Real Madrid · Jude Bellingham · Tactical analysis · Lineup changes',
      tag: 'This week’s read',
    },
    quiz: {
      title: 'What kind of football thinker are you?',
      description:
        'Take a quick football quiz, compare your instincts and keep exploring SirBro beyond the first scroll.',
      cta: 'Start Quiz',
    },
    engine: {
      title: 'Explore teams, players and leagues',
      leagues: 'EPL · La Liga · Serie A · Ligue 1 · Brasileirao · Liga MX · MLS',
      metrics: 'Standings · Top scorers · Assists',
      rail: 'Popular now: Real Madrid · Manchester City · Kylian Mbappe · Lamine Yamal',
      note: 'Follow the names, then go deeper into the pages behind them.',
    },
  },
  es: {
    title: 'Descubre más de SirBro',
    description:
      'Explora un insight destacado, prueba un quiz de fútbol y entra en páginas de equipos, jugadores y ligas sin perder la sensación rápida y app-first.',
    featured: {
      title:
        'Por qué el Real Madrid parece más peligroso cuando Bellingham arranca más arriba entre líneas.',
      description: 'Real Madrid · Jude Bellingham · Análisis táctico · Cambios de alineación',
      tag: 'La lectura de la semana',
    },
    quiz: {
      title: '¿Qué tipo de pensador de fútbol eres?',
      description:
        'Haz un quiz rápido de fútbol, compara tu instinto y sigue explorando SirBro más allá del primer scroll.',
      cta: 'Empezar quiz',
    },
    engine: {
      title: 'Explora equipos, jugadores y ligas',
      leagues: 'EPL · La Liga · Serie A · Ligue 1 · Brasileirao · Liga MX · MLS',
      metrics: 'Clasificación · Goleadores · Asistencias',
      rail: 'Popular ahora: Real Madrid · Manchester City · Kylian Mbappe · Lamine Yamal',
      note: 'Sigue los nombres y luego entra en las páginas que hay detrás.',
    },
  },
  pt: {
    title: 'Descubra mais do SirBro',
    description:
      'Explore um insight em destaque, faça um quiz de futebol e entre nas páginas de times, jogadores e ligas sem perder a sensação rápida e app-first.',
    featured: {
      title:
        'Por que o Real Madrid parece mais perigoso quando Bellingham começa mais alto entrelinhas.',
      description: 'Real Madrid · Jude Bellingham · Análise tática · Mudanças na escalação',
      tag: 'A leitura da semana',
    },
    quiz: {
      title: 'Que tipo de pensador de futebol é você?',
      description:
        'Faça um quiz rápido de futebol, compare seu instinto e continue explorando o SirBro além da primeira rolagem.',
      cta: 'Começar quiz',
    },
    engine: {
      title: 'Explore times, jogadores e ligas',
      leagues: 'EPL · La Liga · Serie A · Ligue 1 · Brasileirao · Liga MX · MLS',
      metrics: 'Classificação · Artilheiros · Assistências',
      rail: 'Em alta agora: Real Madrid · Manchester City · Kylian Mbappe · Lamine Yamal',
      note: 'Siga os nomes e depois entre nas páginas por trás deles.',
    },
  },
} as const;

const copySafeSx = {
  minWidth: 0,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
};

const motionRevealSx = (delay = 0) => ({
  opacity: 0,
  animation: 'sbReveal 0.72s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  animationDelay: `${delay}ms`,
});

const panelSx = {
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: alpha('#334155', 0.92),
  boxShadow: `0 18px 48px ${alpha('#020617', 0.42)}`,
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)',
};

function SeoCardVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, rgba(15,23,42,0.5) 100%)',
          border: '1px solid',
          borderColor: alpha('#f8e7b0', 0.28),
          boxShadow: `0 10px 24px ${alpha('#020617', 0.24)}`,
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src="/assets/homepage/seo-cards/real-madrid-logo.png"
          alt="Real Madrid crest"
          sx={{
            width: 42,
            height: 42,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Box>
    );
  }

  if (index === 1) {
    return (
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 32% 28%, rgba(95,75,57,0.35) 0%, rgba(19,23,34,0.96) 100%)',
          border: '1px solid',
          borderColor: alpha('#64748b', 0.4),
          boxShadow: `0 10px 24px ${alpha('#020617', 0.26)}`,
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src="/assets/homepage/seo-cards/mbappe.jpg"
          alt="Kylian Mbappe"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: 2.25,
        display: 'grid',
        placeItems: 'center',
        background:
          'linear-gradient(180deg, rgba(95,111,255,0.22) 0%, rgba(36,50,101,0.32) 100%)',
        border: '1px solid',
        borderColor: alpha('#7c8cff', 0.34),
        boxShadow: `0 10px 24px ${alpha('#020617', 0.24)}`,
      }}
    >
      <Box
        component="img"
        src="/assets/homepage/seo-cards/premier-league.svg"
        alt="Premier League logo"
        sx={{
          width: 34,
          height: 34,
          objectFit: 'contain',
          display: 'block',
          filter: 'brightness(1.15)',
        }}
      />
    </Box>
  );
}

function LandingLocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const languages = [
    { code: 'en' as const, label: 'EN' },
    { code: 'es' as const, label: 'ES' },
    { code: 'pt' as const, label: 'PT' },
  ];

  return (
    <Box
      sx={{
        ...panelSx,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        borderRadius: '999px',
        px: 1.75,
        py: 1.1,
        bgcolor: alpha('#0f172a', 0.56),
      }}
    >
      {languages.map((lang, index) => (
        <Box
          key={lang.code}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Button
            onClick={() => {
              const segments = pathname.split('/');
              segments[1] = lang.code;
              router.push(segments.join('/'));
            }}
            sx={{
              minWidth: 'auto',
              p: 0,
              borderRadius: 0,
              color: currentLocale === lang.code ? '#f8fafc' : '#cbd5e1',
              fontSize: '0.75rem',
              fontWeight: currentLocale === lang.code ? 700 : 600,
              lineHeight: 1,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#ffffff',
              },
            }}
          >
            {lang.label}
          </Button>
          {index < languages.length - 1 ? (
            <Typography sx={{ color: alpha('#64748b', 0.95), fontSize: '0.75rem' }}>
              |
            </Typography>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}

function StoreBadgeLink({
  href,
  src,
  alt,
  width,
  pulse = false,
}: {
  href?: string;
  src: string;
  alt: string;
  width: number;
  pulse?: boolean;
}) {
  if (!href) {
    return null;
  }

  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={pulse ? 'sb-pulse' : undefined}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        transition: 'transform 220ms ease, filter 220ms ease',
        '&:hover': {
          transform: 'translateY(-2px) scale(1.02)',
          filter: 'brightness(1.06)',
        },
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: { xs: width - 8, sm: width },
          height: 'auto',
          display: 'block',
        }}
      />
    </Box>
  );
}

function SectionHeading({
  title,
  description,
  maxWidth = 760,
}: {
  title: string;
  description: string;
  maxWidth?: number;
}) {
  return (
    <Stack spacing={1.25} sx={{ maxWidth }}>
      <Typography
        sx={{
          ...copySafeSx,
          color: '#f8fafc',
          fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
          fontSize: { xs: '2rem', md: '2.35rem' },
          fontWeight: 600,
          lineHeight: 1.12,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          ...copySafeSx,
          color: '#94a3b8',
          fontSize: { xs: '0.98rem', md: '1rem' },
          lineHeight: 1.58,
        }}
      >
        {description}
      </Typography>
    </Stack>
  );
}

function ProductCard({
  item,
  imageSrc,
  accentColor,
}: {
  item: HomepageFeaturePreview;
  imageSrc: string;
  accentColor: string;
}) {
  return (
    <Box
      sx={{
        ...panelSx,
        borderRadius: 3.5,
        bgcolor: alpha('#111827', 0.58),
        p: 2.75,
        flex: '1 1 0',
        minWidth: { xs: '100%', md: 0 },
        transition: 'transform 260ms ease, border-color 260ms ease, box-shadow 260ms ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: alpha(accentColor, 0.54),
          boxShadow: `0 26px 56px ${alpha(accentColor, 0.16)}`,
        },
      }}
    >
      <Stack spacing={2.25}>
        <Box
          sx={{
            ...panelSx,
            borderRadius: 3,
            height: 300,
            bgcolor: alpha('#0b1220', 0.42),
          }}
        >
          <Box
            component="img"
            src={imageSrc}
            alt={item.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Box>

        <Stack spacing={1}>
          <Typography
            sx={{
              ...copySafeSx,
              color: '#f1f5f9',
              fontSize: '1.375rem',
              fontWeight: 600,
            }}
          >
            {item.title}
          </Typography>
          <Typography
            sx={{
              ...copySafeSx,
              color: '#94a3b8',
              fontSize: '0.9rem',
              lineHeight: 1.55,
            }}
          >
            {item.description}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

export function PublicHomepage({ locale }: { locale: Locale }) {
  const content = getHomepageContent(locale);
  const clientConfig = getClientConfig();
  const labels = headerLabels[locale];
  const discoveryCopy = discoverySectionCopy[locale];

  const [expandedFaq, setExpandedFaq] = useState<string | false>(
    content.faq.items[0]?.question ?? false
  );
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const aboutMenuRef = useRef<HTMLDivElement | null>(null);

  const localize = (path: string) => buildLocalizedPath(locale, path);
  const homeHref = localize(PUBLIC_PAGE_PATHS.home);

  const headerNavigation = [
    { label: labels.home, href: homeHref },
    { label: labels.insights, href: localize(PUBLIC_HUB_PATHS.insights) },
    { label: labels.explore, href: localize(PUBLIC_HUB_PATHS.topics) },
    { label: labels.quizzes, href: localize(PUBLIC_HUB_PATHS.quizzes) },
    { label: labels.about, href: localize(PUBLIC_PAGE_PATHS.about) },
  ];

  const aboutMenuLinks = [
    localize(PUBLIC_PAGE_PATHS.about),
    localize(PUBLIC_PAGE_PATHS.methodology),
    localize(PUBLIC_PAGE_PATHS['editorial-policy']),
    localize(PUBLIC_PAGE_PATHS['ai-transparency']),
    localize(PUBLIC_PAGE_PATHS.faq),
    localize(PUBLIC_PAGE_PATHS.contact),
  ];

  useEffect(() => {
    setExpandedFaq(content.faq.items[0]?.question ?? false);
    setIsAboutMenuOpen(false);
  }, [content.faq.items, locale]);

  useEffect(() => {
    if (!isAboutMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!aboutMenuRef.current?.contains(event.target as Node)) {
        setIsAboutMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAboutMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAboutMenuOpen]);

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes sbReveal': {
            '0%': { opacity: 0, transform: 'translateY(28px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
          '@keyframes sbFloatA': {
            '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
            '50%': { transform: 'translate3d(0, -12px, 0)' },
          },
          '@keyframes sbFloatATilted': {
            '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(8deg)' },
            '50%': { transform: 'translate3d(0, -12px, 0) rotate(8deg)' },
          },
          '@keyframes sbFloatB': {
            '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(-4deg)' },
            '50%': { transform: 'translate3d(0, 10px, 0) rotate(-2deg)' },
          },
          '@keyframes sbPulse': {
            '0%, 100%': {
              boxShadow: `0 0 0 0 ${alpha('#8b5cf6', 0.18)}`,
            },
            '50%': {
              boxShadow: `0 0 0 14px ${alpha('#8b5cf6', 0)}`,
            },
          },
          '@keyframes sbBeamShift': {
            '0%, 100%': {
              opacity: 0.24,
              transform: 'translate3d(0, 0, 0) rotate(-11deg)',
            },
            '50%': {
              opacity: 0.44,
              transform: 'translate3d(10px, -18px, 0) rotate(-8deg)',
            },
          },
          '.sb-reveal': {
            opacity: 0,
            animation: 'sbReveal 0.72s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          },
          '.sb-float-a': {
            animation: 'sbFloatA 7s ease-in-out infinite',
          },
          '.sb-float-a-tilted': {
            animation: 'sbFloatATilted 7s ease-in-out infinite',
          },
          '.sb-float-b': {
            animation: 'sbFloatB 8.5s ease-in-out infinite',
          },
          '.sb-pulse': {
            animation: 'sbPulse 3.6s ease-in-out infinite',
          },
          '.sb-beam': {
            animation: 'sbBeamShift 8s ease-in-out infinite',
          },
        }}
      />

      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          background:
            'linear-gradient(90deg, #0b2d45 0%, #0a1730 34%, #07091d 68%, #140c2f 100%)',
          color: '#f8fafc',
          overflowX: 'clip',
        }}
      >
        <Box
          component="header"
          sx={{
            ...motionRevealSx(0),
            position: 'sticky',
            top: 0,
            zIndex: 30,
            borderBottom: '1px solid',
            borderColor: alpha('#20293a', 0.38),
            bgcolor: alpha('#090d16', 0.4),
            backdropFilter: 'blur(18px)',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: pageMaxWidth,
              mx: 'auto',
              px: pagePx,
              py: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
            }}
          >
            <Stack direction="row" spacing={4.5} alignItems="center" sx={{ minWidth: 0 }}>
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

              <Stack
                direction="row"
                spacing={3.5}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                {headerNavigation.map((item, index) => {
                  const isAboutItem = index === headerNavigation.length - 1;

                  if (isAboutItem) {
                    return (
                      <Box
                        key={item.href}
                        ref={aboutMenuRef}
                        sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                      >
                        <Button
                          onClick={() => setIsAboutMenuOpen((current) => !current)}
                          aria-expanded={isAboutMenuOpen}
                          aria-haspopup="menu"
                          sx={{
                            minWidth: 'auto',
                            p: 0,
                            color: '#f8fafc',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            transition: 'color 180ms ease',
                            '&:hover': {
                              bgcolor: 'transparent',
                              color: '#ffffff',
                            },
                          }}
                        >
                          {item.label}
                        </Button>

                        {isAboutMenuOpen ? (
                          <Box
                            sx={{
                              ...panelSx,
                              position: 'absolute',
                              top: 'calc(100% + 16px)',
                              left: -18,
                              width: 224,
                              borderRadius: 2.5,
                              bgcolor: alpha('#0f172a', 0.72),
                              px: 2.25,
                              py: 1.75,
                              zIndex: 40,
                            }}
                          >
                            <Stack spacing={0.8} role="menu" aria-label={labels.about}>
                              {trustLinkLabels[locale].map((label, menuIndex) => (
                                <Typography
                                  key={label}
                                  component={Link}
                                  href={aboutMenuLinks[menuIndex]}
                                  onClick={() => setIsAboutMenuOpen(false)}
                                  sx={{
                                    color: '#e2e8f0',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    lineHeight: 1.75,
                                    textDecoration: 'none',
                                    '&:hover': { color: '#ffffff' },
                                  }}
                                >
                                  {label}
                                </Typography>
                              ))}
                            </Stack>
                          </Box>
                        ) : null}
                      </Box>
                    );
                  }

                  return (
                    <Typography
                      key={item.href}
                      component={Link}
                      href={item.href}
                      sx={{
                        color: index === 0 ? '#f8fafc' : '#94a3b8',
                        fontSize: '0.875rem',
                        fontWeight: index === 0 ? 600 : 500,
                        textDecoration: 'none',
                        transition: 'color 180ms ease',
                        '&:hover': { color: '#ffffff' },
                      }}
                    >
                      {item.label}
                    </Typography>
                  );
                })}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1.75} alignItems="center">
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <LandingLocaleSwitcher currentLocale={locale} />
              </Box>
              <Button
                component="a"
                href="#download"
                sx={{
                  minWidth: 'auto',
                  borderRadius: '999px',
                  px: 2,
                  py: 1.35,
                  bgcolor: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#5b54ff',
                    boxShadow: 'none',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {labels.download}
              </Button>
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: pageMaxWidth,
            mx: 'auto',
            px: pagePx,
            py: { xs: 6, md: 7 },
            display: 'flex',
            flexDirection: 'column',
            gap: sectionGapY,
          }}
        >
          <Box
            component="section"
            sx={{
              ...motionRevealSx(120),
              position: 'relative',
              minHeight: { xs: 'auto', lg: 760 },
              borderRadius: 0,
              py: { xs: 2, md: 0 },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <Box
                className="sb-float-a"
                sx={{
                  position: 'absolute',
                  top: { xs: 80, md: 40 },
                  right: { xs: -40, md: 40 },
                  width: { xs: 260, md: 420 },
                  height: { xs: 260, md: 420 },
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(99,102,242,0.36) 0%, rgba(99,102,242,0) 72%)',
                  filter: 'blur(10px)',
                }}
              />
              <Box
                className="sb-float-b"
                sx={{
                  position: 'absolute',
                  top: { xs: 180, md: 250 },
                  right: { xs: 0, md: 120 },
                  width: { xs: 180, md: 240 },
                  height: { xs: 180, md: 240 },
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0) 72%)',
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: { xs: 4, lg: 4.5 },
                width: '100%',
                alignItems: { xs: 'center', lg: 'flex-start' },
                justifyContent: { lg: 'space-between' },
              }}
            >
              <Box sx={{ width: '100%', maxWidth: { lg: 620 }, position: 'relative', zIndex: 1 }}>
                <Stack spacing={2.75} sx={{ pt: { xs: 0, md: 2, lg: 3 } }}>
                  <Typography
                    sx={{
                      ...copySafeSx,
                      maxWidth: 620,
                      fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                      fontSize: { xs: '2.6rem', sm: '3.4rem', lg: '4.5rem' },
                      fontWeight: 700,
                      lineHeight: { xs: 0.98, lg: 0.96 },
                      letterSpacing: '-0.05em',
                      color: '#f8fafc',
                      ...motionRevealSx(180),
                    }}
                  >
                    {content.hero.title}
                  </Typography>

                  <Typography
                    sx={{
                      ...copySafeSx,
                      maxWidth: 560,
                      color: '#94a3b8',
                      fontSize: { xs: '1rem', md: '1.1875rem' },
                      lineHeight: 1.45,
                      ...motionRevealSx(260),
                    }}
                  >
                    {content.hero.description}
                  </Typography>

                  <Stack
                    id="download"
                    direction="row"
                    spacing={1.5}
                    sx={{
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      ...motionRevealSx(320),
                    }}
                  >
                    <StoreBadgeLink
                      href={clientConfig.iosAppStoreUrl}
                      src="/assets/appstore-badge.svg"
                      alt="App Store"
                      width={124}
                      pulse
                    />
                    <StoreBadgeLink
                      href={clientConfig.androidPlayUrl}
                      src="/assets/playstore-badge.svg"
                      alt="Google Play"
                      width={124}
                    />
                  </Stack>

                  <Box
                    sx={{
                      ...panelSx,
                      maxWidth: 560,
                      borderRadius: '999px',
                      bgcolor: alpha('#0b1220', 0.58),
                      px: 2,
                      py: 1.35,
                      ...motionRevealSx(380),
                    }}
                  >
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#cbd5e1',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      {trustLinkLabels[locale].join('  ·  ')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: { xs: 640, lg: 540 },
                  ml: { lg: 'auto' },
                  minHeight: { xs: 520, lg: 592 },
                  ...motionRevealSx(260),
                }}
              >
                <Box
                  className="sb-beam"
                  sx={{
                    position: 'absolute',
                    top: { xs: 0, lg: 38 },
                    left: { xs: 30, lg: -20 },
                    width: 250,
                    height: { xs: 480, lg: 560 },
                    borderRadius: '999px',
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(165,180,252,0.4) 52%, rgba(255,255,255,0) 100%)',
                    opacity: 0.36,
                    pointerEvents: 'none',
                    filter: 'blur(0px)',
                  }}
                />

                <Box
                  sx={{
                    ...panelSx,
                    position: 'relative',
                    borderRadius: 4.5,
                    width: '100%',
                    minHeight: { xs: 520, lg: 592 },
                    background:
                      'linear-gradient(180deg, rgba(15,23,42,0.56) 0%, rgba(17,24,39,0.68) 100%)',
                    borderColor: alpha('#475569', 0.72),
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: { xs: -42, lg: -26 },
                      bottom: { xs: 44, lg: 32 },
                      width: { xs: 180, lg: 202 },
                      height: { xs: 330, lg: 372 },
                      borderRadius: '999px',
                      bgcolor: alpha('#0b1220', 0.42),
                      filter: 'blur(2px)',
                      pointerEvents: 'none',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      left: { xs: 16, lg: 62 },
                      bottom: { xs: 10, lg: -12 },
                      width: { xs: 132, lg: 148 },
                      height: { xs: 224, lg: 236 },
                      borderRadius: '999px',
                      bgcolor: alpha('#111827', 0.38),
                      pointerEvents: 'none',
                    }}
                  />

                  <Chip
                    label={heroPanelChipLabel[locale]}
                    sx={{
                      position: 'absolute',
                      top: 26,
                      left: 28,
                      zIndex: 2,
                      maxWidth: 220,
                      color: '#cbd5e1',
                      bgcolor: '#0b1220',
                      border: '1px solid',
                      borderColor: alpha('#334155', 0.96),
                      '& .MuiChip-label': {
                        px: 1.5,
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      },
                    }}
                  />

                  <Box
                    sx={{
                      ...panelSx,
                      position: 'absolute',
                      top: { xs: 86, lg: 78 },
                      left: { xs: '50%', lg: 142 },
                      transform: { xs: 'translateX(-50%)', lg: 'none' },
                      width: { xs: 250, lg: 262 },
                      height: { xs: 474, lg: 494 },
                      borderRadius: 3.5,
                      bgcolor: alpha('#0d1017', 0.44),
                      overflow: 'hidden',
                      borderColor: alpha('#475569', 0.36),
                    }}
                  >
                    <Box
                      component="img"
                      src="/assets/homepage/hero-app-shot.jpg"
                      alt="SirBro app screenshot"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </Box>

                  <Box
                    className="sb-float-a-tilted"
                    sx={{
                      ...panelSx,
                      position: 'absolute',
                      top: { xs: 170, lg: 176 },
                      right: { xs: 10, lg: 14 },
                      width: { xs: 152, lg: 158 },
                      borderRadius: 2.25,
                      bgcolor: alpha('#ecfdf3', 0.72),
                      color: '#111827',
                      px: 1.75,
                      py: 1.5,
                      boxShadow: `0 12px 28px ${alpha('#0f172a', 0.24)}`,
                    }}
                  >
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#1d4ed8',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        lineHeight: 1.35,
                      }}
                    >
                      Momentum swing
                      <br />
                      63% pressure after 55&apos;
                    </Typography>
                  </Box>

                  <Box
                    className="sb-float-b"
                    sx={{
                      ...panelSx,
                      position: 'absolute',
                      left: { xs: 10, lg: 22 },
                      bottom: { xs: 132, lg: 106 },
                      width: { xs: 208, lg: 220 },
                      borderRadius: 2.5,
                      px: 1.75,
                      py: 1.5,
                      background:
                        'linear-gradient(180deg, rgba(109,40,217,0.76) 0%, rgba(76,29,149,0.72) 52%, rgba(36,18,74,0.68) 100%)',
                      transform: 'rotate(-7deg)',
                      boxShadow: `0 14px 28px ${alpha('#4c1d95', 0.34)}`,
                    }}
                  >
                    <Stack spacing={0.75}>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: '#ffffff',
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          lineHeight: 1.3,
                        }}
                      >
                        {content.hero.chatPrompt}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                <Box
                  sx={{
                    ...panelSx,
                    position: 'absolute',
                    top: { xs: 34, lg: 32 },
                    right: { xs: 10, lg: 22 },
                    width: { xs: 208, lg: 212 },
                    borderRadius: 2.5,
                    background:
                      'linear-gradient(180deg, rgba(58,36,97,0.72) 0%, rgba(38,25,61,0.68) 100%)',
                    borderColor: alpha('#8b5cf6', 0.56),
                    px: 1.75,
                    py: 1.5,
                    zIndex: 2,
                    boxShadow: `0 12px 28px ${alpha('#4c1d95', 0.28)}`,
                  }}
                >
                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: '#e2e8f0',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      lineHeight: 1.35,
                    }}
                  >
                    {heroStoryCardCopy[locale]}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            component="section"
            sx={{
              ...motionRevealSx(180),
              py: { xs: 1, md: 0 },
            }}
          >
            <Stack spacing={3}>
              <SectionHeading
                title="See the match board. Ask the analyst. Follow the game state live."
                description="SirBro turns football noise into a real mobile product: a fast matches overview, actionable AI chat and a live timeline that keeps context visible."
                maxWidth={pageMaxWidth}
              />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2.5,
                }}
              >
                <ProductCard
                  item={content.showcase.items[0]}
                  imageSrc="/assets/homepage/showcase-feed.jpg"
                  accentColor="#334155"
                />
                <ProductCard
                  item={content.showcase.items[1]}
                  imageSrc="/assets/homepage/showcase-chat.jpg"
                  accentColor="#6366f2"
                />
                <ProductCard
                  item={content.showcase.items[2]}
                  imageSrc="/assets/homepage/showcase-timeline.jpg"
                  accentColor="#2e5a53"
                />
              </Box>
            </Stack>
          </Box>

          <Box
            id="how-it-works"
            component="section"
            sx={{
              ...motionRevealSx(220),
              py: { xs: 1, md: 0 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: { xs: 3, lg: 5 },
                alignItems: 'stretch',
              }}
            >
              <Stack spacing={2.5} sx={{ width: '100%', maxWidth: { lg: 640 } }}>
                <SectionHeading
                  title="How SirBro helps you read the match faster."
                  description={content.methodology.description}
                />

                {content.methodology.steps.map((step) => (
                  <Box
                    key={step.step}
                    sx={{
                      ...panelSx,
                      borderRadius: 3,
                      bgcolor: alpha('#111827', 0.56),
                      px: 2.5,
                      py: 2.25,
                      transition: 'transform 220ms ease, border-color 220ms ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: alpha('#6366f2', 0.5),
                      },
                    }}
                  >
                    <Stack spacing={1.2}>
                      <Typography
                        sx={{
                          color: '#a5b4fc',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                        }}
                      >
                        {step.step}
                      </Typography>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: '#f1f5f9',
                          fontSize: '1.25rem',
                          fontWeight: 600,
                        }}
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: '#94a3b8',
                          fontSize: '0.9375rem',
                          lineHeight: 1.55,
                        }}
                      >
                        {step.description}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Box
                sx={{
                  ...panelSx,
                  borderRadius: 3.5,
                  bgcolor: alpha('#0f172a', 0.56),
                  px: { xs: 2.5, md: 3.5 },
                  py: { xs: 2.5, md: 3.5 },
                  flex: '1 1 0',
                }}
              >
                <Stack spacing={2.5}>
                  <Stack spacing={1.1}>
                    <Typography
                      sx={{
                        color: '#f8fafc',
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        lineHeight: 1.18,
                      }}
                    >
                      Why SirBro is credible
                    </Typography>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#94a3b8',
                        fontSize: '0.9375rem',
                        lineHeight: 1.6,
                      }}
                    >
                      See how our analysis works, how content is reviewed and where AI
                      helps turn live football data into clear decisions.
                    </Typography>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#d1d5db',
                        fontSize: '0.9375rem',
                        lineHeight: 1.65,
                      }}
                    >
                      {content.methodology.requiredCopy}
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      gap: 1.5,
                    }}
                  >
                    {content.methodology.trustItems.map((item) => (
                      <Box
                        key={item.title}
                        component={Link}
                        href={localize(item.href)}
                        sx={{
                          ...panelSx,
                          display: 'block',
                          borderRadius: 2.5,
                          bgcolor: alpha('#0b1220', 0.54),
                          px: 2,
                          py: 1.9,
                          textDecoration: 'none',
                          transition: 'transform 220ms ease, border-color 220ms ease',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            borderColor: alpha('#6366f2', 0.5),
                          },
                        }}
                      >
                        <Stack spacing={0.75}>
                          <Typography
                            sx={{
                              ...copySafeSx,
                              color: '#f8fafc',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            sx={{
                              ...copySafeSx,
                              color: '#94a3b8',
                              fontSize: '0.75rem',
                              lineHeight: 1.5,
                            }}
                          >
                            {item.description}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Box>

                    <Box
                      component={Link}
                      href={localize(PUBLIC_PAGE_PATHS.contact)}
                    sx={{
                      ...panelSx,
                      display: 'block',
                      borderRadius: 2.25,
                      bgcolor: alpha('#111827', 0.56),
                      px: 2,
                      py: 1.75,
                      color: '#e2e8f0',
                      textDecoration: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                    }}
                    >
                      {trustContactRowLabel[locale]}
                    </Box>
                </Stack>
              </Box>
            </Box>
          </Box>

          <Box
            component="section"
            sx={{
              ...motionRevealSx(260),
              py: { xs: 1, md: 0 },
            }}
          >
            <Stack spacing={3} sx={{ width: '100%' }}>
              <SectionHeading
                title={discoveryCopy.title}
                description={discoveryCopy.description}
                maxWidth={980}
              />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', lg: 'row' },
                  gap: 2.5,
                  alignItems: 'stretch',
                }}
              >
                <Box
                  component={Link}
                  href={localize(content.discovery.featuredInsight.href)}
                  sx={{
                    ...panelSx,
                    display: 'block',
                    flex: '1 1 auto',
                    borderRadius: 3.5,
                    bgcolor: alpha('#111827', 0.56),
                    px: 3.25,
                    py: 3.25,
                    textDecoration: 'none',
                    transition: 'transform 240ms ease, border-color 240ms ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: alpha('#6366f2', 0.56),
                    },
                  }}
                >
                  <Stack spacing={2}>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#f8fafc',
                        fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                        fontSize: { xs: '1.35rem', md: '1.5rem' },
                        fontWeight: 600,
                        lineHeight: 1.24,
                        maxWidth: 620,
                      }}
                    >
                      {discoveryCopy.featured.title}
                    </Typography>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#94a3b8',
                        fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {discoveryCopy.featured.description}
                    </Typography>
                    <Box
                      sx={{
                        alignSelf: 'flex-start',
                        borderRadius: '999px',
                        bgcolor: '#1e293b',
                        border: '1px solid',
                        borderColor: '#475569',
                        px: 1.25,
                        py: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#c7d2fe',
                          fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          lineHeight: 1,
                        }}
                      >
                        {discoveryCopy.featured.tag}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box
                  component={Link}
                  href={localize(content.discovery.quiz.href)}
                  sx={{
                    ...panelSx,
                    display: 'block',
                    width: { xs: '100%', lg: 360 },
                    flexShrink: 0,
                    borderRadius: 3.5,
                    px: 3,
                    py: 3,
                    background:
                      'linear-gradient(180deg, rgba(26,26,51,0.74) 0%, rgba(34,34,74,0.68) 100%)',
                    borderColor: '#4f4a7a',
                    textDecoration: 'none',
                    transition: 'transform 240ms ease, border-color 240ms ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: alpha('#8b5cf6', 0.56),
                    },
                  }}
                >
                  <Stack spacing={2} sx={{ minHeight: '100%' }}>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#f8fafc',
                        fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                        fontSize: { xs: '1.25rem', md: '1.375rem' },
                        fontWeight: 600,
                        lineHeight: 1.24,
                        maxWidth: 260,
                      }}
                    >
                      {discoveryCopy.quiz.title}
                    </Typography>
                    <Typography
                      sx={{
                        ...copySafeSx,
                        color: '#cbd5e1',
                        fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        maxWidth: 280,
                      }}
                    >
                      {discoveryCopy.quiz.description}
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        alignSelf: 'flex-start',
                        mt: 'auto',
                        fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                        minWidth: 'auto',
                        borderRadius: '999px',
                        px: 2.25,
                        py: 1.1,
                        bgcolor: '#4f46e5',
                        color: '#ffffff',
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#5b54ff', boxShadow: 'none' },
                      }}
                    >
                      {discoveryCopy.quiz.cta}
                    </Button>
                  </Stack>
                </Box>
              </Box>

              <Box
                sx={{
                  ...panelSx,
                  borderRadius: 3.5,
                  px: { xs: 3, md: 3.5 },
                  py: { xs: 3, md: 3.5 },
                  background:
                    'linear-gradient(180deg, rgba(15,23,42,0.72) 0%, rgba(19,32,52,0.64) 100%)',
                }}
              >
                <Stack spacing={2.5}>
                  <Typography
                    sx={{
                      color: '#f8fafc',
                      fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                      fontSize: { xs: '1.55rem', md: '1.75rem' },
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {discoveryCopy.engine.title}
                  </Typography>
                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: '#cbd5e1',
                      fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {discoveryCopy.engine.leagues}
                  </Typography>
                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: '#94a3b8',
                      fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {discoveryCopy.engine.metrics}
                  </Typography>
                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: '#94a3b8',
                      fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                      fontSize: '0.8125rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {discoveryCopy.engine.rail}
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                      gap: 2,
                      pt: 1.15,
                    }}
                  >
                    {seoSummaryCards[locale].map((item, index) => (
                      <Box
                        key={item.title}
                        component={Link}
                        href={
                          index === 0
                            ? localize(PUBLIC_HUB_PATHS.teams)
                            : index === 1
                              ? localize(PUBLIC_HUB_PATHS.players)
                              : localize(PUBLIC_HUB_PATHS.leagues)
                        }
                        sx={{
                          ...panelSx,
                          display: 'block',
                          borderRadius: 2.75,
                          bgcolor: alpha('#111827', 0.56),
                          px: 2.25,
                          py: 2.25,
                          textDecoration: 'none',
                          transition: 'transform 220ms ease, border-color 220ms ease',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            borderColor: alpha('#6366f2', 0.48),
                          },
                        }}
                      >
                        <Stack spacing={1.5}>
                          <SeoCardVisual index={index} />
                          <Stack spacing={0.9}>
                            <Typography
                              sx={{
                                color: '#6b7280',
                                fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '0.01em',
                                lineHeight: 1.1,
                              }}
                            >
                              {item.eyebrow}
                            </Typography>
                            <Typography
                              sx={{
                                ...copySafeSx,
                                color: '#e2e8f0',
                                fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                lineHeight: 1.22,
                              }}
                            >
                              {item.title}
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{
                              ...copySafeSx,
                              color: index === 2 ? '#4b5563' : '#94a3b8',
                              fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                              fontSize: '0.875rem',
                              lineHeight: 1.5,
                            }}
                          >
                            {item.description}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Box>

                  <Typography
                    sx={{
                      ...copySafeSx,
                      color: '#94a3b8',
                      fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                      fontSize: '0.8125rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {discoveryCopy.engine.note}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Box
            component="section"
            sx={{
              ...motionRevealSx(320),
              py: { xs: 1, md: 0 },
            }}
          >
            <Stack spacing={2.5}>
              <SectionHeading
                title="Quick answers about how SirBro works, what it covers and what you can do inside the app."
                description={content.faq.description}
                maxWidth={pageMaxWidth}
              />

              <Stack spacing={1.5}>
                {content.faq.items.map((item) => (
                  <Accordion
                    key={item.question}
                    expanded={expandedFaq === item.question}
                    onChange={(_, isExpanded) =>
                      setExpandedFaq(isExpanded ? item.question : false)
                    }
                    disableGutters
                    elevation={0}
                    sx={{
                      ...panelSx,
                      borderRadius: '24px !important',
                      bgcolor: alpha('#111827', 0.56),
                      '&::before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreRoundedIcon sx={{ color: '#a5b4fc', fontSize: 28 }} />
                      }
                      sx={{
                        px: 2.75,
                        py: 0.75,
                        '& .MuiAccordionSummary-content': { my: 1.25 },
                      }}
                    >
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: '#e2e8f0',
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                        }}
                      >
                        {item.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2.75, pb: 2.5, pt: 0 }}>
                      <Typography
                        sx={{
                          ...copySafeSx,
                          color: '#94a3b8',
                          fontSize: '0.875rem',
                          lineHeight: 1.6,
                        }}
                      >
                        {item.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Stack>
          </Box>
        </Box>

        <Box
          component="section"
          sx={{
            ...motionRevealSx(380),
            mt: { xs: 1, md: 2 },
            pt: { xs: 7, md: 9 },
            width: '100vw',
            ml: 'calc(50% - 50vw)',
            mr: 'calc(50% - 50vw)',
          }}
        >
          <Box
            sx={{
              width: '100%',
              minHeight: { md: 325 },
              borderTop: '1px solid',
              borderColor: '#334155',
              borderRadius: { xs: '28px 28px 0 0', md: '36px 36px 0 0' },
              overflow: 'hidden',
              background:
                'linear-gradient(90deg, #0a1228 0%, #11162a 52%, #2b2760 82%, #3a2f73 100%)',
              pt: { xs: 6, md: 11 },
              pb: { xs: 6, md: 9 },
            }}
          >
            <Box sx={{ width: '100%', maxWidth: pageMaxWidth, mx: 'auto', px: pagePx }}>
              <Stack spacing={2.75}>
                <Typography
                  sx={{
                    ...copySafeSx,
                    color: '#f9fafb',
                    fontFamily: 'Roboto, var(--font-geist-sans), sans-serif',
                    fontSize: { xs: '2rem', sm: '2.35rem', md: '2.625rem' },
                    fontWeight: 600,
                    lineHeight: 1.02,
                    maxWidth: '100%',
                  }}
                >
                  Download SirBro and stay one step ahead of the match.
                </Typography>

                <Typography
                  sx={{
                    ...copySafeSx,
                    color: '#ddd6fe',
                    fontSize: { xs: '1rem', md: '1.0625rem' },
                    fontWeight: 400,
                    lineHeight: 1.45,
                    maxWidth: 760,
                  }}
                >
                  Get live football insight, AI chat and match context in one fast mobile
                  experience built for every game day.
                </Typography>

                <Stack direction="row" spacing={1.75} sx={{ flexWrap: 'wrap', rowGap: 1.75 }}>
                  <Button
                    component="a"
                    href="#download"
                    variant="contained"
                    sx={{
                      minWidth: 'auto',
                      borderRadius: '999px',
                      px: 2.25,
                      py: 1.75,
                      bgcolor: '#4f46e5',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      lineHeight: 1,
                      boxShadow: '0 10px 28px rgba(139, 92, 246, 0.33)',
                      '&:hover': {
                        bgcolor: '#4f46e5',
                        boxShadow: '0 10px 28px rgba(139, 92, 246, 0.33)',
                      },
                    }}
                  >
                    {content.finalCta.primaryCtaLabel}
                  </Button>
                  <Button
                    component={Link}
                    href={localize(PUBLIC_HUB_PATHS.insights)}
                    variant="outlined"
                    sx={{
                      minWidth: 'auto',
                      borderRadius: '999px',
                      px: 2.25,
                      py: 1.75,
                      color: '#f9fafb',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      lineHeight: 1,
                      borderColor: '#8b5cf6',
                      bgcolor: '#221735',
                      '&:hover': {
                        borderColor: '#8b5cf6',
                        bgcolor: '#221735',
                      },
                    }}
                  >
                    {content.finalCta.secondaryCtaLabel}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>

        <Box
          component="footer"
          sx={{
            ...motionRevealSx(420),
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
            <Stack spacing={2} sx={{ width: '100%', maxWidth: 300, flex: '0 0 300px' }}>
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
                  ...copySafeSx,
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  lineHeight: 1.45,
                }}
              >
                Football insights, proprietary sports AI analysis, chat and Fan Arena
                competition in one pocket-sized product.
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
                    width: {
                      lg:
                        section.title === 'Product' ||
                        section.title === 'Producto' ||
                        section.title === 'Produto'
                          ? 120
                          : section.title === 'Insights'
                            ? 140
                            : section.title === 'Explore' ||
                                section.title === 'Explorar'
                              ? 120
                              : section.title === 'Trust' ||
                                  section.title === 'Confianza'
                                ? 160
                                : section.title === 'Legal'
                                  ? 120
                                  : 130,
                    },
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
      </Box>
    </>
  );
}
