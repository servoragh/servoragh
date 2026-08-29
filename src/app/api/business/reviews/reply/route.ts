import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Please log in to reply to customer reviews." }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, replyText } = body;

    if (!reviewId || !replyText || !String(replyText).trim()) {
      return NextResponse.json({ error: "Review ID and reply text are required." }, { status: 400 });
    }

    // 1. Resolve User
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.id },
          { phone: session.phone },
          { phone: session.phone.replace("+233", "0") },
          { phone: "+233" + session.phone.replace(/^0/, "") },
        ],
      },
      include: {
        businessProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Merchant user profile not found." }, { status: 404 });
    }

    const userId = user.id;
    const businessId = user.businessProfile?.id;

    // 2. Fetch Review with Product
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
      include: {
        product: true,
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    // Verify ownership
    const isOwner = review.product.sellerId === userId || 
                    (businessId && review.product.businessId === businessId) ||
                    user.role === "ADMIN";

    if (!isOwner) {
      return NextResponse.json({ error: "You are not authorized to reply to reviews for this product." }, { status: 403 });
    }

    // 3. Update Review with Seller Reply
    const now = new Date();
    await prisma.$executeRawUnsafe(`
      UPDATE "ProductReview"
      SET "sellerReply" = $1, "sellerRepliedAt" = $2
      WHERE id = $3
    `, String(replyText).trim(), now, reviewId);

    return NextResponse.json({
      success: true,
      message: "Merchant reply posted successfully!",
      sellerReply: String(replyText).trim(),
      sellerRepliedAt: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Merchant Review Reply Error:", error);
    return NextResponse.json({ error: "Failed to post review reply." }, { status: 500 });
  }
}
