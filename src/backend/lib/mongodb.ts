import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB = process.env.MONGODB_DB || "BatukDB";

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define the MONGODB_URI in .env.local");
}

declare global {
  var _mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null };
}

const cached = global._mongoose;

// Simple admin creation function
async function createDefaultAdmin() {
  try {
    const { default: Admin } = await import("../models/Admin.js");
    const bcrypt = await import("bcryptjs");
    
    // Your desired credentials
    const username = "admin";
    const password = "password123";

    const existingAdmin = await Admin.findOne({ username });
    
    if (existingAdmin) {
      console.log("✅ Admin exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await Admin.create({
      username,
      password: hashedPassword
    });

    console.log("🎉 Admin created automatically");
 
    
  } catch (error) {
    console.error("Failed to create admin:", error);
  }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB,
        bufferCommands: false,
      })
      .then(async (mongooseInstance) => {
        console.log(`✅ Connected to MongoDB: "${MONGODB_DB}"`);
        
        // Create admin after connection
        await createDefaultAdmin();
        
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}