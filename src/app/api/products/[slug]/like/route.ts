import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ error: "Please log in to like this item." }, { status: 401 });
    }

    const cleanSlug = decodeURIComponent(slug).trim();
    const cleanIdOrSlug = cleanSlug.replace(/^(leg-prod-|prod-|rent-)/, "");

    // 1. Resolve User in Database (supports session ID and phone fallback)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.id },
          { phone: session.phone },
          { phone: session.phone.replace("+233", "0") },
          { phone: "+233" + session.phone.replace(/^0/, "") },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found. Please log in." }, { status: 401 });
    }

    const userId = user.id;

    // 2. Resolve Product in ProductListing
    const listing = await prisma.productListing.findFirst({
      where: {
        OR: [
          { slug: { equals: cleanSlug, mode: "insensitive" } },
          { id: cleanSlug },
          { slug: { equals: cleanIdOrSlug, mode: "insensitive" } },
          { id: cleanIdOrSlug },
        ],
      },
      select: { id: true, likesCount: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Product listing not found." }, { status: 404 });
    }

    const productId = listing.id;

    // 3. Check if like exists using Prisma ORM
    const existing = await prisma.productLike.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    }).catch(() => null);

    let isLiked = false;
    let newLikesCount = listing.likesCount || 0;

    if (existing) {
      // Unlike
      await prisma.productLike.delete({
        where: { id: existing.id },
      });
      newLikesCount = Math.max(0, newLikesCount - 1);
      isLiked = false;
    } else {
      // Like
      await prisma.productLike.create({
        data: {
          productId,
          userId,
        },
      });
      newLikesCount = newLikesCount + 1;
      isLiked = true;
    }

    // Update likesCount on product listing
    await prisma.productListing.update({
      where: { id: productId },
      data: { likesCount: newLikesCount },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount: newLikesCount,
    });
  } catch (error: any) {
    console.error("Product Like Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update like status." }, { status: 500 });
  }
}
