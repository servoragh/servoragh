import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Please log in to answer questions." }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, answerText } = body;

    if (!questionId || !answerText || !String(answerText).trim()) {
      return NextResponse.json({ error: "Question ID and answer text are required." }, { status: 400 });
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
      return NextResponse.json({ error: "Merchant profile not found." }, { status: 404 });
    }

    const userId = user.id;
    const businessId = user.businessProfile?.id;

    // 2. Fetch Question with Product
    const question = await prisma.productQuestion.findUnique({
      where: { id: questionId },
      include: {
        product: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    // Verify ownership
    const isOwner = question.product.sellerId === userId || 
                    (businessId && question.product.businessId === businessId) ||
                    user.role === "ADMIN";

    if (!isOwner) {
      return NextResponse.json({ error: "You are not authorized to answer questions for this product." }, { status: 403 });
    }

    // 3. Update Question with Answer
    const now = new Date();
    const updated = await prisma.productQuestion.update({
      where: { id: questionId },
      data: {
        answer: String(answerText).trim(),
        answeredBy: user.businessProfile?.businessName || user.name || "Verified Merchant",
        answeredAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Answer published to product Q&A thread!",
      question: updated,
    });
  } catch (error: any) {
    console.error("Merchant Question Answer Error:", error);
    return NextResponse.json({ error: "Failed to answer question." }, { status: 500 });
  }
}
