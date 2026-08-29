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
      return NextResponse.json({ error: "Please log in to ask or answer questions." }, { status: 401 });
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
    const { question, questionId, answer } = body;

    // 2. Resolve Product ID
    const listing = await prisma.productListing.findFirst({
      where: {
        OR: [
          { slug: { equals: cleanSlug, mode: "insensitive" } },
          { id: cleanSlug },
          { slug: { equals: cleanIdOrSlug, mode: "insensitive" } },
          { id: cleanIdOrSlug },
        ],
      },
      select: { id: true, sellerId: true, businessId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Product listing not found." }, { status: 404 });
    }

    const productId = listing.id;

    // If answering existing question
    if (questionId && answer) {
      await prisma.productQuestion.update({
        where: { id: questionId },
        data: {
          answer: String(answer).trim(),
          answeredBy: session.name || "Verified Seller",
          answeredAt: new Date(),
        },
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        message: "Question answered successfully!",
      });
    }

    // Creating new question
    if (!question || !String(question).trim()) {
      return NextResponse.json({ error: "Question text is required." }, { status: 400 });
    }

    const createdQ = await prisma.productQuestion.create({
      data: {
        productId,
        userId,
        question: String(question).trim(),
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      question: {
        id: createdQ.id,
        productId,
        userId,
        question: createdQ.question,
        answer: createdQ.answer,
        answeredBy: createdQ.answeredBy,
        answeredAt: createdQ.answeredAt,
        createdAt: createdQ.createdAt,
        asker: {
          name: createdQ.user?.name || user.name || "Customer Member",
          avatarUrl: createdQ.user?.avatarUrl || user.avatarUrl || null,
          role: createdQ.user?.role || user.role || "CUSTOMER",
        },
      },
    });
  } catch (error: any) {
    console.error("Product Question Error:", error);
    return NextResponse.json({ error: error.message || "Failed to post question." }, { status: 500 });
  }
}
