import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to send messages." }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, text } = body;

    if (!conversationId || !text || !text.trim()) {
      return NextResponse.json({ error: "Conversation ID and message content are required." }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.id,
        text: text.trim(),
      },
      include: {
        sender: {
          select: { name: true, role: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error("Send Message Error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
