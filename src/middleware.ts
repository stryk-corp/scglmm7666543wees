import {NextRequest, NextResponse} from 'next/server';

const PRIVATE_PREFIXES = [
  '/api',
  '/auth',
  '/forgot-password',
  '/generate',
  '/home',
  '/login',
  '/profile',
  '/scholarverse',
  '/signup',
  '/verify-email',
];

const ADMIN_SECTIONS = new Set([
  'dashboard',
  'earnings',
  'login',
  'notifications',
  'reports',
  'withdrawals',
]);

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const isPrivateRoute = PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAdminRoute = segments.length > 1 && ADMIN_SECTIONS.has(segments[1]);

  if (!isPrivateRoute && !isAdminRoute) return NextResponse.next();

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};