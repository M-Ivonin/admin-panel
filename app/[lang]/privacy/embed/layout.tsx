import { headers } from 'next/headers';

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

export async function generateMetadata() {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}
