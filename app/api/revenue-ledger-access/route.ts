import { NextRequest, NextResponse } from 'next/server';
import {
  REVENUE_LEDGER_ACCESS_COOKIE,
  REVENUE_LEDGER_ACCESS_MAX_AGE_SECONDS,
  createRevenueLedgerAccessToken,
  getRevenueLedgerPassword,
  isRevenueLedgerAccessTokenValid,
  isRevenueLedgerPasswordConfigured,
  isRevenueLedgerPasswordValid,
} from '@/lib/revenue-ledger-access';

export function GET(request: NextRequest) {
  const token = request.cookies.get(REVENUE_LEDGER_ACCESS_COOKIE)?.value;
  const authToken = request.cookies.get('accessToken')?.value;

  return NextResponse.json({
    hasAccess: isRevenueLedgerAccessTokenValid(token, authToken),
    passwordConfigured: isRevenueLedgerPasswordConfigured(),
  });
}

export async function POST(request: NextRequest) {
  const configuredPassword = getRevenueLedgerPassword();
  const authToken = request.cookies.get('accessToken')?.value;

  if (!configuredPassword) {
    return NextResponse.json(
      {
        hasAccess: false,
        message: 'Revenue Ledger password is not configured.',
      },
      { status: 503 }
    );
  }

  if (!authToken) {
    return NextResponse.json(
      {
        hasAccess: false,
        message: 'Admin session is required.',
      },
      { status: 401 }
    );
  }

  let password: unknown;

  try {
    const body = (await request.json()) as { password?: unknown };
    password = body.password;
  } catch {
    return NextResponse.json(
      { hasAccess: false, message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  if (!isRevenueLedgerPasswordValid(password)) {
    return NextResponse.json(
      { hasAccess: false, message: 'Invalid password.' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ hasAccess: true });

  response.cookies.set({
    name: REVENUE_LEDGER_ACCESS_COOKIE,
    value: createRevenueLedgerAccessToken(configuredPassword, authToken),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: REVENUE_LEDGER_ACCESS_MAX_AGE_SECONDS,
  });

  return response;
}
