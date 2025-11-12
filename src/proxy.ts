import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function proxy(req: NextRequest) {
  const token = req.cookies.get('adminToken')?.value;
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
  const isAdminLoginPage = req.nextUrl.pathname === '/admin-login';

  // Allow access to admin-login page for everyone
  if (isAdminLoginPage) {
    return NextResponse.next();
  }

  // Protect admin pages
  if (isAdminPage) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin-login', req.url));
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL('/admin-login', req.url));
      response.cookies.delete('adminToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login']
};