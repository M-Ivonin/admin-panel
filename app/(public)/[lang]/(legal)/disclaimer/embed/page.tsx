import { DisclaimerContent } from '@/components/legal/DisclaimerContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DisclaimerEmbedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <DisclaimerContent />
        </article>
      </main>
    </div>
  );
}
