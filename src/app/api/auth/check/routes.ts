import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/adminToken=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ loggedIn: false }, { status: 401 });

    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ loggedIn: true });
  } catch {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
