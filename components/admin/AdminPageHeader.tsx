import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

type AdminPageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  backHref?: string;
  backLabel?: string;
  showBack?: boolean;
  icon?: ReactNode;
  titleAddon?: ReactNode;
  actions?: ReactNode;
  maxWidth?: number;
};

export function AdminPageHeader({
  title,
  subtitle,
  backHref = '/dashboard',
  backLabel = 'Back',
  showBack = true,
  icon,
  titleAddon,
  actions,
  maxWidth = 1280,
}: AdminPageHeaderProps) {
  return (
    <Paper
      component="header"
      elevation={0}
      square
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Box
        sx={{
          maxWidth,
          mx: 'auto',
          px: { xs: 2, sm: 3, lg: 4 },
          py: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
            {showBack ? (
              <Button
                component={Link}
                href={backHref}
                variant="outlined"
                size="small"
                startIcon={<ArrowBack />}
                sx={{ flexShrink: 0 }}
              >
                {backLabel}
              </Button>
            ) : null}
            {icon}
            <Box minWidth={0}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  {title}
                </Typography>
                {titleAddon}
              </Stack>
              {subtitle ? (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
          </Stack>
          {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
        </Stack>
      </Box>
    </Paper>
  );
}
