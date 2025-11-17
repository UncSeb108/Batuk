import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "../../../../backend/lib/mongodb";
import Session from "../../../../backend/models/Session";

// ✅ Add interface for admin user data
interface AdminUserData {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const cookieStore = await cookies();
    const adminSessionToken = cookieStore.get('admin-session')?.value;

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
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      console.log('❌ Admin session not found or expired in MongoDB:', adminSessionToken);
      return NextResponse.json({ 
        loggedIn: false,
        message: 'Admin session expired' 
      });
    }

    // ✅ FIX: Use type assertion
    const userData = session.userData as AdminUserData;
    
    console.log('✅ Admin session valid:', userData.name);
    
    return NextResponse.json({
      loggedIn: true,
      admin: userData
    });

  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json({ 
      loggedIn: false,
      error: 'Admin authentication check failed' 
    }, { status: 500 });
  }
}