import type { Locale } from '@/lib/i18n/config';

export const HOME_LABEL: Record<Locale, string> = {
  en: 'Home',
  es: 'Inicio',
  pt: 'Início',
};

/**
 * Builds a localized public path without depending on the SEO registry module.
 */
export function buildLocalizedContentPath(
  locale: Locale,
  path: string
): string {
  return `/${locale}${path}`;
}
