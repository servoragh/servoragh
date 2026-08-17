import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "PROVIDER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only verified providers can submit quotes." }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, price, estimatedHours, completionTime, message } = body;

    if (!requestId || !price || !message) {
      return NextResponse.json({ error: "Request ID, price estimate, and message are required." }, { status: 400 });
    }

    // Check if provider already quoted
    const existingQuote = await prisma.quote.findFirst({
      where: {
        requestId,
        providerId: session.id,
      },
    });

    if (existingQuote) {
      return NextResponse.json({ error: "You have already submitted a quote for this service request." }, { status: 400 });
    }

    const quote = await prisma.quote.create({
      data: {
        requestId,
        providerId: session.id,
        price: Number(price),
        estimatedHours: estimatedHours ? Number(estimatedHours) : null,
        completionTime: completionTime || "Same day",
        message,
        status: "PENDING",
      },
    });

    // Update service request status to QUOTED
    await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: "QUOTED" },
    });

    // Create chat conversation
    await prisma.conversation.create({
      data: {
        quoteId: quote.id,
        messages: {
          create: {
            senderId: session.id,
            text: `[Quote Submitted: GH₵ ${price}] ${message}`,
          },
        },
      },
    });

    // Notify customer
    const reqDetail = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: { customerId: true, title: true },
    });

    if (reqDetail) {
      await prisma.notification.create({
        data: {
          userId: reqDetail.customerId,
          title: "New Quote Received!",
          message: `A provider submitted a quote of GH₵ ${price} for your request "${reqDetail.title}".`,
          link: `/requests/${requestId}`,
        },
      });
    }

    return NextResponse.json({ success: true, quote });
  } catch (error: any) {
    console.error("Submit Quote Error:", error);
    return NextResponse.json({ error: "Failed to submit quote." }, { status: 500 });
  }
}
