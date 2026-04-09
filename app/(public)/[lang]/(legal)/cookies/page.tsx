import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { CookiesContent } from '@/components/legal/CookiesContent';
import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';
import { generateLegalPageMetadata } from '@/modules/legal/page-helpers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateLegalPageMetadata('cookies', params);
}

export default async function CookiesPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;

  return (
    <LegalDocumentPage locale={lang} titleKey="cookies">
      <CookiesContent />
    </LegalDocumentPage>
  );
}
