import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { PublicHomepage } from '@/components/public/PublicHomepage';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { staticPublicContentRepository } from '@/modules/content/static-public-content-repository';
import { buildContentPageMetadata } from '@/modules/seo/metadata';
import {
  buildOrganizationSchema,
  buildWebsiteSchema,
} from '@/modules/seo/schema';
import Script from 'next/script';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const page = await staticPublicContentRepository.getHome(lang);

  if (!page) {
    return {};
  }

  return buildContentPageMetadata(page);
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const structuredData = [buildWebsiteSchema(), buildOrganizationSchema()];

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17738539582"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17738539582');
        `}
      </Script>
      <Script id="homepage-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <PublicPageShell locale={lang} maxWidth="xl">
        <PublicHomepage locale={lang} />
      </PublicPageShell>
    </>
  );
}
