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
      return NextResponse.json({ error: "Please log in to write a customer review." }, { status: 401 });
    }

    const userId = session.id;
    const body = await request.json();
    const { rating, title, comment, photos } = body;

    const ratingNum = Math.min(5, Math.max(1, parseInt(String(rating || 5), 10)));
    if (!comment || !String(comment).trim()) {
      return NextResponse.json({ error: "Review comment is required." }, { status: 400 });
    }

    // Resolve Product
    const listing: any = await prisma.productListing.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true, businessId: true, sellerId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    const productId = listing.id;
    const reviewPhotos = Array.isArray(photos) ? photos.filter((p: any) => typeof p === "string" && p.startsWith("http")) : [];

    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ProductReview" ("id", "productId", "userId", "rating", "title", "comment", "photos", "isVerified", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())`,
      reviewId,
      productId,
      userId,
      ratingNum,
      title ? String(title).trim() : "Verified Purchase Review",
      String(comment).trim(),
      reviewPhotos
    );

    // Update Business Profile ratingAverage and reviewsCount if associated
    if (listing.businessId) {
      const avgRows = (await prisma.$queryRawUnsafe(
        `SELECT AVG(rating)::float as avg, COUNT(*)::int as count FROM "ProductReview" WHERE "productId" = $1`,
        productId
      ).catch(() => [])) as any[];

      if (avgRows.length > 0 && avgRows[0].count > 0) {
        const newAvg = Number(avgRows[0].avg.toFixed(1));
        await prisma.$executeRawUnsafe(
          `UPDATE "BusinessProfile" SET "ratingAverage" = $1, "reviewsCount" = "reviewsCount" + 1 WHERE "id" = $2`,
          newAvg,
          listing.businessId
        ).catch(() => null);
      }
    }

    return NextResponse.json({
      success: true,
      review: {
        id: reviewId,
        productId,
        userId,
        rating: ratingNum,
        title: title ? String(title).trim() : "Verified Purchase Review",
        comment: String(comment).trim(),
        photos: reviewPhotos,
        isVerified: true,
        createdAt: new Date(),
        author: {
          name: session.name || "Servora Customer",
          avatarUrl: session.avatarUrl || null,
        },
      },
    });
  } catch (error: any) {
    console.error("Product Review Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review." }, { status: 500 });
  }
}
