import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/shared/auth';

const IGNORE_PATH_PATTERNS = [/^\/login/, /^\/logout/];

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  console.log(pathname);

  if (IGNORE_PATH_PATTERNS.some((p) => p.test(pathname))) {
    return NextResponse.next();
  }

  const callback = encodeURIComponent(`${pathname}${search}`);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL(`/login?callback=${callback}`, req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
