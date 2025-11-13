import { NextResponse } from "next/server";
import { connectDB } from "../../../backend/lib/mongodb";
import User from "../../../backend/models/user";
import Session from "../../../backend/models/Session";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log('🔐 LOGIN ATTEMPT:', { email, passwordLength: password?.length });

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" }, 
        { status: 400 }
      );
    }

    // Database connection
    await connectDB();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ USER NOT FOUND:', email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log('✅ USER FOUND:', user.email);
    console.log('📝 STORED PASSWORD HASH:', user.password);

    // Check password
    console.log('🔍 COMPARING PASSWORDS...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🎯 COMPARE RESULT:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ PASSWORD INVALID');
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log('🎉 LOGIN SUCCESSFUL');

    // Create session token
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Calculate expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Prepare user data for session (remove password)
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    // ✅ Store session in MongoDB
    await Session.create({
      sessionToken,
      userId: user._id.toString(),
      userData,
      expiresAt,
    });
    
    console.log('✅ USER SESSION CREATED IN MONGODB:', user.email);
    console.log('🍪 SESSION TOKEN:', sessionToken);

    // Create response
    const response = NextResponse.json({
      message: "Login successful",
      user: userData
    });

    // Set session cookie (7 days)
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('✅ COOKIE SET: session');

    return response;

  } catch (error: any) {
    console.error("Login error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
