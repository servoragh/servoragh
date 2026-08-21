import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/favorites - Get saved favorites for current user or check specific business status
export async function GET(req: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!session) {
      return NextResponse.json({
        isAuthenticated: false,
        favorites: [],
        isFavorited: false,
      });
    }

    if (businessId) {
      const fav = await prisma.businessFavorite.findUnique({
        where: {
          userId_businessId: {
            userId: session.id,
            businessId,
          },
        },
      });
      return NextResponse.json({
        isAuthenticated: true,
        isFavorited: !!fav,
        favorite: fav,
      });
    }

    const favorites = await prisma.businessFavorite.findMany({
      where: { userId: session.id },
      include: {
        business: {
          include: {
            products: {
              where: { status: "ACTIVE" },
              take: 5,
            },
            rentals: {
              where: { isAvailable: true },
              take: 5,
            },
            services: {
              where: { isActive: true },
              take: 5,
            },
            user: {
              select: {
                name: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      isAuthenticated: true,
      favorites,
    });
  } catch (error: any) {
    console.error("GET Favorites API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites.", isAuthenticated: false, favorites: [] },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Toggle favorite or update alert settings
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to save favorites.", requiresAuth: true },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { businessId, action, notifyOnNewListing } = body;

    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId parameter." }, { status: 400 });
    }

    const existing = await prisma.businessFavorite.findUnique({
      where: {
        userId_businessId: {
          userId: session.id,
          businessId,
        },
      },
    });

    // Action: update settings only
    if (action === "update_settings" && existing) {
      const updated = await prisma.businessFavorite.update({
        where: { id: existing.id },
        data: {
          notifyOnNewListing: notifyOnNewListing ?? existing.notifyOnNewListing,
        },
      });
      return NextResponse.json({
        success: true,
        isFavorited: true,
        favorite: updated,
        message: "Notification preferences updated.",
      });
    }

    if (existing) {
      // Remove favorite
      await prisma.businessFavorite.delete({
        where: { id: existing.id },
      });

      await prisma.businessProfile.update({
        where: { id: businessId },
        data: { favoritesCount: { decrement: 1 } },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        isFavorited: false,
        message: "Removed business from saved favorites.",
      });
    } else {
      // Add favorite
      const created = await prisma.businessFavorite.create({
        data: {
          userId: session.id,
          businessId,
          notifyOnNewListing: notifyOnNewListing ?? true,
        },
      });

      await prisma.businessProfile.update({
        where: { id: businessId },
        data: { favoritesCount: { increment: 1 } },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        isFavorited: true,
        favorite: created,
        message: "Saved business to your favorites!",
      });
    }
  } catch (error: any) {
    console.error("POST Favorites API Error:", error);
    return NextResponse.json({ error: "Failed to update favorite status." }, { status: 500 });
  }
}
