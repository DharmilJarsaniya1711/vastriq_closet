import { NextRequest, NextResponse } from 'next/server';

import { ACCESS_TOKEN } from '@/utils/constants';

// Routes that require the user to be signed in. Anything matched here without a
// valid auth cookie is redirected to /login (with a ?next= back-link).
const PROTECTED_PREFIXES = ['/account', '/wishlist', '/owner'];

// Public exceptions that live under a protected prefix (e.g. the marketing
// "list with us" page must be reachable by signed-out visitors).
const PUBLIC_EXCEPTIONS = ['/owner/onboarding'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isPublic = PUBLIC_EXCEPTIONS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isPublic) return NextResponse.next();

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(ACCESS_TOKEN)?.value;
  if (token) return NextResponse.next();

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.search = '';
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/account/:path*', '/wishlist/:path*', '/owner/:path*'],
};
