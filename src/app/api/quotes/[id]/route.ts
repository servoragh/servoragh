import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body; // ACCEPT or REJECT

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        request: true,
        provider: {
          select: { name: true, phone: true },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    if (quote.request.customerId !== session.id) {
      return NextResponse.json({ error: "Only the customer who posted this request can accept or reject quotes." }, { status: 403 });
    }

    if (action === "ACCEPT") {
      // Accept this quote
      await prisma.quote.update({
        where: { id },
        data: { status: "ACCEPTED" },
      });

      // Update request to IN_PROGRESS
      await prisma.serviceRequest.update({
        where: { id: quote.requestId },
        data: { status: "IN_PROGRESS" },
      });

      // Increment completed jobs count for provider profile
      await prisma.providerProfile.updateMany({
        where: { userId: quote.providerId },
        data: {
          completedJobsCount: { increment: 1 },
        },
      });

      // Notify provider
      await prisma.notification.create({
        data: {
          userId: quote.providerId,
          title: "🎉 Quote Accepted!",
          message: `Your quote of GH₵ ${quote.price} for "${quote.request.title}" was accepted! You can now call or WhatsApp the customer.`,
          link: `/requests/${quote.requestId}`,
        },
      });

      return NextResponse.json({
        success: true,
        status: "ACCEPTED",
        providerContact: quote.provider.phone,
      });
    } else if (action === "REJECT") {
      await prisma.quote.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({ success: true, status: "REJECTED" });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Quote Action Error:", error);
    return NextResponse.json({ error: "Failed to update quote status." }, { status: 500 });
  }
}
