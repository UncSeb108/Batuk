// scripts/createAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Import Admin model
import Admin from "../src/backend/models/Admin.js";  // use .js if compiled, or rename Admin.ts to Admin.js

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/BatukDB";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to DB"))
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });

async function createAdmin() {
  const username = "admin"; // your desired username
  const password = "password123"; // your desired password

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log("Admin already exists!");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Admin.create({ username, password: hashedPassword });
  console.log("Admin created:", admin);
  process.exit(0);
}

createAdmin();
