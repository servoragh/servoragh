import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAndMaskCircumvention } from "@/lib/moderation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                avatarUrl: true,
                providerProfile: {
                  select: { businessName: true },
                },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Chat room not found." }, { status: 404 });
    }

    // Check participation
    const isParticipant = room.participants.some((p) => p.userId === session.id);
    const isAdmin = session.role === "ADMIN";

    if (!isParticipant && !isAdmin) {
      return NextResponse.json({ error: "Access denied to this channel." }, { status: 403 });
    }

    // Reset unread count for current user
    await prisma.chatParticipant.updateMany({
      where: { roomId: id, userId: session.id },
      data: { unreadCount: 0, lastReadAt: new Date() },
    });

    // Filter out internal notes if user is not admin
    const visibleMessages = room.messages.filter((m) => !m.isInternalNote || isAdmin);

    return NextResponse.json({
      room: {
        ...room,
        messages: visibleMessages,
      },
    });
  } catch (error: any) {
    console.error("Get Room Messages Error:", error);
    return NextResponse.json({ error: "Failed to fetch room messages." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content, attachments = [], isInternalNote = false } = body;

    if (!content && attachments.length === 0) {
      return NextResponse.json({ error: "Message content or attachments required." }, { status: 400 });
    }

    // Run Anti-Circumvention Filter
    const moderation = checkAndMaskCircumvention(content || "");

    // Create Moderation Audit Log if circumvention was flagged
    if (moderation.wasFlagged) {
      await prisma.moderationLog.create({
        data: {
          roomId: id,
          senderId: session.id,
          flaggedText: content,
          reason: moderation.reason || "CIRCUMVENTION_DETECTED",
          actionTaken: "MASKED",
        },
      });
    }

    // Create Chat Message
    const message = await prisma.chatMessage.create({
      data: {
        roomId: id,
        senderId: session.id,
        content: moderation.cleanContent,
        attachments: JSON.stringify(attachments),
        isInternalNote: Boolean(isInternalNote && session.role === "ADMIN"),
        status: "SENT",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update Room timestamp
    await prisma.chatRoom.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Increment unread count for other participants
    await prisma.chatParticipant.updateMany({
      where: {
        roomId: id,
        userId: { not: session.id },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, message, moderationFlagged: moderation.wasFlagged });
  } catch (error: any) {
    console.error("Post Message Error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
