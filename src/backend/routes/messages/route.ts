import { connectDB } from "../../lib/mongodb";
import Message from "../../models/Message";
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
