import { NextResponse } from "next/server";
import { connectDB } from "@/src/backend/lib/mongodb";
import User from "@/src/backend/models/user";           // Fixed: 3 levels up  
import Session from "@/src/backend/models/Session";     // Fixed: 3 levels up

export async function POST(request: Request) {
  try {
    await connectDB();
    
    // Get session token from cookies
    const cookies = request.headers.get('cookie') || '';
    const sessionToken = cookies
      .split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    console.log('🔍 Logging out user session:', sessionToken);

    if (sessionToken) {
      // Remove session from MongoDB
      await Session.deleteOne({ sessionToken });
      console.log('✅ User session removed from MongoDB');
    }

    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully' 
    });

    // Clear session cookie
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      error: 'Logout failed' 
    }, { status: 500 });
  }
}