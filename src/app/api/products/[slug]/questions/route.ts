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

    const userId = session.id;
    const body = await request.json();
    const { question, questionId, answer } = body;

    // Resolve Product ID
    const listing: any = await prisma.productListing.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true, sellerId: true, businessId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    const productId = listing.id;

    // If answering existing question
    if (questionId && answer) {
      await prisma.$executeRawUnsafe(
        `UPDATE "ProductQuestion" 
         SET "answer" = $1, "answeredBy" = $2, "answeredAt" = NOW()
         WHERE "id" = $3 AND "productId" = $4`,
        String(answer).trim(),
        session.name || "Verified Seller",
        questionId,
        productId
      );

      return NextResponse.json({
        success: true,
        message: "Question answered successfully!",
      });
    }

    // Creating new question
    if (!question || !String(question).trim()) {
      return NextResponse.json({ error: "Question text is required." }, { status: 400 });
    }

    const qId = `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ProductQuestion" ("id", "productId", "userId", "question", "createdAt")
       VALUES ($1, $2, $3, $4, NOW())`,
      qId,
      productId,
      userId,
      String(question).trim()
    );

    return NextResponse.json({
      success: true,
      question: {
        id: qId,
        productId,
        userId,
        question: String(question).trim(),
        answer: null,
        answeredBy: null,
        answeredAt: null,
        createdAt: new Date(),
        asker: {
          name: session.name || "Customer Member",
          avatarUrl: session.avatarUrl || null,
          role: session.role || "CUSTOMER",
        },
      },
    });
  } catch (error: any) {
    console.error("Product Question Error:", error);
    return NextResponse.json({ error: error.message || "Failed to post question." }, { status: 500 });
  }
}
