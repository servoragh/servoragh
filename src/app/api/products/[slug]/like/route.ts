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

    const userId = session.id;

    // Resolve Product ID
    const listing: any = await prisma.productListing.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true, likesCount: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    const productId = listing.id;

    // Check if like exists
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM "ProductLike" WHERE "productId" = $1 AND "userId" = $2 LIMIT 1`,
      productId,
      userId
    );

    let isLiked = false;
    let newLikesCount = listing.likesCount || 0;

    if (existing.length > 0) {
      // Unlike
      await prisma.$executeRawUnsafe(
        `DELETE FROM "ProductLike" WHERE "productId" = $1 AND "userId" = $2`,
        productId,
        userId
      );
      newLikesCount = Math.max(0, newLikesCount - 1);
      isLiked = false;
    } else {
      // Like
      const likeId = `like_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO "ProductLike" ("id", "productId", "userId") VALUES ($1, $2, $3)`,
        likeId,
        productId,
        userId
      );
      newLikesCount = newLikesCount + 1;
      isLiked = true;
    }

    // Update count on listing
    await prisma.$executeRawUnsafe(
      `UPDATE "ProductListing" SET "likesCount" = $1 WHERE "id" = $2`,
      newLikesCount,
      productId
    );

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
