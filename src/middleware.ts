import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("adminToken")?.value;

  // Allow login page without token
  if (req.nextUrl.pathname.startsWith("/admin-login")) {
    if (token) {
      // Already logged in → redirect to /admin
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Protect /admin
  if (!token) {
    return NextResponse.redirect(new URL("/admin-login", req.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin-login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
