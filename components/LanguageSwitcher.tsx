'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
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
    // Remove current locale from pathname and add new locale
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
      <Globe className="w-4 h-4 text-secondary ml-2" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            currentLocale === lang.code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
