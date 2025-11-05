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
