import { TermsContent } from '@/components/legal/TermsContent';
import { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: 'Terms of Service',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TermsEmbedPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <TermsContent locale={lang} />
        </article>
      </main>
    </div>
  );
}
