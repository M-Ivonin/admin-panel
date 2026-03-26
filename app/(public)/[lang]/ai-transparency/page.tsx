import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { generateTrustScaffoldMetadata, renderTrustScaffoldPage } from '@/modules/public/scaffold-route';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateTrustScaffoldMetadata('ai-transparency', params);
}

export default async function AiTransparencyPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderTrustScaffoldPage('ai-transparency', params);
}
