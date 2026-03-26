import { getPublicAppConfig } from '@/modules/config/runtime';
import type { HomepageFaqItem } from '@/modules/public/homepage-content';

export function buildOrganizationSchema() {
  const { appHost } = getPublicAppConfig();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SirBro',
    url: `https://${appHost}`,
    email: 'support@levantemai.pro',
  };
}

export function buildWebsiteSchema() {
  const { appHost } = getPublicAppConfig();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SirBro',
    url: `https://${appHost}`,
    inLanguage: ['en', 'es', 'pt'],
  };
}

export function buildFaqSchema(faqItems: HomepageFaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
