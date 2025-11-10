import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../backend/lib/mongodb"; // Now pointing to lib/mongodb
import User from "../../../backend/models/user";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

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
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    // TODO: Generate JWT token if using token-based auth
    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!);

    return NextResponse.json(
      { 
        message: "Login successful", 
        user: userResponse,
        // token: token // Include if using JWT
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Login error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}