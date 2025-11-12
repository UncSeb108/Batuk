import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/userToken=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return NextResponse.json({ loggedIn: false }, { status: 200 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return NextResponse.json({ 
      loggedIn: true,
      user: { id: decoded.userId, email: decoded.email }
    });
  } catch (error) {
    return NextResponse.json({ loggedIn: false }, { status: 200 });
  }
}