import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/favorites/sync - Bulk sync guest favorites from localStorage upon login
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { businessIds } = await req.json();
    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    let syncedCount = 0;
    for (const businessId of businessIds) {
      try {
        const existing = await prisma.businessFavorite.findUnique({
          where: {
            userId_businessId: {
              userId: session.id,
              businessId,
            },
          },
        });

        if (!existing) {
          await prisma.businessFavorite.create({
            data: {
              userId: session.id,
              businessId,
              notifyOnNewListing: true,
            },
          });
          await prisma.businessProfile.update({
            where: { id: businessId },
            data: { favoritesCount: { increment: 1 } },
          }).catch(() => {});
          syncedCount++;
        }
      } catch (err) {
        // Continue loop for other items
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount,
      message: `Successfully synced ${syncedCount} saved item(s) to your account!`,
    });
  } catch (error: any) {
    console.error("POST Favorites Sync API Error:", error);
    return NextResponse.json({ error: "Failed to sync guest favorites." }, { status: 500 });
  }
}
