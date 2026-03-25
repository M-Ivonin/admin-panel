import { TermsContent } from '@/components/legal/TermsContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsEmbedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <TermsContent />
        </article>
      </main>
    </div>
  );
}
