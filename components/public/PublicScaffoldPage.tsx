import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import type { Locale } from '@/lib/i18n/config';
import { PublicPageShell } from '@/components/public/PublicPageShell';

const scaffoldLabels = {
  trust: {
    en: 'Trust Route Scaffold',
    es: 'Scaffold de Ruta de Confianza',
    pt: 'Scaffold de Rota de Confiança',
  },
  hub: {
    en: 'Hub Route Scaffold',
    es: 'Scaffold de Ruta Hub',
    pt: 'Scaffold de Rota Hub',
  },
  noindex: {
    en: 'Noindex Until Content Is Ready',
    es: 'Noindex Hasta Que El Contenido Esté Listo',
    pt: 'Noindex Até O Conteúdo Estar Pronto',
  },
  explanation: {
    en: 'This route is live to lock navigation, folder structure, metadata boundaries, and crawl policy in code. Content, design composition, and indexation are deferred to the next implementation phases.',
    es: 'Esta ruta está activa para fijar en código la navegación, la estructura de carpetas, los límites de metadata y la política de rastreo. El contenido, la composición visual y la indexación se trasladan a las próximas fases de implementación.',
    pt: 'Esta rota está ativa para fixar em código a navegação, a estrutura de pastas, os limites de metadata e a política de rastreamento. Conteúdo, composição visual e indexação ficam para as próximas fases de implementação.',
  },
  plannedSections: {
    en: 'Planned Sections',
    es: 'Secciones Planificadas',
    pt: 'Seções Planejadas',
  },
} as const;

export function PublicScaffoldPage({
  locale,
  title,
  description,
  category,
  plannedSections,
}: {
  locale: Locale;
  title: string;
  description: string;
  category: 'trust' | 'hub';
  plannedSections: string[];
}) {
  return (
    <PublicPageShell locale={locale}>
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip label={scaffoldLabels[category][locale]} size="small" />
          <Chip label={scaffoldLabels.noindex[locale]} size="small" variant="outlined" />
        </Box>

        <Typography variant="h2" component="h1" fontWeight={700} sx={{ mb: 2 }}>
          {title}
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 860, mb: 4 }}>
          {description}
        </Typography>

        <Typography color="text.secondary" sx={{ maxWidth: 860, mb: 4 }}>
          {scaffoldLabels.explanation[locale]}
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" fontWeight={700} sx={{ mb: 2 }}>
          {scaffoldLabels.plannedSections[locale]}
        </Typography>

        <Box component="ul" sx={{ m: 0, pl: 3, '& li': { mb: 1 } }}>
          {plannedSections.map((section) => (
            <li key={section}>
              <Typography>{section}</Typography>
            </li>
          ))}
        </Box>
      </Box>
    </PublicPageShell>
  );
}
