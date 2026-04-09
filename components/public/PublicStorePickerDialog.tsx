'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AppleIcon from '@mui/icons-material/Apple';
import { alpha } from '@mui/material/styles';
import type { Locale } from '@/lib/i18n/config';
import { getClientConfig } from '@/lib/config';

const dialogCopy = {
  en: {
    title: 'Download SirBro',
    description: 'Choose where you want to install the app.',
    appStore: 'App Store',
    googlePlay: 'Google Play',
    close: 'Close',
  },
  es: {
    title: 'Descargar SirBro',
    description: 'Elige dónde quieres instalar la app.',
    appStore: 'App Store',
    googlePlay: 'Google Play',
    close: 'Cerrar',
  },
  pt: {
    title: 'Baixar SirBro',
    description: 'Escolha onde você quer instalar o app.',
    appStore: 'App Store',
    googlePlay: 'Google Play',
    close: 'Fechar',
  },
} as const;

export function PublicStorePickerDialog({
  locale,
  open,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const { iosAppStoreUrl, androidPlayUrl } = getClientConfig();
  const copy = dialogCopy[locale];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          color: '#f8fafc',
          background:
            'linear-gradient(180deg, rgba(9,13,22,0.98) 0%, rgba(12,18,32,0.98) 100%)',
          border: '1px solid',
          borderColor: alpha('#334155', 0.9),
          boxShadow: `0 24px 72px ${alpha('#020617', 0.55)}`,
          backdropFilter: 'blur(16px)',
        },
      }}
    >
      <DialogTitle
        sx={{
          pt: 3,
          px: 3,
          pb: 1,
          fontSize: '1.25rem',
          fontWeight: 700,
        }}
      >
        {copy.title}
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3 }}>
        <Stack spacing={2.25}>
          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.9375rem',
              lineHeight: 1.55,
            }}
          >
            {copy.description}
          </Typography>

          <Stack spacing={1.25}>
            {iosAppStoreUrl ? (
              <Button
                component="a"
                href={iosAppStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<AppleIcon />}
                onClick={onClose}
                sx={{
                  alignSelf: 'center',
                  width: '50%',
                  justifyContent: 'center',
                  borderRadius: '999px',
                  px: 2,
                  py: 1.35,
                  bgcolor: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: 700,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    opacity: 0.94,
                    boxShadow: 'none',
                  },
                }}
              >
                {copy.appStore}
              </Button>
            ) : null}

            {androidPlayUrl ? (
              <Button
                component="a"
                href={androidPlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                startIcon={
                  <svg
                    style={{ width: 22, height: 22 }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                }
                sx={{
                  alignSelf: 'center',
                  width: '50%',
                  justifyContent: 'center',
                  borderRadius: '999px',
                  px: 2,
                  py: 1.35,
                  color: '#eef2ff',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: alpha('#94a3b8', 0.32),
                  bgcolor: alpha('#0f172a', 0.64),
                  '&:hover': {
                    borderColor: alpha('#cbd5e1', 0.48),
                    bgcolor: alpha('#111827', 0.88),
                  },
                }}
              >
                {copy.googlePlay}
              </Button>
            ) : null}
          </Stack>

          <Button
            onClick={onClose}
            variant="text"
            sx={{
              alignSelf: 'flex-end',
              minWidth: 'auto',
              px: 0,
              color: '#94a3b8',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#f8fafc',
              },
            }}
          >
            {copy.close}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
