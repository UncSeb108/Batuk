import { NextResponse } from "next/server";
import { connectDB } from "@/src/backend/lib/mongodb";
import User from "@/src/backend/models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Import bcrypt directly for debugging

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    console.log("🔐 LOGIN ATTEMPT:", { email, passwordLength: password.length });

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ USER NOT FOUND");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("✅ USER FOUND:", user.email);
    console.log("📝 STORED PASSWORD HASH:", user.password);

    // DEBUG: Try direct bcrypt comparison
    console.log("🔍 COMPARING PASSWORDS...");
    
    // Method 1: Use model method
    const isPasswordValidModel = await user.comparePassword(password);
    console.log("🔑 MODEL COMPARE RESULT:", isPasswordValidModel);
    
    // Method 2: Direct bcrypt compare
    const isPasswordValidDirect = await bcrypt.compare(password, user.password);
    console.log("🔑 DIRECT BCRYPT RESULT:", isPasswordValidDirect);

    if (!isPasswordValidModel && !isPasswordValidDirect) {
      console.log("❌ ALL PASSWORD COMPARISONS FAILED");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("🎉 LOGIN SUCCESSFUL");

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email }
    });

    // Set cookie
    response.cookies.set("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("💥 LOGIN ERROR:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}