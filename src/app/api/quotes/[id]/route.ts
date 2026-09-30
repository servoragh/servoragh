import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/quotes/[id]
// Actions: ACCEPT (customer), PROVIDER_CONFIRM (provider), REJECT (customer)
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
    const { action } = body; // ACCEPT | PROVIDER_CONFIRM | REJECT

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        request: { select: { id: true, customerId: true, title: true } },
        provider: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    // ── Customer accepts the quote ──────────────────────────────
    if (action === "ACCEPT") {
      if (quote.request.customerId !== session.id) {
        return NextResponse.json({ error: "Only the request owner can accept quotes." }, { status: 403 });
      }

      await prisma.quote.update({
        where: { id },
        data: {
          status: "CUSTOMER_ACCEPTED",
          customerAcceptedAt: new Date(),
        },
      });

      // Update request status to show it's being negotiated
      await prisma.serviceRequest.update({
        where: { id: quote.requestId },
        data: { status: "OFFER_ACCEPTED" },
      });

      // Notify provider to confirm
      await prisma.notification.create({
        data: {
          userId: quote.providerId,
          title: "🎉 Customer accepted your offer!",
          message: `The customer accepted your GH₵ ${quote.price} quote for "${quote.request.title}". Please confirm you're ready to take the job.`,
          link: `/requests/${quote.requestId}`,
        },
      });

      return NextResponse.json({
        success: true,
        status: "CUSTOMER_ACCEPTED",
        message: "Offer accepted! Waiting for provider to confirm they're ready.",
      });
    }

    // ── Provider confirms they are taking the job ───────────────
    if (action === "PROVIDER_CONFIRM") {
      if (quote.providerId !== session.id) {
        return NextResponse.json({ error: "Only the provider can confirm this quote." }, { status: 403 });
      }

      if (quote.status !== "CUSTOMER_ACCEPTED") {
        return NextResponse.json({ error: "Customer must accept the offer first." }, { status: 400 });
      }

      await prisma.quote.update({
        where: { id },
        data: {
          status: "ACCEPTED",
          providerConfirmedAt: new Date(),
        },
      });

      // Move request to IN_PROGRESS and effectively "take it off the board"
      await prisma.serviceRequest.update({
        where: { id: quote.requestId },
        data: { status: "IN_PROGRESS" },
      });

      // Reject all other pending quotes
      await prisma.quote.updateMany({
        where: { requestId: quote.requestId, id: { not: id }, status: "PENDING" },
        data: { status: "REJECTED" },
      });

      // Update provider stats
      await prisma.providerProfile.updateMany({
        where: { userId: quote.providerId },
        data: { completedJobsCount: { increment: 1 } },
      });

      // Notify customer the job is confirmed and in progress
      await prisma.notification.create({
        data: {
          userId: quote.request.customerId,
          title: "✅ Job Confirmed & In Progress!",
          message: `${quote.provider.name} confirmed they are taking your job "${quote.request.title}". Direct phone: ${quote.provider.phone}`,
          link: `/requests/${quote.requestId}`,
        },
      });

      return NextResponse.json({
        success: true,
        status: "ACCEPTED",
        providerContact: quote.provider.phone,
        message: "Job confirmed! Both parties have agreed. Contact details unlocked.",
      });
    }

    // ── Customer rejects a quote ────────────────────────────────
    if (action === "REJECT") {
      if (quote.request.customerId !== session.id) {
        return NextResponse.json({ error: "Only the request owner can reject quotes." }, { status: 403 });
      }

      await prisma.quote.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({ success: true, status: "REJECTED" });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Quote Action Error:", error);
    return NextResponse.json({ error: "Failed to update quote." }, { status: 500 });
  }
}
