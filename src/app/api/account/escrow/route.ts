import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const escrowDeals = await prisma.escrowDeal.findMany({
      where: {
        OR: [{ customerId: session.id }, { providerId: session.id }],
      },
      include: {
        provider: {
          select: { id: true, name: true, phone: true, avatarUrl: true },
        },
        customer: {
          select: { id: true, name: true, phone: true, avatarUrl: true },
        },
        serviceRequest: true,
        disputes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalVaultHeld = escrowDeals
      .filter((e) => e.status === "FUNDS_HELD_IN_VAULT" || e.status === "IN_PROGRESS" || e.status === "AWAITING_RELEASE")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return NextResponse.json({
      escrowDeals,
      totalVaultHeld,
      activeCount: escrowDeals.filter((e) => e.status !== "COMPLETED" && e.status !== "REFUNDED").length,
    });
  } catch (error: any) {
    console.error("Escrow GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch escrow deals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, dealId, releasePin, reason, providerId, serviceRequestId, title, amount, paymentMethod } = body;

    // 1. CREATE NEW ESCROW DEAL
    if (action === "CREATE_ESCROW_DEAL") {
      if (!providerId || !amount) {
        return NextResponse.json({ error: "Provider and amount are required" }, { status: 400 });
      }

      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const dealCode = `ESC-${randomDigits}`;
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

      const newDeal = await prisma.escrowDeal.create({
        data: {
          dealCode,
          customerId: session.id,
          providerId,
          serviceRequestId: serviceRequestId || null,
          title: title || "Artisan Service Escrow Contract",
          amount: parseFloat(amount),
          platformFee: parseFloat(amount) * 0.025, // 2.5% platform escrow fee
          status: "FUNDS_HELD_IN_VAULT",
          paymentMethod: paymentMethod || "MTN_MOMO",
          releasePin: generatedPin,
          timelineJson: JSON.stringify([
            {
              event: "ESCROW_DEPOSIT_CONFIRMED",
              description: `GH₵ ${amount} held in secure Servora MoMo vault via ${paymentMethod || "MTN MoMo"}.`,
              timestamp: new Date().toISOString(),
              actor: session.name || "Customer",
            },
          ]),
          milestonesJson: JSON.stringify([
            { step: "Deposit Secured", done: true, time: new Date().toISOString() },
            { step: "Artisan Starts Work", done: false },
            { step: "Customer Inspects & Approves", done: false },
            { step: "Funds Released to MoMo", done: false },
          ]),
        },
      });

      // Log activity
      await prisma.userActivityLog.create({
        data: {
          userId: session.id,
          actionType: "ESCROW_DEPOSIT",
          description: `Secured GH₵ ${amount} in Escrow vault for ${title || "Service"} (${dealCode})`,
          entityId: newDeal.id,
          entityType: "ESCROW",
        },
      }).catch(() => null);

      return NextResponse.json({ success: true, deal: newDeal });
    }

    // 2. RELEASE FUNDS TO ARTISAN
    if (action === "RELEASE_FUNDS") {
      if (!dealId) {
        return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
      }

      const deal = await prisma.escrowDeal.findUnique({
        where: { id: dealId },
      });

      if (!deal) {
        return NextResponse.json({ error: "Escrow deal not found" }, { status: 404 });
      }

      if (deal.customerId !== session.id && session.role !== "ADMIN") {
        return NextResponse.json({ error: "Only the buyer or admin can release escrow funds" }, { status: 403 });
      }

      const updated = await prisma.escrowDeal.update({
        where: { id: dealId },
        data: {
          status: "COMPLETED",
        },
      });

      // Log activity
      await prisma.userActivityLog.create({
        data: {
          userId: session.id,
          actionType: "RELEASED_FUNDS",
          description: `Released GH₵ ${deal.amount} from Escrow to artisan for deal ${deal.dealCode}`,
          entityId: deal.id,
          entityType: "ESCROW",
        },
      }).catch(() => null);

      return NextResponse.json({ success: true, deal: updated });
    }

    // 3. ESCALATE TO MEDIATION / DISPUTE
    if (action === "REQUEST_MEDIATION") {
      if (!dealId) {
        return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
      }

      const deal = await prisma.escrowDeal.findUnique({
        where: { id: dealId },
      });

      if (!deal) {
        return NextResponse.json({ error: "Escrow deal not found" }, { status: 404 });
      }

      const randomCase = Math.floor(1000 + Math.random() * 9000);
      const caseNumber = `DSP-${randomCase}`;

      // Update escrow deal status to DISPUTED
      await prisma.escrowDeal.update({
        where: { id: dealId },
        data: { status: "DISPUTED" },
      });

      const dispute = await prisma.dispute.create({
        data: {
          caseNumber,
          escrowDealId: deal.id,
          customerId: deal.customerId,
          providerId: deal.providerId,
          amount: deal.amount,
          status: "UNDER_REVIEW",
          reason: reason || "Escrow hold dispute / Incomplete job",
          description: reason || "Customer requested mediation hold on funds.",
        },
      });

      // Log activity
      await prisma.userActivityLog.create({
        data: {
          userId: session.id,
          actionType: "OPENED_DISPUTE",
          description: `Filed dispute ${caseNumber} for Escrow deal ${deal.dealCode}`,
          entityId: dispute.id,
          entityType: "DISPUTE",
        },
      }).catch(() => null);

      return NextResponse.json({ success: true, dispute });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Escrow Action Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process escrow action" }, { status: 500 });
  }
}
