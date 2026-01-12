'use client';

import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LanguageIcon from '@mui/icons-material/Language';
import { Locale } from '@/lib/i18n/config';

export const LanguageSwitcher = ({ currentLocale }: { currentLocale: Locale }) => {
  const pathname = usePathname();
  const router = useRouter();

  const languages = [
    { code: 'en' as const, label: 'EN' },
    { code: 'pt' as const, label: 'PT' },
    { code: 'es' as const, label: 'ES' },
  ];

  const switchLanguage = (newLocale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5, 
      bgcolor: 'background.paper', 
      border: 1, 
      borderColor: 'divider',
      borderRadius: 2,
      p: 0.5
    }}>
      <LanguageIcon sx={{ width: 16, height: 16, color: 'text.secondary', ml: 1 }} />
      {languages.map((lang) => (
        <Button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          size="small"
          variant={currentLocale === lang.code ? 'contained' : 'text'}
          sx={{
            minWidth: 'auto',
            px: 1.5,
            py: 0.5,
            fontSize: '0.875rem',
            fontWeight: 500,
            ...(currentLocale !== lang.code && {
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
              }
            })
          }}
        >
          {lang.label}
        </Button>
      ))}
    </Box>
  );
};
