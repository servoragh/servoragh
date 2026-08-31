import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const now = new Date();

    // 1. Update User presence
    await prisma.user.update({
      where: { id: session.id },
      data: {
        isOnline: true,
        lastSeen: now,
      },
    });

    // 2. Update BusinessProfile presence if merchant
    const biz = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
    });

    if (biz) {
      await prisma.businessProfile.update({
        where: { id: biz.id },
        data: {
          isOnline: true,
          lastSeen: now,
        },
      });
    }

    return NextResponse.json({
      success: true,
      isOnline: true,
      lastSeen: now,
    });
  } catch (error: any) {
    console.error("Presence Heartbeat Error:", error);
    return NextResponse.json({ error: "Failed to update presence heartbeat." }, { status: 500 });
  }
}
