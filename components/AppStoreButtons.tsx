'use client';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AppleIcon from '@mui/icons-material/Apple';
import { alpha } from '@mui/material/styles';
import { getClientConfig } from '@/lib/config';

export const AppStoreButtons = ({
  alignment = 'center',
}: {
  alignment?: 'start' | 'center';
}) => {
  const config = getClientConfig();

  const justifyContent = alignment === 'start' ? 'flex-start' : 'center';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.25,
        justifyContent: justifyContent,
        alignItems: { xs: 'stretch', sm: 'center' },
        width: '100%',
      }}
    >
      {config.androidPlayUrl && (
        <Button
          variant="outlined"
          size="large"
          href={config.androidPlayUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={
            <svg
              style={{ width: 24, height: 24 }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
          }
          sx={{
            minWidth: { xs: '100%', sm: 176 },
            px: 2.25,
            py: 1.35,
            borderRadius: '999px',
            fontWeight: 600,
            color: '#eef2ff',
            borderColor: alpha('#94a3b8', 0.32),
            bgcolor: alpha('#0f172a', 0.64),
            justifyContent: 'flex-start',
            transition:
              'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              borderColor: alpha('#cbd5e1', 0.48),
              bgcolor: alpha('#111827', 0.88),
            },
          }}
        >
          Google Play
        </Button>
      )}

      {config.iosAppStoreUrl && (
        <Button
          variant="contained"
          size="large"
          href={config.iosAppStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<AppleIcon />}
          sx={{
            minWidth: { xs: '100%', sm: 176 },
            px: 2.25,
            py: 1.35,
            borderRadius: '999px',
            fontWeight: 600,
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            justifyContent: 'flex-start',
            boxShadow: 'none',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
            '&:hover': {
              backgroundColor: '#f8fafc',
              opacity: 0.92,
              transform: 'translateY(-1px)',
            },
          }}
        >
          App Store
        </Button>
      )}
    </Box>
  );
};
