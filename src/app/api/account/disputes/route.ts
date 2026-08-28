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

    const disputes = await prisma.dispute.findMany({
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
        escrowDeal: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ disputes });
  } catch (error: any) {
    console.error("Disputes GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch disputes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { providerId, escrowDealId, amount, reason, description, evidence } = body;

    if (!providerId || !amount || !reason) {
      return NextResponse.json({ error: "Provider, amount, and reason are required" }, { status: 400 });
    }

    const randomCase = Math.floor(1000 + Math.random() * 9000);
    const caseNumber = `DSP-${randomCase}`;

    const dispute = await prisma.dispute.create({
      data: {
        caseNumber,
        customerId: session.id,
        providerId,
        escrowDealId: escrowDealId || null,
        amount: parseFloat(amount),
        status: "UNDER_REVIEW",
        reason,
        description: description || reason,
        evidenceJson: JSON.stringify(evidence || []),
      },
    });

    // If linked to an escrow deal, set escrow deal status to DISPUTED
    if (escrowDealId) {
      await prisma.escrowDeal.update({
        where: { id: escrowDealId },
        data: { status: "DISPUTED" },
      }).catch(() => null);
    }

    // Log activity
    await prisma.userActivityLog.create({
      data: {
        userId: session.id,
        actionType: "OPENED_DISPUTE",
        description: `Filed dispute ${caseNumber} (${reason}) for GH₵ ${amount}`,
        entityId: dispute.id,
        entityType: "DISPUTE",
      },
    }).catch(() => null);

    return NextResponse.json({ success: true, dispute });
  } catch (error: any) {
    console.error("Dispute POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create dispute" }, { status: 500 });
  }
}
