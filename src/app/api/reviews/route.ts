import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to submit a review." }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, targetId, rating, comment } = body;

    if (!requestId || !targetId || !rating || !comment) {
      return NextResponse.json({ error: "Request ID, provider ID, rating (1-5), and comment are required." }, { status: 400 });
    }

    const ratingNum = Math.max(1, Math.min(5, Number(rating)));

    const review = await prisma.review.create({
      data: {
        requestId,
        authorId: session.id,
        targetId,
        rating: ratingNum,
        comment: comment.trim(),
        isApproved: true,
      },
    });

    // Recalculate provider average rating & review count
    const allTargetReviews = await prisma.review.findMany({
      where: { targetId, isApproved: true },
      select: { rating: true },
    });

    const totalCount = allTargetReviews.length;
    const sum = allTargetReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = totalCount > 0 ? Number((sum / totalCount).toFixed(1)) : 0;

    await prisma.providerProfile.updateMany({
      where: { userId: targetId },
      data: {
        ratingAverage: avg,
        reviewCount: totalCount,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Create Review Error:", error);
    return NextResponse.json({ error: "Failed to post review." }, { status: 500 });
  }
}
