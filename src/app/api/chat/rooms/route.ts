import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");

    // Fetch user's room memberships
    const memberships = await prisma.chatParticipant.findMany({
      where: {
        userId: session.id,
        ...(scope ? { room: { scope } } : {}),
      },
      include: {
        room: {
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
                      select: {
                        businessName: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { room: { updatedAt: "desc" } },
    });

    const rooms = memberships.map((m) => ({
      id: m.room.id,
      scope: m.room.scope,
      title: m.room.title,
      productId: m.room.productId,
      orderId: m.room.orderId,
      status: m.room.status,
      unreadCount: m.unreadCount,
      role: m.role,
      updatedAt: m.room.updatedAt,
      lastMessage: m.room.messages[0] || null,
      participants: m.room.participants.map((p) => ({
        id: p.user.id,
        name: p.user.providerProfile?.businessName || p.user.name,
        role: p.role,
        avatarUrl: p.user.avatarUrl,
      })),
    }));

    return NextResponse.json({ rooms });
  } catch (error: any) {
    console.error("Fetch Rooms Error:", error);
    return NextResponse.json({ error: "Failed to fetch chat channels." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { scope = "C2B", recipientId, title, productId, orderId } = body;

    // Check if channel room already exists between these participants for given context
    if (recipientId) {
      const existingRoom = await prisma.chatRoom.findFirst({
        where: {
          scope,
          ...(productId ? { productId } : {}),
          ...(orderId ? { orderId } : {}),
          participants: {
            every: {
              userId: { in: [session.id, recipientId] },
            },
          },
        },
        include: { participants: true },
      });

      if (existingRoom && existingRoom.participants.length >= 2) {
        return NextResponse.json({ success: true, room: existingRoom });
      }
    }

    // Determine roles
    const userRole = session.role === "PROVIDER" ? "VENDOR" : session.role === "ADMIN" ? "ADMIN_MEDIATOR" : "BUYER";

    // Create new ChatRoom
    const newRoom = await prisma.chatRoom.create({
      data: {
        scope,
        title: title || `Channel: ${scope}`,
        productId,
        orderId,
        status: "OPEN",
        participants: {
          create: [
            {
              userId: session.id,
              role: userRole,
            },
            ...(recipientId && recipientId !== session.id
              ? [
                  {
                    userId: recipientId,
                    role: scope.includes("ADMIN") ? "ADMIN_MEDIATOR" : "VENDOR",
                  },
                ]
              : []),
          ],
        },
      },
      include: {
        participants: true,
      },
    });

    return NextResponse.json({ success: true, room: newRoom });
  } catch (error: any) {
    console.error("Create Room Error:", error);
    return NextResponse.json({ error: "Failed to create chat channel." }, { status: 500 });
  }
}
