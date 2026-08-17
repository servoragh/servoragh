import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID required." }, { status: 400 });
    }

    const qas = await prisma.productQA.findMany({
      where: { productId },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        answeredBy: {
          select: { id: true, name: true, providerProfile: { select: { businessName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ qas });
  } catch (error: any) {
    console.error("Fetch Product QAs Error:", error);
    return NextResponse.json({ error: "Failed to fetch Product Q&A threads." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please sign in to ask a question." }, { status: 401 });
    }

    const body = await request.json();
    const { productId, question, qaId, answer } = body;

    // 1. Answer Existing Question
    if (qaId && answer) {
      const existingQA = await prisma.productQA.findUnique({ where: { id: qaId } });
      if (!existingQA) {
        return NextResponse.json({ error: "Q&A thread not found." }, { status: 404 });
      }

      const updatedQA = await prisma.productQA.update({
        where: { id: qaId },
        data: {
          answer,
          answeredById: session.id,
        },
      });

      return NextResponse.json({ success: true, qa: updatedQA });
    }

    // 2. Post New Question
    if (!productId || !question) {
      return NextResponse.json({ error: "Product ID and question text required." }, { status: 400 });
    }

    const newQA = await prisma.productQA.create({
      data: {
        productId,
        authorId: session.id,
        question,
        isVerifiedBuyer: true,
      },
    });

    return NextResponse.json({ success: true, qa: newQA });
  } catch (error: any) {
    console.error("Post Q&A Error:", error);
    return NextResponse.json({ error: "Failed to post question." }, { status: 500 });
  }
}
