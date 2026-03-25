import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export type PublicSeoPageKey = 'home' | 'privacy' | 'terms' | 'disclaimer' | 'cookies';

interface PublicSeoCopy {
  title: string;
  description: string;
}

const legalDescriptions: Record<
  Exclude<PublicSeoPageKey, 'home'>,
  Record<Locale, string>
> = {
  privacy: {
    en: 'Learn how SirBro collects, stores, and protects personal data for the SirBro app and website.',
    es: 'Descubre cómo SirBro recopila, almacena y protege los datos personales en la app y el sitio web de SirBro.',
    pt: 'Saiba como o SirBro coleta, armazena e protege dados pessoais no app e no site do SirBro.',
  },
  terms: {
    en: 'Read the SirBro terms of service, product rules, and responsibilities for using the app and website.',
    es: 'Lee los términos de servicio de SirBro, las reglas del producto y las responsabilidades de uso.',
    pt: 'Leia os termos de serviço do SirBro, as regras do produto e as responsabilidades de uso.',
  },
  disclaimer: {
    en: 'Review the SirBro disclaimer for informational use, risk notice, and service limitations.',
    es: 'Consulta el descargo de responsabilidad de SirBro sobre uso informativo, riesgos y limitaciones del servicio.',
    pt: 'Consulte o aviso legal do SirBro sobre uso informativo, riscos e limitações do serviço.',
  },
  cookies: {
    en: 'See how SirBro uses cookies and similar technologies across the website and app experience.',
    es: 'Consulta cómo SirBro usa cookies y tecnologías similares en el sitio web y la app.',
    pt: 'Veja como o SirBro usa cookies e tecnologias semelhantes no site e na experiência do app.',
  },
};

export function getPublicPageSeoCopy(
  pageKey: PublicSeoPageKey,
  locale: Locale
): PublicSeoCopy {
  const t = getDictionary(locale);

  if (pageKey === 'home') {
    return {
      title: 'Football Predictions App',
      description: t.hero.subtitle,
    };
  }

  return {
    title: t.footer[pageKey],
    description: legalDescriptions[pageKey][locale],
  };
}
