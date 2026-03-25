import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from '@/lib/i18n/config';
import { DEEPLINK_ROUTE_PREFIXES } from '@/modules/deeplink/constants';

const AUTH_ROUTE_PREFIXES = ['/admin-login', '/login', '/magic-auth', '/magic-verify'] as const;
const ADMIN_ROUTE_PREFIXES = ['/dashboard'] as const;
const STATIC_ROUTE_PREFIXES = ['/api', '/_next', '/favicon.ico', '/assets'] as const;
const PUBLIC_INFRA_PATHS = ['/robots.txt', '/sitemap.xml'] as const;

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isBypassedPath(pathname: string) {
  if (pathname === '/') {
    return false;
  }

  return (
    STATIC_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix)) ||
    AUTH_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix)) ||
    ADMIN_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix)) ||
    DEEPLINK_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix)) ||
    PUBLIC_INFRA_PATHS.some((prefix) => matchesPrefix(pathname, prefix))
  );
}

function withForwardedLocale(request: NextRequest, locale: string) {
  const headers = new Headers(request.headers);
  headers.set('x-app-locale', locale);

  return NextResponse.next({
    request: {
      headers,
    },
  });
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isBypassedPath(pathname)) {
    return NextResponse.next();
  }

  const matchedLocale = i18n.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (matchedLocale) {
    return withForwardedLocale(request, matchedLocale);
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${i18n.defaultLocale}`, request.url));
  }

  return NextResponse.redirect(new URL(`/${i18n.defaultLocale}${pathname}`, request.url));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
