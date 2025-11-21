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

// -------------------- GET with filters --------------------
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // Sold, Exhibition, Available
    const state = searchParams.get("state");   // Completed, In Progress

    const filter: Record<string, string> = {};
    if (status && status !== "All") filter.status = status;
    if (state && state !== "All") filter.state = state;

    const artworks = await Gallery.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(artworks);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch artworks" }, { status: 500 });
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
    if (!file) return NextResponse.json({ error: "Image required" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "batuk_gallery", public_id: `${Date.now()}_${uid}` },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      uploadStream.end(buffer);
    });

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
    return NextResponse.json({ error: "Failed to upload artwork" }, { status: 500 });
  }
}

// -------------------- DELETE --------------------
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await connectDB();
    await Gallery.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete artwork" }, { status: 500 });
  }
}

// -------------------- PATCH --------------------
// Update status or state of artwork
export async function PATCH(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const body = await req.json();
    const updateData: Record<string, string> = {};
    if (body.status) updateData.status = body.status;
    if (body.state) updateData.state = body.state;

    const updatedArtwork = await Gallery.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedArtwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    return NextResponse.json(updatedArtwork);
  } catch (err) {
    console.error("Update failed:", err);
    return NextResponse.json({ error: "Failed to update artwork" }, { status: 500 });
  }
}

// -------------------- PUT --------------------
// Update all artwork details including image
export async function PUT(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Check if artwork exists
    const existingArtwork = await Gallery.findById(id);
    if (!existingArtwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const price = formData.get("price") as string;
    const status = formData.get("status") as string;
    const state = formData.get("state") as string;
    const materials = formData.get("materials") as string;
    const duration = formData.get("duration") as string;
    const type = formData.get("type") as string;
    const inspiration = formData.get("inspiration") as string;

    const file = formData.get("image") as File | null;

    let imageUrl = existingArtwork.src;

    // If new image is provided, upload to Cloudinary
    if (file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "batuk_gallery", public_id: `${Date.now()}_${existingArtwork.uid}` },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          uploadStream.end(buffer);
        });

        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }
    }

    // Prepare update data
    const updateData = {
      title,
      price,
      status,
      state,
      materials,
      duration,
      type,
      inspiration,
      src: imageUrl,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const updatedArtwork = await Gallery.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedArtwork);
  } catch (err) {
    console.error("PUT update failed:", err);
    return NextResponse.json({ error: "Failed to update artwork details" }, { status: 500 });
  }
}