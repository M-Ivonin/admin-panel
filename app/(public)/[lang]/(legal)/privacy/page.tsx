import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { PrivacyContent } from '@/components/legal/PrivacyContent';
import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';
import { generateLegalPageMetadata } from '@/modules/legal/page-helpers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateLegalPageMetadata('privacy', params);
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;

  return (
    <LegalDocumentPage locale={lang} titleKey="privacy">
      <PrivacyContent locale={lang} />
    </LegalDocumentPage>
  );
}
