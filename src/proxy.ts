import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME_TOKEN = 'auth-token';

export async function proxy(request: NextRequest) {
  const cookies = request.cookies;
  const { host, pathname, search, protocol } = request.nextUrl;

  const hostUrl = `${protocol}//${host}`;
  const redirectUrl = encodeURIComponent(`${pathname}${search}`);

  const res = await fetch(`${hostUrl}/api/users/me`, {
    method: 'get',
    headers: {
      Cookie: `${COOKIE_NAME_TOKEN}=${cookies.get(COOKIE_NAME_TOKEN)?.value || ''}`,
    },
  });

  if (!res.ok) {
    return NextResponse.redirect(new URL(`/api/login?redirectUrl=${redirectUrl}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|oauth2).*)'],
};
