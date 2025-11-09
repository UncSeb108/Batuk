import { connectDB } from "../../lib/mongodb";
import Gallery from "../../models/Gallery";
import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();
    const image = await Gallery.create(body);
    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await connectDB();
    await Gallery.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
