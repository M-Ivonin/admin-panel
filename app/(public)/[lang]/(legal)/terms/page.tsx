import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { TermsContent } from '@/components/legal/TermsContent';
import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';
import { generateLegalPageMetadata } from '@/modules/legal/page-helpers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateLegalPageMetadata('terms', params);
}

export default async function TermsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;

  return (
    <LegalDocumentPage locale={lang} titleKey="terms">
      <TermsContent />
    </LegalDocumentPage>
  );
}
