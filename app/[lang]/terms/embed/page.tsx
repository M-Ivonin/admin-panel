import { TermsContent } from '@/components/legal/TermsContent';

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
