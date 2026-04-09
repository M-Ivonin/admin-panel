import { PrivacyContent } from '@/components/legal/PrivacyContent';
import { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PrivacyEmbedPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <PrivacyContent locale={lang} />
        </article>
      </main>
    </div>
  );
}
