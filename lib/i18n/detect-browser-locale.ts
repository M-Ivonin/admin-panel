import { Locale, i18n } from './config';

/**
 * Detects the user's preferred locale from browser settings
 * Falls back to default locale if no match is found
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return i18n.defaultLocale;
  }

  // Get browser languages in order of preference
  const browserLanguages = navigator.languages || [navigator.language];

  // Try to find a matching locale
  for (const browserLang of browserLanguages) {
    // Extract the language code (e.g., 'en' from 'en-US')
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    // Check if we support this language
    const matchedLocale = i18n.locales.find(locale => locale === langCode);
    if (matchedLocale) {
      return matchedLocale;
    }
  }

  // Fall back to default locale
  return i18n.defaultLocale;
}
