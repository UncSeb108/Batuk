#!/bin/bash
# 🧰 Setup script for MongoDB + Auth + CRUD in Next.js (TypeScript)

echo "⚙️ Setting up project structure..."

# Create folders
mkdir -p src/app/api/auth/login
mkdir -p src/app/api/auth/register
mkdir -p src/app/api/artpieces
mkdir -p src/lib
mkdir -p src/models
mkdir -p src/types

# Create MongoDB connection file
cat > src/lib/mongodb.ts <<'EOF'
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) throw new Error("Please define the MONGODB_URI in .env.local");

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
EOF

# Create User model
cat > src/models/User.ts <<'EOF'
import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = models.User || mongoose.model("User", userSchema);
export default User;
EOF

# Create ArtPiece model
cat > src/models/ArtPiece.ts <<'EOF'
import mongoose, { Schema, models } from "mongoose";

const artPieceSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: String,
  price: Number,
  createdAt: { type: Date, default: Date.now },
});

const ArtPiece = models.ArtPiece || mongoose.model("ArtPiece", artPieceSchema);
export default ArtPiece;
EOF

# Create Register API
cat > src/app/api/auth/register/route.ts <<'EOF'
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) return NextResponse.json({ error: "User already exists" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    return NextResponse.json({ message: "User registered", user: newUser });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
EOF

# Create Login API
cat > src/app/api/auth/login/route.ts <<'EOF'
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

    return NextResponse.json({ message: "Login successful", user });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
EOF

# Create CRUD routes for ArtPieces
cat > src/app/api/artpieces/route.ts <<'EOF'
import { NextResponse } from "next/server";
import ArtPiece from "@/models/ArtPiece";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  await connectDB();
  const art = await ArtPiece.find();
  return NextResponse.json(art);
}

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();
  const art = await ArtPiece.create(data);
  return NextResponse.json(art);
}
EOF

cat > src/app/api/artpieces/[id]/route.ts <<'EOF'
import { NextResponse } from "next/server";
import ArtPiece from "@/models/ArtPiece";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: Request, { params }: any) {
  await connectDB();
  const art = await ArtPiece.findById(params.id);
  return NextResponse.json(art);
}

export async function PUT(req: Request, { params }: any) {
  await connectDB();
  const updates = await req.json();
  const art = await ArtPiece.findByIdAndUpdate(params.id, updates, { new: true });
  return NextResponse.json(art);
}

export async function DELETE(req: Request, { params }: any) {
  await connectDB();
  await ArtPiece.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Deleted" });
}
EOF

# Create .env.local template
cat > .env.local <<'EOF'
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/batuk
EOF

echo "✅ MongoDB + Auth + CRUD API files created successfully!"
echo "👉 Next steps:"
echo "1. npm install mongoose bcryptjs"
echo "2. Add your MongoDB URI to .env.local"
echo "3. Run: npm run dev"
