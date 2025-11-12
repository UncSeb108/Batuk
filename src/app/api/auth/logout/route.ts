import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });

  // Clear the cookie
  res.cookies.set("adminToken", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return res;
}
