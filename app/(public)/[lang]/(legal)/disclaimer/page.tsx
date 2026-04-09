import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { DisclaimerContent } from '@/components/legal/DisclaimerContent';
import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';
import { generateLegalPageMetadata } from '@/modules/legal/page-helpers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateLegalPageMetadata('disclaimer', params);
}

export default async function DisclaimerPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;

  return (
    <LegalDocumentPage locale={lang} titleKey="disclaimer">
      <DisclaimerContent />
    </LegalDocumentPage>
  );
}
