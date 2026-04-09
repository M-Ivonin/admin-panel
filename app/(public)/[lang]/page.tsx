import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { PublicHomepage } from '@/components/public/PublicHomepage';
import { staticPublicContentRepository } from '@/modules/content/static-public-content-repository';
import { getHomepageContent } from '@/modules/public/homepage-content';
import { buildContentPageMetadata } from '@/modules/seo/metadata';
import {
  buildFaqSchema,
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
  const homepageContent = getHomepageContent(lang);
  const structuredData = [
    buildWebsiteSchema(),
    buildOrganizationSchema(),
    buildFaqSchema(homepageContent.faq.items),
  ];

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

      <PublicHomepage locale={lang} />
    </>
  );
}
