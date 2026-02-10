import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './lib/i18n/config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for existing routes (channels, invite, api, static files)
  if (
    pathname === '/' ||
    pathname.startsWith('/admin-login') ||
    pathname.startsWith('/magic-verify') ||
    pathname.startsWith('/magic-auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/channels') ||
    pathname.startsWith('/invite') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/robots.txt') ||
    pathname === '/app-ads.txt'
  ) {
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect to default locale if no locale is present
  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/${i18n.defaultLocale}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - embed (embed pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*embed$).*)',
  ],
};
