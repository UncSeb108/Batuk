// File: src/app/api/gallery/route.ts
import { connectDB } from "@/src/backend/lib/mongodb";
import Gallery from "@/src/backend/models/Gallery";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// --- Cloudinary Config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -------------------- GET --------------------
export async function GET() {
  try {
    await connectDB();
    const images = await Gallery.find().sort({ createdAt: -1 });
    return NextResponse.json(images);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

// -------------------- POST --------------------
export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const artist = formData.get("artist") as string;
    const typeCode = formData.get("typeCode") as string;
    const price = formData.get("price") as string;
    const status = formData.get("status") as string;
    const state = formData.get("state") as string;
    const materials = formData.get("materials") as string;
    const duration = formData.get("duration") as string;
    const type = formData.get("type") as string;
    const inspiration = formData.get("inspiration") as string;
    const uid = formData.get("uid") as string;

    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    // Convert File -> Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using Promise wrapper
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "batuk_gallery",
          public_id: `${Date.now()}_${uid}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Save metadata in MongoDB
    const newArtwork = await Gallery.create({
      src: result.secure_url,
      title,
      artist,
      typeCode,
      price,
      status,
      state,
      materials,
      duration,
      type,
      inspiration,
      uid,
    });

    return NextResponse.json(newArtwork, { status: 201 });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

// -------------------- DELETE --------------------
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await connectDB();
    await Gallery.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
