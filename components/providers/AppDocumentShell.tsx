import { RootProviders } from '@/components/providers/RootProviders';

export function AppDocumentShell({
  lang,
  children,
  withProviders = true,
  bodySuffix,
}: {
  lang: string;
  children: React.ReactNode;
  withProviders?: boolean;
  bodySuffix?: React.ReactNode;
}) {
  const content = withProviders ? <RootProviders>{children}</RootProviders> : children;

  return (
    <html lang={lang}>
      <body className="antialiased" suppressHydrationWarning>
        {content}
        {bodySuffix}
      </body>
    </html>
  );
}
