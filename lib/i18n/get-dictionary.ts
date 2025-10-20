import { Locale } from './config';
import { translations, Translations } from './translations';

export const getDictionary = (locale: Locale): Translations => {
  return translations[locale];
};
