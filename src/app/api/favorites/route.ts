import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolveBusinessId(rawIdOrSlug: string): Promise<string | null> {
  if (!rawIdOrSlug) return null;

  // 1. Check if it matches a BusinessProfile id directly
  const byId = await prisma.businessProfile.findUnique({
    where: { id: rawIdOrSlug },
    select: { id: true },
  });
  if (byId) return byId.id;

  // 2. Check if it matches a BusinessProfile slug
  const bySlug = await prisma.businessProfile.findUnique({
    where: { slug: rawIdOrSlug },
    select: { id: true },
  });
  if (bySlug) return bySlug.id;

  // 3. Check if it matches a ProviderProfile id
  const byProvId = await prisma.providerProfile.findUnique({
    where: { id: rawIdOrSlug },
    include: {
      user: {
        include: { businessProfile: true },
      },
    },
  });
  if (byProvId) {
    if (byProvId.user.businessProfile) {
      return byProvId.user.businessProfile.id;
    }
    const newBiz = await prisma.businessProfile.create({
      data: {
        userId: byProvId.userId,
        businessName: byProvId.businessName,
        slug: byProvId.slug,
        phone: byProvId.user.phone || "+233240000000",
        whatsappNumber: byProvId.user.phone || "+233240000000",
        description: byProvId.bio,
        zone: byProvId.serviceArea.split(",")[0].trim(),
        ratingAverage: byProvId.ratingAverage,
        reviewsCount: byProvId.reviewCount,
        verificationStatus: byProvId.verificationStatus === "VERIFIED" ? "TIER_2_VERIFIED_ARTISAN" : "UNVERIFIED",
        logoUrl: byProvId.logoUrl || byProvId.user.avatarUrl,
      },
    });
    return newBiz.id;
  }

  // 4. Check if it matches a ProviderProfile slug
  const byProvSlug = await prisma.providerProfile.findUnique({
    where: { slug: rawIdOrSlug },
    include: {
      user: {
        include: { businessProfile: true },
      },
    },
  });
  if (byProvSlug) {
    if (byProvSlug.user.businessProfile) {
      return byProvSlug.user.businessProfile.id;
    }
    const newBiz = await prisma.businessProfile.create({
      data: {
        userId: byProvSlug.userId,
        businessName: byProvSlug.businessName,
        slug: byProvSlug.slug,
        phone: byProvSlug.user.phone || "+233240000000",
        whatsappNumber: byProvSlug.user.phone || "+233240000000",
        description: byProvSlug.bio,
        zone: byProvSlug.serviceArea.split(",")[0].trim(),
        ratingAverage: byProvSlug.ratingAverage,
        reviewsCount: byProvSlug.reviewCount,
        verificationStatus: byProvSlug.verificationStatus === "VERIFIED" ? "TIER_2_VERIFIED_ARTISAN" : "UNVERIFIED",
        logoUrl: byProvSlug.logoUrl || byProvSlug.user.avatarUrl,
      },
    });
    return newBiz.id;
  }

  return null;
}

// GET /api/favorites - Get saved favorites for current user or check specific business status
export async function GET(req: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const rawBusinessId = searchParams.get("businessId");

    if (!session) {
      return NextResponse.json({
        isAuthenticated: false,
        favorites: [],
        isFavorited: false,
      });
    }

    if (rawBusinessId) {
      const resolvedId = await resolveBusinessId(rawBusinessId);
      if (!resolvedId) {
        return NextResponse.json({
          isAuthenticated: true,
          isFavorited: false,
          favorite: null,
        });
      }

      const fav = await prisma.businessFavorite.findUnique({
        where: {
          userId_businessId: {
            userId: session.id,
            businessId: resolvedId,
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
        { error: "Unauthorized. Please log in to sync favorites across devices.", requiresAuth: true, isFavorited: false },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { businessId: rawBusinessId, action, notifyOnNewListing } = body;

    if (!rawBusinessId) {
      return NextResponse.json({ error: "Missing businessId parameter." }, { status: 400 });
    }

    const resolvedBusinessId = await resolveBusinessId(rawBusinessId);
    if (!resolvedBusinessId) {
      return NextResponse.json({ error: "Target business not found." }, { status: 404 });
    }

    const existing = await prisma.businessFavorite.findUnique({
      where: {
        userId_businessId: {
          userId: session.id,
          businessId: resolvedBusinessId,
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
        where: { id: resolvedBusinessId },
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
          businessId: resolvedBusinessId,
          notifyOnNewListing: notifyOnNewListing ?? true,
        },
      });

      await prisma.businessProfile.update({
        where: { id: resolvedBusinessId },
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
