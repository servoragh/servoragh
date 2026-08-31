import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/timeFormatter";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessSlug = searchParams.get("businessSlug");
    const userId = searchParams.get("userId");

    if (!businessSlug && !userId) {
      return NextResponse.json({ error: "businessSlug or userId required." }, { status: 400 });
    }

    let isOnline = false;
    let lastSeen: Date | null = null;
    let businessHours: any = null;
    let businessName = "";

    if (businessSlug) {
      const biz = await prisma.businessProfile.findUnique({
        where: { slug: businessSlug },
        select: {
          businessName: true,
          isOnline: true,
          lastSeen: true,
          businessHours: true,
        },
      });

      if (biz) {
        isOnline = biz.isOnline;
        lastSeen = biz.lastSeen;
        businessHours = biz.businessHours;
        businessName = biz.businessName;
      }
    } else if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          isOnline: true,
          lastSeen: true,
          businessProfile: {
            select: { businessHours: true },
          },
        },
      });

      if (user) {
        isOnline = user.isOnline;
        lastSeen = user.lastSeen;
        businessName = user.name;
        businessHours = user.businessProfile?.businessHours || null;
      }
    }

    // Evaluate Realtime Active Status (Considered online if heartbeat within last 3 minutes)
    const threeMinsAgo = new Date(Date.now() - 3 * 60 * 1000);
    const isOnlineNow = isOnline && lastSeen && lastSeen > threeMinsAgo;

    return NextResponse.json({
      success: true,
      businessName,
      isOnlineNow,
      lastSeen: lastSeen ? lastSeen.toISOString() : null,
      relativeLastSeen: lastSeen ? formatRelativeTime(lastSeen) : "Offline",
      businessHours,
    });
  } catch (error: any) {
    console.error("Presence Status Error:", error);
    return NextResponse.json({ error: "Failed to fetch presence status." }, { status: 500 });
  }
}
