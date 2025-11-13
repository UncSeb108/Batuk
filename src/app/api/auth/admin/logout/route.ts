import { NextResponse } from "next/server";

// Admin sessions storage
const adminSessions = new Map();

export async function POST(request: Request) {
  try {
    // Get admin session token from cookies
    const cookies = request.headers.get('cookie') || '';
    const adminToken = cookies
      .split(';')
      .find(c => c.trim().startsWith('admin-session='))
      ?.split('=')[1];

    console.log('🔍 Logging out admin session:', adminToken);

    if (adminToken) {
      // Remove admin session
      adminSessions.delete(adminToken);
      console.log('✅ Admin session removed');
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
      maxAge: 0 // Expire immediately
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json({ 
      error: 'Admin logout failed' 
    }, { status: 500 });
  }
}