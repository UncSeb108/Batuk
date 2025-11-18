import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "../../../../../backend/lib/mongodb";
import Session from "../../../../../backend/models/Session";

export async function POST(request: Request) {
  try {
    await connectDB();
    
    // ✅ FIX: Use await with cookies()
    const cookieStore = await cookies();
    const adminSessionToken = cookieStore.get('admin-session')?.value;

    console.log('🔍 Logging out admin session:', adminSessionToken);

    if (adminSessionToken) {
      // Remove admin session from MongoDB
      await Session.deleteOne({ sessionToken: adminSessionToken });
      console.log('✅ Admin session removed from MongoDB');
    }

    const response = NextResponse.json({ 
      success: true,
      message: 'Admin logged out successfully' 
    });

    // Clear admin session cookie
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json({ 
      error: 'Admin logout failed' 
    }, { status: 500 });
  }
}