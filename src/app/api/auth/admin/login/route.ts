import { NextResponse } from "next/server";
import Admin from "../../../../../backend/models/Admin";
import { connectDB } from "../../../../../backend/lib/mongodb";

import bcrypt from "bcryptjs";

// Admin sessions storage
const adminSessions = new Map();

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

    // Create admin session token
    const adminToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Prepare admin data for session
    const adminData = {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: 'admin'
    };

    // Store admin data in session
    adminSessions.set(adminToken, adminData);
    
    console.log('✅ ADMIN SESSION CREATED:', admin.username);

    const response = NextResponse.json({ 
      message: "Admin login successful",
      admin: adminData
    });

    // Set admin session cookie (1 day)
    response.cookies.set("admin-session", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 1 day
    });

    return response;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}