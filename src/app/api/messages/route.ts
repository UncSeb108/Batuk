// File: src/app/api/messages/route.ts
import { connectDB } from "../../../backend/lib/mongodb";//works
import Message from "../../../backend/models/Message";//doent work
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const msgs = await Message.find().sort({ createdAt: -1 });
    return NextResponse.json(msgs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();
    const msg = await Message.create(body);
    return NextResponse.json(msg, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    await connectDB();
    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Message deleted successfully",
      deletedMessage 
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}