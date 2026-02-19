//src/app/api/auth/user/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "../../../../backend/lib/mongodb";
import Session from "../../../../backend/models/Session";

export async function GET(request: Request) {
  try {
    await connectDB();
    
    // Get user session token from cookies
    const cookies = request.headers.get('cookie') || '';
    console.log('🍪 ALL COOKIES:', cookies);

    const sessionToken = cookies
      .split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    console.log('🔍 Checking user session:', sessionToken);

    if (!sessionToken) {
      console.log('❌ No session token found in cookies');
      return NextResponse.json({ 
        loggedIn: false,
        message: 'No user session found' 
      });
    }

    // Get session from MongoDB
    const session = await Session.findOne({ 
      sessionToken,
      expiresAt: { $gt: new Date() } // Only valid sessions
    });

    if (!session) {
      console.log('❌ Session not found or expired in MongoDB:', sessionToken);
      return NextResponse.json({ 
        loggedIn: false,
        message: 'User session expired' 
      });
    }

    console.log('✅ User session valid:', session.userData.email);
    
    return NextResponse.json({
      loggedIn: true,
      user: session.userData
    });

  } catch (error) {
    console.error('User auth check error:', error);
    return NextResponse.json({ 
      loggedIn: false,
      error: 'User authentication check failed' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { user } = await request.json();
    
    if (!user || !user.id || !user.email) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Create session token
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Calculate expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store session in MongoDB
    await Session.create({
      sessionToken,
      userId: user.id,
      userData: user,
      expiresAt,
    });
    
    console.log('✅ User session created in MongoDB:', user.email);

    const response = NextResponse.json({ 
      success: true,
      message: 'User session created' 
    });

    // Set session cookie (7 days)
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 1// 1 days
    });

    return response;

  } catch (error) {
    console.error('User session creation error:', error);
    return NextResponse.json({ 
      error: 'User session creation failed' 
    }, { status: 500 });
  }
}