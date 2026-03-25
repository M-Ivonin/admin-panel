import { getPublicAppConfig } from '@/modules/config/runtime';

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
