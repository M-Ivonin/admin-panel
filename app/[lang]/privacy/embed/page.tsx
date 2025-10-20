import { PrivacyContent } from '@/components/legal/PrivacyContent';

export default function PrivacyEmbedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <PrivacyContent />
        </article>
      </main>
    </div>
  );
}
