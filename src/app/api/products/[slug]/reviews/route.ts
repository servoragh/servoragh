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
    const body = await request.json();
    const { rating, title, comment, photos } = body;

    const ratingNum = Math.min(5, Math.max(1, parseInt(String(rating || 5), 10)));
    if (!comment || !String(comment).trim()) {
      return NextResponse.json({ error: "Review comment is required." }, { status: 400 });
    }

    // 2. Resolve Product
    const listing = await prisma.productListing.findFirst({
      where: {
        OR: [
          { slug: { equals: cleanSlug, mode: "insensitive" } },
          { id: cleanSlug },
          { slug: { equals: cleanIdOrSlug, mode: "insensitive" } },
          { id: cleanIdOrSlug },
        ],
      },
      select: { id: true, businessId: true, sellerId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Product listing not found." }, { status: 404 });
    }

    const productId = listing.id;
    const reviewPhotos = Array.isArray(photos) ? photos.filter((p: any) => typeof p === "string" && p.startsWith("http")) : [];

    // 3. Create Review with Prisma ORM
    const createdReview = await prisma.productReview.create({
      data: {
        productId,
        userId,
        rating: ratingNum,
        title: title ? String(title).trim() : "Verified Purchase Review",
        comment: String(comment).trim(),
        photos: reviewPhotos,
        isVerified: true,
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update Business Profile ratingAverage and reviewsCount if associated
    if (listing.businessId) {
      const avgAggregate = await prisma.productReview.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { id: true },
      }).catch(() => null);

      if (avgAggregate && avgAggregate._avg.rating) {
        const newAvg = Number(avgAggregate._avg.rating.toFixed(1));
        await prisma.businessProfile.update({
          where: { id: listing.businessId },
          data: {
            ratingAverage: newAvg,
            reviewsCount: { increment: 1 },
          },
        }).catch(() => null);
      }
    }

    return NextResponse.json({
      success: true,
      review: {
        id: createdReview.id,
        productId,
        userId,
        rating: ratingNum,
        title: createdReview.title || "Verified Purchase Review",
        comment: createdReview.comment,
        photos: createdReview.photos,
        isVerified: true,
        createdAt: createdReview.createdAt,
        author: {
          name: createdReview.user?.name || user.name || "Servora Customer",
          avatarUrl: createdReview.user?.avatarUrl || user.avatarUrl || null,
        },
      },
    });
  } catch (error: any) {
    console.error("Product Review Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review." }, { status: 500 });
  }
}
