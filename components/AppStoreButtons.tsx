'use client';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AppleIcon from '@mui/icons-material/Apple';
import { getAppConfig } from '@/lib/config';

export const AppStoreButtons = () => {
   const config = getAppConfig();
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        href={config.androidPlayUrl}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={
          <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
          </svg>
        }
        sx={{ 
          minWidth: 200, 
          fontWeight: 500,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        Google Play
      </Button>

      <Button
        variant="contained"
        size="large"
        href={config.iosAppStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<AppleIcon />}
        sx={{ 
          minWidth: 200,
          fontWeight: 500,
          backgroundColor: 'text.primary',
          color: 'background.default',
          transition: 'transform 0.2s',
          '&:hover': {
            backgroundColor: 'text.primary',
            opacity: 0.9,
            transform: 'scale(1.05)'
          }
        }}
      >
        App Store
      </Button>
    </Box>
  );
};
