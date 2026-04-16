import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/logout', '/api/auth'];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, origin, href } = request.nextUrl;


  //  ======= auth form flow
  // if AUTH_LOGIN_PATH_URL go there and login
  const authLoginPathUrl = process.env.AUTH_LOGIN_PATH_URL;

  if (pathname.startsWith('/login') && authLoginPathUrl) {
    const loginRedirectUrl = new URL(authLoginPathUrl, origin);
    loginRedirectUrl.searchParams.set('callbackUrl', href);
    return NextResponse.redirect(loginRedirectUrl);
  }

  if (isPublicPath(pathname)) return NextResponse.next();

  const token = await getToken({ req: request });

  if (token?.error === 'RefreshAccessTokenError') {
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL_INTERNAL ?? request.url));
  }

  return NextResponse.next();
}

// adictional paths for apps, is used as subdomains
export const config = {
  matcher: ['/', '/((?!api|apps|health|_next|favicon.ico|.*\\..*).*)'],
};
