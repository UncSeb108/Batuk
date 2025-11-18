import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const adminSession = req.cookies.get('admin-session')?.value;
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
  const isAdminLoginPage = req.nextUrl.pathname === '/admin-login';

  // Allow access to admin-login page for everyone
  if (isAdminLoginPage) {
    return NextResponse.next();
  }

  // Protect admin pages - check for admin-session cookie
  if (isAdminPage) {
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin-login', req.url));
    }
    
    // The actual admin validation will happen in the admin route
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login']
};