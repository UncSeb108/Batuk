import { NextResponse } from "next/server";
import { connectDB } from "../../../../../backend/lib/mongodb";
import Session from "../../../../../backend/models/Session";

export async function GET(request: Request) {
  try {
    await connectDB();
    
    // Get admin session token from cookies
    const cookies = request.headers.get('cookie') || '';
    console.log('🍪 ALL ADMIN COOKIES:', cookies);

    const adminSessionToken = cookies
      .split(';')
      .find(c => c.trim().startsWith('admin-session='))
      ?.split('=')[1];

    console.log('🔍 Checking admin session:', adminSessionToken);

    if (!adminSessionToken) {
      console.log('❌ No admin session token found in cookies');
      return NextResponse.json({ 
        loggedIn: false,
        message: 'No admin session found' 
      });
    }

    // Get session from MongoDB
    const session = await Session.findOne({ 
      sessionToken: adminSessionToken,
      expiresAt: { $gt: new Date() } // Only valid sessions
    });

    if (!session) {
      console.log('❌ Admin session not found or expired in MongoDB:', adminSessionToken);
      return NextResponse.json({ 
        loggedIn: false,
        message: 'Admin session expired' 
      });
    }

    // Check if user has admin role
    if (session.userData.role !== 'admin') {
      console.log('❌ User is not an admin:', session.userData.username);
      return NextResponse.json({ 
        loggedIn: false,
        message: 'Access denied - admin role required' 
      });
    }

    console.log('✅ Admin session valid:', session.userData.username);
    
    return NextResponse.json({
      loggedIn: true,
      admin: session.userData
    });

  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json({ 
      loggedIn: false,
      error: 'Admin authentication check failed' 
    }, { status: 500 });
  }
}
