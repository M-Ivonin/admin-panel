import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { generateTrustScaffoldMetadata, renderTrustScaffoldPage } from '@/modules/public/scaffold-route';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateTrustScaffoldMetadata('faq', params);
}

export default async function FaqPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderTrustScaffoldPage('faq', params);
}
