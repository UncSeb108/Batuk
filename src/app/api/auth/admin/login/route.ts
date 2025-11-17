import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Admin from "../../../../../backend/models/Admin";
import Session from "../../../../../backend/models/Session";
import { connectDB } from "../../../../../backend/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, password } = await req.json();

    console.log('🔐 ADMIN LOGIN ATTEMPT:', { username });

    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('❌ ADMIN NOT FOUND:', username);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('❌ ADMIN PASSWORD INVALID');
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log('🎉 ADMIN LOGIN SUCCESSFUL');

    // ✅ CLEANUP: Delete all existing admin sessions BEFORE creating new one
    await Session.deleteMany({ 
      "userData.username": username,
      "userData.role": "admin" 
    });

    // Create admin session token
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Calculate expiration (1 day from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    // Prepare admin data for session
    const adminData = {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: 'admin'
    };

    // ✅ Store admin session in MongoDB
    await Session.create({
      sessionToken,
      userId: admin._id.toString(),
      userData: adminData,
      expiresAt,
    });
    
    console.log('✅ ADMIN SESSION CREATED IN MONGODB:', admin.username);

    const response = NextResponse.json({ 
      message: "Admin login successful",
      admin: adminData
    });

    // Set admin session cookie (1 day)
    response.cookies.set("admin-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 1 day
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}