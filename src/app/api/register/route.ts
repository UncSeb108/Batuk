import { NextResponse } from "next/server";
import { connectDB } from "../../../backend/lib/mongodb";
import User from "../../../backend/models/user";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    console.log("📝 REGISTRATION DATA:", { name, email, passwordLength: password.length });

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" }, 
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Database connection
    await connectDB();

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    // ✅ REMOVED MANUAL HASHING - Let the User model handle it
    console.log("👤 CREATING USER (password will be auto-hashed by model)...");
    const user = await User.create({
      name,
      email,
      password, // Pass plain password - model will hash it
    });

    console.log("✅ USER CREATED:", user.email);
    console.log("📝 STORED PASSWORD HASH:", user.password);

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      { 
        message: "User registered successfully", 
        user: userResponse 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("❌ REGISTRATION ERROR:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}